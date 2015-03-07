goog.provide('me.ColorLayer');
goog.require('me.Renderable');

/**
 * a generic Color Layer Object
 * @class
 * @memberOf me
 * @constructor
 * @param {string}  name    layer name
 * @param {string}  color   a CSS color value
 * @param {int}     z       z position
 */
me.ColorLayer = function(name, color, z) {
// parent constructor
    goog.base(this, new me.Vector2d(0, 0), Infinity, Infinity);
    // apply given parameters
    this.name = name;
    this.color = me.utils.HexToRGB(color);
    this.z = z;
};

goog.inherits(me.ColorLayer, me.Renderable);

/**
 * reset function
 * @ignore
 * @function
 */
me.ColorLayer.prototype.reset = function() {
// nothing to do here
};

/**
 * update function
 * @ignore
 * @function
 */
me.ColorLayer.prototype.update = function() {
    return false;
};

/**
 * draw the color layer 
 * @param {Object} context
 * @param {Object} rect 
 */
me.ColorLayer.prototype.draw = function(context, rect) {
// set layer opacity
    var _alpha = context.globalAlpha;
    context.globalAlpha *= this.getOpacity();
    // set layer color
    context.fillStyle = this.color;
    // clear the specified rect
    context.fillRect(rect.left, rect.top, rect.width, rect.height);
    // restore context alpha value
    context.globalAlpha = _alpha;
};