goog.provide('me.ImageLayer');
goog.require('me.Renderable');
/**
 * a generic Image Layer Object
 * @class
 * @memberOf me
 * @constructor
 * @param {string} name        layer name
 * @param {int}    width       layer width in pixels 
 * @param {int}    height      layer height in pixels
 * @param {string} imagesrc       image name (as defined in the asset list)
 * @param {int}    z           z position
 * @param {me.Vector2d}  [ratio=1.0]   scrolling ratio to be applied
 */
me.ImageLayer = function(name, width, height, imagesrc, z, ratio) {
// layer name
    this.name = name;
    // get the corresponding image (throw an exception if not found)
    this.image = (imagesrc) ? me.loader.getImage(me.utils.getBasename(imagesrc)) : null;
    if (!this.image) {
        throw "melonJS: '" + imagesrc + "' file for Image Layer '" + this.name + "' not found!";
    }

    this.imagewidth = this.image.width;
    this.imageheight = this.image.height;
    // a cached reference to the viewport
    var viewport = me.game.viewport;
    // set layer width & height 
    width = width ? Math.min(viewport.width, width) : viewport.width;
    height = height ? Math.min(viewport.height, height) : viewport.height;
    goog.base(this, new me.Vector2d(0, 0), width, height);
    // displaying order
    this.z = z;
    // default ratio for parallax
    this.ratio = new me.Vector2d(1.0, 1.0);
    if (ratio) {
// little hack for backward compatiblity
        if (typeof(ratio) === "number") {
            this.ratio.set(ratio, ratio);
        } else /* vector */ {
            this.ratio.setV(ratio);
        }
    }

// last position of the viewport
    this.lastpos = viewport.pos.clone();
    // Image Layer is considered as a floating object
    this.floating = true;
    // default value for repeat
    this._repeat = 'repeat';
    this.repeatX = true;
    this.repeatY = true;
    Object.defineProperty(this, "repeat", {
        get: function get() {
            return this._repeat;
        },
        set: function set(val) {
            this._repeat = val;
            switch (this._repeat) {
                case "no-repeat" :
                    this.repeatX = false;
                    this.repeatY = false;
                    break;
                case "repeat-x" :
                    this.repeatX = true;
                    this.repeatY = false;
                    break;
                case "repeat-y" :
                    this.repeatX = false;
                    this.repeatY = true;
                    break;
                default : // "repeat"
                    this.repeatX = true;
                    this.repeatY = true;
                    break;
            }
        }
    });
    // default origin position
    this.anchorPoint.set(0, 0);
    // register to the viewport change notification
    this.handle = me.event.subscribe(me.event.VIEWPORT_ONCHANGE, this.updateLayer.bind(this));
};
goog.inherits(me.ImageLayer, me.Renderable);
/**
 * reset function
 * @ignore
 * @function
 */
me.ImageLayer.prototype.reset = function() {
// cancel the event subscription
    if (this.handle) {
        me.event.unsubscribe(this.handle);
        this.handle = null;
    }
// clear all allocated objects
    this.image = null;
    this.lastpos = null;
};
/**
 * updateLayer function
 * @param {Object} vpos 
 */
me.ImageLayer.prototype.updateLayer = function(vpos) {
    if (0 === this.ratio.x && 0 === this.ratio.y) {
// static image
        return;
    } else {
// parallax / scrolling image
        this.pos.x += ((vpos.x - this.lastpos.x) * this.ratio.x) % this.imagewidth;
        this.pos.x = (this.imagewidth + this.pos.x) % this.imagewidth;
        this.pos.y += ((vpos.y - this.lastpos.y) * this.ratio.y) % this.imageheight;
        this.pos.y = (this.imageheight + this.pos.y) % this.imageheight;
        this.lastpos.setV(vpos);
    }
};
/**
 * update function
 * @ignore
 * @function
 */
me.ImageLayer.prototype.update = function() {
// this one will be repainted anyway
// if the viewport change
// note : this will not work later if
// we re-introduce a dirty rect algorithm ?
    return false;
};
/**
 * draw the image layer 
 * @param {Object} context
 * @param {Object} rect 
 */
me.ImageLayer.prototype.draw = function(context, rect) {
// save current context state
    context.save();
    // translate default position using the anchorPoint value
    if (this.anchorPoint.y !== 0 || this.anchorPoint.x !== 0) {
        context.translate(
                ~~(this.anchorPoint.x * (this.viewport.width - this.imagewidth)),
                ~~(this.anchorPoint.y * (this.viewport.height - this.imageheight))
                );
    }

// set the layer alpha value
    context.globalAlpha *= this.getOpacity();
    var sw, sh;
    // if not scrolling ratio define, static image
    if (0 === this.ratio.x && 0 === this.ratio.y) {
// static image
        sw = Math.min(rect.width, this.imagewidth);
        sh = Math.min(rect.height, this.imageheight);
        context.drawImage(this.image,
                rect.left, rect.top, //sx, sy
                sw, sh, //sw, sh
                rect.left, rect.top, //dx, dy
                sw, sh); //dw, dh
    }
// parallax / scrolling image
// todo ; broken with dirtyRect enabled
    else {
        var sx = ~~this.pos.x;
        var sy = ~~this.pos.y;
        var dx = 0;
        var dy = 0;
        sw = Math.min(this.imagewidth - sx, this.width);
        sh = Math.min(this.imageheight - sy, this.height);
        do {
            do {
                context.drawImage(
                        this.image,
                        sx, sy, // sx, sy
                        sw, sh,
                        dx, dy, // dx, dy
                        sw, sh
                        );
                sy = 0;
                dy += sh;
                sh = Math.min(this.imageheight, this.height - dy);
            } while (this.repeatY && (dy < this.height));
            dx += sw;
            if (!this.repeatX || (dx >= this.width)) {
// done ("end" of the viewport)
                break;
            }
// else update required var for next iteration
            sx = 0;
            sw = Math.min(this.imagewidth, this.width - dx);
            sy = ~~this.pos.y;
            dy = 0;
            sh = Math.min(this.imageheight - ~~this.pos.y, this.height);
        } while (true);
    }

// restore context state
    context.restore();
};
// called when the layer is destroyed
me.ImageLayer.prototype.destroy = function() {
    this.reset();
};
