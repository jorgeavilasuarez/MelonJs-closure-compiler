goog.provide('me.Rect');
//goog.require('goog.object');

/**
 * 
 * @param {Object} v
 * @param {Object} w
 * @param {Object} h
 * @returns {undefined}
 * @constructor
 */
me.Rect = function(v, w, h) {
    if (this.pos === null) {
        this.pos = new me.Vector2d();
    }
    this.pos.setV(v);
    if (this.offset === null) {
        this.offset = new me.Vector2d();
    }
    this.offset.set(0, 0);
    // allow to reduce the hitbox size
    // while on keeping the original pos vector
    // corresponding to the entity
    if (this.colPos === null) {
        this.colPos = new me.Vector2d();
    }
    this.colPos.setV(0, 0);
    this.width = w;
    this.height = h;
    // half width/height
    this.hWidth = ~~(w / 2);
    this.hHeight = ~~(h / 2);
    // redefine some properties to ease our life when getting the rectangle coordinates
    Object.defineProperty(this, "left", {
        get: function() {
            return this.pos.x;
        },
        configurable: true
    });
    Object.defineProperty(this, "right", {
        get: function() {
            return this.pos.x + this.width;
        },
        configurable: true
    });
    Object.defineProperty(this, "top", {
        get: function() {
            return this.pos.y;
        },
        configurable: true
    });
    Object.defineProperty(this, "bottom", {
        get: function() {
            return this.pos.y + this.height;
        },
        configurable: true
    });
};
//goog.inherits(me.Rect, goog.object);


/**
 * position of the Rectange
 * @public
 * @type me.Vector2d
 * @name pos
 * @memberOf me.Rect
 */
me.Rect.prototype.pos = null;

/**
 * allow to reduce the collision box size<p>
 * while keeping the original position vector (pos)<p>
 * corresponding to the entity<p>
 * colPos is a relative offset to pos
 * @ignore
 * @type me.Vector2d
 * @name colPos
 * @memberOf me.Rect
 * @see me.Rect#adjustSize
 */
me.Rect.prototype.colPos = null;

/**
 * width of the Rectange
 * @public
 * @type Int
 * @name width
 * @memberOf me.Rect
 */
me.Rect.prototype.width = 0;
/**
 * height of the Rectange
 * @public
 * @type Int
 * @name height
 * @memberOf me.Rect
 */
me.Rect.prototype.height = 0;

/**
 * half width/height
 */
me.Rect.prototype.hWidth = 0;

/**
 * half width/height
 */
me.Rect.prototype.hHeight = 0;
/**
 * the shape type
 */
me.Rect.prototype.shapeType = "Rectangle";
/**
 * will be replaced by pos and replace colPos in 1.0.0 :)
 * @ignore
 */
me.Rect.prototype.offset = null;
/**
 * set new value to the rectangle
 * @name set
 * @memberOf me.Rect
 * @function
 * @param {me.Vector2d} v x,y position for the rectangle
 * @param {int} w width of the rectangle
 * @param {int} h height of the rectangle	 
 */
me.Rect.prototype.set = function(v, w, h) {
    this.pos.setV(v);
    this.width = w;
    this.height = h;
    this.hWidth = ~~(w / 2);
    this.hHeight = ~~(h / 2);
    //reset offset
    this.offset.set(0, 0);
};
/**
 * returns the bounding box for this shape, the smallest rectangle object completely containing this shape.
 * @name getBounds
 * @memberOf me.Rect
 * @function
 * @return {me.Rect} new rectangle	
 */
me.Rect.prototype.getBounds = function() {
    return this.clone();
};
/**
 * clone this rectangle
 * @name clone
 * @memberOf me.Rect
 * @function
 * @return {me.Rect} new rectangle	
 */
me.Rect.prototype.clone = function() {
    return new me.Rect(this.pos.clone(), this.width, this.height);
};
/**
 * translate the rect by the specified offset
 * @name translate
 * @memberOf me.Rect
 * @function
 * @param {number} x x offset
 * @param {number} y y offset
 * @return {me.Rect} this rectangle	
 */
