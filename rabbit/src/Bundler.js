/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 * @format
 */

'use strict';var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};function _objectWithoutProperties(obj, keys) {var target = {};for (var i in obj) {if (keys.indexOf(i) >= 0) continue;if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;target[i] = obj[i];}return target;}function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return Promise.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};}

const DependencyGraph = require('./node-haste/DependencyGraph');
const Transformer = require('./JSTransformer');

const assert = require('assert');
const defaults = require('./defaults');
const fs = require('fs');
const getTransformCacheKeyFn = require('./lib/getTransformCacheKeyFn');
const toLocalPath = require('./node-haste/lib/toLocalPath');var _require =

require('metro-cache');const Cache = _require.Cache,stableHash = _require.stableHash;const








































































hasOwnProperty = Object.prototype.hasOwnProperty;

class Bundler {








  constructor(opts) {
    opts.projectRoots.forEach(verifyRootExists);

    const getTransformCacheKey = getTransformCacheKeyFn({
      asyncRequireModulePath: opts.asyncRequireModulePath,
      cacheVersion: opts.cacheVersion,
      dynamicDepsInPackages: opts.dynamicDepsInPackages,
      projectRoots: opts.projectRoots,
      transformModulePath: opts.transformModulePath });


    this._opts = opts;
    this._cache = new Cache(opts.cacheStores);

    this._transformer = new Transformer({
      asyncRequireModulePath: opts.asyncRequireModulePath,
      maxWorkers: opts.maxWorkers,
      reporters: {
        stdoutChunk: chunk =>
        opts.reporter.update({ type: 'worker_stdout_chunk', chunk }),
        stderrChunk: chunk =>
        opts.reporter.update({ type: 'worker_stderr_chunk', chunk }) },

      transformModulePath: opts.transformModulePath,
      dynamicDepsInPackages: opts.dynamicDepsInPackages,
      workerPath: opts.workerPath || undefined });


    this._depGraphPromise = DependencyGraph.load({
      assetExts: opts.assetExts,
      blacklistRE: opts.blacklistRE,
      extraNodeModules: opts.extraNodeModules,
      hasteImplModulePath: opts.hasteImplModulePath,
      maxWorkers: opts.maxWorkers,
      platforms: new Set(opts.platforms),
      projectRoots: opts.projectRoots,
      providesModuleNodeModules:
      opts.providesModuleNodeModules || defaults.providesModuleNodeModules,
      reporter: opts.reporter,
      resolveRequest: opts.resolveRequest,
      sourceExts: opts.sourceExts,
      watch: opts.watch });


    this._baseHash = stableHash([
    opts.assetExts,
    opts.assetRegistryPath,
    getTransformCacheKey(),
    opts.minifierPath]).
    toString('binary');

    this._projectRoots = opts.projectRoots;
    this._getTransformOptions = opts.getTransformOptions;
  }

  getOptions() {
    return this._opts;
  }

  end() {var _this = this;return _asyncToGenerator(function* () {
      _this._transformer.kill();
      yield _this._depGraphPromise.then(function (dependencyGraph) {return (
          dependencyGraph.getWatcher().end());});})();

  }

  /**
       * Returns the transform options related to several entry files, by calling
       * the config parameter getTransformOptions().
       */
  getTransformOptionsForEntryFiles(
  entryFiles,
  options,
  getDependencies)
  {var _this2 = this;return _asyncToGenerator(function* () {
      if (!_this2._getTransformOptions) {
        return {
          inlineRequires: false };

      }var _ref =

      yield _this2._getTransformOptions(
      entryFiles,
      { dev: options.dev, hot: true, platform: options.platform },
      getDependencies);const transform = _ref.transform;


      return transform || { inlineRequires: false };})();
  }

  /*
       * Helper method to return the global transform options that are kept in the
       * Bundler.
       */
  getGlobalTransformOptions()


  {
    return {
      enableBabelRCLookup: this._opts.enableBabelRCLookup,
      projectRoot: this._projectRoots[0] };

  }

  getDependencyGraph() {
    return this._depGraphPromise;
  }

  transformFile(
  filePath,
  transformCodeOptions)
  {var _this3 = this;return _asyncToGenerator(function* () {
      const cache = _this3._cache;const


      assetDataPlugins =










      transformCodeOptions.assetDataPlugins,customTransformOptions = transformCodeOptions.customTransformOptions,enableBabelRCLookup = transformCodeOptions.enableBabelRCLookup,dev = transformCodeOptions.dev,hot = transformCodeOptions.hot,inlineRequires = transformCodeOptions.inlineRequires,isScript = transformCodeOptions.isScript,minify = transformCodeOptions.minify,platform = transformCodeOptions.platform,_projectRoot = transformCodeOptions.projectRoot,extra = _objectWithoutProperties(transformCodeOptions, ['assetDataPlugins', 'customTransformOptions', 'enableBabelRCLookup', 'dev', 'hot', 'inlineRequires', 'isScript', 'minify', 'platform', 'projectRoot']);

      for (const key in extra) {
        if (hasOwnProperty.call(extra, key)) {
          throw new Error(
          'Extra keys detected: ' + Object.keys(extra).join(', '));

        }
      }

      const localPath = toLocalPath(_this3._projectRoots, filePath);

      const partialKey = stableHash([
      // This is the hash related to the global Bundler config.
      _this3._baseHash,

      // Path.
      localPath,

      // We cannot include "transformCodeOptions" because of "projectRoot".
      assetDataPlugins,
      customTransformOptions,
      enableBabelRCLookup,
      dev,
      hot,
      inlineRequires,
      isScript,
      minify,
      platform]);


      const sha1 = (yield _this3.getDependencyGraph()).getSha1(filePath);
      let fullKey = Buffer.concat([partialKey, Buffer.from(sha1, 'hex')]);
      const result = yield cache.get(fullKey);

      // A valid result from the cache is used directly; otherwise we call into
      // the transformer to computed the corresponding result.
      const data = result ?
      { result, sha1 } :
      yield _this3._transformer.transform(
      filePath,
      localPath,
      transformCodeOptions,
      _this3._opts.assetExts,
      _this3._opts.assetRegistryPath,
      _this3._opts.minifierPath);


      // Only re-compute the full key if the SHA-1 changed. This is because
      // references are used by the cache implementation in a weak map to keep
      // track of the cache that returned the result.
      if (sha1 !== data.sha1) {
        fullKey = Buffer.concat([partialKey, Buffer.from(data.sha1, 'hex')]);
      }

      cache.set(fullKey, data.result);

      return _extends({},
      data.result, {
        getSource() {
          return fs.readFileSync(filePath, 'utf8');
        } });})();

  }}


function verifyRootExists(root) {
  // Verify that the root exists.
  assert(fs.statSync(root).isDirectory(), 'Root has to be a valid directory');
}

module.exports = Bundler;