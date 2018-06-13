/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 * @format
 */

'use strict';let getAssets = (() => {var _ref = _asyncToGenerator(















  function* (
  graph,
  options)
  {
    const promises = [];

    for (const module of graph.dependencies.values()) {
      if (isJsModule(module) && getJsOutput(module).type === 'js/module/asset') {
        promises.push(
        getAssetData(
        module.path,
        toLocalPath(options.projectRoots, module.path),
        options.assetPlugins,
        options.platform));


      }
    }

    return yield Promise.all(promises);
  });return function getAssets(_x, _x2) {return _ref.apply(this, arguments);};})();function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return Promise.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};}const toLocalPath = require('../../node-haste/lib/toLocalPath');var _require = require('../../Assets');const getAssetData = _require.getAssetData;var _require2 = require('./helpers/js');const getJsOutput = _require2.getJsOutput,isJsModule = _require2.isJsModule;

module.exports = getAssets;