goog.provide('me.Tile');
goog.require('me.Rect');

/**
 * a basic tile object
 * @class
 * @extends me.Rect
 * @memberOf me
 * @constructor
 * @param {int} x x index of the Tile in the map
 * @param {int} y y index of the Tile in the map
 * @param {int} w Tile width
 * @param {int} h Tile height
 * @param {int} gid tileId
 */
me.Tile = function(x, y, w, h, gid) {
    goog.base(this, new me.Vector2d(x * w, y * h), w, h);

    // Tile col / row pos
    this.col = x;
    this.row = y;

    this.tileId = gid;

    /**
     * True if the tile is flipped horizontally<br>
     * @public
     * @type Boolean
     * @name me.Tile#flipX
     */
    this.flipX = (this.tileId & FlippedHorizontallyFlag) !== 0;

    /**
     * True if the tile is flipped vertically<br>
     * @public
     * @type Boolean
     * @name me.Tile#flipY
     */
    this.flipY = (this.tileId & FlippedVerticallyFlag) !== 0;

    /**
     * True if the tile is flipped anti-diagonally<br>
     * @public
     * @type Boolean
     * @name me.Tile#flipAD
     */
    this.flipAD = (this.tileId & FlippedAntiDiagonallyFlag) !== 0;

    /**
     * Global flag that indicates if the tile is flipped<br>
     * @public
     * @type Boolean
     * @name me.Tile#flipped
     */
    this.flipped = this.flipX || this.flipY || this.flipAD;

    // clear out the flags and set the tileId
    this.tileId &= ~(FlippedHorizontallyFlag | FlippedVerticallyFlag | FlippedAntiDiagonallyFlag);

};
goog.inherits(me.Tile, me.Rect);
/**
 * tileId
 * @public
 * @type int
 * @name me.Tile#tileId
 */
me.Tile.tileId = null;

/**
 * tileset
 * @public
 * @type me.TMXTileset
 * @name me.Tile#tileset
 */
me.Tile.tileset = null;