me.Rect.prototype.translate = function(x, y) {
    this.pos.x += x;
    this.pos.y += y;
    return this;
};
/**
 * translate the rect by the specified vector
 * @name translateV
 * @memberOf me.Rect
 * @function
 * @param {me.Vector2d} v vector offset
 * @return {me.Rect} this rectangle	
 */
me.Rect.prototype.translateV = function(v) {
    this.pos.add(v);
    return this;
};
/**
 * merge this rectangle with another one
 * @name union
 * @memberOf me.Rect
 * @function
 * @param {me.Rect} r rect other rectangle to union with
 * @return {me.Rect} the union(ed) rectangle	 
 */
me.Rect.prototype.union = function(r) {
    var x1 = Math.min(this.pos.x, r.pos.x);
    var y1 = Math.min(this.pos.y, r.pos.y);
    this.width = Math.ceil(Math.max(this.pos.x + this.width, r.pos.x + r.width) - x1);
    this.height = Math.ceil(Math.max(this.pos.y + this.height, r.pos.y + r.height) - y1);
    this.pos.x = ~~x1;
    this.pos.y = ~~y1;
    return this;
};
/**
 * update the size of the collision rectangle<br>
 * the colPos Vector is then set as a relative offset to the initial position (pos)<br>
 * <img src="images/me.Rect.colpos.png"/>
 * @name adjustSize
 * @memberOf me.Rect
 * @function
 * @param {int} x x offset (specify -1 to not change the width)
 * @param {int} w width of the hit box
 * @param {int} y y offset (specify -1 to not change the height)
 * @param {int} h height of the hit box
 */
me.Rect.prototype.adjustSize = function(x, w, y, h) {
    if (x !== -1) {
        this.colPos.x = x;
        this.width = w;
        this.hWidth = ~~(this.width / 2);
        // avoid Property definition if not necessary
        if (this.left !== this.pos.x + this.colPos.x) {
            // redefine our properties taking colPos into account
            Object.defineProperty(this, "left", {
                get: function() {
                    return this.pos.x + this.colPos.x;
                },
                configurable: true
            });
        }
        if (this.right !== this.pos.x + this.colPos.x + this.width) {
            Object.defineProperty(this, "right", {
                get: function() {
                    return this.pos.x + this.colPos.x + this.width;
                },
                configurable: true
            });
        }
    }
    if (y !== -1) {
        this.colPos.y = y;
        this.height = h;
        this.hHeight = ~~(this.height / 2);
        // avoid Property definition if not necessary
        if (this.top !== this.pos.y + this.colPos.y) {
            // redefine our properties taking colPos into account
            Object.defineProperty(this, "top", {
                get: function() {
                    return this.pos.y + this.colPos.y;
                },
                configurable: true
            });
        }
        if (this.bottom !== this.pos.y + this.colPos.y + this.height) {
            Object.defineProperty(this, "bottom", {
                get: function() {
                    return this.pos.y + this.colPos.y + this.height;
                },
                configurable: true
            });
        }
    }
};
/**
 *	
 * flip on X axis
 * usefull when used as collision box, in a non symetric way
 * @ignore
 * @param sw the sprite width
 */
me.Rect.prototype.flipX = function(sw) {
    this.colPos.x = sw - this.width - this.colPos.x;
    this.hWidth = ~~(this.width / 2);
};
/**
 *	
 * flip on Y axis
 * usefull when used as collision box, in a non symetric way
 * @ignore
 * @param sh the height width
 */
me.Rect.prototype.flipY = function(sh) {
    this.colPos.y = sh - this.height - this.colPos.y;
    this.hHeight = ~~(this.height / 2);
};
/**
 * return true if this rectangle is equal to the specified one
 * @name equals
 * @memberOf me.Rect
 * @function
 * @param {me.Rect} r rect
 * @return {Boolean}
 */
