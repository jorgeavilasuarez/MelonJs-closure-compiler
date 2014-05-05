goog.provide('me.TMXTileset');
goog.require('goog.object');

// bitmask constants to check for flipped & rotated tiles
var FlippedHorizontallyFlag = 0x80000000;
var FlippedVerticallyFlag = 0x40000000;
var FlippedAntiDiagonallyFlag = 0x20000000;

/**
 * a TMX Tile Set Object
 * @class
 * @memberOf me
 * @constructor
 */
me.TMXTileset = function() {
// tile properties (collidable, etc..)
    this.TileProperties = [];
    // a cache for offset value
    this.tileXOffset = [];
    this.tileYOffset = [];
};

goog.inherits(me.TMXTileset, goog.object);

/**
 * tile types
 */
me.TMXTileset.prototype.type = {
    SOLID: "solid",
    PLATFORM: "platform",
    L_SLOPE: "lslope",
    R_SLOPE: "rslope",
    LADDER: "ladder",
    TOPLADDER: "topladder",
    BREAKABLE: "breakable"
};



/**
 * 
 * @param {type} xmltileset
 * @returns {undefined}
 */
me.TMXTileset.prototype.initFromXML = function(xmltileset) {

// first gid
    this.firstgid = me.mapReader.TMXParser.getIntAttribute(xmltileset, me.TMX_TAG_FIRSTGID);
    var src = me.mapReader.TMXParser.getStringAttribute(xmltileset, me.TMX_TAG_SOURCE);
    if (src) {
// load TSX
        src = me.utils.getBasename(src);
        xmltileset = me.loader.getTMX(src);
        if (!xmltileset) {
            throw "melonJS:" + src + " TSX tileset not found";
        }

// FIXME: This is ok for now, but it wipes out the
// XML currently loaded into the global `me.mapReader.TMXParser`
        me.mapReader.TMXParser.parseFromString(xmltileset);
        xmltileset = me.mapReader.TMXParser.getFirstElementByTagName("tileset");
    }

    this.name = me.mapReader.TMXParser.getStringAttribute(xmltileset, me.TMX_TAG_NAME);
    this.tilewidth = me.mapReader.TMXParser.getIntAttribute(xmltileset, me.TMX_TAG_TILEWIDTH);
    this.tileheight = me.mapReader.TMXParser.getIntAttribute(xmltileset, me.TMX_TAG_TILEHEIGHT);
    this.spacing = me.mapReader.TMXParser.getIntAttribute(xmltileset, me.TMX_TAG_SPACING, 0);
    this.margin = me.mapReader.TMXParser.getIntAttribute(xmltileset, me.TMX_TAG_MARGIN, 0);
    // set tile offset properties (if any)
    this.tileoffset = new me.Vector2d(0, 0);
    var offset = xmltileset.getElementsByTagName(me.TMX_TAG_TILEOFFSET);
    if (offset.length > 0) {
        this.tileoffset.x = me.mapReader.TMXParser.getIntAttribute(offset[0], me.TMX_TAG_X);
        this.tileoffset.y = me.mapReader.TMXParser.getIntAttribute(offset[0], me.TMX_TAG_Y);
    }

// set tile properties, if any
    var tileInfo = xmltileset.getElementsByTagName(me.TMX_TAG_TILE);
    for (var i = 0; i < tileInfo.length; i++) {
        var tileID = me.mapReader.TMXParser.getIntAttribute(tileInfo[i], me.TMX_TAG_ID) + this.firstgid;
        // apply tiled defined properties
        var prop = {};
        me.TMXUtils.applyTMXPropertiesFromXML(prop, tileInfo[i]);
        this.setTileProperty(tileID, prop);
    }

// check for the texture corresponding image
    var imagesrc = xmltileset.getElementsByTagName(me.TMX_TAG_IMAGE)[0].getAttribute(me.TMX_TAG_SOURCE);
    var image = (imagesrc) ? me.loader.getImage(me.utils.getBasename(imagesrc)) : null;
    if (!image) {
        console.log("melonJS: '" + imagesrc + "' file for tileset '" + this.name + "' not found!");
    }
// check if transparency is defined for a specific color
    var trans = xmltileset.getElementsByTagName(me.TMX_TAG_IMAGE)[0].getAttribute(me.TMX_TAG_TRANS);
    this.initFromImage(image, trans);
};

