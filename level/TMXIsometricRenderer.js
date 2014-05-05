goog.provide('me.TMXIsometricRenderer');
goog.require('goog.object');

/**
 * an Isometric Map Renderder
 * Tiled QT 0.7.x format
 * @memberOf me 
 * @constructor 
 * @param {type} cols
 * @param {type} rows
 * @param {type} tilewidth
 * @param {type} tileheight
 * @returns {undefined}
 */
me.TMXIsometricRenderer = function(cols, rows, tilewidth, tileheight) {
    this.cols = cols;
    this.rows = rows;
    this.tilewidth = tilewidth;
    this.tileheight = tileheight;
    this.hTilewidth = tilewidth / 2;
    this.hTileheight = tileheight / 2;
    this.originX = this.rows * this.hTilewidth;
};
goog.inherits(me.TMXIsometricRenderer, goog.object);

/** 
 * return true if the renderer can render the specified layer
 * @param {type} layer
 * @returns {unresolved}
 *  */
me.TMXIsometricRenderer.prototype.canRender = function(layer) {
    return ((layer.orientation === 'isometric') &&
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
me.TMXIsometricRenderer.prototype.pixelToTileCoords = function(x, y) {
    x -= this.originX;
    var tileY = y / this.tileheight;
    var tileX = x / this.tilewidth;
    return new me.Vector2d(tileY + tileX, tileY - tileX);
};

/**
 * return the pixel position corresponding of the specified tile 
 * @param {type} x
 * @param {type} y
 * @returns {@exp;me@call;Vector2d}
 */
me.TMXIsometricRenderer.prototype.tileToPixelCoords = function(x, y) {
    return new me.Vector2d((x - y) * this.hTilewidth + this.originX,
            (x + y) * this.hTileheight);
};

/**
 * fix the position of Objects to match
 * the way Tiled places them 
 * @param {type} obj
 * @returns {undefined}
 */
me.TMXIsometricRenderer.prototype.adjustPosition = function(obj) {
    var tilex = obj.x / this.hTilewidth;
    var tiley = obj.y / this.tileheight;
    var isoPos = this.tileToPixelCoords(tilex, tiley);
    isoPos.x -= obj.width / 2;
    isoPos.y -= obj.height;
    obj.x = isoPos.x;
    obj.y = isoPos.y;
    //return isoPos;
};

/**
 * draw the tile map 
 * @param {type} context
 * @param {type} x
 * @param {type} y
 * @param {type} tmxTile
 * @param {type} tileset
 * @returns {undefined}
 */
me.TMXIsometricRenderer.prototype.drawTile = function(context, x, y, tmxTile, tileset) {
// draw the tile
    tileset.drawTile(context,
            ((this.cols - 1) * tileset.tilewidth + (x - y) * tileset.tilewidth >> 1),
            (-tileset.tilewidth + (x + y) * tileset.tileheight >> 2),
            tmxTile);
};

/**
 * draw the tile map 
 * @param {type} context
 * @param {type} layer
 * @param {type} rect
 * @returns {undefined}
 */
me.TMXIsometricRenderer.prototype.drawTileLayer = function(context, layer, rect) {

// cache a couple of useful references
    var tileset = layer.tileset;
    var offset = tileset.tileoffset;
    // get top-left and bottom-right tile position
    var rowItr = this.pixelToTileCoords(rect.pos.x - tileset.tilewidth,
            rect.pos.y - tileset.tileheight).floorSelf();
    var TileEnd = this.pixelToTileCoords(rect.pos.x + rect.width + tileset.tilewidth,
            rect.pos.y + rect.height + tileset.tileheight).ceilSelf();
    var rectEnd = this.tileToPixelCoords(TileEnd.x, TileEnd.y);
    // Determine the tile and pixel coordinates to start at
    var startPos = this.tileToPixelCoords(rowItr.x, rowItr.y);
    startPos.x -= this.hTilewidth;
    startPos.y += this.tileheight;
    /* Determine in which half of the tile the top-left corner of the area we
     * need to draw is. If we're in the upper half, we need to start one row
     * up due to those tiles being visible as well. How we go up one row
     * depends on whether we're in the left or right half of the tile.
     */
    var inUpperHalf = startPos.y - rect.pos.y > this.hTileheight;
    var inLeftHalf = rect.pos.x - startPos.x < this.hTilewidth;
    if (inUpperHalf) {
        if (inLeftHalf) {
            rowItr.x--;
            startPos.x -= this.hTilewidth;
        } else {
            rowItr.y--;
            startPos.x += this.hTilewidth;
        }
        startPos.y -= this.hTileheight;
    }


// Determine whether the current row is shifted half a tile to the right
    var shifted = inUpperHalf ^ inLeftHalf;
    // initialize the columItr vector
    var columnItr = rowItr.clone();
    // main drawing loop			
    for (var y = startPos.y; y - this.tileheight < rectEnd.y; y += this.hTileheight) {
        columnItr.setV(rowItr);
        for (var x = startPos.x; x < rectEnd.x; x += this.tilewidth) {
//check if it's valid tile, if so render
            if ((columnItr.x >= 0) && (columnItr.y >= 0) && (columnItr.x < this.cols) && (columnItr.y < this.rows))
            {
                var tmxTile = layer.layerData[columnItr.x][columnItr.y];
                if (tmxTile) {
                    tileset = tmxTile.tileset;
                    // offset could be different per tileset
                    offset = tileset.tileoffset;
                    // draw our tile
                    tileset.drawTile(context, offset.x + x, offset.y + y - tileset.tileheight, tmxTile);
                }
            }
// Advance to the next column
            columnItr.x++;
            columnItr.y--;
        }

// Advance to the next row
        if (!shifted) {
            rowItr.x++;
            startPos.x += this.hTilewidth;
            shifted = true;
        } else {
            rowItr.y++;
            startPos.x -= this.hTilewidth;
            shifted = false;
        }
    }
};