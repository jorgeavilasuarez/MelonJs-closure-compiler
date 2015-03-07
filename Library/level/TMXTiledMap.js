goog.provide('me.TMXTileMap');
goog.require('me.Renderable');

/**
 * a TMX Tile Map Object
 * Tiled QT 0.7.x format
 * @class
 * @memberOf me
 * @constructor
 * @param {string} levelId name of TMX map
 */
me.TMXTileMap = function(levelId) {

// map id
    this.levelId = levelId;
    // map default z order
    this.z = 0;
    /**
     * name of the tilemap
     * @public
     * @type String
     * @name me.TMXTileMap#name
     */
    this.name = null;
    /**
     * width of the tilemap in tiles
     * @public
     * @type Int
     * @name me.TMXTileMap#cols
     */
    this.cols = 0;
    /**
     * height of the tilemap in tiles
     * @public
     * @type Int
     * @name me.TMXTileMap#rows
     */
    this.rows = 0;
    /**
     * Tile width
     * @public
     * @type Int
     * @name me.TMXTileMap#tilewidth
     */
    this.tilewidth = 0;
    /**
     * Tile height
     * @public
     * @type Int
     * @name me.TMXTileMap#tileheight
     */
    this.tileheight = 0;
    // corresponding tileset for this map
    this.tilesets = null;
    // map layers
    this.mapLayers = [];
    // map Object
    this.objectGroups = [];
    // loading flag
    this.initialized = false;
    // tilemap version
    this.version = "";
    // map type (only orthogonal format supported)
    this.orientation = "";
    // tileset(s)
    this.tilesets = null;
    //this.parent(new me.Vector2d(), 0, 0);
    goog.base(this, new me.Vector2d(), 0, 0);
};

goog.inherits(me.TMXTileMap, me.Renderable);

/**
 * a dummy update function
 * @ignore
 */
me.TMXTileMap.prototype.reset = function() {
    if (this.initialized === true) {
        var i;
        // reset/clear all layers
        for (i = this.mapLayers.length; i--; ) {
            this.mapLayers[i].reset();
            this.mapLayers[i] = null;
        }
// reset object groups
        for (i = this.objectGroups.length; i--; ) {
            this.objectGroups[i].reset();
            this.objectGroups[i] = null;
        }
// call parent reset function
        this.tilesets = null;
        this.mapLayers.length = 0;
        this.objectGroups.length = 0;
        this.pos.set(0, 0);
        // set back as not initialized
        this.initialized = false;
    }
};

/**
 * return the corresponding object group definition
 * @name me.TMXTileMap#getObjectGroupByName
 * @param {Object} name
 * @public
 * @function
 * @return {me.TMXObjectGroup} group 
 *
 */
me.TMXTileMap.prototype.getObjectGroupByName = function(name) {
    var objectGroup = null;
    // normalize name
    name = name.trim().toLowerCase();
    for (var i = this.objectGroups.length; i--; ) {
        if (this.objectGroups[i].name.toLowerCase().contains(name)) {
            objectGroup = this.objectGroups[i];
            break;
        }
    }
    return objectGroup;
};

/**
 * return all the existing object group definition
 * @name me.TMXTileMap#getObjectGroups
 * @public
 * @function
 * @return {Array.<me.TMXObjectGroup>} Array of Groups
 */
me.TMXTileMap.prototype.getObjectGroups = function() {
    return this.objectGroups;
};

/**
 * return all the existing layers
 * @name me.TMXTileMap#getLayers
 * @public
 * @function
 * @return {Array.<me.TMXLayer>} Array of Layers
 */
me.TMXTileMap.prototype.getLayers = function() {
    return this.mapLayers;
};

/**
 * return the specified layer object
 * @name me.TMXTileMap#getLayerByName
 * @public
 * @function
 * @param {string} name Layer Name 
 * @return {me.TMXLayer} Layer Object
 */
me.TMXTileMap.prototype.getLayerByName = function(name) {
    var layer = null;
    // normalize name
    name = name.trim().toLowerCase();
    for (var i = this.mapLayers.length; i--; ) {
        if (this.mapLayers[i].name.toLowerCase().contains(name)) {
            layer = this.mapLayers[i];
            break;
        }
    }

// return a fake collision layer if not found
    if ((name.toLowerCase().contains(me.COLLISION_LAYER)) && (layer == null)) {
        layer = new me.CollisionTiledLayer(
                me.game.currentLevel.width,
                me.game.currentLevel.height
                );
    }

    return layer;
};

/**
 * clear the tile at the specified position from all layers
 * @name me.TMXTileMap#clearTile
 * @public
 * @function
 * @param {Integer} x x position 
 * @param {Integer} y y position 
 */
me.TMXTileMap.prototype.clearTile = function(x, y) {
// add all layers
    for (var i = this.mapLayers.length; i--; ) {
// that are visible
        if (this.mapLayers[i] instanceof me.TMXLayer) {
            this.mapLayers[i].clearTile(x, y);
        }
    }
};