goog.provide('me.ObjectEntity');
goog.require('me.Renderable');
goog.require('me.AnimationSheet');

/**
 * me.ObjectSettings contains the object attributes defined in Tiled<br>
 * and is created by the engine and passed as parameter to the corresponding object when loading a level<br>
 * the field marked Mandatory are to be defined either in Tiled, or in the before calling the parent constructor<br>
 * <img src="images/object_properties.png"/><br>
 * @class
 * @protected
 * @memberOf me
 */
me.ObjectSettings = {
    /**
     * object entity name<br>
     * as defined in the Tiled Object Properties
     * @public
     * @type String
     * @name name
     * @memberOf me.ObjectSettings
     */
    name: null,
    /**
     * image ressource name to be loaded<br>
     * MANDATORY<br>
     * (in case of TiledObject, this field is automatically set)
     * @public
     * @type String
     * @name image
     * @memberOf me.ObjectSettings
     */
    image: null,
    /**
     * specify a transparent color for the image in rgb format (#rrggbb)<br>
     * OPTIONAL<br>
     * (using this option will imply processing time on the image)
     * @public
     * @deprecated Use PNG or GIF with transparency instead
     * @type String
     * @name transparent_color
     * @memberOf me.ObjectSettings
     */
    transparent_color: null,
    /**
     * width of a single sprite in the spritesheet<br>
     * MANDATORY<br>
     * (in case of TiledObject, this field is automatically set)
     * @public
     * @type Int
     * @name spritewidth
     * @memberOf me.ObjectSettings
     */
    spritewidth: null,
    /**
     * height of a single sprite in the spritesheet<br>
     * OPTIONAL<br>
     * if not specified the value will be set to the corresponding image height<br>
     * (in case of TiledObject, this field is automatically set)
     * @public
     * @type Int
     * @name spriteheight
     * @memberOf me.ObjectSettings
     */
    spriteheight: null,
    /**
     * custom type for collision detection<br>
     * OPTIONAL
     * @public
     * @type String
     * @name type
     * @memberOf me.ObjectSettings
     */
    type: 0,
    /**
     * Enable collision detection for this object<br>
     * OPTIONAL
     * @public
     * @type Boolean
     * @name collidable
     * @memberOf me.ObjectSettings
     */
    collidable: true
};
/************************************************************************************/
/*                                                                                  */
/*      a generic object entity                                                     */
/*                                                                                  */
/************************************************************************************/


/**
 * a Generic Object Entity<br>
 * Object Properties (settings) are to be defined in Tiled, <br>
 * or when calling the parent constructor
 *
 * @class
 * @extends me.Renderable
 * @memberOf me
 * @constructor
 * @param {int} x the x coordinates of the sprite object
 * @param {int} y the y coordinates of the sprite object
 * @param {me.ObjectSettings} settings Object Properties as defined in Tiled <br> <img src="images/object_properties.png"/>
 */