/**
 * 
 * @param {type} tileset
 * @returns {undefined}
 */
me.TMXTileset.prototype.initFromJSON = function(tileset) {
// first gid
    this.firstgid = tileset[me.TMX_TAG_FIRSTGID];
    var src = tileset[me.TMX_TAG_SOURCE];
    if (src) {
// load TSX
        src = me.utils.getBasename(src);
        // replace tiletset with a local variable
        tileset = me.loader.getTMX(src);
        if (!tileset) {
            throw "melonJS:" + src + " TSX tileset not found";
        }
// normally tileset shoudld directly contains the required 
//information : UNTESTED as I did not find how to generate a JSON TSX file
    }

    this.name = tileset[me.TMX_TAG_NAME];
    this.tilewidth = parseInt(tileset[me.TMX_TAG_TILEWIDTH], 10);
    this.tileheight = parseInt(tileset[me.TMX_TAG_TILEHEIGHT], 10);
    this.spacing = parseInt(tileset[me.TMX_TAG_SPACING] || 0, 10);
    this.margin = parseInt(tileset[me.TMX_TAG_MARGIN] || 0, 10);
    // set tile offset properties (if any)
    this.tileoffset = new me.Vector2d(0, 0);
    var offset = tileset[me.TMX_TAG_TILEOFFSET];
    if (offset) {
        this.tileoffset.x = parseInt(offset[me.TMX_TAG_X], 10);
        this.tileoffset.y = parseInt(offset[me.TMX_TAG_Y], 10);
    }

    var tileInfo = tileset["tileproperties"];
    // set tile properties, if any
    for (var i in tileInfo) {
        var prop = {};
        me.TMXUtils.mergeProperties(prop, tileInfo[i]);
        this.setTileProperty(parseInt(i, 10) + this.firstgid, prop);
    }

// check for the texture corresponding image
    var imagesrc = me.utils.getBasename(tileset[me.TMX_TAG_IMAGE]);
    var image = imagesrc ? me.loader.getImage(imagesrc) : null;
    if (!image) {
        console.log("melonJS: '" + imagesrc + "' file for tileset '" + this.name + "' not found!");
    }
// check if transparency is defined for a specific color
    var trans = tileset[me.TMX_TAG_TRANS] || null;
    this.initFromImage(image, trans);
};

/**
 * 
 * @param {type} image
 * @param {type} transparency
 * @returns {undefined}
 */
me.TMXTileset.prototype.initFromImage = function(image, transparency) {
    if (image) {
        this.image = image;
        // number of tiles per horizontal line 
        this.hTileCount = ~~((this.image.width - this.margin) / (this.tilewidth + this.spacing));
        this.vTileCount = ~~((this.image.height - this.margin) / (this.tileheight + this.spacing));
    }

// compute the last gid value in the tileset
    this.lastgid = this.firstgid + (((this.hTileCount * this.vTileCount) - 1) || 0);
    // set Color Key for transparency if needed
    if (transparency !== null && this.image) {
// applyRGB Filter (return a context object)
        this.image = me.video.applyRGBFilter(this.image, "transparent", transparency.toUpperCase()).canvas;
    }

};

/**
 * set the tile properties 
 * @function 
 * @param {type} gid
 * @param {type} prop
 * @returns {undefined}
 */
me.TMXTileset.prototype.setTileProperty = function(gid, prop) {
// check what we found and adjust property
    prop.isSolid = prop.type ? prop.type.toLowerCase() === this.type.SOLID : false;
    prop.isPlatform = prop.type ? prop.type.toLowerCase() === this.type.PLATFORM : false;
    prop.isLeftSlope = prop.type ? prop.type.toLowerCase() === this.type.L_SLOPE : false;
    prop.isRightSlope = prop.type ? prop.type.toLowerCase() === this.type.R_SLOPE : false;
    prop.isBreakable = prop.type ? prop.type.toLowerCase() === this.type.BREAKABLE : false;
    prop.isLadder = prop.type ? prop.type.toLowerCase() === this.type.LADDER : false;
    prop.isTopLadder = prop.type ? prop.type.toLowerCase() === this.type.TOPLADDER : false;
    prop.isSlope = prop.isLeftSlope || prop.isRightSlope;
    // ensure the collidable flag is correct
    prop.isCollidable = !!(prop.type);
    // set the given tile id 
    this.TileProperties[gid] = prop;
};

