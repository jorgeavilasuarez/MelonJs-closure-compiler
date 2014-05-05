goog.provide('me.TMXObjectGroup');
goog.require('goog.object');
goog.require('me.TMXObject');

/**
 * TMX Object Group <br>
 * contains the object group definition as defined in Tiled. <br>
 * note : object group definition is translated into the virtual `me.game.world` using `me.ObjectContainer`.
 * @see me.ObjectContainer
 * @class
 * @extends Object
 * @memberOf me
 * @constructor
 */
me.TMXObjectGroup = function() {
};

goog.inherits(me.TMXObjectGroup, goog.object);

/**
 * group name
 * @public
 * @type String
 * @name name
 * @memberOf me.TMXObjectGroup
 */
me.TMXObjectGroup.prototype.name = null;

/**
 * group width
 * @public
 * @type Number
 * @name name
 * @memberOf me.TMXObjectGroup
 */
me.TMXObjectGroup.prototype.width = 0;

/**
 * group height
 * @public
 * @type Number
 * @name name
 * @memberOf me.TMXObjectGroup
 */
me.TMXObjectGroup.prototype.height = 0;

/**
 * group visibility state
 * @public
 * @type Boolean
 * @name name
 * @memberOf me.TMXObjectGroup
 */
me.TMXObjectGroup.prototype.visible = false;

/**
 * group z order
 * @public
 * @type Number
 * @name name
 * @memberOf me.TMXObjectGroup
 */
me.TMXObjectGroup.prototype.z = 0;

/**
 * group objects list definition
 * @see me.TMXObject
 * @public
 * @type Array
 * @name name
 * @memberOf me.TMXObjectGroup
 */
me.TMXObjectGroup.prototype.objects = [];

/**
 * constructor from XML content 
 * @param {type} name
 * @param {type} tmxObjGroup
 * @param {type} tilesets
 * @param {type} z
 * @returns {undefined}
 */
me.TMXObjectGroup.prototype.initFromXML = function(name, tmxObjGroup, tilesets, z) {

    this.name = name;
    this.width = me.mapReader.TMXParser.getIntAttribute(tmxObjGroup, me.TMX_TAG_WIDTH);
    this.height = me.mapReader.TMXParser.getIntAttribute(tmxObjGroup, me.TMX_TAG_HEIGHT);
    this.visible = (me.mapReader.TMXParser.getIntAttribute(tmxObjGroup, me.TMX_TAG_VISIBLE, 1) === 1);
    this.opacity = me.mapReader.TMXParser.getFloatAttribute(tmxObjGroup, me.TMX_TAG_OPACITY, 1.0).clamp(0.0, 1.0);
    this.z = z;
    this.objects = [];
    // check if we have any user-defined properties
    if (tmxObjGroup.firstChild && (tmxObjGroup.firstChild.nextSibling.nodeName === me.TMX_TAG_PROPERTIES)) {
        me.TMXUtils.applyTMXPropertiesFromXML(this, tmxObjGroup);
    }

    var data = tmxObjGroup.getElementsByTagName(me.TMX_TAG_OBJECT);
    for (var i = 0; i < data.length; i++) {
        var object = new me.TMXObject();
        object.initFromXML(data[i], tilesets, z);
        this.objects.push(object);
    }
};

/**
 * constructor from JSON content 
 * @param {type} name
 * @param {type} tmxObjGroup
 * @param {type} tilesets
 * @param {type} z
 * @returns {undefined}
 */
me.TMXObjectGroup.prototype.initFromJSON = function(name, tmxObjGroup, tilesets, z) {
    var self = this;
    this.name = name;
    this.width = tmxObjGroup[me.TMX_TAG_WIDTH];
    this.height = tmxObjGroup[me.TMX_TAG_HEIGHT];
    this.visible = tmxObjGroup[me.TMX_TAG_VISIBLE];
    this.opacity = parseFloat(tmxObjGroup[me.TMX_TAG_OPACITY] || 1.0).clamp(0.0, 1.0);
    this.z = z;
    this.objects = [];
    // check if we have any user-defined properties 
    me.TMXUtils.applyTMXPropertiesFromJSON(this, tmxObjGroup);
    // parse all TMX objects
    tmxObjGroup["objects"].forEach(function(tmxObj) {
        var object = new me.TMXObject();
        object.initFromJSON(tmxObj, tilesets, z);
        self.objects.push(object);
    });
};

/**
 * reset function
 * @ignore
 * @function
 */
me.TMXObjectGroup.prototype.reset = function() {
// clear all allocated objects
    this.objects = null;
};

/**
 * return the object count
 * @ignore
 * @function
 */
me.TMXObjectGroup.prototype.getObjectCount = function() {
    return this.objects.length;
};

/**
 * returns the object at the specified index
 * @param {type} idx
 * @returns {unresolved}
 */
me.TMXObjectGroup.prototype.getObjectByIndex = function(idx) {
    return this.objects[idx];
};