me.ObjectEntity = function(x, y, settings) {
    // instantiate pos here to avoid
    // later re-instantiation
    if (this.pos === null) {
        this.pos = new me.Vector2d();
    }
    // call the parent constructor
    goog.base(this, this.pos.set(x, y),
            ~~settings.spritewidth || ~~settings.width,
            ~~settings.spriteheight || ~~settings.height);
    if (settings.image) {
        var image = typeof settings.image === "string" ? me.loader.getImage(settings.image) : settings.image;
        this.renderable = new me.AnimationSheet(0, 0, image,
                ~~settings.spritewidth,
                ~~settings.spriteheight,
                ~~settings.spacing,
                ~~settings.margin);
        // check for user defined transparent color
        if (settings.transparent_color) {
            this.renderable.setTransparency(settings.transparent_color);
        }
    }

    // set the object GUID value
    this.GUID = me.utils.createGUID();
    // set the object entity name
    this.name = settings.name ? settings.name.toLowerCase() : "";
    /**
     * entity current velocity<br>
     * @public
     * @type me.Vector2d
     * @name vel
     * @memberOf me.ObjectEntity
     */
    if (this.vel === undefined) {
        this.vel = new me.Vector2d();
    }
    this.vel.set(0, 0);
    /**
     * entity current acceleration<br>
     * @public
     * @type me.Vector2d
     * @name accel
     * @memberOf me.ObjectEntity
     */
    if (this.accel === undefined) {
        this.accel = new me.Vector2d();
    }
    this.accel.set(0, 0);
    /**
     * entity current friction<br>
     * @public
     * @name friction
     * @memberOf me.ObjectEntity
     */
    if (this.friction === undefined) {
        this.friction = new me.Vector2d();
    }
    this.friction.set(0, 0);
    /**
     * max velocity (to limit entity velocity)<br>
     * @public
     * @type me.Vector2d
     * @name maxVel
     * @memberOf me.ObjectEntity
     */
    if (this.maxVel === undefined) {
        this.maxVel = new me.Vector2d();
    }
    this.maxVel.set(1000, 1000);
    // some default contants
    /**
     * Default gravity value of the entity<br>
     * default value : 0.98 (earth gravity)<br>
     * to be set to 0 for RPG, shooter, etc...<br>
     * Note: Gravity can also globally be defined through me.sys.gravity
     * @public
     * @see me.sys.gravity
     * @type Number
     * @name gravity
     * @memberOf me.ObjectEntity
     */
    this.gravity = me.sys.gravity !== undefined ? me.sys.gravity : 0.98;
    // just to identify our object
    this.isEntity = true;
    /**
     * dead/living state of the entity<br>
     * default value : true
     * @public
     * @type Boolean
     * @name alive
     * @memberOf me.ObjectEntity
     */
    this.alive = true;
    // make sure it's visible by default
    this.visible = true;
    // and also non floating by default
    this.floating = false;
    // and non persistent per default
    this.isPersistent = false;
    /**
     * falling state of the object<br>
     * true if the object is falling<br>
     * false if the object is standing on something<br>
     
     * @public
     * @type Boolean
     * @name falling
     * @memberOf me.ObjectEntity
     */
    this.falling = false;
    /**
     * jumping state of the object<br>
     * equal true if the entity is jumping<br>
     
     * @public
     * @type Boolean
     * @name jumping
     * @memberOf me.ObjectEntity
     */
    this.jumping = true;
    // some usefull slope variable
    this.slopeY = 0;
    /**
     * equal true if the entity is standing on a slope<br>
     
     * @public
     * @type Boolean
     * @name onslope
     * @memberOf me.ObjectEntity
     */
    this.onslope = false;
    /**
     * equal true if the entity is on a ladder<br>
     
     * @public
     * @type Boolean
     * @name onladder
     * @memberOf me.ObjectEntity
     */
    this.onladder = false;
    /**
     * equal true if the entity can go down on a ladder<br>
     
     * @public
     * @type Boolean
     * @name disableTopLadderCollision
     * @memberOf me.ObjectEntity
     */
    this.disableTopLadderCollision = false;
    // to enable collision detection			
    this.collidable = typeof(settings.collidable) !== "undefined" ? settings.collidable : true;
    // default objec type
    this.type = settings.type || 0;
    // default flip value
    this.lastflipX = this.lastflipY = false;
    // ref to the collision map
    this.collisionMap = me.game.collisionMap;
    /**
     * Define if an entity can go through breakable tiles<br>
     * default value : false<br>
     * @public
     * @type Boolean
     * @name canBreakTile
     * @memberOf me.ObjectEntity
     */
    this.canBreakTile = false;
    /**
     * a callback when an entity break a tile<br>
     * @public
     
     * @name onTileBreak
     * @memberOf me.ObjectEntity
     */
    this.onTileBreak = null;
    // add a default shape 
    if (settings.isEllipse === true) {
        // ellipse
        this.addShape(new me.Ellipse(new me.Vector2d(0, 0), this.width, this.height));
    }
    else if ((settings.isPolygon === true) || (settings.isPolyline === true)) {
        // add a polyshape
        this.addShape(new me.PolyShape(new me.Vector2d(0, 0), settings.points, settings.isPolygon));
        // set the entity object based on the bounding box size ?
        this.width = this.collisionBox.width;
        this.height = this.collisionBox.height;
    }
    else {
        // add a rectangle
        this.addShape(new me.Rect(new me.Vector2d(0, 0), this.width, this.height));
    }



};

