goog.provide('me');
goog.require('me.device');
goog.require('me.save');
goog.require('me.loader');
goog.require('me.timer');
goog.require('me.state');
goog.require('me.entityPool');
goog.require('me.levelDirector');
goog.require('me.TMXMapReader');


// library name & version
me.mod = "melonJS";
me.version = "@VERSION";
me.initialized = false;


var me_initialized = false;
/*---
 
 DOM loading stuff
 
 ---*/

var readyBound = false, isReady = false, readyList = [];

// Handle when the DOM is ready
function domReady() {
    // Make sure that the DOM is not already loaded
    if (!isReady) {
        // be sure document.body is there
        if (!document.body) {
            return setTimeout(domReady, 13);
        }

        // clean up loading event
        if (document.removeEventListener) {
            document.removeEventListener("DOMContentLoaded", domReady, false);
        } else {
            window.removeEventListener("load", domReady, false);
        }

        // Remember that the DOM is ready
        isReady = true;

        // execute the defined callback
        for (var fn = 0; fn < readyList.length; fn++) {
            readyList[fn].call(window, []);
        }
        readyList.length = 0;
    }
}

// bind ready
function bindReady() {
    if (readyBound) {
        return;
    }
    readyBound = true;

    // directly call domReady if document is already "ready"
    if (document.readyState === "complete") {
        return domReady();
    } else {
        if (document.addEventListener) {
            // Use the handy event callback
            document.addEventListener("DOMContentLoaded", domReady, false);
        }
        // A fallback to window.onload, that will always work
        window.addEventListener("load", domReady, false);
    }
}

/**
 * Specify a function to execute when the DOM is fully loaded
 * @param {Function} handler A function to execute after the DOM is ready.
 * @example
 * // small main skeleton
 * var jsApp	=
 * {
 *    // Initialize the jsApp
 *    // called by the window.onReady function
 *    onload: function()
 *    {
 *       // init video
 *       if (!me.video.init('jsapp', 640, 480))
 *       {
 *          alert("Sorry but your browser does not support html 5 canvas. ");
 *          return;
 *       }
 *
 *       // initialize the "audio"
 *       me.audio.init("mp3,ogg");
 *
 *       // set callback for ressources loaded event
 *       me.loader.onload = this.loaded.bind(this);
 *
 *       // set all ressources to be loaded
 *       me.loader.preload(g_ressources);
 *
 *       // load everything & display a loading screen
 *       me.state.change(me.state.LOADING);
 *    },
 *
 *    // callback when everything is loaded
 *    loaded: function ()
 *    {
 *       // define stuff
 *       // ....
 *
 *       // change to the menu screen
 *       me.state.change(me.state.MENU);
 *    }
 * }; // jsApp
 *
 * // "bootstrap"
 * window.onReady(function()
 * {
 *    jsApp.onload();
 * });
 */
window.onReady = function(fn) {
    // Attach the listeners
    bindReady();

    // If the DOM is already ready
    if (isReady) {
        // Execute the function immediately
        fn.call(window, []);
    } else {
        // Add the function to the wait list
        readyList.push(function() {
            return fn.call(window, []);
        });
    }
    return this;
};

// call the library init function when ready
window.onReady(function() {
    _init_ME();
    me.initialized = me_initialized;
});

/************************************************************************************/

/*
 * some "Javascript API" patch & enhancement
 */

var initializing = false, fnTest = /var xyz/.test(function() {
    /**@nosideeffects*/var xyz;
}) ? /\bparent\b/ : /[\D|\d]*/;


if (typeof Object.create !== 'function') {
    /**
     * Prototypal Inheritance Create Helper
     * @param {Object} Object
     * @example
     * // declare oldObject
     * oldObject = new Object();
     * // make some crazy stuff with oldObject (adding functions, etc...)
     * ...
     * ...
     *
     * // make newObject inherits from oldObject
     * newObject = Object.create(oldObject);
     */
    Object.create = function(o) {
        function _fn() {
        }
        _fn.prototype = o;
        return new _fn();
    };
}

/**
 * The built in Function Object
 * @see {@link https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function|Function}
 */

