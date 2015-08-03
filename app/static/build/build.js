(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            currentQueue[queueIndex].run();
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
var EventListener = require('react/lib/EventListener');
var SyntheticKeyboardEvent = require('react/lib/SyntheticKeyboardEvent');

var documentListener;
/**
 * Enable the global event listener. Is idempotent.
 */
exports.activate = function(event) {
    if (!event) {
        event = 'keyup';
    }
    if (!documentListener) {
        documentListener = EventListener.listen(document, event, handle);
    }
    return exports;
};
/**
 * Disable the global event listener. Is idempotent.
 */
exports.disable = function() {
    if (documentListener) {
        documentListener.remove();
        documentListener = null;
    }
};

// Container for all the handlers
var handlers = [];

/**
 * Mixin that calls `handlerName` on your component if it is mounted and a
 * key event has bubbled up to the document
 */
exports.Mixin = function HotkeyMixin(handlerName) {
    return {
        componentDidMount: function() {
            var handler = this[handlerName];
            handlers.push(handler);
        },
        componentWillUnmount: function() {
            var handler = this[handlerName];
            var index = handlers.indexOf(handler);
            handlers.splice(index, 1);
        }
    };
};


// Create and dispatch an event object using React's object pool
// Cribbed from SimpleEventPlugin and EventPluginHub
function handle(nativeEvent) {
    var event = SyntheticKeyboardEvent.getPooled({}, 'hotkey', nativeEvent);
    try {
        dispatchEvent(event, handlers);
    } finally {
        if (!event.isPersistent()) {
            event.constructor.release(event);
        }
    }
}
// Dispatch the event, in order, to all interested listeners
// The most recently mounted component is the first to receive the event
// Cribbed from a combination of SimpleEventPlugin and EventPluginUtils
function dispatchEvent(event, handlers) {
    for (var i = (handlers.length - 1); i >= 0; i--) {
        if (event.isPropagationStopped()) {
            break;
        }
        var returnValue = handlers[i](event);
        if (returnValue === false) {
            event.stopPropagation();
            event.preventDefault();
        }
    }
}

},{"react/lib/EventListener":3,"react/lib/SyntheticKeyboardEvent":7}],3:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule EventListener
 * @typechecks
 */

var emptyFunction = require("./emptyFunction");

/**
 * Upstream version of event listener. Does not take into account specific
 * nature of platform.
 */
var EventListener = {
  /**
   * Listen to DOM events during the bubble phase.
   *
   * @param {DOMEventTarget} target DOM element to register listener on.
   * @param {string} eventType Event type, e.g. 'click' or 'mouseover'.
   * @param {function} callback Callback function.
   * @return {object} Object with a `remove` method.
   */
  listen: function(target, eventType, callback) {
    if (target.addEventListener) {
      target.addEventListener(eventType, callback, false);
      return {
        remove: function() {
          target.removeEventListener(eventType, callback, false);
        }
      };
    } else if (target.attachEvent) {
      target.attachEvent('on' + eventType, callback);
      return {
        remove: function() {
          target.detachEvent('on' + eventType, callback);
        }
      };
    }
  },

  /**
   * Listen to DOM events during the capture phase.
   *
   * @param {DOMEventTarget} target DOM element to register listener on.
   * @param {string} eventType Event type, e.g. 'click' or 'mouseover'.
   * @param {function} callback Callback function.
   * @return {object} Object with a `remove` method.
   */
  capture: function(target, eventType, callback) {
    if (!target.addEventListener) {
      if ("production" !== process.env.NODE_ENV) {
        console.error(
          'Attempted to listen to events during the capture phase on a ' +
          'browser that does not support the capture phase. Your application ' +
          'will not receive some events.'
        );
      }
      return {
        remove: emptyFunction
      };
    } else {
      target.addEventListener(eventType, callback, true);
      return {
        remove: function() {
          target.removeEventListener(eventType, callback, true);
        }
      };
    }
  },

  registerDefault: function() {}
};

module.exports = EventListener;

}).call(this,require('_process'))

},{"./emptyFunction":9,"_process":1}],4:[function(require,module,exports){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Object.assign
 */

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.assign

'use strict';

function assign(target, sources) {
  if (target == null) {
    throw new TypeError('Object.assign target cannot be null or undefined');
  }

  var to = Object(target);
  var hasOwnProperty = Object.prototype.hasOwnProperty;

  for (var nextIndex = 1; nextIndex < arguments.length; nextIndex++) {
    var nextSource = arguments[nextIndex];
    if (nextSource == null) {
      continue;
    }

    var from = Object(nextSource);

    // We don't currently support accessors nor proxies. Therefore this
    // copy cannot throw. If we ever supported this then we must handle
    // exceptions and side-effects. We don't support symbols so they won't
    // be transferred.

    for (var key in from) {
      if (hasOwnProperty.call(from, key)) {
        to[key] = from[key];
      }
    }
  }

  return to;
}

module.exports = assign;

},{}],5:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule PooledClass
 */

'use strict';

var invariant = require("./invariant");

/**
 * Static poolers. Several custom versions for each potential number of
 * arguments. A completely generic pooler is easy to implement, but would
 * require accessing the `arguments` object. In each of these, `this` refers to
 * the Class itself, not an instance. If any others are needed, simply add them
 * here, or in their own files.
 */
var oneArgumentPooler = function(copyFieldsFrom) {
  var Klass = this;
  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, copyFieldsFrom);
    return instance;
  } else {
    return new Klass(copyFieldsFrom);
  }
};

var twoArgumentPooler = function(a1, a2) {
  var Klass = this;
  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, a1, a2);
    return instance;
  } else {
    return new Klass(a1, a2);
  }
};

var threeArgumentPooler = function(a1, a2, a3) {
  var Klass = this;
  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, a1, a2, a3);
    return instance;
  } else {
    return new Klass(a1, a2, a3);
  }
};

var fiveArgumentPooler = function(a1, a2, a3, a4, a5) {
  var Klass = this;
  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, a1, a2, a3, a4, a5);
    return instance;
  } else {
    return new Klass(a1, a2, a3, a4, a5);
  }
};

var standardReleaser = function(instance) {
  var Klass = this;
  ("production" !== process.env.NODE_ENV ? invariant(
    instance instanceof Klass,
    'Trying to release an instance into a pool of a different type.'
  ) : invariant(instance instanceof Klass));
  if (instance.destructor) {
    instance.destructor();
  }
  if (Klass.instancePool.length < Klass.poolSize) {
    Klass.instancePool.push(instance);
  }
};

var DEFAULT_POOL_SIZE = 10;
var DEFAULT_POOLER = oneArgumentPooler;

/**
 * Augments `CopyConstructor` to be a poolable class, augmenting only the class
 * itself (statically) not adding any prototypical fields. Any CopyConstructor
 * you give this may have a `poolSize` property, and will look for a
 * prototypical `destructor` on instances (optional).
 *
 * @param {Function} CopyConstructor Constructor that can be used to reset.
 * @param {Function} pooler Customizable pooler.
 */
var addPoolingTo = function(CopyConstructor, pooler) {
  var NewKlass = CopyConstructor;
  NewKlass.instancePool = [];
  NewKlass.getPooled = pooler || DEFAULT_POOLER;
  if (!NewKlass.poolSize) {
    NewKlass.poolSize = DEFAULT_POOL_SIZE;
  }
  NewKlass.release = standardReleaser;
  return NewKlass;
};

var PooledClass = {
  addPoolingTo: addPoolingTo,
  oneArgumentPooler: oneArgumentPooler,
  twoArgumentPooler: twoArgumentPooler,
  threeArgumentPooler: threeArgumentPooler,
  fiveArgumentPooler: fiveArgumentPooler
};

module.exports = PooledClass;

}).call(this,require('_process'))

},{"./invariant":14,"_process":1}],6:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SyntheticEvent
 * @typechecks static-only
 */

'use strict';

var PooledClass = require("./PooledClass");

var assign = require("./Object.assign");
var emptyFunction = require("./emptyFunction");
var getEventTarget = require("./getEventTarget");

/**
 * @interface Event
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var EventInterface = {
  type: null,
  target: getEventTarget,
  // currentTarget is set when dispatching; no use in copying it here
  currentTarget: emptyFunction.thatReturnsNull,
  eventPhase: null,
  bubbles: null,
  cancelable: null,
  timeStamp: function(event) {
    return event.timeStamp || Date.now();
  },
  defaultPrevented: null,
  isTrusted: null
};

/**
 * Synthetic events are dispatched by event plugins, typically in response to a
 * top-level event delegation handler.
 *
 * These systems should generally use pooling to reduce the frequency of garbage
 * collection. The system should check `isPersistent` to determine whether the
 * event should be released into the pool after being dispatched. Users that
 * need a persisted event should invoke `persist`.
 *
 * Synthetic events (and subclasses) implement the DOM Level 3 Events API by
 * normalizing browser quirks. Subclasses do not necessarily have to implement a
 * DOM interface; custom application-specific events can also subclass this.
 *
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 */
function SyntheticEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  this.dispatchConfig = dispatchConfig;
  this.dispatchMarker = dispatchMarker;
  this.nativeEvent = nativeEvent;

  var Interface = this.constructor.Interface;
  for (var propName in Interface) {
    if (!Interface.hasOwnProperty(propName)) {
      continue;
    }
    var normalize = Interface[propName];
    if (normalize) {
      this[propName] = normalize(nativeEvent);
    } else {
      this[propName] = nativeEvent[propName];
    }
  }

  var defaultPrevented = nativeEvent.defaultPrevented != null ?
    nativeEvent.defaultPrevented :
    nativeEvent.returnValue === false;
  if (defaultPrevented) {
    this.isDefaultPrevented = emptyFunction.thatReturnsTrue;
  } else {
    this.isDefaultPrevented = emptyFunction.thatReturnsFalse;
  }
  this.isPropagationStopped = emptyFunction.thatReturnsFalse;
}

assign(SyntheticEvent.prototype, {

  preventDefault: function() {
    this.defaultPrevented = true;
    var event = this.nativeEvent;
    if (event.preventDefault) {
      event.preventDefault();
    } else {
      event.returnValue = false;
    }
    this.isDefaultPrevented = emptyFunction.thatReturnsTrue;
  },

  stopPropagation: function() {
    var event = this.nativeEvent;
    if (event.stopPropagation) {
      event.stopPropagation();
    } else {
      event.cancelBubble = true;
    }
    this.isPropagationStopped = emptyFunction.thatReturnsTrue;
  },

  /**
   * We release all dispatched `SyntheticEvent`s after each event loop, adding
   * them back into the pool. This allows a way to hold onto a reference that
   * won't be added back into the pool.
   */
  persist: function() {
    this.isPersistent = emptyFunction.thatReturnsTrue;
  },

  /**
   * Checks if this event should be released back into the pool.
   *
   * @return {boolean} True if this should not be released, false otherwise.
   */
  isPersistent: emptyFunction.thatReturnsFalse,

  /**
   * `PooledClass` looks for `destructor` on each instance it releases.
   */
  destructor: function() {
    var Interface = this.constructor.Interface;
    for (var propName in Interface) {
      this[propName] = null;
    }
    this.dispatchConfig = null;
    this.dispatchMarker = null;
    this.nativeEvent = null;
  }

});

SyntheticEvent.Interface = EventInterface;

/**
 * Helper to reduce boilerplate when creating subclasses.
 *
 * @param {function} Class
 * @param {?object} Interface
 */
SyntheticEvent.augmentClass = function(Class, Interface) {
  var Super = this;

  var prototype = Object.create(Super.prototype);
  assign(prototype, Class.prototype);
  Class.prototype = prototype;
  Class.prototype.constructor = Class;

  Class.Interface = assign({}, Super.Interface, Interface);
  Class.augmentClass = Super.augmentClass;

  PooledClass.addPoolingTo(Class, PooledClass.threeArgumentPooler);
};

PooledClass.addPoolingTo(SyntheticEvent, PooledClass.threeArgumentPooler);

module.exports = SyntheticEvent;

},{"./Object.assign":4,"./PooledClass":5,"./emptyFunction":9,"./getEventTarget":13}],7:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SyntheticKeyboardEvent
 * @typechecks static-only
 */

'use strict';

var SyntheticUIEvent = require("./SyntheticUIEvent");

var getEventCharCode = require("./getEventCharCode");
var getEventKey = require("./getEventKey");
var getEventModifierState = require("./getEventModifierState");

/**
 * @interface KeyboardEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var KeyboardEventInterface = {
  key: getEventKey,
  location: null,
  ctrlKey: null,
  shiftKey: null,
  altKey: null,
  metaKey: null,
  repeat: null,
  locale: null,
  getModifierState: getEventModifierState,
  // Legacy Interface
  charCode: function(event) {
    // `charCode` is the result of a KeyPress event and represents the value of
    // the actual printable character.

    // KeyPress is deprecated, but its replacement is not yet final and not
    // implemented in any major browser. Only KeyPress has charCode.
    if (event.type === 'keypress') {
      return getEventCharCode(event);
    }
    return 0;
  },
  keyCode: function(event) {
    // `keyCode` is the result of a KeyDown/Up event and represents the value of
    // physical keyboard key.

    // The actual meaning of the value depends on the users' keyboard layout
    // which cannot be detected. Assuming that it is a US keyboard layout
    // provides a surprisingly accurate mapping for US and European users.
    // Due to this, it is left to the user to implement at this time.
    if (event.type === 'keydown' || event.type === 'keyup') {
      return event.keyCode;
    }
    return 0;
  },
  which: function(event) {
    // `which` is an alias for either `keyCode` or `charCode` depending on the
    // type of the event.
    if (event.type === 'keypress') {
      return getEventCharCode(event);
    }
    if (event.type === 'keydown' || event.type === 'keyup') {
      return event.keyCode;
    }
    return 0;
  }
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticKeyboardEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticUIEvent.augmentClass(SyntheticKeyboardEvent, KeyboardEventInterface);

module.exports = SyntheticKeyboardEvent;

},{"./SyntheticUIEvent":8,"./getEventCharCode":10,"./getEventKey":11,"./getEventModifierState":12}],8:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SyntheticUIEvent
 * @typechecks static-only
 */

'use strict';

var SyntheticEvent = require("./SyntheticEvent");

var getEventTarget = require("./getEventTarget");

/**
 * @interface UIEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var UIEventInterface = {
  view: function(event) {
    if (event.view) {
      return event.view;
    }

    var target = getEventTarget(event);
    if (target != null && target.window === target) {
      // target is a window object
      return target;
    }

    var doc = target.ownerDocument;
    // TODO: Figure out why `ownerDocument` is sometimes undefined in IE8.
    if (doc) {
      return doc.defaultView || doc.parentWindow;
    } else {
      return window;
    }
  },
  detail: function(event) {
    return event.detail || 0;
  }
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticEvent}
 */
function SyntheticUIEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticEvent.augmentClass(SyntheticUIEvent, UIEventInterface);

module.exports = SyntheticUIEvent;

},{"./SyntheticEvent":6,"./getEventTarget":13}],9:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule emptyFunction
 */

function makeEmptyFunction(arg) {
  return function() {
    return arg;
  };
}

/**
 * This function accepts and discards inputs; it has no side effects. This is
 * primarily useful idiomatically for overridable function endpoints which
 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
 */
function emptyFunction() {}

emptyFunction.thatReturns = makeEmptyFunction;
emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
emptyFunction.thatReturnsNull = makeEmptyFunction(null);
emptyFunction.thatReturnsThis = function() { return this; };
emptyFunction.thatReturnsArgument = function(arg) { return arg; };

module.exports = emptyFunction;

},{}],10:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getEventCharCode
 * @typechecks static-only
 */

'use strict';

/**
 * `charCode` represents the actual "character code" and is safe to use with
 * `String.fromCharCode`. As such, only keys that correspond to printable
 * characters produce a valid `charCode`, the only exception to this is Enter.
 * The Tab-key is considered non-printable and does not have a `charCode`,
 * presumably because it does not produce a tab-character in browsers.
 *
 * @param {object} nativeEvent Native browser event.
 * @return {string} Normalized `charCode` property.
 */
function getEventCharCode(nativeEvent) {
  var charCode;
  var keyCode = nativeEvent.keyCode;

  if ('charCode' in nativeEvent) {
    charCode = nativeEvent.charCode;

    // FF does not set `charCode` for the Enter-key, check against `keyCode`.
    if (charCode === 0 && keyCode === 13) {
      charCode = 13;
    }
  } else {
    // IE8 does not implement `charCode`, but `keyCode` has the correct value.
    charCode = keyCode;
  }

  // Some non-printable keys are reported in `charCode`/`keyCode`, discard them.
  // Must not discard the (non-)printable Enter-key.
  if (charCode >= 32 || charCode === 13) {
    return charCode;
  }

  return 0;
}

module.exports = getEventCharCode;

},{}],11:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getEventKey
 * @typechecks static-only
 */

'use strict';

var getEventCharCode = require("./getEventCharCode");

/**
 * Normalization of deprecated HTML5 `key` values
 * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent#Key_names
 */