goog.inherits(me.ObjectEntity, me.Renderable);

/**
 * Entity "Game Unique Identifier"<br>
 * @public
 * @type String
 * @name GUID
 * @memberOf me.ObjectEntity
 */
me.ObjectEntity.prototype.GUID = null;
/**
 * define the type of the object<br>
 * default value : none<br>
 * @public
 * @type String
 * @name type
 * @memberOf me.ObjectEntity
 */
me.ObjectEntity.prototype.type = 0;
/**
 * flag to enable collision detection for this object<br>
 * default value : true<br>
 * @public
 * @type Boolean
 * @name collidable
 * @memberOf me.ObjectEntity
 */
me.ObjectEntity.prototype.collidable = true;
/**
 * Entity collision Box<br>
 * (reference to me.ObjectEntity.shapes[0].getBounds)
 * @public
 * @deprecated
 * @type me.Rect
 * @name collisionBox
 * @memberOf me.ObjectEntity
 */
me.ObjectEntity.prototype.collisionBox = null;
/**
 * Entity collision shapes<br>
 * (RFU - Reserved for Future Usage)
 * @protected
 * @type Object[]
 * @name shapes
 * @memberOf me.ObjectEntity
 */
me.ObjectEntity.prototype.shapes = null;
/**
 * The entity renderable object (if defined)
 * @public
 * @type me.Renderable
 * @name renderable
 * @memberOf me.ObjectEntity
 */
me.ObjectEntity.prototype.renderable = null;
// just to keep track of when we flip
me.ObjectEntity.prototype.lastflipX = false;
me.ObjectEntity.prototype.lastflipY = false;

/**
 * specify the size of the hit box for collision detection<br>
 * (allow to have a specific size for each object)<br>
 * e.g. : object with resized collision box :<br>
 * <img src="images/me.Rect.colpos.png"/>
 * @name updateColRect
 * @memberOf me.ObjectEntity
 * @function
 * @param {int} x x offset (specify -1 to not change the width)
 * @param {int} w width of the hit box
 * @param {int} y y offset (specify -1 to not change the height)
 * @param {int} h height of the hit box
 */
me.ObjectEntity.prototype.updateColRect = function(x, w, y, h) {
    this.collisionBox.adjustSize(x, w, y, h);
};
/**
 * add a collision shape to this entity<
 * @name addShape
 * @memberOf me.ObjectEntity
 * @public
 * @function
 * @param {me.objet} shape a shape object
 */
me.ObjectEntity.prototype.addShape = function(shape) {
    if (this.shapes === null) {
        this.shapes = [];
    }
    this.shapes.push(shape);
    // some hack to get the collisionBox working in this branch
    // to be removed once the ticket #103 will be done
    if (this.shapes.length === 1) {
        this.collisionBox = this.shapes[0].getBounds();
        // collisionBox pos vector is a reference to this pos vector
        this.collisionBox.pos = this.pos;
        // offset position vector
        this.pos.add(this.shapes[0].offset);
    }
};
/**
 * onCollision Event function<br>
 * called by the game manager when the object collide with shtg<br>
 * by default, if the object type is Collectable, the destroy function is called
 * @name onCollision
 * @memberOf me.ObjectEntity
 * @function
 * @param {me.Vector2d} res collision vector
 * @param {me.ObjectEntity} obj the other object that hit this object
 * @protected
 */
me.ObjectEntity.prototype.onCollision = function(res, obj) {
    // destroy the object if collectable
    if (this.collidable && (this.type === me.game.COLLECTABLE_OBJECT))
        me.game.remove(this);
};
/**
 * set the entity default velocity<br>
 * note : velocity is by default limited to the same value, see setMaxVelocity if needed<br>
 * @name setVelocity
 * @memberOf me.ObjectEntity
 * @function
 * @param {Int} x velocity on x axis
 * @param {Int} y velocity on y axis
 * @protected
 */
