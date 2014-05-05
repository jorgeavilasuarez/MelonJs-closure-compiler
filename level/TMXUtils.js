goog.provide('me.TMXUtils');


/**
 * set and interpret a TMX property value  
 * @param {type} value
 * @returns {unresolved}
 */
function setTMXValue(value) {
    if (!value || value.isBoolean()) {
        // if value not defined or boolean
        value = value ? (value === "true") : true;
    } else if (value.isNumeric()) {
        // check if numeric
        value = Number(value);
    } else if (value.match(/^json:/i)) {
        // try to parse it
        var match = value.split(/^json:/i)[1];
        try {
            value = JSON.parse(match);
        }
        catch (e) {
            throw "Unable to parse JSON: " + match;
        }
    }
    // return the interpreted value
    return value;
}

/**
 * Apply TMX Properties to the give object 
 * @param {type} obj
 * @param {type} xmldata
 * @returns {undefined}
 */
me.TMXUtils.applyTMXPropertiesFromXML = function(obj, xmldata) {
    var properties = xmldata.getElementsByTagName(me.TMX_TAG_PROPERTIES)[0];

    if (properties) {
        var oProp = properties.getElementsByTagName(me.TMX_TAG_PROPERTY);

        for (var i = 0; i < oProp.length; i++) {
            var propname = me.mapReader.TMXParser.getStringAttribute(oProp[i], me.TMX_TAG_NAME);
            var value = me.mapReader.TMXParser.getStringAttribute(oProp[i], me.TMX_TAG_VALUE);
            // set the value
            obj[propname] = setTMXValue(value);

        }
    }

};

/**
 * Apply TMX Properties to the give object 
 * @param {type} obj
 * @param {type} data
 * @returns {undefined}
 */
me.TMXUtils.applyTMXPropertiesFromJSON = function(obj, data) {
    var properties = data[me.TMX_TAG_PROPERTIES];
    if (properties) {
        for (var name in properties) {
            if (properties.hasOwnProperty(name)) {
                // set the value
                obj[name] = setTMXValue(properties[name]);
            }
        }
    }
};

/**
 * basic function to merge object properties 
 * @param {type} dest
 * @param {type} src
 * @param {type} overwrite
 * @returns {unresolved}
 */
me.TMXUtils.mergeProperties = function(dest, src, overwrite) {
    for (var p in src) {
        if (overwrite || dest[p] === undefined)
            dest[p] = src[p];
    }
    return dest;
};
