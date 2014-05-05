goog.provide('me.PolyShape');
goog.require('goog.object');

me.PolyShape.prototype.offset = null;
/**
 * origin point of the PolyShape
 * @public
 * @type me.Vector2d
 * @name pos
 * @memberOf me.PolyShape
 */
me.PolyShape.prototype.pos = null;
/**
 * Array of points defining the polyshape
 * @public
 * @type me.Vector2d[]
 * @name points
 * @memberOf me.PolyShape
 */
me.PolyShape.prototype.points = null;
/**
 * Specified if the shape is closed (i.e. polygon)
 * @public
 * @type boolean
 * @name closed
 * @memberOf me.PolyShape
 */
me.PolyShape.prototype.closed = null;
/**
 * the shape type
 */
me.PolyShape.prototype.shapeType = "PolyShape";
/**
 * a polyshape (polygone/polyline) Object
 * @class
 * @extends Object
 * @memberOf me
 * @constructor
 * @param {me.Vector2d} v origin point of the PolyShape
 * @param {me.Vector2d[]} points array of vector defining the polyshape
 * @param {boolean} closed true if a polygone, false if a polyline	 
 */
me.PolyShape = function(v, points, closed) {
    if (this.pos === null) {
        this.pos = new me.Vector2d();
    }

    if (this.offset === null) {
        this.offset = new me.Vector2d();
    }

    this.set(v, points, closed);
};

goog.inherits(me.PolyShape, goog.object);

/**
 * set new value to the PolyShape
 * @name set
 * @memberOf me.PolyShape
 * @function
 * @param {me.Vector2d} v origin point of the PolyShape
 * @param {me.Vector2d[]} points array of vector defining the polyshape
 * @param {boolean} closed true if a polygone, false if a polyline	 
 */
me.PolyShape.prototype.set = function(v, points, closed) {
    this.pos.setV(v);
    this.points = points;
    this.closed = (closed === true);
    this.offset.set(0, 0);
    this.getBounds();
};
/**
 * returns the bounding box for this shape, the smallest Rectangle object completely containing this shape.
 * @name getBounds
 * @memberOf me.PolyShape
 * @function
 * @return {me.Rect} the bounding box Rectangle	object
 */
me.PolyShape.prototype.getBounds = function() {
    var pos = this.offset, right = 0, bottom = 0;
    this.points.forEach(function(point) {
        pos.x = Math.min(pos.x, point.x);
        pos.y = Math.min(pos.y, point.y);
        right = Math.max(right, point.x);
        bottom = Math.max(bottom, point.y);
    });
    return new me.Rect(pos, right - pos.x, bottom - pos.y);
};
/**
 * clone this PolyShape
 * @name clone
 * @memberOf me.PolyShape
 * @function
 * @return {me.PolyShape} new PolyShape	
 */
me.PolyShape.prototype.clone = function() {
    return new me.PolyShape(this.pos.clone(), this.points, this.closed);
};
/**
 * debug purposes 
 * @param {type} context
 * @param {type} color
 * @returns {undefined}
 */
me.PolyShape.prototype.draw = function(context, color) {
    context.save();
    context.translate(-this.offset.x, -this.offset.y);
    context.strokeStyle = color || "red";
    context.beginPath();
    context.moveTo(this.points[0].x, this.points[0].y);
    this.points.forEach(function(point) {
        context.lineTo(point.x, point.y);
        context.moveTo(point.x, point.y);
    });
    if (this.closed === true) {
        context.lineTo(this.points[0].x, this.points[0].y);
    }
    context.stroke();
    context.restore();
};