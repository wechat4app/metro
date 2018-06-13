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

const addParamsToDefineCall = require('../../../lib/addParamsToDefineCall');
const invariant = require('fbjs/lib/invariant');
const path = require('path');









// Used to include paths in production bundles for traces of performance tuned runs,
// e.g. to update fbandroid/apps/fb4a/compiled_react_native_modules.txt
// Make sure to set PRINT_REQUIRE_PATHS = true too, and restart Metro
const PASS_MODULE_PATHS_TO_DEFINE = false;

function wrapModule(module, options) {
  const output = getJsOutput(module);

  if (output.type.startsWith('js/script')) {
    return output.data.code;
  }

  const moduleId = options.createModuleId(module.path);
  const params = [
  moduleId,
  Array.from(module.dependencies.values()).map(dependency => {
    return options.createModuleId(dependency.absolutePath);
  })];


  // Add the module name as the last parameter (to make it easier to do
  // requires by name when debugging).
  // TODO (t26853986): Switch this to use the relative file path (once we have
  // as single project root).
  if (PASS_MODULE_PATHS_TO_DEFINE || options.dev) {
    params.push(path.basename(module.path));
    if (PASS_MODULE_PATHS_TO_DEFINE) {
      params.push(module.path);
    }
  }

  return addParamsToDefineCall.apply(undefined, [output.data.code].concat(params));
}

function getJsOutput(module) {
  const jsModules = module.output.filter(_ref => {let type = _ref.type;return type.startsWith('js/');});

  invariant(
  jsModules.length === 1,
  `Modules must have exactly one JS output, but ${module.path} has ${
  jsModules.length
  } JS outputs.`);


  return jsModules[0];
}

function isJsModule(module) {
  return module.output.filter(isJsOutput).length > 0;
}

function isJsOutput(output) {
  return output.type.startsWith('js/');
}

module.exports = {
  getJsOutput,
  isJsModule,
  wrapModule };