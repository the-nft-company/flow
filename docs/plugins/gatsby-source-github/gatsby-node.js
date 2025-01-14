'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.sourceNodes = undefined;

var _extends =
  Object.assign ||
  function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };

let sourceNodes = (exports.sourceNodes = (() => {
  var _ref = _asyncToGenerator(function*({ actions }, pluginOptions) {
    const { createNode } = actions;

    const {
      headers,
      queries,
      url: apiUrl,
    } = yield _pluginOptions.schema.validate(pluginOptions);

    const client = new _graphqlRequest.GraphQLClient(apiUrl, {
      headers,
    });

    yield Promise.all(
      queries.map(function(query) {
        return client.request(...[].concat(query));
      })
    ).then(function(results) {
      results.forEach(function(content, index) {
        const edge = findEdge(content);
        const rootName = getRootEl(edge);
        const rootElement = edge[rootName];

        const { edges } = rootElement,
          rest = _objectWithoutProperties(rootElement, ['edges']);

        if (rootElement && Array.isArray(rootElement.edges)) {
          rootElement.edges.forEach(function(childNode, edgeIndex) {
            const node = childNode.node || childNode;
            createNode(
              _extends({}, rest, node, {
                id: node.id || `__github__${rootName}__${edgeIndex}__`,
                children: [],
                parent: '__SOURCE__',
                internal: {
                  type: `Github${upper(rootName)}`,
                  contentDigest: createContentDigest(node),
                  content: JSON.stringify(node),
                },
              })
            );
          });
        } else {
          createNode(
            _extends({}, rootElement, {
              id: rootElement.id || `__github__${rootName}__${index}`,
              children: [],
              parent: '__SOURCE__',
              internal: {
                type: `Github${upper(rootName)}`,
                contentDigest: createContentDigest(rootElement),
                content: JSON.stringify(rootElement),
              },
            })
          );
        }
      });
    });

    return;
  });

  return function sourceNodes(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})());

var _graphqlRequest = require('graphql-request');

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _lodash = require('lodash');

var _pluginOptions = require('./plugin-options');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _objectWithoutProperties(obj, keys) {
  var target = {};
  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }
  return target;
}

function _asyncToGenerator(fn) {
  return function() {
    var gen = fn.apply(this, arguments);
    return new Promise(function(resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }
        if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(
            function(value) {
              step('next', value);
            },
            function(err) {
              step('throw', err);
            }
          );
        }
      }
      return step('next');
    });
  };
}

const createContentDigest = obj =>
  _crypto2.default
    .createHash(`md5`)
    .update(JSON.stringify(obj))
    .digest(`hex`);

const getRootEl = obj => Object.keys(obj).shift();

const findEdge = obj => {
  let clone = Object.assign({}, obj);
  while (Object.keys(clone).length > 0) {
    const rootEl = getRootEl(clone);
    if (clone[rootEl] && Array.isArray(clone[rootEl].edges)) {
      return clone;
    }
    clone = clone[rootEl];

    if (typeof clone !== 'object') {
      break;
    }
  }

  return obj;
};

const upper = str => (0, _lodash.startCase)((0, _lodash.toLower)(str));