var normalizeKey = {
  'Esc': 'Escape',
  'Spacebar': ' ',
  'Left': 'ArrowLeft',
  'Up': 'ArrowUp',
  'Right': 'ArrowRight',
  'Down': 'ArrowDown',
  'Del': 'Delete',
  'Win': 'OS',
  'Menu': 'ContextMenu',
  'Apps': 'ContextMenu',
  'Scroll': 'ScrollLock',
  'MozPrintableKey': 'Unidentified'
};

/**
 * Translation from legacy `keyCode` to HTML5 `key`
 * Only special keys supported, all others depend on keyboard layout or browser
 * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent#Key_names
 */
var translateToKey = {
  8: 'Backspace',
  9: 'Tab',
  12: 'Clear',
  13: 'Enter',
  16: 'Shift',
  17: 'Control',
  18: 'Alt',
  19: 'Pause',
  20: 'CapsLock',
  27: 'Escape',
  32: ' ',
  33: 'PageUp',
  34: 'PageDown',
  35: 'End',
  36: 'Home',
  37: 'ArrowLeft',
  38: 'ArrowUp',
  39: 'ArrowRight',
  40: 'ArrowDown',
  45: 'Insert',
  46: 'Delete',
  112: 'F1', 113: 'F2', 114: 'F3', 115: 'F4', 116: 'F5', 117: 'F6',
  118: 'F7', 119: 'F8', 120: 'F9', 121: 'F10', 122: 'F11', 123: 'F12',
  144: 'NumLock',
  145: 'ScrollLock',
  224: 'Meta'
};

/**
 * @param {object} nativeEvent Native browser event.
 * @return {string} Normalized `key` property.
 */
function getEventKey(nativeEvent) {
  if (nativeEvent.key) {
    // Normalize inconsistent values reported by browsers due to
    // implementations of a working draft specification.

    // FireFox implements `key` but returns `MozPrintableKey` for all
    // printable characters (normalized to `Unidentified`), ignore it.
    var key = normalizeKey[nativeEvent.key] || nativeEvent.key;
    if (key !== 'Unidentified') {
      return key;
    }
  }

  // Browser does not implement `key`, polyfill as much of it as we can.
  if (nativeEvent.type === 'keypress') {
    var charCode = getEventCharCode(nativeEvent);

    // The enter-key is technically both printable and non-printable and can
    // thus be captured by `keypress`, no other non-printable key should.
    return charCode === 13 ? 'Enter' : String.fromCharCode(charCode);
  }
  if (nativeEvent.type === 'keydown' || nativeEvent.type === 'keyup') {
    // While user keyboard layout determines the actual meaning of each
    // `keyCode` value, almost all function keys have a universal value.
    return translateToKey[nativeEvent.keyCode] || 'Unidentified';
  }
  return '';
}

module.exports = getEventKey;

},{"./getEventCharCode":10}],12:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getEventModifierState
 * @typechecks static-only
 */

'use strict';

/**
 * Translation from modifier key to the associated property in the event.
 * @see http://www.w3.org/TR/DOM-Level-3-Events/#keys-Modifiers
 */

var modifierKeyToProp = {
  'Alt': 'altKey',
  'Control': 'ctrlKey',
  'Meta': 'metaKey',
  'Shift': 'shiftKey'
};

// IE8 does not implement getModifierState so we simply map it to the only
// modifier keys exposed by the event itself, does not support Lock-keys.
// Currently, all major browsers except Chrome seems to support Lock-keys.
function modifierStateGetter(keyArg) {
  /*jshint validthis:true */
  var syntheticEvent = this;
  var nativeEvent = syntheticEvent.nativeEvent;
  if (nativeEvent.getModifierState) {
    return nativeEvent.getModifierState(keyArg);
  }
  var keyProp = modifierKeyToProp[keyArg];
  return keyProp ? !!nativeEvent[keyProp] : false;
}

function getEventModifierState(nativeEvent) {
  return modifierStateGetter;
}

module.exports = getEventModifierState;

},{}],13:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getEventTarget
 * @typechecks static-only
 */

'use strict';

/**
 * Gets the target node from a native browser event by accounting for
 * inconsistencies in browser DOM APIs.
 *
 * @param {object} nativeEvent Native browser event.
 * @return {DOMEventTarget} Target node.
 */
function getEventTarget(nativeEvent) {
  var target = nativeEvent.target || nativeEvent.srcElement || window;
  // Safari may fire events on text nodes (Node.TEXT_NODE is 3).
  // @see http://www.quirksmode.org/js/events_properties.html
  return target.nodeType === 3 ? target.parentNode : target;
}

module.exports = getEventTarget;

},{}],14:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule invariant
 */

