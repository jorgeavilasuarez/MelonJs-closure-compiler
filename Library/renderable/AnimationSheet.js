goog.provide('me.AnimationSheet');
goog.require('me.SpriteObject');


/**
 * an object to manage animation   
 * @constructor
 * @param {int} x the x coordinates of the sprite object
 * @param {int} y the y coordinates of the sprite object
 * @param {Image} image reference of the animation sheet
 * @param {int} spritewidth width of a single sprite within the spritesheet
 * @param {int} [spriteheight=image.height] height of a single sprite within the spritesheet
 * @param {Object} spacing
 * @param {Object} margin
 * @param {Object} atlas
 * @param {Object} atlasIndices
 */
me.AnimationSheet = function(x, y, image, spritewidth, spriteheight, spacing, margin, atlas, atlasIndices) {    
    // call the constructor
    goog.base(this, x, y, image, spritewidth, spriteheight, spacing, margin);
    // hold all defined animation
    this.anim = {};

    // a flag to reset animation
    this.resetAnim = null;

    // default animation sequence
    this.current = null;

    // default animation speed (ms)
    this.animationspeed = 100;

    // Spacing and margin
    this.spacing = spacing || 0;
    this.margin = margin || 0;



    // store the current atlas information
    this.textureAtlas = null;
    this.atlasIndices = null;

    // build the local textureAtlas
    this.buildLocalAtlas(atlas || undefined, atlasIndices || undefined);

    // create a default animation sequence with all sprites
    this.addAnimation("default", null);

    // set as default
    this.setCurrentAnimation("default");
};

goog.inherits(me.AnimationSheet, me.SpriteObject);

/**
 * @private
 * @type Object
 */
me.AnimationSheet.prototype.anim = {};
/**
 * Spacing and margin
 */
me.AnimationSheet.prototype.spacing = 0;
/** @ignore */
me.AnimationSheet.prototype.margin = 0;
/**
 * pause and resume animation<br>
 * default value : false;
 * @public
 * @type Boolean
 * @name me.AnimationSheet#animationpause
 */
me.AnimationSheet.prototype.animationpause = false;
/**
 * animation cycling speed (delay between frame in ms)<br>
 * default value : 100ms;
 * @public
 * @type Number
 * @name me.AnimationSheet#animationspeed
 */
me.AnimationSheet.prototype.animationspeed = 100;

/**
 * build the local (private) atlas 
 * @param {Object} atlas
 * @param {Object} indices
 * @returns {undefined}
 */
me.AnimationSheet.prototype.buildLocalAtlas = function(atlas, indices) {
    // reinitialze the atlas
    if (atlas !== undefined) {
        this.textureAtlas = atlas;
        this.atlasIndices = indices;
    } else {
        // regular spritesheet
        this.textureAtlas = [];
        // calculate the sprite count (line, col)
        var spritecount = new me.Vector2d(
                ~~((this.image.width - this.margin) / (this.width + this.spacing)),
                ~~((this.image.height - this.margin) / (this.height + this.spacing))
                );

        // build the local atlas
        for (var frame = 0, count = spritecount.x * spritecount.y; frame < count; frame++) {
            this.textureAtlas[frame] = {
                name: '' + frame,
                offset: new me.Vector2d(
                        this.margin + (this.spacing + this.width) * (frame % spritecount.x),
                        this.margin + (this.spacing + this.height) * ~~(frame / spritecount.x)
                        ),
                width: this.width,
                height: this.height,
                angle: 0
            };
        }
    }
};
/**
 * add an animation <br>
 * For fixed-sized cell spritesheet, the index list must follow the logic as per the following example :<br>
 * <img src="images/spritesheet_grid.png"/>
 * @param {string} name animation id
 * @param {Array.<number>|Array.<string>} index list of sprite index or name defining the animaton
 * @param {Int} [animationspeed] cycling speed for animation in ms (delay between each frame).
 * @see me.AnimationSheet#animationspeed
 * @example
 * // walking animatin
 * this.addAnimation ("walk", [0,1,2,3,4,5]);
 * // eating animatin
 * this.addAnimation ("eat", [6,6]);
 * // rolling animatin
 * this.addAnimation ("roll", [7,8,9,10]);
 * // slower animation
 * this.addAnimation ("roll", [7,8,9,10], 200);
 */
