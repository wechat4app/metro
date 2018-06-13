/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 * @format
 */

'use strict';function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return Promise.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};}var _require =





require('./traverseDependencies');const initialTraverseDependencies = _require.initialTraverseDependencies,reorderGraph = _require.reorderGraph,traverseDependencies = _require.traverseDependencies;var _require2 =
require('events');const EventEmitter = _require2.EventEmitter;




/**
                                                                                                                               * This class is in charge of calculating the delta of changed modules that
                                                                                                                               * happen between calls. To do so, it subscribes to file changes, so it can
                                                                                                                               * traverse the files that have been changed between calls and avoid having to
                                                                                                                               * traverse the whole dependency tree for trivial small changes.
                                                                                                                               */
class DeltaCalculator extends EventEmitter {









  constructor(
  entryPoints,
  dependencyGraph,
  options)
  {
    super();this._deletedFiles = new Set();this._modifiedFiles = new Set();this.













































































































    _handleMultipleFileChanges = _ref => {let eventsQueue = _ref.eventsQueue;
      eventsQueue.forEach(this._handleFileChange);
    };this.






    _handleFileChange = _ref2 =>





    {let type = _ref2.type,filePath = _ref2.filePath;
      if (type === 'delete') {
        this._deletedFiles.add(filePath);
        this._modifiedFiles.delete(filePath);
      } else {
        this._deletedFiles.delete(filePath);
        this._modifiedFiles.add(filePath);
      }

      // Notify users that there is a change in some of the bundle files. This
      // way the client can choose to refetch the bundle.
      this.emit('change');
    };this._options = options;this._dependencyGraph = dependencyGraph;this._graph = { dependencies: new Map(), entryPoints };this._dependencyGraph.getWatcher().on('change', this._handleMultipleFileChanges);} /**
                                                                                                                                                                                                                 * Stops listening for file changes and clears all the caches.
                                                                                                                                                                                                                 */end() {this._dependencyGraph.getWatcher().removeListener('change', this._handleMultipleFileChanges);this.removeAllListeners(); // Clean up all the cache data structures to deallocate memory.
    this._graph = { dependencies: new Map(), entryPoints: this._graph.entryPoints };this._modifiedFiles = new Set();this._deletedFiles = new Set();} /**
                                                                                                                                                      * Main method to calculate the delta of modules. It returns a DeltaResult,
                                                                                                                                                      * which contain the modified/added modules and the removed modules.
                                                                                                                                                      */getDelta(_ref3) {var _this = this;let reset = _ref3.reset;return _asyncToGenerator(function* () {// If there is already a build in progress, wait until it finish to start
      // processing a new one (delta server doesn't support concurrent builds).
      if (_this._currentBuildPromise) {yield _this._currentBuildPromise;} // We don't want the modified files Set to be modified while building the
      // bundle, so we isolate them by using the current instance for the bundling
      // and creating a new instance for the file watcher.
      const modifiedFiles = _this._modifiedFiles;_this._modifiedFiles = new Set();const deletedFiles = _this._deletedFiles;_this._deletedFiles = new Set(); // Concurrent requests should reuse the same bundling process. To do so,
      // this method stores the promise as an instance variable, and then it's
      // removed after it gets resolved.
      _this._currentBuildPromise = _this._getChangedDependencies(modifiedFiles, deletedFiles);let result;const numDependencies = _this._graph.dependencies.size;try {result = yield _this._currentBuildPromise;} catch (error) {// In case of error, we don't want to mark the modified files as
        // processed (since we haven't actually created any delta). If we do not
        // do so, asking for a delta after an error will produce an empty Delta,
        // which is not correct.
        modifiedFiles.forEach(function (file) {return _this._modifiedFiles.add(file);});deletedFiles.forEach(function (file) {return _this._deletedFiles.add(file);}); // If after an error the number of modules has changed, we could be in
        // a weird state. As a safe net we clean the dependency modules to force
        // a clean traversal of the graph next time.
        if (_this._graph.dependencies.size !== numDependencies) {_this._graph.dependencies = new Map();}throw error;} finally {_this._currentBuildPromise = null;} // Return all the modules if the client requested a reset delta.
      if (reset) {reorderGraph(_this._graph);return { modified: _this._graph.dependencies, deleted: new Set(), reset: true };}return result;})();} /**
                                                                                                                                                    * Returns the graph with all the dependencies. Each module contains the
                                                                                                                                                    * needed information to do the traversing (dependencies, inverseDependencies)
                                                                                                                                                    * plus some metadata.
                                                                                                                                                    */getGraph() {return this._graph;} /**
                                                                                                                                                                                        * Handles a single file change. To avoid doing any work before it's needed,
                                                                                                                                                                                        * the listener only stores the modified file, which will then be used later
                                                                                                                                                                                        * when the delta needs to be calculated.
                                                                                                                                                                                        */_getChangedDependencies(modifiedFiles, deletedFiles) {var _this2 = this;return _asyncToGenerator(function* () {if (!_this2._graph.dependencies.size) {var _ref4 = yield initialTraverseDependencies(_this2._graph, _this2._options);const added = _ref4.added;return { modified: added, deleted: new Set(), reset: true };} // If a file has been deleted, we want to invalidate any other file that
      // depends on it, so we can process it and correctly return an error.
      deletedFiles.forEach(function (filePath) {const module = _this2._graph.dependencies.get(filePath);if (module) {module.inverseDependencies.forEach(function (path) {// Only mark the inverse dependency as modified if it's not already
            // marked as deleted (in that case we can just ignore it).
            if (!deletedFiles.has(path)) {modifiedFiles.add(path);}});}});
      // We only want to process files that are in the bundle.
      const modifiedDependencies = Array.from(modifiedFiles).filter(function (filePath) {return (
          _this2._graph.dependencies.has(filePath));});


      // No changes happened. Return empty delta.
      if (modifiedDependencies.length === 0) {
        return { modified: new Map(), deleted: new Set(), reset: false };
      }var _ref5 =

      yield traverseDependencies(
      modifiedDependencies,
      _this2._graph,
      _this2._options);const added = _ref5.added,deleted = _ref5.deleted;


      return {
        modified: added,
        deleted,
        reset: false };})();

  }}


module.exports = DeltaCalculator;