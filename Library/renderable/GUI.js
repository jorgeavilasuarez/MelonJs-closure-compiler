goog.provide('me.GUI_Object');
goog.require('me.SpriteObject');


/**
 * object can be clicked or not
 * @public
 * @type boolean
 * @name me.GUI_Object#isClickable
 */
me.GUI_Object.prototype.isClickable = true;

/**
 *  object has been updated (clicked,etc..)	
 */
me.GUI_Object.prototype.updated = false;
/**
 * GUI Object<br>
 * A very basic object to manage GUI elements <br>
 * The object simply register on the "mousedown" <br>
 * or "touchstart" event and call the onClick function" 
 * @class
 * @extends me.SpriteObject
 * @memberOf me
 * @constructor
 * @param {number} x the x coordinate of the GUI Object
 * @param {number} y the y coordinate of the GUI Object
 * @param {me.ObjectSettings} settings Object settings
 * @example
 *
 * // create a basic GUI Object
 * var myButton = me.GUI_Object.extend(
 * {	
 *    init:function(x, y)
 *    {
 *       settings = {}
 *       settings.image = "button";
 *       settings.spritewidth = 100;
 *       settings.spriteheight = 50;
 *       // parent constructor
 *       this.parent(x, y, settings);
 *    },
 *	
 *    // output something in the console
 *    // when the object is clicked
 *    onClick:function(event)
 *    {
 *       console.log("clicked!");
 *       // don't propagate the event
 *       return false;
 *    }
 * });
 * 
 * // add the object at pos (10,10), z index 4
 * me.game.add((new myButton(10,10)),4);
 *
 */
me.GUI_Object = function(x, y, settings) {
    goog.base(this, x, y,
            ((typeof settings.image === "string") ? me.loader.getImage(settings.image) : settings.image),
            settings.spritewidth,
            settings.spriteheight);

    // GUI items use screen coordinates
    this.floating = true;

    // register on mouse event
    me.input.registerPointerEvent('mousedown', this, this.clicked.bind(this));

};
goog.inherits(me.GUI_Object, me.SpriteObject);

/**
 * return true if the object has been clicked
 * @ignore
 */
me.GUI_Object.prototype.update = function() {
    if (this.updated) {
        // clear the flag
        this.updated = false;
        return true;
    }
    return false;
};
/**
 * function callback for the mousedown event 
 * @param {Object} event
 *
 */
me.GUI_Object.prototype.clicked = function(event) {
    if (this.isClickable) {
        this.updated = true;
        return this.onClick(event);
    }
};
/**
 * function called when the object is clicked <br>
 * to be extended <br>
 * return false if we need to stop propagating the event
 * @name onClick
 * @memberOf me.GUI_Object
 * @public
 * @function
 * @param {Event} event the event object
 */
me.GUI_Object.prototype.onClick = function(event) {
    return false;
};
/**
 * OnDestroy notification function<br>
 * Called by engine before deleting the object<br>
 * be sure to call the parent function if overwritten
 * @name onDestroyEvent
 * @memberOf me.GUI_Object
 * @public
 * @function
 */
me.GUI_Object.prototype.onDestroyEvent = function() {
    me.input.releasePointerEvent('mousedown', this);
};