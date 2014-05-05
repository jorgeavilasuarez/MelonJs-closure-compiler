goog.provide('me.game');
goog.require('me.Viewport');
goog.require('me.ObjectContainer');

/**
 * me.game represents your current game, it contains all the objects, tilemap layers,<br>
 * current viewport, collision map, etc...<br>
 * me.game is also responsible for updating (each frame) the object status and draw them<br>
 * @namespace me.game
 * @memberOf me
 */

/*---------------------------------------------
 
 PRIVATE STUFF
 
 ---------------------------------------------*/

// ref to the "system" context
me.game.frameBuffer = null;
// flag to redraw the sprites
me.game.initialized = false;
// to keep track of deferred stuff
me.game.pendingRemove = null;
// to know when we have to refresh the display
me.game.isDirty = true;
/*---------------------------------------------
 
 PUBLIC STUFF
 
 ---------------------------------------------*/
/**
 * a reference to the game viewport.
 * @public
 * @type me.Viewport
 * @name viewport
 * @memberOf me.game
 */
me.game.viewport = null;
/**
 * a reference to the game collision Map
 * @public
 * @type me.TMXLayer
 * @name collisionMap
 * @memberOf me.game
 */
me.game.collisionMap = null;
/**
 * a reference to the game current level
 * @public
 * @type me.TMXTileMap
 * @name currentLevel
 * @memberOf me.game
 */
me.game.currentLevel = null;
/**
 * a reference to the game world <br>
 * a world is a virtual environment containing all the game objects
 * @public
 * @type me.ObjectContainer
 * @name world
 * @memberOf me.game
 */
me.game.world = null;
/**
 * when true, all objects will be added under the root world container <br>
 * when false, a `me.ObjectContainer` object will be created for each corresponding `TMXObjectGroup`
 * default value : true
 * @public
 * @type Boolean
 * @name mergeGroup
 * @memberOf me.game
 */
me.game.mergeGroup = true;
/**
 * The property of should be used when sorting entities <br>
 * value : "x", "y", "z" (default: "z")
 * @public
 * @type String
 * @name sortOn
 * @memberOf me.game
 */
me.game.sortOn = "z";
/**
 * default layer renderer
 * @private
 * @ignore
 * @type me.TMXRenderer
 * @name renderer
 * @memberOf me.game
 */
me.game.renderer = null;
// FIX ME : put this somewhere else
me.game.NO_OBJECT = 0;
/**
 * Default object type constant.<br>
 * See type property of the returned collision vector.
 * @constant
 * @name ENEMY_OBJECT
 * @memberOf me.game
 */
me.game.ENEMY_OBJECT = 1;
/**
 * Default object type constant.<br>
 * See type property of the returned collision vector.
 * @constant
 * @name COLLECTABLE_OBJECT
 * @memberOf me.game
 */
me.game.COLLECTABLE_OBJECT = 2;
/**
 * Default object type constant.<br>
 * See type property of the returned collision vector.
 * @constant
 * @name ACTION_OBJECT
 * @memberOf me.game
 */
me.game.ACTION_OBJECT = 3; // door, etc...
/**
 * Fired when a level is fully loaded and <br>
 * and all entities instantiated. <br>
 * Additionnaly the level id will also be passed
 * to the called function.
 * @public 
 * @name onLevelLoaded
 * @memberOf me.game
 * @example
 * // call myFunction() everytime a level is loaded
 * me.game.onLevelLoaded = this.myFunction.bind(this);
 */
me.game.onLevelLoaded = null;
/**
 * Initialize the game manager
 * @name init
 * @memberOf me.game
 * @private
 * @ignore
 * @function
 * @param {int} [width="full size of the created canvas"] width of the canvas
 * @param {int} [height="full size of the created canvas"] width of the canvas
 * init function.
 */
