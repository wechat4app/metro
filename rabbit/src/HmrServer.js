/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * 
 */

'use strict';var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return Promise.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};}

const formatBundlingError = require('./lib/formatBundlingError');
const getAbsolutePath = require('./lib/getAbsolutePath');
const hmrJSBundle = require('./DeltaBundler/Serializers/hmrJSBundle');
const nullthrows = require('fbjs/lib/nullthrows');
const parseCustomTransformOptions = require('./lib/parseCustomTransformOptions');
const url = require('url');var _require =



require('metro-core'),_require$Logger = _require.Logger;const createActionStartEntry = _require$Logger.createActionStartEntry,createActionEndEntry = _require$Logger.createActionEndEntry,log = _require$Logger.log;









/**
                                                                                                                                                                                                                                                                                                                                                                                                                                           * The HmrServer (Hot Module Reloading) implements a lightweight interface
                                                                                                                                                                                                                                                                                                                                                                                                                                           * to communicate easily to the logic in the React Native repository (which
                                                                                                                                                                                                                                                                                                                                                                                                                                           * is the one that handles the Web Socket connections).
                                                                                                                                                                                                                                                                                                                                                                                                                                           *
                                                                                                                                                                                                                                                                                                                                                                                                                                           * This interface allows the HmrServer to hook its own logic to WS clients
                                                                                                                                                                                                                                                                                                                                                                                                                                           * getting connected, disconnected or having errors (through the
                                                                                                                                                                                                                                                                                                                                                                                                                                           * `onClientConnect`, `onClientDisconnect` and `onClientError` methods).
                                                                                                                                                                                                                                                                                                                                                                                                                                           */
class HmrServer {



  constructor(packagerServer) {
    this._packagerServer = packagerServer;
    this._reporter = packagerServer.getReporter();
  }

  onClientConnect(
  clientUrl,
  sendFn)
  {var _this = this;return _asyncToGenerator(function* () {
      const urlObj = nullthrows(url.parse(clientUrl, true));var _nullthrows =

      nullthrows(urlObj.query);const bundleEntry = _nullthrows.bundleEntry,platform = _nullthrows.platform;
      const customTransformOptions = parseCustomTransformOptions(urlObj);

      // Create a new graph for each client. Once the clients are
      // modified to support Delta Bundles, they'll be able to pass the
      // DeltaBundleId param through the WS connection and we'll be able to share
      // the same graph between the WS connection and the HTTP one.
      const graph = yield _this._packagerServer.buildGraph(
      [getAbsolutePath(bundleEntry, _this._packagerServer.getProjectRoots())],
      {
        assetPlugins: [],
        customTransformOptions,
        dev: true,
        hot: true,
        minify: false,
        onProgress: null,
        platform,
        type: 'module' });



      // Listen to file changes.
      const client = { sendFn, graph };

      _this._packagerServer.
      getDeltaBundler().
      listen(graph, _this._handleFileChange.bind(_this, client));

      return client;})();
  }

  onClientError(client, e) {
    this._reporter.update({
      type: 'hmr_client_error',
      error: e });

    this.onClientDisconnect(client);
  }

  onClientDisconnect(client) {
    // We can safely stop the delta transformer since the
    // transformer is not shared between clients.
    this._packagerServer.getDeltaBundler().endGraph(client.graph);
  }

  _handleFileChange(client) {var _this2 = this;return _asyncToGenerator(function* () {
      const processingHmrChange = log(
      createActionStartEntry({ action_name: 'Processing HMR change' }));


      client.sendFn(JSON.stringify({ type: 'update-start' }));
      const response = yield _this2._prepareResponse(client);

      client.sendFn(JSON.stringify(response));
      client.sendFn(JSON.stringify({ type: 'update-done' }));

      log(_extends({},
      createActionEndEntry(processingHmrChange), {
        outdated_modules: Array.isArray(response.body.modules) ?
        response.body.modules.length :
        null }));})();

  }

  _prepareResponse(
  client)
  {var _this3 = this;return _asyncToGenerator(function* () {
      const deltaBundler = _this3._packagerServer.getDeltaBundler();

      try {
        const delta = yield deltaBundler.getDelta(client.graph, { reset: false });

        return hmrJSBundle(delta, client.graph, {
          createModuleId: _this3._packagerServer._opts.createModuleId });

      } catch (error) {
        const formattedError = formatBundlingError(error);

        _this3._reporter.update({ type: 'bundling_error', error });

        return { type: 'error', body: formattedError };
      }})();
  }}


module.exports = HmrServer;