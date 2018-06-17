/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 * @format
 */

'use strict';function _toConsumableArray(arr) {if (Array.isArray(arr)) {for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];return arr2;} else {return Array.from(arr);}}

const getAppendScripts = require('../../lib/getAppendScripts');var _require =

require('./helpers/js');const isJsModule = _require.isJsModule,wrapModule = _require.wrapModule;












function plainJSBundle(
entryPoint,
pre,
graph,
options)
{
  for (const module of graph.dependencies.values()) {
    options.createModuleId(module.path);
  }

  return [].concat(_toConsumableArray(
  pre), _toConsumableArray(
  graph.dependencies.values()), _toConsumableArray(
  getAppendScripts(entryPoint, graph, options))).

  filter(isJsModule).
  map(module => wrapModule(module, options)).
  join('\n');
}

module.exports = plainJSBundle;