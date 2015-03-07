goog.provide('me.TMXLayer');
goog.require('me.Renderable');
goog.require('me.Tile');
goog.require('me.debug');



/**
 * a TMX Tile Layer Object
 * Tiled QT 0.7.x format
 * @class
 * @memberOf me
 * @constructor
 * @param {number} tilewidth width of each tile in pixels
 * @param {number} tileheight height of each tile in pixels
 * @param {string} orientation "isometric" or "orthogonal"
 * @param {me.TMXTilesetGroup} tilesets tileset as defined in Tiled
 * @param {number} zOrder layer z-order
 */
me.TMXLayer = function(tilewidth, tileheight, orientation, tilesets, zOrder) {
// parent constructor
    goog.base(this, new me.Vector2d(0, 0), 0, 0);
    // tile width & height
    this.tilewidth = tilewidth;
    this.tileheight = tileheight;
    // layer orientation
    this.orientation = orientation;
    /**
     * The Layer corresponding Tilesets
     * @public
     * @type me.TMXTilesetGroup
     * @name me.TMXLayer#tilesets
     */

    this.tilesets = tilesets;
    // the default tileset
    this.tileset = this.tilesets ? this.tilesets.getTilesetByIndex(0) : null;
    // for displaying order
    this.z = zOrder;
};
goog.inherits(me.TMXLayer, me.Renderable);

// the layer data array
me.TMXLayer.prototype.layerData = null;
/**
 * 
 * @param {Object} layer
 * @returns {undefined}
 */
me.TMXLayer.prototype.initFromXML = function(layer) {

// additional TMX flags
    this.name = me.mapReader.TMXParser.getStringAttribute(layer, me.TMX_TAG_NAME);
    this.visible = (me.mapReader.TMXParser.getIntAttribute(layer, me.TMX_TAG_VISIBLE, 1) === 1);
    this.cols = me.mapReader.TMXParser.getIntAttribute(layer, me.TMX_TAG_WIDTH);
    this.rows = me.mapReader.TMXParser.getIntAttribute(layer, me.TMX_TAG_HEIGHT);
    // layer opacity
    this.setOpacity(me.mapReader.TMXParser.getFloatAttribute(layer, me.TMX_TAG_OPACITY, 1.0));
    // layer "real" size
    this.width = this.cols * this.tilewidth;
    this.height = this.rows * this.tileheight;
    // check if we have any user-defined properties 
    me.TMXUtils.applyTMXPropertiesFromXML(this, layer);
    // check for the correct rendering method
    if (typeof (this.preRender) === 'undefined') {
        this.preRender = me.sys.preRender;
    }

// detect if the layer is a collision map
    this.isCollisionMap = (this.name.toLowerCase().contains(me.COLLISION_LAYER));
    if (this.isCollisionMap && !me.debug.renderCollisionMap) {
// force the layer as invisible
        this.visible = false;
    }


// if pre-rendering method is use, create the offline canvas
    if (this.preRender === true) {
        this.layerCanvas = me.video.createCanvas(this.cols * this.tilewidth, this.rows * this.tileheight);
        this.layerSurface = me.video.getContext2d(this.layerCanvas);
    }

};

/**
 * 
 * @param {Object} layer
 * @returns {undefined}
 */
me.TMXLayer.prototype.initFromJSON = function(layer) {
// additional TMX flags
    this.name = layer[me.TMX_TAG_NAME];
    this.visible = layer[me.TMX_TAG_VISIBLE];
    this.cols = parseInt(layer[me.TMX_TAG_WIDTH], 10);
    this.rows = parseInt(layer[me.TMX_TAG_HEIGHT], 10);
    // layer opacity
    this.setOpacity(parseFloat(layer[me.TMX_TAG_OPACITY]));
    // layer "real" size
    this.width = this.cols * this.tilewidth;
    this.height = this.rows * this.tileheight;
    // check if we have any user-defined properties 
    me.TMXUtils.applyTMXPropertiesFromJSON(this, layer);
    // check for the correct rendering method
    if (typeof (this.preRender) === 'undefined') {
        this.preRender = me.sys.preRender;
    }

// detect if the layer is a collision map
    this.isCollisionMap = (this.name.toLowerCase().contains(me.COLLISION_LAYER));
    if (this.isCollisionMap && !me.debug.renderCollisionMap) {
// force the layer as invisible
        this.visible = false;
    }

// if pre-rendering method is use, create the offline canvas
    if (this.preRender === true) {
        this.layerCanvas = me.video.createCanvas(this.cols * this.tilewidth, this.rows * this.tileheight);
        this.layerSurface = me.video.getContext2d(this.layerCanvas);
    }

};

/**
 * reset function
 * @ignore
 * @function
 */
me.TMXLayer.prototype.reset = function() {
// clear all allocated objects
    if (this.preRender) {
        this.layerCanvas = null;
        this.layerSurface = null;
    }
    this.renderer = null;
    // clear all allocated objects
    this.layerData = null;
    this.tileset = null;
    this.tilesets = null;
};

/**
 * set the layer renderer 
 * @param {Object} renderer
 * @returns {undefined}
 */
me.TMXLayer.prototype.setRenderer = function(renderer) {
    this.renderer = renderer;
};

/**
 * Create all required arrays 
 * @param {Object} w
 * @param {Object} h
 * @returns {undefined}
 */
me.TMXLayer.prototype.initArray = function(w, h) {
// initialize the array
    this.layerData = [];
    for (var x = 0; x < w; x++) {
        this.layerData[x] = [];
        for (var y = 0; y < h; y++) {
            this.layerData[x][y] = null;
        }
    }
};

