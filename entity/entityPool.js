goog.provide('me.entityPool');
goog.require('me.ObjectEntity');
goog.require('me.CollectableEntity');
goog.require('me.LevelEntity');

/**
 * A pool of Object entity <br>
 * This object is used for object pooling - a technique that might speed up your game
 * if used properly. <br>
 * If some of your classes will be instantiated and removed a lot at a time, it is a
 * good idea to add the class to this entity pool. A separate pool for that class
 * will be created, which will reuse objects of the class. That way they won't be instantiated
 * each time you need a new one (slowing your game), but stored into that pool and taking one
 * already instantiated when you need it.<br><br>
 * This object is also used by the engine to instantiate objects defined in the map,
 * which means, that on level loading the engine will try to instantiate every object
 * found in the map, based on the user defined name in each Object Properties<br>
 * <img src="images/object_properties.png"/><br>
 * There is no constructor function for me.entityPool, this is a static object
 * @namespace me.entityPool
 * @memberOf me
 */

/*---------------------------------------------
 
 PRIVATE STUFF
 
 ---------------------------------------------*/
me.entityPool.entityClass = {};

/*---------------------------------------------
 
 PUBLIC STUFF
 
 ---------------------------------------------*/

/*---
 
 init
 
 ---*/

me.entityPool.init = function() {
    // add default entity object
    me.entityPool.add("me.ObjectEntity", me.ObjectEntity);
    me.entityPool.add("me.CollectableEntity", me.CollectableEntity);
    me.entityPool.add("me.LevelEntity", me.LevelEntity);
};

/**
 * Add an object to the pool. <br>
 * Pooling must be set to true if more than one such objects will be created. <br>
 * (note) If pooling is enabled, you shouldn't instantiate objects with `new`.
 * See examples in {@link me.entityPool#newInstanceOf}
 * @name add
 * @memberOf me.entityPool
 * @public
 * @function
 * @param {String} className as defined in the Name field of the Object Properties (in Tiled)
 * @param {Object} entityObj class corresponding Class to be instantiated
 * @param {Boolean} pooling [objectPooling=false] enables object pooling for the specified class 
 * - speeds up the game by reusing existing objects
 * @example
 * // add our users defined entities in the entity pool
 * me.entityPool.add("playerspawnpoint", PlayerEntity);
 * me.entityPool.add("cherryentity", CherryEntity, true);
 * me.entityPool.add("heartentity", HeartEntity, true);
 * me.entityPool.add("starentity", StarEntity, true);
 */
me.entityPool.add = function(className, entityObj, pooling) {
    if (!pooling) {
        me.entityPool.entityClass[className.toLowerCase()] = {
            "class": entityObj,
            "pool": undefined
        };
        return;
    }

    me.entityPool.entityClass[className.toLowerCase()] = {
        "class": entityObj,
        "pool": [],
        "active": []
    };
};

/**
 * Return a new instance of the requested object (if added into the object pool)
 * @name newInstanceOf
 * @memberOf me.entityPool
 * @public
 * @function
 * @param {String} data className as used in {@link me.entityPool#add}
 * @param {} [arguments...] arguments to be passed when instantiating/reinitializing the object
 * @example
 * me.entityPool.add("player", PlayerEntity);
 * var player = me.entityPool.newInstanceOf("player");
 * @example
 * me.entityPool.add("bullet", BulletEntity, true);
 * me.entityPool.add("enemy", EnemyEntity, true);
 * // ...
 * // when we need to manually create a new bullet:
 * var bullet = me.entityPool.newInstanceOf("bullet", x, y, direction);
 * // ...
 * // params aren't a fixed number
 * // when we need new enemy we can add more params, that the object construct requires:
 * var enemy = me.entityPool.newInstanceOf("enemy", x, y, direction, speed, power, life);
 * // ...
 * // when we want to destroy existing object, the remove 
 * // function will ensure the object can then be reallocated later
 * me.game.remove(enemy);
 * me.game.remove(bullet);
 */

me.entityPool.newInstanceOf = function(data) {
    var name = typeof data === 'string' ? data.toLowerCase() : undefined;
    if (name && me.entityPool.entityClass[name]) {
        var proto;
        if (!me.entityPool.entityClass[name]['pool']) {
            proto = me.entityPool.entityClass[name]["class"];
            arguments[0] = proto;
            return new (proto.bind.apply(proto, arguments))();
        }

        var obj, entity = me.entityPool.entityClass[name];
        proto = entity["class"];
        if (entity["pool"].length > 0) {
            obj = entity["pool"].pop();
            obj.init.apply(obj, Array.prototype.slice.call(arguments, 1));
        } else {
            arguments[0] = proto;
            obj = new (proto.bind.apply(proto, arguments))();
            obj.className = name;
        }

        entity["active"].push(obj);
        return obj;
    }

    // Tile objects can be created with a GID attribute;
    // The TMX parser will use it to create the image property.
    var settings = arguments[3];
    if (settings && settings.gid && settings.image) {
        return new me.SpriteObject(settings.x, settings.y, settings.image);
    }

    if (name) {
        console.error("Cannot instantiate entity of type '" + data + "': Class not found!");
    }
    return null;
};

/**
 * purge the entity pool from any inactive object <br>
 * Object pooling must be enabled for this function to work<br>
 * note: this will trigger the garbage collector
 * @name purge
 * @memberOf me.entityPool
 * @public
 * @function
 */
me.entityPool.purge = function() {
    for (var className in me.entityPool.entityClass) {
        me.entityPool.entityClass[className]["pool"] = [];
    }
};

/**
 * Remove object from the entity pool <br>
 * Object pooling for the object class must be enabled,
 * and object must have been instantiated using {@link me.entityPool#newInstanceOf},
 * otherwise this function won't work
 * @name freeInstance
 * @memberOf me.entityPool
 * @public
 * @function
 * @param {Object} obj instance to be removed 
 */
me.entityPool.freeInstance = function(obj) {

    var name = obj.className;
    if (!name || !me.entityPool.entityClass[name]) {
        return;
    }

    var notFound = true;
    for (var i = 0, len = me.entityPool.entityClass[name]["active"].length; i < len; i++) {
        if (me.entityPool.entityClass[name]["active"][i] === obj) {
            notFound = false;
            me.entityPool.entityClass[name]["active"].splice(i, 1);
            break;
        }
    }

    if (notFound) {
        return;
    }

    me.entityPool.entityClass[name]["pool"].push(obj);
};
