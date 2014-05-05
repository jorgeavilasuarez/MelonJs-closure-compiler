
goog.provide('me.CollectableEntity');

goog.require('me.ObjectEntity');


/**
 * 
 * @constructor
 * @param {type} x
 * @param {type} y
 * @param {type} settings
 * @returns {undefined}
 */
me.CollectableEntity = function(x, y, settings) {
    // call the parent constructor    
    goog.base(this, x, y, settings);

    this.type = me.game.COLLECTABLE_OBJECT;

};


goog.inherits(me.CollectableEntity, me.ObjectEntity);