me.game.init = function(width, height) {
    if (!me.game.initialized) {
// if no parameter specified use the system size
        width = width || me.video.getWidth();
        height = height || me.video.getHeight();
        // create a defaut viewport of the same size
        me.game.viewport = new me.Viewport(0, 0, width, height);
        //the root object of our world is an entity container
        me.game.world = new me.ObjectContainer(0, 0, width, height);
        // give it a name
        me.game.world.name = 'rootContainer';
        // get a ref to the screen buffer
        me.game.frameBuffer = me.video.getSystemContext();
        // publish init notification
        me.event.publish(me.event.GAME_INIT);
        // make display dirty by default
        me.game.isDirty = true;
        // set as initialized
        me.game.initialized = true;
    }
};
/**
 * reset the game Object manager<p>
 * destroy all current objects
 * @name reset
 * @memberOf me.game
 * @public
 * @function
 */
me.game.reset = function() {
// remove all objects
    me.game.removeAll();
    // reset the viewport to zero ?
    if (me.game.viewport) {
        me.game.viewport.reset();
    }

// reset the transform matrix to the normal one
    me.game.frameBuffer.setTransform(1, 0, 0, 1, 0, 0);
    // dummy current level
    me.game.currentLevel = {pos: {x: 0, y: 0}};
};
/**
 * Load a TMX level
 * @name loadTMXLevel
 * @memberOf me.game
 * @private 
 * @function 
 * @param {type} level
 * @returns {undefined}
 */
me.game.loadTMXLevel = function(level) {

// disable auto-sort
    me.game.world.autoSort = false;
    // load our map
    me.game.currentLevel = level;
    // get the collision map
    me.game.collisionMap = me.game.currentLevel.getLayerByName("collision");
    if (!me.game.collisionMap || !me.game.collisionMap.isCollisionMap) {
        console.error("WARNING : no collision map detected");
    }

// add all defined layers
    var layers = me.game.currentLevel.getLayers();
    for (var i = layers.length; i--; ) {
        if (layers[i].visible) {
// only if visible
            me.game.add(layers[i]);
        }
    }

// change the viewport limit
    me.game.viewport.setBounds(Math.max(me.game.currentLevel.width, me.game.viewport.width),
            Math.max(me.game.currentLevel.height, me.game.viewport.height));
    // game world as default container
    var targetContainer = me.game.world;
    // load all ObjectGroup and Object definition
    var objectGroups = me.game.currentLevel.getObjectGroups();
    for (var g = 0; g < objectGroups.length; g++) {

        var group = objectGroups[g];
        if (me.game.mergeGroup === false) {

// create a new container with Infinite size (?)
// note: initial position and size seems to be meaningless in Tiled
// https://github.com/bjorn/tiled/wiki/TMX-Map-Format :
// x: Defaults to 0 and can no longer be changed in Tiled Qt.
// y: Defaults to 0 and can no longer be changed in Tiled Qt.
// width: The width of the object group in tiles. Meaningless.
// height: The height of the object group in tiles. Meaningless.
            targetContainer = new me.ObjectContainer();
            // set additional properties
            targetContainer.name = group.name;
            targetContainer.visible = group.visible;
            targetContainer.z = group.z;
            targetContainer.setOpacity(group.opacity);
            // disable auto-sort
            targetContainer.autoSort = false;
        }

// iterate through the group and add all object into their
// corresponding target Container
        for (var o = 0; o < group.objects.length; o++) {

// TMX Object
            var obj = group.objects[o];
            // create the corresponding entity
            var entity = me.entityPool.newInstanceOf(obj.name, obj.x, obj.y, obj);
            // ignore if the newInstanceOf function does not return a corresponding object
            if (entity) {

// set the entity z order correspondingly to its parent container/group
                entity.z = group.z;
                //set the object visible state based on the group visible state
                entity.visible = (group.visible === true);
                //apply group opacity value to the child objects if group are merged
                if (me.game.mergeGroup === true && entity.isRenderable === true) {
                    entity.setOpacity(entity.getOpacity() * group.opacity);
                    // and to child renderables if any
                    if (entity.renderable !== null) {
                        entity.renderable.setOpacity(entity.renderable.getOpacity() * group.opacity);
                    }
                }
// add the entity into the target container
                targetContainer.addChild(entity);
            }
        }

// if we created a new container
        if (me.game.mergeGroup === false) {

// add our container to the world
            me.game.world.addChild(targetContainer);
            // re-enable auto-sort
            targetContainer.autoSort = true;
        }

    }

// sort everything (recursively)
    me.game.world.sort(true);
    // re-enable auto-sort
    me.game.world.autoSort = true;
    // check if the map has different default (0,0) screen coordinates
    if (me.game.currentLevel.pos.x !== me.game.currentLevel.pos.y) {
// translate the display accordingly
        me.game.frameBuffer.translate(me.game.currentLevel.pos.x, me.game.currentLevel.pos.y);
    }

// fire the callback if defined
    if (me.game.onLevelLoaded) {
        me.game.onLevelLoaded.call(me.game.onLevelLoaded, level.name);
    }
//publish the corresponding message
    me.event.publish(me.event.LEVEL_LOADED, [level.name]);
};
/**
 * Manually add object to the game manager
 * @deprecated @see me.game.world.addChild()
 * @name add
 * @memberOf me.game
 * @param {me.ObjectEntity} object Object to be added
 * @param {int} [zOrder="obj.z"] z index
 * @public
 * @function
 * @example
 * // create a new object
 * var obj = new MyObject(x, y)
 * // add the object and force the z index of the current object
 * me.game.add(obj, this.z);
 */
