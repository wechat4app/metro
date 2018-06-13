/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 * @format
 */

'use strict';var _slicedToArray = function () {function sliceIterator(arr, i) {var _arr = [];var _n = true;var _d = false;var _e = undefined;try {for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"]) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}return function (arr, i) {if (Array.isArray(arr)) {return arr;} else if (Symbol.iterator in Object(arr)) {return sliceIterator(arr, i);} else {throw new TypeError("Invalid attempt to destructure non-iterable instance");}};}();


















/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * Dependency Traversal logic for the Delta Bundler. This method calculates
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * the modules that should be included in the bundle by traversing the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * dependency graph.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * Instead of traversing the whole graph each time, it just calculates the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * difference between runs by only traversing the added/removed dependencies.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * To do so, it uses the passed passed graph dependencies and it mutates it.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * The paths parameter contains the absolute paths of the root files that the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * method should traverse. Normally, these paths should be the modified files
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * since the last traversal.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             */let traverseDependencies = (() => {var _ref = _asyncToGenerator(
  function* (
  paths,
  graph,
  options)
  {
    const delta = {
      added: new Map(),
      modified: new Map(),
      deleted: new Set() };


    yield Promise.all(
    paths.map((() => {var _ref2 = _asyncToGenerator(function* (path) {
        const module = graph.dependencies.get(path);

        if (!module) {
          return;
        }

        delta.modified.set(module.path, module);

        yield traverseDependenciesForSingleFile(module, graph, delta, options);
      });return function (_x4) {return _ref2.apply(this, arguments);};})()));


    const added = new Map();
    const deleted = new Set();
    const modified = new Map();

    for (const _ref3 of delta.added) {var _ref4 = _slicedToArray(_ref3, 2);const path = _ref4[0];const module = _ref4[1];
      added.set(path, module);
    }

    for (const _ref5 of delta.modified) {var _ref6 = _slicedToArray(_ref5, 2);const path = _ref6[0];const module = _ref6[1];
      added.set(path, module);
      modified.set(path, module);
    }

    for (const path of delta.deleted) {
      // If a dependency has been marked as deleted, it should never be included
      // in the added group.
      // At the same time, if a dependency has been marked both as added and
      // deleted, it means that this is a renamed file (or that dependency
      // has been removed from one path but added back in a different path).
      // In this case the addition and deletion "get cancelled".
      const markedAsAdded = added.delete(path);

      if (!markedAsAdded || modified.has(path)) {
        deleted.add(path);
      }
    }

    return {
      added,
      deleted };

  });return function traverseDependencies(_x, _x2, _x3) {return _ref.apply(this, arguments);};})(); /**
                                                                                                     * Internal data structure that the traversal logic uses to know which of the
                                                                                                     * files have been modified. This helps us know which files to mark as deleted
                                                                                                     * (a file should not be deleted if it has been added, but it should if it
                                                                                                     * just has been modified).
                                                                                                     **/let initialTraverseDependencies = (() => {var _ref7 = _asyncToGenerator(function* (graph, options) {
    graph.entryPoints.forEach(function (entryPoint) {return createModule(entryPoint, graph);});

    yield traverseDependencies(graph.entryPoints, graph, options);

    reorderGraph(graph);

    return {
      added: graph.dependencies,
      deleted: new Set() };

  });return function initialTraverseDependencies(_x5, _x6) {return _ref7.apply(this, arguments);};})();let traverseDependenciesForSingleFile = (() => {var _ref8 = _asyncToGenerator(

  function* (
  module,
  graph,
  delta,
  options)
  {
    let numProcessed = 0;
    let total = 1;
    options.onProgress && options.onProgress(numProcessed, total);

    yield processModule(
    module,
    graph,
    delta,
    options,
    function () {
      total++;
      options.onProgress && options.onProgress(numProcessed, total);
    },
    function () {
      numProcessed++;
      options.onProgress && options.onProgress(numProcessed, total);
    });


    numProcessed++;
    options.onProgress && options.onProgress(numProcessed, total);
  });return function traverseDependenciesForSingleFile(_x7, _x8, _x9, _x10) {return _ref8.apply(this, arguments);};})();let processModule = (() => {var _ref9 = _asyncToGenerator(

  function* (
  module,
  graph,
  delta,
  options,
  onDependencyAdd,
  onDependencyAdded)
  {
    const previousDependencies = module.dependencies;

    // Transform the file via the given option.
    const result = yield options.transform(module.path);

    // Get the absolute path of all sub-dependencies (some of them could have been
    // moved but maintain the same relative path).
    const currentDependencies = resolveDependencies(
    module.path,
    result.dependencies,
    options);


    // Update the module information.
    module.getSource = result.getSource;
    module.output = result.output;
    module.dependencies = new Map();

    for (const _ref10 of currentDependencies) {var _ref11 = _slicedToArray(_ref10, 2);const relativePath = _ref11[0];const dependency = _ref11[1];
      module.dependencies.set(relativePath, dependency);
    }

    for (const _ref12 of previousDependencies) {var _ref13 = _slicedToArray(_ref12, 2);const relativePath = _ref13[0];const dependency = _ref13[1];
      if (!currentDependencies.has(relativePath)) {
        removeDependency(module, dependency.absolutePath, graph, delta);
      }
    }

    // Check all the module dependencies and start traversing the tree from each
    // added and removed dependency, to get all the modules that have to be added
    // and removed from the dependency graph.
    const promises = [];

    for (const _ref14 of currentDependencies) {var _ref15 = _slicedToArray(_ref14, 2);const relativePath = _ref15[0];const dependency = _ref15[1];
      if (!previousDependencies.has(relativePath)) {
        promises.push(
        addDependency(
        module,
        dependency.absolutePath,
        graph,
        delta,
        options,
        onDependencyAdd,
        onDependencyAdded));


      }
    }

    yield Promise.all(promises);
  });return function processModule(_x11, _x12, _x13, _x14, _x15, _x16) {return _ref9.apply(this, arguments);};})();let addDependency = (() => {var _ref16 = _asyncToGenerator(

  function* (
  parentModule,
  path,
  graph,
  delta,
  options,
  onDependencyAdd,
  onDependencyAdded)
  {
    const existingModule = graph.dependencies.get(path);

    // The new dependency was already in the graph, we don't need to do anything.
    if (existingModule) {
      existingModule.inverseDependencies.add(parentModule.path);

      return;
    }

    const module = createModule(path, graph);

    module.inverseDependencies.add(parentModule.path);
    delta.added.set(module.path, module);

    onDependencyAdd();

    yield processModule(
    module,
    graph,
    delta,
    options,
    onDependencyAdd,
    onDependencyAdded);


    onDependencyAdded();
  });return function addDependency(_x17, _x18, _x19, _x20, _x21, _x22, _x23) {return _ref16.apply(this, arguments);};})();function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return Promise.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};}

function removeDependency(
parentModule,
absolutePath,
graph,
delta)
{
  const module = graph.dependencies.get(absolutePath);

  if (!module) {
    return;
  }

  module.inverseDependencies.delete(parentModule.path);

  // This module is still used by another modules, so we cannot remove it from
  // the bundle.
  if (module.inverseDependencies.size) {
    return;
  }

  delta.deleted.add(module.path);

  // Now we need to iterate through the module dependencies in order to
  // clean up everything (we cannot read the module because it may have
  // been deleted).
  for (const _ref17 of module.dependencies) {var _ref18 = _slicedToArray(_ref17, 2);const dependency = _ref18[1];
    removeDependency(module, dependency.absolutePath, graph, delta);
  }

  // This module is not used anywhere else!! we can clear it from the bundle
  graph.dependencies.delete(module.path);
}

function createModule(filePath, graph) {
  const module = {
    dependencies: new Map(),
    inverseDependencies: new Set(),
    path: filePath,
    getSource: () => '',
    output: [] };


  graph.dependencies.set(filePath, module);

  return module;
}

function resolveDependencies(
parentPath,
dependencies,
options)
{
  return new Map(
  dependencies.map(result => {
    const relativePath = result.name;

    const dependency = {
      absolutePath: options.resolve(parentPath, result.name),
      data: result };


    return [relativePath, dependency];
  }));

}

/**
     * Re-traverse the dependency graph in DFS order to reorder the modules and
     * guarantee the same order between runs. This method mutates the passed graph.
     */
function reorderGraph(graph) {
  const orderedDependencies = new Map();

  graph.entryPoints.forEach(entryPoint => {
    const mainModule = graph.dependencies.get(entryPoint);

    if (!mainModule) {
      throw new ReferenceError('Module not registered in graph: ' + entryPoint);
    }

    reorderDependencies(graph, mainModule, orderedDependencies);
  });

  graph.dependencies = orderedDependencies;
}

function reorderDependencies(
graph,
module,
orderedDependencies)
{
  if (module.path) {
    if (orderedDependencies.has(module.path)) {
      return;
    }

    orderedDependencies.set(module.path, module);
  }

  module.dependencies.forEach(dependency => {
    const path = dependency.absolutePath;
    const childModule = graph.dependencies.get(path);

    if (!childModule) {
      throw new ReferenceError('Module not registered in graph: ' + path);
    }

    reorderDependencies(graph, childModule, orderedDependencies);
  });
}

module.exports = {
  initialTraverseDependencies,
  traverseDependencies,
  reorderGraph };