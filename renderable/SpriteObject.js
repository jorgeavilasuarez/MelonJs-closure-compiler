goog.provide('me.SpriteObject');
goog.require('me.Renderable');



/**
 * A Simple object to display a sprite on screen.
 * @class
 * @extends me.Renderable
 * @memberOf me
 * @constructor
 * @param {int} x the x coordinates of the sprite object
 * @param {int} y the y coordinates of the sprite object
 * @param {Image} image reference to the Sprite Image. See {@link me.loader#getImage}
 * @param {int} [spritewidth] sprite width
 * @param {int} [spriteheight] sprite height
 * @example
 * // create a static Sprite Object
 * mySprite = new me.SpriteObject (100, 100, me.loader.getImage("mySpriteImage"));
 */
me.SpriteObject = function(x, y, image, spritewidth, spriteheight) {

    // Used by the game engine to adjust visibility as the
    // sprite moves in and out of the viewport
    this.isSprite = true;
    // call the parent constructor
    goog.base(this, new me.Vector2d(x, y),
            spritewidth || image.width,
            spriteheight || image.height);
    // cache image reference
    this.image = image;
    // scale factor of the object
    this.scale = new me.Vector2d(1.0, 1.0);
    this.lastflipX = this.lastflipY = false;
    this.scaleFlag = false;
    // set the default sprite index & offset
    this.offset = new me.Vector2d(0, 0);
    // make it visible by default
    this.visible = true;
    // non persistent per default
    this.isPersistent = false;
    // and not flickering
    this.flickering = false;
};

goog.inherits(me.SpriteObject, me.Renderable);


// default scale ratio of the object
/** @ignore */
me.SpriteObject.prototype.scale = null;
// if true, image flipping/scaling is needed
me.SpriteObject.prototype.scaleFlag = false;
// just to keep track of when we flip
me.SpriteObject.prototype.lastflipX = false;
me.SpriteObject.prototype.lastflipY = false;
// z position (for ordering display)
me.SpriteObject.prototype.z = 0;
// image offset
me.SpriteObject.prototype.offset = null;
/**
 * Set the angle (in Radians) of a sprite to rotate it <br>
 * WARNING: rotating sprites decreases performances
 * @public
 * @type Number
 * @name me.SpriteObject#angle
 */
me.SpriteObject.prototype.angle = 0;
/**
 * Source rotation angle for pre-rotating the source image<br>
 * Commonly used for TexturePacker
 * @ignore
 */
me.SpriteObject.prototype._sourceAngle = 0;
// image reference
me.SpriteObject.prototype.image = null;
// to manage the flickering effect
me.SpriteObject.prototype.flickering = false;
me.SpriteObject.prototype.flickerTimer = -1;
me.SpriteObject.prototype.flickercb = null;
me.SpriteObject.prototype.flickerState = false;

/**
 * specify a transparent color
 * @name setTransparency
 * @memberOf me.SpriteObject
 * @function
 * @deprecated Use PNG or GIF with transparency instead
 * @param {String} col color key in "#RRGGBB" format
 */
me.SpriteObject.prototype.setTransparency = function(col) {
    // remove the # if present
    col = (col.charAt(0) === "#") ? col.substring(1, 7) : col;
    // applyRGB Filter (return a context object)
    this.image = me.video.applyRGBFilter(this.image, "transparent", col.toUpperCase()).canvas;
};
/**
 * return the flickering state of the object
 * @name isFlickering
 * @memberOf me.SpriteObject
 * @function
 * @return {Boolean}
 */
me.SpriteObject.prototype.isFlickering = function() {
    return this.flickering;
};
/**
 * make the object flicker
 * @name flicker
 * @memberOf me.SpriteObject
 * @function
 * @param {Int} duration expressed in frames
 * @param {Function} callback Function to call when flickering ends
 * @example
 * // make the object flicker for 60 frame
 * // and then remove it
 * this.flicker(60, function()
 * {
 *    me.game.remove(this);
 * });
 */
me.SpriteObject.prototype.flicker = function(duration, callback) {
    this.flickerTimer = duration;
    if (this.flickerTimer < 0) {
        this.flickering = false;
        this.flickercb = null;
    } else if (!this.flickering) {
        this.flickercb = callback;
        this.flickering = true;
    }
};
/**
 * Flip object on horizontal axis
 * @name flipX
 * @memberOf me.SpriteObject
 * @function
 * @param {Boolean} flip enable/disable flip
 */
