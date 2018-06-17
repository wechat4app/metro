/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 * @format
 */

'use strict';let getRamBundleInfo = (() => {var _ref = _asyncToGenerator(

































  function* (
  entryPoint,
  pre,
  graph,
  options)
  {
    const modules = [].concat(_toConsumableArray(
    pre), _toConsumableArray(
    graph.dependencies.values()), _toConsumableArray(
    getAppendScripts(entryPoint, graph, options)));


    modules.forEach(function (module) {return options.createModuleId(module.path);});

    const ramModules = modules.filter(isJsModule).map(function (module) {return {
        id: options.createModuleId(module.path),
        code: wrapModule(module, options),
        map: fullSourceMapObject(
        [module],
        { dependencies: new Map(), entryPoints: [] },
        {
          excludeSource: options.excludeSource }),


        name: path.basename(module.path),
        sourcePath: module.path,
        source: module.getSource(),
        type: nullthrows(module.output.find(function (_ref2) {let type = _ref2.type;return type.startsWith('js');})).
        type };});var _ref3 =


    yield _getRamOptions(
    entryPoint,
    {
      dev: options.dev,
      platform: options.platform },

    function (filePath) {return getTransitiveDependencies(filePath, graph);},
    options.getTransformOptions);const preloadedModules = _ref3.preloadedModules,ramGroups = _ref3.ramGroups;


    const startupModules = [];
    const lazyModules = [];

    ramModules.forEach(function (module) {
      if (preloadedModules.hasOwnProperty(module.sourcePath)) {
        startupModules.push(module);
        return;
      }

      if (module.type.startsWith('js/script')) {
        startupModules.push(module);
        return;
      }

      if (module.type.startsWith('js/module')) {
        lazyModules.push(module);
      }
    });

    const groups = createRamBundleGroups(
    ramGroups,
    lazyModules,
    function (
    module,
    dependenciesByPath)
    {
      const deps = getTransitiveDependencies(module.sourcePath, graph);
      const output = new Set();

      for (const dependency of deps) {
        const module = dependenciesByPath.get(dependency);

        if (module) {
          output.add(module.id);
        }
      }

      return output;
    });


    return {
      getDependencies: function (filePath) {return (
          getTransitiveDependencies(filePath, graph));},
      groups,
      lazyModules,
      startupModules };

  });return function getRamBundleInfo(_x, _x2, _x3, _x4) {return _ref.apply(this, arguments);};})();

/**
                                                                                                                                                                                                           * Returns the options needed to create a RAM bundle.
                                                                                                                                                                                                           */let _getRamOptions = (() => {var _ref4 = _asyncToGenerator(
  function* (
  entryFile,
  options,
  getDependencies,
  getTransformOptions)



  {
    if (getTransformOptions == null) {
      return {
        preloadedModules: {},
        ramGroups: [] };

    }var _ref5 =

    yield getTransformOptions(
    [entryFile],
    { dev: options.dev, hot: true, platform: options.platform }, (() => {var _ref6 = _asyncToGenerator(
      function* (x) {return Array.from(getDependencies);});return function (_x9) {return _ref6.apply(this, arguments);};})());const preloadedModules = _ref5.preloadedModules,ramGroups = _ref5.ramGroups;


    return {
      preloadedModules: preloadedModules || {},
      ramGroups: ramGroups || [] };

  });return function _getRamOptions(_x5, _x6, _x7, _x8) {return _ref4.apply(this, arguments);};})();function _toConsumableArray(arr) {if (Array.isArray(arr)) {for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];return arr2;} else {return Array.from(arr);}}function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return Promise.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};}const fullSourceMapObject = require('./sourceMapObject');const getAppendScripts = require('../../lib/getAppendScripts');const getTransitiveDependencies = require('./helpers/getTransitiveDependencies');const nullthrows = require('fbjs/lib/nullthrows');const path = require('path');var _require = require('../../Bundler/util');const createRamBundleGroups = _require.createRamBundleGroups;var _require2 = require('./helpers/js');const isJsModule = _require2.isJsModule,wrapModule = _require2.wrapModule;

module.exports = getRamBundleInfo;