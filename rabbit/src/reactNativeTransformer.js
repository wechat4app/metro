/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Note: This is a fork of the fb-specific transform.js
 *
 * 
 * @format
 */
'use strict';var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};

const crypto = require('crypto');
const externalHelpersPlugin = require('babel-plugin-external-helpers');
const fs = require('fs');
const inlineRequiresPlugin = require('babel-preset-fbjs/plugins/inline-requires');
const json5 = require('json5');
const makeHMRConfig = require('./hmrConfig');
const path = require('path');var _require =

require('@babel/core');const transformSync = _require.transformSync;






const cacheKeyParts = [
fs.readFileSync(__filename),
require('babel-plugin-external-helpers/package.json').version,
require('babel-preset-fbjs/package.json').version,
require('babel-preset-react-native/package.json').version];


/**
                                                                                                                         * Return a memoized function that checks for the existence of a
                                                                                                                         * project level .babelrc file, and if it doesn't exist, reads the
                                                                                                                         * default RN babelrc file and uses that.
                                                                                                                         */
const getBabelRC = function () {
  let babelRC = null;

  return function _getBabelRC(projectRoot) {
    if (babelRC != null) {
      return babelRC;
    }

    babelRC = { plugins: [] };

    // Let's look for the .babelrc in the project root.
    // In the future let's look into adding a command line option to specify
    // this location.
    let projectBabelRCPath;
    if (projectRoot) {
      projectBabelRCPath = path.resolve(projectRoot, '.babelrc');
    }

    // If a .babelrc file doesn't exist in the project,
    // use the Babel config provided with react-native.
    if (!projectBabelRCPath || !fs.existsSync(projectBabelRCPath)) {
      babelRC = json5.parse(
      fs.readFileSync(require.resolve('metro/rn-babelrc.json')));


      // Require the babel-preset's listed in the default babel config
      babelRC.presets = babelRC.presets.map(name => {
        if (!/^(?:@babel\/|babel-)preset-/.test(name)) {
          try {
            name = require.resolve(`babel-preset-${name}`);
          } catch (error) {
            if (error && error.conde === 'MODULE_NOT_FOUND') {
              name = require.resolve(`@babel/preset-${name}`);
            } else {
              throw new Error(error);
            }
          }
        }
        return require(name);
      });
      babelRC.plugins = babelRC.plugins.map(plugin => {
        // Manually resolve all default Babel plugins.
        // `babel.transform` will attempt to resolve all base plugins relative to
        // the file it's compiling. This makes sure that we're using the plugins
        // installed in the react-native package.

        // Normalise plugin to an array.
        plugin = Array.isArray(plugin) ? plugin : [plugin];
        // Only resolve the plugin if it's a string reference.
        if (typeof plugin[0] === 'string') {
          // $FlowFixMe TODO t26372934 plugin require
          const required = require('@babel/plugin-' +
          plugin[0]);
          // es6 import default?
          // $FlowFixMe should properly type this plugin structure
          plugin[0] = required.__esModule ? required.default : required;
        }
      });
    } else {
      // if we find a .babelrc file we tell babel to use it
      babelRC.extends = projectBabelRCPath;
    }

    return babelRC;
  };
}();

/**
           * Given a filename and options, build a Babel
           * config object with the appropriate plugins.
           */
function buildBabelConfig(filename, options) {let plugins = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  const babelRC = getBabelRC(options.projectRoot);

  const extraConfig = {
    babelrc:
    typeof options.enableBabelRCLookup === 'boolean' ?
    options.enableBabelRCLookup :
    true,
    code: false,
    filename,
    highlightCode: true };


  let config = Object.assign({}, babelRC, extraConfig);

  // Add extra plugins
  const extraPlugins = [externalHelpersPlugin];

  if (options.inlineRequires) {
    extraPlugins.push(inlineRequiresPlugin);
  }

  config.plugins = extraPlugins.concat(config.plugins, plugins);

  /* $FlowFixMe(>=0.68.0 site=react_native_fb) This comment suppresses an error
                                                                                                                                 * found when Flow v0.68 was deployed. To see the error delete this comment
                                                                                                                                 * and run Flow. */
  if (options.dev && options.hot) {
    const hmrConfig = makeHMRConfig(options, filename);
    config = Object.assign({}, config, hmrConfig);
  }

  return Object.assign({}, babelRC, config);
}








function transform(_ref) {let filename = _ref.filename,options = _ref.options,src = _ref.src,plugins = _ref.plugins;
  const OLD_BABEL_ENV = process.env.BABEL_ENV;
  /* $FlowFixMe(>=0.68.0 site=react_native_fb) This comment suppresses an error
                                                                                             * found when Flow v0.68 was deployed. To see the error delete this comment
                                                                                             * and run Flow. */
  process.env.BABEL_ENV = options.dev ? 'development' : 'production';

  try {
    const babelConfig = buildBabelConfig(filename, options, plugins);var _transformSync =
    transformSync(src, _extends({
      // ES modules require sourceType='module' but OSS may not always want that
      sourceType: 'unambiguous' },
    babelConfig, {
      ast: true }));const ast = _transformSync.ast;


    return { ast };
  } finally {
    process.env.BABEL_ENV = OLD_BABEL_ENV;
  }
}

function getCacheKey() {
  var key = crypto.createHash('md5');
  cacheKeyParts.forEach(part => key.update(part));
  return key.digest('hex');
}

module.exports = {
  transform,
  getCacheKey };