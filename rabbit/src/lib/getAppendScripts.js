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











function getAppendScripts(
entryPoint,
graph,
options)
{
  const output = [];

  if (options.runModule) {
    const paths = [].concat(_toConsumableArray(options.runBeforeMainModule), [entryPoint]);

    for (const path of paths) {
      if (graph.dependencies.has(path)) {
        output.push({
          path: `require-${path}`,
          dependencies: new Map(),
          getSource: () => '',
          inverseDependencies: new Set(),
          output: [
          {
            type: 'js/script/virtual',
            data: {
              code: options.getRunModuleStatement(
              options.createModuleId(path)),

              map: [] } }] });




      }
    }
  }

  if (options.sourceMapUrl) {
    output.push({
      path: 'source-map',
      dependencies: new Map(),
      getSource: () => '',
      inverseDependencies: new Set(),
      output: [
      {
        type: 'js/script/virtual',
        data: {
          code: `//# sourceMappingURL=${options.sourceMapUrl}`,
          map: [] } }] });




  }

  return output;
}

module.exports = getAppendScripts;