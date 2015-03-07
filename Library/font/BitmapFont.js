goog.provide('me.BitmapFont');


/** @ignore */
// font scale;
me.BitmapFont.prototype.sSize = null;
// first char in the ascii table
me.BitmapFont.firstChar = 0x20;
// #char per row
me.BitmapFont.prototype.charCount = 0;

/**
 * a bitpmap font object
 * @class
 * @extends me.Font
 * @memberOf me
 * @constructor
 * @param {string} font
 * @param {int/Object} size either an int value, or an object like {x:16,y:16}
 * @param {int} [scale="1.0"]
 * @param {string} [firstChar="0x20"]
 */
me.BitmapFont = function(font, size, scale, firstChar) {
    // font name and type    
    goog.base(this, font, null, null);
    // font scaled size;
    this.sSize = new me.Vector2d();
    // first char in the ascii table
    this.firstChar = firstChar || 0x20;
    // load the font metrics
    this.loadFontMetrics(font, size);
    // set a default alignement
    this.textAlign = "left";
    this.textBaseline = "top";
    // resize if necessary
    if (scale) {
        this.resize(scale);
    }

};

goog.inherits(me.BitmapFont, me.Font);
/**
 * Load the font metrics
 * @param {Object} font
 * @param {Object} size
 * @ignore	
 */
me.BitmapFont.prototype.loadFontMetrics = function(font, size) {
    this.font = me.loader.getImage(font);
    // some cheap metrics
    this.fontSize.x = size.x || size;
    this.fontSize.y = size.y || this.font.height;
    this.sSize.copy(this.fontSize);
    this.height = this.sSize.y;
    // #char per row  
    this.charCount = ~~(this.font.width / this.fontSize.x);
};
/**
 * change the font settings
 * @name set
 * @memberOf me.BitmapFont
 * @function
 * @param {string} textAlign ("left", "center", "right")
 * @param {int} [scale]
 */
me.BitmapFont.prototype.set = function(textAlign, scale) {
    this.textAlign = textAlign;
    // updated scaled Size
    if (scale) {
        this.resize(scale);
    }
};
/**
 * change the font display size
 * @name resize
 * @memberOf me.BitmapFont
 * @function
 * @param {int} scale ratio
 */
me.BitmapFont.prototype.resize = function(scale) {
    // updated scaled Size
    this.sSize.setV(this.fontSize);
    this.sSize.x *= scale;
    this.sSize.y *= scale;
    this.height = this.sSize.y;
};
/**
 * measure the given text size in pixels
 * @name measureText
 * @memberOf me.BitmapFont
 * @function
 * @param {Context} context 2D Context
 * @param {string} text
 * @return {Object} returns an object, with two attributes: width (the width of the text) and height (the height of the text).
 */
me.BitmapFont.prototype.measureText = function(context, text) {

    var strings = ("" + text).split("\n");
    this.height = this.width = 0;
    for (var i = 0; i < strings.length; i++) {
        this.width = Math.max((strings[i].trim().length * this.sSize.x), this.width);
        this.height += this.sSize.y * this.lineHeight;
    }
    return {width: this.width, height: this.height};
};
/**
 * draw a text at the specified coord
 * @name draw
 * @memberOf me.BitmapFont
 * @function
 * @param {Context} context 2D Context
 * @param {string} text
 * @param {int} x
 * @param {int} y
 */
me.BitmapFont.prototype.draw = function(context, text, x, y) {
    var strings = ("" + text).split("\n");
    var lX = x;
    var height = this.sSize.y * this.lineHeight;
    // update initial position
    this.pos.set(x, y);
    for (var i = 0; i < strings.length; i++) {
        x = lX;
        var string = strings[i].trim();
        // adjust x pos based on alignment value
        var width = string.length * this.sSize.x;
        switch (this.textAlign) {
            case "right":
                x -= width;
                break;
            case "center":
                x -= width * 0.5;
                break;
            default :
                break;
        }

// adjust y pos based on alignment value
        switch (this.textBaseline) {
            case "middle":
                y -= height * 0.5;
                break;
            case "ideographic":
            case "alphabetic":
            case "bottom":
                y -= height;
                break;
            default :
                break;
        }

// draw the string
        for (var c = 0, len = string.length; c < len; c++) {
// calculate the char index
            var idx = string.charCodeAt(c) - this.firstChar;
            if (idx >= 0) {
// draw it
                context.drawImage(this.font,
                        this.fontSize.x * (idx % this.charCount),
                        this.fontSize.y * ~~(idx / this.charCount),
                        this.fontSize.x, this.fontSize.y,
                        ~~x, ~~y,
                        this.sSize.x, this.sSize.y);
            }
            x += this.sSize.x;
        }
// increment line
        y += height;
    }
};