me.SpriteObject.prototype.flipX = function(flip) {
    if (flip !== this.lastflipX) {
        this.lastflipX = flip;
        // invert the scale.x value
        this.scale.x = -this.scale.x;
        // set the scaleFlag
        this.scaleFlag = this.scale.x !== 1.0 || this.scale.y !== 1.0;
    }
};
/**
 * Flip object on vertical axis
 * @name flipY
 * @memberOf me.SpriteObject
 * @function
 * @param {Boolean} flip enable/disable flip
 */
me.SpriteObject.prototype.flipY = function(flip) {
    if (flip !== this.lastflipY) {
        this.lastflipY = flip;
        // invert the scale.x value
        this.scale.y = -this.scale.y;
        // set the scaleFlag
        this.scaleFlag = this.scale.x !== 1.0 || this.scale.y !== 1.0;
    }
};
/**
 * Resize the sprite around his center<br>
 * @name resize
 * @memberOf me.SpriteObject
 * @function
 * @param {Number} ratio scaling ratio
 */
me.SpriteObject.prototype.resize = function(ratio) {
    if (ratio > 0) {
        this.scale.x = this.scale.x < 0.0 ? -ratio : ratio;
        this.scale.y = this.scale.y < 0.0 ? -ratio : ratio;
        // set the scaleFlag
        this.scaleFlag = this.scale.x !== 1.0 || this.scale.y !== 1.0;
    }
};
/**
 * sprite update<br>
 * not to be called by the end user<br>
 * called by the game manager on each game loop
 * @name update
 * @memberOf me.SpriteObject
 * @function
 * @protected
 * @return false
 **/
me.SpriteObject.prototype.update = function() {
    //update the "flickering" state if necessary
    if (this.flickering) {
        this.flickerTimer -= me.timer.tick;
        if (this.flickerTimer < 0) {
            if (this.flickercb)
                this.flickercb();
            this.flicker(-1);
        }
        return true;
    }
    return false;
};
/**
 * object draw<br>
 * not to be called by the end user<br>
 * called by the game manager on each game loop
 * @name draw
 * @memberOf me.SpriteObject
 * @function
 * @protected
 * @param {Context2d} context 2d Context on which draw our object
 **/
me.SpriteObject.prototype.draw = function(context) {

    // do nothing if we are flickering
    if (this.flickering) {
        this.flickerState = !this.flickerState;
        if (!this.flickerState)
            return;
    }

    // save the current the context
    context.save();
    // sprite alpha value
    context.globalAlpha *= this.getOpacity();
    // clamp position vector to pixel grid
    var xpos = ~~this.pos.x, ypos = ~~this.pos.y;
    var w = this.width, h = this.height;
    var angle = this.angle + this._sourceAngle;
    if ((this.scaleFlag) || (angle !== 0)) {
        // calculate pixel pos of the anchor point
        var ax = w * this.anchorPoint.x, ay = h * this.anchorPoint.y;
        // translate to the defined anchor point
        context.translate(xpos + ax, ypos + ay);
        // scale
        if (this.scaleFlag)
            context.scale(this.scale.x, this.scale.y);
        if (angle !== 0)
            context.rotate(angle);
        if (this._sourceAngle !== 0) {
            // swap w and h for rotated source images
            w = this.height;
            h = this.width;
            xpos = -ay;
            ypos = -ax;
        }
        else {
            // reset coordinates back to upper left coordinates
            xpos = -ax;
            ypos = -ay;
        }
    }

    context.drawImage(this.image,
            this.offset.x, this.offset.y,
            w, h,
            xpos, ypos,
            w, h);
    // restore the context
    context.restore();
};
/**
 * Destroy function<br>
 * @ignore
 */
me.SpriteObject.prototype.destroy = function() {
    this.onDestroyEvent.apply(this, arguments);
};
/**
 * OnDestroy Notification function<br>
 * Called by engine before deleting the object
 * @name onDestroyEvent
 * @memberOf me.SpriteObject
 * @function
 */
me.SpriteObject.prototype.onDestroyEvent = function() {
    // to be extended !
};