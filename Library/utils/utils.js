goog.provide('me.utils');


/**
 * Base64 decoding
 * @see <a href="http://www.webtoolkit.info/">http://www.webtoolkit.info/</A>
 * @ignore 
 */
var Base64 = (function() {

    // hold public stuff in our singleton
    var singleton = {};

    // private property
    var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    // public method for decoding
    singleton.decode = function(input) {

        // make sure our input string has the right format
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        if (me.device.nativeBase64) {
            // use native decoder
            return window.atob(input);
        }
        else {
            // use cross-browser decoding
            var output = [], chr1, chr2, chr3, enc1, enc2, enc3, enc4, i = 0;

            while (i < input.length) {
                enc1 = _keyStr.indexOf(input.charAt(i++));
                enc2 = _keyStr.indexOf(input.charAt(i++));
                enc3 = _keyStr.indexOf(input.charAt(i++));
                enc4 = _keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output.push(String.fromCharCode(chr1));

                if (enc3 !== 64) {
                    output.push(String.fromCharCode(chr2));
                }
                if (enc4 !== 64) {
                    output.push(String.fromCharCode(chr3));
                }
            }

            output = output.join('');
            return output;
        }
    };

    return singleton;

})();

/**
 * a collection of utility functions<br>
 * there is no constructor function for me.utils
 * @namespace me.utils
 * @memberOf me
 */

/*---------------------------------------------
 
 PRIVATE STUFF
 
 ---------------------------------------------*/

// cache rgb converted value
var rgbCache = {};

// guid default value
var GUID_base = "";
var GUID_index = 0;

// regexp to deal with file name & path
var removepath = /^.*(\\|\/|\:)/;
var removeext = /\.[^\.]*$/;

/*---------------------------------------------
 
 PUBLIC STUFF
 
 ---------------------------------------------*/

/**
 * Decode a base64 encoded string into a binary string
 * @public
 * @function
 * @memberOf me.utils
 * @name decodeBase64
 * @param {string} input Base64 encoded data
 * @return {string} Binary string
 */
me.utils.decodeBase64 = function(input) {
    return Base64.decode(input);
};

/**
 * Decode a base64 encoded string into a byte array
 * @public
 * @function
 * @memberOf me.utils
 * @name decodeBase64AsArray
 * @param {string} input Base64 encoded data
 * @param {number} bytes [bytes] number of bytes per array entry
 * @return {Array.<number>} Array of bytes
 */
me.utils.decodeBase64AsArray = function(input, bytes) {
    bytes = bytes || 1;

    var dec = Base64.decode(input), i, j, len;

    // use a typed array if supported
    var ar;
    if (typeof window.Uint32Array === 'function') {
        ar = new Uint32Array(dec.length / bytes);
    } else {
        ar = [];
    }

    for (i = 0, len = dec.length / bytes; i < len; i++) {
        ar[i] = 0;
        for (j = bytes - 1; j >= 0; --j) {
            ar[i] += dec.charCodeAt((i * bytes) + j) << (j << 3);
        }
    }
    return ar;
};

/**
 * decompress zlib/gzip data (NOT IMPLEMENTED)
 * @public
 * @function
 * @memberOf me.utils
 * @name decompress
 * @param  {Arrary.<number>} data Array of bytes
 * @param  {string} format compressed data format ("gzip","zlib")
 * @return {Arrary.<number>} Array of bytes
 */
me.utils.decompress = function(data, format) {
    throw "melonJS: GZIP/ZLIB compressed TMX Tile Map not supported!";
};

/**
 * Decode a CSV encoded array into a binary array
 * @public
 * @function
 * @memberOf me.utils
 * @name decodeCSV
 * @param  {string} input CSV formatted data
 * @param  {number} limit row split limit
 * @return {Arrary.<number>} Int Array
 */
me.utils.decodeCSV = function(input, limit) {
    input = input.trim().split("\n");

    var result = [];
    for (var i = 0; i < input.length; i++) {
        var entries = input[i].split(",", limit);
        for (var e = 0; e < entries.length; e++) {
            result.push(+entries[e]);
        }
    }
    return result;
};

