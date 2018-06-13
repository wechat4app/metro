/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 * @format
 */

'use strict';let getPrependedScripts = (() => {var _ref = _asyncToGenerator(






















  function* (
  options,
  bundleOptions,
  bundler,
  deltaBundler)
  {
    // Get all the polyfills from the relevant option params (the
    // `getPolyfills()` method and the `polyfillModuleNames` variable).
    const polyfillModuleNames = options.
    getPolyfills({
      platform: bundleOptions.platform }).

    concat(options.polyfillModuleNames);

    const buildOptions = {
      assetPlugins: [],
      customTransformOptions: bundleOptions.customTransformOptions,
      dev: bundleOptions.dev,
      hot: bundleOptions.hot,
      minify: bundleOptions.minify,
      onProgress: null,
      platform: bundleOptions.platform,
      type: 'script' };


    const graph = yield deltaBundler.buildGraph([
    defaults.moduleSystem].concat(_toConsumableArray(polyfillModuleNames)),
    {
      resolve: yield transformHelpers.getResolveDependencyFn(
      bundler,
      buildOptions.platform),

      transform: yield transformHelpers.getTransformFn([
      defaults.moduleSystem].concat(_toConsumableArray(polyfillModuleNames)),
      bundler,
      deltaBundler,
      buildOptions),

      onProgress: null });



    return [
    _getPrelude({ dev: bundleOptions.dev })].concat(_toConsumableArray(
    graph.dependencies.values()));

  });return function getPrependedScripts(_x, _x2, _x3, _x4) {return _ref.apply(this, arguments);};})();function _toConsumableArray(arr) {if (Array.isArray(arr)) {for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];return arr2;} else {return Array.from(arr);}}function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return Promise.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};}const defaults = require('../defaults');const getPreludeCode = require('./getPreludeCode');const transformHelpers = require('./transformHelpers');

function _getPrelude(_ref2) {let dev = _ref2.dev;
  const code = getPreludeCode({ isDev: dev });
  const name = '__prelude__';

  return {
    dependencies: new Map(),
    getSource: () => code,
    inverseDependencies: new Set(),
    path: name,
    output: [
    {
      type: 'js/script/virtual',
      data: {
        code,
        map: [] } }] };




}

module.exports = getPrependedScripts;