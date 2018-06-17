/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 * @format
 */

'use strict';var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};var _require =

require('stream');const Writable = _require.Writable;

class JsonReporter {


  constructor(stream) {
    this._stream = stream;
  }

  /**
       * There is a special case for errors because they have non-enumerable fields.
       * (Perhaps we should switch in favor of plain object?)
       */
  update(event) {
    /* $FlowFixMe: fine to call on `undefined`. */
    if (Object.prototype.toString.call(event.error) === '[object Error]') {
      event = _extends({}, event);
      /* $FlowFixMe(>=0.70.0 site=react_native_fb) This comment suppresses an
                                                                 * error found when Flow v0.70 was deployed. To see the error delete
                                                                 * this comment and run Flow. */
      event.error = _extends({},



      event.error, {
        /* $FlowFixMe(>=0.70.0 site=react_native_fb) This comment suppresses an
                                   * error found when Flow v0.70 was deployed. To see the error delete
                                   * this comment and run Flow. */
        message: event.error.message,
        /* $FlowFixMe(>=0.70.0 site=react_native_fb) This comment suppresses an
                                                                     * error found when Flow v0.70 was deployed. To see the error delete
                                                                     * this comment and run Flow. */
        stack: event.error.stack });

    }
    this._stream.write(JSON.stringify(event) + '\n');
  }}


module.exports = JsonReporter;