goog.provide('me.plugin');

/**
 * patch a melonJS function
 * @name patch
 * @memberOf me.plugin
 * @public
 * @function
 * @param {Object} proto object target object
 * @param {name} name target function
 * @param {Function} fn function
 * @example 
 * // redefine the me.game.update function with a new one
 * me.plugin.patch(me.game, "update", function () { 
 *   // display something in the console
 *   console.log("duh");
 *   // call the original me.game.update function
 *   this.parent();
 * });
 */
me.plugin.patch = function(proto, name, fn) {
// use the object prototype if possible
    if (proto.prototype !== undefined) {
        proto = proto.prototype;
    }
// reuse the logic behind Object.extend
    if (typeof(proto[name]) === "function") {
// save the original function
        var _parent = proto[name];
        // override the function with the new one
        proto[name] = (function(name, fn) {
            return function() {
                var tmp = this.parent;
                this.parent = _parent;
                var ret = fn.apply(this, arguments);
                this.parent = tmp;
                return ret;
            };
        })(name, fn);
    }
    else {
        console.error(name + " is not an existing function");
    }
};
/**
 * Register a plugin.
 * @name register
 * @memberOf me.plugin
 * @see me.plugin.Base
 * @public
 * @function
 * @param {me.plugin.Base} plugin Plugin to instiantiate and register
 * @param {string} name 
 * @example
 * // register a new plugin
 * me.plugin.register(TestPlugin, "testPlugin");
 * // the plugin then also become available
 * // under then me.plugin namespace
 * me.plugin.testPlugin.myFunction();
 */
me.plugin.register = function(plugin, name) {
// ensure me.plugin[name] is not already "used"
    if (me.plugin[name]) {
        console.error("plugin " + name + " already registered");
    }

// compatibility testing
    if (plugin.prototype.version === undefined) {
        throw "melonJS: Plugin version not defined !";
    } else if (me.sys.checkVersion(plugin.prototype.version) > 0) {
        throw ("melonJS: Plugin version mismatch, expected: " + plugin.prototype.version + ", got: " + me.version);
    }

// get extra arguments
    var _args = [];
    if (arguments.length > 2) {
// store extra arguments if any
        _args = Array.prototype.slice.call(arguments, 1);
    }

// try to instantiate the plugin
    _args[0] = plugin;
    me.plugin[name] = new (plugin.bind.apply(plugin, _args))();
    // inheritance check
    if (!(me.plugin[name] instanceof me.plugin.Base)) {
        throw "melonJS: Plugin should extend the me.plugin.Base Class !";
    }
};