"use strict";

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function(condition, format, a, b, c, d, e, f) {
  if ("production" !== process.env.NODE_ENV) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        'Invariant Violation: ' +
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;

}).call(this,require('_process'))

},{"_process":1}],15:[function(require,module,exports){
var LedgerEditorViewController, LedgerViewerViewController, hotkey;

hotkey = require('react-hotkey');

hotkey.activate();

LedgerEditorViewController = require('./LedgerEditorViewController.cjsx');

LedgerViewerViewController = require('./LedgerViewerViewController.cjsx');

module.exports = React.createClass({displayName: "exports",
  mixins: [hotkey.Mixin('handleHotkey')],
  getInitialState: function() {
    return {
      optimizedTransactions: [],
      dateLastOptimized: null
    };
  },
  onLedgerSubmit: function(ledgerObj, completion) {
    return axios.post('/optimize', ledgerObj).then((function(_this) {
      return function(responseObj) {
        var transactions;
        transactions = responseObj.data['transactions'];
        _this.setState({
          optimizedTransactions: transactions,
          dateLastOptimized: new Date()
        });
        return completion();
      };
    })(this))["catch"]((function(_this) {
      return function(error) {
        return completion();
      };
    })(this));
  },
  handleHotkey: function(e) {
    if (e.ctrlKey) {
      switch (String.fromCharCode(e.keyCode)) {
        case 'R':
          return this.refs.ledgerEditor.onOptimize();
        case 'D':
          return this.refs.ledgerEditor.onReset();
        case 'A':
          return this.refs.ledgerEditor.onAddTransaction();
      }
    }
  },
  onAddTransaction: function() {
    return this.refs.ledgerEditor.onAddTransaction();
  },
  onReset: function() {
    return this.refs.ledgerEditor.onReset();
  },
  onOptimize: function() {
    return this.refs.ledgerEditor.onOptimize();
  },
  render: function() {
    return React.createElement("div", {
      "className": "container",
      "onKeyUp": this.onKeyUp
    }, React.createElement("div", {
      "className": "row col-sm-12"
    }, React.createElement("h2", null, "\t\t\t\t\t\tMuDelta -\n\t\t\t\t\t\t", React.createElement("small", null, " Input IOUs between people and hit Optimize to see the best way to resolve all IOUs. ")), React.createElement("p", null, "\t\t\t\t\t\tUse Enter and Backspace to easily navigate around transactions."), React.createElement("button", {
      "className": "btn btn-default",
      "onClick": this.onAddTransaction
    }, "\t\t\t\t\t\tAdd Transaction (Ctrl-A)"), React.createElement("button", {
      "className": "btn btn-default",
      "onClick": this.onReset
    }, "\t\t\t\t\t\tReset (Ctrl-D)"), React.createElement("button", {
      "className": "btn btn-primary",
      "onClick": this.onOptimize
    }, "\t\t\t\t\t\tOptimize! (Ctrl-R)"), React.createElement(LedgerEditorViewController, {
      "ref": "ledgerEditor",
      "onLedgerSubmit": this.onLedgerSubmit
    }), React.createElement(LedgerViewerViewController, {
      "transactions": this.state.optimizedTransactions,
      "dateLastOptimized": this.state.dateLastOptimized
    }), React.createElement("small", null, "\t\t\t\t\t\twritten by ", React.createElement("a", {
      "href": "https://github.com/mvanderh"
    }, "Mitchell Van Der Hoeff"))));
  }
});


},{"./LedgerEditorViewController.cjsx":16,"./LedgerViewerViewController.cjsx":19,"react-hotkey":2}],16:[function(require,module,exports){
var LedgerTransactionView;

LedgerTransactionView = require('./LedgerTransactionView.cjsx');

module.exports = React.createClass({displayName: "exports",
  getInitialState: function() {
    return {
      isOptimizing: false,
      transactions: [this.makeEmptyTransaction()]
    };
  },
  makeEmptyTransaction: function() {
    return {
      debtor: '',
      creditor: '',
      amount: ''
    };
  },
  addEmptyTransaction: function() {
    var newTransaction;
    newTransaction = this.makeEmptyTransaction();
    this.state.transactions.push(newTransaction);
    return this.setState({
      transactions: this.state.transactions
    });
  },
  removeFirstTransaction: function() {
    return this.removeTransactionAtIndex(0);
  },
  removeTransactionAtIndex: function(index) {
    if (index > 0) {
      this.transactionViewAtIndex(index - 1).focusAmountInput();
    }
    this.state.transactions.splice(index, 1);
    return this.setState({
      transactions: this.state.transactions
    });
  },
  runOptimize: function() {
    var completion;
    this.setState({
      isOptimizing: true
    });
    completion = (function(_this) {
      return function() {
        return _this.setState({
          isOptimizing: false
        });
      };
    })(this);
    return this.props.onLedgerSubmit(this.state.transactions, completion);
  },
  onAddTransaction: function() {
    return this.addEmptyTransaction();
  },
  onOptimize: function() {
    return this.runOptimize();
  },
  onReset: function() {
    return this.setState(this.getInitialState());
  },
  onTransactionAction: function(index) {
    return this.removeTransactionAtIndex(index);
  },
  onTransactionChanged: function(transaction, index) {
    this.state.transactions[index] = transaction;
    return this.setState({
      transactions: this.state.transactions
    });
  },
  onTransactionEntered: function(index) {
    var transactionView;
    if (index < this.state.transactions.length - 1) {
      transactionView = this.transactionViewAtIndex(index + 1);
      return transactionView.focusDebtorInput();
    } else {
      return this.addEmptyTransaction();
    }
  },
  onTransactionDeleted: function(index) {
    if (index > 0) {
      return this.removeTransactionAtIndex(index);
    }
  },
  keyForTransactionAtIndex: function(index) {
    return "transactionView" + index;
  },
  transactionViewAtIndex: function(index) {
    var key;
    key = this.keyForTransactionAtIndex(index);
    return this.refs[key];
  },
  render: function() {
    var transactionViews;
    transactionViews = this.state.transactions.map((function(_this) {
      return function(transaction, index) {
        return React.createElement(LedgerTransactionView, {
          "key": index,
          "ref": _this.keyForTransactionAtIndex(index),
          "transaction": transaction,
          "onAction": (function() {
            return _this.onTransactionAction(index);
          }),
          "onTransactionChanged": (function(newTx) {
            return _this.onTransactionChanged(newTx, index);
          }),
          "onTransactionEntered": (function() {
            return _this.onTransactionEntered(index);
          }),
          "onTransactionDeleted": (function() {
            return _this.onTransactionDeleted(index);
          })
        });
      };
    })(this));
    return React.createElement("div", {
      "className": "row",
      "style": {
        marginTop: '10px'
      }
    }, React.createElement("div", {
      "className": "col-sm-12 ledger-container"
    }, React.createElement("div", {
      "className": "ledger-actions"
    }, React.createElement("h4", {
      "className": "text-left"
    }, "\t\t\t\t\t\t\tLedger ", React.createElement("small", null, (this.state.isOptimizing ? "Optimizing.." : void 0)))), React.createElement("div", {
      "className": "transactions-container",
      "ref": "transactionsContainer"
    }, transactionViews)));
  }
});


},{"./LedgerTransactionView.cjsx":18}],17:[function(require,module,exports){
module.exports = React.createClass({displayName: "exports",
  onInputKeyPress: function(e) {
    if (e.key === 'Enter') {
      this.props.onDataEntered(this.props.dataKey);
      return e.preventDefault();
    } else if (e.key === 'Backspace' && e.target.value.length === 0) {
      this.props.onDataDeleted(this.props.dataKey);
      return e.preventDefault();
    }
  },
  onInputChange: function(e) {
    return this.props.onDataChanged(this.props.dataKey, e.target.value);
  },
  render: function() {
    return React.createElement("input", {
      "type": "text",
      "className": "transaction-input",
      "value": this.props.value,
      "disabled": this.props.disabled,
      "placeholder": this.props.placeholder,
      "name": this.props.dataKey,
      "onKeyUp": this.onInputKeyPress,
      "onChange": this.onInputChange
    });
  }
});


},{}],18:[function(require,module,exports){
var LedgerTransactionInput;

LedgerTransactionInput = require('./LedgerTransactionInput.cjsx');

module.exports = React.createClass({displayName: "exports",
  getDefaultProps: function() {
    return {
      "static": false
    };
  },
  componentDidMount: function() {
    return this.setState({
      transaction: this.props.transaction
    }, (function(_this) {
      return function() {
        return React.findDOMNode(_this.refs.debtorInput).focus();
      };
    })(this));
  },
  componentWillReceiveProps: function(newProps) {
    return this.setState({
      transaction: newProps.transaction
    });
  },
  onActionButtonClick: function() {
    if (this.props.onAction != null) {
      return this.props.onAction();
    }
  },
  onDataEntered: function(dataKey) {
    switch (dataKey) {
      case 'debtor':
        return this.focusCreditorInput();
      case 'creditor':
        return this.focusAmountInput();
      case 'amount':
        return this.props.onTransactionEntered();
    }
  },
  onDataChanged: function(dataKey, newValue) {
    var transaction;
    transaction = this.state.transaction;
    transaction[dataKey] = newValue;
    this.setState({
      transaction: transaction
    });
    return this.props.onTransactionChanged(this.state.transaction);
  },
  onDataDeleted: function(dataKey) {
    switch (dataKey) {
      case 'debtor':
        return this.props.onTransactionDeleted();
      case 'creditor':
        return this.focusDebtorInput();
      case 'amount':
        return this.focusCreditorInput();
    }
  },
  handleHotkey: function(e) {
    if (e.ctrlKey) {
      switch (String.fromCharCode(e.keyCode)) {
        case 'S':
          return this.props.onTransactionDeleted();
      }
    }
  },
  focusDebtorInput: function() {
    return React.findDOMNode(this.refs.debtorInput).focus();
  },
  focusCreditorInput: function() {
    return React.findDOMNode(this.refs.creditorInput).focus();
  },
  focusAmountInput: function() {
    return React.findDOMNode(this.refs.amountInput).focus();
  },
  makeTransactionInput: function(dataKey, placeholder) {
    return React.createElement(LedgerTransactionInput, {
      "ref": dataKey + "Input",
      "disabled": this.props["static"],
      "value": this.props.transaction[dataKey],
      "placeholder": placeholder,
      "dataKey": dataKey,
      "onDataChanged": this.onDataChanged,
      "onDataEntered": this.onDataEntered,
      "onDataDeleted": this.onDataDeleted
    });
  },
  render: function() {
    return React.createElement("div", null, React.createElement("a", {
      "className": "transaction-action-button",
      "onClick": this.onActionButtonClick
    }, (!this.props["static"] ? React.createElement("i", {
      "className": "glyphicon glyphicon-minus"
    }) : React.createElement("i", {
      "className": "glyphicon glyphicon-ok"
    }))), this.makeTransactionInput('debtor', 'enter name'), React.createElement("span", null, " owes "), this.makeTransactionInput('creditor', 'enter name'), React.createElement("span", null, " an amount of "), this.makeTransactionInput('amount', 'enter amount'));
  }
});


},{"./LedgerTransactionInput.cjsx":17}],19:[function(require,module,exports){
var LedgerTransactionView;

LedgerTransactionView = require('./LedgerTransactionView.cjsx');

module.exports = React.createClass({displayName: "exports",
  render: function() {
    return React.createElement("div", {
      "className": "row",
      "style": {
        marginTop: '10px'
      }
    }, React.createElement("div", {
      "className": "col-sm-12 ledger-container"
    }, React.createElement("div", {
      "className": "ledger-actions"
    }, React.createElement("h4", {
      "className": "text-left"
    }, "\t\t\t\t\t\tOptimized Ledger ", React.createElement("small", null, (this.props.dateLastOptimized != null ? moment(this.props.dateLastOptimized).calendar() : void 0)))), React.createElement("div", {
      "className": "transactions-container"
    }, this.props.transactions.map((function(_this) {
      return function(transaction, index) {
        return React.createElement(LedgerTransactionView, {
          "transaction": transaction,
          "static": true,
          "key": index
        });
      };
    })(this))), (this.props.transactions.length === 0 ? React.createElement("span", null, " No Transactions ") : void 0)));
  }
});


},{"./LedgerTransactionView.cjsx":18}],20:[function(require,module,exports){
var AppViewController;

AppViewController = require('./AppViewController.cjsx');

React.render(React.createElement(AppViewController, null), document.getElementsByTagName('body')[0]);


},{"./AppViewController.cjsx":15}]},{},[20])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy5ub2RlL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi4uLy4uLy4uLy4uLy5ub2RlL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9yZWFjdC1ob3RrZXkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcmVhY3QvbGliL0V2ZW50TGlzdGVuZXIuanMiLCJub2RlX21vZHVsZXMvcmVhY3QvbGliL09iamVjdC5hc3NpZ24uanMiLCJub2RlX21vZHVsZXMvcmVhY3QvbGliL1Bvb2xlZENsYXNzLmpzIiwibm9kZV9tb2R1bGVzL3JlYWN0L2xpYi9TeW50aGV0aWNFdmVudC5qcyIsIm5vZGVfbW9kdWxlcy9yZWFjdC9saWIvU3ludGhldGljS2V5Ym9hcmRFdmVudC5qcyIsIm5vZGVfbW9kdWxlcy9yZWFjdC9saWIvU3ludGhldGljVUlFdmVudC5qcyIsIm5vZGVfbW9kdWxlcy9yZWFjdC9saWIvZW1wdHlGdW5jdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9yZWFjdC9saWIvZ2V0RXZlbnRDaGFyQ29kZS5qcyIsIm5vZGVfbW9kdWxlcy9yZWFjdC9saWIvZ2V0RXZlbnRLZXkuanMiLCJub2RlX21vZHVsZXMvcmVhY3QvbGliL2dldEV2ZW50TW9kaWZpZXJTdGF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9yZWFjdC9saWIvZ2V0RXZlbnRUYXJnZXQuanMiLCJub2RlX21vZHVsZXMvcmVhY3QvbGliL2ludmFyaWFudC5qcyIsIi9Vc2Vycy9taXRjaC9zYngvcmVzb2x2ZV9kZWJ0cy9hcHAvc3RhdGljL3NjcmlwdHMvQXBwVmlld0NvbnRyb2xsZXIuY2pzeCIsIi9Vc2Vycy9taXRjaC9zYngvcmVzb2x2ZV9kZWJ0cy9hcHAvc3RhdGljL3NjcmlwdHMvTGVkZ2VyRWRpdG9yVmlld0NvbnRyb2xsZXIuY2pzeCIsIi9Vc2Vycy9taXRjaC9zYngvcmVzb2x2ZV9kZWJ0cy9hcHAvc3RhdGljL3NjcmlwdHMvTGVkZ2VyVHJhbnNhY3Rpb25JbnB1dC5janN4IiwiL1VzZXJzL21pdGNoL3NieC9yZXNvbHZlX2RlYnRzL2FwcC9zdGF0aWMvc2NyaXB0cy9MZWRnZXJUcmFuc2FjdGlvblZpZXcuY2pzeCIsIi9Vc2Vycy9taXRjaC9zYngvcmVzb2x2ZV9kZWJ0cy9hcHAvc3RhdGljL3NjcmlwdHMvTGVkZ2VyVmlld2VyVmlld0NvbnRyb2xsZXIuY2pzeCIsIi9Vc2Vycy9taXRjaC9zYngvcmVzb2x2ZV9kZWJ0cy9hcHAvc3RhdGljL3NjcmlwdHMvaW5kZXguY2pzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDM0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDaEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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LGFBQU4sQ0FBb0IsaUJBQXBCLEVBQXVDLElBQXZDLENBREYsRUFFRSxRQUFRLENBQUMsb0JBQVQsQ0FBOEIsTUFBOUIsQ0FBc0MsQ0FBQSxDQUFBLENBRnhDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwidmFyIEV2ZW50TGlzdGVuZXIgPSByZXF1aXJlKCdyZWFjdC9saWIvRXZlbnRMaXN0ZW5lcicpO1xudmFyIFN5bnRoZXRpY0tleWJvYXJkRXZlbnQgPSByZXF1aXJlKCdyZWFjdC9saWIvU3ludGhldGljS2V5Ym9hcmRFdmVudCcpO1xuXG52YXIgZG9jdW1lbnRMaXN0ZW5lcjtcbi8qKlxuICogRW5hYmxlIHRoZSBnbG9iYWwgZXZlbnQgbGlzdGVuZXIuIElzIGlkZW1wb3RlbnQuXG4gKi9cbmV4cG9ydHMuYWN0aXZhdGUgPSBmdW5jdGlvbihldmVudCkge1xuICAgIGlmICghZXZlbnQpIHtcbiAgICAgICAgZXZlbnQgPSAna2V5dXAnO1xuICAgIH1cbiAgICBpZiAoIWRvY3VtZW50TGlzdGVuZXIpIHtcbiAgICAgICAgZG9jdW1lbnRMaXN0ZW5lciA9IEV2ZW50TGlzdGVuZXIubGlzdGVuKGRvY3VtZW50LCBldmVudCwgaGFuZGxlKTtcbiAgICB9XG4gICAgcmV0dXJuIGV4cG9ydHM7XG59O1xuLyoqXG4gKiBEaXNhYmxlIHRoZSBnbG9iYWwgZXZlbnQgbGlzdGVuZXIuIElzIGlkZW1wb3RlbnQuXG4gKi9cbmV4cG9ydHMuZGlzYWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChkb2N1bWVudExpc3RlbmVyKSB7XG4gICAgICAgIGRvY3VtZW50TGlzdGVuZXIucmVtb3ZlKCk7XG4gICAgICAgIGRvY3VtZW50TGlzdGVuZXIgPSBudWxsO1xuICAgIH1cbn07XG5cbi8vIENvbnRhaW5lciBmb3IgYWxsIHRoZSBoYW5kbGVyc1xudmFyIGhhbmRsZXJzID0gW107XG5cbi8qKlxuICogTWl4aW4gdGhhdCBjYWxscyBgaGFuZGxlck5hbWVgIG9uIHlvdXIgY29tcG9uZW50IGlmIGl0IGlzIG1vdW50ZWQgYW5kIGFcbiAqIGtleSBldmVudCBoYXMgYnViYmxlZCB1cCB0byB0aGUgZG9jdW1lbnRcbiAqL1xuZXhwb3J0cy5NaXhpbiA9IGZ1bmN0aW9uIEhvdGtleU1peGluKGhhbmRsZXJOYW1lKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSB0aGlzW2hhbmRsZXJOYW1lXTtcbiAgICAgICAgICAgIGhhbmRsZXJzLnB1c2goaGFuZGxlcik7XG4gICAgICAgIH0sXG4gICAgICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gdGhpc1toYW5kbGVyTmFtZV07XG4gICAgICAgICAgICB2YXIgaW5kZXggPSBoYW5kbGVycy5pbmRleE9mKGhhbmRsZXIpO1xuICAgICAgICAgICAgaGFuZGxlcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgIH07XG59O1xuXG5cbi8vIENyZWF0ZSBhbmQgZGlzcGF0Y2ggYW4gZXZlbnQgb2JqZWN0IHVzaW5nIFJlYWN0J3Mgb2JqZWN0IHBvb2xcbi8vIENyaWJiZWQgZnJvbSBTaW1wbGVFdmVudFBsdWdpbiBhbmQgRXZlbnRQbHVnaW5IdWJcbmZ1bmN0aW9uIGhhbmRsZShuYXRpdmVFdmVudCkge1xuICAgIHZhciBldmVudCA9IFN5bnRoZXRpY0tleWJvYXJkRXZlbnQuZ2V0UG9vbGVkKHt9LCAnaG90a2V5JywgbmF0aXZlRXZlbnQpO1xuICAgIHRyeSB7XG4gICAgICAgIGRpc3BhdGNoRXZlbnQoZXZlbnQsIGhhbmRsZXJzKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoIWV2ZW50LmlzUGVyc2lzdGVudCgpKSB7XG4gICAgICAgICAgICBldmVudC5jb25zdHJ1Y3Rvci5yZWxlYXNlKGV2ZW50KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbi8vIERpc3BhdGNoIHRoZSBldmVudCwgaW4gb3JkZXIsIHRvIGFsbCBpbnRlcmVzdGVkIGxpc3RlbmVyc1xuLy8gVGhlIG1vc3QgcmVjZW50bHkgbW91bnRlZCBjb21wb25lbnQgaXMgdGhlIGZpcnN0IHRvIHJlY2VpdmUgdGhlIGV2ZW50XG4vLyBDcmliYmVkIGZyb20gYSBjb21iaW5hdGlvbiBvZiBTaW1wbGVFdmVudFBsdWdpbiBhbmQgRXZlbnRQbHVnaW5VdGlsc1xuZnVuY3Rpb24gZGlzcGF0Y2hFdmVudChldmVudCwgaGFuZGxlcnMpIHtcbiAgICBmb3IgKHZhciBpID0gKGhhbmRsZXJzLmxlbmd0aCAtIDEpOyBpID49IDA7IGktLSkge1xuICAgICAgICBpZiAoZXZlbnQuaXNQcm9wYWdhdGlvblN0b3BwZWQoKSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJldHVyblZhbHVlID0gaGFuZGxlcnNbaV0oZXZlbnQpO1xuICAgICAgICBpZiAocmV0dXJuVmFsdWUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvKipcbiAqIENvcHlyaWdodCAyMDEzLTIwMTUsIEZhY2Vib29rLCBJbmMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKlxuICogQHByb3ZpZGVzTW9kdWxlIEV2ZW50TGlzdGVuZXJcbiAqIEB0eXBlY2hlY2tzXG4gKi9cblxudmFyIGVtcHR5RnVuY3Rpb24gPSByZXF1aXJlKFwiLi9lbXB0eUZ1bmN0aW9uXCIpO1xuXG4vKipcbiAqIFVwc3RyZWFtIHZlcnNpb24gb2YgZXZlbnQgbGlzdGVuZXIuIERvZXMgbm90IHRha2UgaW50byBhY2NvdW50IHNwZWNpZmljXG4gKiBuYXR1cmUgb2YgcGxhdGZvcm0uXG4gKi9cbnZhciBFdmVudExpc3RlbmVyID0ge1xuICAvKipcbiAgICogTGlzdGVuIHRvIERPTSBldmVudHMgZHVyaW5nIHRoZSBidWJibGUgcGhhc2UuXG4gICAqXG4gICAqIEBwYXJhbSB7RE9NRXZlbnRUYXJnZXR9IHRhcmdldCBET00gZWxlbWVudCB0byByZWdpc3RlciBsaXN0ZW5lciBvbi5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50VHlwZSBFdmVudCB0eXBlLCBlLmcuICdjbGljaycgb3IgJ21vdXNlb3ZlcicuXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIENhbGxiYWNrIGZ1bmN0aW9uLlxuICAgKiBAcmV0dXJuIHtvYmplY3R9IE9iamVjdCB3aXRoIGEgYHJlbW92ZWAgbWV0aG9kLlxuICAgKi9cbiAgbGlzdGVuOiBmdW5jdGlvbih0YXJnZXQsIGV2ZW50VHlwZSwgY2FsbGJhY2spIHtcbiAgICBpZiAodGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgY2FsbGJhY2ssIGZhbHNlKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBjYWxsYmFjaywgZmFsc2UpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAodGFyZ2V0LmF0dGFjaEV2ZW50KSB7XG4gICAgICB0YXJnZXQuYXR0YWNoRXZlbnQoJ29uJyArIGV2ZW50VHlwZSwgY2FsbGJhY2spO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB0YXJnZXQuZGV0YWNoRXZlbnQoJ29uJyArIGV2ZW50VHlwZSwgY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogTGlzdGVuIHRvIERPTSBldmVudHMgZHVyaW5nIHRoZSBjYXB0dXJlIHBoYXNlLlxuICAgKlxuICAgKiBAcGFyYW0ge0RPTUV2ZW50VGFyZ2V0fSB0YXJnZXQgRE9NIGVsZW1lbnQgdG8gcmVnaXN0ZXIgbGlzdGVuZXIgb24uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudFR5cGUgRXZlbnQgdHlwZSwgZS5nLiAnY2xpY2snIG9yICdtb3VzZW92ZXInLlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBDYWxsYmFjayBmdW5jdGlvbi5cbiAgICogQHJldHVybiB7b2JqZWN0fSBPYmplY3Qgd2l0aCBhIGByZW1vdmVgIG1ldGhvZC5cbiAgICovXG4gIGNhcHR1cmU6IGZ1bmN0aW9uKHRhcmdldCwgZXZlbnRUeXBlLCBjYWxsYmFjaykge1xuICAgIGlmICghdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgIGlmIChcInByb2R1Y3Rpb25cIiAhPT0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICAnQXR0ZW1wdGVkIHRvIGxpc3RlbiB0byBldmVudHMgZHVyaW5nIHRoZSBjYXB0dXJlIHBoYXNlIG9uIGEgJyArXG4gICAgICAgICAgJ2Jyb3dzZXIgdGhhdCBkb2VzIG5vdCBzdXBwb3J0IHRoZSBjYXB0dXJlIHBoYXNlLiBZb3VyIGFwcGxpY2F0aW9uICcgK1xuICAgICAgICAgICd3aWxsIG5vdCByZWNlaXZlIHNvbWUgZXZlbnRzLidcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJlbW92ZTogZW1wdHlGdW5jdGlvblxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBjYWxsYmFjaywgdHJ1ZSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgY2FsbGJhY2ssIHRydWUpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cbiAgfSxcblxuICByZWdpc3RlckRlZmF1bHQ6IGZ1bmN0aW9uKCkge31cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRMaXN0ZW5lcjtcbiIsIi8qKlxuICogQ29weXJpZ2h0IDIwMTQtMjAxNSwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgQlNELXN0eWxlIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuIEFuIGFkZGl0aW9uYWwgZ3JhbnRcbiAqIG9mIHBhdGVudCByaWdodHMgY2FuIGJlIGZvdW5kIGluIHRoZSBQQVRFTlRTIGZpbGUgaW4gdGhlIHNhbWUgZGlyZWN0b3J5LlxuICpcbiAqIEBwcm92aWRlc01vZHVsZSBPYmplY3QuYXNzaWduXG4gKi9cblxuLy8gaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLW9iamVjdC5hc3NpZ25cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBhc3NpZ24odGFyZ2V0LCBzb3VyY2VzKSB7XG4gIGlmICh0YXJnZXQgPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ09iamVjdC5hc3NpZ24gdGFyZ2V0IGNhbm5vdCBiZSBudWxsIG9yIHVuZGVmaW5lZCcpO1xuICB9XG5cbiAgdmFyIHRvID0gT2JqZWN0KHRhcmdldCk7XG4gIHZhciBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbiAgZm9yICh2YXIgbmV4dEluZGV4ID0gMTsgbmV4dEluZGV4IDwgYXJndW1lbnRzLmxlbmd0aDsgbmV4dEluZGV4KyspIHtcbiAgICB2YXIgbmV4dFNvdXJjZSA9IGFyZ3VtZW50c1tuZXh0SW5kZXhdO1xuICAgIGlmIChuZXh0U291cmNlID09IG51bGwpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHZhciBmcm9tID0gT2JqZWN0KG5leHRTb3VyY2UpO1xuXG4gICAgLy8gV2UgZG9uJ3QgY3VycmVudGx5IHN1cHBvcnQgYWNjZXNzb3JzIG5vciBwcm94aWVzLiBUaGVyZWZvcmUgdGhpc1xuICAgIC8vIGNvcHkgY2Fubm90IHRocm93LiBJZiB3ZSBldmVyIHN1cHBvcnRlZCB0aGlzIHRoZW4gd2UgbXVzdCBoYW5kbGVcbiAgICAvLyBleGNlcHRpb25zIGFuZCBzaWRlLWVmZmVjdHMuIFdlIGRvbid0IHN1cHBvcnQgc3ltYm9scyBzbyB0aGV5IHdvbid0XG4gICAgLy8gYmUgdHJhbnNmZXJyZWQuXG5cbiAgICBmb3IgKHZhciBrZXkgaW4gZnJvbSkge1xuICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwoZnJvbSwga2V5KSkge1xuICAgICAgICB0b1trZXldID0gZnJvbVtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0bztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhc3NpZ247XG4iLCIvKipcbiAqIENvcHlyaWdodCAyMDEzLTIwMTUsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4gKiBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqXG4gKiBAcHJvdmlkZXNNb2R1bGUgUG9vbGVkQ2xhc3NcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBpbnZhcmlhbnQgPSByZXF1aXJlKFwiLi9pbnZhcmlhbnRcIik7XG5cbi8qKlxuICogU3RhdGljIHBvb2xlcnMuIFNldmVyYWwgY3VzdG9tIHZlcnNpb25zIGZvciBlYWNoIHBvdGVudGlhbCBudW1iZXIgb2ZcbiAqIGFyZ3VtZW50cy4gQSBjb21wbGV0ZWx5IGdlbmVyaWMgcG9vbGVyIGlzIGVhc3kgdG8gaW1wbGVtZW50LCBidXQgd291bGRcbiAqIHJlcXVpcmUgYWNjZXNzaW5nIHRoZSBgYXJndW1lbnRzYCBvYmplY3QuIEluIGVhY2ggb2YgdGhlc2UsIGB0aGlzYCByZWZlcnMgdG9cbiAqIHRoZSBDbGFzcyBpdHNlbGYsIG5vdCBhbiBpbnN0YW5jZS4gSWYgYW55IG90aGVycyBhcmUgbmVlZGVkLCBzaW1wbHkgYWRkIHRoZW1cbiAqIGhlcmUsIG9yIGluIHRoZWlyIG93biBmaWxlcy5cbiAqL1xudmFyIG9uZUFyZ3VtZW50UG9vbGVyID0gZnVuY3Rpb24oY29weUZpZWxkc0Zyb20pIHtcbiAgdmFyIEtsYXNzID0gdGhpcztcbiAgaWYgKEtsYXNzLmluc3RhbmNlUG9vbC5sZW5ndGgpIHtcbiAgICB2YXIgaW5zdGFuY2UgPSBLbGFzcy5pbnN0YW5jZVBvb2wucG9wKCk7XG4gICAgS2xhc3MuY2FsbChpbnN0YW5jZSwgY29weUZpZWxkc0Zyb20pO1xuICAgIHJldHVybiBpbnN0YW5jZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbmV3IEtsYXNzKGNvcHlGaWVsZHNGcm9tKTtcbiAgfVxufTtcblxudmFyIHR3b0FyZ3VtZW50UG9vbGVyID0gZnVuY3Rpb24oYTEsIGEyKSB7XG4gIHZhciBLbGFzcyA9IHRoaXM7XG4gIGlmIChLbGFzcy5pbnN0YW5jZVBvb2wubGVuZ3RoKSB7XG4gICAgdmFyIGluc3RhbmNlID0gS2xhc3MuaW5zdGFuY2VQb29sLnBvcCgpO1xuICAgIEtsYXNzLmNhbGwoaW5zdGFuY2UsIGExLCBhMik7XG4gICAgcmV0dXJuIGluc3RhbmNlO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBuZXcgS2xhc3MoYTEsIGEyKTtcbiAgfVxufTtcblxudmFyIHRocmVlQXJndW1lbnRQb29sZXIgPSBmdW5jdGlvbihhMSwgYTIsIGEzKSB7XG4gIHZhciBLbGFzcyA9IHRoaXM7XG4gIGlmIChLbGFzcy5pbnN0YW5jZVBvb2wubGVuZ3RoKSB7XG4gICAgdmFyIGluc3RhbmNlID0gS2xhc3MuaW5zdGFuY2VQb29sLnBvcCgpO1xuICAgIEtsYXNzLmNhbGwoaW5zdGFuY2UsIGExLCBhMiwgYTMpO1xuICAgIHJldHVybiBpbnN0YW5jZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbmV3IEtsYXNzKGExLCBhMiwgYTMpO1xuICB9XG59O1xuXG52YXIgZml2ZUFyZ3VtZW50UG9vbGVyID0gZnVuY3Rpb24oYTEsIGEyLCBhMywgYTQsIGE1KSB7XG4gIHZhciBLbGFzcyA9IHRoaXM7XG4gIGlmIChLbGFzcy5pbnN0YW5jZVBvb2wubGVuZ3RoKSB7XG4gICAgdmFyIGluc3RhbmNlID0gS2xhc3MuaW5zdGFuY2VQb29sLnBvcCgpO1xuICAgIEtsYXNzLmNhbGwoaW5zdGFuY2UsIGExLCBhMiwgYTMsIGE0LCBhNSk7XG4gICAgcmV0dXJuIGluc3RhbmNlO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBuZXcgS2xhc3MoYTEsIGEyLCBhMywgYTQsIGE1KTtcbiAgfVxufTtcblxudmFyIHN0YW5kYXJkUmVsZWFzZXIgPSBmdW5jdGlvbihpbnN0YW5jZSkge1xuICB2YXIgS2xhc3MgPSB0aGlzO1xuICAoXCJwcm9kdWN0aW9uXCIgIT09IHByb2Nlc3MuZW52Lk5PREVfRU5WID8gaW52YXJpYW50KFxuICAgIGluc3RhbmNlIGluc3RhbmNlb2YgS2xhc3MsXG4gICAgJ1RyeWluZyB0byByZWxlYXNlIGFuIGluc3RhbmNlIGludG8gYSBwb29sIG9mIGEgZGlmZmVyZW50IHR5cGUuJ1xuICApIDogaW52YXJpYW50KGluc3RhbmNlIGluc3RhbmNlb2YgS2xhc3MpKTtcbiAgaWYgKGluc3RhbmNlLmRlc3RydWN0b3IpIHtcbiAgICBpbnN0YW5jZS5kZXN0cnVjdG9yKCk7XG4gIH1cbiAgaWYgKEtsYXNzLmluc3RhbmNlUG9vbC5sZW5ndGggPCBLbGFzcy5wb29sU2l6ZSkge1xuICAgIEtsYXNzLmluc3RhbmNlUG9vbC5wdXNoKGluc3RhbmNlKTtcbiAgfVxufTtcblxudmFyIERFRkFVTFRfUE9PTF9TSVpFID0gMTA7XG52YXIgREVGQVVMVF9QT09MRVIgPSBvbmVBcmd1bWVudFBvb2xlcjtcblxuLyoqXG4gKiBBdWdtZW50cyBgQ29weUNvbnN0cnVjdG9yYCB0byBiZSBhIHBvb2xhYmxlIGNsYXNzLCBhdWdtZW50aW5nIG9ubHkgdGhlIGNsYXNzXG4gKiBpdHNlbGYgKHN0YXRpY2FsbHkpIG5vdCBhZGRpbmcgYW55IHByb3RvdHlwaWNhbCBmaWVsZHMuIEFueSBDb3B5Q29uc3RydWN0b3JcbiAqIHlvdSBnaXZlIHRoaXMgbWF5IGhhdmUgYSBgcG9vbFNpemVgIHByb3BlcnR5LCBhbmQgd2lsbCBsb29rIGZvciBhXG4gKiBwcm90b3R5cGljYWwgYGRlc3RydWN0b3JgIG9uIGluc3RhbmNlcyAob3B0aW9uYWwpLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IENvcHlDb25zdHJ1Y3RvciBDb25zdHJ1Y3RvciB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlc2V0LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcG9vbGVyIEN1c3RvbWl6YWJsZSBwb29sZXIuXG4gKi9cbnZhciBhZGRQb29saW5nVG8gPSBmdW5jdGlvbihDb3B5Q29uc3RydWN0b3IsIHBvb2xlcikge1xuICB2YXIgTmV3S2xhc3MgPSBDb3B5Q29uc3RydWN0b3I7XG4gIE5ld0tsYXNzLmluc3RhbmNlUG9vbCA9IFtdO1xuICBOZXdLbGFzcy5nZXRQb29sZWQgPSBwb29sZXIgfHwgREVGQVVMVF9QT09MRVI7XG4gIGlmICghTmV3S2xhc3MucG9vbFNpemUpIHtcbiAgICBOZXdLbGFzcy5wb29sU2l6ZSA9IERFRkFVTFRfUE9PTF9TSVpFO1xuICB9XG4gIE5ld0tsYXNzLnJlbGVhc2UgPSBzdGFuZGFyZFJlbGVhc2VyO1xuICByZXR1cm4gTmV3S2xhc3M7XG59O1xuXG52YXIgUG9vbGVkQ2xhc3MgPSB7XG4gIGFkZFBvb2xpbmdUbzogYWRkUG9vbGluZ1RvLFxuICBvbmVBcmd1bWVudFBvb2xlcjogb25lQXJndW1lbnRQb29sZXIsXG4gIHR3b0FyZ3VtZW50UG9vbGVyOiB0d29Bcmd1bWVudFBvb2xlcixcbiAgdGhyZWVBcmd1bWVudFBvb2xlcjogdGhyZWVBcmd1bWVudFBvb2xlcixcbiAgZml2ZUFyZ3VtZW50UG9vbGVyOiBmaXZlQXJndW1lbnRQb29sZXJcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUG9vbGVkQ2xhc3M7XG4iLCIvKipcbiAqIENvcHlyaWdodCAyMDEzLTIwMTUsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4gKiBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqXG4gKiBAcHJvdmlkZXNNb2R1bGUgU3ludGhldGljRXZlbnRcbiAqIEB0eXBlY2hlY2tzIHN0YXRpYy1vbmx5XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUG9vbGVkQ2xhc3MgPSByZXF1aXJlKFwiLi9Qb29sZWRDbGFzc1wiKTtcblxudmFyIGFzc2lnbiA9IHJlcXVpcmUoXCIuL09iamVjdC5hc3NpZ25cIik7XG52YXIgZW1wdHlGdW5jdGlvbiA9IHJlcXVpcmUoXCIuL2VtcHR5RnVuY3Rpb25cIik7XG52YXIgZ2V0RXZlbnRUYXJnZXQgPSByZXF1aXJlKFwiLi9nZXRFdmVudFRhcmdldFwiKTtcblxuLyoqXG4gKiBAaW50ZXJmYWNlIEV2ZW50XG4gKiBAc2VlIGh0dHA6Ly93d3cudzMub3JnL1RSL0RPTS1MZXZlbC0zLUV2ZW50cy9cbiAqL1xudmFyIEV2ZW50SW50ZXJmYWNlID0ge1xuICB0eXBlOiBudWxsLFxuICB0YXJnZXQ6IGdldEV2ZW50VGFyZ2V0LFxuICAvLyBjdXJyZW50VGFyZ2V0IGlzIHNldCB3aGVuIGRpc3BhdGNoaW5nOyBubyB1c2UgaW4gY29weWluZyBpdCBoZXJlXG4gIGN1cnJlbnRUYXJnZXQ6IGVtcHR5RnVuY3Rpb24udGhhdFJldHVybnNOdWxsLFxuICBldmVudFBoYXNlOiBudWxsLFxuICBidWJibGVzOiBudWxsLFxuICBjYW5jZWxhYmxlOiBudWxsLFxuICB0aW1lU3RhbXA6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgcmV0dXJuIGV2ZW50LnRpbWVTdGFtcCB8fCBEYXRlLm5vdygpO1xuICB9LFxuICBkZWZhdWx0UHJldmVudGVkOiBudWxsLFxuICBpc1RydXN0ZWQ6IG51bGxcbn07XG5cbi8qKlxuICogU3ludGhldGljIGV2ZW50cyBhcmUgZGlzcGF0Y2hlZCBieSBldmVudCBwbHVnaW5zLCB0eXBpY2FsbHkgaW4gcmVzcG9uc2UgdG8gYVxuICogdG9wLWxldmVsIGV2ZW50IGRlbGVnYXRpb24gaGFuZGxlci5cbiAqXG4gKiBUaGVzZSBzeXN0ZW1zIHNob3VsZCBnZW5lcmFsbHkgdXNlIHBvb2xpbmcgdG8gcmVkdWNlIHRoZSBmcmVxdWVuY3kgb2YgZ2FyYmFnZVxuICogY29sbGVjdGlvbi4gVGhlIHN5c3RlbSBzaG91bGQgY2hlY2sgYGlzUGVyc2lzdGVudGAgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhlXG4gKiBldmVudCBzaG91bGQgYmUgcmVsZWFzZWQgaW50byB0aGUgcG9vbCBhZnRlciBiZWluZyBkaXNwYXRjaGVkLiBVc2VycyB0aGF0XG4gKiBuZWVkIGEgcGVyc2lzdGVkIGV2ZW50IHNob3VsZCBpbnZva2UgYHBlcnNpc3RgLlxuICpcbiAqIFN5bnRoZXRpYyBldmVudHMgKGFuZCBzdWJjbGFzc2VzKSBpbXBsZW1lbnQgdGhlIERPTSBMZXZlbCAzIEV2ZW50cyBBUEkgYnlcbiAqIG5vcm1hbGl6aW5nIGJyb3dzZXIgcXVpcmtzLiBTdWJjbGFzc2VzIGRvIG5vdCBuZWNlc3NhcmlseSBoYXZlIHRvIGltcGxlbWVudCBhXG4gKiBET00gaW50ZXJmYWNlOyBjdXN0b20gYXBwbGljYXRpb24tc3BlY2lmaWMgZXZlbnRzIGNhbiBhbHNvIHN1YmNsYXNzIHRoaXMuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGRpc3BhdGNoQ29uZmlnIENvbmZpZ3VyYXRpb24gdXNlZCB0byBkaXNwYXRjaCB0aGlzIGV2ZW50LlxuICogQHBhcmFtIHtzdHJpbmd9IGRpc3BhdGNoTWFya2VyIE1hcmtlciBpZGVudGlmeWluZyB0aGUgZXZlbnQgdGFyZ2V0LlxuICogQHBhcmFtIHtvYmplY3R9IG5hdGl2ZUV2ZW50IE5hdGl2ZSBicm93c2VyIGV2ZW50LlxuICovXG5mdW5jdGlvbiBTeW50aGV0aWNFdmVudChkaXNwYXRjaENvbmZpZywgZGlzcGF0Y2hNYXJrZXIsIG5hdGl2ZUV2ZW50KSB7XG4gIHRoaXMuZGlzcGF0Y2hDb25maWcgPSBkaXNwYXRjaENvbmZpZztcbiAgdGhpcy5kaXNwYXRjaE1hcmtlciA9IGRpc3BhdGNoTWFya2VyO1xuICB0aGlzLm5hdGl2ZUV2ZW50ID0gbmF0aXZlRXZlbnQ7XG5cbiAgdmFyIEludGVyZmFjZSA9IHRoaXMuY29uc3RydWN0b3IuSW50ZXJmYWNlO1xuICBmb3IgKHZhciBwcm9wTmFtZSBpbiBJbnRlcmZhY2UpIHtcbiAgICBpZiAoIUludGVyZmFjZS5oYXNPd25Qcm9wZXJ0eShwcm9wTmFtZSkpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICB2YXIgbm9ybWFsaXplID0gSW50ZXJmYWNlW3Byb3BOYW1lXTtcbiAgICBpZiAobm9ybWFsaXplKSB7XG4gICAgICB0aGlzW3Byb3BOYW1lXSA9IG5vcm1hbGl6ZShuYXRpdmVFdmVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbcHJvcE5hbWVdID0gbmF0aXZlRXZlbnRbcHJvcE5hbWVdO1xuICAgIH1cbiAgfVxuXG4gIHZhciBkZWZhdWx0UHJldmVudGVkID0gbmF0aXZlRXZlbnQuZGVmYXVsdFByZXZlbnRlZCAhPSBudWxsID9cbiAgICBuYXRpdmVFdmVudC5kZWZhdWx0UHJldmVudGVkIDpcbiAgICBuYXRpdmVFdmVudC5yZXR1cm5WYWx1ZSA9PT0gZmFsc2U7XG4gIGlmIChkZWZhdWx0UHJldmVudGVkKSB7XG4gICAgdGhpcy5pc0RlZmF1bHRQcmV2ZW50ZWQgPSBlbXB0eUZ1bmN0aW9uLnRoYXRSZXR1cm5zVHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmlzRGVmYXVsdFByZXZlbnRlZCA9IGVtcHR5RnVuY3Rpb24udGhhdFJldHVybnNGYWxzZTtcbiAgfVxuICB0aGlzLmlzUHJvcGFnYXRpb25TdG9wcGVkID0gZW1wdHlGdW5jdGlvbi50aGF0UmV0dXJuc0ZhbHNlO1xufVxuXG5hc3NpZ24oU3ludGhldGljRXZlbnQucHJvdG90eXBlLCB7XG5cbiAgcHJldmVudERlZmF1bHQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZGVmYXVsdFByZXZlbnRlZCA9IHRydWU7XG4gICAgdmFyIGV2ZW50ID0gdGhpcy5uYXRpdmVFdmVudDtcbiAgICBpZiAoZXZlbnQucHJldmVudERlZmF1bHQpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7XG4gICAgfVxuICAgIHRoaXMuaXNEZWZhdWx0UHJldmVudGVkID0gZW1wdHlGdW5jdGlvbi50aGF0UmV0dXJuc1RydWU7XG4gIH0sXG5cbiAgc3RvcFByb3BhZ2F0aW9uOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgZXZlbnQgPSB0aGlzLm5hdGl2ZUV2ZW50O1xuICAgIGlmIChldmVudC5zdG9wUHJvcGFnYXRpb24pIHtcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH0gZWxzZSB7XG4gICAgICBldmVudC5jYW5jZWxCdWJibGUgPSB0cnVlO1xuICAgIH1cbiAgICB0aGlzLmlzUHJvcGFnYXRpb25TdG9wcGVkID0gZW1wdHlGdW5jdGlvbi50aGF0UmV0dXJuc1RydWU7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFdlIHJlbGVhc2UgYWxsIGRpc3BhdGNoZWQgYFN5bnRoZXRpY0V2ZW50YHMgYWZ0ZXIgZWFjaCBldmVudCBsb29wLCBhZGRpbmdcbiAgICogdGhlbSBiYWNrIGludG8gdGhlIHBvb2wuIFRoaXMgYWxsb3dzIGEgd2F5IHRvIGhvbGQgb250byBhIHJlZmVyZW5jZSB0aGF0XG4gICAqIHdvbid0IGJlIGFkZGVkIGJhY2sgaW50byB0aGUgcG9vbC5cbiAgICovXG4gIHBlcnNpc3Q6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaXNQZXJzaXN0ZW50ID0gZW1wdHlGdW5jdGlvbi50aGF0UmV0dXJuc1RydWU7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGlzIGV2ZW50IHNob3VsZCBiZSByZWxlYXNlZCBiYWNrIGludG8gdGhlIHBvb2wuXG4gICAqXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdGhpcyBzaG91bGQgbm90IGJlIHJlbGVhc2VkLCBmYWxzZSBvdGhlcndpc2UuXG4gICAqL1xuICBpc1BlcnNpc3RlbnQ6IGVtcHR5RnVuY3Rpb24udGhhdFJldHVybnNGYWxzZSxcblxuICAvKipcbiAgICogYFBvb2xlZENsYXNzYCBsb29rcyBmb3IgYGRlc3RydWN0b3JgIG9uIGVhY2ggaW5zdGFuY2UgaXQgcmVsZWFzZXMuXG4gICAqL1xuICBkZXN0cnVjdG9yOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgSW50ZXJmYWNlID0gdGhpcy5jb25zdHJ1Y3Rvci5JbnRlcmZhY2U7XG4gICAgZm9yICh2YXIgcHJvcE5hbWUgaW4gSW50ZXJmYWNlKSB7XG4gICAgICB0aGlzW3Byb3BOYW1lXSA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuZGlzcGF0Y2hDb25maWcgPSBudWxsO1xuICAgIHRoaXMuZGlzcGF0Y2hNYXJrZXIgPSBudWxsO1xuICAgIHRoaXMubmF0aXZlRXZlbnQgPSBudWxsO1xuICB9XG5cbn0pO1xuXG5TeW50aGV0aWNFdmVudC5JbnRlcmZhY2UgPSBFdmVudEludGVyZmFjZTtcblxuLyoqXG4gKiBIZWxwZXIgdG8gcmVkdWNlIGJvaWxlcnBsYXRlIHdoZW4gY3JlYXRpbmcgc3ViY2xhc3Nlcy5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBDbGFzc1xuICogQHBhcmFtIHs/b2JqZWN0fSBJbnRlcmZhY2VcbiAqL1xuU3ludGhldGljRXZlbnQuYXVnbWVudENsYXNzID0gZnVuY3Rpb24oQ2xhc3MsIEludGVyZmFjZSkge1xuICB2YXIgU3VwZXIgPSB0aGlzO1xuXG4gIHZhciBwcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFN1cGVyLnByb3RvdHlwZSk7XG4gIGFzc2lnbihwcm90b3R5cGUsIENsYXNzLnByb3RvdHlwZSk7XG4gIENsYXNzLnByb3RvdHlwZSA9IHByb3RvdHlwZTtcbiAgQ2xhc3MucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ2xhc3M7XG5cbiAgQ2xhc3MuSW50ZXJmYWNlID0gYXNzaWduKHt9LCBTdXBlci5JbnRlcmZhY2UsIEludGVyZmFjZSk7XG4gIENsYXNzLmF1Z21lbnRDbGFzcyA9IFN1cGVyLmF1Z21lbnRDbGFzcztcblxuICBQb29sZWRDbGFzcy5hZGRQb29saW5nVG8oQ2xhc3MsIFBvb2xlZENsYXNzLnRocmVlQXJndW1lbnRQb29sZXIpO1xufTtcblxuUG9vbGVkQ2xhc3MuYWRkUG9vbGluZ1RvKFN5bnRoZXRpY0V2ZW50LCBQb29sZWRDbGFzcy50aHJlZUFyZ3VtZW50UG9vbGVyKTtcblxubW9kdWxlLmV4cG9ydHMgPSBTeW50aGV0aWNFdmVudDtcbiIsIi8qKlxuICogQ29weXJpZ2h0IDIwMTMtMjAxNSwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgQlNELXN0eWxlIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuIEFuIGFkZGl0aW9uYWwgZ3JhbnRcbiAqIG9mIHBhdGVudCByaWdodHMgY2FuIGJlIGZvdW5kIGluIHRoZSBQQVRFTlRTIGZpbGUgaW4gdGhlIHNhbWUgZGlyZWN0b3J5LlxuICpcbiAqIEBwcm92aWRlc01vZHVsZSBTeW50aGV0aWNLZXlib2FyZEV2ZW50XG4gKiBAdHlwZWNoZWNrcyBzdGF0aWMtb25seVxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFN5bnRoZXRpY1VJRXZlbnQgPSByZXF1aXJlKFwiLi9TeW50aGV0aWNVSUV2ZW50XCIpO1xuXG52YXIgZ2V0RXZlbnRDaGFyQ29kZSA9IHJlcXVpcmUoXCIuL2dldEV2ZW50Q2hhckNvZGVcIik7XG52YXIgZ2V0RXZlbnRLZXkgPSByZXF1aXJlKFwiLi9nZXRFdmVudEtleVwiKTtcbnZhciBnZXRFdmVudE1vZGlmaWVyU3RhdGUgPSByZXF1aXJlKFwiLi9nZXRFdmVudE1vZGlmaWVyU3RhdGVcIik7XG5cbi8qKlxuICogQGludGVyZmFjZSBLZXlib2FyZEV2ZW50XG4gKiBAc2VlIGh0dHA6Ly93d3cudzMub3JnL1RSL0RPTS1MZXZlbC0zLUV2ZW50cy9cbiAqL1xudmFyIEtleWJvYXJkRXZlbnRJbnRlcmZhY2UgPSB7XG4gIGtleTogZ2V0RXZlbnRLZXksXG4gIGxvY2F0aW9uOiBudWxsLFxuICBjdHJsS2V5OiBudWxsLFxuICBzaGlmdEtleTogbnVsbCxcbiAgYWx0S2V5OiBudWxsLFxuICBtZXRhS2V5OiBudWxsLFxuICByZXBlYXQ6IG51bGwsXG4gIGxvY2FsZTogbnVsbCxcbiAgZ2V0TW9kaWZpZXJTdGF0ZTogZ2V0RXZlbnRNb2RpZmllclN0YXRlLFxuICAvLyBMZWdhY3kgSW50ZXJmYWNlXG4gIGNoYXJDb2RlOiBmdW5jdGlvbihldmVudCkge1xuICAgIC8vIGBjaGFyQ29kZWAgaXMgdGhlIHJlc3VsdCBvZiBhIEtleVByZXNzIGV2ZW50IGFuZCByZXByZXNlbnRzIHRoZSB2YWx1ZSBvZlxuICAgIC8vIHRoZSBhY3R1YWwgcHJpbnRhYmxlIGNoYXJhY3Rlci5cblxuICAgIC8vIEtleVByZXNzIGlzIGRlcHJlY2F0ZWQsIGJ1dCBpdHMgcmVwbGFjZW1lbnQgaXMgbm90IHlldCBmaW5hbCBhbmQgbm90XG4gICAgLy8gaW1wbGVtZW50ZWQgaW4gYW55IG1ham9yIGJyb3dzZXIuIE9ubHkgS2V5UHJlc3MgaGFzIGNoYXJDb2RlLlxuICAgIGlmIChldmVudC50eXBlID09PSAna2V5cHJlc3MnKSB7XG4gICAgICByZXR1cm4gZ2V0RXZlbnRDaGFyQ29kZShldmVudCk7XG4gICAgfVxuICAgIHJldHVybiAwO1xuICB9LFxuICBrZXlDb2RlOiBmdW5jdGlvbihldmVudCkge1xuICAgIC8vIGBrZXlDb2RlYCBpcyB0aGUgcmVzdWx0IG9mIGEgS2V5RG93bi9VcCBldmVudCBhbmQgcmVwcmVzZW50cyB0aGUgdmFsdWUgb2ZcbiAgICAvLyBwaHlzaWNhbCBrZXlib2FyZCBrZXkuXG5cbiAgICAvLyBUaGUgYWN0dWFsIG1lYW5pbmcgb2YgdGhlIHZhbHVlIGRlcGVuZHMgb24gdGhlIHVzZXJzJyBrZXlib2FyZCBsYXlvdXRcbiAgICAvLyB3aGljaCBjYW5ub3QgYmUgZGV0ZWN0ZWQuIEFzc3VtaW5nIHRoYXQgaXQgaXMgYSBVUyBrZXlib2FyZCBsYXlvdXRcbiAgICAvLyBwcm92aWRlcyBhIHN1cnByaXNpbmdseSBhY2N1cmF0ZSBtYXBwaW5nIGZvciBVUyBhbmQgRXVyb3BlYW4gdXNlcnMuXG4gICAgLy8gRHVlIHRvIHRoaXMsIGl0IGlzIGxlZnQgdG8gdGhlIHVzZXIgdG8gaW1wbGVtZW50IGF0IHRoaXMgdGltZS5cbiAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ2tleWRvd24nIHx8IGV2ZW50LnR5cGUgPT09ICdrZXl1cCcpIHtcbiAgICAgIHJldHVybiBldmVudC5rZXlDb2RlO1xuICAgIH1cbiAgICByZXR1cm4gMDtcbiAgfSxcbiAgd2hpY2g6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgLy8gYHdoaWNoYCBpcyBhbiBhbGlhcyBmb3IgZWl0aGVyIGBrZXlDb2RlYCBvciBgY2hhckNvZGVgIGRlcGVuZGluZyBvbiB0aGVcbiAgICAvLyB0eXBlIG9mIHRoZSBldmVudC5cbiAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ2tleXByZXNzJykge1xuICAgICAgcmV0dXJuIGdldEV2ZW50Q2hhckNvZGUoZXZlbnQpO1xuICAgIH1cbiAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ2tleWRvd24nIHx8IGV2ZW50LnR5cGUgPT09ICdrZXl1cCcpIHtcbiAgICAgIHJldHVybiBldmVudC5rZXlDb2RlO1xuICAgIH1cbiAgICByZXR1cm4gMDtcbiAgfVxufTtcblxuLyoqXG4gKiBAcGFyYW0ge29iamVjdH0gZGlzcGF0Y2hDb25maWcgQ29uZmlndXJhdGlvbiB1c2VkIHRvIGRpc3BhdGNoIHRoaXMgZXZlbnQuXG4gKiBAcGFyYW0ge3N0cmluZ30gZGlzcGF0Y2hNYXJrZXIgTWFya2VyIGlkZW50aWZ5aW5nIHRoZSBldmVudCB0YXJnZXQuXG4gKiBAcGFyYW0ge29iamVjdH0gbmF0aXZlRXZlbnQgTmF0aXZlIGJyb3dzZXIgZXZlbnQuXG4gKiBAZXh0ZW5kcyB7U3ludGhldGljVUlFdmVudH1cbiAqL1xuZnVuY3Rpb24gU3ludGhldGljS2V5Ym9hcmRFdmVudChkaXNwYXRjaENvbmZpZywgZGlzcGF0Y2hNYXJrZXIsIG5hdGl2ZUV2ZW50KSB7XG4gIFN5bnRoZXRpY1VJRXZlbnQuY2FsbCh0aGlzLCBkaXNwYXRjaENvbmZpZywgZGlzcGF0Y2hNYXJrZXIsIG5hdGl2ZUV2ZW50KTtcbn1cblxuU3ludGhldGljVUlFdmVudC5hdWdtZW50Q2xhc3MoU3ludGhldGljS2V5Ym9hcmRFdmVudCwgS2V5Ym9hcmRFdmVudEludGVyZmFjZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU3ludGhldGljS2V5Ym9hcmRFdmVudDtcbiIsIi8qKlxuICogQ29weXJpZ2h0IDIwMTMtMjAxNSwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgQlNELXN0eWxlIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuIEFuIGFkZGl0aW9uYWwgZ3JhbnRcbiAqIG9mIHBhdGVudCByaWdodHMgY2FuIGJlIGZvdW5kIGluIHRoZSBQQVRFTlRTIGZpbGUgaW4gdGhlIHNhbWUgZGlyZWN0b3J5LlxuICpcbiAqIEBwcm92aWRlc01vZHVsZSBTeW50aGV0aWNVSUV2ZW50XG4gKiBAdHlwZWNoZWNrcyBzdGF0aWMtb25seVxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFN5bnRoZXRpY0V2ZW50ID0gcmVxdWlyZShcIi4vU3ludGhldGljRXZlbnRcIik7XG5cbnZhciBnZXRFdmVudFRhcmdldCA9IHJlcXVpcmUoXCIuL2dldEV2ZW50VGFyZ2V0XCIpO1xuXG4vKipcbiAqIEBpbnRlcmZhY2UgVUlFdmVudFxuICogQHNlZSBodHRwOi8vd3d3LnczLm9yZy9UUi9ET00tTGV2ZWwtMy1FdmVudHMvXG4gKi9cbnZhciBVSUV2ZW50SW50ZXJmYWNlID0ge1xuICB2aWV3OiBmdW5jdGlvbihldmVudCkge1xuICAgIGlmIChldmVudC52aWV3KSB7XG4gICAgICByZXR1cm4gZXZlbnQudmlldztcbiAgICB9XG5cbiAgICB2YXIgdGFyZ2V0ID0gZ2V0RXZlbnRUYXJnZXQoZXZlbnQpO1xuICAgIGlmICh0YXJnZXQgIT0gbnVsbCAmJiB0YXJnZXQud2luZG93ID09PSB0YXJnZXQpIHtcbiAgICAgIC8vIHRhcmdldCBpcyBhIHdpbmRvdyBvYmplY3RcbiAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuXG4gICAgdmFyIGRvYyA9IHRhcmdldC5vd25lckRvY3VtZW50O1xuICAgIC8vIFRPRE86IEZpZ3VyZSBvdXQgd2h5IGBvd25lckRvY3VtZW50YCBpcyBzb21ldGltZXMgdW5kZWZpbmVkIGluIElFOC5cbiAgICBpZiAoZG9jKSB7XG4gICAgICByZXR1cm4gZG9jLmRlZmF1bHRWaWV3IHx8IGRvYy5wYXJlbnRXaW5kb3c7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB3aW5kb3c7XG4gICAgfVxuICB9LFxuICBkZXRhaWw6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgcmV0dXJuIGV2ZW50LmRldGFpbCB8fCAwO1xuICB9XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7b2JqZWN0fSBkaXNwYXRjaENvbmZpZyBDb25maWd1cmF0aW9uIHVzZWQgdG8gZGlzcGF0Y2ggdGhpcyBldmVudC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBkaXNwYXRjaE1hcmtlciBNYXJrZXIgaWRlbnRpZnlpbmcgdGhlIGV2ZW50IHRhcmdldC5cbiAqIEBwYXJhbSB7b2JqZWN0fSBuYXRpdmVFdmVudCBOYXRpdmUgYnJvd3NlciBldmVudC5cbiAqIEBleHRlbmRzIHtTeW50aGV0aWNFdmVudH1cbiAqL1xuZnVuY3Rpb24gU3ludGhldGljVUlFdmVudChkaXNwYXRjaENvbmZpZywgZGlzcGF0Y2hNYXJrZXIsIG5hdGl2ZUV2ZW50KSB7XG4gIFN5bnRoZXRpY0V2ZW50LmNhbGwodGhpcywgZGlzcGF0Y2hDb25maWcsIGRpc3BhdGNoTWFya2VyLCBuYXRpdmVFdmVudCk7XG59XG5cblN5bnRoZXRpY0V2ZW50LmF1Z21lbnRDbGFzcyhTeW50aGV0aWNVSUV2ZW50LCBVSUV2ZW50SW50ZXJmYWNlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBTeW50aGV0aWNVSUV2ZW50O1xuIiwiLyoqXG4gKiBDb3B5cmlnaHQgMjAxMy0yMDE1LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBCU0Qtc3R5bGUgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS4gQW4gYWRkaXRpb25hbCBncmFudFxuICogb2YgcGF0ZW50IHJpZ2h0cyBjYW4gYmUgZm91bmQgaW4gdGhlIFBBVEVOVFMgZmlsZSBpbiB0aGUgc2FtZSBkaXJlY3RvcnkuXG4gKlxuICogQHByb3ZpZGVzTW9kdWxlIGVtcHR5RnVuY3Rpb25cbiAqL1xuXG5mdW5jdGlvbiBtYWtlRW1wdHlGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBhcmc7XG4gIH07XG59XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiBhY2NlcHRzIGFuZCBkaXNjYXJkcyBpbnB1dHM7IGl0IGhhcyBubyBzaWRlIGVmZmVjdHMuIFRoaXMgaXNcbiAqIHByaW1hcmlseSB1c2VmdWwgaWRpb21hdGljYWxseSBmb3Igb3ZlcnJpZGFibGUgZnVuY3Rpb24gZW5kcG9pbnRzIHdoaWNoXG4gKiBhbHdheXMgbmVlZCB0byBiZSBjYWxsYWJsZSwgc2luY2UgSlMgbGFja3MgYSBudWxsLWNhbGwgaWRpb20gYWxhIENvY29hLlxuICovXG5mdW5jdGlvbiBlbXB0eUZ1bmN0aW9uKCkge31cblxuZW1wdHlGdW5jdGlvbi50aGF0UmV0dXJucyA9IG1ha2VFbXB0eUZ1bmN0aW9uO1xuZW1wdHlGdW5jdGlvbi50aGF0UmV0dXJuc0ZhbHNlID0gbWFrZUVtcHR5RnVuY3Rpb24oZmFsc2UpO1xuZW1wdHlGdW5jdGlvbi50aGF0UmV0dXJuc1RydWUgPSBtYWtlRW1wdHlGdW5jdGlvbih0cnVlKTtcbmVtcHR5RnVuY3Rpb24udGhhdFJldHVybnNOdWxsID0gbWFrZUVtcHR5RnVuY3Rpb24obnVsbCk7XG5lbXB0eUZ1bmN0aW9uLnRoYXRSZXR1cm5zVGhpcyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfTtcbmVtcHR5RnVuY3Rpb24udGhhdFJldHVybnNBcmd1bWVudCA9IGZ1bmN0aW9uKGFyZykgeyByZXR1cm4gYXJnOyB9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGVtcHR5RnVuY3Rpb247XG4iLCIvKipcbiAqIENvcHlyaWdodCAyMDEzLTIwMTUsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4gKiBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqXG4gKiBAcHJvdmlkZXNNb2R1bGUgZ2V0RXZlbnRDaGFyQ29kZVxuICogQHR5cGVjaGVja3Mgc3RhdGljLW9ubHlcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogYGNoYXJDb2RlYCByZXByZXNlbnRzIHRoZSBhY3R1YWwgXCJjaGFyYWN0ZXIgY29kZVwiIGFuZCBpcyBzYWZlIHRvIHVzZSB3aXRoXG4gKiBgU3RyaW5nLmZyb21DaGFyQ29kZWAuIEFzIHN1Y2gsIG9ubHkga2V5cyB0aGF0IGNvcnJlc3BvbmQgdG8gcHJpbnRhYmxlXG4gKiBjaGFyYWN0ZXJzIHByb2R1Y2UgYSB2YWxpZCBgY2hhckNvZGVgLCB0aGUgb25seSBleGNlcHRpb24gdG8gdGhpcyBpcyBFbnRlci5cbiAqIFRoZSBUYWIta2V5IGlzIGNvbnNpZGVyZWQgbm9uLXByaW50YWJsZSBhbmQgZG9lcyBub3QgaGF2ZSBhIGBjaGFyQ29kZWAsXG4gKiBwcmVzdW1hYmx5IGJlY2F1c2UgaXQgZG9lcyBub3QgcHJvZHVjZSBhIHRhYi1jaGFyYWN0ZXIgaW4gYnJvd3NlcnMuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IG5hdGl2ZUV2ZW50IE5hdGl2ZSBicm93c2VyIGV2ZW50LlxuICogQHJldHVybiB7c3RyaW5nfSBOb3JtYWxpemVkIGBjaGFyQ29kZWAgcHJvcGVydHkuXG4gKi9cbmZ1bmN0aW9uIGdldEV2ZW50Q2hhckNvZGUobmF0aXZlRXZlbnQpIHtcbiAgdmFyIGNoYXJDb2RlO1xuICB2YXIga2V5Q29kZSA9IG5hdGl2ZUV2ZW50LmtleUNvZGU7XG5cbiAgaWYgKCdjaGFyQ29kZScgaW4gbmF0aXZlRXZlbnQpIHtcbiAgICBjaGFyQ29kZSA9IG5hdGl2ZUV2ZW50LmNoYXJDb2RlO1xuXG4gICAgLy8gRkYgZG9lcyBub3Qgc2V0IGBjaGFyQ29kZWAgZm9yIHRoZSBFbnRlci1rZXksIGNoZWNrIGFnYWluc3QgYGtleUNvZGVgLlxuICAgIGlmIChjaGFyQ29kZSA9PT0gMCAmJiBrZXlDb2RlID09PSAxMykge1xuICAgICAgY2hhckNvZGUgPSAxMztcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gSUU4IGRvZXMgbm90IGltcGxlbWVudCBgY2hhckNvZGVgLCBidXQgYGtleUNvZGVgIGhhcyB0aGUgY29ycmVjdCB2YWx1ZS5cbiAgICBjaGFyQ29kZSA9IGtleUNvZGU7XG4gIH1cblxuICAvLyBTb21lIG5vbi1wcmludGFibGUga2V5cyBhcmUgcmVwb3J0ZWQgaW4gYGNoYXJDb2RlYC9ga2V5Q29kZWAsIGRpc2NhcmQgdGhlbS5cbiAgLy8gTXVzdCBub3QgZGlzY2FyZCB0aGUgKG5vbi0pcHJpbnRhYmxlIEVudGVyLWtleS5cbiAgaWYgKGNoYXJDb2RlID49IDMyIHx8IGNoYXJDb2RlID09PSAxMykge1xuICAgIHJldHVybiBjaGFyQ29kZTtcbiAgfVxuXG4gIHJldHVybiAwO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldEV2ZW50Q2hhckNvZGU7XG4iLCIvKipcbiAqIENvcHlyaWdodCAyMDEzLTIwMTUsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4gKiBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqXG4gKiBAcHJvdmlkZXNNb2R1bGUgZ2V0RXZlbnRLZXlcbiAqIEB0eXBlY2hlY2tzIHN0YXRpYy1vbmx5XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2V0RXZlbnRDaGFyQ29kZSA9IHJlcXVpcmUoXCIuL2dldEV2ZW50Q2hhckNvZGVcIik7XG5cbi8qKlxuICogTm9ybWFsaXphdGlvbiBvZiBkZXByZWNhdGVkIEhUTUw1IGBrZXlgIHZhbHVlc1xuICogQHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvS2V5Ym9hcmRFdmVudCNLZXlfbmFtZXNcbiAqL1xudmFyIG5vcm1hbGl6ZUtleSA9IHtcbiAgJ0VzYyc6ICdFc2NhcGUnLFxuICAnU3BhY2ViYXInOiAnICcsXG4gICdMZWZ0JzogJ0Fycm93TGVmdCcsXG4gICdVcCc6ICdBcnJvd1VwJyxcbiAgJ1JpZ2h0JzogJ0Fycm93UmlnaHQnLFxuICAnRG93bic6ICdBcnJvd0Rvd24nLFxuICAnRGVsJzogJ0RlbGV0ZScsXG4gICdXaW4nOiAnT1MnLFxuICAnTWVudSc6ICdDb250ZXh0TWVudScsXG4gICdBcHBzJzogJ0NvbnRleHRNZW51JyxcbiAgJ1Njcm9sbCc6ICdTY3JvbGxMb2NrJyxcbiAgJ01velByaW50YWJsZUtleSc6ICdVbmlkZW50aWZpZWQnXG59O1xuXG4vKipcbiAqIFRyYW5zbGF0aW9uIGZyb20gbGVnYWN5IGBrZXlDb2RlYCB0byBIVE1MNSBga2V5YFxuICogT25seSBzcGVjaWFsIGtleXMgc3VwcG9ydGVkLCBhbGwgb3RoZXJzIGRlcGVuZCBvbiBrZXlib2FyZCBsYXlvdXQgb3IgYnJvd3NlclxuICogQHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvS2V5Ym9hcmRFdmVudCNLZXlfbmFtZXNcbiAqL1xudmFyIHRyYW5zbGF0ZVRvS2V5ID0ge1xuICA4OiAnQmFja3NwYWNlJyxcbiAgOTogJ1RhYicsXG4gIDEyOiAnQ2xlYXInLFxuICAxMzogJ0VudGVyJyxcbiAgMTY6ICdTaGlmdCcsXG4gIDE3OiAnQ29udHJvbCcsXG4gIDE4OiAnQWx0JyxcbiAgMTk6ICdQYXVzZScsXG4gIDIwOiAnQ2Fwc0xvY2snLFxuICAyNzogJ0VzY2FwZScsXG4gIDMyOiAnICcsXG4gIDMzOiAnUGFnZVVwJyxcbiAgMzQ6ICdQYWdlRG93bicsXG4gIDM1OiAnRW5kJyxcbiAgMzY6ICdIb21lJyxcbiAgMzc6ICdBcnJvd0xlZnQnLFxuICAzODogJ0Fycm93VXAnLFxuICAzOTogJ0Fycm93UmlnaHQnLFxuICA0MDogJ0Fycm93RG93bicsXG4gIDQ1OiAnSW5zZXJ0JyxcbiAgNDY6ICdEZWxldGUnLFxuICAxMTI6ICdGMScsIDExMzogJ0YyJywgMTE0OiAnRjMnLCAxMTU6ICdGNCcsIDExNjogJ0Y1JywgMTE3OiAnRjYnLFxuICAxMTg6ICdGNycsIDExOTogJ0Y4JywgMTIwOiAnRjknLCAxMjE6ICdGMTAnLCAxMjI6ICdGMTEnLCAxMjM6ICdGMTInLFxuICAxNDQ6ICdOdW1Mb2NrJyxcbiAgMTQ1OiAnU2Nyb2xsTG9jaycsXG4gIDIyNDogJ01ldGEnXG59O1xuXG4vKipcbiAqIEBwYXJhbSB7b2JqZWN0fSBuYXRpdmVFdmVudCBOYXRpdmUgYnJvd3NlciBldmVudC5cbiAqIEByZXR1cm4ge3N0cmluZ30gTm9ybWFsaXplZCBga2V5YCBwcm9wZXJ0eS5cbiAqL1xuZnVuY3Rpb24gZ2V0RXZlbnRLZXkobmF0aXZlRXZlbnQpIHtcbiAgaWYgKG5hdGl2ZUV2ZW50LmtleSkge1xuICAgIC8vIE5vcm1hbGl6ZSBpbmNvbnNpc3RlbnQgdmFsdWVzIHJlcG9ydGVkIGJ5IGJyb3dzZXJzIGR1ZSB0b1xuICAgIC8vIGltcGxlbWVudGF0aW9ucyBvZiBhIHdvcmtpbmcgZHJhZnQgc3BlY2lmaWNhdGlvbi5cblxuICAgIC8vIEZpcmVGb3ggaW1wbGVtZW50cyBga2V5YCBidXQgcmV0dXJucyBgTW96UHJpbnRhYmxlS2V5YCBmb3IgYWxsXG4gICAgLy8gcHJpbnRhYmxlIGNoYXJhY3RlcnMgKG5vcm1hbGl6ZWQgdG8gYFVuaWRlbnRpZmllZGApLCBpZ25vcmUgaXQuXG4gICAgdmFyIGtleSA9IG5vcm1hbGl6ZUtleVtuYXRpdmVFdmVudC5rZXldIHx8IG5hdGl2ZUV2ZW50LmtleTtcbiAgICBpZiAoa2V5ICE9PSAnVW5pZGVudGlmaWVkJykge1xuICAgICAgcmV0dXJuIGtleTtcbiAgICB9XG4gIH1cblxuICAvLyBCcm93c2VyIGRvZXMgbm90IGltcGxlbWVudCBga2V5YCwgcG9seWZpbGwgYXMgbXVjaCBvZiBpdCBhcyB3ZSBjYW4uXG4gIGlmIChuYXRpdmVFdmVudC50eXBlID09PSAna2V5cHJlc3MnKSB7XG4gICAgdmFyIGNoYXJDb2RlID0gZ2V0RXZlbnRDaGFyQ29kZShuYXRpdmVFdmVudCk7XG5cbiAgICAvLyBUaGUgZW50ZXIta2V5IGlzIHRlY2huaWNhbGx5IGJvdGggcHJpbnRhYmxlIGFuZCBub24tcHJpbnRhYmxlIGFuZCBjYW5cbiAgICAvLyB0aHVzIGJlIGNhcHR1cmVkIGJ5IGBrZXlwcmVzc2AsIG5vIG90aGVyIG5vbi1wcmludGFibGUga2V5IHNob3VsZC5cbiAgICByZXR1cm4gY2hhckNvZGUgPT09IDEzID8gJ0VudGVyJyA6IFN0cmluZy5mcm9tQ2hhckNvZGUoY2hhckNvZGUpO1xuICB9XG4gIGlmIChuYXRpdmVFdmVudC50eXBlID09PSAna2V5ZG93bicgfHwgbmF0aXZlRXZlbnQudHlwZSA9PT0gJ2tleXVwJykge1xuICAgIC8vIFdoaWxlIHVzZXIga2V5Ym9hcmQgbGF5b3V0IGRldGVybWluZXMgdGhlIGFjdHVhbCBtZWFuaW5nIG9mIGVhY2hcbiAgICAvLyBga2V5Q29kZWAgdmFsdWUsIGFsbW9zdCBhbGwgZnVuY3Rpb24ga2V5cyBoYXZlIGEgdW5pdmVyc2FsIHZhbHVlLlxuICAgIHJldHVybiB0cmFuc2xhdGVUb0tleVtuYXRpdmVFdmVudC5rZXlDb2RlXSB8fCAnVW5pZGVudGlmaWVkJztcbiAgfVxuICByZXR1cm4gJyc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0RXZlbnRLZXk7XG4iLCIvKipcbiAqIENvcHlyaWdodCAyMDEzLTIwMTUsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4gKiBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqXG4gKiBAcHJvdmlkZXNNb2R1bGUgZ2V0RXZlbnRNb2RpZmllclN0YXRlXG4gKiBAdHlwZWNoZWNrcyBzdGF0aWMtb25seVxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBUcmFuc2xhdGlvbiBmcm9tIG1vZGlmaWVyIGtleSB0byB0aGUgYXNzb2NpYXRlZCBwcm9wZXJ0eSBpbiB0aGUgZXZlbnQuXG4gKiBAc2VlIGh0dHA6Ly93d3cudzMub3JnL1RSL0RPTS1MZXZlbC0zLUV2ZW50cy8ja2V5cy1Nb2RpZmllcnNcbiAqL1xuXG52YXIgbW9kaWZpZXJLZXlUb1Byb3AgPSB7XG4gICdBbHQnOiAnYWx0S2V5JyxcbiAgJ0NvbnRyb2wnOiAnY3RybEtleScsXG4gICdNZXRhJzogJ21ldGFLZXknLFxuICAnU2hpZnQnOiAnc2hpZnRLZXknXG59O1xuXG4vLyBJRTggZG9lcyBub3QgaW1wbGVtZW50IGdldE1vZGlmaWVyU3RhdGUgc28gd2Ugc2ltcGx5IG1hcCBpdCB0byB0aGUgb25seVxuLy8gbW9kaWZpZXIga2V5cyBleHBvc2VkIGJ5IHRoZSBldmVudCBpdHNlbGYsIGRvZXMgbm90IHN1cHBvcnQgTG9jay1rZXlzLlxuLy8gQ3VycmVudGx5LCBhbGwgbWFqb3IgYnJvd3NlcnMgZXhjZXB0IENocm9tZSBzZWVtcyB0byBzdXBwb3J0IExvY2sta2V5cy5cbmZ1bmN0aW9uIG1vZGlmaWVyU3RhdGVHZXR0ZXIoa2V5QXJnKSB7XG4gIC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG4gIHZhciBzeW50aGV0aWNFdmVudCA9IHRoaXM7XG4gIHZhciBuYXRpdmVFdmVudCA9IHN5bnRoZXRpY0V2ZW50Lm5hdGl2ZUV2ZW50O1xuICBpZiAobmF0aXZlRXZlbnQuZ2V0TW9kaWZpZXJTdGF0ZSkge1xuICAgIHJldHVybiBuYXRpdmVFdmVudC5nZXRNb2RpZmllclN0YXRlKGtleUFyZyk7XG4gIH1cbiAgdmFyIGtleVByb3AgPSBtb2RpZmllcktleVRvUHJvcFtrZXlBcmddO1xuICByZXR1cm4ga2V5UHJvcCA/ICEhbmF0aXZlRXZlbnRba2V5UHJvcF0gOiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gZ2V0RXZlbnRNb2RpZmllclN0YXRlKG5hdGl2ZUV2ZW50KSB7XG4gIHJldHVybiBtb2RpZmllclN0YXRlR2V0dGVyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldEV2ZW50TW9kaWZpZXJTdGF0ZTtcbiIsIi8qKlxuICogQ29weXJpZ2h0IDIwMTMtMjAxNSwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgQlNELXN0eWxlIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuIEFuIGFkZGl0aW9uYWwgZ3JhbnRcbiAqIG9mIHBhdGVudCByaWdodHMgY2FuIGJlIGZvdW5kIGluIHRoZSBQQVRFTlRTIGZpbGUgaW4gdGhlIHNhbWUgZGlyZWN0b3J5LlxuICpcbiAqIEBwcm92aWRlc01vZHVsZSBnZXRFdmVudFRhcmdldFxuICogQHR5cGVjaGVja3Mgc3RhdGljLW9ubHlcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogR2V0cyB0aGUgdGFyZ2V0IG5vZGUgZnJvbSBhIG5hdGl2ZSBicm93c2VyIGV2ZW50IGJ5IGFjY291bnRpbmcgZm9yXG4gKiBpbmNvbnNpc3RlbmNpZXMgaW4gYnJvd3NlciBET00gQVBJcy5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gbmF0aXZlRXZlbnQgTmF0aXZlIGJyb3dzZXIgZXZlbnQuXG4gKiBAcmV0dXJuIHtET01FdmVudFRhcmdldH0gVGFyZ2V0IG5vZGUuXG4gKi9cbmZ1bmN0aW9uIGdldEV2ZW50VGFyZ2V0KG5hdGl2ZUV2ZW50KSB7XG4gIHZhciB0YXJnZXQgPSBuYXRpdmVFdmVudC50YXJnZXQgfHwgbmF0aXZlRXZlbnQuc3JjRWxlbWVudCB8fCB3aW5kb3c7XG4gIC8vIFNhZmFyaSBtYXkgZmlyZSBldmVudHMgb24gdGV4dCBub2RlcyAoTm9kZS5URVhUX05PREUgaXMgMykuXG4gIC8vIEBzZWUgaHR0cDovL3d3dy5xdWlya3Ntb2RlLm9yZy9qcy9ldmVudHNfcHJvcGVydGllcy5odG1sXG4gIHJldHVybiB0YXJnZXQubm9kZVR5cGUgPT09IDMgPyB0YXJnZXQucGFyZW50Tm9kZSA6IHRhcmdldDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRFdmVudFRhcmdldDtcbiIsIi8qKlxuICogQ29weXJpZ2h0IDIwMTMtMjAxNSwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgQlNELXN0eWxlIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuIEFuIGFkZGl0aW9uYWwgZ3JhbnRcbiAqIG9mIHBhdGVudCByaWdodHMgY2FuIGJlIGZvdW5kIGluIHRoZSBQQVRFTlRTIGZpbGUgaW4gdGhlIHNhbWUgZGlyZWN0b3J5LlxuICpcbiAqIEBwcm92aWRlc01vZHVsZSBpbnZhcmlhbnRcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuLyoqXG4gKiBVc2UgaW52YXJpYW50KCkgdG8gYXNzZXJ0IHN0YXRlIHdoaWNoIHlvdXIgcHJvZ3JhbSBhc3N1bWVzIHRvIGJlIHRydWUuXG4gKlxuICogUHJvdmlkZSBzcHJpbnRmLXN0eWxlIGZvcm1hdCAob25seSAlcyBpcyBzdXBwb3J0ZWQpIGFuZCBhcmd1bWVudHNcbiAqIHRvIHByb3ZpZGUgaW5mb3JtYXRpb24gYWJvdXQgd2hhdCBicm9rZSBhbmQgd2hhdCB5b3Ugd2VyZVxuICogZXhwZWN0aW5nLlxuICpcbiAqIFRoZSBpbnZhcmlhbnQgbWVzc2FnZSB3aWxsIGJlIHN0cmlwcGVkIGluIHByb2R1Y3Rpb24sIGJ1dCB0aGUgaW52YXJpYW50XG4gKiB3aWxsIHJlbWFpbiB0byBlbnN1cmUgbG9naWMgZG9lcyBub3QgZGlmZmVyIGluIHByb2R1Y3Rpb24uXG4gKi9cblxudmFyIGludmFyaWFudCA9IGZ1bmN0aW9uKGNvbmRpdGlvbiwgZm9ybWF0LCBhLCBiLCBjLCBkLCBlLCBmKSB7XG4gIGlmIChcInByb2R1Y3Rpb25cIiAhPT0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYpIHtcbiAgICBpZiAoZm9ybWF0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW52YXJpYW50IHJlcXVpcmVzIGFuIGVycm9yIG1lc3NhZ2UgYXJndW1lbnQnKTtcbiAgICB9XG4gIH1cblxuICBpZiAoIWNvbmRpdGlvbikge1xuICAgIHZhciBlcnJvcjtcbiAgICBpZiAoZm9ybWF0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGVycm9yID0gbmV3IEVycm9yKFxuICAgICAgICAnTWluaWZpZWQgZXhjZXB0aW9uIG9jY3VycmVkOyB1c2UgdGhlIG5vbi1taW5pZmllZCBkZXYgZW52aXJvbm1lbnQgJyArXG4gICAgICAgICdmb3IgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZSBhbmQgYWRkaXRpb25hbCBoZWxwZnVsIHdhcm5pbmdzLidcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBhcmdzID0gW2EsIGIsIGMsIGQsIGUsIGZdO1xuICAgICAgdmFyIGFyZ0luZGV4ID0gMDtcbiAgICAgIGVycm9yID0gbmV3IEVycm9yKFxuICAgICAgICAnSW52YXJpYW50IFZpb2xhdGlvbjogJyArXG4gICAgICAgIGZvcm1hdC5yZXBsYWNlKC8lcy9nLCBmdW5jdGlvbigpIHsgcmV0dXJuIGFyZ3NbYXJnSW5kZXgrK107IH0pXG4gICAgICApO1xuICAgIH1cblxuICAgIGVycm9yLmZyYW1lc1RvUG9wID0gMTsgLy8gd2UgZG9uJ3QgY2FyZSBhYm91dCBpbnZhcmlhbnQncyBvd24gZnJhbWVcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBpbnZhcmlhbnQ7XG4iLCJob3RrZXkgPSByZXF1aXJlICdyZWFjdC1ob3RrZXknXG5cbmhvdGtleS5hY3RpdmF0ZSgpXG5cbkxlZGdlckVkaXRvclZpZXdDb250cm9sbGVyID0gcmVxdWlyZSAnLi9MZWRnZXJFZGl0b3JWaWV3Q29udHJvbGxlci5janN4J1xuTGVkZ2VyVmlld2VyVmlld0NvbnRyb2xsZXIgPSByZXF1aXJlICcuL0xlZGdlclZpZXdlclZpZXdDb250cm9sbGVyLmNqc3gnXG5cbm1vZHVsZS5leHBvcnRzID0gXG5SZWFjdC5jcmVhdGVDbGFzc1xuXHRtaXhpbnM6IFtob3RrZXkuTWl4aW4oJ2hhbmRsZUhvdGtleScpXVxuXHRnZXRJbml0aWFsU3RhdGU6IC0+XG5cdFx0b3B0aW1pemVkVHJhbnNhY3Rpb25zOiBbXVxuXHRcdGRhdGVMYXN0T3B0aW1pemVkOiBudWxsXG5cblx0b25MZWRnZXJTdWJtaXQ6IChsZWRnZXJPYmosIGNvbXBsZXRpb24pIC0+XG5cdFx0YXhpb3Ncblx0XHRcdC5wb3N0KCcvb3B0aW1pemUnLCBsZWRnZXJPYmopXG5cdFx0XHQudGhlbigocmVzcG9uc2VPYmopID0+XG5cdFx0XHRcdHRyYW5zYWN0aW9ucyA9IHJlc3BvbnNlT2JqLmRhdGFbJ3RyYW5zYWN0aW9ucyddXG5cdFx0XHRcdEBzZXRTdGF0ZShcblx0XHRcdFx0XHRvcHRpbWl6ZWRUcmFuc2FjdGlvbnM6IHRyYW5zYWN0aW9uc1xuXHRcdFx0XHRcdGRhdGVMYXN0T3B0aW1pemVkOiBuZXcgRGF0ZSgpXG5cdFx0XHRcdClcblx0XHRcdFx0Y29tcGxldGlvbigpXG5cdFx0XHQpXG5cdFx0XHQuY2F0Y2goKGVycm9yKSA9PiBcblx0XHRcdFx0Y29tcGxldGlvbigpXG5cdFx0XHQpXG5cblx0aGFuZGxlSG90a2V5OiAoZSkgLT5cblx0XHRpZiBlLmN0cmxLZXkgXG5cdFx0XHRzd2l0Y2ggU3RyaW5nLmZyb21DaGFyQ29kZShlLmtleUNvZGUpXG5cdFx0XHRcdHdoZW4gJ1InXG5cdFx0XHRcdFx0QHJlZnMubGVkZ2VyRWRpdG9yLm9uT3B0aW1pemUoKVxuXHRcdFx0XHR3aGVuICdEJ1xuXHRcdFx0XHRcdEByZWZzLmxlZGdlckVkaXRvci5vblJlc2V0KClcblx0XHRcdFx0d2hlbiAnQSdcblx0XHRcdFx0XHRAcmVmcy5sZWRnZXJFZGl0b3Iub25BZGRUcmFuc2FjdGlvbigpXG5cblx0b25BZGRUcmFuc2FjdGlvbjogLT5cblx0XHRAcmVmcy5sZWRnZXJFZGl0b3Iub25BZGRUcmFuc2FjdGlvbigpXG5cdG9uUmVzZXQ6IC0+XG5cdFx0QHJlZnMubGVkZ2VyRWRpdG9yLm9uUmVzZXQoKVxuXHRvbk9wdGltaXplOiAtPlxuXHRcdEByZWZzLmxlZGdlckVkaXRvci5vbk9wdGltaXplKClcblxuXG5cdHJlbmRlcjogLT5cblx0XHRyZXR1cm4gKFxuXHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XCJjbGFzc05hbWVcIjogXCJjb250YWluZXJcIiwgXCJvbktleVVwXCI6IChAb25LZXlVcCl9LFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcImNsYXNzTmFtZVwiOiBcInJvdyBjb2wtc20tMTJcIn0sXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImgyXCIsIG51bGwsIFwiXCJcIlxuXFx0XFx0XFx0XFx0XFx0XFx0TXVEZWx0YSAtXG5cXHRcXHRcXHRcXHRcXHRcXHRcblwiXCJcIiwgUmVhY3QuY3JlYXRlRWxlbWVudChcInNtYWxsXCIsIG51bGwsIFwiIElucHV0IElPVXMgYmV0d2VlbiBwZW9wbGUgYW5kIGhpdCBPcHRpbWl6ZSB0byBzZWUgdGhlIGJlc3Qgd2F5IHRvIHJlc29sdmUgYWxsIElPVXMuIFwiKVxuXHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcInBcIiwgbnVsbCwgXCJcIlwiXG5cXHRcXHRcXHRcXHRcXHRcXHRVc2UgRW50ZXIgYW5kIEJhY2tzcGFjZSB0byBlYXNpbHkgbmF2aWdhdGUgYXJvdW5kIHRyYW5zYWN0aW9ucy5cblwiXCJcIiksXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiLCB7XCJjbGFzc05hbWVcIjogXCJidG4gYnRuLWRlZmF1bHRcIiwgXCJvbkNsaWNrXCI6IChAb25BZGRUcmFuc2FjdGlvbil9LCBcIlwiXCJcblxcdFxcdFxcdFxcdFxcdFxcdEFkZCBUcmFuc2FjdGlvbiAoQ3RybC1BKVxuXCJcIlwiKSwgXHRcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIsIHtcImNsYXNzTmFtZVwiOiBcImJ0biBidG4tZGVmYXVsdFwiLCBcIm9uQ2xpY2tcIjogKEBvblJlc2V0KX0sIFwiXCJcIlxuXFx0XFx0XFx0XFx0XFx0XFx0UmVzZXQgKEN0cmwtRClcblwiXCJcIiksIFx0XG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiLCB7XCJjbGFzc05hbWVcIjogXCJidG4gYnRuLXByaW1hcnlcIiwgXCJvbkNsaWNrXCI6IChAb25PcHRpbWl6ZSl9LCBcIlwiXCJcblxcdFxcdFxcdFxcdFxcdFxcdE9wdGltaXplISAoQ3RybC1SKVxuXCJcIlwiKSxcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KExlZGdlckVkaXRvclZpZXdDb250cm9sbGVyLCB7IFxcXG5cdFx0XHRcdFx0XHRcInJlZlwiOiBcImxlZGdlckVkaXRvclwiLCAgXFxcblx0XHRcdFx0XHRcdFwib25MZWRnZXJTdWJtaXRcIjogKEBvbkxlZGdlclN1Ym1pdClcblx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoTGVkZ2VyVmlld2VyVmlld0NvbnRyb2xsZXIsIHsgXFxcblx0XHRcdFx0XHRcdFwidHJhbnNhY3Rpb25zXCI6IChAc3RhdGUub3B0aW1pemVkVHJhbnNhY3Rpb25zKSwgIFxcXG5cdFx0XHRcdFx0XHRcImRhdGVMYXN0T3B0aW1pemVkXCI6IChAc3RhdGUuZGF0ZUxhc3RPcHRpbWl6ZWQpXG5cdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwic21hbGxcIiwgbnVsbCwgXCJcIlwiXG5cXHRcXHRcXHRcXHRcXHRcXHR3cml0dGVuIGJ5IFwiXCJcIiwgUmVhY3QuY3JlYXRlRWxlbWVudChcImFcIiwge1wiaHJlZlwiOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9tdmFuZGVyaFwifSwgXCJNaXRjaGVsbCBWYW4gRGVyIEhvZWZmXCIpXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHQpXG5cdFx0XHQpXG5cdFx0KSIsIkxlZGdlclRyYW5zYWN0aW9uVmlldyA9IHJlcXVpcmUgJy4vTGVkZ2VyVHJhbnNhY3Rpb25WaWV3LmNqc3gnXG5cbm1vZHVsZS5leHBvcnRzID0gXG5SZWFjdC5jcmVhdGVDbGFzc1xuXHRnZXRJbml0aWFsU3RhdGU6IC0+XG5cdFx0aXNPcHRpbWl6aW5nOiBmYWxzZVxuXHRcdHRyYW5zYWN0aW9uczogW1xuXHRcdFx0QG1ha2VFbXB0eVRyYW5zYWN0aW9uKClcblx0XHRdXG5cdG1ha2VFbXB0eVRyYW5zYWN0aW9uOiAtPiB7XG5cdFx0ZGVidG9yOiAnJ1xuXHRcdGNyZWRpdG9yOiAnJ1xuXHRcdGFtb3VudDogJydcblx0fVxuXHRhZGRFbXB0eVRyYW5zYWN0aW9uOiAtPlxuXHRcdG5ld1RyYW5zYWN0aW9uID0gQG1ha2VFbXB0eVRyYW5zYWN0aW9uKClcblx0XHRAc3RhdGUudHJhbnNhY3Rpb25zLnB1c2gobmV3VHJhbnNhY3Rpb24pXG5cdFx0QHNldFN0YXRlKHRyYW5zYWN0aW9uczogQHN0YXRlLnRyYW5zYWN0aW9ucylcblx0cmVtb3ZlRmlyc3RUcmFuc2FjdGlvbjogLT5cblx0XHRAcmVtb3ZlVHJhbnNhY3Rpb25BdEluZGV4KDApXG5cdHJlbW92ZVRyYW5zYWN0aW9uQXRJbmRleDogKGluZGV4KSAtPlxuXHRcdGlmIGluZGV4ID4gMFxuXHRcdFx0QHRyYW5zYWN0aW9uVmlld0F0SW5kZXgoaW5kZXggLSAxKS5mb2N1c0Ftb3VudElucHV0KClcblx0XHRAc3RhdGUudHJhbnNhY3Rpb25zLnNwbGljZShpbmRleCwgMSlcblx0XHRAc2V0U3RhdGUodHJhbnNhY3Rpb25zOiBAc3RhdGUudHJhbnNhY3Rpb25zKVxuXHRydW5PcHRpbWl6ZTogLT5cblx0XHRAc2V0U3RhdGUoaXNPcHRpbWl6aW5nOiB0cnVlKVxuXHRcdGNvbXBsZXRpb24gPSA9PiBcblx0XHRcdEBzZXRTdGF0ZShpc09wdGltaXppbmc6IGZhbHNlKVxuXHRcdEBwcm9wcy5vbkxlZGdlclN1Ym1pdChAc3RhdGUudHJhbnNhY3Rpb25zLCBjb21wbGV0aW9uKVxuXG5cdG9uQWRkVHJhbnNhY3Rpb246IC0+XG5cdFx0QGFkZEVtcHR5VHJhbnNhY3Rpb24oKVxuXHRvbk9wdGltaXplOiAtPlxuXHRcdEBydW5PcHRpbWl6ZSgpXG5cdG9uUmVzZXQ6IC0+XG5cdFx0QHNldFN0YXRlKEBnZXRJbml0aWFsU3RhdGUoKSlcblx0b25UcmFuc2FjdGlvbkFjdGlvbjogKGluZGV4KSAtPlxuXHRcdEByZW1vdmVUcmFuc2FjdGlvbkF0SW5kZXgoaW5kZXgpXG5cdG9uVHJhbnNhY3Rpb25DaGFuZ2VkOiAodHJhbnNhY3Rpb24sIGluZGV4KSAtPlxuXHRcdEBzdGF0ZS50cmFuc2FjdGlvbnNbaW5kZXhdID0gdHJhbnNhY3Rpb25cblx0XHRAc2V0U3RhdGUodHJhbnNhY3Rpb25zOiBAc3RhdGUudHJhbnNhY3Rpb25zKVxuXHRvblRyYW5zYWN0aW9uRW50ZXJlZDogKGluZGV4KSAtPlxuXHRcdGlmIGluZGV4IDwgQHN0YXRlLnRyYW5zYWN0aW9ucy5sZW5ndGggLSAxXG5cdFx0XHR0cmFuc2FjdGlvblZpZXcgPSBAdHJhbnNhY3Rpb25WaWV3QXRJbmRleChpbmRleCArIDEpXG5cdFx0XHR0cmFuc2FjdGlvblZpZXcuZm9jdXNEZWJ0b3JJbnB1dCgpXG5cdFx0ZWxzZVxuXHRcdFx0QGFkZEVtcHR5VHJhbnNhY3Rpb24oKVxuXHRvblRyYW5zYWN0aW9uRGVsZXRlZDogKGluZGV4KSAtPlxuXHRcdGlmIGluZGV4ID4gMFxuXHRcdFx0QHJlbW92ZVRyYW5zYWN0aW9uQXRJbmRleChpbmRleClcblxuXHRrZXlGb3JUcmFuc2FjdGlvbkF0SW5kZXg6IChpbmRleCkgLT5cblx0XHRcInRyYW5zYWN0aW9uVmlldyN7aW5kZXh9XCJcblx0dHJhbnNhY3Rpb25WaWV3QXRJbmRleDogKGluZGV4KSAtPlxuXHRcdGtleSA9IEBrZXlGb3JUcmFuc2FjdGlvbkF0SW5kZXgoaW5kZXgpXG5cdFx0cmV0dXJuIEByZWZzW2tleV1cblxuXHRyZW5kZXI6IC0+XG5cdFx0dHJhbnNhY3Rpb25WaWV3cyA9IEBzdGF0ZS50cmFuc2FjdGlvbnMubWFwKCh0cmFuc2FjdGlvbiwgaW5kZXgpID0+XG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KExlZGdlclRyYW5zYWN0aW9uVmlldywgeyAgXFxcblx0XHRcdFx0XCJrZXlcIjogKGluZGV4KSwgIFxcXG5cdFx0XHRcdFwicmVmXCI6IChAa2V5Rm9yVHJhbnNhY3Rpb25BdEluZGV4KGluZGV4KSksICBcXFxuXHRcdFx0XHRcInRyYW5zYWN0aW9uXCI6ICh0cmFuc2FjdGlvbiksICBcXFxuXHRcdFx0XHRcIm9uQWN0aW9uXCI6ICg9PiBAb25UcmFuc2FjdGlvbkFjdGlvbihpbmRleCkpLCAgXFxcblx0XHRcdFx0XCJvblRyYW5zYWN0aW9uQ2hhbmdlZFwiOiAoKG5ld1R4KSA9PiBAb25UcmFuc2FjdGlvbkNoYW5nZWQobmV3VHgsIGluZGV4KSksICBcXFxuXHRcdFx0XHRcIm9uVHJhbnNhY3Rpb25FbnRlcmVkXCI6ICg9PiBAb25UcmFuc2FjdGlvbkVudGVyZWQoaW5kZXgpKSwgIFxcXG5cdFx0XHRcdFwib25UcmFuc2FjdGlvbkRlbGV0ZWRcIjogKD0+IEBvblRyYW5zYWN0aW9uRGVsZXRlZChpbmRleCkpXG5cdFx0XHRcdCB9KVxuXHRcdClcblx0XHRyZXR1cm4gKFxuXHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7ICBcXFxuXHRcdFx0XHRcImNsYXNzTmFtZVwiOiBcInJvd1wiLCAgXFxcblx0XHRcdFx0XCJzdHlsZVwiOiAoe21hcmdpblRvcDogJzEwcHgnfSlcblx0XHRcdFx0fSxcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XCJjbGFzc05hbWVcIjogXCJjb2wtc20tMTIgbGVkZ2VyLWNvbnRhaW5lclwifSxcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcImNsYXNzTmFtZVwiOiBcImxlZGdlci1hY3Rpb25zXCJ9LFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImg0XCIsIHtcImNsYXNzTmFtZVwiOiBcInRleHQtbGVmdFwifSwgXCJcIlwiXG5cXHRcXHRcXHRcXHRcXHRcXHRcXHRMZWRnZXIgXG5cIlwiXCIsIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzbWFsbFwiLCBudWxsLFxuXHRcdFx0XHRcdFx0XHRcdChpZiBAc3RhdGUuaXNPcHRpbWl6aW5nIHRoZW4gXCJPcHRpbWl6aW5nLi5cIilcblx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XCJjbGFzc05hbWVcIjogXCJ0cmFuc2FjdGlvbnMtY29udGFpbmVyXCIsIFwicmVmXCI6IFwidHJhbnNhY3Rpb25zQ29udGFpbmVyXCJ9LFxuXHRcdFx0XHRcdFx0KHRyYW5zYWN0aW9uVmlld3MpXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHQpXG5cdFx0XHQpXG5cdFx0KVxuIiwibW9kdWxlLmV4cG9ydHMgPSBcblJlYWN0LmNyZWF0ZUNsYXNzXG5cdG9uSW5wdXRLZXlQcmVzczogKGUpIC0+XG5cdFx0aWYgZS5rZXkgPT0gJ0VudGVyJ1xuXHRcdFx0QHByb3BzLm9uRGF0YUVudGVyZWQoQHByb3BzLmRhdGFLZXkpXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHRlbHNlIGlmIGUua2V5ID09ICdCYWNrc3BhY2UnIGFuZCBlLnRhcmdldC52YWx1ZS5sZW5ndGggPT0gMFxuXHRcdFx0QHByb3BzLm9uRGF0YURlbGV0ZWQoQHByb3BzLmRhdGFLZXkpXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KClcblxuXHRvbklucHV0Q2hhbmdlOiAoZSkgLT5cblx0XHRAcHJvcHMub25EYXRhQ2hhbmdlZChAcHJvcHMuZGF0YUtleSwgZS50YXJnZXQudmFsdWUpXG5cblx0cmVuZGVyOiAtPlxuXHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiLCB7ICBcXFxuXHRcdFx0XCJ0eXBlXCI6IFwidGV4dFwiLCAgXFxcblx0XHRcdFwiY2xhc3NOYW1lXCI6IFwidHJhbnNhY3Rpb24taW5wdXRcIiwgIFxcXG5cdFx0XHRcInZhbHVlXCI6IChAcHJvcHMudmFsdWUpLCAgXFxcblx0XHRcdFwiZGlzYWJsZWRcIjogKEBwcm9wcy5kaXNhYmxlZCksICBcXFxuXHRcdFx0XCJwbGFjZWhvbGRlclwiOiAoQHByb3BzLnBsYWNlaG9sZGVyKSwgIFxcXG5cdFx0XHRcIm5hbWVcIjogKEBwcm9wcy5kYXRhS2V5KSwgIFxcXG5cdFx0XHRcIm9uS2V5VXBcIjogKEBvbklucHV0S2V5UHJlc3MpLCAgXFxcblx0XHRcdFwib25DaGFuZ2VcIjogKEBvbklucHV0Q2hhbmdlKVxuXHRcdH0pIiwiTGVkZ2VyVHJhbnNhY3Rpb25JbnB1dCA9IHJlcXVpcmUgJy4vTGVkZ2VyVHJhbnNhY3Rpb25JbnB1dC5janN4J1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5SZWFjdC5jcmVhdGVDbGFzc1xuXHRnZXREZWZhdWx0UHJvcHM6IC0+XG5cdFx0c3RhdGljOiBmYWxzZVxuXG5cdGNvbXBvbmVudERpZE1vdW50OiAtPlxuXHRcdEBzZXRTdGF0ZSh0cmFuc2FjdGlvbjogQHByb3BzLnRyYW5zYWN0aW9uLCA9PlxuXHRcdFx0UmVhY3QuZmluZERPTU5vZGUoQHJlZnMuZGVidG9ySW5wdXQpLmZvY3VzKClcblx0XHQpXG5cdGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IChuZXdQcm9wcykgLT5cblx0XHRAc2V0U3RhdGUodHJhbnNhY3Rpb246IG5ld1Byb3BzLnRyYW5zYWN0aW9uKVxuXG5cdG9uQWN0aW9uQnV0dG9uQ2xpY2s6IC0+XG5cdFx0aWYgQHByb3BzLm9uQWN0aW9uPyBcblx0XHRcdEBwcm9wcy5vbkFjdGlvbigpXG5cdG9uRGF0YUVudGVyZWQ6IChkYXRhS2V5KSAtPlxuXHRcdHN3aXRjaCBkYXRhS2V5XG5cdFx0XHR3aGVuICdkZWJ0b3InXG5cdFx0XHRcdEBmb2N1c0NyZWRpdG9ySW5wdXQoKVxuXHRcdFx0d2hlbiAnY3JlZGl0b3InXG5cdFx0XHRcdEBmb2N1c0Ftb3VudElucHV0KClcblx0XHRcdHdoZW4gJ2Ftb3VudCdcblx0XHRcdFx0QHByb3BzLm9uVHJhbnNhY3Rpb25FbnRlcmVkKClcblx0b25EYXRhQ2hhbmdlZDogKGRhdGFLZXksIG5ld1ZhbHVlKSAtPlxuXHRcdHRyYW5zYWN0aW9uID0gQHN0YXRlLnRyYW5zYWN0aW9uXG5cdFx0dHJhbnNhY3Rpb25bZGF0YUtleV0gPSBuZXdWYWx1ZVxuXHRcdEBzZXRTdGF0ZSh0cmFuc2FjdGlvbjogdHJhbnNhY3Rpb24pXG5cdFx0QHByb3BzLm9uVHJhbnNhY3Rpb25DaGFuZ2VkKEBzdGF0ZS50cmFuc2FjdGlvbilcblx0b25EYXRhRGVsZXRlZDogKGRhdGFLZXkpIC0+XG5cdFx0c3dpdGNoIGRhdGFLZXlcblx0XHRcdHdoZW4gJ2RlYnRvcidcblx0XHRcdFx0QHByb3BzLm9uVHJhbnNhY3Rpb25EZWxldGVkKClcblx0XHRcdHdoZW4gJ2NyZWRpdG9yJ1xuXHRcdFx0XHRAZm9jdXNEZWJ0b3JJbnB1dCgpXG5cdFx0XHR3aGVuICdhbW91bnQnXG5cdFx0XHRcdEBmb2N1c0NyZWRpdG9ySW5wdXQoKVxuXHRoYW5kbGVIb3RrZXk6IChlKSAtPlxuXHRcdGlmIGUuY3RybEtleVxuXHRcdFx0c3dpdGNoIFN0cmluZy5mcm9tQ2hhckNvZGUoZS5rZXlDb2RlKVxuXHRcdFx0XHR3aGVuICdTJ1xuXHRcdFx0XHRcdEBwcm9wcy5vblRyYW5zYWN0aW9uRGVsZXRlZCgpXG5cdGZvY3VzRGVidG9ySW5wdXQ6IC0+XG5cdFx0UmVhY3QuZmluZERPTU5vZGUoQHJlZnMuZGVidG9ySW5wdXQpLmZvY3VzKClcblx0Zm9jdXNDcmVkaXRvcklucHV0OiAtPlxuXHRcdFJlYWN0LmZpbmRET01Ob2RlKEByZWZzLmNyZWRpdG9ySW5wdXQpLmZvY3VzKClcblx0Zm9jdXNBbW91bnRJbnB1dDogLT5cblx0XHRSZWFjdC5maW5kRE9NTm9kZShAcmVmcy5hbW91bnRJbnB1dCkuZm9jdXMoKVxuXHRtYWtlVHJhbnNhY3Rpb25JbnB1dDogKGRhdGFLZXksIHBsYWNlaG9sZGVyKSAtPiAoXG5cdFx0UmVhY3QuY3JlYXRlRWxlbWVudChMZWRnZXJUcmFuc2FjdGlvbklucHV0LCB7ICBcXFxuXHRcdFx0XCJyZWZcIjogKFwiI3tkYXRhS2V5fUlucHV0XCIpLCAgXFxcblx0XHRcdFwiZGlzYWJsZWRcIjogKEBwcm9wcy5zdGF0aWMpLCAgXFxcblx0XHRcdFwidmFsdWVcIjogKEBwcm9wcy50cmFuc2FjdGlvbltkYXRhS2V5XSksICBcXFxuXHRcdFx0XCJwbGFjZWhvbGRlclwiOiAocGxhY2Vob2xkZXIpLCAgXFxcblx0XHRcdFwiZGF0YUtleVwiOiAoZGF0YUtleSksICBcXFxuXHRcdFx0XCJvbkRhdGFDaGFuZ2VkXCI6IChAb25EYXRhQ2hhbmdlZCksICBcXFxuXHRcdFx0XCJvbkRhdGFFbnRlcmVkXCI6IChAb25EYXRhRW50ZXJlZCksICBcXFxuXHRcdFx0XCJvbkRhdGFEZWxldGVkXCI6IChAb25EYXRhRGVsZXRlZClcblx0XHRcdCB9KVxuXHQpXG5cblx0cmVuZGVyOiAtPlxuXHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCxcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJhXCIsIHsgIFxcXG5cdFx0XHRcdFwiY2xhc3NOYW1lXCI6IFwidHJhbnNhY3Rpb24tYWN0aW9uLWJ1dHRvblwiLCAgIFxcXG5cdFx0XHRcdFwib25DbGlja1wiOiAoQG9uQWN0aW9uQnV0dG9uQ2xpY2spfSxcblx0XHRcdChcblx0XHRcdFx0aWYgIUBwcm9wcy5zdGF0aWMgdGhlbiAoXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwge1wiY2xhc3NOYW1lXCI6IFwiZ2x5cGhpY29uIGdseXBoaWNvbi1taW51c1wifSlcblx0XHRcdFx0KSBlbHNlIChcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiaVwiLCB7XCJjbGFzc05hbWVcIjogXCJnbHlwaGljb24gZ2x5cGhpY29uLW9rXCJ9KVxuXHRcdFx0XHQpXG5cdFx0XHQpXG5cdFx0XHQpLFxuXHRcdFx0KEBtYWtlVHJhbnNhY3Rpb25JbnB1dCgnZGVidG9yJywgJ2VudGVyIG5hbWUnKSksXG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCBudWxsLCBcIiBvd2VzIFwiKSxcblx0XHRcdChAbWFrZVRyYW5zYWN0aW9uSW5wdXQoJ2NyZWRpdG9yJywgJ2VudGVyIG5hbWUnKSksXG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCBudWxsLCBcIiBhbiBhbW91bnQgb2YgXCIpLFxuXHRcdFx0KEBtYWtlVHJhbnNhY3Rpb25JbnB1dCgnYW1vdW50JywgJ2VudGVyIGFtb3VudCcpKVxuXHRcdCkiLCJMZWRnZXJUcmFuc2FjdGlvblZpZXcgPSByZXF1aXJlICcuL0xlZGdlclRyYW5zYWN0aW9uVmlldy5janN4J1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5SZWFjdC5jcmVhdGVDbGFzc1xuXHRyZW5kZXI6IC0+XG5cdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XCJjbGFzc05hbWVcIjogXCJyb3dcIiwgXCJzdHlsZVwiOiAoe21hcmdpblRvcDogJzEwcHgnfSl9LFxuXHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XCJjbGFzc05hbWVcIjogXCJjb2wtc20tMTIgbGVkZ2VyLWNvbnRhaW5lclwifSxcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XCJjbGFzc05hbWVcIjogXCJsZWRnZXItYWN0aW9uc1wifSxcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiaDRcIiwge1wiY2xhc3NOYW1lXCI6IFwidGV4dC1sZWZ0XCJ9LCBcIlwiXCJcblxcdFxcdFxcdFxcdFxcdFxcdE9wdGltaXplZCBMZWRnZXIgXG5cIlwiXCIsIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzbWFsbFwiLCBudWxsLCBcdFx0XG5cdFx0XHRcdFx0XHQoXG5cdFx0XHRcdFx0XHRcdGlmIEBwcm9wcy5kYXRlTGFzdE9wdGltaXplZD8gdGhlbiAoXG5cdFx0XHRcdFx0XHRcdFx0bW9tZW50KEBwcm9wcy5kYXRlTGFzdE9wdGltaXplZCkuY2FsZW5kYXIoKVxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHQpLFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcImNsYXNzTmFtZVwiOiBcInRyYW5zYWN0aW9ucy1jb250YWluZXJcIn0sXG5cdFx0XHRcdFx0KFxuXHRcdFx0XHRcdFx0QHByb3BzLnRyYW5zYWN0aW9ucy5tYXAoKHRyYW5zYWN0aW9uLCBpbmRleCkgPT5cblx0XHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChMZWRnZXJUcmFuc2FjdGlvblZpZXcsIHsgXFxcblx0XHRcdFx0XHRcdFx0XHRcInRyYW5zYWN0aW9uXCI6ICh0cmFuc2FjdGlvbiksICBcXFxuXHRcdFx0XHRcdFx0XHRcdFwic3RhdGljXCI6ICh0cnVlKSwgIFxcXG5cdFx0XHRcdFx0XHRcdFx0XCJrZXlcIjogKGluZGV4KVxuXHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHQpLFxuXHRcdFx0XHQoXG5cdFx0XHRcdFx0aWYgQHByb3BzLnRyYW5zYWN0aW9ucy5sZW5ndGggPT0gMCB0aGVuIChcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIG51bGwsIFwiIE5vIFRyYW5zYWN0aW9ucyBcIilcblx0XHRcdFx0XHQpXG5cdFx0XHRcdClcblx0XHRcdClcblx0XHQpIiwiQXBwVmlld0NvbnRyb2xsZXIgPSByZXF1aXJlICcuL0FwcFZpZXdDb250cm9sbGVyLmNqc3gnXG5cblJlYWN0LnJlbmRlcihcbiAgUmVhY3QuY3JlYXRlRWxlbWVudChBcHBWaWV3Q29udHJvbGxlciwgbnVsbCksXG4gIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JylbMF1cbilcbiJdfQ==