me.ObjectEntity.prototype.setVelocity = function(x, y) {
    this.accel.x = x !== 0 ? x : this.accel.x;
    this.accel.y = y !== 0 ? y : this.accel.y;
    // limit by default to the same max value
    this.setMaxVelocity(x, y);
};
/**
 * cap the entity velocity to the specified value<br>
 * @name setMaxVelocity
 * @memberOf me.ObjectEntity
 * @function
 * @param {Int} x max velocity on x axis
 * @param {Int} y max velocity on y axis
 * @protected
 */
me.ObjectEntity.prototype.setMaxVelocity = function(x, y) {
    this.maxVel.x = x;
    this.maxVel.y = y;
};
/**
 * set the entity default friction<br>
 * @name setFriction
 * @memberOf me.ObjectEntity
 * @function
 * @param {Int} x horizontal friction
 * @param {Int} y vertical friction
 * @protected
 */
me.ObjectEntity.prototype.setFriction = function(x, y) {
    this.friction.x = x || 0;
    this.friction.y = y || 0;
};
/**
 * Flip object on horizontal axis
 * @name flipX
 * @memberOf me.ObjectEntity
 * @function
 * @param {Boolean} flip enable/disable flip
 */
me.ObjectEntity.prototype.flipX = function(flip) {
    if (flip !== this.lastflipX) {
        this.lastflipX = flip;
        if (this.renderable && this.renderable.flipX) {
            // flip the animation
            this.renderable.flipX(flip);
        }
        // flip the collision box
        this.collisionBox.flipX(this.width);
    }
};
/**
 * Flip object on vertical axis
 * @name flipY
 * @memberOf me.ObjectEntity
 * @function
 * @param {Boolean} flip enable/disable flip
 */
me.ObjectEntity.prototype.flipY = function(flip) {
    if (flip !== this.lastflipY) {
        this.lastflipY = flip;
        if (this.renderable && this.renderable.flipY) {
            // flip the animation
            this.renderable.flipY(flip);
        }
        // flip the collision box
        this.collisionBox.flipY(this.height);
    }
};
/**
 * helper function for platform games: <br>
 * make the entity move left of right<br>
 * @name doWalk
 * @memberOf me.ObjectEntity
 * @function
 * @param {Boolean} left will automatically flip horizontally the entity sprite
 * @protected
 * @deprecated
 * @example
 * if (me.input.isKeyPressed('left'))
 * {
 *     this.doWalk(true);
 * }
 * else if (me.input.isKeyPressed('right'))
 * {
 *     this.doWalk(false);
 * }
 */
me.ObjectEntity.prototype.doWalk = function(left) {
    this.flipX(left);
    this.vel.x += (left) ? -this.accel.x * me.timer.tick : this.accel.x * me.timer.tick;
};
/**
 * helper function for platform games: <br>
 * make the entity move up and down<br>
 * only valid is the player is on a ladder
 * @name doClimb
 * @memberOf me.ObjectEntity
 * @function
 * @param {Boolean} up will automatically flip vertically the entity sprite
 * @protected
 * @deprecated
 * @example
 * if (me.input.isKeyPressed('up'))
 * {
 *     this.doClimb(true);
 * }
 * else if (me.input.isKeyPressed('down'))
 * {
 *     this.doClimb(false);
 * }
 */
me.ObjectEntity.prototype.doClimb = function(up) {
    // add the player x acceleration to the y velocity
    if (this.onladder) {
        this.vel.y = (up) ? -this.accel.x * me.timer.tick
                : this.accel.x * me.timer.tick;
        this.disableTopLadderCollision = !up;
        return true;
    }
    return false;
};
/**
 * helper function for platform games: <br>
 * make the entity jump<br>
 * @name doJump
 * @memberOf me.ObjectEntity
 * @function
 * @protected
 * @deprecated
 */
