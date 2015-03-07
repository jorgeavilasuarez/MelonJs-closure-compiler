goog.provide('XMLMapReader');
goog.require('me.TMXUtils');
goog.require('me.TMXOrthogonalRenderer');
goog.require('me.TMXTilesetGroup');
goog.require('me.TMXTileset');
goog.require('me.TMXLayer');
goog.require('me.TMXObjectGroup');
goog.require('me.ImageLayer');

/**
 * a XML Map Reader
 * Tiled QT 0.7.x format
 * @class
 * @memberOf me
 * @constructor
 * @ignore
 */
XMLMapReader = function() {
    if (!this.TMXParser) {
        this.TMXParser = new _TinyTMXParser();
    }
};

//goog.inherits(XMLMapReader, me.TMXMapReader);
XMLMapReader.prototype.TMXParser = null;

/**
 * initialize a map using XML data
 * @ignore
 */
XMLMapReader.prototype.readXMLMap = function(map, data) {
    if (!data) {
        throw "melonJS:" + map.levelId + " TMX map not found";
    }

// to automatically increment z index
    var zOrder = 0;
    // init the parser
    this.TMXParser.setData(data);
    // retreive all the elements of the XML file
    var xmlElements = this.TMXParser.getAllTagElements();
    // parse all tags
    for (var i = 0; i < xmlElements.length; i++) {

// check each Tag
        switch (xmlElements.item(i).nodeName) {
// get the map information
            case me.TMX_TAG_MAP:
                var elements = xmlElements.item(i);
                map.version = this.TMXParser.getStringAttribute(elements, me.TMX_TAG_VERSION);
                map.orientation = this.TMXParser.getStringAttribute(elements, me.TMX_TAG_ORIENTATION);
                map.cols = this.TMXParser.getIntAttribute(elements, me.TMX_TAG_WIDTH);
                map.rows = this.TMXParser.getIntAttribute(elements, me.TMX_TAG_HEIGHT);
                map.tilewidth = this.TMXParser.getIntAttribute(elements, me.TMX_TAG_TILEWIDTH);
                map.tileheight = this.TMXParser.getIntAttribute(elements, me.TMX_TAG_TILEHEIGHT);
                map.width = map.cols * map.tilewidth;
                map.height = map.rows * map.tileheight;
                map.backgroundcolor = this.TMXParser.getStringAttribute(elements, me.TMX_BACKGROUND_COLOR);
                map.z = zOrder++;
                // set the map properties (if any)
                me.TMXUtils.applyTMXPropertiesFromXML(map, elements);
                // check if a user-defined background color is defined  
                map.background_color = map.backgroundcolor ? map.backgroundcolor : map.background_color;
                if (map.background_color) {
                    map.mapLayers.push(new me.ColorLayer("background_color",
                            map.background_color,
                            zOrder++));
                }

// check if a background image is defined
                if (map.background_image) {
// add a new image layer
                    map.mapLayers.push(new me.ImageLayer("background_image",
                            map.width, map.height,
                            map.background_image,
                            zOrder++));
                }

// initialize a default renderer
                if ((me.game.renderer === null) || !me.game.renderer.canRender(map)) {
                    me.game.renderer = this.getNewDefaultRenderer(map);
                }

                break;
                // get the tileset information
            case me.TMX_TAG_TILESET:
                // Initialize our object if not yet done
                if (!map.tilesets) {
                    map.tilesets = new me.TMXTilesetGroup();
                }
// add the new tileset
                map.tilesets.add(this.readTileset(xmlElements.item(i)));
                break;
                // get image layer information
            case me.TMX_TAG_IMAGE_LAYER:
                map.mapLayers.push(this.readImageLayer(map, xmlElements.item(i), zOrder++));
                break;
                // get the layer(s) information
            case me.TMX_TAG_LAYER:
                // regular layer or collision layer
                map.mapLayers.push(this.readLayer(map, xmlElements.item(i), zOrder++));
                break;
                // get the object groups information
            case me.TMX_TAG_OBJECTGROUP:
                map.objectGroups.push(this.readObjectGroup(map, xmlElements.item(i), zOrder++));
                break;
            default:
                // ignore unrecognized tags
                break;
        } // end switch 

    } // end for

// free the TMXParser ressource
    this.TMXParser.free();
};
XMLMapReader.prototype.readLayer = function(map, data, z) {
    var layer = new me.TMXLayer(map.tilewidth, map.tileheight, map.orientation, map.tilesets, z);
    // init the layer properly
    layer.initFromXML(data);
    // check data encoding/compression type
    var layerData = data.getElementsByTagName(me.TMX_TAG_DATA)[0];
    var encoding = this.TMXParser.getStringAttribute(layerData, me.TMX_TAG_ENCODING, null);
    var compression = this.TMXParser.getStringAttribute(layerData, me.TMX_TAG_COMPRESSION, null);
    // make sure this is not happening
    if (encoding === '') {
        encoding = null;
    }
    if (compression === '') {
        compression = null;
    }

// associate a renderer to the layer (if not a collision layer)
    if (!layer.isCollisionMap || me.debug.renderCollisionMap) {
        if (!me.game.renderer.canRender(layer)) {
            layer.setRenderer(me.mapReader.getNewDefaultRenderer(layer));
        } else {
// use the default one
            layer.setRenderer(me.game.renderer);
        }
    }

// parse the layer data
    this.setLayerData(layer, layerData, encoding, compression);
    // free layerData
    layerData = null;
    return layer;
};
XMLMapReader.prototype.readImageLayer = function(map, data, z) {
// extract layer information
    var iln = this.TMXParser.getStringAttribute(data, me.TMX_TAG_NAME);
    var ilw = this.TMXParser.getIntAttribute(data, me.TMX_TAG_WIDTH);
    var ilh = this.TMXParser.getIntAttribute(data, me.TMX_TAG_HEIGHT);
    var ilsrc = data.getElementsByTagName(me.TMX_TAG_IMAGE)[0].getAttribute(me.TMX_TAG_SOURCE);
    // create the layer
    var imageLayer = new me.ImageLayer(iln, ilw * map.tilewidth, ilh * map.tileheight, ilsrc, z);
    // set some additional flags
    imageLayer.visible = (this.TMXParser.getIntAttribute(data, me.TMX_TAG_VISIBLE, 1) === 1);
    imageLayer.setOpacity(this.TMXParser.getFloatAttribute(data, me.TMX_TAG_OPACITY, 1.0));
    // check if we have any properties 
    me.TMXUtils.applyTMXPropertiesFromXML(imageLayer, data);
    // make sure ratio is a vector (backward compatibility)
    if (typeof(imageLayer.ratio) === "number") {
        imageLayer.ratio = new me.Vector2d(parseFloat(imageLayer.ratio), parseFloat(imageLayer.ratio));
    }

// add the new layer
    return imageLayer;
};
XMLMapReader.prototype.readTileset = function(data) {
    var tileset = new me.TMXTileset();
    tileset.initFromXML(data);
    return tileset;
};
XMLMapReader.prototype.readObjectGroup = function(map, data, z) {
    var name = this.TMXParser.getStringAttribute(data, me.TMX_TAG_NAME);
    var group = new me.TMXObjectGroup();
    group.initFromXML(name, data, map.tilesets, z);
    return group;
};
/** 
 * set a compatible renderer object
 * for the specified map
 * TODO : put this somewhere else 
 * @param {Object} obj 
 * 
 * */
XMLMapReader.prototype.getNewDefaultRenderer = function(obj) {
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
XMLMapReader.prototype.setLayerData = function(layer, data, encoding, compression) {
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


