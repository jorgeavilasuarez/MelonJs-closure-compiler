goog.provide('me.ScreenObject');
goog.require('me.Renderable');
goog.require('me.sys');

/**
 * A class skeleton for "Screen" Object <br>
 * every "screen" object (title screen, credits, ingame, etc...) to be managed <br>
 * through the state manager must inherit from this base class.
 * @class
 * @extends me.Renderable
 * @memberOf me
 * @constructor
 * @param {Boolean} [addAsObject] add the object in the game manager object pool<br>
 * @param {Boolean} [isPersistent] make the screen persistent over level changes; requires addAsObject=true<br>
 * @see me.state
 * @example
 * // create a custom loading screen
 * var CustomLoadingScreen = me.ScreenObject.extend(
 * {
 *    // constructor
 *    init: function()
 *    {
 *       // pass true to the parent constructor
 *       // as we draw our progress bar in the draw function
 *       this.parent(true);
 *       // a font logo
 *       this.logo = new me.Font('century gothic', 32, 'white');
 *       // flag to know if we need to refresh the display
 *       this.invalidate = false;
 *       // load progress in percent
 *       this.loadPercent = 0;
 *       // setup a callback
 *       me.loader.onProgress = this.onProgressUpdate.bind(this);
 *
 *    },
 *
 *    // will be fired by the loader each time a resource is loaded
 *    onProgressUpdate: function(progress)
 *    {
 *       this.loadPercent = progress;
 *       this.invalidate = true;
 *    },
 *
 *
 *    // make sure the screen is only refreshed on load progress
 *    update: function()
 *    {
 *       if (this.invalidate===true)
 *       {
 *          // clear the flag
 *          this.invalidate = false;
 *          // and return true
 *          return true;
 *       }
 *       // else return false
 *       return false;
 *    },
 *
 *    // on destroy event
 *    onDestroyEvent : function ()
 *    {
 *       // "nullify" all fonts
 *       this.logo = null;
 *    },
 *
 *    //	draw function
 *    draw : function(context)
 *    {
 *       // clear the screen
 *       me.video.clearSurface (context, "black");
 *
 *       // measure the logo size
 *       logo_width = this.logo.measureText(context,"awesome loading screen").width;
 *
 *       // draw our text somewhere in the middle
 *       this.logo.draw(context,
 *                      "awesome loading screen",
 *                      ((me.video.getWidth() - logo_width) / 2),
 *                      (me.video.getHeight() + 60) / 2);
 *
 *       // display a progressive loading bar
 *       var width = Math.floor(this.loadPercent * me.video.getWidth());
 *
 *       // draw the progress bar
 *       context.strokeStyle = "silver";
 *       context.strokeRect(0, (me.video.getHeight() / 2) + 40, me.video.getWidth(), 6);
 *       context.fillStyle = "#89b002";
 *       context.fillRect(2, (me.video.getHeight() / 2) + 42, width-4, 2);
 *    },
 * });
 *
 */
me.ScreenObject = function(addAsObject, isPersistent) {
    //this.parent(new me.Vector2d(0, 0), 0, 0);
    goog.base(this, new me.Vector2d(0, 0), 0, 0);
    this.addAsObject = this.visible = (addAsObject === true) || false;
    this.isPersistent = (this.visible && (isPersistent === true)) || false;
};
goog.inherits(me.ScreenObject, me.Renderable);
/** @ignore */
me.ScreenObject.prototype.addAsObject = false;
/** @ignore */
me.ScreenObject.prototype.visible = false;
/** @ignore */
me.ScreenObject.prototype.frame = 0;
/**
 * Z-order for object sorting<br>
 * only used by the engine if the object has been initialized using addAsObject=true<br>
 * default value : 999
 * @private
 * @type Number
 * @name z
 * @memberOf me.ScreenObject
 */
me.ScreenObject.prototype.z = 999;
/**
 * Object reset function
 * @ignore
 */
me.ScreenObject.prototype.reset = function() {

    // reset the game manager
    me.game.reset();
    // reset the frame counter
    this.frame = 0;
    this.frameRate = Math.round(60 / me.sys.fps);
    // call the onReset Function
    this.onResetEvent.apply(this, arguments);
    // add our object to the GameObject Manager
    // allowing to benefit from the keyboard event stuff
    if (this.addAsObject) {
        // make sure we are visible upon reset
        this.visible = true;
        // Always use screen coordinates
        this.floating = true;
        // update the screen size if added as an object
        this.set(new me.Vector2d(), me.game.viewport.width, me.game.viewport.height);
        // add ourself !
        me.game.add(this, this.z);
    }

    // sort the object pool
    me.game.sort();
};
/**
 * destroy function
 * @ignore
 */
me.ScreenObject.prototype.destroy = function() {
    // notify the object
    this.onDestroyEvent.apply(this, arguments);
};
/**
 * update function<br>
 * optional empty function<br>
 * only used by the engine if the object has been initialized using addAsObject=true<br>
 * @name update
 * @memberOf me.ScreenObject
 * @function
 * @example
 * // define a Title Screen
 * var TitleScreen = me.ScreenObject.extend(
 * {
 *    // override the default constructor
 *    init : function()
 *    {
 *       //call the parent constructor giving true
 *       //as parameter, so that we use the update & draw functions
 *       this.parent(true);
 *       // ...
 *     },
 *     // ...
 * });
 */
me.ScreenObject.prototype.update = function() {
    return false;
};
/**
 * frame update function function
 * @ignore
 */
me.ScreenObject.prototype.onUpdateFrame = function() {
    // handle frame skipping if required
    if ((++this.frame % this.frameRate) === 0) {
        // reset the frame counter
        this.frame = 0;
        // update the timer
        me.timer.update();
        // update all games object
        me.game.update();
    }
    // draw the game objects
    me.game.draw();
};
/**
 * draw function<br>
 * optional empty function<br>
 * only used by the engine if the object has been initialized using addAsObject=true<br>
 * @name draw
 * @memberOf me.ScreenObject
 * @function
 * @example
 * // define a Title Screen
 * var TitleScreen = me.ScreenObject.extend(
 * {
 *    // override the default constructor
 *    init : function()
 *    {
 *       //call the parent constructor giving true
 *       //as parameter, so that we use the update & draw functions
 *       this.parent(true);
 *       // ...
 *     },
 *     // ...
 * });
 */
me.ScreenObject.prototype.draw = function() {
    // to be extended
};
/**
 * onResetEvent function<br>
 * called by the state manager when reseting the object<br>
 * this is typically where you will load a level, etc...
 * to be extended
 * @name onResetEvent
 * @memberOf me.ScreenObject
 * @function
 * @param {} [arguments...] optional arguments passed when switching state
 * @see me.state#change
 */
me.ScreenObject.prototype.onResetEvent = function() {
    // to be extended
};
/**
 * onDestroyEvent function<br>
 * called by the state manager before switching to another state<br>
 * @name onDestroyEvent
 * @memberOf me.ScreenObject
 * @function
 */
me.ScreenObject.prototype.onDestroyEvent = function() {
    // to be extended
};