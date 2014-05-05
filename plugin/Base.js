
goog.provide('me.plugin.Base');
goog.require('goog.object');

/**
 * define the minimum required <br>
 * version of melonJS  <br>
 * this need to be defined by the plugin
 * @public
 * @type String
 * @name me.plugin.Base#version
 */
me.plugin.Base.prototype.version = undefined;

/**
 * a base Object for plugin <br>
 * plugin must be installed using the register function
 * @see me.plugin
 * @class
 * @extends Object
 * @name plugin.Base
 * @memberOf me
 * @constructor
 */
me.plugin.Base = function() {
    //empty for now !
};

goog.inherits(me.plugin.Base, goog.base);