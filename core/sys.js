goog.provide('me.sys');
// Global settings
/**
 * Game FPS (default 60)
 * @type Int
 * @memberOf me.sys
 */
me.sys.fps = 60;
/**
 * enable/disable frame interpolation (default disable)<br>
 * @type Boolean
 * @memberOf me.sys
 */
me.sys.interpolation = false;
/**
 * Global scaling factor(default 1.0)
 * @type me.Vector2d
 * @memberOf me.sys
 */
me.sys.scale = null; //initialized by me.video.init

/**
 * enable/disable video scaling interpolation (default disable)<br>
 * @type Boolean
 * @memberOf me.sys
 */
me.sys.scalingInterpolation = false;
/**
 * Global gravity settings <br>
 * will override entities init value if defined<br>
 * default value : undefined
 * @type Number
 * @memberOf me.sys
 */
me.sys.gravity = undefined;
/**
 * Specify either to stop on audio loading error or not<br>
 * if me.debug.stopOnAudioLoad is true, melonJS will throw an exception and stop loading<br>
 * if me.debug.stopOnAudioLoad is false, melonJS will disable sounds and output a warning message in the console <br>
 * default value : true<br>
 * @type Boolean
 * @memberOf me.sys
 */
me.sys.stopOnAudioError = true;
/**
 * Specify whether to pause the game when losing focus.<br>
 * default value : true<br>
 * @type Boolean
 * @memberOf me.sys
 */
me.sys.pauseOnBlur = true;
/**
 * Specify whether to unpause the game when gaining focus.<br>
 * default value : true<br>
 * @type Boolean
 * @memberOf me.sys
 */
me.sys.resumeOnFocus = true;
/**
 * Specify whether to stop the game when losing focus or not<br>
 * The engine restarts on focus if this is enabled.
 * default value : false<br>
 * @type Boolean
 * @memberOf me.sys
 */
me.sys.stopOnBlur = false;
/**
 * Specify the rendering method for layers <br>
 * if false, visible part of the layers are rendered dynamically (default)<br>
 * if true, the entire layers are first rendered into an offscreen canvas<br>
 * the "best" rendering method depends of your game<br>
 * (amount of layer, layer size, amount of tiles per layer, etc…)<br>
 * note : rendering method is also configurable per layer by adding this property to your layer (in Tiled)<br>
 * @type Boolean
 * @memberOf me.sys
 */
me.sys.preRender = false;
// System methods
/**
 * Compare two version strings
 * @public
 * @function
 * @param {String} first First version string to compare
 * @param {String} [second="@VERSION"] Second version string to compare 
 * @return {Integer} comparison result <br>&lt; 0 : first &lt; second <br>0 : first == second <br>&gt; 0 : first &gt; second
 * @example
 * if (me.sys.checkVersion("0.9.5") > 0) {
 *     console.error("melonJS is too old. Expected: 0.9.5, Got: " + me.version);
 * }
 */
me.sys.checkVersion = function(first, second) {
    second = second || me.version;
    var a = first.split(".");
    var b = second.split(".");
    var len = Math.min(a.length, b.length);
    var result = 0;
    for (var i = 0; i < len; i++) {
        if (result = +a[i] - +b[i]) {
            break;
        }
    }

    return result ? result : a.length - b.length;
};