me.game.add = function(object, zOrder) {
    if (typeof(zOrder) !== 'undefined') {
        object.z = zOrder;
    }
// add the object in the game obj list
    me.game.world.addChild(object);
};
/**
 * returns the list of entities with the specified name<br>
 * as defined in Tiled (Name field of the Object Properties)<br>
 * note : avoid calling this function every frame since
 * it parses the whole object list each time
 * @deprecated use me.game.world.getEntityByProp();
 * @name getEntityByName
 * @memberOf me.game
 * @public
 * @function
 * @param {String} entityName entity name
 * @return {me.ObjectEntity[]} Array of object entities
 */
me.game.getEntityByName = function(entityName) {
    return me.game.world.getEntityByProp("name", entityName);
};
/**
 * return the entity corresponding to the specified GUID<br>
 * note : avoid calling this function every frame since
 * it parses the whole object list each time
 * @deprecated use me.game.world.getEntityByProp();
 * @name getEntityByGUID
 * @memberOf me.game
 * @public
 * @function
 * @param {String} guid entity GUID
 * @return {me.ObjectEntity} Object Entity (or null if not found)
 */
me.game.getEntityByGUID = function(guid) {
    var obj = me.game.world.getEntityByProp("GUID", guid);
    return (obj.length > 0) ? obj[0] : null;
};
/**
 * return the entity corresponding to the property and value<br>
 * note : avoid calling this function every frame since
 * it parses the whole object list each time
 * @deprecated use me.game.world.getEntityByProp();
 * @name getEntityByProp
 * @memberOf me.game
 * @public
 * @function
 * @param {String} prop Property name
 * @param {String} value Value of the property
 * @return {me.ObjectEntity[]} Array of object entities
 */
me.game.getEntityByProp = function(prop, value) {
    return me.game.world.getEntityByProp(prop, value);
};
/**
 * Returns the entity container of the specified Child in the game world
 * @name getEntityContainer
 * @memberOf me.game
 * @function
 * @param {me.ObjectEntity} child
 * @return {me.ObjectContainer}
 */
me.game.getEntityContainer = function(child) {
    return child.ancestor;
};
/**
 * remove the specific object from the world<br>
 * `me.game.remove` will preserve object that defines the `isPersistent` flag
 * `me.game.remove` will remove object at the end of the current frame
 * @name remove
 * @memberOf me.game
 * @public
 * @function
 * @param {me.ObjectEntity} obj Object to be removed
 * @param {Boolean} [force=false] Force immediate deletion.<br>
 * <strong>WARNING</strong>: Not safe to force asynchronously (e.g. onCollision callbacks)
 */
me.game.remove = function(obj, force) {
    if (obj.ancestor) {
// remove the object from the object list
        if (force === true) {
// force immediate object deletion
            obj.ancestor.removeChild(obj);
        } else {
// make it invisible (this is bad...)
            obj.visible = obj.inViewport = false;
            // wait the end of the current loop
            /** @ignore */
            me.game.pendingRemove = (function(obj) {
// safety check in case the
// object was removed meanwhile
                if (typeof obj.ancestor !== 'undefined') {
                    obj.ancestor.removeChild(obj);
                }
                me.game.pendingRemove = null;
            }.defer(obj));
        }
    }
};
/**
 * remove all objects<br>
 * @name removeAll
 * @memberOf me.game
 * @param {Boolean} [force=false] Force immediate deletion.<br>
 * <strong>WARNING</strong>: Not safe to force asynchronously (e.g. onCollision callbacks)
 * @public
 * @function
 */
