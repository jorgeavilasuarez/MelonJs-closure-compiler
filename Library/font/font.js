goog.provide('me.Font');
goog.require('me.Renderable');



/**
 * a generic system font object.
 * @class
 * @extends Object
 * @memberOf me
 * @constructor
 * @param {string} font a CSS font name
 * @param {Number|String} size size, or size + suffix (px, em, pt)
 * @param {string} color a CSS color value
 * @param {string} [textAlign="left"] horizontal alignment
 */
me.Font = function(font, size, color, textAlign) {
    this.pos = new me.Vector2d();
    this.fontSize = new me.Vector2d();
    // font name and type
    this.set(font, size, color, textAlign);
    // parent constructor
    //this.parent(this.pos, 0, this.fontSize.y);
    goog.base(this, this.pos, 0, this.fontSize.y);
};
goog.inherits(me.Font, me.Renderable);

// private font properties
/** @ignore */
me.Font.prototype.font = null;
me.Font.prototype.fontSize = null;
me.Font.prototype.color = null;
/**
 * Set the default text alignment (or justification),<br>
 * possible values are "left", "right", and "center".<br>
 * Default value : "left"
 * @public
 * @type String
 * @name me.Font#textAlign
 */
me.Font.prototype.textAlign = "left";
/**
 * Set the text baseline (e.g. the Y-coordinate for the draw operation), <br>
 * possible values are "top", "hanging, "middle, "alphabetic, "ideographic, "bottom"<br>
 * Default value : "top"
 * @public
 * @type String
 * @name me.Font#textBaseline
 */
me.Font.prototype.textBaseline = "top";
/**
 * Set the line height (when displaying multi-line strings). <br>
 * Current font height will be multiplied with this value to set the line height.
 * Default value : 1.0
 * @public
 * @type Number
 * @name me.Font#lineHeight
 */
me.Font.prototype.lineHeight = 1.0;

/**
 * make the font bold
 * @name bold
 * @memberOf me.Font
 * @function
 */
me.Font.prototype.bold = function() {
    this.font = "bold " + this.font;
};
/**
 * make the font italic
 * @name italic
 * @memberOf me.Font
 * @function
 */
me.Font.prototype.italic = function() {
    this.font = "italic " + this.font;
};
/**
 * Change the font settings
 * @name set
 * @memberOf me.Font
 * @function
 * @param {string} font a CSS font name
 * @param {Number|String} size size, or size + suffix (px, em, pt)
 * @param {string} color a CSS color value
 * @param {string} [textAlign="left"] horizontal alignment
 * @example
 * font.set("Arial", 20, "white");
 * font.set("Arial", "1.5em", "white");
 */
me.Font.prototype.set = function(font, size, color, textAlign) {
// font name and type
    var font_names = font.split(",");
    for (var i = 0; i < font_names.length; i++) {
        font_names[i] = "'" + font_names[i] + "'";
    }

    this.fontSize.y = parseInt(size, 10);
    this.height = this.fontSize.y;
    if (typeof size === "number") {
        size = "" + size + "px";
    }
    this.font = size + " " + font_names.join(",");
    this.color = color;
    if (textAlign) {
        this.textAlign = textAlign;
    }
};
/**
 * measure the given text size in pixels
 * @name measureText
 * @memberOf me.Font
 * @function
 * @param {Context} context 2D Context
 * @param {string} text
 * @return {Object} returns an object, with two attributes: width (the width of the text) and height (the height of the text).
 */
me.Font.prototype.measureText = function(context, text) {
// draw the text
    context.font = this.font;
    context.fillStyle = this.color;
    context.textAlign = this.textAlign;
    context.textBaseline = this.textBaseline;
    this.height = this.width = 0;
    var strings = ("" + text).split("\n");
    for (var i = 0; i < strings.length; i++) {
        this.width = Math.max(context.measureText(strings[i].trim()).width, this.width);
        this.height += this.fontSize.y * this.lineHeight;
    }
    return {width: this.width, height: this.height};
};
/**
 * draw a text at the specified coord
 * @name draw
 * @memberOf me.Font
 * @function
 * @param {Context} context 2D Context
 * @param {string} text
 * @param {int} x
 * @param {int} y
 */
me.Font.prototype.draw = function(context, text, x, y) {
// update initial position
    this.pos.set(x, y);
    // draw the text
    context.font = this.font;
    context.fillStyle = this.color;
    context.textAlign = this.textAlign;
    context.textBaseline = this.textBaseline;
    var strings = ("" + text).split("\n");
    for (var i = 0; i < strings.length; i++) {
// draw the string
        context.fillText(strings[i].trim(), ~~x, ~~y);
        // add leading space
        y += this.fontSize.y * this.lineHeight;
    }

};  