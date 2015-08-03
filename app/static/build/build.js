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
    })));
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy5ub2RlL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi4uLy4uLy4uLy4uLy5ub2RlL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9yZWFjdC1ob3RrZXkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcmVhY3QvbGliL0V2ZW50TGlzdGVuZXIuanMiLCJub2RlX21vZHVsZXMvcmVhY3QvbGliL09iamVjdC5hc3NpZ24uanMiLCJub2RlX21vZHVsZXMvcmVhY3QvbGliL1Bvb2xlZENsYXNzLmpzIiwibm9kZV9tb2R1bGVzL3JlYWN0L2xpYi9TeW50aGV0aWNFdmVudC5qcyIsIm5vZGVfbW9kdWxlcy9yZWFjdC9saWIvU3ludGhldGljS2V5Ym9hcmRFdmVudC5qcyIsIm5vZGVfbW9kdWxlcy9yZWFjdC9saWIvU3ludGhldGljVUlFdmVudC5qcyIsIm5vZGVfbW9kdWxlcy9yZWFjdC9saWIvZW1wdHlGdW5jdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9yZWFjdC9saWIvZ2V0RXZlbnRDaGFyQ29kZS5qcyIsIm5vZGVfbW9kdWxlcy9yZWFjdC9saWIvZ2V0RXZlbnRLZXkuanMiLCJub2RlX21vZHVsZXMvcmVhY3QvbGliL2dldEV2ZW50TW9kaWZpZXJTdGF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9yZWFjdC9saWIvZ2V0RXZlbnRUYXJnZXQuanMiLCJub2RlX21vZHVsZXMvcmVhY3QvbGliL2ludmFyaWFudC5qcyIsIi9Vc2Vycy9taXRjaC9zYngvcmVzb2x2ZV9kZWJ0cy9hcHAvc3RhdGljL3NjcmlwdHMvQXBwVmlld0NvbnRyb2xsZXIuY2pzeCIsIi9Vc2Vycy9taXRjaC9zYngvcmVzb2x2ZV9kZWJ0cy9hcHAvc3RhdGljL3NjcmlwdHMvTGVkZ2VyRWRpdG9yVmlld0NvbnRyb2xsZXIuY2pzeCIsIi9Vc2Vycy9taXRjaC9zYngvcmVzb2x2ZV9kZWJ0cy9hcHAvc3RhdGljL3NjcmlwdHMvTGVkZ2VyVHJhbnNhY3Rpb25JbnB1dC5janN4IiwiL1VzZXJzL21pdGNoL3NieC9yZXNvbHZlX2RlYnRzL2FwcC9zdGF0aWMvc2NyaXB0cy9MZWRnZXJUcmFuc2FjdGlvblZpZXcuY2pzeCIsIi9Vc2Vycy9taXRjaC9zYngvcmVzb2x2ZV9kZWJ0cy9hcHAvc3RhdGljL3NjcmlwdHMvTGVkZ2VyVmlld2VyVmlld0NvbnRyb2xsZXIuY2pzeCIsIi9Vc2Vycy9taXRjaC9zYngvcmVzb2x2ZV9kZWJ0cy9hcHAvc3RhdGljL3NjcmlwdHMvaW5kZXguY2pzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDM0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDaEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDckRBLElBQUE7O0FBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxjQUFSOztBQUVULE1BQU0sQ0FBQyxRQUFQLENBQUE7O0FBRUEsMEJBQUEsR0FBNkIsT0FBQSxDQUFRLG1DQUFSOztBQUM3QiwwQkFBQSxHQUE2QixPQUFBLENBQVEsbUNBQVI7O0FBRTdCLE1BQU0sQ0FBQyxPQUFQLEdBQ0EsS0FBSyxDQUFDLFdBQU4sQ0FDQztFQUFBLE1BQUEsRUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFQLENBQWEsY0FBYixDQUFELENBQVI7RUFDQSxlQUFBLEVBQWlCLFNBQUE7V0FDaEI7TUFBQSxxQkFBQSxFQUF1QixFQUF2QjtNQUNBLGlCQUFBLEVBQW1CLElBRG5COztFQURnQixDQURqQjtFQUtBLGNBQUEsRUFBZ0IsU0FBQyxTQUFELEVBQVksVUFBWjtXQUNmLEtBQ0MsQ0FBQyxJQURGLENBQ08sV0FEUCxFQUNvQixTQURwQixDQUVDLENBQUMsSUFGRixDQUVPLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxXQUFEO0FBQ0wsWUFBQTtRQUFBLFlBQUEsR0FBZSxXQUFXLENBQUMsSUFBSyxDQUFBLGNBQUE7UUFDaEMsS0FBQyxDQUFBLFFBQUQsQ0FDQztVQUFBLHFCQUFBLEVBQXVCLFlBQXZCO1VBQ0EsaUJBQUEsRUFBdUIsSUFBQSxJQUFBLENBQUEsQ0FEdkI7U0FERDtlQUlBLFVBQUEsQ0FBQTtNQU5LO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUZQLENBVUMsQ0FBQyxPQUFELENBVkQsQ0FVUSxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsS0FBRDtlQUNOLFVBQUEsQ0FBQTtNQURNO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVZSO0VBRGUsQ0FMaEI7RUFvQkEsWUFBQSxFQUFjLFNBQUMsQ0FBRDtJQUNiLElBQUcsQ0FBQyxDQUFDLE9BQUw7QUFDQyxjQUFPLE1BQU0sQ0FBQyxZQUFQLENBQW9CLENBQUMsQ0FBQyxPQUF0QixDQUFQO0FBQUEsYUFDTSxHQUROO2lCQUVFLElBQUMsQ0FBQSxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQW5CLENBQUE7QUFGRixhQUdNLEdBSE47aUJBSUUsSUFBQyxDQUFBLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBbkIsQ0FBQTtBQUpGLGFBS00sR0FMTjtpQkFNRSxJQUFDLENBQUEsSUFBSSxDQUFDLFlBQVksQ0FBQyxnQkFBbkIsQ0FBQTtBQU5GLE9BREQ7O0VBRGEsQ0FwQmQ7RUE4QkEsZ0JBQUEsRUFBa0IsU0FBQTtXQUNqQixJQUFDLENBQUEsSUFBSSxDQUFDLFlBQVksQ0FBQyxnQkFBbkIsQ0FBQTtFQURpQixDQTlCbEI7RUFnQ0EsT0FBQSxFQUFTLFNBQUE7V0FDUixJQUFDLENBQUEsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFuQixDQUFBO0VBRFEsQ0FoQ1Q7RUFrQ0EsVUFBQSxFQUFZLFNBQUE7V0FDWCxJQUFDLENBQUEsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFuQixDQUFBO0VBRFcsQ0FsQ1o7RUFzQ0EsTUFBQSxFQUFRLFNBQUE7QUFDUCxXQUNDLEtBQUssQ0FBQyxhQUFOLENBQW9CLEtBQXBCLEVBQTJCO01BQUMsV0FBQSxFQUFhLFdBQWQ7TUFBMkIsU0FBQSxFQUFZLElBQUMsQ0FBQSxPQUF4QztLQUEzQixFQUNDLEtBQUssQ0FBQyxhQUFOLENBQW9CLEtBQXBCLEVBQTJCO01BQUMsV0FBQSxFQUFhLGVBQWQ7S0FBM0IsRUFDQyxLQUFLLENBQUMsYUFBTixDQUFvQixJQUFwQixFQUEwQixJQUExQixFQUFnQyxxQ0FBaEMsRUFHQSxLQUFLLENBQUMsYUFBTixDQUFvQixPQUFwQixFQUE2QixJQUE3QixFQUFtQyx1RkFBbkMsQ0FIQSxDQURELEVBTUMsS0FBSyxDQUFDLGFBQU4sQ0FBb0IsR0FBcEIsRUFBeUIsSUFBekIsRUFBK0IsNkVBQS9CLENBTkQsRUFTQyxLQUFLLENBQUMsYUFBTixDQUFvQixRQUFwQixFQUE4QjtNQUFDLFdBQUEsRUFBYSxpQkFBZDtNQUFpQyxTQUFBLEVBQVksSUFBQyxDQUFBLGdCQUE5QztLQUE5QixFQUFnRyxzQ0FBaEcsQ0FURCxFQVlDLEtBQUssQ0FBQyxhQUFOLENBQW9CLFFBQXBCLEVBQThCO01BQUMsV0FBQSxFQUFhLGlCQUFkO01BQWlDLFNBQUEsRUFBWSxJQUFDLENBQUEsT0FBOUM7S0FBOUIsRUFBdUYsNEJBQXZGLENBWkQsRUFlQyxLQUFLLENBQUMsYUFBTixDQUFvQixRQUFwQixFQUE4QjtNQUFDLFdBQUEsRUFBYSxpQkFBZDtNQUFpQyxTQUFBLEVBQVksSUFBQyxDQUFBLFVBQTlDO0tBQTlCLEVBQTBGLGdDQUExRixDQWZELEVBa0JDLEtBQUssQ0FBQyxhQUFOLENBQW9CLDBCQUFwQixFQUFnRDtNQUMvQyxLQUFBLEVBQU8sY0FEd0M7TUFFL0MsZ0JBQUEsRUFBbUIsSUFBQyxDQUFBLGNBRjJCO0tBQWhELENBbEJELEVBc0JDLEtBQUssQ0FBQyxhQUFOLENBQW9CLDBCQUFwQixFQUFnRDtNQUMvQyxjQUFBLEVBQWlCLElBQUMsQ0FBQSxLQUFLLENBQUMscUJBRHVCO01BRS9DLG1CQUFBLEVBQXNCLElBQUMsQ0FBQSxLQUFLLENBQUMsaUJBRmtCO0tBQWhELENBdEJELENBREQ7RUFGTSxDQXRDUjtDQUREOzs7O0FDUkEsSUFBQTs7QUFBQSxxQkFBQSxHQUF3QixPQUFBLENBQVEsOEJBQVI7O0FBRXhCLE1BQU0sQ0FBQyxPQUFQLEdBQ0EsS0FBSyxDQUFDLFdBQU4sQ0FDQztFQUFBLGVBQUEsRUFBaUIsU0FBQTtXQUNoQjtNQUFBLFlBQUEsRUFBYyxLQUFkO01BQ0EsWUFBQSxFQUFjLENBQ2IsSUFBQyxDQUFBLG9CQUFELENBQUEsQ0FEYSxDQURkOztFQURnQixDQUFqQjtFQUtBLG9CQUFBLEVBQXNCLFNBQUE7V0FBRztNQUN4QixNQUFBLEVBQVEsRUFEZ0I7TUFFeEIsUUFBQSxFQUFVLEVBRmM7TUFHeEIsTUFBQSxFQUFRLEVBSGdCOztFQUFILENBTHRCO0VBVUEsbUJBQUEsRUFBcUIsU0FBQTtBQUNwQixRQUFBO0lBQUEsY0FBQSxHQUFpQixJQUFDLENBQUEsb0JBQUQsQ0FBQTtJQUNqQixJQUFDLENBQUEsS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFwQixDQUF5QixjQUF6QjtXQUNBLElBQUMsQ0FBQSxRQUFELENBQVU7TUFBQSxZQUFBLEVBQWMsSUFBQyxDQUFBLEtBQUssQ0FBQyxZQUFyQjtLQUFWO0VBSG9CLENBVnJCO0VBY0Esc0JBQUEsRUFBd0IsU0FBQTtXQUN2QixJQUFDLENBQUEsd0JBQUQsQ0FBMEIsQ0FBMUI7RUFEdUIsQ0FkeEI7RUFnQkEsd0JBQUEsRUFBMEIsU0FBQyxLQUFEO0lBQ3pCLElBQUcsS0FBQSxHQUFRLENBQVg7TUFDQyxJQUFDLENBQUEsc0JBQUQsQ0FBd0IsS0FBQSxHQUFRLENBQWhDLENBQWtDLENBQUMsZ0JBQW5DLENBQUEsRUFERDs7SUFFQSxJQUFDLENBQUEsS0FBSyxDQUFDLFlBQVksQ0FBQyxNQUFwQixDQUEyQixLQUEzQixFQUFrQyxDQUFsQztXQUNBLElBQUMsQ0FBQSxRQUFELENBQVU7TUFBQSxZQUFBLEVBQWMsSUFBQyxDQUFBLEtBQUssQ0FBQyxZQUFyQjtLQUFWO0VBSnlCLENBaEIxQjtFQXFCQSxXQUFBLEVBQWEsU0FBQTtBQUNaLFFBQUE7SUFBQSxJQUFDLENBQUEsUUFBRCxDQUFVO01BQUEsWUFBQSxFQUFjLElBQWQ7S0FBVjtJQUNBLFVBQUEsR0FBYSxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUE7ZUFDWixLQUFDLENBQUEsUUFBRCxDQUFVO1VBQUEsWUFBQSxFQUFjLEtBQWQ7U0FBVjtNQURZO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtXQUViLElBQUMsQ0FBQSxLQUFLLENBQUMsY0FBUCxDQUFzQixJQUFDLENBQUEsS0FBSyxDQUFDLFlBQTdCLEVBQTJDLFVBQTNDO0VBSlksQ0FyQmI7RUEyQkEsZ0JBQUEsRUFBa0IsU0FBQTtXQUNqQixJQUFDLENBQUEsbUJBQUQsQ0FBQTtFQURpQixDQTNCbEI7RUE2QkEsVUFBQSxFQUFZLFNBQUE7V0FDWCxJQUFDLENBQUEsV0FBRCxDQUFBO0VBRFcsQ0E3Qlo7RUErQkEsT0FBQSxFQUFTLFNBQUE7V0FDUixJQUFDLENBQUEsUUFBRCxDQUFVLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FBVjtFQURRLENBL0JUO0VBaUNBLG1CQUFBLEVBQXFCLFNBQUMsS0FBRDtXQUNwQixJQUFDLENBQUEsd0JBQUQsQ0FBMEIsS0FBMUI7RUFEb0IsQ0FqQ3JCO0VBbUNBLG9CQUFBLEVBQXNCLFNBQUMsV0FBRCxFQUFjLEtBQWQ7SUFDckIsSUFBQyxDQUFBLEtBQUssQ0FBQyxZQUFhLENBQUEsS0FBQSxDQUFwQixHQUE2QjtXQUM3QixJQUFDLENBQUEsUUFBRCxDQUFVO01BQUEsWUFBQSxFQUFjLElBQUMsQ0FBQSxLQUFLLENBQUMsWUFBckI7S0FBVjtFQUZxQixDQW5DdEI7RUFzQ0Esb0JBQUEsRUFBc0IsU0FBQyxLQUFEO0FBQ3JCLFFBQUE7SUFBQSxJQUFHLEtBQUEsR0FBUSxJQUFDLENBQUEsS0FBSyxDQUFDLFlBQVksQ0FBQyxNQUFwQixHQUE2QixDQUF4QztNQUNDLGVBQUEsR0FBa0IsSUFBQyxDQUFBLHNCQUFELENBQXdCLEtBQUEsR0FBUSxDQUFoQzthQUNsQixlQUFlLENBQUMsZ0JBQWhCLENBQUEsRUFGRDtLQUFBLE1BQUE7YUFJQyxJQUFDLENBQUEsbUJBQUQsQ0FBQSxFQUpEOztFQURxQixDQXRDdEI7RUE0Q0Esb0JBQUEsRUFBc0IsU0FBQyxLQUFEO0lBQ3JCLElBQUcsS0FBQSxHQUFRLENBQVg7YUFDQyxJQUFDLENBQUEsd0JBQUQsQ0FBMEIsS0FBMUIsRUFERDs7RUFEcUIsQ0E1Q3RCO0VBZ0RBLHdCQUFBLEVBQTBCLFNBQUMsS0FBRDtXQUN6QixpQkFBQSxHQUFrQjtFQURPLENBaEQxQjtFQWtEQSxzQkFBQSxFQUF3QixTQUFDLEtBQUQ7QUFDdkIsUUFBQTtJQUFBLEdBQUEsR0FBTSxJQUFDLENBQUEsd0JBQUQsQ0FBMEIsS0FBMUI7QUFDTixXQUFPLElBQUMsQ0FBQSxJQUFLLENBQUEsR0FBQTtFQUZVLENBbER4QjtFQXNEQSxNQUFBLEVBQVEsU0FBQTtBQUNQLFFBQUE7SUFBQSxnQkFBQSxHQUFtQixJQUFDLENBQUEsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFwQixDQUF3QixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsV0FBRCxFQUFjLEtBQWQ7ZUFDMUMsS0FBSyxDQUFDLGFBQU4sQ0FBb0IscUJBQXBCLEVBQTJDO1VBQzFDLEtBQUEsRUFBUSxLQURrQztVQUUxQyxLQUFBLEVBQVEsS0FBQyxDQUFBLHdCQUFELENBQTBCLEtBQTFCLENBRmtDO1VBRzFDLGFBQUEsRUFBZ0IsV0FIMEI7VUFJMUMsVUFBQSxFQUFZLENBQUMsU0FBQTttQkFBRyxLQUFDLENBQUEsbUJBQUQsQ0FBcUIsS0FBckI7VUFBSCxDQUFELENBSjhCO1VBSzFDLHNCQUFBLEVBQXdCLENBQUMsU0FBQyxLQUFEO21CQUFXLEtBQUMsQ0FBQSxvQkFBRCxDQUFzQixLQUF0QixFQUE2QixLQUE3QjtVQUFYLENBQUQsQ0FMa0I7VUFNMUMsc0JBQUEsRUFBd0IsQ0FBQyxTQUFBO21CQUFHLEtBQUMsQ0FBQSxvQkFBRCxDQUFzQixLQUF0QjtVQUFILENBQUQsQ0FOa0I7VUFPMUMsc0JBQUEsRUFBd0IsQ0FBQyxTQUFBO21CQUFHLEtBQUMsQ0FBQSxvQkFBRCxDQUFzQixLQUF0QjtVQUFILENBQUQsQ0FQa0I7U0FBM0M7TUFEMEM7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXhCO0FBV25CLFdBQ0MsS0FBSyxDQUFDLGFBQU4sQ0FBb0IsS0FBcEIsRUFBMkI7TUFDMUIsV0FBQSxFQUFhLEtBRGE7TUFFMUIsT0FBQSxFQUFVO1FBQUMsU0FBQSxFQUFXLE1BQVo7T0FGZ0I7S0FBM0IsRUFJQyxLQUFLLENBQUMsYUFBTixDQUFvQixLQUFwQixFQUEyQjtNQUFDLFdBQUEsRUFBYSw0QkFBZDtLQUEzQixFQUNDLEtBQUssQ0FBQyxhQUFOLENBQW9CLEtBQXBCLEVBQTJCO01BQUMsV0FBQSxFQUFhLGdCQUFkO0tBQTNCLEVBQ0MsS0FBSyxDQUFDLGFBQU4sQ0FBb0IsSUFBcEIsRUFBMEI7TUFBQyxXQUFBLEVBQWEsV0FBZDtLQUExQixFQUFzRCx1QkFBdEQsRUFFRCxLQUFLLENBQUMsYUFBTixDQUFvQixPQUFwQixFQUE2QixJQUE3QixFQUNHLENBQUksSUFBQyxDQUFBLEtBQUssQ0FBQyxZQUFWLEdBQTRCLGNBQTVCLEdBQUEsTUFBRCxDQURILENBRkMsQ0FERCxDQURELEVBU0MsS0FBSyxDQUFDLGFBQU4sQ0FBb0IsS0FBcEIsRUFBMkI7TUFBQyxXQUFBLEVBQWEsd0JBQWQ7TUFBd0MsS0FBQSxFQUFPLHVCQUEvQztLQUEzQixFQUNFLGdCQURGLENBVEQsQ0FKRDtFQWJNLENBdERSO0NBREQ7Ozs7QUNIQSxNQUFNLENBQUMsT0FBUCxHQUNBLEtBQUssQ0FBQyxXQUFOLENBQ0M7RUFBQSxlQUFBLEVBQWlCLFNBQUMsQ0FBRDtJQUNoQixJQUFHLENBQUMsQ0FBQyxHQUFGLEtBQVMsT0FBWjtNQUNDLElBQUMsQ0FBQSxLQUFLLENBQUMsYUFBUCxDQUFxQixJQUFDLENBQUEsS0FBSyxDQUFDLE9BQTVCO2FBQ0EsQ0FBQyxDQUFDLGNBQUYsQ0FBQSxFQUZEO0tBQUEsTUFHSyxJQUFHLENBQUMsQ0FBQyxHQUFGLEtBQVMsV0FBVCxJQUF5QixDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFmLEtBQXlCLENBQXJEO01BQ0osSUFBQyxDQUFBLEtBQUssQ0FBQyxhQUFQLENBQXFCLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBNUI7YUFDQSxDQUFDLENBQUMsY0FBRixDQUFBLEVBRkk7O0VBSlcsQ0FBakI7RUFRQSxhQUFBLEVBQWUsU0FBQyxDQUFEO1dBQ2QsSUFBQyxDQUFBLEtBQUssQ0FBQyxhQUFQLENBQXFCLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBNUIsRUFBcUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUE5QztFQURjLENBUmY7RUFXQSxNQUFBLEVBQVEsU0FBQTtXQUNQLEtBQUssQ0FBQyxhQUFOLENBQW9CLE9BQXBCLEVBQTZCO01BQzVCLE1BQUEsRUFBUSxNQURvQjtNQUU1QixXQUFBLEVBQWEsbUJBRmU7TUFHNUIsT0FBQSxFQUFVLElBQUMsQ0FBQSxLQUFLLENBQUMsS0FIVztNQUk1QixVQUFBLEVBQWEsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUpRO01BSzVCLGFBQUEsRUFBZ0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxXQUxLO01BTTVCLE1BQUEsRUFBUyxJQUFDLENBQUEsS0FBSyxDQUFDLE9BTlk7TUFPNUIsU0FBQSxFQUFZLElBQUMsQ0FBQSxlQVBlO01BUTVCLFVBQUEsRUFBYSxJQUFDLENBQUEsYUFSYztLQUE3QjtFQURPLENBWFI7Q0FERDs7OztBQ0RBLElBQUE7O0FBQUEsc0JBQUEsR0FBeUIsT0FBQSxDQUFRLCtCQUFSOztBQUV6QixNQUFNLENBQUMsT0FBUCxHQUNBLEtBQUssQ0FBQyxXQUFOLENBQ0M7RUFBQSxlQUFBLEVBQWlCLFNBQUE7V0FDaEI7TUFBQSxRQUFBLEVBQVEsS0FBUjs7RUFEZ0IsQ0FBakI7RUFHQSxpQkFBQSxFQUFtQixTQUFBO1dBQ2xCLElBQUMsQ0FBQSxRQUFELENBQVU7TUFBQSxXQUFBLEVBQWEsSUFBQyxDQUFBLEtBQUssQ0FBQyxXQUFwQjtLQUFWLEVBQTJDLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQTtlQUMxQyxLQUFLLENBQUMsV0FBTixDQUFrQixLQUFDLENBQUEsSUFBSSxDQUFDLFdBQXhCLENBQW9DLENBQUMsS0FBckMsQ0FBQTtNQUQwQztJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBM0M7RUFEa0IsQ0FIbkI7RUFPQSx5QkFBQSxFQUEyQixTQUFDLFFBQUQ7V0FDMUIsSUFBQyxDQUFBLFFBQUQsQ0FBVTtNQUFBLFdBQUEsRUFBYSxRQUFRLENBQUMsV0FBdEI7S0FBVjtFQUQwQixDQVAzQjtFQVVBLG1CQUFBLEVBQXFCLFNBQUE7SUFDcEIsSUFBRywyQkFBSDthQUNDLElBQUMsQ0FBQSxLQUFLLENBQUMsUUFBUCxDQUFBLEVBREQ7O0VBRG9CLENBVnJCO0VBYUEsYUFBQSxFQUFlLFNBQUMsT0FBRDtBQUNkLFlBQU8sT0FBUDtBQUFBLFdBQ00sUUFETjtlQUVFLElBQUMsQ0FBQSxrQkFBRCxDQUFBO0FBRkYsV0FHTSxVQUhOO2VBSUUsSUFBQyxDQUFBLGdCQUFELENBQUE7QUFKRixXQUtNLFFBTE47ZUFNRSxJQUFDLENBQUEsS0FBSyxDQUFDLG9CQUFQLENBQUE7QUFORjtFQURjLENBYmY7RUFxQkEsYUFBQSxFQUFlLFNBQUMsT0FBRCxFQUFVLFFBQVY7QUFDZCxRQUFBO0lBQUEsV0FBQSxHQUFjLElBQUMsQ0FBQSxLQUFLLENBQUM7SUFDckIsV0FBWSxDQUFBLE9BQUEsQ0FBWixHQUF1QjtJQUN2QixJQUFDLENBQUEsUUFBRCxDQUFVO01BQUEsV0FBQSxFQUFhLFdBQWI7S0FBVjtXQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsb0JBQVAsQ0FBNEIsSUFBQyxDQUFBLEtBQUssQ0FBQyxXQUFuQztFQUpjLENBckJmO0VBMEJBLGFBQUEsRUFBZSxTQUFDLE9BQUQ7QUFDZCxZQUFPLE9BQVA7QUFBQSxXQUNNLFFBRE47ZUFFRSxJQUFDLENBQUEsS0FBSyxDQUFDLG9CQUFQLENBQUE7QUFGRixXQUdNLFVBSE47ZUFJRSxJQUFDLENBQUEsZ0JBQUQsQ0FBQTtBQUpGLFdBS00sUUFMTjtlQU1FLElBQUMsQ0FBQSxrQkFBRCxDQUFBO0FBTkY7RUFEYyxDQTFCZjtFQWtDQSxZQUFBLEVBQWMsU0FBQyxDQUFEO0lBQ2IsSUFBRyxDQUFDLENBQUMsT0FBTDtBQUNDLGNBQU8sTUFBTSxDQUFDLFlBQVAsQ0FBb0IsQ0FBQyxDQUFDLE9BQXRCLENBQVA7QUFBQSxhQUNNLEdBRE47aUJBRUUsSUFBQyxDQUFBLEtBQUssQ0FBQyxvQkFBUCxDQUFBO0FBRkYsT0FERDs7RUFEYSxDQWxDZDtFQXVDQSxnQkFBQSxFQUFrQixTQUFBO1dBQ2pCLEtBQUssQ0FBQyxXQUFOLENBQWtCLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBeEIsQ0FBb0MsQ0FBQyxLQUFyQyxDQUFBO0VBRGlCLENBdkNsQjtFQXlDQSxrQkFBQSxFQUFvQixTQUFBO1dBQ25CLEtBQUssQ0FBQyxXQUFOLENBQWtCLElBQUMsQ0FBQSxJQUFJLENBQUMsYUFBeEIsQ0FBc0MsQ0FBQyxLQUF2QyxDQUFBO0VBRG1CLENBekNwQjtFQTJDQSxnQkFBQSxFQUFrQixTQUFBO1dBQ2pCLEtBQUssQ0FBQyxXQUFOLENBQWtCLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBeEIsQ0FBb0MsQ0FBQyxLQUFyQyxDQUFBO0VBRGlCLENBM0NsQjtFQTZDQSxvQkFBQSxFQUFzQixTQUFDLE9BQUQsRUFBVSxXQUFWO1dBQ3JCLEtBQUssQ0FBQyxhQUFOLENBQW9CLHNCQUFwQixFQUE0QztNQUMzQyxLQUFBLEVBQVcsT0FBRCxHQUFTLE9BRHdCO01BRTNDLFVBQUEsRUFBYSxJQUFDLENBQUEsS0FBSyxDQUFDLFFBQUQsQ0FGd0I7TUFHM0MsT0FBQSxFQUFVLElBQUMsQ0FBQSxLQUFLLENBQUMsV0FBWSxDQUFBLE9BQUEsQ0FIYztNQUkzQyxhQUFBLEVBQWdCLFdBSjJCO01BSzNDLFNBQUEsRUFBWSxPQUwrQjtNQU0zQyxlQUFBLEVBQWtCLElBQUMsQ0FBQSxhQU53QjtNQU8zQyxlQUFBLEVBQWtCLElBQUMsQ0FBQSxhQVB3QjtNQVEzQyxlQUFBLEVBQWtCLElBQUMsQ0FBQSxhQVJ3QjtLQUE1QztFQURxQixDQTdDdEI7RUEwREEsTUFBQSxFQUFRLFNBQUE7V0FDUCxLQUFLLENBQUMsYUFBTixDQUFvQixLQUFwQixFQUEyQixJQUEzQixFQUNDLEtBQUssQ0FBQyxhQUFOLENBQW9CLEdBQXBCLEVBQXlCO01BQ3hCLFdBQUEsRUFBYSwyQkFEVztNQUV4QixTQUFBLEVBQVksSUFBQyxDQUFBLG1CQUZXO0tBQXpCLEVBR0EsQ0FDSSxDQUFDLElBQUMsQ0FBQSxLQUFLLENBQUMsUUFBRCxDQUFWLEdBQ0MsS0FBSyxDQUFDLGFBQU4sQ0FBb0IsR0FBcEIsRUFBeUI7TUFBQyxXQUFBLEVBQWEsMkJBQWQ7S0FBekIsQ0FERCxHQUdDLEtBQUssQ0FBQyxhQUFOLENBQW9CLEdBQXBCLEVBQXlCO01BQUMsV0FBQSxFQUFhLHdCQUFkO0tBQXpCLENBSkYsQ0FIQSxDQURELEVBWUUsSUFBQyxDQUFBLG9CQUFELENBQXNCLFFBQXRCLEVBQWdDLFlBQWhDLENBWkYsRUFhQyxLQUFLLENBQUMsYUFBTixDQUFvQixNQUFwQixFQUE0QixJQUE1QixFQUFrQyxRQUFsQyxDQWJELEVBY0UsSUFBQyxDQUFBLG9CQUFELENBQXNCLFVBQXRCLEVBQWtDLFlBQWxDLENBZEYsRUFlQyxLQUFLLENBQUMsYUFBTixDQUFvQixNQUFwQixFQUE0QixJQUE1QixFQUFrQyxnQkFBbEMsQ0FmRCxFQWdCRSxJQUFDLENBQUEsb0JBQUQsQ0FBc0IsUUFBdEIsRUFBZ0MsY0FBaEMsQ0FoQkY7RUFETyxDQTFEUjtDQUREOzs7O0FDSEEsSUFBQTs7QUFBQSxxQkFBQSxHQUF3QixPQUFBLENBQVEsOEJBQVI7O0FBRXhCLE1BQU0sQ0FBQyxPQUFQLEdBQ0EsS0FBSyxDQUFDLFdBQU4sQ0FDQztFQUFBLE1BQUEsRUFBUSxTQUFBO1dBQ1AsS0FBSyxDQUFDLGFBQU4sQ0FBb0IsS0FBcEIsRUFBMkI7TUFBQyxXQUFBLEVBQWEsS0FBZDtNQUFxQixPQUFBLEVBQVU7UUFBQyxTQUFBLEVBQVcsTUFBWjtPQUEvQjtLQUEzQixFQUNDLEtBQUssQ0FBQyxhQUFOLENBQW9CLEtBQXBCLEVBQTJCO01BQUMsV0FBQSxFQUFhLDRCQUFkO0tBQTNCLEVBQ0MsS0FBSyxDQUFDLGFBQU4sQ0FBb0IsS0FBcEIsRUFBMkI7TUFBQyxXQUFBLEVBQWEsZ0JBQWQ7S0FBM0IsRUFDQyxLQUFLLENBQUMsYUFBTixDQUFvQixJQUFwQixFQUEwQjtNQUFDLFdBQUEsRUFBYSxXQUFkO0tBQTFCLEVBQXNELCtCQUF0RCxFQUVBLEtBQUssQ0FBQyxhQUFOLENBQW9CLE9BQXBCLEVBQTZCLElBQTdCLEVBQ0MsQ0FDSSxvQ0FBSCxHQUNDLE1BQUEsQ0FBTyxJQUFDLENBQUEsS0FBSyxDQUFDLGlCQUFkLENBQWdDLENBQUMsUUFBakMsQ0FBQSxDQURELEdBQUEsTUFERCxDQURELENBRkEsQ0FERCxDQURELEVBYUMsS0FBSyxDQUFDLGFBQU4sQ0FBb0IsS0FBcEIsRUFBMkI7TUFBQyxXQUFBLEVBQWEsd0JBQWQ7S0FBM0IsRUFFRSxJQUFDLENBQUEsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFwQixDQUF3QixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsV0FBRCxFQUFjLEtBQWQ7ZUFDdkIsS0FBSyxDQUFDLGFBQU4sQ0FBb0IscUJBQXBCLEVBQTJDO1VBQzFDLGFBQUEsRUFBZ0IsV0FEMEI7VUFFMUMsUUFBQSxFQUFXLElBRitCO1VBRzFDLEtBQUEsRUFBUSxLQUhrQztTQUEzQztNQUR1QjtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEIsQ0FGRixDQWJELEVBd0JDLENBQ0ksSUFBQyxDQUFBLEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBcEIsS0FBOEIsQ0FBakMsR0FDQyxLQUFLLENBQUMsYUFBTixDQUFvQixNQUFwQixFQUE0QixJQUE1QixFQUFrQyxtQkFBbEMsQ0FERCxHQUFBLE1BREQsQ0F4QkQsQ0FERDtFQURPLENBQVI7Q0FERDs7OztBQ0hBLElBQUE7O0FBQUEsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLDBCQUFSOztBQUVwQixLQUFLLENBQUMsTUFBTixDQUNFLEtBQUssQ0FBQyxhQUFOLENBQW9CLGlCQUFwQixFQUF1QyxJQUF2QyxDQURGLEVBRUUsUUFBUSxDQUFDLG9CQUFULENBQThCLE1BQTlCLENBQXNDLENBQUEsQ0FBQSxDQUZ4QyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gc2V0VGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBzZXRUaW1lb3V0KGRyYWluUXVldWUsIDApO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsInZhciBFdmVudExpc3RlbmVyID0gcmVxdWlyZSgncmVhY3QvbGliL0V2ZW50TGlzdGVuZXInKTtcbnZhciBTeW50aGV0aWNLZXlib2FyZEV2ZW50ID0gcmVxdWlyZSgncmVhY3QvbGliL1N5bnRoZXRpY0tleWJvYXJkRXZlbnQnKTtcblxudmFyIGRvY3VtZW50TGlzdGVuZXI7XG4vKipcbiAqIEVuYWJsZSB0aGUgZ2xvYmFsIGV2ZW50IGxpc3RlbmVyLiBJcyBpZGVtcG90ZW50LlxuICovXG5leHBvcnRzLmFjdGl2YXRlID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBpZiAoIWV2ZW50KSB7XG4gICAgICAgIGV2ZW50ID0gJ2tleXVwJztcbiAgICB9XG4gICAgaWYgKCFkb2N1bWVudExpc3RlbmVyKSB7XG4gICAgICAgIGRvY3VtZW50TGlzdGVuZXIgPSBFdmVudExpc3RlbmVyLmxpc3Rlbihkb2N1bWVudCwgZXZlbnQsIGhhbmRsZSk7XG4gICAgfVxuICAgIHJldHVybiBleHBvcnRzO1xufTtcbi8qKlxuICogRGlzYWJsZSB0aGUgZ2xvYmFsIGV2ZW50IGxpc3RlbmVyLiBJcyBpZGVtcG90ZW50LlxuICovXG5leHBvcnRzLmRpc2FibGUgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoZG9jdW1lbnRMaXN0ZW5lcikge1xuICAgICAgICBkb2N1bWVudExpc3RlbmVyLnJlbW92ZSgpO1xuICAgICAgICBkb2N1bWVudExpc3RlbmVyID0gbnVsbDtcbiAgICB9XG59O1xuXG4vLyBDb250YWluZXIgZm9yIGFsbCB0aGUgaGFuZGxlcnNcbnZhciBoYW5kbGVycyA9IFtdO1xuXG4vKipcbiAqIE1peGluIHRoYXQgY2FsbHMgYGhhbmRsZXJOYW1lYCBvbiB5b3VyIGNvbXBvbmVudCBpZiBpdCBpcyBtb3VudGVkIGFuZCBhXG4gKiBrZXkgZXZlbnQgaGFzIGJ1YmJsZWQgdXAgdG8gdGhlIGRvY3VtZW50XG4gKi9cbmV4cG9ydHMuTWl4aW4gPSBmdW5jdGlvbiBIb3RrZXlNaXhpbihoYW5kbGVyTmFtZSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gdGhpc1toYW5kbGVyTmFtZV07XG4gICAgICAgICAgICBoYW5kbGVycy5wdXNoKGhhbmRsZXIpO1xuICAgICAgICB9LFxuICAgICAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgaGFuZGxlciA9IHRoaXNbaGFuZGxlck5hbWVdO1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gaGFuZGxlcnMuaW5kZXhPZihoYW5kbGVyKTtcbiAgICAgICAgICAgIGhhbmRsZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICB9O1xufTtcblxuXG4vLyBDcmVhdGUgYW5kIGRpc3BhdGNoIGFuIGV2ZW50IG9iamVjdCB1c2luZyBSZWFjdCdzIG9iamVjdCBwb29sXG4vLyBDcmliYmVkIGZyb20gU2ltcGxlRXZlbnRQbHVnaW4gYW5kIEV2ZW50UGx1Z2luSHViXG5mdW5jdGlvbiBoYW5kbGUobmF0aXZlRXZlbnQpIHtcbiAgICB2YXIgZXZlbnQgPSBTeW50aGV0aWNLZXlib2FyZEV2ZW50LmdldFBvb2xlZCh7fSwgJ2hvdGtleScsIG5hdGl2ZUV2ZW50KTtcbiAgICB0cnkge1xuICAgICAgICBkaXNwYXRjaEV2ZW50KGV2ZW50LCBoYW5kbGVycyk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKCFldmVudC5pc1BlcnNpc3RlbnQoKSkge1xuICAgICAgICAgICAgZXZlbnQuY29uc3RydWN0b3IucmVsZWFzZShldmVudCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4vLyBEaXNwYXRjaCB0aGUgZXZlbnQsIGluIG9yZGVyLCB0byBhbGwgaW50ZXJlc3RlZCBsaXN0ZW5lcnNcbi8vIFRoZSBtb3N0IHJlY2VudGx5IG1vdW50ZWQgY29tcG9uZW50IGlzIHRoZSBmaXJzdCB0byByZWNlaXZlIHRoZSBldmVudFxuLy8gQ3JpYmJlZCBmcm9tIGEgY29tYmluYXRpb24gb2YgU2ltcGxlRXZlbnRQbHVnaW4gYW5kIEV2ZW50UGx1Z2luVXRpbHNcbmZ1bmN0aW9uIGRpc3BhdGNoRXZlbnQoZXZlbnQsIGhhbmRsZXJzKSB7XG4gICAgZm9yICh2YXIgaSA9IChoYW5kbGVycy5sZW5ndGggLSAxKTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgaWYgKGV2ZW50LmlzUHJvcGFnYXRpb25TdG9wcGVkKCkpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHZhciByZXR1cm5WYWx1ZSA9IGhhbmRsZXJzW2ldKGV2ZW50KTtcbiAgICAgICAgaWYgKHJldHVyblZhbHVlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLyoqXG4gKiBDb3B5cmlnaHQgMjAxMy0yMDE1LCBGYWNlYm9vaywgSW5jLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICpcbiAqIEBwcm92aWRlc01vZHVsZSBFdmVudExpc3RlbmVyXG4gKiBAdHlwZWNoZWNrc1xuICovXG5cbnZhciBlbXB0eUZ1bmN0aW9uID0gcmVxdWlyZShcIi4vZW1wdHlGdW5jdGlvblwiKTtcblxuLyoqXG4gKiBVcHN0cmVhbSB2ZXJzaW9uIG9mIGV2ZW50IGxpc3RlbmVyLiBEb2VzIG5vdCB0YWtlIGludG8gYWNjb3VudCBzcGVjaWZpY1xuICogbmF0dXJlIG9mIHBsYXRmb3JtLlxuICovXG52YXIgRXZlbnRMaXN0ZW5lciA9IHtcbiAgLyoqXG4gICAqIExpc3RlbiB0byBET00gZXZlbnRzIGR1cmluZyB0aGUgYnViYmxlIHBoYXNlLlxuICAgKlxuICAgKiBAcGFyYW0ge0RPTUV2ZW50VGFyZ2V0fSB0YXJnZXQgRE9NIGVsZW1lbnQgdG8gcmVnaXN0ZXIgbGlzdGVuZXIgb24uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudFR5cGUgRXZlbnQgdHlwZSwgZS5nLiAnY2xpY2snIG9yICdtb3VzZW92ZXInLlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBDYWxsYmFjayBmdW5jdGlvbi5cbiAgICogQHJldHVybiB7b2JqZWN0fSBPYmplY3Qgd2l0aCBhIGByZW1vdmVgIG1ldGhvZC5cbiAgICovXG4gIGxpc3RlbjogZnVuY3Rpb24odGFyZ2V0LCBldmVudFR5cGUsIGNhbGxiYWNrKSB7XG4gICAgaWYgKHRhcmdldC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGNhbGxiYWNrLCBmYWxzZSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgY2FsbGJhY2ssIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKHRhcmdldC5hdHRhY2hFdmVudCkge1xuICAgICAgdGFyZ2V0LmF0dGFjaEV2ZW50KCdvbicgKyBldmVudFR5cGUsIGNhbGxiYWNrKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdGFyZ2V0LmRldGFjaEV2ZW50KCdvbicgKyBldmVudFR5cGUsIGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIExpc3RlbiB0byBET00gZXZlbnRzIGR1cmluZyB0aGUgY2FwdHVyZSBwaGFzZS5cbiAgICpcbiAgICogQHBhcmFtIHtET01FdmVudFRhcmdldH0gdGFyZ2V0IERPTSBlbGVtZW50IHRvIHJlZ2lzdGVyIGxpc3RlbmVyIG9uLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRUeXBlIEV2ZW50IHR5cGUsIGUuZy4gJ2NsaWNrJyBvciAnbW91c2VvdmVyJy5cbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgQ2FsbGJhY2sgZnVuY3Rpb24uXG4gICAqIEByZXR1cm4ge29iamVjdH0gT2JqZWN0IHdpdGggYSBgcmVtb3ZlYCBtZXRob2QuXG4gICAqL1xuICBjYXB0dXJlOiBmdW5jdGlvbih0YXJnZXQsIGV2ZW50VHlwZSwgY2FsbGJhY2spIHtcbiAgICBpZiAoIXRhcmdldC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgICBpZiAoXCJwcm9kdWN0aW9uXCIgIT09IHByb2Nlc3MuZW52Lk5PREVfRU5WKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgJ0F0dGVtcHRlZCB0byBsaXN0ZW4gdG8gZXZlbnRzIGR1cmluZyB0aGUgY2FwdHVyZSBwaGFzZSBvbiBhICcgK1xuICAgICAgICAgICdicm93c2VyIHRoYXQgZG9lcyBub3Qgc3VwcG9ydCB0aGUgY2FwdHVyZSBwaGFzZS4gWW91ciBhcHBsaWNhdGlvbiAnICtcbiAgICAgICAgICAnd2lsbCBub3QgcmVjZWl2ZSBzb21lIGV2ZW50cy4nXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICByZW1vdmU6IGVtcHR5RnVuY3Rpb25cbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgY2FsbGJhY2ssIHRydWUpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGNhbGxiYWNrLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG4gIH0sXG5cbiAgcmVnaXN0ZXJEZWZhdWx0OiBmdW5jdGlvbigpIHt9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50TGlzdGVuZXI7XG4iLCIvKipcbiAqIENvcHlyaWdodCAyMDE0LTIwMTUsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4gKiBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqXG4gKiBAcHJvdmlkZXNNb2R1bGUgT2JqZWN0LmFzc2lnblxuICovXG5cbi8vIGh0dHBzOi8vcGVvcGxlLm1vemlsbGEub3JnL35qb3JlbmRvcmZmL2VzNi1kcmFmdC5odG1sI3NlYy1vYmplY3QuYXNzaWduXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gYXNzaWduKHRhcmdldCwgc291cmNlcykge1xuICBpZiAodGFyZ2V0ID09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdPYmplY3QuYXNzaWduIHRhcmdldCBjYW5ub3QgYmUgbnVsbCBvciB1bmRlZmluZWQnKTtcbiAgfVxuXG4gIHZhciB0byA9IE9iamVjdCh0YXJnZXQpO1xuICB2YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG4gIGZvciAodmFyIG5leHRJbmRleCA9IDE7IG5leHRJbmRleCA8IGFyZ3VtZW50cy5sZW5ndGg7IG5leHRJbmRleCsrKSB7XG4gICAgdmFyIG5leHRTb3VyY2UgPSBhcmd1bWVudHNbbmV4dEluZGV4XTtcbiAgICBpZiAobmV4dFNvdXJjZSA9PSBudWxsKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICB2YXIgZnJvbSA9IE9iamVjdChuZXh0U291cmNlKTtcblxuICAgIC8vIFdlIGRvbid0IGN1cnJlbnRseSBzdXBwb3J0IGFjY2Vzc29ycyBub3IgcHJveGllcy4gVGhlcmVmb3JlIHRoaXNcbiAgICAvLyBjb3B5IGNhbm5vdCB0aHJvdy4gSWYgd2UgZXZlciBzdXBwb3J0ZWQgdGhpcyB0aGVuIHdlIG11c3QgaGFuZGxlXG4gICAgLy8gZXhjZXB0aW9ucyBhbmQgc2lkZS1lZmZlY3RzLiBXZSBkb24ndCBzdXBwb3J0IHN5bWJvbHMgc28gdGhleSB3b24ndFxuICAgIC8vIGJlIHRyYW5zZmVycmVkLlxuXG4gICAgZm9yICh2YXIga2V5IGluIGZyb20pIHtcbiAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKGZyb20sIGtleSkpIHtcbiAgICAgICAgdG9ba2V5XSA9IGZyb21ba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdG87XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXNzaWduO1xuIiwiLyoqXG4gKiBDb3B5cmlnaHQgMjAxMy0yMDE1LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBCU0Qtc3R5bGUgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS4gQW4gYWRkaXRpb25hbCBncmFudFxuICogb2YgcGF0ZW50IHJpZ2h0cyBjYW4gYmUgZm91bmQgaW4gdGhlIFBBVEVOVFMgZmlsZSBpbiB0aGUgc2FtZSBkaXJlY3RvcnkuXG4gKlxuICogQHByb3ZpZGVzTW9kdWxlIFBvb2xlZENsYXNzXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgaW52YXJpYW50ID0gcmVxdWlyZShcIi4vaW52YXJpYW50XCIpO1xuXG4vKipcbiAqIFN0YXRpYyBwb29sZXJzLiBTZXZlcmFsIGN1c3RvbSB2ZXJzaW9ucyBmb3IgZWFjaCBwb3RlbnRpYWwgbnVtYmVyIG9mXG4gKiBhcmd1bWVudHMuIEEgY29tcGxldGVseSBnZW5lcmljIHBvb2xlciBpcyBlYXN5IHRvIGltcGxlbWVudCwgYnV0IHdvdWxkXG4gKiByZXF1aXJlIGFjY2Vzc2luZyB0aGUgYGFyZ3VtZW50c2Agb2JqZWN0LiBJbiBlYWNoIG9mIHRoZXNlLCBgdGhpc2AgcmVmZXJzIHRvXG4gKiB0aGUgQ2xhc3MgaXRzZWxmLCBub3QgYW4gaW5zdGFuY2UuIElmIGFueSBvdGhlcnMgYXJlIG5lZWRlZCwgc2ltcGx5IGFkZCB0aGVtXG4gKiBoZXJlLCBvciBpbiB0aGVpciBvd24gZmlsZXMuXG4gKi9cbnZhciBvbmVBcmd1bWVudFBvb2xlciA9IGZ1bmN0aW9uKGNvcHlGaWVsZHNGcm9tKSB7XG4gIHZhciBLbGFzcyA9IHRoaXM7XG4gIGlmIChLbGFzcy5pbnN0YW5jZVBvb2wubGVuZ3RoKSB7XG4gICAgdmFyIGluc3RhbmNlID0gS2xhc3MuaW5zdGFuY2VQb29sLnBvcCgpO1xuICAgIEtsYXNzLmNhbGwoaW5zdGFuY2UsIGNvcHlGaWVsZHNGcm9tKTtcbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG5ldyBLbGFzcyhjb3B5RmllbGRzRnJvbSk7XG4gIH1cbn07XG5cbnZhciB0d29Bcmd1bWVudFBvb2xlciA9IGZ1bmN0aW9uKGExLCBhMikge1xuICB2YXIgS2xhc3MgPSB0aGlzO1xuICBpZiAoS2xhc3MuaW5zdGFuY2VQb29sLmxlbmd0aCkge1xuICAgIHZhciBpbnN0YW5jZSA9IEtsYXNzLmluc3RhbmNlUG9vbC5wb3AoKTtcbiAgICBLbGFzcy5jYWxsKGluc3RhbmNlLCBhMSwgYTIpO1xuICAgIHJldHVybiBpbnN0YW5jZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbmV3IEtsYXNzKGExLCBhMik7XG4gIH1cbn07XG5cbnZhciB0aHJlZUFyZ3VtZW50UG9vbGVyID0gZnVuY3Rpb24oYTEsIGEyLCBhMykge1xuICB2YXIgS2xhc3MgPSB0aGlzO1xuICBpZiAoS2xhc3MuaW5zdGFuY2VQb29sLmxlbmd0aCkge1xuICAgIHZhciBpbnN0YW5jZSA9IEtsYXNzLmluc3RhbmNlUG9vbC5wb3AoKTtcbiAgICBLbGFzcy5jYWxsKGluc3RhbmNlLCBhMSwgYTIsIGEzKTtcbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG5ldyBLbGFzcyhhMSwgYTIsIGEzKTtcbiAgfVxufTtcblxudmFyIGZpdmVBcmd1bWVudFBvb2xlciA9IGZ1bmN0aW9uKGExLCBhMiwgYTMsIGE0LCBhNSkge1xuICB2YXIgS2xhc3MgPSB0aGlzO1xuICBpZiAoS2xhc3MuaW5zdGFuY2VQb29sLmxlbmd0aCkge1xuICAgIHZhciBpbnN0YW5jZSA9IEtsYXNzLmluc3RhbmNlUG9vbC5wb3AoKTtcbiAgICBLbGFzcy5jYWxsKGluc3RhbmNlLCBhMSwgYTIsIGEzLCBhNCwgYTUpO1xuICAgIHJldHVybiBpbnN0YW5jZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbmV3IEtsYXNzKGExLCBhMiwgYTMsIGE0LCBhNSk7XG4gIH1cbn07XG5cbnZhciBzdGFuZGFyZFJlbGVhc2VyID0gZnVuY3Rpb24oaW5zdGFuY2UpIHtcbiAgdmFyIEtsYXNzID0gdGhpcztcbiAgKFwicHJvZHVjdGlvblwiICE9PSBwcm9jZXNzLmVudi5OT0RFX0VOViA/IGludmFyaWFudChcbiAgICBpbnN0YW5jZSBpbnN0YW5jZW9mIEtsYXNzLFxuICAgICdUcnlpbmcgdG8gcmVsZWFzZSBhbiBpbnN0YW5jZSBpbnRvIGEgcG9vbCBvZiBhIGRpZmZlcmVudCB0eXBlLidcbiAgKSA6IGludmFyaWFudChpbnN0YW5jZSBpbnN0YW5jZW9mIEtsYXNzKSk7XG4gIGlmIChpbnN0YW5jZS5kZXN0cnVjdG9yKSB7XG4gICAgaW5zdGFuY2UuZGVzdHJ1Y3RvcigpO1xuICB9XG4gIGlmIChLbGFzcy5pbnN0YW5jZVBvb2wubGVuZ3RoIDwgS2xhc3MucG9vbFNpemUpIHtcbiAgICBLbGFzcy5pbnN0YW5jZVBvb2wucHVzaChpbnN0YW5jZSk7XG4gIH1cbn07XG5cbnZhciBERUZBVUxUX1BPT0xfU0laRSA9IDEwO1xudmFyIERFRkFVTFRfUE9PTEVSID0gb25lQXJndW1lbnRQb29sZXI7XG5cbi8qKlxuICogQXVnbWVudHMgYENvcHlDb25zdHJ1Y3RvcmAgdG8gYmUgYSBwb29sYWJsZSBjbGFzcywgYXVnbWVudGluZyBvbmx5IHRoZSBjbGFzc1xuICogaXRzZWxmIChzdGF0aWNhbGx5KSBub3QgYWRkaW5nIGFueSBwcm90b3R5cGljYWwgZmllbGRzLiBBbnkgQ29weUNvbnN0cnVjdG9yXG4gKiB5b3UgZ2l2ZSB0aGlzIG1heSBoYXZlIGEgYHBvb2xTaXplYCBwcm9wZXJ0eSwgYW5kIHdpbGwgbG9vayBmb3IgYVxuICogcHJvdG90eXBpY2FsIGBkZXN0cnVjdG9yYCBvbiBpbnN0YW5jZXMgKG9wdGlvbmFsKS5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBDb3B5Q29uc3RydWN0b3IgQ29uc3RydWN0b3IgdGhhdCBjYW4gYmUgdXNlZCB0byByZXNldC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHBvb2xlciBDdXN0b21pemFibGUgcG9vbGVyLlxuICovXG52YXIgYWRkUG9vbGluZ1RvID0gZnVuY3Rpb24oQ29weUNvbnN0cnVjdG9yLCBwb29sZXIpIHtcbiAgdmFyIE5ld0tsYXNzID0gQ29weUNvbnN0cnVjdG9yO1xuICBOZXdLbGFzcy5pbnN0YW5jZVBvb2wgPSBbXTtcbiAgTmV3S2xhc3MuZ2V0UG9vbGVkID0gcG9vbGVyIHx8IERFRkFVTFRfUE9PTEVSO1xuICBpZiAoIU5ld0tsYXNzLnBvb2xTaXplKSB7XG4gICAgTmV3S2xhc3MucG9vbFNpemUgPSBERUZBVUxUX1BPT0xfU0laRTtcbiAgfVxuICBOZXdLbGFzcy5yZWxlYXNlID0gc3RhbmRhcmRSZWxlYXNlcjtcbiAgcmV0dXJuIE5ld0tsYXNzO1xufTtcblxudmFyIFBvb2xlZENsYXNzID0ge1xuICBhZGRQb29saW5nVG86IGFkZFBvb2xpbmdUbyxcbiAgb25lQXJndW1lbnRQb29sZXI6IG9uZUFyZ3VtZW50UG9vbGVyLFxuICB0d29Bcmd1bWVudFBvb2xlcjogdHdvQXJndW1lbnRQb29sZXIsXG4gIHRocmVlQXJndW1lbnRQb29sZXI6IHRocmVlQXJndW1lbnRQb29sZXIsXG4gIGZpdmVBcmd1bWVudFBvb2xlcjogZml2ZUFyZ3VtZW50UG9vbGVyXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBvb2xlZENsYXNzO1xuIiwiLyoqXG4gKiBDb3B5cmlnaHQgMjAxMy0yMDE1LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBCU0Qtc3R5bGUgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS4gQW4gYWRkaXRpb25hbCBncmFudFxuICogb2YgcGF0ZW50IHJpZ2h0cyBjYW4gYmUgZm91bmQgaW4gdGhlIFBBVEVOVFMgZmlsZSBpbiB0aGUgc2FtZSBkaXJlY3RvcnkuXG4gKlxuICogQHByb3ZpZGVzTW9kdWxlIFN5bnRoZXRpY0V2ZW50XG4gKiBAdHlwZWNoZWNrcyBzdGF0aWMtb25seVxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFBvb2xlZENsYXNzID0gcmVxdWlyZShcIi4vUG9vbGVkQ2xhc3NcIik7XG5cbnZhciBhc3NpZ24gPSByZXF1aXJlKFwiLi9PYmplY3QuYXNzaWduXCIpO1xudmFyIGVtcHR5RnVuY3Rpb24gPSByZXF1aXJlKFwiLi9lbXB0eUZ1bmN0aW9uXCIpO1xudmFyIGdldEV2ZW50VGFyZ2V0ID0gcmVxdWlyZShcIi4vZ2V0RXZlbnRUYXJnZXRcIik7XG5cbi8qKlxuICogQGludGVyZmFjZSBFdmVudFxuICogQHNlZSBodHRwOi8vd3d3LnczLm9yZy9UUi9ET00tTGV2ZWwtMy1FdmVudHMvXG4gKi9cbnZhciBFdmVudEludGVyZmFjZSA9IHtcbiAgdHlwZTogbnVsbCxcbiAgdGFyZ2V0OiBnZXRFdmVudFRhcmdldCxcbiAgLy8gY3VycmVudFRhcmdldCBpcyBzZXQgd2hlbiBkaXNwYXRjaGluZzsgbm8gdXNlIGluIGNvcHlpbmcgaXQgaGVyZVxuICBjdXJyZW50VGFyZ2V0OiBlbXB0eUZ1bmN0aW9uLnRoYXRSZXR1cm5zTnVsbCxcbiAgZXZlbnRQaGFzZTogbnVsbCxcbiAgYnViYmxlczogbnVsbCxcbiAgY2FuY2VsYWJsZTogbnVsbCxcbiAgdGltZVN0YW1wOiBmdW5jdGlvbihldmVudCkge1xuICAgIHJldHVybiBldmVudC50aW1lU3RhbXAgfHwgRGF0ZS5ub3coKTtcbiAgfSxcbiAgZGVmYXVsdFByZXZlbnRlZDogbnVsbCxcbiAgaXNUcnVzdGVkOiBudWxsXG59O1xuXG4vKipcbiAqIFN5bnRoZXRpYyBldmVudHMgYXJlIGRpc3BhdGNoZWQgYnkgZXZlbnQgcGx1Z2lucywgdHlwaWNhbGx5IGluIHJlc3BvbnNlIHRvIGFcbiAqIHRvcC1sZXZlbCBldmVudCBkZWxlZ2F0aW9uIGhhbmRsZXIuXG4gKlxuICogVGhlc2Ugc3lzdGVtcyBzaG91bGQgZ2VuZXJhbGx5IHVzZSBwb29saW5nIHRvIHJlZHVjZSB0aGUgZnJlcXVlbmN5IG9mIGdhcmJhZ2VcbiAqIGNvbGxlY3Rpb24uIFRoZSBzeXN0ZW0gc2hvdWxkIGNoZWNrIGBpc1BlcnNpc3RlbnRgIHRvIGRldGVybWluZSB3aGV0aGVyIHRoZVxuICogZXZlbnQgc2hvdWxkIGJlIHJlbGVhc2VkIGludG8gdGhlIHBvb2wgYWZ0ZXIgYmVpbmcgZGlzcGF0Y2hlZC4gVXNlcnMgdGhhdFxuICogbmVlZCBhIHBlcnNpc3RlZCBldmVudCBzaG91bGQgaW52b2tlIGBwZXJzaXN0YC5cbiAqXG4gKiBTeW50aGV0aWMgZXZlbnRzIChhbmQgc3ViY2xhc3NlcykgaW1wbGVtZW50IHRoZSBET00gTGV2ZWwgMyBFdmVudHMgQVBJIGJ5XG4gKiBub3JtYWxpemluZyBicm93c2VyIHF1aXJrcy4gU3ViY2xhc3NlcyBkbyBub3QgbmVjZXNzYXJpbHkgaGF2ZSB0byBpbXBsZW1lbnQgYVxuICogRE9NIGludGVyZmFjZTsgY3VzdG9tIGFwcGxpY2F0aW9uLXNwZWNpZmljIGV2ZW50cyBjYW4gYWxzbyBzdWJjbGFzcyB0aGlzLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBkaXNwYXRjaENvbmZpZyBDb25maWd1cmF0aW9uIHVzZWQgdG8gZGlzcGF0Y2ggdGhpcyBldmVudC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBkaXNwYXRjaE1hcmtlciBNYXJrZXIgaWRlbnRpZnlpbmcgdGhlIGV2ZW50IHRhcmdldC5cbiAqIEBwYXJhbSB7b2JqZWN0fSBuYXRpdmVFdmVudCBOYXRpdmUgYnJvd3NlciBldmVudC5cbiAqL1xuZnVuY3Rpb24gU3ludGhldGljRXZlbnQoZGlzcGF0Y2hDb25maWcsIGRpc3BhdGNoTWFya2VyLCBuYXRpdmVFdmVudCkge1xuICB0aGlzLmRpc3BhdGNoQ29uZmlnID0gZGlzcGF0Y2hDb25maWc7XG4gIHRoaXMuZGlzcGF0Y2hNYXJrZXIgPSBkaXNwYXRjaE1hcmtlcjtcbiAgdGhpcy5uYXRpdmVFdmVudCA9IG5hdGl2ZUV2ZW50O1xuXG4gIHZhciBJbnRlcmZhY2UgPSB0aGlzLmNvbnN0cnVjdG9yLkludGVyZmFjZTtcbiAgZm9yICh2YXIgcHJvcE5hbWUgaW4gSW50ZXJmYWNlKSB7XG4gICAgaWYgKCFJbnRlcmZhY2UuaGFzT3duUHJvcGVydHkocHJvcE5hbWUpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgdmFyIG5vcm1hbGl6ZSA9IEludGVyZmFjZVtwcm9wTmFtZV07XG4gICAgaWYgKG5vcm1hbGl6ZSkge1xuICAgICAgdGhpc1twcm9wTmFtZV0gPSBub3JtYWxpemUobmF0aXZlRXZlbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzW3Byb3BOYW1lXSA9IG5hdGl2ZUV2ZW50W3Byb3BOYW1lXTtcbiAgICB9XG4gIH1cblxuICB2YXIgZGVmYXVsdFByZXZlbnRlZCA9IG5hdGl2ZUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgIT0gbnVsbCA/XG4gICAgbmF0aXZlRXZlbnQuZGVmYXVsdFByZXZlbnRlZCA6XG4gICAgbmF0aXZlRXZlbnQucmV0dXJuVmFsdWUgPT09IGZhbHNlO1xuICBpZiAoZGVmYXVsdFByZXZlbnRlZCkge1xuICAgIHRoaXMuaXNEZWZhdWx0UHJldmVudGVkID0gZW1wdHlGdW5jdGlvbi50aGF0UmV0dXJuc1RydWU7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5pc0RlZmF1bHRQcmV2ZW50ZWQgPSBlbXB0eUZ1bmN0aW9uLnRoYXRSZXR1cm5zRmFsc2U7XG4gIH1cbiAgdGhpcy5pc1Byb3BhZ2F0aW9uU3RvcHBlZCA9IGVtcHR5RnVuY3Rpb24udGhhdFJldHVybnNGYWxzZTtcbn1cblxuYXNzaWduKFN5bnRoZXRpY0V2ZW50LnByb3RvdHlwZSwge1xuXG4gIHByZXZlbnREZWZhdWx0OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmRlZmF1bHRQcmV2ZW50ZWQgPSB0cnVlO1xuICAgIHZhciBldmVudCA9IHRoaXMubmF0aXZlRXZlbnQ7XG4gICAgaWYgKGV2ZW50LnByZXZlbnREZWZhdWx0KSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xuICAgIH1cbiAgICB0aGlzLmlzRGVmYXVsdFByZXZlbnRlZCA9IGVtcHR5RnVuY3Rpb24udGhhdFJldHVybnNUcnVlO1xuICB9LFxuXG4gIHN0b3BQcm9wYWdhdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGV2ZW50ID0gdGhpcy5uYXRpdmVFdmVudDtcbiAgICBpZiAoZXZlbnQuc3RvcFByb3BhZ2F0aW9uKSB7XG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXZlbnQuY2FuY2VsQnViYmxlID0gdHJ1ZTtcbiAgICB9XG4gICAgdGhpcy5pc1Byb3BhZ2F0aW9uU3RvcHBlZCA9IGVtcHR5RnVuY3Rpb24udGhhdFJldHVybnNUcnVlO1xuICB9LFxuXG4gIC8qKlxuICAgKiBXZSByZWxlYXNlIGFsbCBkaXNwYXRjaGVkIGBTeW50aGV0aWNFdmVudGBzIGFmdGVyIGVhY2ggZXZlbnQgbG9vcCwgYWRkaW5nXG4gICAqIHRoZW0gYmFjayBpbnRvIHRoZSBwb29sLiBUaGlzIGFsbG93cyBhIHdheSB0byBob2xkIG9udG8gYSByZWZlcmVuY2UgdGhhdFxuICAgKiB3b24ndCBiZSBhZGRlZCBiYWNrIGludG8gdGhlIHBvb2wuXG4gICAqL1xuICBwZXJzaXN0OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmlzUGVyc2lzdGVudCA9IGVtcHR5RnVuY3Rpb24udGhhdFJldHVybnNUcnVlO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhpcyBldmVudCBzaG91bGQgYmUgcmVsZWFzZWQgYmFjayBpbnRvIHRoZSBwb29sLlxuICAgKlxuICAgKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHRoaXMgc2hvdWxkIG5vdCBiZSByZWxlYXNlZCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgKi9cbiAgaXNQZXJzaXN0ZW50OiBlbXB0eUZ1bmN0aW9uLnRoYXRSZXR1cm5zRmFsc2UsXG5cbiAgLyoqXG4gICAqIGBQb29sZWRDbGFzc2AgbG9va3MgZm9yIGBkZXN0cnVjdG9yYCBvbiBlYWNoIGluc3RhbmNlIGl0IHJlbGVhc2VzLlxuICAgKi9cbiAgZGVzdHJ1Y3RvcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIEludGVyZmFjZSA9IHRoaXMuY29uc3RydWN0b3IuSW50ZXJmYWNlO1xuICAgIGZvciAodmFyIHByb3BOYW1lIGluIEludGVyZmFjZSkge1xuICAgICAgdGhpc1twcm9wTmFtZV0gPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLmRpc3BhdGNoQ29uZmlnID0gbnVsbDtcbiAgICB0aGlzLmRpc3BhdGNoTWFya2VyID0gbnVsbDtcbiAgICB0aGlzLm5hdGl2ZUV2ZW50ID0gbnVsbDtcbiAgfVxuXG59KTtcblxuU3ludGhldGljRXZlbnQuSW50ZXJmYWNlID0gRXZlbnRJbnRlcmZhY2U7XG5cbi8qKlxuICogSGVscGVyIHRvIHJlZHVjZSBib2lsZXJwbGF0ZSB3aGVuIGNyZWF0aW5nIHN1YmNsYXNzZXMuXG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gQ2xhc3NcbiAqIEBwYXJhbSB7P29iamVjdH0gSW50ZXJmYWNlXG4gKi9cblN5bnRoZXRpY0V2ZW50LmF1Z21lbnRDbGFzcyA9IGZ1bmN0aW9uKENsYXNzLCBJbnRlcmZhY2UpIHtcbiAgdmFyIFN1cGVyID0gdGhpcztcblxuICB2YXIgcHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShTdXBlci5wcm90b3R5cGUpO1xuICBhc3NpZ24ocHJvdG90eXBlLCBDbGFzcy5wcm90b3R5cGUpO1xuICBDbGFzcy5wcm90b3R5cGUgPSBwcm90b3R5cGU7XG4gIENsYXNzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENsYXNzO1xuXG4gIENsYXNzLkludGVyZmFjZSA9IGFzc2lnbih7fSwgU3VwZXIuSW50ZXJmYWNlLCBJbnRlcmZhY2UpO1xuICBDbGFzcy5hdWdtZW50Q2xhc3MgPSBTdXBlci5hdWdtZW50Q2xhc3M7XG5cbiAgUG9vbGVkQ2xhc3MuYWRkUG9vbGluZ1RvKENsYXNzLCBQb29sZWRDbGFzcy50aHJlZUFyZ3VtZW50UG9vbGVyKTtcbn07XG5cblBvb2xlZENsYXNzLmFkZFBvb2xpbmdUbyhTeW50aGV0aWNFdmVudCwgUG9vbGVkQ2xhc3MudGhyZWVBcmd1bWVudFBvb2xlcik7XG5cbm1vZHVsZS5leHBvcnRzID0gU3ludGhldGljRXZlbnQ7XG4iLCIvKipcbiAqIENvcHlyaWdodCAyMDEzLTIwMTUsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4gKiBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqXG4gKiBAcHJvdmlkZXNNb2R1bGUgU3ludGhldGljS2V5Ym9hcmRFdmVudFxuICogQHR5cGVjaGVja3Mgc3RhdGljLW9ubHlcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTeW50aGV0aWNVSUV2ZW50ID0gcmVxdWlyZShcIi4vU3ludGhldGljVUlFdmVudFwiKTtcblxudmFyIGdldEV2ZW50Q2hhckNvZGUgPSByZXF1aXJlKFwiLi9nZXRFdmVudENoYXJDb2RlXCIpO1xudmFyIGdldEV2ZW50S2V5ID0gcmVxdWlyZShcIi4vZ2V0RXZlbnRLZXlcIik7XG52YXIgZ2V0RXZlbnRNb2RpZmllclN0YXRlID0gcmVxdWlyZShcIi4vZ2V0RXZlbnRNb2RpZmllclN0YXRlXCIpO1xuXG4vKipcbiAqIEBpbnRlcmZhY2UgS2V5Ym9hcmRFdmVudFxuICogQHNlZSBodHRwOi8vd3d3LnczLm9yZy9UUi9ET00tTGV2ZWwtMy1FdmVudHMvXG4gKi9cbnZhciBLZXlib2FyZEV2ZW50SW50ZXJmYWNlID0ge1xuICBrZXk6IGdldEV2ZW50S2V5LFxuICBsb2NhdGlvbjogbnVsbCxcbiAgY3RybEtleTogbnVsbCxcbiAgc2hpZnRLZXk6IG51bGwsXG4gIGFsdEtleTogbnVsbCxcbiAgbWV0YUtleTogbnVsbCxcbiAgcmVwZWF0OiBudWxsLFxuICBsb2NhbGU6IG51bGwsXG4gIGdldE1vZGlmaWVyU3RhdGU6IGdldEV2ZW50TW9kaWZpZXJTdGF0ZSxcbiAgLy8gTGVnYWN5IEludGVyZmFjZVxuICBjaGFyQ29kZTogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAvLyBgY2hhckNvZGVgIGlzIHRoZSByZXN1bHQgb2YgYSBLZXlQcmVzcyBldmVudCBhbmQgcmVwcmVzZW50cyB0aGUgdmFsdWUgb2ZcbiAgICAvLyB0aGUgYWN0dWFsIHByaW50YWJsZSBjaGFyYWN0ZXIuXG5cbiAgICAvLyBLZXlQcmVzcyBpcyBkZXByZWNhdGVkLCBidXQgaXRzIHJlcGxhY2VtZW50IGlzIG5vdCB5ZXQgZmluYWwgYW5kIG5vdFxuICAgIC8vIGltcGxlbWVudGVkIGluIGFueSBtYWpvciBicm93c2VyLiBPbmx5IEtleVByZXNzIGhhcyBjaGFyQ29kZS5cbiAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ2tleXByZXNzJykge1xuICAgICAgcmV0dXJuIGdldEV2ZW50Q2hhckNvZGUoZXZlbnQpO1xuICAgIH1cbiAgICByZXR1cm4gMDtcbiAgfSxcbiAga2V5Q29kZTogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAvLyBga2V5Q29kZWAgaXMgdGhlIHJlc3VsdCBvZiBhIEtleURvd24vVXAgZXZlbnQgYW5kIHJlcHJlc2VudHMgdGhlIHZhbHVlIG9mXG4gICAgLy8gcGh5c2ljYWwga2V5Ym9hcmQga2V5LlxuXG4gICAgLy8gVGhlIGFjdHVhbCBtZWFuaW5nIG9mIHRoZSB2YWx1ZSBkZXBlbmRzIG9uIHRoZSB1c2Vycycga2V5Ym9hcmQgbGF5b3V0XG4gICAgLy8gd2hpY2ggY2Fubm90IGJlIGRldGVjdGVkLiBBc3N1bWluZyB0aGF0IGl0IGlzIGEgVVMga2V5Ym9hcmQgbGF5b3V0XG4gICAgLy8gcHJvdmlkZXMgYSBzdXJwcmlzaW5nbHkgYWNjdXJhdGUgbWFwcGluZyBmb3IgVVMgYW5kIEV1cm9wZWFuIHVzZXJzLlxuICAgIC8vIER1ZSB0byB0aGlzLCBpdCBpcyBsZWZ0IHRvIHRoZSB1c2VyIHRvIGltcGxlbWVudCBhdCB0aGlzIHRpbWUuXG4gICAgaWYgKGV2ZW50LnR5cGUgPT09ICdrZXlkb3duJyB8fCBldmVudC50eXBlID09PSAna2V5dXAnKSB7XG4gICAgICByZXR1cm4gZXZlbnQua2V5Q29kZTtcbiAgICB9XG4gICAgcmV0dXJuIDA7XG4gIH0sXG4gIHdoaWNoOiBmdW5jdGlvbihldmVudCkge1xuICAgIC8vIGB3aGljaGAgaXMgYW4gYWxpYXMgZm9yIGVpdGhlciBga2V5Q29kZWAgb3IgYGNoYXJDb2RlYCBkZXBlbmRpbmcgb24gdGhlXG4gICAgLy8gdHlwZSBvZiB0aGUgZXZlbnQuXG4gICAgaWYgKGV2ZW50LnR5cGUgPT09ICdrZXlwcmVzcycpIHtcbiAgICAgIHJldHVybiBnZXRFdmVudENoYXJDb2RlKGV2ZW50KTtcbiAgICB9XG4gICAgaWYgKGV2ZW50LnR5cGUgPT09ICdrZXlkb3duJyB8fCBldmVudC50eXBlID09PSAna2V5dXAnKSB7XG4gICAgICByZXR1cm4gZXZlbnQua2V5Q29kZTtcbiAgICB9XG4gICAgcmV0dXJuIDA7XG4gIH1cbn07XG5cbi8qKlxuICogQHBhcmFtIHtvYmplY3R9IGRpc3BhdGNoQ29uZmlnIENvbmZpZ3VyYXRpb24gdXNlZCB0byBkaXNwYXRjaCB0aGlzIGV2ZW50LlxuICogQHBhcmFtIHtzdHJpbmd9IGRpc3BhdGNoTWFya2VyIE1hcmtlciBpZGVudGlmeWluZyB0aGUgZXZlbnQgdGFyZ2V0LlxuICogQHBhcmFtIHtvYmplY3R9IG5hdGl2ZUV2ZW50IE5hdGl2ZSBicm93c2VyIGV2ZW50LlxuICogQGV4dGVuZHMge1N5bnRoZXRpY1VJRXZlbnR9XG4gKi9cbmZ1bmN0aW9uIFN5bnRoZXRpY0tleWJvYXJkRXZlbnQoZGlzcGF0Y2hDb25maWcsIGRpc3BhdGNoTWFya2VyLCBuYXRpdmVFdmVudCkge1xuICBTeW50aGV0aWNVSUV2ZW50LmNhbGwodGhpcywgZGlzcGF0Y2hDb25maWcsIGRpc3BhdGNoTWFya2VyLCBuYXRpdmVFdmVudCk7XG59XG5cblN5bnRoZXRpY1VJRXZlbnQuYXVnbWVudENsYXNzKFN5bnRoZXRpY0tleWJvYXJkRXZlbnQsIEtleWJvYXJkRXZlbnRJbnRlcmZhY2UpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN5bnRoZXRpY0tleWJvYXJkRXZlbnQ7XG4iLCIvKipcbiAqIENvcHlyaWdodCAyMDEzLTIwMTUsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4gKiBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqXG4gKiBAcHJvdmlkZXNNb2R1bGUgU3ludGhldGljVUlFdmVudFxuICogQHR5cGVjaGVja3Mgc3RhdGljLW9ubHlcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTeW50aGV0aWNFdmVudCA9IHJlcXVpcmUoXCIuL1N5bnRoZXRpY0V2ZW50XCIpO1xuXG52YXIgZ2V0RXZlbnRUYXJnZXQgPSByZXF1aXJlKFwiLi9nZXRFdmVudFRhcmdldFwiKTtcblxuLyoqXG4gKiBAaW50ZXJmYWNlIFVJRXZlbnRcbiAqIEBzZWUgaHR0cDovL3d3dy53My5vcmcvVFIvRE9NLUxldmVsLTMtRXZlbnRzL1xuICovXG52YXIgVUlFdmVudEludGVyZmFjZSA9IHtcbiAgdmlldzogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQudmlldykge1xuICAgICAgcmV0dXJuIGV2ZW50LnZpZXc7XG4gICAgfVxuXG4gICAgdmFyIHRhcmdldCA9IGdldEV2ZW50VGFyZ2V0KGV2ZW50KTtcbiAgICBpZiAodGFyZ2V0ICE9IG51bGwgJiYgdGFyZ2V0LndpbmRvdyA9PT0gdGFyZ2V0KSB7XG4gICAgICAvLyB0YXJnZXQgaXMgYSB3aW5kb3cgb2JqZWN0XG4gICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cblxuICAgIHZhciBkb2MgPSB0YXJnZXQub3duZXJEb2N1bWVudDtcbiAgICAvLyBUT0RPOiBGaWd1cmUgb3V0IHdoeSBgb3duZXJEb2N1bWVudGAgaXMgc29tZXRpbWVzIHVuZGVmaW5lZCBpbiBJRTguXG4gICAgaWYgKGRvYykge1xuICAgICAgcmV0dXJuIGRvYy5kZWZhdWx0VmlldyB8fCBkb2MucGFyZW50V2luZG93O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gd2luZG93O1xuICAgIH1cbiAgfSxcbiAgZGV0YWlsOiBmdW5jdGlvbihldmVudCkge1xuICAgIHJldHVybiBldmVudC5kZXRhaWwgfHwgMDtcbiAgfVxufTtcblxuLyoqXG4gKiBAcGFyYW0ge29iamVjdH0gZGlzcGF0Y2hDb25maWcgQ29uZmlndXJhdGlvbiB1c2VkIHRvIGRpc3BhdGNoIHRoaXMgZXZlbnQuXG4gKiBAcGFyYW0ge3N0cmluZ30gZGlzcGF0Y2hNYXJrZXIgTWFya2VyIGlkZW50aWZ5aW5nIHRoZSBldmVudCB0YXJnZXQuXG4gKiBAcGFyYW0ge29iamVjdH0gbmF0aXZlRXZlbnQgTmF0aXZlIGJyb3dzZXIgZXZlbnQuXG4gKiBAZXh0ZW5kcyB7U3ludGhldGljRXZlbnR9XG4gKi9cbmZ1bmN0aW9uIFN5bnRoZXRpY1VJRXZlbnQoZGlzcGF0Y2hDb25maWcsIGRpc3BhdGNoTWFya2VyLCBuYXRpdmVFdmVudCkge1xuICBTeW50aGV0aWNFdmVudC5jYWxsKHRoaXMsIGRpc3BhdGNoQ29uZmlnLCBkaXNwYXRjaE1hcmtlciwgbmF0aXZlRXZlbnQpO1xufVxuXG5TeW50aGV0aWNFdmVudC5hdWdtZW50Q2xhc3MoU3ludGhldGljVUlFdmVudCwgVUlFdmVudEludGVyZmFjZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU3ludGhldGljVUlFdmVudDtcbiIsIi8qKlxuICogQ29weXJpZ2h0IDIwMTMtMjAxNSwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgQlNELXN0eWxlIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuIEFuIGFkZGl0aW9uYWwgZ3JhbnRcbiAqIG9mIHBhdGVudCByaWdodHMgY2FuIGJlIGZvdW5kIGluIHRoZSBQQVRFTlRTIGZpbGUgaW4gdGhlIHNhbWUgZGlyZWN0b3J5LlxuICpcbiAqIEBwcm92aWRlc01vZHVsZSBlbXB0eUZ1bmN0aW9uXG4gKi9cblxuZnVuY3Rpb24gbWFrZUVtcHR5RnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gYXJnO1xuICB9O1xufVxuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gYWNjZXB0cyBhbmQgZGlzY2FyZHMgaW5wdXRzOyBpdCBoYXMgbm8gc2lkZSBlZmZlY3RzLiBUaGlzIGlzXG4gKiBwcmltYXJpbHkgdXNlZnVsIGlkaW9tYXRpY2FsbHkgZm9yIG92ZXJyaWRhYmxlIGZ1bmN0aW9uIGVuZHBvaW50cyB3aGljaFxuICogYWx3YXlzIG5lZWQgdG8gYmUgY2FsbGFibGUsIHNpbmNlIEpTIGxhY2tzIGEgbnVsbC1jYWxsIGlkaW9tIGFsYSBDb2NvYS5cbiAqL1xuZnVuY3Rpb24gZW1wdHlGdW5jdGlvbigpIHt9XG5cbmVtcHR5RnVuY3Rpb24udGhhdFJldHVybnMgPSBtYWtlRW1wdHlGdW5jdGlvbjtcbmVtcHR5RnVuY3Rpb24udGhhdFJldHVybnNGYWxzZSA9IG1ha2VFbXB0eUZ1bmN0aW9uKGZhbHNlKTtcbmVtcHR5RnVuY3Rpb24udGhhdFJldHVybnNUcnVlID0gbWFrZUVtcHR5RnVuY3Rpb24odHJ1ZSk7XG5lbXB0eUZ1bmN0aW9uLnRoYXRSZXR1cm5zTnVsbCA9IG1ha2VFbXB0eUZ1bmN0aW9uKG51bGwpO1xuZW1wdHlGdW5jdGlvbi50aGF0UmV0dXJuc1RoaXMgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXM7IH07XG5lbXB0eUZ1bmN0aW9uLnRoYXRSZXR1cm5zQXJndW1lbnQgPSBmdW5jdGlvbihhcmcpIHsgcmV0dXJuIGFyZzsgfTtcblxubW9kdWxlLmV4cG9ydHMgPSBlbXB0eUZ1bmN0aW9uO1xuIiwiLyoqXG4gKiBDb3B5cmlnaHQgMjAxMy0yMDE1LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBCU0Qtc3R5bGUgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS4gQW4gYWRkaXRpb25hbCBncmFudFxuICogb2YgcGF0ZW50IHJpZ2h0cyBjYW4gYmUgZm91bmQgaW4gdGhlIFBBVEVOVFMgZmlsZSBpbiB0aGUgc2FtZSBkaXJlY3RvcnkuXG4gKlxuICogQHByb3ZpZGVzTW9kdWxlIGdldEV2ZW50Q2hhckNvZGVcbiAqIEB0eXBlY2hlY2tzIHN0YXRpYy1vbmx5XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIGBjaGFyQ29kZWAgcmVwcmVzZW50cyB0aGUgYWN0dWFsIFwiY2hhcmFjdGVyIGNvZGVcIiBhbmQgaXMgc2FmZSB0byB1c2Ugd2l0aFxuICogYFN0cmluZy5mcm9tQ2hhckNvZGVgLiBBcyBzdWNoLCBvbmx5IGtleXMgdGhhdCBjb3JyZXNwb25kIHRvIHByaW50YWJsZVxuICogY2hhcmFjdGVycyBwcm9kdWNlIGEgdmFsaWQgYGNoYXJDb2RlYCwgdGhlIG9ubHkgZXhjZXB0aW9uIHRvIHRoaXMgaXMgRW50ZXIuXG4gKiBUaGUgVGFiLWtleSBpcyBjb25zaWRlcmVkIG5vbi1wcmludGFibGUgYW5kIGRvZXMgbm90IGhhdmUgYSBgY2hhckNvZGVgLFxuICogcHJlc3VtYWJseSBiZWNhdXNlIGl0IGRvZXMgbm90IHByb2R1Y2UgYSB0YWItY2hhcmFjdGVyIGluIGJyb3dzZXJzLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBuYXRpdmVFdmVudCBOYXRpdmUgYnJvd3NlciBldmVudC5cbiAqIEByZXR1cm4ge3N0cmluZ30gTm9ybWFsaXplZCBgY2hhckNvZGVgIHByb3BlcnR5LlxuICovXG5mdW5jdGlvbiBnZXRFdmVudENoYXJDb2RlKG5hdGl2ZUV2ZW50KSB7XG4gIHZhciBjaGFyQ29kZTtcbiAgdmFyIGtleUNvZGUgPSBuYXRpdmVFdmVudC5rZXlDb2RlO1xuXG4gIGlmICgnY2hhckNvZGUnIGluIG5hdGl2ZUV2ZW50KSB7XG4gICAgY2hhckNvZGUgPSBuYXRpdmVFdmVudC5jaGFyQ29kZTtcblxuICAgIC8vIEZGIGRvZXMgbm90IHNldCBgY2hhckNvZGVgIGZvciB0aGUgRW50ZXIta2V5LCBjaGVjayBhZ2FpbnN0IGBrZXlDb2RlYC5cbiAgICBpZiAoY2hhckNvZGUgPT09IDAgJiYga2V5Q29kZSA9PT0gMTMpIHtcbiAgICAgIGNoYXJDb2RlID0gMTM7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIElFOCBkb2VzIG5vdCBpbXBsZW1lbnQgYGNoYXJDb2RlYCwgYnV0IGBrZXlDb2RlYCBoYXMgdGhlIGNvcnJlY3QgdmFsdWUuXG4gICAgY2hhckNvZGUgPSBrZXlDb2RlO1xuICB9XG5cbiAgLy8gU29tZSBub24tcHJpbnRhYmxlIGtleXMgYXJlIHJlcG9ydGVkIGluIGBjaGFyQ29kZWAvYGtleUNvZGVgLCBkaXNjYXJkIHRoZW0uXG4gIC8vIE11c3Qgbm90IGRpc2NhcmQgdGhlIChub24tKXByaW50YWJsZSBFbnRlci1rZXkuXG4gIGlmIChjaGFyQ29kZSA+PSAzMiB8fCBjaGFyQ29kZSA9PT0gMTMpIHtcbiAgICByZXR1cm4gY2hhckNvZGU7XG4gIH1cblxuICByZXR1cm4gMDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRFdmVudENoYXJDb2RlO1xuIiwiLyoqXG4gKiBDb3B5cmlnaHQgMjAxMy0yMDE1LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBCU0Qtc3R5bGUgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS4gQW4gYWRkaXRpb25hbCBncmFudFxuICogb2YgcGF0ZW50IHJpZ2h0cyBjYW4gYmUgZm91bmQgaW4gdGhlIFBBVEVOVFMgZmlsZSBpbiB0aGUgc2FtZSBkaXJlY3RvcnkuXG4gKlxuICogQHByb3ZpZGVzTW9kdWxlIGdldEV2ZW50S2V5XG4gKiBAdHlwZWNoZWNrcyBzdGF0aWMtb25seVxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGdldEV2ZW50Q2hhckNvZGUgPSByZXF1aXJlKFwiLi9nZXRFdmVudENoYXJDb2RlXCIpO1xuXG4vKipcbiAqIE5vcm1hbGl6YXRpb24gb2YgZGVwcmVjYXRlZCBIVE1MNSBga2V5YCB2YWx1ZXNcbiAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0tleWJvYXJkRXZlbnQjS2V5X25hbWVzXG4gKi9cbnZhciBub3JtYWxpemVLZXkgPSB7XG4gICdFc2MnOiAnRXNjYXBlJyxcbiAgJ1NwYWNlYmFyJzogJyAnLFxuICAnTGVmdCc6ICdBcnJvd0xlZnQnLFxuICAnVXAnOiAnQXJyb3dVcCcsXG4gICdSaWdodCc6ICdBcnJvd1JpZ2h0JyxcbiAgJ0Rvd24nOiAnQXJyb3dEb3duJyxcbiAgJ0RlbCc6ICdEZWxldGUnLFxuICAnV2luJzogJ09TJyxcbiAgJ01lbnUnOiAnQ29udGV4dE1lbnUnLFxuICAnQXBwcyc6ICdDb250ZXh0TWVudScsXG4gICdTY3JvbGwnOiAnU2Nyb2xsTG9jaycsXG4gICdNb3pQcmludGFibGVLZXknOiAnVW5pZGVudGlmaWVkJ1xufTtcblxuLyoqXG4gKiBUcmFuc2xhdGlvbiBmcm9tIGxlZ2FjeSBga2V5Q29kZWAgdG8gSFRNTDUgYGtleWBcbiAqIE9ubHkgc3BlY2lhbCBrZXlzIHN1cHBvcnRlZCwgYWxsIG90aGVycyBkZXBlbmQgb24ga2V5Ym9hcmQgbGF5b3V0IG9yIGJyb3dzZXJcbiAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0tleWJvYXJkRXZlbnQjS2V5X25hbWVzXG4gKi9cbnZhciB0cmFuc2xhdGVUb0tleSA9IHtcbiAgODogJ0JhY2tzcGFjZScsXG4gIDk6ICdUYWInLFxuICAxMjogJ0NsZWFyJyxcbiAgMTM6ICdFbnRlcicsXG4gIDE2OiAnU2hpZnQnLFxuICAxNzogJ0NvbnRyb2wnLFxuICAxODogJ0FsdCcsXG4gIDE5OiAnUGF1c2UnLFxuICAyMDogJ0NhcHNMb2NrJyxcbiAgMjc6ICdFc2NhcGUnLFxuICAzMjogJyAnLFxuICAzMzogJ1BhZ2VVcCcsXG4gIDM0OiAnUGFnZURvd24nLFxuICAzNTogJ0VuZCcsXG4gIDM2OiAnSG9tZScsXG4gIDM3OiAnQXJyb3dMZWZ0JyxcbiAgMzg6ICdBcnJvd1VwJyxcbiAgMzk6ICdBcnJvd1JpZ2h0JyxcbiAgNDA6ICdBcnJvd0Rvd24nLFxuICA0NTogJ0luc2VydCcsXG4gIDQ2OiAnRGVsZXRlJyxcbiAgMTEyOiAnRjEnLCAxMTM6ICdGMicsIDExNDogJ0YzJywgMTE1OiAnRjQnLCAxMTY6ICdGNScsIDExNzogJ0Y2JyxcbiAgMTE4OiAnRjcnLCAxMTk6ICdGOCcsIDEyMDogJ0Y5JywgMTIxOiAnRjEwJywgMTIyOiAnRjExJywgMTIzOiAnRjEyJyxcbiAgMTQ0OiAnTnVtTG9jaycsXG4gIDE0NTogJ1Njcm9sbExvY2snLFxuICAyMjQ6ICdNZXRhJ1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge29iamVjdH0gbmF0aXZlRXZlbnQgTmF0aXZlIGJyb3dzZXIgZXZlbnQuXG4gKiBAcmV0dXJuIHtzdHJpbmd9IE5vcm1hbGl6ZWQgYGtleWAgcHJvcGVydHkuXG4gKi9cbmZ1bmN0aW9uIGdldEV2ZW50S2V5KG5hdGl2ZUV2ZW50KSB7XG4gIGlmIChuYXRpdmVFdmVudC5rZXkpIHtcbiAgICAvLyBOb3JtYWxpemUgaW5jb25zaXN0ZW50IHZhbHVlcyByZXBvcnRlZCBieSBicm93c2VycyBkdWUgdG9cbiAgICAvLyBpbXBsZW1lbnRhdGlvbnMgb2YgYSB3b3JraW5nIGRyYWZ0IHNwZWNpZmljYXRpb24uXG5cbiAgICAvLyBGaXJlRm94IGltcGxlbWVudHMgYGtleWAgYnV0IHJldHVybnMgYE1velByaW50YWJsZUtleWAgZm9yIGFsbFxuICAgIC8vIHByaW50YWJsZSBjaGFyYWN0ZXJzIChub3JtYWxpemVkIHRvIGBVbmlkZW50aWZpZWRgKSwgaWdub3JlIGl0LlxuICAgIHZhciBrZXkgPSBub3JtYWxpemVLZXlbbmF0aXZlRXZlbnQua2V5XSB8fCBuYXRpdmVFdmVudC5rZXk7XG4gICAgaWYgKGtleSAhPT0gJ1VuaWRlbnRpZmllZCcpIHtcbiAgICAgIHJldHVybiBrZXk7XG4gICAgfVxuICB9XG5cbiAgLy8gQnJvd3NlciBkb2VzIG5vdCBpbXBsZW1lbnQgYGtleWAsIHBvbHlmaWxsIGFzIG11Y2ggb2YgaXQgYXMgd2UgY2FuLlxuICBpZiAobmF0aXZlRXZlbnQudHlwZSA9PT0gJ2tleXByZXNzJykge1xuICAgIHZhciBjaGFyQ29kZSA9IGdldEV2ZW50Q2hhckNvZGUobmF0aXZlRXZlbnQpO1xuXG4gICAgLy8gVGhlIGVudGVyLWtleSBpcyB0ZWNobmljYWxseSBib3RoIHByaW50YWJsZSBhbmQgbm9uLXByaW50YWJsZSBhbmQgY2FuXG4gICAgLy8gdGh1cyBiZSBjYXB0dXJlZCBieSBga2V5cHJlc3NgLCBubyBvdGhlciBub24tcHJpbnRhYmxlIGtleSBzaG91bGQuXG4gICAgcmV0dXJuIGNoYXJDb2RlID09PSAxMyA/ICdFbnRlcicgOiBTdHJpbmcuZnJvbUNoYXJDb2RlKGNoYXJDb2RlKTtcbiAgfVxuICBpZiAobmF0aXZlRXZlbnQudHlwZSA9PT0gJ2tleWRvd24nIHx8IG5hdGl2ZUV2ZW50LnR5cGUgPT09ICdrZXl1cCcpIHtcbiAgICAvLyBXaGlsZSB1c2VyIGtleWJvYXJkIGxheW91dCBkZXRlcm1pbmVzIHRoZSBhY3R1YWwgbWVhbmluZyBvZiBlYWNoXG4gICAgLy8gYGtleUNvZGVgIHZhbHVlLCBhbG1vc3QgYWxsIGZ1bmN0aW9uIGtleXMgaGF2ZSBhIHVuaXZlcnNhbCB2YWx1ZS5cbiAgICByZXR1cm4gdHJhbnNsYXRlVG9LZXlbbmF0aXZlRXZlbnQua2V5Q29kZV0gfHwgJ1VuaWRlbnRpZmllZCc7XG4gIH1cbiAgcmV0dXJuICcnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldEV2ZW50S2V5O1xuIiwiLyoqXG4gKiBDb3B5cmlnaHQgMjAxMy0yMDE1LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBCU0Qtc3R5bGUgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS4gQW4gYWRkaXRpb25hbCBncmFudFxuICogb2YgcGF0ZW50IHJpZ2h0cyBjYW4gYmUgZm91bmQgaW4gdGhlIFBBVEVOVFMgZmlsZSBpbiB0aGUgc2FtZSBkaXJlY3RvcnkuXG4gKlxuICogQHByb3ZpZGVzTW9kdWxlIGdldEV2ZW50TW9kaWZpZXJTdGF0ZVxuICogQHR5cGVjaGVja3Mgc3RhdGljLW9ubHlcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVHJhbnNsYXRpb24gZnJvbSBtb2RpZmllciBrZXkgdG8gdGhlIGFzc29jaWF0ZWQgcHJvcGVydHkgaW4gdGhlIGV2ZW50LlxuICogQHNlZSBodHRwOi8vd3d3LnczLm9yZy9UUi9ET00tTGV2ZWwtMy1FdmVudHMvI2tleXMtTW9kaWZpZXJzXG4gKi9cblxudmFyIG1vZGlmaWVyS2V5VG9Qcm9wID0ge1xuICAnQWx0JzogJ2FsdEtleScsXG4gICdDb250cm9sJzogJ2N0cmxLZXknLFxuICAnTWV0YSc6ICdtZXRhS2V5JyxcbiAgJ1NoaWZ0JzogJ3NoaWZ0S2V5J1xufTtcblxuLy8gSUU4IGRvZXMgbm90IGltcGxlbWVudCBnZXRNb2RpZmllclN0YXRlIHNvIHdlIHNpbXBseSBtYXAgaXQgdG8gdGhlIG9ubHlcbi8vIG1vZGlmaWVyIGtleXMgZXhwb3NlZCBieSB0aGUgZXZlbnQgaXRzZWxmLCBkb2VzIG5vdCBzdXBwb3J0IExvY2sta2V5cy5cbi8vIEN1cnJlbnRseSwgYWxsIG1ham9yIGJyb3dzZXJzIGV4Y2VwdCBDaHJvbWUgc2VlbXMgdG8gc3VwcG9ydCBMb2NrLWtleXMuXG5mdW5jdGlvbiBtb2RpZmllclN0YXRlR2V0dGVyKGtleUFyZykge1xuICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICB2YXIgc3ludGhldGljRXZlbnQgPSB0aGlzO1xuICB2YXIgbmF0aXZlRXZlbnQgPSBzeW50aGV0aWNFdmVudC5uYXRpdmVFdmVudDtcbiAgaWYgKG5hdGl2ZUV2ZW50LmdldE1vZGlmaWVyU3RhdGUpIHtcbiAgICByZXR1cm4gbmF0aXZlRXZlbnQuZ2V0TW9kaWZpZXJTdGF0ZShrZXlBcmcpO1xuICB9XG4gIHZhciBrZXlQcm9wID0gbW9kaWZpZXJLZXlUb1Byb3Bba2V5QXJnXTtcbiAgcmV0dXJuIGtleVByb3AgPyAhIW5hdGl2ZUV2ZW50W2tleVByb3BdIDogZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGdldEV2ZW50TW9kaWZpZXJTdGF0ZShuYXRpdmVFdmVudCkge1xuICByZXR1cm4gbW9kaWZpZXJTdGF0ZUdldHRlcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRFdmVudE1vZGlmaWVyU3RhdGU7XG4iLCIvKipcbiAqIENvcHlyaWdodCAyMDEzLTIwMTUsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4gKiBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqXG4gKiBAcHJvdmlkZXNNb2R1bGUgZ2V0RXZlbnRUYXJnZXRcbiAqIEB0eXBlY2hlY2tzIHN0YXRpYy1vbmx5XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEdldHMgdGhlIHRhcmdldCBub2RlIGZyb20gYSBuYXRpdmUgYnJvd3NlciBldmVudCBieSBhY2NvdW50aW5nIGZvclxuICogaW5jb25zaXN0ZW5jaWVzIGluIGJyb3dzZXIgRE9NIEFQSXMuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IG5hdGl2ZUV2ZW50IE5hdGl2ZSBicm93c2VyIGV2ZW50LlxuICogQHJldHVybiB7RE9NRXZlbnRUYXJnZXR9IFRhcmdldCBub2RlLlxuICovXG5mdW5jdGlvbiBnZXRFdmVudFRhcmdldChuYXRpdmVFdmVudCkge1xuICB2YXIgdGFyZ2V0ID0gbmF0aXZlRXZlbnQudGFyZ2V0IHx8IG5hdGl2ZUV2ZW50LnNyY0VsZW1lbnQgfHwgd2luZG93O1xuICAvLyBTYWZhcmkgbWF5IGZpcmUgZXZlbnRzIG9uIHRleHQgbm9kZXMgKE5vZGUuVEVYVF9OT0RFIGlzIDMpLlxuICAvLyBAc2VlIGh0dHA6Ly93d3cucXVpcmtzbW9kZS5vcmcvanMvZXZlbnRzX3Byb3BlcnRpZXMuaHRtbFxuICByZXR1cm4gdGFyZ2V0Lm5vZGVUeXBlID09PSAzID8gdGFyZ2V0LnBhcmVudE5vZGUgOiB0YXJnZXQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0RXZlbnRUYXJnZXQ7XG4iLCIvKipcbiAqIENvcHlyaWdodCAyMDEzLTIwMTUsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4gKiBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqXG4gKiBAcHJvdmlkZXNNb2R1bGUgaW52YXJpYW50XG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogVXNlIGludmFyaWFudCgpIHRvIGFzc2VydCBzdGF0ZSB3aGljaCB5b3VyIHByb2dyYW0gYXNzdW1lcyB0byBiZSB0cnVlLlxuICpcbiAqIFByb3ZpZGUgc3ByaW50Zi1zdHlsZSBmb3JtYXQgKG9ubHkgJXMgaXMgc3VwcG9ydGVkKSBhbmQgYXJndW1lbnRzXG4gKiB0byBwcm92aWRlIGluZm9ybWF0aW9uIGFib3V0IHdoYXQgYnJva2UgYW5kIHdoYXQgeW91IHdlcmVcbiAqIGV4cGVjdGluZy5cbiAqXG4gKiBUaGUgaW52YXJpYW50IG1lc3NhZ2Ugd2lsbCBiZSBzdHJpcHBlZCBpbiBwcm9kdWN0aW9uLCBidXQgdGhlIGludmFyaWFudFxuICogd2lsbCByZW1haW4gdG8gZW5zdXJlIGxvZ2ljIGRvZXMgbm90IGRpZmZlciBpbiBwcm9kdWN0aW9uLlxuICovXG5cbnZhciBpbnZhcmlhbnQgPSBmdW5jdGlvbihjb25kaXRpb24sIGZvcm1hdCwgYSwgYiwgYywgZCwgZSwgZikge1xuICBpZiAoXCJwcm9kdWN0aW9uXCIgIT09IHByb2Nlc3MuZW52Lk5PREVfRU5WKSB7XG4gICAgaWYgKGZvcm1hdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFyaWFudCByZXF1aXJlcyBhbiBlcnJvciBtZXNzYWdlIGFyZ3VtZW50Jyk7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFjb25kaXRpb24pIHtcbiAgICB2YXIgZXJyb3I7XG4gICAgaWYgKGZvcm1hdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBlcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgJ01pbmlmaWVkIGV4Y2VwdGlvbiBvY2N1cnJlZDsgdXNlIHRoZSBub24tbWluaWZpZWQgZGV2IGVudmlyb25tZW50ICcgK1xuICAgICAgICAnZm9yIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2UgYW5kIGFkZGl0aW9uYWwgaGVscGZ1bCB3YXJuaW5ncy4nXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYXJncyA9IFthLCBiLCBjLCBkLCBlLCBmXTtcbiAgICAgIHZhciBhcmdJbmRleCA9IDA7XG4gICAgICBlcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgJ0ludmFyaWFudCBWaW9sYXRpb246ICcgK1xuICAgICAgICBmb3JtYXQucmVwbGFjZSgvJXMvZywgZnVuY3Rpb24oKSB7IHJldHVybiBhcmdzW2FyZ0luZGV4KytdOyB9KVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBlcnJvci5mcmFtZXNUb1BvcCA9IDE7IC8vIHdlIGRvbid0IGNhcmUgYWJvdXQgaW52YXJpYW50J3Mgb3duIGZyYW1lXG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gaW52YXJpYW50O1xuIiwiaG90a2V5ID0gcmVxdWlyZSAncmVhY3QtaG90a2V5J1xuXG5ob3RrZXkuYWN0aXZhdGUoKVxuXG5MZWRnZXJFZGl0b3JWaWV3Q29udHJvbGxlciA9IHJlcXVpcmUgJy4vTGVkZ2VyRWRpdG9yVmlld0NvbnRyb2xsZXIuY2pzeCdcbkxlZGdlclZpZXdlclZpZXdDb250cm9sbGVyID0gcmVxdWlyZSAnLi9MZWRnZXJWaWV3ZXJWaWV3Q29udHJvbGxlci5janN4J1xuXG5tb2R1bGUuZXhwb3J0cyA9IFxuUmVhY3QuY3JlYXRlQ2xhc3Ncblx0bWl4aW5zOiBbaG90a2V5Lk1peGluKCdoYW5kbGVIb3RrZXknKV1cblx0Z2V0SW5pdGlhbFN0YXRlOiAtPlxuXHRcdG9wdGltaXplZFRyYW5zYWN0aW9uczogW11cblx0XHRkYXRlTGFzdE9wdGltaXplZDogbnVsbFxuXG5cdG9uTGVkZ2VyU3VibWl0OiAobGVkZ2VyT2JqLCBjb21wbGV0aW9uKSAtPlxuXHRcdGF4aW9zXG5cdFx0XHQucG9zdCgnL29wdGltaXplJywgbGVkZ2VyT2JqKVxuXHRcdFx0LnRoZW4oKHJlc3BvbnNlT2JqKSA9PlxuXHRcdFx0XHR0cmFuc2FjdGlvbnMgPSByZXNwb25zZU9iai5kYXRhWyd0cmFuc2FjdGlvbnMnXVxuXHRcdFx0XHRAc2V0U3RhdGUoXG5cdFx0XHRcdFx0b3B0aW1pemVkVHJhbnNhY3Rpb25zOiB0cmFuc2FjdGlvbnNcblx0XHRcdFx0XHRkYXRlTGFzdE9wdGltaXplZDogbmV3IERhdGUoKVxuXHRcdFx0XHQpXG5cdFx0XHRcdGNvbXBsZXRpb24oKVxuXHRcdFx0KVxuXHRcdFx0LmNhdGNoKChlcnJvcikgPT4gXG5cdFx0XHRcdGNvbXBsZXRpb24oKVxuXHRcdFx0KVxuXG5cdGhhbmRsZUhvdGtleTogKGUpIC0+XG5cdFx0aWYgZS5jdHJsS2V5IFxuXHRcdFx0c3dpdGNoIFN0cmluZy5mcm9tQ2hhckNvZGUoZS5rZXlDb2RlKVxuXHRcdFx0XHR3aGVuICdSJ1xuXHRcdFx0XHRcdEByZWZzLmxlZGdlckVkaXRvci5vbk9wdGltaXplKClcblx0XHRcdFx0d2hlbiAnRCdcblx0XHRcdFx0XHRAcmVmcy5sZWRnZXJFZGl0b3Iub25SZXNldCgpXG5cdFx0XHRcdHdoZW4gJ0EnXG5cdFx0XHRcdFx0QHJlZnMubGVkZ2VyRWRpdG9yLm9uQWRkVHJhbnNhY3Rpb24oKVxuXG5cdG9uQWRkVHJhbnNhY3Rpb246IC0+XG5cdFx0QHJlZnMubGVkZ2VyRWRpdG9yLm9uQWRkVHJhbnNhY3Rpb24oKVxuXHRvblJlc2V0OiAtPlxuXHRcdEByZWZzLmxlZGdlckVkaXRvci5vblJlc2V0KClcblx0b25PcHRpbWl6ZTogLT5cblx0XHRAcmVmcy5sZWRnZXJFZGl0b3Iub25PcHRpbWl6ZSgpXG5cblxuXHRyZW5kZXI6IC0+XG5cdFx0cmV0dXJuIChcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1wiY2xhc3NOYW1lXCI6IFwiY29udGFpbmVyXCIsIFwib25LZXlVcFwiOiAoQG9uS2V5VXApfSxcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XCJjbGFzc05hbWVcIjogXCJyb3cgY29sLXNtLTEyXCJ9LFxuXHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJoMlwiLCBudWxsLCBcIlwiXCJcblxcdFxcdFxcdFxcdFxcdFxcdE11RGVsdGEgLVxuXFx0XFx0XFx0XFx0XFx0XFx0XG5cIlwiXCIsIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzbWFsbFwiLCBudWxsLCBcIiBJbnB1dCBJT1VzIGJldHdlZW4gcGVvcGxlIGFuZCBoaXQgT3B0aW1pemUgdG8gc2VlIHRoZSBiZXN0IHdheSB0byByZXNvbHZlIGFsbCBJT1VzLiBcIilcblx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJwXCIsIG51bGwsIFwiXCJcIlxuXFx0XFx0XFx0XFx0XFx0XFx0VXNlIEVudGVyIGFuZCBCYWNrc3BhY2UgdG8gZWFzaWx5IG5hdmlnYXRlIGFyb3VuZCB0cmFuc2FjdGlvbnMuXG5cIlwiXCIpLFxuXHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwge1wiY2xhc3NOYW1lXCI6IFwiYnRuIGJ0bi1kZWZhdWx0XCIsIFwib25DbGlja1wiOiAoQG9uQWRkVHJhbnNhY3Rpb24pfSwgXCJcIlwiXG5cXHRcXHRcXHRcXHRcXHRcXHRBZGQgVHJhbnNhY3Rpb24gKEN0cmwtQSlcblwiXCJcIiksIFx0XG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiLCB7XCJjbGFzc05hbWVcIjogXCJidG4gYnRuLWRlZmF1bHRcIiwgXCJvbkNsaWNrXCI6IChAb25SZXNldCl9LCBcIlwiXCJcblxcdFxcdFxcdFxcdFxcdFxcdFJlc2V0IChDdHJsLUQpXG5cIlwiXCIpLCBcdFxuXHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwge1wiY2xhc3NOYW1lXCI6IFwiYnRuIGJ0bi1wcmltYXJ5XCIsIFwib25DbGlja1wiOiAoQG9uT3B0aW1pemUpfSwgXCJcIlwiXG5cXHRcXHRcXHRcXHRcXHRcXHRPcHRpbWl6ZSEgKEN0cmwtUilcblwiXCJcIiksXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChMZWRnZXJFZGl0b3JWaWV3Q29udHJvbGxlciwgeyBcXFxuXHRcdFx0XHRcdFx0XCJyZWZcIjogXCJsZWRnZXJFZGl0b3JcIiwgIFxcXG5cdFx0XHRcdFx0XHRcIm9uTGVkZ2VyU3VibWl0XCI6IChAb25MZWRnZXJTdWJtaXQpXG5cdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KExlZGdlclZpZXdlclZpZXdDb250cm9sbGVyLCB7IFxcXG5cdFx0XHRcdFx0XHRcInRyYW5zYWN0aW9uc1wiOiAoQHN0YXRlLm9wdGltaXplZFRyYW5zYWN0aW9ucyksICBcXFxuXHRcdFx0XHRcdFx0XCJkYXRlTGFzdE9wdGltaXplZFwiOiAoQHN0YXRlLmRhdGVMYXN0T3B0aW1pemVkKVxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0KVxuXHRcdFx0KVxuXHRcdCkiLCJMZWRnZXJUcmFuc2FjdGlvblZpZXcgPSByZXF1aXJlICcuL0xlZGdlclRyYW5zYWN0aW9uVmlldy5janN4J1xuXG5tb2R1bGUuZXhwb3J0cyA9IFxuUmVhY3QuY3JlYXRlQ2xhc3Ncblx0Z2V0SW5pdGlhbFN0YXRlOiAtPlxuXHRcdGlzT3B0aW1pemluZzogZmFsc2Vcblx0XHR0cmFuc2FjdGlvbnM6IFtcblx0XHRcdEBtYWtlRW1wdHlUcmFuc2FjdGlvbigpXG5cdFx0XVxuXHRtYWtlRW1wdHlUcmFuc2FjdGlvbjogLT4ge1xuXHRcdGRlYnRvcjogJydcblx0XHRjcmVkaXRvcjogJydcblx0XHRhbW91bnQ6ICcnXG5cdH1cblx0YWRkRW1wdHlUcmFuc2FjdGlvbjogLT5cblx0XHRuZXdUcmFuc2FjdGlvbiA9IEBtYWtlRW1wdHlUcmFuc2FjdGlvbigpXG5cdFx0QHN0YXRlLnRyYW5zYWN0aW9ucy5wdXNoKG5ld1RyYW5zYWN0aW9uKVxuXHRcdEBzZXRTdGF0ZSh0cmFuc2FjdGlvbnM6IEBzdGF0ZS50cmFuc2FjdGlvbnMpXG5cdHJlbW92ZUZpcnN0VHJhbnNhY3Rpb246IC0+XG5cdFx0QHJlbW92ZVRyYW5zYWN0aW9uQXRJbmRleCgwKVxuXHRyZW1vdmVUcmFuc2FjdGlvbkF0SW5kZXg6IChpbmRleCkgLT5cblx0XHRpZiBpbmRleCA+IDBcblx0XHRcdEB0cmFuc2FjdGlvblZpZXdBdEluZGV4KGluZGV4IC0gMSkuZm9jdXNBbW91bnRJbnB1dCgpXG5cdFx0QHN0YXRlLnRyYW5zYWN0aW9ucy5zcGxpY2UoaW5kZXgsIDEpXG5cdFx0QHNldFN0YXRlKHRyYW5zYWN0aW9uczogQHN0YXRlLnRyYW5zYWN0aW9ucylcblx0cnVuT3B0aW1pemU6IC0+XG5cdFx0QHNldFN0YXRlKGlzT3B0aW1pemluZzogdHJ1ZSlcblx0XHRjb21wbGV0aW9uID0gPT4gXG5cdFx0XHRAc2V0U3RhdGUoaXNPcHRpbWl6aW5nOiBmYWxzZSlcblx0XHRAcHJvcHMub25MZWRnZXJTdWJtaXQoQHN0YXRlLnRyYW5zYWN0aW9ucywgY29tcGxldGlvbilcblxuXHRvbkFkZFRyYW5zYWN0aW9uOiAtPlxuXHRcdEBhZGRFbXB0eVRyYW5zYWN0aW9uKClcblx0b25PcHRpbWl6ZTogLT5cblx0XHRAcnVuT3B0aW1pemUoKVxuXHRvblJlc2V0OiAtPlxuXHRcdEBzZXRTdGF0ZShAZ2V0SW5pdGlhbFN0YXRlKCkpXG5cdG9uVHJhbnNhY3Rpb25BY3Rpb246IChpbmRleCkgLT5cblx0XHRAcmVtb3ZlVHJhbnNhY3Rpb25BdEluZGV4KGluZGV4KVxuXHRvblRyYW5zYWN0aW9uQ2hhbmdlZDogKHRyYW5zYWN0aW9uLCBpbmRleCkgLT5cblx0XHRAc3RhdGUudHJhbnNhY3Rpb25zW2luZGV4XSA9IHRyYW5zYWN0aW9uXG5cdFx0QHNldFN0YXRlKHRyYW5zYWN0aW9uczogQHN0YXRlLnRyYW5zYWN0aW9ucylcblx0b25UcmFuc2FjdGlvbkVudGVyZWQ6IChpbmRleCkgLT5cblx0XHRpZiBpbmRleCA8IEBzdGF0ZS50cmFuc2FjdGlvbnMubGVuZ3RoIC0gMVxuXHRcdFx0dHJhbnNhY3Rpb25WaWV3ID0gQHRyYW5zYWN0aW9uVmlld0F0SW5kZXgoaW5kZXggKyAxKVxuXHRcdFx0dHJhbnNhY3Rpb25WaWV3LmZvY3VzRGVidG9ySW5wdXQoKVxuXHRcdGVsc2Vcblx0XHRcdEBhZGRFbXB0eVRyYW5zYWN0aW9uKClcblx0b25UcmFuc2FjdGlvbkRlbGV0ZWQ6IChpbmRleCkgLT5cblx0XHRpZiBpbmRleCA+IDBcblx0XHRcdEByZW1vdmVUcmFuc2FjdGlvbkF0SW5kZXgoaW5kZXgpXG5cblx0a2V5Rm9yVHJhbnNhY3Rpb25BdEluZGV4OiAoaW5kZXgpIC0+XG5cdFx0XCJ0cmFuc2FjdGlvblZpZXcje2luZGV4fVwiXG5cdHRyYW5zYWN0aW9uVmlld0F0SW5kZXg6IChpbmRleCkgLT5cblx0XHRrZXkgPSBAa2V5Rm9yVHJhbnNhY3Rpb25BdEluZGV4KGluZGV4KVxuXHRcdHJldHVybiBAcmVmc1trZXldXG5cblx0cmVuZGVyOiAtPlxuXHRcdHRyYW5zYWN0aW9uVmlld3MgPSBAc3RhdGUudHJhbnNhY3Rpb25zLm1hcCgodHJhbnNhY3Rpb24sIGluZGV4KSA9PlxuXHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChMZWRnZXJUcmFuc2FjdGlvblZpZXcsIHsgIFxcXG5cdFx0XHRcdFwia2V5XCI6IChpbmRleCksICBcXFxuXHRcdFx0XHRcInJlZlwiOiAoQGtleUZvclRyYW5zYWN0aW9uQXRJbmRleChpbmRleCkpLCAgXFxcblx0XHRcdFx0XCJ0cmFuc2FjdGlvblwiOiAodHJhbnNhY3Rpb24pLCAgXFxcblx0XHRcdFx0XCJvbkFjdGlvblwiOiAoPT4gQG9uVHJhbnNhY3Rpb25BY3Rpb24oaW5kZXgpKSwgIFxcXG5cdFx0XHRcdFwib25UcmFuc2FjdGlvbkNoYW5nZWRcIjogKChuZXdUeCkgPT4gQG9uVHJhbnNhY3Rpb25DaGFuZ2VkKG5ld1R4LCBpbmRleCkpLCAgXFxcblx0XHRcdFx0XCJvblRyYW5zYWN0aW9uRW50ZXJlZFwiOiAoPT4gQG9uVHJhbnNhY3Rpb25FbnRlcmVkKGluZGV4KSksICBcXFxuXHRcdFx0XHRcIm9uVHJhbnNhY3Rpb25EZWxldGVkXCI6ICg9PiBAb25UcmFuc2FjdGlvbkRlbGV0ZWQoaW5kZXgpKVxuXHRcdFx0XHQgfSlcblx0XHQpXG5cdFx0cmV0dXJuIChcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyAgXFxcblx0XHRcdFx0XCJjbGFzc05hbWVcIjogXCJyb3dcIiwgIFxcXG5cdFx0XHRcdFwic3R5bGVcIjogKHttYXJnaW5Ub3A6ICcxMHB4J30pXG5cdFx0XHRcdH0sXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1wiY2xhc3NOYW1lXCI6IFwiY29sLXNtLTEyIGxlZGdlci1jb250YWluZXJcIn0sXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XCJjbGFzc05hbWVcIjogXCJsZWRnZXItYWN0aW9uc1wifSxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJoNFwiLCB7XCJjbGFzc05hbWVcIjogXCJ0ZXh0LWxlZnRcIn0sIFwiXCJcIlxuXFx0XFx0XFx0XFx0XFx0XFx0XFx0TGVkZ2VyIFxuXCJcIlwiLCBSZWFjdC5jcmVhdGVFbGVtZW50KFwic21hbGxcIiwgbnVsbCxcblx0XHRcdFx0XHRcdFx0XHQoaWYgQHN0YXRlLmlzT3B0aW1pemluZyB0aGVuIFwiT3B0aW1pemluZy4uXCIpXG5cdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1wiY2xhc3NOYW1lXCI6IFwidHJhbnNhY3Rpb25zLWNvbnRhaW5lclwiLCBcInJlZlwiOiBcInRyYW5zYWN0aW9uc0NvbnRhaW5lclwifSxcblx0XHRcdFx0XHRcdCh0cmFuc2FjdGlvblZpZXdzKVxuXHRcdFx0XHRcdClcblx0XHRcdFx0KVxuXHRcdFx0KVxuXHRcdClcbiIsIm1vZHVsZS5leHBvcnRzID0gXG5SZWFjdC5jcmVhdGVDbGFzc1xuXHRvbklucHV0S2V5UHJlc3M6IChlKSAtPlxuXHRcdGlmIGUua2V5ID09ICdFbnRlcidcblx0XHRcdEBwcm9wcy5vbkRhdGFFbnRlcmVkKEBwcm9wcy5kYXRhS2V5KVxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0ZWxzZSBpZiBlLmtleSA9PSAnQmFja3NwYWNlJyBhbmQgZS50YXJnZXQudmFsdWUubGVuZ3RoID09IDBcblx0XHRcdEBwcm9wcy5vbkRhdGFEZWxldGVkKEBwcm9wcy5kYXRhS2V5KVxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cblx0b25JbnB1dENoYW5nZTogKGUpIC0+XG5cdFx0QHByb3BzLm9uRGF0YUNoYW5nZWQoQHByb3BzLmRhdGFLZXksIGUudGFyZ2V0LnZhbHVlKVxuXG5cdHJlbmRlcjogLT5cblx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwgeyAgXFxcblx0XHRcdFwidHlwZVwiOiBcInRleHRcIiwgIFxcXG5cdFx0XHRcImNsYXNzTmFtZVwiOiBcInRyYW5zYWN0aW9uLWlucHV0XCIsICBcXFxuXHRcdFx0XCJ2YWx1ZVwiOiAoQHByb3BzLnZhbHVlKSwgIFxcXG5cdFx0XHRcImRpc2FibGVkXCI6IChAcHJvcHMuZGlzYWJsZWQpLCAgXFxcblx0XHRcdFwicGxhY2Vob2xkZXJcIjogKEBwcm9wcy5wbGFjZWhvbGRlciksICBcXFxuXHRcdFx0XCJuYW1lXCI6IChAcHJvcHMuZGF0YUtleSksICBcXFxuXHRcdFx0XCJvbktleVVwXCI6IChAb25JbnB1dEtleVByZXNzKSwgIFxcXG5cdFx0XHRcIm9uQ2hhbmdlXCI6IChAb25JbnB1dENoYW5nZSlcblx0XHR9KSIsIkxlZGdlclRyYW5zYWN0aW9uSW5wdXQgPSByZXF1aXJlICcuL0xlZGdlclRyYW5zYWN0aW9uSW5wdXQuY2pzeCdcblxubW9kdWxlLmV4cG9ydHMgPVxuUmVhY3QuY3JlYXRlQ2xhc3Ncblx0Z2V0RGVmYXVsdFByb3BzOiAtPlxuXHRcdHN0YXRpYzogZmFsc2VcblxuXHRjb21wb25lbnREaWRNb3VudDogLT5cblx0XHRAc2V0U3RhdGUodHJhbnNhY3Rpb246IEBwcm9wcy50cmFuc2FjdGlvbiwgPT5cblx0XHRcdFJlYWN0LmZpbmRET01Ob2RlKEByZWZzLmRlYnRvcklucHV0KS5mb2N1cygpXG5cdFx0KVxuXHRjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiAobmV3UHJvcHMpIC0+XG5cdFx0QHNldFN0YXRlKHRyYW5zYWN0aW9uOiBuZXdQcm9wcy50cmFuc2FjdGlvbilcblxuXHRvbkFjdGlvbkJ1dHRvbkNsaWNrOiAtPlxuXHRcdGlmIEBwcm9wcy5vbkFjdGlvbj8gXG5cdFx0XHRAcHJvcHMub25BY3Rpb24oKVxuXHRvbkRhdGFFbnRlcmVkOiAoZGF0YUtleSkgLT5cblx0XHRzd2l0Y2ggZGF0YUtleVxuXHRcdFx0d2hlbiAnZGVidG9yJ1xuXHRcdFx0XHRAZm9jdXNDcmVkaXRvcklucHV0KClcblx0XHRcdHdoZW4gJ2NyZWRpdG9yJ1xuXHRcdFx0XHRAZm9jdXNBbW91bnRJbnB1dCgpXG5cdFx0XHR3aGVuICdhbW91bnQnXG5cdFx0XHRcdEBwcm9wcy5vblRyYW5zYWN0aW9uRW50ZXJlZCgpXG5cdG9uRGF0YUNoYW5nZWQ6IChkYXRhS2V5LCBuZXdWYWx1ZSkgLT5cblx0XHR0cmFuc2FjdGlvbiA9IEBzdGF0ZS50cmFuc2FjdGlvblxuXHRcdHRyYW5zYWN0aW9uW2RhdGFLZXldID0gbmV3VmFsdWVcblx0XHRAc2V0U3RhdGUodHJhbnNhY3Rpb246IHRyYW5zYWN0aW9uKVxuXHRcdEBwcm9wcy5vblRyYW5zYWN0aW9uQ2hhbmdlZChAc3RhdGUudHJhbnNhY3Rpb24pXG5cdG9uRGF0YURlbGV0ZWQ6IChkYXRhS2V5KSAtPlxuXHRcdHN3aXRjaCBkYXRhS2V5XG5cdFx0XHR3aGVuICdkZWJ0b3InXG5cdFx0XHRcdEBwcm9wcy5vblRyYW5zYWN0aW9uRGVsZXRlZCgpXG5cdFx0XHR3aGVuICdjcmVkaXRvcidcblx0XHRcdFx0QGZvY3VzRGVidG9ySW5wdXQoKVxuXHRcdFx0d2hlbiAnYW1vdW50J1xuXHRcdFx0XHRAZm9jdXNDcmVkaXRvcklucHV0KClcblx0aGFuZGxlSG90a2V5OiAoZSkgLT5cblx0XHRpZiBlLmN0cmxLZXlcblx0XHRcdHN3aXRjaCBTdHJpbmcuZnJvbUNoYXJDb2RlKGUua2V5Q29kZSlcblx0XHRcdFx0d2hlbiAnUydcblx0XHRcdFx0XHRAcHJvcHMub25UcmFuc2FjdGlvbkRlbGV0ZWQoKVxuXHRmb2N1c0RlYnRvcklucHV0OiAtPlxuXHRcdFJlYWN0LmZpbmRET01Ob2RlKEByZWZzLmRlYnRvcklucHV0KS5mb2N1cygpXG5cdGZvY3VzQ3JlZGl0b3JJbnB1dDogLT5cblx0XHRSZWFjdC5maW5kRE9NTm9kZShAcmVmcy5jcmVkaXRvcklucHV0KS5mb2N1cygpXG5cdGZvY3VzQW1vdW50SW5wdXQ6IC0+XG5cdFx0UmVhY3QuZmluZERPTU5vZGUoQHJlZnMuYW1vdW50SW5wdXQpLmZvY3VzKClcblx0bWFrZVRyYW5zYWN0aW9uSW5wdXQ6IChkYXRhS2V5LCBwbGFjZWhvbGRlcikgLT4gKFxuXHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoTGVkZ2VyVHJhbnNhY3Rpb25JbnB1dCwgeyAgXFxcblx0XHRcdFwicmVmXCI6IChcIiN7ZGF0YUtleX1JbnB1dFwiKSwgIFxcXG5cdFx0XHRcImRpc2FibGVkXCI6IChAcHJvcHMuc3RhdGljKSwgIFxcXG5cdFx0XHRcInZhbHVlXCI6IChAcHJvcHMudHJhbnNhY3Rpb25bZGF0YUtleV0pLCAgXFxcblx0XHRcdFwicGxhY2Vob2xkZXJcIjogKHBsYWNlaG9sZGVyKSwgIFxcXG5cdFx0XHRcImRhdGFLZXlcIjogKGRhdGFLZXkpLCAgXFxcblx0XHRcdFwib25EYXRhQ2hhbmdlZFwiOiAoQG9uRGF0YUNoYW5nZWQpLCAgXFxcblx0XHRcdFwib25EYXRhRW50ZXJlZFwiOiAoQG9uRGF0YUVudGVyZWQpLCAgXFxcblx0XHRcdFwib25EYXRhRGVsZXRlZFwiOiAoQG9uRGF0YURlbGV0ZWQpXG5cdFx0XHQgfSlcblx0KVxuXG5cdHJlbmRlcjogLT5cblx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwsXG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiYVwiLCB7ICBcXFxuXHRcdFx0XHRcImNsYXNzTmFtZVwiOiBcInRyYW5zYWN0aW9uLWFjdGlvbi1idXR0b25cIiwgICBcXFxuXHRcdFx0XHRcIm9uQ2xpY2tcIjogKEBvbkFjdGlvbkJ1dHRvbkNsaWNrKX0sXG5cdFx0XHQoXG5cdFx0XHRcdGlmICFAcHJvcHMuc3RhdGljIHRoZW4gKFxuXHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpXCIsIHtcImNsYXNzTmFtZVwiOiBcImdseXBoaWNvbiBnbHlwaGljb24tbWludXNcIn0pXG5cdFx0XHRcdCkgZWxzZSAoXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwge1wiY2xhc3NOYW1lXCI6IFwiZ2x5cGhpY29uIGdseXBoaWNvbi1va1wifSlcblx0XHRcdFx0KVxuXHRcdFx0KVxuXHRcdFx0KSxcblx0XHRcdChAbWFrZVRyYW5zYWN0aW9uSW5wdXQoJ2RlYnRvcicsICdlbnRlciBuYW1lJykpLFxuXHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwgbnVsbCwgXCIgb3dlcyBcIiksXG5cdFx0XHQoQG1ha2VUcmFuc2FjdGlvbklucHV0KCdjcmVkaXRvcicsICdlbnRlciBuYW1lJykpLFxuXHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwgbnVsbCwgXCIgYW4gYW1vdW50IG9mIFwiKSxcblx0XHRcdChAbWFrZVRyYW5zYWN0aW9uSW5wdXQoJ2Ftb3VudCcsICdlbnRlciBhbW91bnQnKSlcblx0XHQpIiwiTGVkZ2VyVHJhbnNhY3Rpb25WaWV3ID0gcmVxdWlyZSAnLi9MZWRnZXJUcmFuc2FjdGlvblZpZXcuY2pzeCdcblxubW9kdWxlLmV4cG9ydHMgPVxuUmVhY3QuY3JlYXRlQ2xhc3Ncblx0cmVuZGVyOiAtPlxuXHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1wiY2xhc3NOYW1lXCI6IFwicm93XCIsIFwic3R5bGVcIjogKHttYXJnaW5Ub3A6ICcxMHB4J30pfSxcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1wiY2xhc3NOYW1lXCI6IFwiY29sLXNtLTEyIGxlZGdlci1jb250YWluZXJcIn0sXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1wiY2xhc3NOYW1lXCI6IFwibGVkZ2VyLWFjdGlvbnNcIn0sXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImg0XCIsIHtcImNsYXNzTmFtZVwiOiBcInRleHQtbGVmdFwifSwgXCJcIlwiXG5cXHRcXHRcXHRcXHRcXHRcXHRPcHRpbWl6ZWQgTGVkZ2VyIFxuXCJcIlwiLCBSZWFjdC5jcmVhdGVFbGVtZW50KFwic21hbGxcIiwgbnVsbCwgXHRcdFxuXHRcdFx0XHRcdFx0KFxuXHRcdFx0XHRcdFx0XHRpZiBAcHJvcHMuZGF0ZUxhc3RPcHRpbWl6ZWQ/IHRoZW4gKFxuXHRcdFx0XHRcdFx0XHRcdG1vbWVudChAcHJvcHMuZGF0ZUxhc3RPcHRpbWl6ZWQpLmNhbGVuZGFyKClcblx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdClcblx0XHRcdFx0KSxcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XCJjbGFzc05hbWVcIjogXCJ0cmFuc2FjdGlvbnMtY29udGFpbmVyXCJ9LFxuXHRcdFx0XHRcdChcblx0XHRcdFx0XHRcdEBwcm9wcy50cmFuc2FjdGlvbnMubWFwKCh0cmFuc2FjdGlvbiwgaW5kZXgpID0+XG5cdFx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoTGVkZ2VyVHJhbnNhY3Rpb25WaWV3LCB7IFxcXG5cdFx0XHRcdFx0XHRcdFx0XCJ0cmFuc2FjdGlvblwiOiAodHJhbnNhY3Rpb24pLCAgXFxcblx0XHRcdFx0XHRcdFx0XHRcInN0YXRpY1wiOiAodHJ1ZSksICBcXFxuXHRcdFx0XHRcdFx0XHRcdFwia2V5XCI6IChpbmRleClcblx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdClcblx0XHRcdFx0KSxcblx0XHRcdFx0KFxuXHRcdFx0XHRcdGlmIEBwcm9wcy50cmFuc2FjdGlvbnMubGVuZ3RoID09IDAgdGhlbiAoXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCBudWxsLCBcIiBObyBUcmFuc2FjdGlvbnMgXCIpXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHQpXG5cdFx0XHQpXG5cdFx0KSIsIkFwcFZpZXdDb250cm9sbGVyID0gcmVxdWlyZSAnLi9BcHBWaWV3Q29udHJvbGxlci5janN4J1xuXG5SZWFjdC5yZW5kZXIoXG4gIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQXBwVmlld0NvbnRyb2xsZXIsIG51bGwpLFxuICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpWzBdXG4pXG4iXX0=
