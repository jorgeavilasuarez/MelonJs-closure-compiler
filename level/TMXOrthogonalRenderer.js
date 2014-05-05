goog.provide('me.TMXOrthogonalRenderer');
goog.require('goog.object');

/**
 * an Orthogonal Map Renderder
 * Tiled QT 0.7.x format
 * @memberOf me 
 * @constructor 
 * @param {type} cols
 * @param {type} rows
 * @param {type} tilewidth
 * @param {type} tileheight 
 */
me.TMXOrthogonalRenderer = function(cols, rows, tilewidth, tileheight) {
    this.cols = cols;
    this.rows = rows;
    this.tilewidth = tilewidth;
    this.tileheight = tileheight;
};

goog.inherits(me.TMXOrthogonalRenderer, goog.object);
/** 
 * return true if the renderer can render the specified layer 
 * @param {type} layer
 * @returns {unresolved}
 */
me.TMXOrthogonalRenderer.prototype.canRender = function(layer) {
    return ((layer.orientation === 'orthogonal') &&
            (this.cols === layer.cols) &&
            (this.rows === layer.rows) &&
            (this.tilewidth === layer.tilewidth) &&
            (this.tileheight === layer.tileheight));
};

/** 
 * return the tile position corresponding to the specified pixel 
 * @param {type} x
 * @param {type} y
 * @returns {@exp;me@call;Vector2d}
 */
me.TMXOrthogonalRenderer.prototype.pixelToTileCoords = function(x, y) {
    return new me.Vector2d(x / this.tilewidth,
            y / this.tileheight);
};

/**
 * return the pixel position corresponding of the specified tile 
 * @param {type} x
 * @param {type} y
 * @returns {@exp;me@call;Vector2d} 
 * */
me.TMXOrthogonalRenderer.prototype.tileToPixelCoords = function(x, y) {
    return new me.Vector2d(x * this.tilewidth,
            y * this.tileheight);
};

/**
 * fix the position of Objects to match
 * the way Tiled places them 
 * @param {type} obj
 * @returns {undefined}
 */
me.TMXOrthogonalRenderer.prototype.adjustPosition = function(obj) {
// only adjust position if obj.gid is defined
    if (typeof(obj.gid) === 'number') {
// Tiled objects origin point is "bottom-left" in Tiled, 
// "top-left" in melonJS)
        obj.y -= obj.height;
    }
};

/**
 * draw the tile map 
 * @param {type} context
 * @param {type} x
 * @param {type} y
 * @param {type} tmxTile
 * @param {type} tileset 
 */
me.TMXOrthogonalRenderer.prototype.drawTile = function(context, x, y, tmxTile, tileset) {
// draw the tile
    tileset.drawTile(context,
            tileset.tileoffset.x + x * this.tilewidth,
            tileset.tileoffset.y + (y + 1) * this.tileheight - tileset.tileheight,
            tmxTile);
};

/**
 * draw the tile map 
 * @param {type} context
 * @param {type} layer
 * @param {type} rect
 * @returns {undefined}
 */
me.TMXOrthogonalRenderer.prototype.drawTileLayer = function(context, layer, rect) {
// get top-left and bottom-right tile position
    var start = this.pixelToTileCoords(rect.pos.x,
            rect.pos.y).floorSelf();
    var end = this.pixelToTileCoords(rect.pos.x + rect.width + this.tilewidth,
            rect.pos.y + rect.height + this.tileheight).ceilSelf();
    //ensure we are in the valid tile range
    end.x = end.x > this.cols ? this.cols : end.x;
    end.y = end.y > this.rows ? this.rows : end.y;
    // main drawing loop			
    for (var y = start.y; y < end.y; y++) {
        for (var x = start.x; x < end.x; x++) {
            var tmxTile = layer.layerData[x][y];
            if (tmxTile) {
                this.drawTile(context, x, y, tmxTile, tmxTile.tileset);
            }
        }
    }


};