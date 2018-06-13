/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 * @format
 */

'use strict';var _slicedToArray = function () {function sliceIterator(arr, i) {var _arr = [];var _n = true;var _d = false;var _e = undefined;try {for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"]) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}return function (arr, i) {if (Array.isArray(arr)) {return arr;} else if (Symbol.iterator in Object(arr)) {return sliceIterator(arr, i);} else {throw new TypeError("Invalid attempt to destructure non-iterable instance");}};}();var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return Promise.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};}function _objectWithoutProperties(obj, keys) {var target = {};for (var i in obj) {if (keys.indexOf(i) >= 0) continue;if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;target[i] = obj[i];}return target;}

const Bundler = require('./Bundler');
const DeltaBundler = require('./DeltaBundler');
const MultipartResponse = require('./Server/MultipartResponse');

const crypto = require('crypto');
const defaultCreateModuleIdFactory = require('./lib/createModuleIdFactory');
const deltaJSBundle = require('./DeltaBundler/Serializers/deltaJSBundle');
const getAllFiles = require('./DeltaBundler/Serializers/getAllFiles');
const getAssets = require('./DeltaBundler/Serializers/getAssets');
const getRamBundleInfo = require('./DeltaBundler/Serializers/getRamBundleInfo');
const plainJSBundle = require('./DeltaBundler/Serializers/plainJSBundle');
const sourceMapObject = require('./DeltaBundler/Serializers/sourceMapObject');
const sourceMapString = require('./DeltaBundler/Serializers/sourceMapString');
const debug = require('debug')('Metro:Server');
const defaults = require('./defaults');
const formatBundlingError = require('./lib/formatBundlingError');
const getAbsolutePath = require('./lib/getAbsolutePath');
const getMaxWorkers = require('./lib/getMaxWorkers');
const getPrependedScripts = require('./lib/getPrependedScripts');
const mime = require('mime-types');
const nullthrows = require('fbjs/lib/nullthrows');
const parseCustomTransformOptions = require('./lib/parseCustomTransformOptions');
const parsePlatformFilePath = require('./node-haste/lib/parsePlatformFilePath');
const path = require('path');
const symbolicate = require('./Server/symbolicate/symbolicate');
const transformHelpers = require('./lib/transformHelpers');
const url = require('url');var _require =

require('./Assets');const getAsset = _require.getAsset;
const resolveSync = require('resolve').sync;var _require2 =





















require('metro-core'),_require2$Logger = _require2.Logger;const createActionStartEntry = _require2$Logger.createActionStartEntry,createActionEndEntry = _require2$Logger.createActionEndEntry,log = _require2$Logger.log;



























function debounceAndBatch(fn, delay) {
  let timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(fn, delay);
  };
}

const DELTA_ID_HEADER = 'X-Metro-Delta-ID';
const FILES_CHANGED_COUNT_HEADER = 'X-Metro-Files-Changed-Count';

class Server {












































  constructor(options) {_initialiseProps.call(this);
    const reporter =
    options.reporter || require('./lib/reporting').nullReporter;
    const maxWorkers = getMaxWorkers(options.maxWorkers);
    const assetExts = options.assetExts || defaults.assetExts;
    const sourceExts = options.sourceExts || defaults.sourceExts;

    const _createModuleId =
    /* $FlowFixMe(>=0.68.0 site=react_native_fb) This comment suppresses an
                                                     * error found when Flow v0.68 was deployed. To see the error delete this
                                                     * comment and run Flow. */
    options.createModuleId || defaultCreateModuleIdFactory();

    this._opts = {
      assetExts: options.assetTransforms ? [] : assetExts,
      assetRegistryPath: options.assetRegistryPath,
      blacklistRE: options.blacklistRE,
      cacheStores: options.cacheStores,
      cacheVersion: options.cacheVersion,
      dynamicDepsInPackages: options.dynamicDepsInPackages || 'throwAtRuntime',
      createModuleId: _createModuleId,
      enableBabelRCLookup:
      options.enableBabelRCLookup != null ?
      options.enableBabelRCLookup :
      true,
      extraNodeModules: options.extraNodeModules || {},
      getModulesRunBeforeMainModule: options.getModulesRunBeforeMainModule,
      getPolyfills: options.getPolyfills,
      getRunModuleStatement: options.getRunModuleStatement,
      getTransformOptions: options.getTransformOptions,
      hasteImplModulePath: options.hasteImplModulePath,
      maxWorkers,
      minifierPath:
      options.minifierPath == null ?
      defaults.DEFAULT_METRO_MINIFIER_PATH :
      resolveSync(options.minifierPath, { basedir: process.cwd() }),
      platforms: options.platforms || defaults.platforms,
      polyfillModuleNames: options.polyfillModuleNames || [],
      postMinifyProcess: options.postMinifyProcess,
      postProcessBundleSourcemap: options.postProcessBundleSourcemap,
      projectRoots: options.projectRoots,
      providesModuleNodeModules: options.providesModuleNodeModules,
      reporter,
      resolveRequest: options.resolveRequest,
      silent: options.silent || false,
      sourceExts: options.assetTransforms ?
      sourceExts.concat(assetExts) :
      sourceExts,
      transformModulePath:
      options.transformModulePath || defaults.transformModulePath,
      watch: options.watch || false,
      workerPath: options.workerPath };


    if (options.resetCache) {
      options.cacheStores.forEach(store => store.clear());
      reporter.update({ type: 'transform_cache_reset' });
    }

    const processFileChange = _ref => {let type = _ref.type,filePath = _ref.filePath;return (
        this.onFileChange(type, filePath));};

    this._reporter = reporter;
    this._changeWatchers = [];
    this._platforms = new Set(this._opts.platforms);

    // This slices out options that are not part of the strict BundlerOptions
    /* eslint-disable no-unused-vars */var _opts =






    this._opts;const createModuleId = _opts.createModuleId,getModulesRunBeforeMainModule = _opts.getModulesRunBeforeMainModule,getRunModuleStatement = _opts.getRunModuleStatement,silent = _opts.silent,bundlerOptionsFromServerOptions = _objectWithoutProperties(_opts, ['createModuleId', 'getModulesRunBeforeMainModule', 'getRunModuleStatement', 'silent']);
    /* eslint-enable no-unused-vars */

    this._bundler = new Bundler(_extends({},
    bundlerOptionsFromServerOptions, {
      asyncRequireModulePath:
      options.asyncRequireModulePath ||
      'metro/src/lib/bundle-modules/asyncRequire' }));


    // changes to the haste map can affect resolution of files in the bundle
    this._bundler.getDependencyGraph().then(dependencyGraph => {
      dependencyGraph.
      getWatcher().
      on('change', _ref2 => {let eventsQueue = _ref2.eventsQueue;return (
          eventsQueue.forEach(processFileChange));});

    });

    this._debouncedFileChangeHandler = debounceAndBatch(
    () => this._informChangeWatchers(),
    50);


    this._symbolicateInWorker = symbolicate.createWorker();
    this._nextBundleBuildID = 1;

    this._deltaBundler = new DeltaBundler(this._bundler);
  }

  end() {
    this._deltaBundler.end();
    this._bundler.end();
  }

  getDeltaBundler() {
    return this._deltaBundler;
  }

  build(options) {var _this = this;return _asyncToGenerator(function* () {
      const graphInfo = yield _this._buildGraph(options);

      const entryPoint = getAbsolutePath(
      options.entryFile,
      _this._opts.projectRoots);


      return {
        code: plainJSBundle(entryPoint, graphInfo.prepend, graphInfo.graph, {
          createModuleId: _this._opts.createModuleId,
          getRunModuleStatement: _this._opts.getRunModuleStatement,
          dev: options.dev,
          runBeforeMainModule: options.runBeforeMainModule,
          runModule: options.runModule,
          sourceMapUrl: options.sourceMapUrl }),

        map: sourceMapString(graphInfo.prepend, graphInfo.graph, {
          excludeSource: options.excludeSource }) };})();


  }

  buildGraph(
  entryFiles,
  options)
  {var _this2 = this;return _asyncToGenerator(function* () {
      entryFiles = entryFiles.map(function (entryFile) {return (
          getAbsolutePath(entryFile, _this2._opts.projectRoots));});


      return yield _this2._deltaBundler.buildGraph(entryFiles, {
        resolve: yield transformHelpers.getResolveDependencyFn(
        _this2._bundler,
        options.platform),

        transform: yield transformHelpers.getTransformFn(
        entryFiles,
        _this2._bundler,
        _this2._deltaBundler,
        options),

        onProgress: options.onProgress });})();

  }

  getRamBundleInfo(options) {var _this3 = this;return _asyncToGenerator(function* () {
      const graphInfo = yield _this3._buildGraph(options);

      const entryPoint = getAbsolutePath(
      options.entryFile,
      _this3._opts.projectRoots);


      return yield getRamBundleInfo(
      entryPoint,
      graphInfo.prepend,
      graphInfo.graph,
      {
        createModuleId: _this3._opts.createModuleId,
        dev: options.dev,
        excludeSource: options.excludeSource,
        getRunModuleStatement: _this3._opts.getRunModuleStatement,
        getTransformOptions: _this3._opts.getTransformOptions,
        platform: options.platform,
        runBeforeMainModule: options.runBeforeMainModule,
        runModule: options.runModule,
        sourceMapUrl: options.sourceMapUrl });})();


  }

  getAssets(options) {var _this4 = this;return _asyncToGenerator(function* () {var _ref3 =
      yield _this4._buildGraph(options);const graph = _ref3.graph;

      return yield getAssets(graph, {
        assetPlugins: options.assetPlugins,
        platform: options.platform,
        projectRoots: _this4._opts.projectRoots });})();

  }

  getOrderedDependencyPaths(options)




  {var _this5 = this;return _asyncToGenerator(function* () {
      options = _extends({},
      Server.DEFAULT_BUNDLE_OPTIONS,
      options, {
        bundleType: 'bundle' });var _ref4 =


      yield _this5._buildGraph(options);const prepend = _ref4.prepend,graph = _ref4.graph;

      const platform =
      options.platform ||
      parsePlatformFilePath(options.entryFile, _this5._platforms).platform;

      return yield getAllFiles(prepend, graph, { platform });})();
  }

  _buildGraph(options) {var _this6 = this;return _asyncToGenerator(function* () {
      const entryPoint = getAbsolutePath(
      options.entryFile,
      _this6._opts.projectRoots);


      const crawlingOptions = {
        assetPlugins: options.assetPlugins,
        customTransformOptions: options.customTransformOptions,
        dev: options.dev,
        hot: options.hot,
        minify: options.minify,
        onProgress: options.onProgress,
        platform: options.platform,
        type: 'module' };


      const graph = yield _this6._deltaBundler.buildGraph([entryPoint], {
        resolve: yield transformHelpers.getResolveDependencyFn(
        _this6._bundler,
        options.platform),

        transform: yield transformHelpers.getTransformFn(
        [entryPoint],
        _this6._bundler,
        _this6._deltaBundler,
        crawlingOptions),

        onProgress: options.onProgress });


      const prepend = yield getPrependedScripts(
      _this6._opts,
      crawlingOptions,
      _this6._bundler,
      _this6._deltaBundler);


      return {
        prepend,
        graph,
        lastModified: new Date(),
        sequenceId: crypto.randomBytes(8).toString('hex') };})();

  }

  _getGraphInfo(
  options, _ref5)

  {var _this7 = this;let rebuild = _ref5.rebuild;return _asyncToGenerator(function* () {
      const id = _this7._optionsHash(options);
      let graphPromise = _this7._graphs.get(id);
      let graphInfo;
      let numModifiedFiles = 0;

      if (!graphPromise) {
        graphPromise = _this7._buildGraph(options);
        _this7._graphs.set(id, graphPromise);

        graphInfo = yield graphPromise;
        numModifiedFiles =
        graphInfo.prepend.length + graphInfo.graph.dependencies.size;
      } else {
        graphInfo = yield graphPromise;

        if (rebuild) {
          const delta = yield _this7._deltaBundler.getDelta(graphInfo.graph, {
            reset: false });

          numModifiedFiles = delta.modified.size;
        }

        if (numModifiedFiles > 0) {
          graphInfo.lastModified = new Date();
        }
      }

      return _extends({}, graphInfo, { numModifiedFiles });})();
  }

  _getDeltaInfo(
  options)
  {var _this8 = this;return _asyncToGenerator(function* () {
      const id = _this8._optionsHash(options);
      let graphPromise = _this8._deltaGraphs.get(id);
      let graphInfo;

      let delta;

      if (!graphPromise) {
        graphPromise = _this8._buildGraph(options);
        _this8._deltaGraphs.set(id, graphPromise);
        graphInfo = yield graphPromise;

        delta = {
          modified: graphInfo.graph.dependencies,
          deleted: new Set(),
          reset: true };

      } else {
        graphInfo = yield graphPromise;

        delta = yield _this8._deltaBundler.getDelta(graphInfo.graph, {
          reset: graphInfo.sequenceId !== options.deltaBundleId });


        // Generate a new sequenceId, to be used to verify the next delta request.
        // $FlowIssue #16581373 spread of an exact object should be exact
        graphInfo = _extends({},
        graphInfo, {
          sequenceId: crypto.randomBytes(8).toString('hex') });


        _this8._deltaGraphs.set(id, graphInfo);
      }

      return _extends({},
      graphInfo, {
        delta });})();

  }

  onFileChange(type, filePath) {
    // Make sure the file watcher event runs through the system before
    // we rebuild the bundles.
    this._debouncedFileChangeHandler(filePath);
  }

  _informChangeWatchers() {
    const watchers = this._changeWatchers;
    const headers = {
      'Content-Type': 'application/json; charset=UTF-8' };


    watchers.forEach(function (w) {
      w.res.writeHead(205, headers);
      w.res.end(JSON.stringify({ changed: true }));
    });

    this._changeWatchers = [];
  }

  _processOnChangeRequest(req, res) {
    const watchers = this._changeWatchers;

    watchers.push({
      req,
      res });


    req.on('close', () => {
      for (let i = 0; i < watchers.length; i++) {
        if (watchers[i] && watchers[i].req === req) {
          watchers.splice(i, 1);
          break;
        }
      }
    });
  }

  _rangeRequestMiddleware(
  req,
  res,
  data,
  assetPath)
  {
    if (req.headers && req.headers.range) {var _req$headers$range$re =
      req.headers.range.
      replace(/bytes=/, '').
      split('-'),_req$headers$range$re2 = _slicedToArray(_req$headers$range$re, 2);const rangeStart = _req$headers$range$re2[0],rangeEnd = _req$headers$range$re2[1];
      const dataStart = parseInt(rangeStart, 10);
      const dataEnd = rangeEnd ? parseInt(rangeEnd, 10) : data.length - 1;
      const chunksize = dataEnd - dataStart + 1;

      res.writeHead(206, {
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize.toString(),
        'Content-Range': `bytes ${dataStart}-${dataEnd}/${data.length}`,
        'Content-Type': mime.lookup(path.basename(assetPath[1])) });


      return data.slice(dataStart, dataEnd + 1);
    }

    return data;
  }

  _processSingleAssetRequest(req, res) {var _this9 = this;return _asyncToGenerator(function* () {
      const urlObj = url.parse(decodeURI(req.url), true);
      /* $FlowFixMe: could be empty if the url is invalid */
      const assetPath = urlObj.pathname.match(/^\/assets\/(.+)$/);

      const processingAssetRequestLogEntry = log(
      createActionStartEntry({
        action_name: 'Processing asset request',
        asset: assetPath[1] }));



      try {
        const data = yield getAsset(
        assetPath[1],
        _this9._opts.projectRoots,
        /* $FlowFixMe: query may be empty for invalid URLs */
        urlObj.query.platform);

        // Tell clients to cache this for 1 year.
        // This is safe as the asset url contains a hash of the asset.
        if (process.env.REACT_NATIVE_ENABLE_ASSET_CACHING === true) {
          res.setHeader('Cache-Control', 'max-age=31536000');
        }
        res.end(_this9._rangeRequestMiddleware(req, res, data, assetPath));
        process.nextTick(function () {
          log(createActionEndEntry(processingAssetRequestLogEntry));
        });
      } catch (error) {
        console.error(error.stack);
        res.writeHead(404);
        res.end('Asset not found');
      }})();
  }

  _optionsHash(options) {
    // List of option parameters that won't affect the build result, so they
    // can be ignored to calculate the options hash.
    const ignoredParams = {
      bundleType: null,
      onProgress: null,
      deltaBundleId: null,
      excludeSource: null,
      sourceMapUrl: null };


    return JSON.stringify(Object.assign({}, options, ignoredParams));
  }


































  _prepareDeltaBundler(
  req,
  mres)
  {
    const options = this._getOptionsFromUrl(
    url.format(_extends({},
    url.parse(req.url), {
      protocol: 'http',
      host: req.headers.host })));



    const buildID = this.getNewBuildID();

    if (!this._opts.silent) {
      options.onProgress = (transformedFileCount, totalFileCount) => {
        mres.writeChunk(
        { 'Content-Type': 'application/json' },
        JSON.stringify({ done: transformedFileCount, total: totalFileCount }));


        this._reporter.update({
          buildID,
          type: 'bundle_transform_progressed',
          transformedFileCount,
          totalFileCount });

      };
    }

    /* $FlowFixMe(>=0.63.0 site=react_native_fb) This comment suppresses an
         * error found when Flow v0.63 was deployed. To see the error delete this
         * comment and run Flow. */
    this._reporter.update({
      buildID,
      bundleDetails: {
        entryFile: options.entryFile,
        platform: options.platform,
        dev: options.dev,
        minify: options.minify,
        bundleType: options.bundleType },

      type: 'bundle_build_started' });


    return { options, buildID };
  }

  _processDeltaRequest(req, res) {var _this10 = this;return _asyncToGenerator(function* () {
      const mres = MultipartResponse.wrap(req, res);var _prepareDeltaBundler =
      _this10._prepareDeltaBundler(req, mres);const options = _prepareDeltaBundler.options,buildID = _prepareDeltaBundler.buildID;

      // Make sure that the bundleType is 'delta' (on the first delta request,
      // since the request does not have a bundleID param it gets detected as
      // a 'bundle' type).
      // TODO (T23416372): Improve the parsing of URL params.
      options.bundleType = 'delta';

      const requestingBundleLogEntry = log(
      createActionStartEntry({
        action_name: 'Requesting delta',
        bundle_url: req.url,
        entry_point: options.entryFile }));



      let output, sequenceId;

      try {
        let delta, graph, prepend;var _ref6 =
        yield _this10._getDeltaInfo(options);delta = _ref6.delta;graph = _ref6.graph;prepend = _ref6.prepend;sequenceId = _ref6.sequenceId;

        output = {
          bundle: deltaJSBundle(
          options.entryFile,
          prepend,
          delta,
          sequenceId,
          graph,
          {
            createModuleId: _this10._opts.createModuleId,
            dev: options.dev,
            getRunModuleStatement: _this10._opts.getRunModuleStatement,
            runBeforeMainModule: options.runBeforeMainModule,
            runModule: options.runModule,
            sourceMapUrl: options.sourceMapUrl }),


          numModifiedFiles: delta.modified.size + delta.deleted.size };

      } catch (error) {
        _this10._handleError(mres, _this10._optionsHash(options), error);

        _this10._reporter.update({
          buildID,
          type: 'bundle_build_failed' });


        return;
      }

      mres.setHeader(FILES_CHANGED_COUNT_HEADER, String(output.numModifiedFiles));
      mres.setHeader(DELTA_ID_HEADER, String(sequenceId));
      mres.setHeader('Content-Type', 'application/json');
      mres.setHeader('Content-Length', String(Buffer.byteLength(output.bundle)));
      mres.end(output.bundle);

      _this10._reporter.update({
        buildID,
        type: 'bundle_build_done' });


      debug('Finished response');
      log(_extends({},
      createActionEndEntry(requestingBundleLogEntry), {
        outdated_modules: output.numModifiedFiles }));})();

  }

  _processBundleRequest(req, res) {var _this11 = this;return _asyncToGenerator(function* () {
      const mres = MultipartResponse.wrap(req, res);var _prepareDeltaBundler2 =
      _this11._prepareDeltaBundler(req, mres);const options = _prepareDeltaBundler2.options,buildID = _prepareDeltaBundler2.buildID;

      const requestingBundleLogEntry = log(
      createActionStartEntry({
        action_name: 'Requesting bundle',
        bundle_url: req.url,
        entry_point: options.entryFile,
        bundler: 'delta' }));



      let result;

      try {var _ref7 =





        yield _this11._getGraphInfo(options, { rebuild: true });const graph = _ref7.graph,prepend = _ref7.prepend,lastModified = _ref7.lastModified,numModifiedFiles = _ref7.numModifiedFiles;

        result = {
          bundle: plainJSBundle(options.entryFile, prepend, graph, {
            createModuleId: _this11._opts.createModuleId,
            getRunModuleStatement: _this11._opts.getRunModuleStatement,
            dev: options.dev,
            runBeforeMainModule: options.runBeforeMainModule,
            runModule: options.runModule,
            sourceMapUrl: options.sourceMapUrl }),

          numModifiedFiles,
          lastModified };

      } catch (error) {
        _this11._handleError(mres, _this11._optionsHash(options), error);

        _this11._reporter.update({
          buildID,
          type: 'bundle_build_failed' });


        return;
      }

      if (
      // We avoid parsing the dates since the client should never send a more
      // recent date than the one returned by the Delta Bundler (if that's the
      // case it's fine to return the whole bundle).
      req.headers['if-modified-since'] === result.lastModified.toUTCString())
      {
        debug('Responding with 304');
        mres.writeHead(304);
        mres.end();
      } else {
        mres.setHeader(
        FILES_CHANGED_COUNT_HEADER,
        String(result.numModifiedFiles));

        mres.setHeader('Content-Type', 'application/javascript');
        mres.setHeader('Last-Modified', result.lastModified.toUTCString());
        mres.setHeader(
        'Content-Length',
        String(Buffer.byteLength(result.bundle)));

        mres.end(result.bundle);
      }

      _this11._reporter.update({
        buildID,
        type: 'bundle_build_done' });


      debug('Finished response');
      log(_extends({},
      createActionEndEntry(requestingBundleLogEntry), {
        outdated_modules: result.numModifiedFiles,
        bundler: 'delta' }));})();

  }

  _processSourceMapRequest(req, res) {var _this12 = this;return _asyncToGenerator(function* () {
      const mres = MultipartResponse.wrap(req, res);var _prepareDeltaBundler3 =
      _this12._prepareDeltaBundler(req, mres);const options = _prepareDeltaBundler3.options,buildID = _prepareDeltaBundler3.buildID;

      const requestingBundleLogEntry = log(
      createActionStartEntry({
        action_name: 'Requesting sourcemap',
        bundle_url: req.url,
        entry_point: options.entryFile,
        bundler: 'delta' }));



      let sourceMap;

      try {var _ref8 =
        yield _this12._getGraphInfo(options, {
          rebuild: false });const graph = _ref8.graph,prepend = _ref8.prepend;


        sourceMap = sourceMapString(prepend, graph, {
          excludeSource: options.excludeSource });

      } catch (error) {
        _this12._handleError(mres, _this12._optionsHash(options), error);

        _this12._reporter.update({
          buildID,
          type: 'bundle_build_failed' });


        return;
      }

      mres.setHeader('Content-Type', 'application/json');
      mres.end(sourceMap.toString());

      _this12._reporter.update({
        buildID,
        type: 'bundle_build_done' });


      log(
      createActionEndEntry(_extends({},
      requestingBundleLogEntry, {
        bundler: 'delta' })));})();


  }

  _processAssetsRequest(req, res) {var _this13 = this;return _asyncToGenerator(function* () {
      const mres = MultipartResponse.wrap(req, res);var _prepareDeltaBundler4 =
      _this13._prepareDeltaBundler(req, mres);const options = _prepareDeltaBundler4.options,buildID = _prepareDeltaBundler4.buildID;

      const requestingAssetsLogEntry = log(
      createActionStartEntry({
        action_name: 'Requesting assets',
        bundle_url: req.url,
        entry_point: options.entryFile,
        bundler: 'delta' }));



      let assets;

      try {
        assets = yield _this13.getAssets(options);
      } catch (error) {
        _this13._handleError(mres, _this13._optionsHash(options), error);

        _this13._reporter.update({
          buildID,
          type: 'bundle_build_failed' });


        return;
      }

      mres.setHeader('Content-Type', 'application/json');
      mres.end(JSON.stringify(assets));

      _this13._reporter.update({
        buildID,
        type: 'bundle_build_done' });


      log(
      createActionEndEntry(_extends({},
      requestingAssetsLogEntry, {
        bundler: 'delta' })));})();


  }

  _symbolicate(req, res) {
    const symbolicatingLogEntry = log(createActionStartEntry('Symbolicating'));

    debug('Start symbolication');

    /* $FlowFixMe: where is `rowBody` defined? Is it added by
                                                                 * the `connect` framework? */
    Promise.resolve(req.rawBody).
    then(body => {
      const stack = JSON.parse(body).stack;

      // In case of multiple bundles / HMR, some stack frames can have
      // different URLs from others
      const urls = new Set();
      stack.forEach(frame => {
        const sourceUrl = frame.file;
        // Skip `/debuggerWorker.js` which drives remote debugging because it
        // does not need to symbolication.
        // Skip anything except http(s), because there is no support for that yet
        if (
        sourceUrl != null &&
        !urls.has(sourceUrl) &&
        !sourceUrl.endsWith('/debuggerWorker.js') &&
        sourceUrl.startsWith('http'))
        {
          urls.add(sourceUrl);
        }
      });

      const mapPromises = Array.from(urls.values()).map(
      this._sourceMapForURL,
      this);


      debug('Getting source maps for symbolication');
      return Promise.all(mapPromises).then(maps => {
        debug('Sending stacks and maps to symbolication worker');
        const urlsToMaps = zip(urls.values(), maps);
        return this._symbolicateInWorker(stack, urlsToMaps);
      });
    }).
    then(
    stack => {
      debug('Symbolication done');
      res.end(JSON.stringify({ stack }));
      process.nextTick(() => {
        log(createActionEndEntry(symbolicatingLogEntry));
      });
    },
    error => {
      console.error(error.stack || error);
      res.statusCode = 500;
      res.end(JSON.stringify({ error: error.message }));
    });

  }

  _sourceMapForURL(reqUrl) {var _this14 = this;return _asyncToGenerator(function* () {
      const options = _this14._getOptionsFromUrl(reqUrl);var _ref9 =

      yield _this14._getGraphInfo(options, {
        rebuild: false });const graph = _ref9.graph,prepend = _ref9.prepend;


      return sourceMapObject(prepend, graph, {
        excludeSource: options.excludeSource });})();

  }

  _handleError(res, bundleID, error) {
    const formattedError = formatBundlingError(error);

    res.writeHead(error.status || 500, {
      'Content-Type': 'application/json; charset=UTF-8' });

    res.end(JSON.stringify(formattedError));
    this._reporter.update({ error, type: 'bundling_error' });

    log({
      action_name: 'bundling_error',
      error_type: formattedError.type,
      log_entry_label: 'bundling_error',
      stack: formattedError.message });

  }

  _getOptionsFromUrl(reqUrl) {
    // `true` to parse the query param as an object.
    const urlObj = nullthrows(url.parse(reqUrl, true));
    const urlQuery = nullthrows(urlObj.query);

    const pathname = urlObj.pathname ? decodeURIComponent(urlObj.pathname) : '';

    let isMap = false;

    // Backwards compatibility. Options used to be as added as '.' to the
    // entry module name. We can safely remove these options.
    const entryFile =
    pathname.
    replace(/^\//, '').
    split('.').
    filter(part => {
      if (part === 'map') {
        isMap = true;
        return false;
      }
      if (
      part === 'includeRequire' ||
      part === 'runModule' ||
      part === 'bundle' ||
      part === 'delta' ||
      part === 'assets')
      {
        return false;
      }
      return true;
    }).
    join('.') + '.js';

    const absoluteEntryFile = getAbsolutePath(
    entryFile,
    this._opts.projectRoots);


    // try to get the platform from the url
    const platform =
    urlQuery.platform ||
    parsePlatformFilePath(pathname, this._platforms).platform;

    const deltaBundleId = urlQuery.deltaBundleId;

    const assetPlugin = urlQuery.assetPlugin;
    const assetPlugins = Array.isArray(assetPlugin) ?
    assetPlugin :
    typeof assetPlugin === 'string' ?
    [assetPlugin] :
    [];

    const dev = this._getBoolOptionFromQuery(urlQuery, 'dev', true);
    const minify = this._getBoolOptionFromQuery(urlQuery, 'minify', false);
    const excludeSource = this._getBoolOptionFromQuery(
    urlQuery,
    'excludeSource',
    false);

    const includeSource = this._getBoolOptionFromQuery(
    urlQuery,
    'inlineSourceMap',
    false);


    const customTransformOptions = parseCustomTransformOptions(urlObj);

    return {
      sourceMapUrl: url.format(_extends({},
      urlObj, {
        pathname: pathname.replace(/\.(bundle|delta)$/, '.map') })),

      bundleType: isMap ? 'map' : deltaBundleId ? 'delta' : 'bundle',
      customTransformOptions,
      entryFile: absoluteEntryFile,
      deltaBundleId,
      dev,
      minify,
      excludeSource,
      hot: true,
      runBeforeMainModule: this._opts.getModulesRunBeforeMainModule(entryFile),
      runModule: this._getBoolOptionFromQuery(urlObj.query, 'runModule', true),
      inlineSourceMap: includeSource,
      platform,
      entryModuleOnly: this._getBoolOptionFromQuery(
      urlObj.query,
      'entryModuleOnly',
      false),

      assetPlugins,
      onProgress: null };

  }

  _getBoolOptionFromQuery(
  query,
  opt,
  defaultVal)
  {
    /* $FlowFixMe: `query` could be empty when it comes from an invalid URL */
    if (query[opt] == null) {
      return defaultVal;
    }

    return query[opt] === 'true' || query[opt] === '1';
  }

  getNewBuildID() {
    return (this._nextBundleBuildID++).toString(36);
  }

  getReporter() {
    return this._reporter;
  }

  getProjectRoots() {
    return this._opts.projectRoots;
  }}Server.

DEFAULT_GRAPH_OPTIONS = {
  assetPlugins: [],
  customTransformOptions: Object.create(null),
  dev: true,
  hot: false,
  minify: false,
  onProgress: null,
  type: 'module' };Server.


DEFAULT_BUNDLE_OPTIONS = _extends({},
Server.DEFAULT_GRAPH_OPTIONS, {
  entryModuleOnly: false,
  excludeSource: false,
  inlineSourceMap: false,
  runBeforeMainModule: [],
  runModule: true,
  sourceMapUrl: null });var _initialiseProps = function () {var _this15 = this;this._graphs = new Map();this._deltaGraphs = new Map();this.processRequest = (() => {var _ref10 = _asyncToGenerator(function* (req, res, next) {const urlObj = url.parse(req.url, true);const host = req.headers.host;debug(`Handling request: ${host ? 'http://' + host : ''}${req.url}`); /* $FlowFixMe: Could be empty if the URL is invalid. */const pathname = urlObj.pathname;if (pathname.match(/\.bundle$/)) {yield _this15._processBundleRequest(req, res);} else if (pathname.match(/\.map$/)) {yield _this15._processSourceMapRequest(req, res);} else if (pathname.match(/\.assets$/)) {yield _this15._processAssetsRequest(req, res);} else if (pathname.match(/\.delta$/)) {yield _this15._processDeltaRequest(req, res);} else if (pathname.match(/^\/onchange\/?$/)) {_this15._processOnChangeRequest(req, res);} else if (pathname.match(/^\/assets\//)) {yield _this15._processSingleAssetRequest(req, res);} else if (pathname === '/symbolicate') {_this15._symbolicate(req, res);} else if (next) {next();} else {res.writeHead(404);res.end();}});return function (_x, _x2, _x3) {return _ref10.apply(this, arguments);};})();};



function* zip(xs, ys) {
  //$FlowIssue #9324959
  const ysIter = ys[Symbol.iterator]();
  for (const x of xs) {
    const y = ysIter.next();
    if (y.done) {
      return;
    }
    yield [x, y.value];
  }
}

module.exports = Server;