me.Rect.prototype.equals = function(r) {
    return (this.left === r.left &&
            this.right === r.right &&
            this.top === r.top &&
            this.bottom === r.bottom);
};
/**
 * check if this rectangle is intersecting with the specified one
 * @name overlaps
 * @memberOf me.Rect
 * @function
 * @param  {me.Rect} r rect
 * @return {boolean} true if overlaps
 */
me.Rect.prototype.overlaps = function(r) {
    return (this.left < r.right &&
            r.left < this.right &&
            this.top < r.bottom &&
            r.top < this.bottom);
};
/**
 * check if this rectangle is within the specified one
 * @name within
 * @memberOf me.Rect
 * @function
 * @param  {me.Rect} r rect
 * @return {boolean} true if within
 */
me.Rect.prototype.within = function(r) {
    return (r.left <= this.left &&
            r.right >= this.right &&
            r.top <= this.top &&
            r.bottom >= this.bottom);
};
/**
 * check if this rectangle contains the specified one
 * @name contains
 * @memberOf me.Rect
 * @function
 * @param  {me.Rect} r rect
 * @return {boolean} true if contains
 */
me.Rect.prototype.contains = function(r) {
    return (r.left >= this.left &&
            r.right <= this.right &&
            r.top >= this.top &&
            r.bottom <= this.bottom);
};
/**
 * check if this rectangle contains the specified point
 * @name containsPointV
 * @memberOf me.Rect
 * @function
 * @param  {me.Vector2d} v point
 * @return {boolean} true if contains
 */
me.Rect.prototype.containsPointV = function(v) {
    return this.containsPoint(v.x, v.y);
};
/**
 * check if this rectangle contains the specified point
 * @name containsPoint
 * @memberOf me.Rect
 * @function
 * @param  {number} x x coordinate
 * @param  {number} y y coordinate
 * @return {boolean} true if contains
 */
me.Rect.prototype.containsPoint = function(x, y) {
    return  (x >= this.left && x <= this.right &&
            (y >= this.top) && y <= this.bottom);
};
/**
 * AABB vs AABB collission dectection<p>
 * If there was a collision, the return vector will contains the following values: 
 * @example
 * if (v.x != 0 || v.y != 0)
 * {
 *   if (v.x != 0)
 *   {
 *      // x axis
 *      if (v.x<0)
 *         console.log("x axis : left side !");
 *      else
 *         console.log("x axis : right side !");
 *   }
 *   else
 *   {
 *      // y axis
 *      if (v.y<0)
 *         console.log("y axis : top side !");
 *      else
 *         console.log("y axis : bottom side !");			
 *   }
 *		
 * }
 * @ignore
 * @param {me.Rect} rect
 * @return {me.Vector2d} 
 */
me.Rect.prototype.collideWithRectangle = function(rect) {
    // response vector
    var p = new me.Vector2d(0, 0);
    // check if both box are overlaping
    if (this.overlaps(rect)) {
        // compute delta between this & rect
        var dx = this.left + this.hWidth - rect.left - rect.hWidth;
        var dy = this.top + this.hHeight - rect.top - rect.hHeight;
        // compute penetration depth for both axis
        p.x = (rect.hWidth + this.hWidth) - (dx < 0 ? -dx : dx); // - Math.abs(dx);
        p.y = (rect.hHeight + this.hHeight) - (dy < 0 ? -dy : dy); // - Math.abs(dy);

        // check and "normalize" axis
        if (p.x < p.y) {
            p.y = 0;
            p.x = dx < 0 ? -p.x : p.x;
        } else {
            p.x = 0;
            p.y = dy < 0 ? -p.y : p.y;
        }
    }
    return p;
};
/**
 * debug purpose 
 * @param {Object} context
 * @param {Object} color
 * @returns {undefined}
 */
me.Rect.prototype.draw = function(context, color) {
    // draw the rectangle
    context.strokeStyle = color || "red";
    context.strokeRect(this.left, this.top, this.width, this.height);
};