
goog.provide('me.Vector2d');
//goog.require('goog.object');


/**
 * a generic 2D Vector Object
 * @class
 * @extends Object
 * @memberOf me
 * @constructor
 * @param {int} [x=0] x value of the vector
 * @param {int} [y=0] y value of the vector
 */
me.Vector2d = function(x, y) {
    this.x = x || 0;
    this.y = y || 0;
};
//goog.inherits(me.Vector2d, goog.object);

/**
 * x value of the vector
 * @public
 * @type Number
 * @name x
 * @memberOf me.Vector2d
 */
me.Vector2d.prototype.x = 0;
/**
 * y value of the vector
 * @public
 * @type Number
 * @name y
 * @memberOf me.Vector2d
 */
me.Vector2d.prototype.y = 0;

/**
 * set the Vector x and y properties to the given values<br>
 * @name set
 * @memberOf me.Vector2d
 * @function
 * @param {number} x
 * @param {number} y
 * @return {me.Vector2d} Reference to this object for method chaining
 */
me.Vector2d.prototype.set = function(x, y) {
    this.x = x;
    this.y = y;
    return this;
};
/**
 * set the Vector x and y properties to 0
 * @name setZero
 * @memberOf me.Vector2d
 * @function
 * @return {me.Vector2d} Reference to this object for method chaining
 */
me.Vector2d.prototype.setZero = function() {
    return this.set(0, 0);
};
/**
 * set the Vector x and y properties using the passed vector
 * @name setV
 * @memberOf me.Vector2d
 * @function
 * @param {me.Vector2d} v
 * @return {me.Vector2d} Reference to this object for method chaining
 */
me.Vector2d.prototype.setV = function(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
};
/**
 * Add the passed vector to this vector
 * @name add
 * @memberOf me.Vector2d
 * @function
 * @param {me.Vector2d} v
 * @return {me.Vector2d} Reference to this object for method chaining
 */
me.Vector2d.prototype.add = function(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
};
/**
 * Substract the passed vector to this vector
 * @name sub
 * @memberOf me.Vector2d
 * @function
 * @param {me.Vector2d} v
 * @return {me.Vector2d} Reference to this object for method chaining
 */
me.Vector2d.prototype.sub = function(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
};
/**
 * Multiply this vector values by the passed vector
 * @name scale
 * @memberOf me.Vector2d
 * @function
 * @param {me.Vector2d} v
 * @return {me.Vector2d} Reference to this object for method chaining
 */
me.Vector2d.prototype.scale = function(v) {
    this.x *= v.x;
    this.y *= v.y;
    return this;
};
/**
 * Divide this vector values by the passed value
 * @name div
 * @memberOf me.Vector2d
 * @function
 * @param {number} n value
 * @return {me.Vector2d} Reference to this object for method chaining
 */
me.Vector2d.prototype.div = function(n) {
    this.x /= n;
    this.y /= n;
    return this;
};
/**
 * Update this vector values to absolute values
 * @name abs
 * @memberOf me.Vector2d
 * @function
 * @return {me.Vector2d} Reference to this object for method chaining
 */
me.Vector2d.prototype.abs = function() {
    if (this.x < 0)
        this.x = -this.x;
    if (this.y < 0)
        this.y = -this.y;
    return this;
};
/**
 * Clamp the vector value within the specified value range
 * @name clamp
 * @memberOf me.Vector2d
 * @function
 * @param {number} low
 * @param {number} high
 * @return {me.Vector2d} new me.Vector2d
 */
me.Vector2d.prototype.clamp = function(low, high) {
    return new me.Vector2d(this.x.clamp(low, high), this.y.clamp(low, high));
};
/**
 * Clamp this vector value within the specified value range
 * @name clampSelf
 * @memberOf me.Vector2d
 * @function
 * @param {number} low
 * @param {number} high
 * @return {me.Vector2d} Reference to this object for method chaining
 */
me.Vector2d.prototype.clampSelf = function(low, high) {
    this.x = this.x.clamp(low, high);
    this.y = this.y.clamp(low, high);
    return this;
};
/**
 * Update this vector with the minimum value between this and the passed vector
 * @name minV
 * @memberOf me.Vector2d
 * @function
 * @param {me.Vector2d} v
 * @return {me.Vector2d} Reference to this object for method chaining
 */
me.Vector2d.prototype.minV = function(v) {
    this.x = this.x < v.x ? this.x : v.x;
    this.y = this.y < v.y ? this.y : v.y;
    return this;
};
/**
 * Update this vector with the maximum value between this and the passed vector
 * @name maxV
 * @memberOf me.Vector2d
 * @function
 * @param {me.Vector2d} v
 * @return {me.Vector2d} Reference to this object for method chaining
 */