me.game.removeAll = function() {
//cancel any pending tasks
    if (me.game.pendingRemove) {
        clearTimeout(me.game.pendingRemove);
        me.game.pendingRemove = null;
    }
// destroy all objects in the root container
    me.game.world.destroy();
};
/**
 * Manually trigger the sort all the game objects.</p>
 * Since version 0.9.9, all objects are automatically sorted, <br>
 * except if a container autoSort property is set to false.
 * @deprecated use me.game.world.sort();
 * @name sort
 * @memberOf me.game
 * @public
 * @function
 * @example
 * // change the default sort property
 * me.game.sortOn = "y";
 * // manuallly call me.game.sort with our sorting function
 * me.game.sort();
 */
me.game.sort = function() {
    me.game.world.sort();
};
/**
 * Checks if the specified entity collides with others entities.
 * @deprecated use me.game.world.collide();
 * @name collide
 * @memberOf me.game
 * @public
 * @function
 * @param {me.ObjectEntity} objA Object to be tested for collision
 * @param {Boolean} [multiple=false] check for multiple collision
 * @return {me.Vector2d} collision vector or an array of collision vector (multiple collision){@link me.Rect#collideVsAABB}
 * @example
 * // update player movement
 * this.updateMovement();
 *
 * // check for collision with other objects
 * res = me.game.collide(this);
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
me.game.collide = function(objA, multiple) {
    return me.game.world.collide(objA, multiple);
};
/**
 * Checks if the specified entity collides with others entities of the specified type.
 * @deprecated use me.game.world.collideType();
 * @name collideType
 * @memberOf me.game
 * @public
 * @function
 * @param {me.ObjectEntity} objA Object to be tested for collision
 * @param {String} type Entity type to be tested for collision (null to disable type check)
 * @param {Boolean} [multiple=false] check for multiple collision
 * @return {me.Vector2d} collision vector or an array of collision vector (multiple collision){@link me.Rect#collideVsAABB}
 */
me.game.collideType = function(objA, type, multiple) {
    return me.game.world.collideType(objA, type, multiple);
};
/**
 * force the redraw (not update) of all objects
 * @name repaint
 * @memberOf me.game
 * @public
 * @function
 */
me.game.repaint = function() {
    me.game.isDirty = true;
};
/**
 * update all objects of the game manager
 * @name update
 * @memberOf me.game
 * @private
 * @ignore
 * @function
 */
me.game.update = function() {

// update all objects
    me.game.isDirty = me.game.world.update() || me.game.isDirty;
    // update the camera/viewport
    me.game.isDirty = me.game.viewport.update(me.game.isDirty) || me.game.isDirty;
    return me.game.isDirty;
};
/**
 * draw all existing objects
 * @name draw
 * @memberOf me.game
 * @private
 * @ignore
 * @function
 */
me.game.draw = function() {
    if (me.game.isDirty) {
// cache the viewport rendering position, so that other object
// can access it later (e,g. entityContainer when drawing floating objects)
        me.game.viewport.screenX = me.game.viewport.pos.x + ~~me.game.viewport.offset.x;
        me.game.viewport.screenY = me.game.viewport.pos.y + ~~me.game.viewport.offset.y;
        // save the current context
        me.game.frameBuffer.save();
        // translate by default to screen coordinates
        me.game.frameBuffer.translate(-me.game.viewport.screenX, -me.game.viewport.screenY);
        // substract the map offset to current the current pos
        me.game.viewport.screenX -= me.game.currentLevel.pos.x;
        me.game.viewport.screenY -= me.game.currentLevel.pos.y;
        // update all objects, 
        // specifying the viewport as the rectangle area to redraw

        me.game.world.draw(me.game.frameBuffer, me.game.viewport);
        //restore context
        me.game.frameBuffer.restore();
        // draw our camera/viewport
        me.game.viewport.draw(me.game.frameBuffer);
    }
    me.game.isDirty = false;
};