/**
 * return true if the gid belongs to the tileset
 * @name me.TMXTileset#contains
 * @public
 * @function
 * @param {Integer} gid 
 * @return {boolean}
 */
me.TMXTileset.prototype.contains = function(gid) {
    return gid >= this.firstgid && gid <= this.lastgid;
};

/**
 *return an Image Object with the specified tile 
 * @param {type} tmxTile
 * @returns {@exp;_context@pro;canvas}
 */
me.TMXTileset.prototype.getTileImage = function(tmxTile) {
// create a new image object
    var _context = me.video.getContext2d(
            me.video.createCanvas(this.tilewidth, this.tileheight)
            );
    this.drawTile(_context, 0, 0, tmxTile);
    return _context.canvas;
};

/**
 * return the properties of the specified tile <br>
 * the function will return an object with the following boolean value :<br>
 * - isCollidable<br>
 * - isSolid<br>
 * - isPlatform<br>
 * - isSlope <br>
 * - isLeftSlope<br>
 * - isRightSlope<br>
 * - isLadder<br>
 * - isBreakable<br>
 * @name me.TMXTileset#getTileProperties
 * @public
 * @function
 * @param {Integer} tileId 
 * @return {Object}
 */
me.TMXTileset.prototype.getTileProperties = function(tileId) {
    return this.TileProperties[tileId];
};

/**
 * return collidable status of the specifiled tile
 * @param {type} tileId
 * @returns {unresolved}
 */
me.TMXTileset.prototype.isTileCollidable = function(tileId) {
    return this.TileProperties[tileId].isCollidable;
};

/**
 * return the x offset of the specified tile in the tileset image 
 * @param {type} tileId
 * @returns {unresolved}
 */
me.TMXTileset.prototype.getTileOffsetX = function(tileId) {
    var offset = this.tileXOffset[tileId];
    if (typeof(offset) === 'undefined') {
        offset = this.tileXOffset[tileId] = this.margin + (this.spacing + this.tilewidth) * (tileId % this.hTileCount);
    }
    return offset;
};

/**
 * return the y offset of the specified tile in the tileset image 
 * @param {type} tileId
 * @returns {unresolved}
 */
me.TMXTileset.prototype.getTileOffsetY = function(tileId) {
    var offset = this.tileYOffset[tileId];
    if (typeof(offset) === 'undefined') {
        offset = this.tileYOffset[tileId] = this.margin + (this.spacing + this.tileheight) * ~~(tileId / this.hTileCount);
    }
    return offset;
};

/**
 * draw the x,y tile
 * @param {type} context
 * @param {type} dx
 * @param {type} dy
 * @param {type} tmxTile
 * @returns {undefined}
 */
me.TMXTileset.prototype.drawTile = function(context, dx, dy, tmxTile) {
// check if any transformation is required
    if (tmxTile.flipped) {
        var m11 = 1; // Horizontal scaling factor
        var m12 = 0; // Vertical shearing factor
        var m21 = 0; // Horizontal shearing factor
        var m22 = 1; // Vertical scaling factor
        var mx = dx;
        var my = dy;
        // set initial value to zero since we use a transform matrix
        dx = dy = 0;
        context.save();
        if (tmxTile.flipAD) {
// Use shearing to swap the X/Y axis
            m11 = 0;
            m12 = 1;
            m21 = 1;
            m22 = 0;
            // Compensate for the swap of image dimensions
            my += this.tileheight - this.tilewidth;
        }
        if (tmxTile.flipX) {
            m11 = -m11;
            m21 = -m21;
            mx += tmxTile.flipAD ? this.tileheight : this.tilewidth;
        }
        if (tmxTile.flipY) {
            m12 = -m12;
            m22 = -m22;
            my += tmxTile.flipAD ? this.tilewidth : this.tileheight;
        }
// set the transform matrix
        context.transform(m11, m12, m21, m22, mx, my);
    }

// get the local tileset id
    var tileid = tmxTile.tileId - this.firstgid;
    // draw the tile
    context.drawImage(this.image,
            this.getTileOffsetX(tileid), this.getTileOffsetY(tileid),
            this.tilewidth, this.tileheight,
            dx, dy,
            this.tilewidth, this.tileheight);
    if (tmxTile.flipped) {
// restore the context to the previous state
        context.restore();
    }
};