if (!Function.prototype.bind) {
    /** @ignore */
    function Empty() {
    }

    /**
     * Binds this function to the given context by wrapping it in another function and returning the wrapper.<p>
     * Whenever the resulting "bound" function is called, it will call the original ensuring that this is set to context. <p>
     * Also optionally curries arguments for the function.     
     * @param {Object} context the object to bind to.
     * @param {} [arguments...] Optional additional arguments to curry for the function.
     * @example
     * // Ensure that our callback is triggered with the right object context (this):
     * myObject.onComplete(this.callback.bind(this));
     */
    Function.prototype.bind = function bind(that) {
        // ECMAScript 5 compliant implementation
        // http://es5.github.com/#x15.3.4.5
        // from https://github.com/kriskowal/es5-shim
        var target = this;
        if (typeof target !== "function") {
            throw new TypeError("Function.prototype.bind called on incompatible " + target);
        }
        var args = Array.prototype.slice.call(arguments, 1);
        var bound = function() {
            if (this instanceof bound) {
                var result = target.apply(this, args.concat(Array.prototype.slice.call(arguments)));
                if (Object(result) === result) {
                    return result;
                }
                return this;
            } else {
                return target.apply(that, args.concat(Array.prototype.slice.call(arguments)));
            }
        };
        if (target.prototype) {
            Empty.prototype = target.prototype;
            bound.prototype = new Empty();
            Empty.prototype = null;
        }
        return bound;
    };
}

if (!window.throttle) {
    /**
     * a simple throttle function 
     * use same fct signature as the one in prototype
     * in case it's already defined before
     * @ignore
     */
    window.throttle = function(delay, no_trailing, callback, debounce_mode) {
        var last = Date.now(), deferTimer;
        // `no_trailing` defaults to false.
        if (typeof no_trailing !== 'boolean') {
            no_trailing = false;
        }
        return function() {
            var now = Date.now();
            var elasped = now - last;
            var args = arguments;
            if (elasped < delay) {
                if (no_trailing === false) {
                    // hold on to it
                    clearTimeout(deferTimer);
                    deferTimer = setTimeout(function() {
                        last = now;
                        return callback.apply(null, args);
                    }, elasped);
                }
            } else {
                last = now;
                return callback.apply(null, args);
            }
        };
    };
}

if (typeof Date.now === "undefined") {
    /**
     * provide a replacement for browser not
     * supporting Date.now (JS 1.5)
     * @ignore
     */
    Date.now = function() {
        return new Date().getTime();
    };
}

if (typeof console === "undefined") {
    /**
     * Dummy console.log to avoid crash
     * in case the browser does not support it
     * @ignore
     */
    console = {
        log: function() {
        },
        info: function() {
        },
        error: function() {
            alert(Array.prototype.slice.call(arguments).join(", "));
        }
    };
}

/**
 * Executes a function as soon as the interpreter is idle (stack empty). 
 * @param {} [arguments...] Optional additional arguments to curry for the function.
 * @return {Int} id that can be used to clear the deferred function using clearTimeout
 * @example
 * // execute myFunc() when the stack is empty, with 'myArgument' as parameter
 * myFunc.defer('myArgument');
 */
Function.prototype.defer = function() {
    var fn = this, args = Array.prototype.slice.call(arguments);
    return window.setTimeout(function() {
        return fn.apply(fn, args);
    }, 0.01);
};

if (!window["throttle"]) {
    /**
     * a simple throttle function 
     * use same fct signature as the one in prototype
     * in case it's already defined before
     * @ignore
     */
    window["throttle"] = function(delay, no_trailing, callback, debounce_mode) {
        var last = Date.now(), deferTimer;
        // `no_trailing` defaults to false.
        if (typeof no_trailing !== 'boolean') {
            no_trailing = false;
        }
        return function() {
            var now = Date.now();
            var elasped = now - last;
            var args = arguments;
            if (elasped < delay) {
                if (no_trailing === false) {
                    // hold on to it
                    clearTimeout(deferTimer);
                    deferTimer = setTimeout(function() {
                        last = now;
                        return callback.apply(null, args);
                    }, elasped);
                }
            } else {
                last = now;
                return callback.apply(null, args);
            }
        };
    };
}

/**
 * The built in String Object 
 * @see {@link https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String|String}
 */

if (!String.prototype.trim) {
    /**
     * returns the string stripped of whitespace from both ends         
     * @return {String} trimmed string
     */
    String.prototype.trim = function() {
        return (this.replace(/^\s+/, '')).replace(/\s+window/, '');
    };
}

/**
 * add isNumeric fn to the string object
 * @return {Boolean} true if string contains only digits
 */
String.prototype.isNumeric = function() {
    return (this !== null && !isNaN(this) && this.trim() !== "");
};

/**
 * add a isBoolean fn to the string object 
 * @return {Boolean} true if the string is either true or false
 */
String.prototype.isBoolean = function() {
    return (this !== null && ("true" === this.trim() || "false" === this.trim()));
};

