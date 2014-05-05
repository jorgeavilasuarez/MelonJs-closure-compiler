goog.provide('JSONMapReader');
//goog.require('me.TMXMapReader');


/**
 * a JSON Map Reader
 * Tiled QT 0.7.x format
 * @class
 * @memberOf me
 * @constructor
 * @ignore
 */

JSONMapReader = function() {
};

//goog.inherits(JSONMapReader, me.TMXMapReader);
JSONMapReader.prototype.readJSONMap = function(map, data) {
    if (!data) {
        throw "melonJS:" + map.levelId + " TMX map not found";
    }

    // to automatically increment z index
    var zOrder = 0;
    // keep a reference to our scope
    var self = this;
    // map information
    map.version = data[me.TMX_TAG_VERSION];
    map.orientation = data[me.TMX_TAG_ORIENTATION];
    map.cols = parseInt(data[me.TMX_TAG_WIDTH], 10);
    map.rows = parseInt(data[me.TMX_TAG_HEIGHT], 10);
    map.tilewidth = parseInt(data[me.TMX_TAG_TILEWIDTH], 10);
    map.tileheight = parseInt(data[me.TMX_TAG_TILEHEIGHT], 10);
    map.width = map.cols * map.tilewidth;
    map.height = map.rows * map.tileheight;
    map.backgroundcolor = data[me.TMX_BACKGROUND_COLOR];
    map.z = zOrder++;
    // set the map properties (if any)
    me.TMXUtils.applyTMXPropertiesFromJSON(map, data);
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

    // Tileset information
    if (!map.tilesets) {
        // make sure we have a TilesetGroup Object
        map.tilesets = new me.TMXTilesetGroup();
    }
    // parse all tileset objects
    data["tilesets"].forEach(function(tileset) {
        // add the new tileset
        map.tilesets.add(self.readTileset(tileset));
    });
    // get layers information
    data["layers"].forEach(function(layer) {
        switch (layer.type) {
            case me.TMX_TAG_IMAGE_LAYER :
                map.mapLayers.push(self.readImageLayer(map, layer, zOrder++));
                break;
            case me.TMX_TAG_TILE_LAYER :
                map.mapLayers.push(self.readLayer(map, layer, zOrder++));
                break;
                // get the object groups information
            case me.TMX_TAG_OBJECTGROUP:
                map.objectGroups.push(self.readObjectGroup(map, layer, zOrder++));
                break;
            default:
                break;
        }
    });
    // FINISH !
};
JSONMapReader.prototype.readLayer = function(map, data, z) {
    var layer = new me.TMXLayer(map.tilewidth, map.tileheight, map.orientation, map.tilesets, z);
    // init the layer properly
    layer.initFromJSON(data);
    // associate a renderer to the layer (if not a collision layer)
    if (!layer.isCollisionMap) {
        if (!me.game.renderer.canRender(layer)) {
            layer.setRenderer(me.mapReader.getNewDefaultRenderer(layer));
        } else {
            // use the default one
            layer.setRenderer(me.game.renderer);
        }
    }
    // parse the layer data
    this.setLayerData(layer, data[me.TMX_TAG_DATA], 'json', null);
    return layer;
};
JSONMapReader.prototype.readImageLayer = function(map, data, z) {
    // extract layer information
    var iln = data[me.TMX_TAG_NAME];
    var ilw = parseInt(data[me.TMX_TAG_WIDTH], 10);
    var ilh = parseInt(data[me.TMX_TAG_HEIGHT], 10);
    var ilsrc = data[me.TMX_TAG_IMAGE];
    // create the layer
    var imageLayer = new me.ImageLayer(iln, ilw * map.tilewidth, ilh * map.tileheight, ilsrc, z);
    // set some additional flags
    imageLayer.visible = data[me.TMX_TAG_VISIBLE];
    imageLayer.setOpacity(parseFloat(data[me.TMX_TAG_OPACITY]));
    // check if we have any additional properties 
    me.TMXUtils.applyTMXPropertiesFromJSON(imageLayer, data);
    // make sure ratio is a vector (backward compatibility)
    if (typeof(imageLayer.ratio) === "number") {
        imageLayer.ratio = new me.Vector2d(parseFloat(imageLayer.ratio), parseFloat(imageLayer.ratio));
    }

    return imageLayer;
};
JSONMapReader.prototype.readTileset = function(data) {
    var tileset = new me.TMXTileset();
    tileset.initFromJSON(data);
    return tileset;
};
JSONMapReader.prototype.readObjectGroup = function(map, data, z) {
    var group = new me.TMXObjectGroup();
    group.initFromJSON(data[me.TMX_TAG_NAME], data, map.tilesets, z);
    return group;
};
