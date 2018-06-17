/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 * @format
 */

'use strict';var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};function _toConsumableArray(arr) {if (Array.isArray(arr)) {for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];return arr2;} else {return Array.from(arr);}}var _require =

require('./helpers/js');const isJsModule = _require.isJsModule,getJsOutput = _require.getJsOutput;var _require2 =
require('metro-source-map');const fromRawMappings = _require2.fromRawMappings;




function fullSourceMapObject(
pre,
graph,
options)
{
  const modules = [].concat(_toConsumableArray(pre), _toConsumableArray(graph.dependencies.values())).
  filter(isJsModule).
  map(module => {
    return _extends({},
    getJsOutput(module).data, {
      path: module.path,
      source: options.excludeSource ? '' : module.getSource() });

  });

  return fromRawMappings(modules).toMap(undefined, {
    excludeSource: options.excludeSource });

}

module.exports = fullSourceMapObject;