me.ObjectEntity.prototype.doJump = function() {
    // only jump if standing
    if (!this.jumping && !this.falling) {
        this.vel.y = -this.maxVel.y * me.timer.tick;
        this.jumping = true;
        return true;
    }
    return false;
};
/**
 * helper function for platform games: <br>
 * force to the entity to jump (for double jump)<br>
 * @name forceJump
 * @memberOf me.ObjectEntity
 * @function
 * @protected
 * @deprecated
 */
me.ObjectEntity.prototype.forceJump = function() {
    this.jumping = this.falling = false;
    this.doJump();
};
/**
 * return the distance to the specified entity
 * @name distanceTo
 * @memberOf me.ObjectEntity
 * @function
 * @param {me.ObjectEntity} e Entity
 * @return {float} distance
 */
me.ObjectEntity.prototype.distanceTo = function(e)
{
    // the me.Vector2d object also implements the same function, but
    // we have to use here the center of both entities
    var dx = (this.pos.x + this.hWidth) - (e.pos.x + e.hWidth);
    var dy = (this.pos.y + this.hHeight) - (e.pos.y + e.hHeight);
    return Math.sqrt(dx * dx + dy * dy);
};
/**
 * return the distance to the specified point
 * @name distanceToPoint
 * @memberOf me.ObjectEntity
 * @function
 * @param {me.Vector2d} v vector
 * @return {float} distance
 */
me.ObjectEntity.prototype.distanceToPoint = function(v)
{
    // the me.Vector2d object also implements the same function, but
    // we have to use here the center of both entities
    var dx = (this.pos.x + this.hWidth) - (v.x);
    var dy = (this.pos.y + this.hHeight) - (v.y);
    return Math.sqrt(dx * dx + dy * dy);
};
/**
 * return the angle to the specified entity
 * @name angleTo
 * @memberOf me.ObjectEntity
 * @function
 * @param {me.ObjectEntity} e Entity
 * @return {number} angle in radians
 */
me.ObjectEntity.prototype.angleTo = function(e)
{
    // the me.Vector2d object also implements the same function, but
    // we have to use here the center of both entities
    var ax = (e.pos.x + e.hWidth) - (this.pos.x + this.hWidth);
    var ay = (e.pos.y + e.hHeight) - (this.pos.y + this.hHeight);
    return Math.atan2(ay, ax);
};
/**
 * return the angle to the specified point
 * @name angleToPoint
 * @memberOf me.ObjectEntity
 * @function
 * @param {me.Vector2d} v vector
 * @return {number} angle in radians
 */
me.ObjectEntity.prototype.angleToPoint = function(v) {
    // the me.Vector2d object also implements the same function, but
    // we have to use here the center of both entities
    var ax = (v.x) - (this.pos.x + this.hWidth);
    var ay = (v.y) - (this.pos.y + this.hHeight);
    return Math.atan2(ay, ax);
};
/**
 * handle the player movement on a slope
 * and update vel value
 * @param {Object} tile
 * @param {Object} left
 * @ignore
 */
me.ObjectEntity.prototype.checkSlope = function(tile, left) {

    // first make the object stick to the tile
    this.pos.y = tile.pos.y - this.height;
    // normally the check should be on the object center point,
    // but since the collision check is done on corner, we must do the same thing here
    if (left)
        this.slopeY = tile.height - (this.collisionBox.right + this.vel.x - tile.pos.x);
    else
        this.slopeY = (this.collisionBox.left + this.vel.x - tile.pos.x);
    // cancel y vel
    this.vel.y = 0;
    // set player position (+ workaround when entering/exiting slopes tile)
    this.pos.y += this.slopeY.clamp(0, tile.height);
};
/**
 * compute the new velocity value
 * @param {Object} vel
 * @ignore 
 */