me.AnimationSheet.prototype.addAnimation = function(name, index, animationspeed) {
    debugger;
    this.anim[name] = {
        name: name,
        frame: [],
        idx: 0,
        length: 0,
        animationspeed: animationspeed || this.animationspeed,
        nextFrame: 0
    };


    if (index == null) {
        index = [];
        var j = 0;
        // create a default animation with all frame
        this.textureAtlas.forEach(function() {
            index[j] = j++;
        });
    }

    // set each frame configuration (offset, size, etc..)
    for (var i = 0, len = index.length; i < len; i++) {
        if (typeof(index[i]) === "number") {
            this.anim[name].frame[i] = this.textureAtlas[index[i]];
        } else { // string
            if (this.atlasIndices === null) {
                throw "melonjs: string parameters for addAnimation are only allowed for TextureAtlas ";
            } else {
                this.anim[name].frame[i] = this.textureAtlas[this.atlasIndices[index[i]]];
            }
        }
    }
    this.anim[name].length = this.anim[name].frame.length;
};
/**
 * set the current animation
 * @name setCurrentAnimation
 * @memberOf me.AnimationSheet
 * @function
 * @param {string} name animation id
 * @param {String|Function} resetAnim animation id to switch to when complete, or callback
 * @example
 * // set "walk" animation
 * this.setCurrentAnimation("walk");
 *
 * // set "eat" animation, and switch to "walk" when complete
 * this.setCurrentAnimation("eat", "walk");
 *
 * // set "die" animation, and remove the object when finished
 * this.setCurrentAnimation("die", (function () {
 *    me.game.remove(this);
 *	  return false; // do not reset to first frame
 * }).bind(this));
 *
 * // set "attack" animation, and pause for a short duration
 * this.setCurrentAnimation("die", (function () {
 *    this.animationpause = true;
 *
 *    // back to "standing" animation after 1 second
 *    setTimeout(function () {
 *        this.setCurrentAnimation("standing");
 *    }, 1000);
 *
 *	  return false; // do not reset to first frame
 * }).bind(this));
 **/
me.AnimationSheet.prototype.setCurrentAnimation = function(name, resetAnim) {
    if (this.anim[name]) {
        this.current = this.anim[name];
        this.resetAnim = resetAnim || null;
        this.setAnimationFrame(this.current.idx); // or 0 ?
        this.current.nextFrame = me.timer.getTime() + this.current.animationspeed;
    } else {
        throw "melonJS: animation id '" + name + "' not defined";
    }
};
/**
 * return true if the specified animation is the current one.
 * @name isCurrentAnimation
 * @memberOf me.AnimationSheet
 * @function
 * @param {string} name animation id
 * @return {Boolean}
 * @example
 * if (!this.isCurrentAnimation("walk"))
 * {
 *    // do something horny...
 * }
 */
me.AnimationSheet.prototype.isCurrentAnimation = function(name) {
    return this.current.name === name;
};
/**
 * force the current animation frame index.
 * @name setAnimationFrame
 * @memberOf me.AnimationSheet
 * @function
 * @param {int} [idx=0] animation frame index
 * @example
 * //reset the current animation to the first frame
 * this.setAnimationFrame();
 */
me.AnimationSheet.prototype.setAnimationFrame = function(idx) {
    this.current.idx = (idx || 0) % this.current.length;
    var frame = this.current.frame[this.current.idx];
    this.offset = frame.offset;
    this.width = frame.width;
    this.height = frame.height;
    this._sourceAngle = frame.angle;
};
/**
 * return the current animation frame index.
 * @name getCurrentAnimationFrame
 * @memberOf me.AnimationSheet
 * @function
 * @return {int} current animation frame index
 */
me.AnimationSheet.prototype.getCurrentAnimationFrame = function() {
    return this.current.idx;
};
/**
 * update the animation<br>
 * this is automatically called by the game manager {@link me.game}
 * @name update
 * @memberOf me.AnimationSheet
 * @function
 * @protected
 */
me.AnimationSheet.prototype.update = function() {
    // update animation if necessary
    if (!this.animationpause && (me.timer.getTime() >= this.current.nextFrame)) {
        this.setAnimationFrame(++this.current.idx);


        // switch animation if we reach the end of the strip
        // and a callback is defined
        if (this.current.idx === 0 && this.resetAnim) {
            // if string, change to the corresponding animation
            if (typeof this.resetAnim === "string")
                this.setCurrentAnimation(this.resetAnim);
            // if function (callback) call it
            else if (typeof this.resetAnim === "function" && this.resetAnim() === false) {
                this.current.idx = this.current.length - 1;
                this.setAnimationFrame(this.current.idx);
                //this.parent();
                goog.base(this, "update");
                return false;
            }
        }

        // set next frame timestamp
        this.current.nextFrame = me.timer.getTime() + this.current.animationspeed;

        //return this.parent() || true;
        return goog.base(this, "update") || true;
    }
    //return this.parent();
    return goog.base(this, "update");
};
                