/**
 * return the base name of the file without path info.<br>
 * @public
 * @function
 * @memberOf me.utils
 * @name getBasename
 * @param  {string} path path containing the filename
 * @return {string} the base name without path information.
 */
me.utils.getBasename = function(path) {
    return path.replace(removepath, '').replace(removeext, '');
};

/**
 * return the extension of the file in the given path <br>
 * @public
 * @function
 * @memberOf me.utils
 * @name getFileExtension
 * @param  {string} path path containing the filename
 * @return {string} filename extension.
 */
me.utils.getFileExtension = function(path) {
    return path.substring(path.lastIndexOf(".") + 1, path.length);
};

/**
 * a Hex to RGB color function
 * @public
 * @function
 * @memberOf me.utils
 * @name HexTORGB
 * @param {string} h Hex color code in "#rgb" or "#RRGGBB" format
 * @param {number} [a] Alpha to be appended to decoded color (0 to 255)
 * @return {string} CSS color string in rgb() or rgba() format
 */
me.utils.HexToRGB = function(h, a) {
    if (h.charAt(0) !== "#") {
        // this is not a hexadecimal string
        return h;
    }
    // remove the # 
    h = h.substring(1, h.length);

    // check if we already have the converted value cached
    if (rgbCache[h] == null) {
        // else add it (format : "r,g,b")
        var h1, h2, h3;
        if (h.length < 6) {
            // 3 char shortcut is used, double each char
            h1 = h.charAt(0) + h.charAt(0);
            h2 = h.charAt(1) + h.charAt(1);
            h3 = h.charAt(2) + h.charAt(2);
        }
        else {
            h1 = h.substring(0, 2);
            h2 = h.substring(2, 4);
            h3 = h.substring(4, 6);
        }
        // set the value in our cache
        rgbCache[h] = parseInt(h1, 16) + "," + parseInt(h2, 16) + "," + parseInt(h3, 16);
    }
    return (a ? "rgba(" : "rgb(") + rgbCache[h] + (a ? "," + a + ")" : ")");
};

/**
 * an RGB to Hex color function
 * @public
 * @function
 * @memberOf me.utils
 * @name RGBToHex
 * @param {number} r Value for red component (0 to 255)
 * @param {number} g Value for green component (0 to 255)
 * @param {number} b Value for blue component (0 to 255)
 * @return {string} Hex color code in "RRGGBB" format
 */
me.utils.RGBToHex = function(r, g, b) {
    return r.toHex() + g.toHex() + b.toHex();
};

/**
 * Get image pixels
 * @public
 * @function
 * @memberOf me.utils
 * @name getPixels
 * @param {Image|Canvas} arg Image to read
 * @return {ImageData} Canvas ImageData object
 */
me.utils.getPixels = function(arg) {
    if (arg instanceof HTMLImageElement) {
        var _context = me.video.getContext2d(
                me.video.createCanvas(arg.width, arg.height)
                );
        _context.drawImage(arg, 0, 0);
        return _context.getImageData(0, 0, arg.width, arg.height);
    } else {
        // canvas !
        return arg.getContext('2d').getImageData(0, 0, arg.width, arg.height);
    }
};

/**
 * reset the GUID Base Name
 * the idea here being to have a unique ID
 * per level / object 
 * @param {Object} base
 * @returns {undefined}
 */
me.utils.resetGUID = function(base) {
    // also ensure it's only 8bit ASCII characters
    GUID_base = base.toString().toUpperCase().toHex();
    GUID_index = 0;
};

/**
 * create and return a very simple GUID
 * Game Unique ID
 * @ignore
 */
me.utils.createGUID = function() {
    return GUID_base + "-" + (GUID_index++);
};

/**
 * apply friction to a force 
 * @param {Object} v
 * @param {Object} f 
 */
me.utils.applyFriction = function(v, f) {
    return (v + f < 0) ? v + (f * me.timer.tick) : (v - f > 0) ? v - (f * me.timer.tick) : 0;
};	