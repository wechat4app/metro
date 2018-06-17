/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 * @format
 */

'use strict';function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return Promise.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};}

const DeltaCalculator = require('./DeltaBundler/DeltaCalculator');


















/**
                                                                                                                                       * `DeltaBundler` uses the `DeltaTransformer` to build bundle deltas. This
                                                                                                                                       * module handles all the transformer instances so it can support multiple
                                                                                                                                       * concurrent clients requesting their own deltas. This is done through the
                                                                                                                                       * `clientId` param (which maps a client to a specific delta transformer).
                                                                                                                                       */
class DeltaBundler {



  constructor(bundler) {this._deltaCalculators = new Map();
    this._bundler = bundler;
  }

  end() {
    this._deltaCalculators.forEach(deltaCalculator => deltaCalculator.end());
    this._deltaCalculators = new Map();
  }

  buildGraph(
  entryPoints,
  options)
  {var _this = this;return _asyncToGenerator(function* () {
      const depGraph = yield _this._bundler.getDependencyGraph();

      const deltaCalculator = new DeltaCalculator(entryPoints, depGraph, options);

      yield deltaCalculator.getDelta({ reset: true });
      const graph = deltaCalculator.getGraph();

      _this._deltaCalculators.set(graph, deltaCalculator);

      return graph;})();
  }

  getDelta(
  graph, _ref)

  {var _this2 = this;let reset = _ref.reset;return _asyncToGenerator(function* () {
      const deltaCalculator = _this2._deltaCalculators.get(graph);

      if (!deltaCalculator) {
        throw new Error('Graph not found');
      }

      return yield deltaCalculator.getDelta({ reset });})();
  }

  listen(graph, callback) {
    const deltaCalculator = this._deltaCalculators.get(graph);

    if (!deltaCalculator) {
      throw new Error('Graph not found');
    }

    deltaCalculator.on('change', callback);
  }

  endGraph(graph) {
    const deltaCalculator = this._deltaCalculators.get(graph);

    if (!deltaCalculator) {
      throw new Error('Graph not found');
    }

    deltaCalculator.end();

    this._deltaCalculators.delete(graph);
  }}


module.exports = DeltaBundler;