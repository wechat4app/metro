/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 * @format
 */

'use strict';function _toConsumableArray(arr) {if (Array.isArray(arr)) {for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];return arr2;} else {return Array.from(arr);}}

function getPreludeCode(_ref)





{let extraVars = _ref.extraVars,isDev = _ref.isDev;
  const vars = [].concat(_toConsumableArray(
  formatExtraVars(extraVars)), [
  `__DEV__=${String(isDev)}`,
  '__BUNDLE_START_TIME__=this.nativePerformanceNow?nativePerformanceNow():Date.now()',
  'process=this.process||{}']);

  return `var ${vars.join(',')};${processEnv(
  isDev ? 'development' : 'production')
  }`;
}

function formatExtraVars(extraVars) {
  const assignments = [];
  for (const key in extraVars) {
    assignments.push(`${key}=${JSON.stringify(extraVars[key])}`);
  }
  return assignments;
}

function processEnv(nodeEnv) {
  return `process.env=process.env||{};process.env.NODE_ENV=${JSON.stringify(
  nodeEnv)
  };`;
}

module.exports = getPreludeCode;