goog.provide('me.save');
/** 
 * A singleton object to access the device local Storage area
 * @example
 * // Initialize "score" and "lives" with default values
 * me.save.add({ score : 0, lives : 3 });
 *
 * // Save score
 * me.save.score = 31337;
 *
 * // Load lives
 * console.log(me.save.lives);
 *
 * // Also supports complex objects thanks to JSON backend
 * me.save.complexObject = { a : "b", c : [ 1, 2, 3, "d" ], e : { f : [{}] } };
 *
 * // Print all
 * console.log(JSON.stringify(me.save));
 *
 * // detele "score" from local Storage
 * me.save.delete('score');
 * @namespace me.save
 * @memberOf me
 */

// Variable to hold the object data
var data = {};
// a fucntion to check if the given key is a reserved word
function isReserved(key) {
    return (key === "add" || key === "delete");
}

/**
 * @ignore
 */
me.save._init = function() {
// Load previous data if local Storage is supported
    if (me.device.localStorage === true) {
        var keys = JSON.parse(window.localStorage.getItem("me.save")) || [];
        keys.forEach(function(key) {
            data[key] = JSON.parse(window.localStorage.getItem("me.save." + key));
        });
    }
};
/**
 * add new keys to localStorage and set them to the given default values 
 * @name add
 * @memberOf me.save
 * @function
 * @param {Object} props key and corresponding values
 * @example
 * // Initialize "score" and "lives" with default values
 * me.save.add({ score : 0, lives : 3 });
 */
me.save.add = function(props) {
    Object.keys(props).forEach(function(key) {
        if (isReserved(key))
            return;
        (function(prop) {
            Object.defineProperty(me.save, prop, {
                enumerable: true,
                get: function() {
                    return data[prop];
                },
                set: function(value) {
                    // don't overwrite if it was already defined
                    if (typeof data[prop] !== 'object') {
                        data[prop] = value;
                        if (me.device.localStorage === true) {
                            window.localStorage.setItem("me.save." + prop, JSON.stringify(data[prop]));
                        }
                    }
                }
            });
        })(key);
        // Set default value for key
        if (!(key in data)) {
            me.save[key] = props[key];
        }
    });
};
/**
 * remove a key from localStorage 
 * @name delete
 * @memberOf me.save
 * @function
 * @param {string} key key to be removed
 * @example
 * // remove the "hiscore" key from localStorage
 * me.save.delete("score");
 */
me.save["delete"] = function(key) {
    if (!isReserved(key)) {
        if (typeof data[key] !== 'undefined') {
            delete data[key];
            if (me.device.localStorage === true) {
                window.localStorage.removeItem("me.save." + key);
            }
        }
    }
};