/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 * @format
 */

'use strict';let getAllFiles = (() => {var _ref = _asyncToGenerator(










  function* (
  pre,
  graph,
  options)
  {
    const modules = graph.dependencies;

    const promises = [];

    for (const module of pre) {
      promises.push([module.path]);
    }

    for (const module of modules.values()) {
      if (!isJsModule(module)) {
        continue;
      }

      if (getJsOutput(module).type === 'js/module/asset') {
        promises.push(getAssetFiles(module.path, options.platform));
      } else {
        promises.push([module.path]);
      }
    }

    const dependencies = yield Promise.all(promises);
    const output = [];

    for (const dependencyArray of dependencies) {
      output.push.apply(output, _toConsumableArray(dependencyArray));
    }

    return output;
  });return function getAllFiles(_x, _x2, _x3) {return _ref.apply(this, arguments);};})();function _toConsumableArray(arr) {if (Array.isArray(arr)) {for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];return arr2;} else {return Array.from(arr);}}function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return Promise.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};}var _require = require('../../Assets');const getAssetFiles = _require.getAssetFiles;var _require2 = require('./helpers/js');const getJsOutput = _require2.getJsOutput,isJsModule = _require2.isJsModule;

module.exports = getAllFiles;