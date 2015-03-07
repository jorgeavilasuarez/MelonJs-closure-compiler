goog.provide('me.TMXObject');

me.TMXObject = function() {

};

/**
 * object name
 * @public
 * @type String
 * @name name
 * @memberOf me.TMXObject
 */
me.TMXObject.prototype.name = null;
/**
 * object x position
 * @public
 * @type Number
 * @name x
 * @memberOf me.TMXObject
 */
me.TMXObject.prototype.x = 0;
/**
 * object y position
 * @public
 * @type Number
 * @name y
 * @memberOf me.TMXObject
 */
me.TMXObject.prototype.y = 0;
/**
 * object width
 * @public
 * @type Number
 * @name width
 * @memberOf me.TMXObject
 */
me.TMXObject.prototype.width = 0;
/**
 * object height
 * @public
 * @type Number
 * @name height
 * @memberOf me.TMXObject
 */
me.TMXObject.prototype.height = 0;
/**
 * object z order
 * @public
 * @type Number
 * @name z
 * @memberOf me.TMXObject
 */
me.TMXObject.prototype.z = 0;
/**
 * object gid value
 * when defined the object is a tiled object
 * @public
 * @type Number
 * @name gid
 * @memberOf me.TMXObject
 */
me.TMXObject.prototype.gid = undefined;
/**
 * if true, the object is a polygone
 * @public
 * @type Boolean
 * @name isPolygon
 * @memberOf me.TMXObject
 */
me.TMXObject.prototype.isPolygon = false;
/**
 * f true, the object is a polygone
 * @public
 * @type Boolean
 * @name isPolyline
 * @memberOf me.TMXObject
 */
me.TMXObject.prototype.isPolyline = false;
/**
 * object point list (for polygone and polyline)
 * @public
 * @type Vector2d[]
 * @name points
 * @memberOf me.TMXObject
 */
me.TMXObject.prototype.points = undefined;
/**
 * constructor from XML content  
 * @param {Object} tmxObj
 * @param {Object} tilesets
 * @param {Object} z
 * @returns {undefined}
 */
me.TMXObject.prototype.initFromXML = function(tmxObj, tilesets, z) {
    this.name = me.mapReader.TMXParser.getStringAttribute(tmxObj, me.TMX_TAG_NAME);
    this.x = me.mapReader.TMXParser.getIntAttribute(tmxObj, me.TMX_TAG_X);
    this.y = me.mapReader.TMXParser.getIntAttribute(tmxObj, me.TMX_TAG_Y);
    this.z = z;
    this.width = me.mapReader.TMXParser.getIntAttribute(tmxObj, me.TMX_TAG_WIDTH, 0);
    this.height = me.mapReader.TMXParser.getIntAttribute(tmxObj, me.TMX_TAG_HEIGHT, 0);
    this.gid = me.mapReader.TMXParser.getIntAttribute(tmxObj, me.TMX_TAG_GID, null);
    this.isEllipse = false;
    this.isPolygon = false;
    this.isPolyline = false;
    // check if the object has an associated gid	
    if (this.gid) {
        this.setImage(this.gid, tilesets);
    } else {

// check if this is an ellipse 
        if (tmxObj.getElementsByTagName(me.TMX_TAG_ELLIPSE).length) {
            this.isEllipse = true;
        } else {
// polygone || polyline
            var points = tmxObj.getElementsByTagName(me.TMX_TAG_POLYGON);
            if (points.length) {
                this.isPolygon = true;
            } else {
                points = tmxObj.getElementsByTagName(me.TMX_TAG_POLYLINE);
                if (points.length) {
                    this.isPolyline = true;
                }
            }
            if (points.length) {
                this.points = [];
                // get a point array
                var point = me.mapReader.TMXParser.getStringAttribute(
                        points[0],
                        me.TMX_TAG_POINTS
                        ).split(" ");
                // and normalize them into an array of vectors
                for (var i = 0, v; i < point.length; i++) {
                    v = point[i].split(",");
                    this.points.push(new me.Vector2d(+v[0], +v[1]));
                }
            }
        }
    }

// Adjust the Position to match Tiled
    me.game.renderer.adjustPosition(this);
    // set the object properties
    me.TMXUtils.applyTMXPropertiesFromXML(this, tmxObj);
};
/**
 * constructor from JSON content
 * @ignore 
 * @param {Object} tmxObj
 * @param {Object} tilesets
 * @param {Object} z
 * @returns {undefined}
 */
me.TMXObject.prototype.initFromJSON = function(tmxObj, tilesets, z) {

    this.name = tmxObj[me.TMX_TAG_NAME];
    this.x = parseInt(tmxObj[me.TMX_TAG_X], 10);
    this.y = parseInt(tmxObj[me.TMX_TAG_Y], 10);
    this.z = parseInt(z, 10);
    this.width = parseInt(tmxObj[me.TMX_TAG_WIDTH] || 0, 10);
    this.height = parseInt(tmxObj[me.TMX_TAG_HEIGHT] || 0, 10);
    this.gid = parseInt(tmxObj[me.TMX_TAG_GID], 10) || null;
    this.isEllipse = false;
    this.isPolygon = false;
    this.isPolyline = false;
    // check if the object has an associated gid	
    if (this.gid) {
        this.setImage(this.gid, tilesets);
    }
    else {
        if (tmxObj[me.TMX_TAG_ELLIPSE] !== undefined) {
            this.isEllipse = true;
        }
        else {
            var points = tmxObj[me.TMX_TAG_POLYGON];
            if (points !== undefined) {
                this.isPolygon = true;
            } else {
                points = tmxObj[me.TMX_TAG_POLYLINE];
                if (points !== undefined) {
                    this.isPolyline = true;
                }
            }
            if (points !== undefined) {
                this.points = [];
                var self = this;
                points.forEach(function(point) {
                    self.points.push(new me.Vector2d(parseInt(point.x, 10), parseInt(point.y, 10)));
                });
            }
        }
    }

// Adjust the Position to match Tiled
    me.game.renderer.adjustPosition(this);
    // set the object properties
    me.TMXUtils.applyTMXPropertiesFromJSON(this, tmxObj);
};
/**
 * set the object image (for Tiled Object)
 * @ignore 
 * @param {Object} gid
 * @param {Object} tilesets
 * @returns {undefined}
 */
me.TMXObject.prototype.setImage = function(gid, tilesets) {
// get the corresponding tileset
    var tileset = tilesets.getTilesetByGid(this.gid);
    // set width and height equal to tile size
    this.width = tileset.tilewidth;
    this.height = tileset.tileheight;
    // force spritewidth size
    this.spritewidth = this.width;
    // the object corresponding tile 
    var tmxTile = new me.Tile(this.x, this.y, tileset.tilewidth, tileset.tileheight, this.gid);
    // get the corresponding tile into our object
    this.image = tileset.getTileImage(tmxTile);
};
/**
 * getObjectPropertyByName
 * @ignore 
 * @param {Object} name
 *
 */
me.TMXObject.prototype.getObjectPropertyByName = function(name) {
    return this[name];
};