me.Vector2d.prototype.maxV = function(v) {
    this.x = this.x > v.x ? this.x : v.x;
    this.y = this.y > v.y ? this.y : v.y;
    return this;
};
/**
 * Floor the vector values
 * @name floor
 * @memberOf me.Vector2d
 * @function
 * @return {me.Vector2d} new me.Vector2d
 */
me.Vector2d.prototype.floor = function() {
    return new me.Vector2d(~~this.x, ~~this.y);
};
/**
 * Floor this vector values
 * @name floorSelf
 * @memberOf me.Vector2d
 * @function
 * @return {me.Vector2d} Reference to this object for method chaining
 */
me.Vector2d.prototype.floorSelf = function() {
    this.x = ~~this.x;
    this.y = ~~this.y;
    return this;
};
/**
 * Ceil the vector values
 * @name ceil
 * @memberOf me.Vector2d
 * @function
 * @return {me.Vector2d} new me.Vector2d
 */
me.Vector2d.prototype.ceil = function() {
    return new me.Vector2d(Math.ceil(this.x), Math.ceil(this.y));
};
/**
 * Ceil this vector values
 * @name ceilSelf
 * @memberOf me.Vector2d
 * @function
 * @return {me.Vector2d} Reference to this object for method chaining
 */
me.Vector2d.prototype.ceilSelf = function() {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    return this;
};
/**
 * Negate the vector values
 * @name negate
 * @memberOf me.Vector2d
 * @function
 * @return {me.Vector2d} new me.Vector2d
 */
me.Vector2d.prototype.negate = function() {
    return new me.Vector2d(-this.x, -this.y);
};
/**
 * Negate this vector values
 * @name negateSelf
 * @memberOf me.Vector2d
 * @function
 * @return {me.Vector2d} Reference to this object for method chaining
 */
me.Vector2d.prototype.negateSelf = function() {
    this.x = -this.x;
    this.y = -this.y;
    return this;
};
/**
 * Copy the x,y values of the passed vector to this one
 * @name copy
 * @memberOf me.Vector2d
 * @function
 * @param {me.Vector2d} v
 * @return {me.Vector2d} Reference to this object for method chaining
 */
me.Vector2d.prototype.copy = function(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
};
/**
 * return true if the two vectors are the same
 * @name equals
 * @memberOf me.Vector2d
 * @function
 * @param {me.Vector2d} v
 * @return {Boolean}
 */
me.Vector2d.prototype.equals = function(v) {
    return ((this.x === v.x) && (this.y === v.y));
};
/**
 * return the length (magnitude) of this vector
 * @name length
 * @memberOf me.Vector2d
 * @function
 * @return {number}
 */
me.Vector2d.prototype.length = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
};
/**
 * normalize this vector (scale the vector so that its magnitude is 1)
 * @name normalize
 * @memberOf me.Vector2d
 * @function
 * @return {number}
 */
me.Vector2d.prototype.normalize = function() {
    var len = this.length();
    // some limit test
    if (len < Number.MIN_VALUE) {
        return 0.0;
    }
    var invL = 1.0 / len;
    this.x *= invL;
    this.y *= invL;
    return len;
};
/**
 * return the doc product of this vector and the passed one
 * @name dotProduct
 * @memberOf me.Vector2d
 * @function
 * @param {me.Vector2d} v
 * @return {number}
 */
me.Vector2d.prototype.dotProduct = function(v) {
    return this.x * v.x + this.y * v.y;
};
/**
 * return the distance between this vector and the passed one
 * @name distance
 * @memberOf me.Vector2d
 * @function
 * @param {me.Vector2d} v
 * @return {number}
 */
me.Vector2d.prototype.distance = function(v) {
    return Math.sqrt((this.x - v.x) * (this.x - v.x) + (this.y - v.y) * (this.y - v.y));
};
/**
 * return the angle between this vector and the passed one
 * @name angle
 * @memberOf me.Vector2d
 * @function
 * @param {me.Vector2d} v
 * @return {number} angle in radians
 */
me.Vector2d.prototype.angle = function(v) {
    return Math.atan2((v.y - this.y), (v.x - this.x));
};
/**
 * return a clone copy of this vector
 * @name clone
 * @memberOf me.Vector2d
 * @function
 * @return {me.Vector2d} new me.Vector2d
 */
me.Vector2d.prototype.clone = function() {
    return new me.Vector2d(this.x, this.y);
};
/**
 * convert the object to a string representation
 * @name toString
 * @memberOf me.Vector2d
 * @function
 * @return {string}
 */
me.Vector2d.prototype.toString = function() {
    return 'x:' + this.x + ',y:' + this.y;
};