me.ObjectEntity.prototype.computeVelocity = function(vel) {

    // apply gravity (if any)
    if (this.gravity) {
        // apply a constant gravity (if not on a ladder)
        vel.y += !this.onladder ? (this.gravity * me.timer.tick) : 0;
        // check if falling / jumping
        this.falling = (vel.y > 0);
        this.jumping = this.falling ? false : this.jumping;
    }

    // apply friction
    if (this.friction.x)
        vel.x = me.utils.applyFriction(vel.x, this.friction.x);
    if (this.friction.y)
        vel.y = me.utils.applyFriction(vel.y, this.friction.y);
    // cap velocity
    if (vel.y !== 0)
        vel.y = vel.y.clamp(-this.maxVel.y, this.maxVel.y);
    if (vel.x !== 0)
        vel.x = vel.x.clamp(-this.maxVel.x, this.maxVel.x);
};
/**
 * handle the player movement, "trying" to update his position<br>
 * @name updateMovement
 * @memberOf me.ObjectEntity
 * @function
 * @return {me.Vector2d} a collision vector
 * @example
 * // make the player move
 * if (me.input.isKeyPressed('left'))
 * {
 *     this.vel.x -= this.accel.x * me.timer.tick;
 * }
 * else if (me.input.isKeyPressed('right'))
 * {
 *     this.vel.x += this.accel.x * me.timer.tick;
 * }
 * // update player position
 * var res = this.updateMovement();
 *
 * // check for collision result with the environment
 * if (res.x != 0)
 * {
 *   // x axis
 *   if (res.x<0)
 *      console.log("x axis : left side !");
 *   else
 *      console.log("x axis : right side !");
 * }
 * else if(res.y != 0)
 * {
 *    // y axis
 *    if (res.y<0)
 *       console.log("y axis : top side !");
 *    else
 *       console.log("y axis : bottom side !");
 *
 *    // display the tile type
 *    console.log(res.yprop.type)
 * }
 *
 * // check player status after collision check
 * var updated = (this.vel.x!=0 || this.vel.y!=0);
 */
me.ObjectEntity.prototype.updateMovement = function() {

    this.computeVelocity(this.vel);
    // Adjust position only on collidable object
    var collision;
    if (this.collidable) {
        // check for collision
        collision = this.collisionMap.checkCollision(this.collisionBox, this.vel);
        // update some flags
        this.onslope = collision.yprop.isSlope || collision.xprop.isSlope;
        // clear the ladder flag
        this.onladder = false;
        // y collision
        if (collision.y) {
            // going down, collision with the floor
            this.onladder = collision.yprop.isLadder || collision.yprop.isTopLadder;
            if (collision.y > 0) {
                if (collision.yprop.isSolid ||
                        (collision.yprop.isPlatform && (this.collisionBox.bottom - 1 <= collision.ytile.pos.y)) ||
                        (collision.yprop.isTopLadder && !this.disableTopLadderCollision)) {
                    // adjust position to the corresponding tile
                    this.pos.y = ~~this.pos.y;
                    this.vel.y = (this.falling) ? collision.ytile.pos.y - this.collisionBox.bottom : 0;
                    this.falling = false;
                }
                else if (collision.yprop.isSlope && !this.jumping) {
                    // we stop falling
                    this.checkSlope(collision.ytile, collision.yprop.isLeftSlope);
                    this.falling = false;
                }
                else if (collision.yprop.isBreakable) {
                    if (this.canBreakTile) {
                        // remove the tile
                        me.game.currentLevel.clearTile(collision.ytile.col, collision.ytile.row);
                        if (this.onTileBreak)
                            this.onTileBreak();
                    }
                    else {
                        // adjust position to the corresponding tile
                        this.pos.y = ~~this.pos.y;
                        this.vel.y = (this.falling) ? collision.ytile.pos.y - this.collisionBox.bottom : 0;
                        this.falling = false;
                    }
                }
            }
            // going up, collision with ceiling
            else if (collision.y < 0) {
                if (!collision.yprop.isPlatform && !collision.yprop.isLadder && !collision.yprop.isTopLadder) {
                    this.falling = true;
                    // cancel the y velocity
                    this.vel.y = 0;
                }
            }
        }

        // x collision
        if (collision.x) {

            this.onladder = collision.xprop.isLadder || collision.yprop.isTopLadder;
            if (collision.xprop.isSlope && !this.jumping) {
                this.checkSlope(collision.xtile, collision.xprop.isLeftSlope);
                this.falling = false;
            } else {
                // can walk through the platform & ladder
                if (!collision.xprop.isPlatform && !collision.xprop.isLadder && !collision.xprop.isTopLadder) {
                    if (collision.xprop.isBreakable && this.canBreakTile) {
                        // remove the tile
                        me.game.currentLevel.clearTile(collision.xtile.col, collision.xtile.row);
                        if (this.onTileBreak) {
                            this.onTileBreak();
                        }
                    } else {
                        this.vel.x = 0;
                    }
                }
            }
        }
    }

    // update player position
    this.pos.add(this.vel);
    // returns the collision "vector"
    return collision;
};
/**
 * Checks if this entity collides with others entities.
 * @public
 * @name collide
 * @memberOf me.ObjectEntity
 * @function
 * @param {Boolean} [multiple=false] check for multiple collision
 * @return {me.Vector2d} collision vector or an array of collision vector (if multiple collision){@link me.Rect#collideVsAABB}
 * @example
 * // update player movement
 * this.updateMovement();
 *
 * // check for collision with other objects
 * res = this.collide();
 *
 * // check if we collide with an enemy :
 * if (res && (res.obj.type == me.game.ENEMY_OBJECT))
 * {
 *   if (res.x != 0)
 *   {
 *      // x axis
 *      if (res.x<0)
 *         console.log("x axis : left side !");
 *      else
 *         console.log("x axis : right side !");
 *   }
 *   else
 *   {
 *      // y axis
 *      if (res.y<0)
 *         console.log("y axis : top side !");
 *      else
 *         console.log("y axis : bottom side !");
 *   }
 * }
 */