/**
 * Return the TileId of the Tile at the specified position
 * @name getTileId
 * @memberOf me.TMXLayer
 * @public
 * @function
 * @param {Integer} x x coordinate in pixel 
 * @param {Integer} y y coordinate in pixel
 * @return {Int} TileId
 */
me.TMXLayer.prototype.getTileId = function(x, y) {
    var tile = this.getTile(x, y);
    return tile ? tile.tileId : null;
};

/**
 * Return the Tile object at the specified position
 * @name getTile
 * @memberOf me.TMXLayer
 * @public
 * @function
 * @param {Integer} x x coordinate in pixel 
 * @param {Integer} y y coordinate in pixel
 * @return {me.Tile} Tile Object
 */
me.TMXLayer.prototype.getTile = function(x, y) {
    return this.layerData[~~(x / this.tilewidth)][~~(y / this.tileheight)];
};

/**
 * Create a new Tile at the specified position
 * @name setTile
 * @memberOf me.TMXLayer
 * @public
 * @function
 * @param {Integer} x x coordinate in tile 
 * @param {Integer} y y coordinate in tile
 * @param {Integer} tileId tileId
 * @return {me.Tile} the corresponding newly created tile object
 */
me.TMXLayer.prototype.setTile = function(x, y, tileId) {
    var tile = new me.Tile(x, y, this.tilewidth, this.tileheight, tileId);
    if (!this.tileset.contains(tile.tileId)) {
        tile.tileset = this.tileset = this.tilesets.getTilesetByGid(tile.tileId);
    } else {
        tile.tileset = this.tileset;
    }
    this.layerData[x][y] = tile;
    return tile;
};

/**
 * clear the tile at the specified position
 * @name clearTile
 * @memberOf me.TMXLayer
 * @public
 * @function
 * @param {Integer} x x position 
 * @param {Integer} y y position 
 */
me.TMXLayer.prototype.clearTile = function(x, y) {
// clearing tile
    this.layerData[x][y] = null;
    // erase the corresponding area in the canvas
    if (this.visible && this.preRender) {
        this.layerSurface.clearRect(x * this.tilewidth, y * this.tileheight, this.tilewidth, this.tileheight);
    }
};

/**
 * check for collision
 * obj - obj
 * pv   - projection vector
 * res : result collision object 
 * @param {Object} obj
 * @param {Object} pv
 * @returns {me.TMXLayer.prototype.checkCollision.res}
 */
me.TMXLayer.prototype.checkCollision = function(obj, pv) {

    var x = (pv.x < 0) ? ~~(obj.left + pv.x) : Math.ceil(obj.right - 1 + pv.x);
    var y = (pv.y < 0) ? ~~(obj.top + pv.y) : Math.ceil(obj.bottom - 1 + pv.y);
    //to return tile collision detection
    var res = {
        x: 0, // !=0 if collision on x axis
        xtile: undefined,
        xprop: {},
        y: 0, // !=0 if collision on y axis
        ytile: undefined,
        yprop: {}
    };
    //var tile;
    if (x <= 0 || x >= this.width) {
        res.x = pv.x;
    } else if (pv.x !== 0) {
// x, bottom corner
        res.xtile = this.getTile(x, Math.ceil(obj.bottom - 1));
        if (res.xtile && this.tileset.isTileCollidable(res.xtile.tileId)) {
            res.x = pv.x; // reuse pv.x to get a 
            res.xprop = this.tileset.getTileProperties(res.xtile.tileId);
        } else {
// x, top corner
            res.xtile = this.getTile(x, ~~obj.top);
            if (res.xtile && this.tileset.isTileCollidable(res.xtile.tileId)) {
                res.x = pv.x;
                res.xprop = this.tileset.getTileProperties(res.xtile.tileId);
            }
        }
    }

// check for y movement
// left, y corner
    res.ytile = this.getTile((pv.x < 0) ? ~~obj.left : Math.ceil(obj.right - 1), y);
    if (res.ytile && this.tileset.isTileCollidable(res.ytile.tileId)) {
        res.y = pv.y || 1;
        res.yprop = this.tileset.getTileProperties(res.ytile.tileId);
    } else { // right, y corner
        res.ytile = this.getTile((pv.x < 0) ? Math.ceil(obj.right - 1) : ~~obj.left, y);
        if (res.ytile && this.tileset.isTileCollidable(res.ytile.tileId)) {
            res.y = pv.y || 1;
            res.yprop = this.tileset.getTileProperties(res.ytile.tileId);
        }
    }
// return the collide object
    return res;
};

/**
 * a dummy update function
 * @ignore
 */
me.TMXLayer.prototype.update = function() {
    return false;
};

/**
 * draw a tileset layer 
 * @param {Object} context
 * @param {Object} rect
 * @returns {undefined}
 */
me.TMXLayer.prototype.draw = function(context, rect) {

// use the offscreen canvas
    if (this.preRender) {

        var width = Math.min(rect.width, this.width);
        var height = Math.min(rect.height, this.height);
        this.layerSurface.globalAlpha = context.globalAlpha * this.getOpacity();
        // draw using the cached canvas
        context.drawImage(this.layerCanvas,
                rect.pos.x, //sx
                rect.pos.y, //sy
                width, height, //sw, sh
                rect.pos.x, //dx
                rect.pos.y, //dy
                width, height); //dw, dh
    }
// dynamically render the layer
    else {
// set the layer alpha value
        var _alpha = context.globalAlpha;
        context.globalAlpha *= this.getOpacity();
        // draw the layer
        this.renderer.drawTileLayer(context, this, rect);
        // restore context to initial state
        context.globalAlpha = _alpha;
    }
};