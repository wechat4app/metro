/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 * @format
 */

'use strict';

const getAppendScripts = require('../../lib/getAppendScripts');var _require =

require('./helpers/js');const wrapModule = _require.wrapModule;var _require2 =
require('./helpers/js');const getJsOutput = _require2.getJsOutput,isJsModule = _require2.isJsModule;












function deltaJSBundle(
entryPoint,
pre,
delta,
sequenceId,
graph,
options)
{
  const outputPre = [];
  const outputPost = [];
  const outputDelta = [];

  for (const module of delta.modified.values()) {
    if (isJsModule(module)) {
      outputDelta.push([
      options.createModuleId(module.path),
      wrapModule(module, options)]);

    }
  }

  for (const path of delta.deleted) {
    outputDelta.push([options.createModuleId(path), null]);
  }

  if (delta.reset) {
    let i = -1;

    for (const module of pre) {
      if (isJsModule(module)) {
        outputPre.push([i, getJsOutput(module).data.code]);
        i--;
      }
    }

    const appendScripts = getAppendScripts(entryPoint, graph, options).values();

    for (const module of appendScripts) {
      if (isJsModule(module)) {
        outputPost.push([
        options.createModuleId(module.path),
        getJsOutput(module).data.code]);

      }
    }
  }

  const output = {
    id: sequenceId,
    pre: outputPre,
    post: outputPost,
    delta: outputDelta,
    reset: delta.reset };


  return JSON.stringify(output);
}

module.exports = deltaJSBundle;