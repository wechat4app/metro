/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 * @format
 */

'use strict';var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};let saveBundleAndMap = (() => {var _ref = _asyncToGenerator(





























  function* (
  bundle,
  options,
  log)
  {const

    bundleOutput =



    options.bundleOutput,encoding = options.bundleEncoding,sourcemapOutput = options.sourcemapOutput,sourcemapSourcesRoot = options.sourcemapSourcesRoot;

    const writeFns = [];

    writeFns.push(_asyncToGenerator(function* () {
      log('Writing bundle output to:', bundleOutput);
      yield writeFile(bundleOutput, bundle.code, encoding);
      log('Done writing bundle output');
    }));

    if (sourcemapOutput) {let
      map = bundle.map;
      if (sourcemapSourcesRoot !== undefined) {
        log('start relativating source map');
        map = relativateSerializedMap(map, sourcemapSourcesRoot);
        log('finished relativating');
      }

      writeFns.push(_asyncToGenerator(function* () {
        log('Writing sourcemap output to:', sourcemapOutput);
        yield writeFile(sourcemapOutput, map, null);
        log('Done writing sourcemap output');
      }));
    }

    // Wait until everything is written to disk.
    yield Promise.all(writeFns.map(function (cb) {return cb();}));
  });return function saveBundleAndMap(_x, _x2, _x3) {return _ref.apply(this, arguments);};})();function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return Promise.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};}const Server = require('../../Server');const relativizeSourceMapInline = require('../../lib/relativizeSourceMap');const writeFile = require('./writeFile');function buildBundle(packagerClient, requestOptions) {return packagerClient.build(_extends({}, Server.DEFAULT_BUNDLE_OPTIONS, requestOptions, { bundleType: 'bundle' }));}function relativateSerializedMap(map, sourceMapSourcesRoot) {const sourceMap = JSON.parse(map);relativizeSourceMapInline(sourceMap, sourceMapSourcesRoot);return JSON.stringify(sourceMap);}

exports.build = buildBundle;
exports.save = saveBundleAndMap;
exports.formatName = 'bundle';