/**
 * add a contains fn to the string object
 
 * @param {String} string to test for
 * @return {Boolean} true if contains the specified string
 */
String.prototype.contains = function(word) {
    return this.indexOf(word) > -1;
};

/**
 * convert the string to hex value
 * @return {String}
 */
String.prototype.toHex = function() {
    var res = "", c = 0;
    while (c < this.length) {
        res += this.charCodeAt(c++).toString(16);
    }
    return res;
};

/**
 * The built in Number Object 
 * @see {@link https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Number|Number}
 */

/**
 * add a clamp fn to the Number object 
 * @param {Number} low lower limit
 * @param {Number} high higher limit
 * @return {Number} clamped value
 */
Number.prototype.clamp = function(low, high) {
    return this < low ? low : this > high ? high : +this;
};

/**
 * return a random between min, max 
 * @param {Number} min minimum value.
 * @param {Number} max maximum value.
 * @return {Number} random value
 */
Number.prototype.random = function(min, max) {
    return (~~(Math.random() * (max - min + 1)) + min);
};

/**
 * round a value to the specified number of digit 
 * @param {Number} [num="Object value"] value to be rounded.
 * @param {Number} dec number of decimal digit to be rounded to.
 * @return {Number} rounded value
 * @example
 * // round a specific value to 2 digits
 * Number.prototype.round (10.33333, 2); // return 10.33
 * // round a float value to 4 digits
 * num = 10.3333333
 * num.round(4); // return 10.3333
 */
Number.prototype.round = function() {
    // if only one argument use the object value
    var num = (arguments.length < 2) ? this : arguments[0];
    var powres = Math.pow(10, arguments[1] || arguments[0] || 0);
    return (Math.round(num * powres) / powres);
};

/**
 * a quick toHex function<br>
 * given number <b>must</b> be an int, with a value between 0 and 255
 
 * @return {String} converted hexadecimal value
 */
Number.prototype.toHex = function() {
    return "0123456789ABCDEF".charAt((this - this % 16) >> 4) + "0123456789ABCDEF".charAt(this % 16);
};

/**
 * Returns a value indicating the sign of a number<br>
 
 * @return {Number} sign of a the number
 */
Number.prototype.sign = function() {
    return this < 0 ? -1 : (this > 0 ? 1 : 0);
};

/**
 * Converts an angle in degrees to an angle in radians
 
 * @param {Number} [angle="angle"] angle in degrees
 * @return {Number} corresponding angle in radians
 * @example
 * // convert a specific angle
 * Number.prototype.degToRad (60); // return 1.0471...
 * // convert object value
 * var num = 60
 * num.degToRad(); // return 1.0471...
 */
Number.prototype.degToRad = function(angle) {
    return (angle || this) / 180.0 * Math.PI;
};

/**
 * Converts an angle in radians to an angle in degrees.
 
 * @param {Number} [angle="angle"] angle in radians
 * @return {Number} corresponding angle in degrees
 * @example
 * // convert a specific angle
 * Number.prototype.radToDeg (1.0471975511965976); // return 59.9999...
 * // convert object value
 * num = 1.0471975511965976
 * Math.ceil(num.radToDeg()); // return 60
 */
Number.prototype.radToDeg = function(angle) {
    return (angle || this) * (180.0 / Math.PI);
};

/**
 * Remove the specified object from the Array<br>     
 * @param {Object} object to be removed
 */
Array.prototype.remove = function(obj) {
    var i = Array.prototype.indexOf.call(this, obj);
    if (i !== -1) {
        Array.prototype.splice.call(this, i, 1);
    }
    return this;
};

if (!Array.prototype.forEach) {
    /**
     * provide a replacement for browsers that don't
     * support Array.prototype.forEach (JS 1.6)
     * @ignore
     */
    Array.prototype.forEach = function(callback, scope) {
        for (var i = 0, j = this.length; j--; i++) {
            callback.call(scope || this, this[i], i, this);
        }
    };
}

/*
 * me init stuff
 */

_init_ME = function() {
// don't do anything if already initialized (should not happen anyway)
    if (me_initialized) {
        return;
    }

    // check the device capabilites
    me.device._check();

    // initialize me.save
    me.save._init();

    // enable/disable the cache
    me.loader.setNocache(document.location.href.match(/\?nocache/) || false);

    // init the FPS counter if needed
    me.timer.init();

    // create a new map reader instance
    me.mapReader = new me.TMXMapReader();

    // init the App Manager
    me.state.init();

    // init the Entity Pool
    me.entityPool.init();

    // init the level Director
    me.levelDirector.reset();


    me_initialized = true;
};