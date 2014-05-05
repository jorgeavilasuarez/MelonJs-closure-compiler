goog.provide('me.LevelEntity');
goog.require('me.ObjectEntity');

/**
 * @constructor 
 * @param {type} x
 * @param {type} y
 * @param {type} settings
 * @ignore
 */
me.LevelEntity = function(x, y, settings) {
    //this.parent(x, y, settings);
    goog.base(this, x, y, settings);
    this.nextlevel = settings.to;
    this.fade = settings.fade;
    this.duration = settings.duration;
    this.fading = false;
    // a temp variable
    this.gotolevel = settings.to;
};

goog.inherits(me.LevelEntity, me.ObjectEntity);

/**
 * @ignore
 */
me.LevelEntity.prototype.onFadeComplete = function() {
    me.levelDirector.loadLevel(this.gotolevel);
    me.game.viewport.fadeOut(this.fade, this.duration);
};
/**
 * go to the specified level
 * @name goTo
 * @memberOf me.LevelEntity
 * @function
 * @param {String} [level=this.nextlevel] name of the level to load
 * @protected
 */
me.LevelEntity.prototype.goTo = function(level) {
    this.gotolevel = level || this.nextlevel;
    // load a level
    //console.log("going to : ", to);
    if (this.fade && this.duration) {
        if (!this.fading) {
            this.fading = true;
            me.game.viewport.fadeIn(this.fade, this.duration,
                    this.onFadeComplete.bind(this));
        }
    } else {
        me.levelDirector.loadLevel(this.gotolevel);
    }
};
/** @ignore */
me.LevelEntity.prototype.onCollision = function() {
    this.goTo();
};
