/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 * @format
 */

'use strict';var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return Promise.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};}

const chalk = require('chalk');var _require =

require('metro-core');const Logger = _require.Logger;
const debug = require('debug')('Metro:JStransformer');
const Worker = require('jest-worker').default;






















module.exports = class Transformer {





  constructor(options)






  {
    this._transformModulePath = options.transformModulePath;
    this._asyncRequireModulePath = options.asyncRequireModulePath;
    this._dynamicDepsInPackages = options.dynamicDepsInPackages;var _options$workerPath =
    options.workerPath;const workerPath = _options$workerPath === undefined ? require.resolve('./JSTransformer/worker') : _options$workerPath;

    if (options.maxWorkers > 1) {
      this._worker = this._makeFarm(
      workerPath,
      this._computeWorkerKey,
      ['minify', 'transform'],
      options.maxWorkers);const


      reporters = options.reporters;
      this._worker.getStdout().on('data', chunk => {
        reporters.stdoutChunk(chunk.toString('utf8'));
      });
      this._worker.getStderr().on('data', chunk => {
        reporters.stderrChunk(chunk.toString('utf8'));
      });
    } else {
      // eslint-disable-next-line lint/flow-no-fixme
      // $FlowFixMe: Flow doesn't support dynamic requires
      this._worker = require(workerPath);
    }
  }

  kill() {
    if (this._worker && typeof this._worker.end === 'function') {
      this._worker.end();
    }
  }

  transform(
  filename,
  localPath,
  options,
  assetExts,
  assetRegistryPath,
  minifierPath)
  {var _this = this;return _asyncToGenerator(function* () {
      try {
        debug('Started transforming file', filename);

        const data = yield _this._worker.transform(
        filename,
        localPath,
        _this._transformModulePath,
        options,
        assetExts,
        assetRegistryPath,
        minifierPath,
        _this._asyncRequireModulePath,
        _this._dynamicDepsInPackages);


        debug('Done transforming file', filename);

        Logger.log(data.transformFileStartLogEntry);
        Logger.log(data.transformFileEndLogEntry);

        return {
          result: data.result,
          sha1: Buffer.from(data.sha1, 'hex') };

      } catch (err) {
        debug('Failed transform file', filename);

        if (err.loc) {
          throw _this._formatBabelError(err, filename);
        } else {
          throw _this._formatGenericError(err, filename);
        }
      }})();
  }

  _makeFarm(workerPath, computeWorkerKey, exposedMethods, numWorkers) {
    const execArgv = process.execArgv.slice();

    // We swallow the first parameter if it's not an option (some things such as
    // flow-node like to add themselves into the execArgv array)
    if (execArgv.length > 0 && execArgv[0].charAt(0) !== '-') {
      execArgv.shift();
    }

    const env = _extends({},
    process.env, {
      // Force color to print syntax highlighted code frames.
      FORCE_COLOR: chalk.supportsColor ? 1 : 0 });


    return new Worker(workerPath, {
      computeWorkerKey,
      exposedMethods,
      forkOptions: { env, execArgv },
      numWorkers });

  }

  _computeWorkerKey(method, filename) {
    // Only when transforming a file we want to stick to the same worker; and
    // we'll shard by file path. If not; we return null, which tells the worker
    // to pick the first available one.
    if (method === 'transform') {
      return filename;
    }

    return null;
  }

  _formatGenericError(err, filename) {
    const error = new TransformError(`${filename}: ${err.message}`);

    return Object.assign(error, {
      stack: (err.stack || '').
      split('\n').
      slice(0, -1).
      join('\n'),
      lineNumber: 0 });

  }

  _formatBabelError(err, filename) {
    const error = new TransformError(
    `${err.type || 'Error'}${
    err.message.includes(filename) ? '' : ' in ' + filename
    }: ${err.message}`);


    // $FlowFixMe: extending an error.
    return Object.assign(error, {
      stack: err.stack,
      snippet: err.codeFrame,
      lineNumber: err.loc.line,
      column: err.loc.column,
      filename });

  }};


class TransformError extends SyntaxError {


  constructor(message) {
    super(message);this.type = 'TransformError';
    Error.captureStackTrace && Error.captureStackTrace(this, TransformError);
  }}