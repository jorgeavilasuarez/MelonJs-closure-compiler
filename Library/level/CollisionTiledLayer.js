goog.provide('me.CollisionTiledLayer ');
goog.require('me.Renderable');

/**
 * a generic collision tile based layer object
 * @memberOf me 
 * @constructor 
 * @param {Object} width
 * @param {Object} height 
 */
me.CollisionTiledLayer = function(width, height) {
    goog.base(this, new me.Vector2d(0, 0), width, height);
    this.isCollisionMap = true;
};
goog.inherits(me.CollisionTiledLayer, me.Renderable);

/**
 * reset function
 * @ignore
 * @function
 */
me.CollisionTiledLayer.prototype.reset = function() {
// nothing to do here
};

/**
 * only test for the world limit 
 * @param {Object} obj
 * @param {Object} pv
 * @returns {me.CollisionTiledLayer.prototype.checkCollision.res}
 */
me.CollisionTiledLayer.prototype.checkCollision = function(obj, pv) {
    var x = (pv.x < 0) ? obj.left + pv.x : obj.right + pv.x;
    var y = (pv.y < 0) ? obj.top + pv.y : obj.bottom + pv.y;
    //to return tile collision detection
    var res = {
        x: 0, // !=0 if collision on x axis
        y: 0, // !=0 if collision on y axis
        xprop: {},
        yprop: {}
    };
    // test x limits
    if (x <= 0 || x >= this.width) {
        res.x = pv.x;
    }

// test y limits
    if (y <= 0 || y >= this.height) {
        res.y = pv.y;
    }

// return the collide object if collision
    return res;
};
