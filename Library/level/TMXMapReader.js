goog.provide('me.TMXMapReader');
goog.require('me.TMXConstants');
goog.require('JSONMapReader');
goog.require('XMLMapReader');

me.TMXMapReader = function() {


};

/**
 * a TMX Map Reader
 * Tiled QT 0.7.x format
 * @class
 * @memberOf me
 * @constructor
 * @ignore
 */
me.TMXMapReader.prototype.XMLReader = null;
me.TMXMapReader.prototype.JSONReader = null;
// temporary, the time to
// rewrite the rest properly
/**
 * 
 * @type type
 */
me.TMXMapReader.prototype.TMXParser = null;

/**
 * 
 * @param {Object} map
 *
 */
me.TMXMapReader.prototype.readMap = function(map) {
// if already loaded, do nothing
    if (map.initialized) {
        return;
    }
    if (me.loader.getTMXFormat(map.levelId) === 'xml') {
// create an instance of the XML Reader
        if (this.XMLReader === null) {
            this.XMLReader = new XMLMapReader();
        }
        this.TMXParser = this.XMLReader.TMXParser;
        // load the map
        this.XMLReader.readXMLMap(map, me.loader.getTMX(map.levelId));
    }
    else /*JSON*/ {
// create an instance of the JSON Reader
        if (this.JSONReader === null) {
            this.JSONReader = new JSONMapReader();
        }
        this.JSONReader.readJSONMap(map, me.loader.getTMX(map.levelId));
    }


// center the map if smaller than the current viewport
    if ((map.width < me.game.viewport.width) ||
            (map.height < me.game.viewport.height)) {
        var shiftX = ~~((me.game.viewport.width - map.width) / 2);
        var shiftY = ~~((me.game.viewport.height - map.height) / 2);
        // update the map default screen position
        map.pos.add({x: shiftX > 0 ? shiftX : 0, y: shiftY > 0 ? shiftY : 0});
    }

// flag as loaded
    map.initialized = true;
};

/** 
 * set a compatible renderer object
 * for the specified map
 * TODO : put this somewhere else 
 * @param {Object} obj 
 * 
 * */
me.TMXMapReader.prototype.getNewDefaultRenderer = function(obj) {
    switch (obj.orientation) {
        case "orthogonal":
            return new me.TMXOrthogonalRenderer(obj.cols, obj.rows, obj.tilewidth, obj.tileheight);
        case "isometric":
            return new me.TMXIsometricRenderer(obj.cols, obj.rows, obj.tilewidth, obj.tileheight);
            // if none found, throw an exception
        default:
            throw "melonJS: " + obj.orientation + " type TMX Tile Map not supported!";
    }
};

/**
 * Set tiled layer Data
 * @param {Object} layer
 * @param {Object} data
 * @param {Object} encoding
 * @param {Object} compression
 * @returns {undefined}
 */
me.TMXMapReader.prototype.setLayerData = function(layer, data, encoding, compression) {
// initialize the layer data array
    layer.initArray(layer.cols, layer.rows);
    // decode data based on encoding type
    switch (encoding) {
// XML encoding
        case null:
            data = data.getElementsByTagName(me.TMX_TAG_TILE);
            break;
            // json encoding
        case 'json':
            // do nothing as data can be directly reused
            break;
            // CSV encoding
        case me.TMX_TAG_CSV:
            // Base 64 encoding
        case me.TMX_TAG_ATTR_BASE64:
            // Merge all childNodes[].nodeValue into a single one
            var nodeValue = '';
            for (var i = 0, len = data.childNodes.length; i < len; i++) {
                nodeValue += data.childNodes[i].nodeValue;
            }
// and then decode them
            if (encoding === me.TMX_TAG_CSV) {
// CSV decode
                data = me.utils.decodeCSV(nodeValue, layer.cols);
            } else {
// Base 64 decode
                data = me.utils.decodeBase64AsArray(nodeValue, 4);
                // check if data is compressed
                if (compression !== null) {
                    data = me.utils.decompress(data, compression);
                }
            }
// ensure nodeValue is deallocated
            nodeValue = null;
            break;
        default:
            throw "melonJS: TMX Tile Map " + encoding + " encoding not supported!";
    }


    var idx = 0;
    // set everything
    for (var y = 0; y < layer.rows; y++) {
        for (var x = 0; x < layer.cols; x++) {
// get the value of the gid
            var gid = (encoding == null) ? this.TMXParser.getIntAttribute(data[idx++], me.TMX_TAG_GID) : data[idx++];
            // fill the array										
            if (gid !== 0) {
// add a new tile to the layer
                var tile = layer.setTile(x, y, gid);
                // draw the corresponding tile
                if (layer.visible && layer.preRender) {
                    layer.renderer.drawTile(layer.layerSurface, x, y, tile, tile.tileset);
                }
            }
        }
    }
};

/**
 * a basic TMX/TSX Parser
 * @class
 * @constructor
 * @ignore
 **/
function _TinyTMXParser() {
    var parserObj = {
        tmxDoc: null,
        // parse a TMX XML file
        setData: function(data) {
            this.tmxDoc = data;
        },
        getFirstElementByTagName: function(name) {
            return this.tmxDoc ? this.tmxDoc.getElementsByTagName(name)[0] : null;
        },
        getAllTagElements: function() {
            return this.tmxDoc ? this.tmxDoc.getElementsByTagName('*') : null;
        },
        getStringAttribute: function(elt, str, val) {
            var ret = elt.getAttribute(str);
            return ret ? ret.trim() : val;
        },
        getIntAttribute: function(elt, str, val) {
            var ret = this.getStringAttribute(elt, str, val);
            return ret ? parseInt(ret, 10) : val;
        },
        getFloatAttribute: function(elt, str, val) {
            var ret = this.getStringAttribute(elt, str, val);
            return ret ? parseFloat(ret) : val;
        },
        getBooleanAttribute: function(elt, str, val) {
            var ret = this.getStringAttribute(elt, str, val);
            return ret ? (ret === "true") : val;
        },
        // free the allocated parser
        free: function() {
            this.tmxDoc = null;
        }
    };
    return parserObj;
}


