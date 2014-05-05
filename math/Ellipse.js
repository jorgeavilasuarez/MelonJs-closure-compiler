goog.provide('me.Ellipse');
goog.require('goog.object');

/**
 * center point of the Ellipse
 * @public
 * @type me.Vector2d
 * @name pos
 * @memberOf me.Ellipse
 */
me.Ellipse.prototype.pos = null;
/**
 * radius (x/y) of the ellipse
 * @public
 * @type me.Vector2d
 * @name radius
 * @memberOf me.Ellipse
 */
me.Ellipse.prototype.radius = null;
/**
 * the shape type
 */
me.Ellipse.prototype.shapeType = "Ellipse";
/**
 * an ellipse Object
 * (Tiled specifies top-left coordinates, and width and height of the ellipse)
 * @class
 * @extends Object
 * @memberOf me
 * @constructor
 * @param {me.Vector2d} v top-left origin position of the Ellipse
 * @param {int} w width of the elipse
 * @param {int} h height of the elipse
 */
me.Ellipse = function(v, w, h) {
    if (this.pos === null) {
        this.pos = new me.Vector2d();
    }
    if (this.radius === null) {
        this.radius = new me.Vector2d();
    }
    this.set(v, w, h);
};

goog.inherits(me.Ellipse, goog.object);

/**
 * set new value to the Ellipse
 * @name set
 * @memberOf me.Ellipse
 * @function
 * @param {me.Vector2d} v top-left origin position of the Ellipse
 * @param {int} w width of the Ellipse
 * @param {int} h height of the Ellipse	 
 */
me.Ellipse.prototype.set = function(v, w, h) {
    this.radius.set(w / 2, h / 2);
    this.pos.setV(v).add(this.radius);
    this.offset = new me.Vector2d();
};
/**
 * returns the bounding box for this shape, the smallest Rectangle object completely containing this shape.
 * @name getBounds
 * @memberOf me.Ellipse
 * @function
 * @return {me.Rect} the bounding box Rectangle	object
 */
me.Ellipse.prototype.getBounds = function() {
    //will return a rect, with pos being the top-left coordinates 
    return new me.Rect(
            this.pos.clone().sub(this.radius),
            this.radius.x * 2,
            this.radius.y * 2
            );
};
/**
 * clone this Ellipse
 * @name clone
 * @memberOf me.Ellipse
 * @function
 * @return {me.Ellipse} new Ellipse	
 */
me.Ellipse.prototype.clone = function() {
    return new me.Ellipse(this.pos.clone(), this.radius.x * 2, this.radius.y * 2);
};
/**
 * debug purpose 
 * @param {type} context
 * @param {type} color
 * @returns {undefined}
 */
me.Ellipse.prototype.draw = function(context, color) {
    // http://tinyurl.com/opnro2r
    context.save();
    context.beginPath();
    context.translate(this.pos.x - this.radius.x, this.pos.y - this.radius.y);
    context.scale(this.radius.x, this.radius.y);
    context.arc(1, 1, 1, 0, 2 * Math.PI, false);
    context.restore();
    context.strokeStyle = color || "red";
    context.stroke();
};