me.ObjectEntity.prototype.collide = function(multiple) {
    return me.game.collide(this, multiple || false);
};
/**
 * Checks if the specified entity collides with others entities of the specified type.
 * @public
 * @name collideType
 * @memberOf me.ObjectEntity
 * @function
 * @param {string} type Entity type to be tested for collision
 * @param {Boolean} [multiple=false] check for multiple collision
 * @return {me.Vector2d} collision vector or an array of collision vector (multiple collision){@link me.Rect#collideVsAABB}
 */
me.ObjectEntity.prototype.collideType = function(type, multiple) {
    return me.game.collideType(this, type, multiple || false);
};
/** @ignore */
me.ObjectEntity.prototype.update = function() {
    if (this.renderable) {
        return this.renderable.update();
    }
    return false;
};
/**
 * @ignore	
 */
me.ObjectEntity.prototype.getBounds = function() {
    if (this.renderable) {
        // translate the renderable position since its 
        // position is relative to this entity
        return this.renderable.getBounds().translateV(this.pos);
    }
    return null;
};
/**
 * object draw<br>
 * not to be called by the end user<br>
 * called by the game manager on each game loop
 * @name draw
 * @memberOf me.ObjectEntity
 * @function
 * @protected
 * @param {Context2d} context 2d Context on which draw our object
 **/
me.ObjectEntity.prototype.draw = function(context) {
    // draw the sprite if defined
    if (this.renderable) {
        // translate the renderable position (relative to the entity)
        // and keeps it in the entity defined bounds
        // anyway to optimize this ?
        var x = ~~(this.pos.x + (this.anchorPoint.x * (this.width - this.renderable.width)));
        var y = ~~(this.pos.y + (this.anchorPoint.y * (this.height - this.renderable.height)));
        context.translate(x, y);
        this.renderable.draw(context);
        context.translate(-x, -y);
    }
};
/**
 * Destroy function<br>
 * @ignore
 */
me.ObjectEntity.prototype.destroy = function() {
    // free some property objects
    if (this.renderable) {
        this.renderable.destroy.apply(this.renderable, arguments);
        this.renderable = null;
    }
    this.onDestroyEvent.apply(this, arguments);
    this.collisionBox = null;
    this.shapes = [];
};
/**
 * OnDestroy Notification function<br>
 * Called by engine before deleting the object
 * @name onDestroyEvent
 * @memberOf me.ObjectEntity
 * @function
 */
me.ObjectEntity.prototype.onDestroyEvent = function() {
    // to be extended !
};

