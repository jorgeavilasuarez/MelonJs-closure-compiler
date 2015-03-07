goog.provide('me.timer');

goog.require('me.sys');

/*---------------------------------------------
 
 PRIVATE STUFF
 
 ---------------------------------------------*/

//hold element to display fps
var framecount = 0;
var framedelta = 0;

/* fps count stuff */
var last = 0;
var now = 0;
var delta = 0;
var step = Math.ceil(1000 / me.sys.fps); // ROUND IT ?
// define some step with some margin
var minstep = (1000 / me.sys.fps) * 1.25; // IS IT NECESSARY?


/*---------------------------------------------
 
 PUBLIC STUFF
 
 ---------------------------------------------*/

/**
 * last game tick value
 * @public
 * @type Int
 * @name tick
 * @memberOf me.timer
 */
me.timer.tick = 1.0;

/**
 * last measured fps rate
 * @public
 * @type Int
 * @name fps
 * @memberOf me.timer
 */
me.timer.fps = 0;

/**
 * init the timer
 * @ignore
 */
me.timer.init = function() {
    // reset variables to initial state
    me.timer.reset();
};

/**
 * reset time (e.g. usefull in case of pause)
 * @name reset
 * @memberOf me.timer
 * @ignore
 * @function
 */
me.timer.reset = function() {
    // set to "now"
    now = last = Date.now();
    // reset delta counting variables
    framedelta = 0;
    framecount = 0;
};

/**
 * Return the current time, in milliseconds elapsed between midnight, January 1, 1970, and the current date and time.
 * @name getTime
 * @memberOf me.timer
 * @return {number}
 * @function
 */
me.timer.getTime = function() {
    return now;
};

/**
 * compute the actual frame time and fps rate
 * @name computeFPS
 * @ignore
 * @memberOf me.timer
 * @function
 */
me.timer.countFPS = function() {
    framecount++;
    framedelta += delta;
    if (framecount % 10 === 0) {
        me.timer.fps = (~~((1000 * framecount) / framedelta)).clamp(0, me.sys.fps);
        framedelta = 0;
        framecount = 0;
    }
};

/**
 * update game tick
 * should be called once a frame
 * @ignore
 */
me.timer.update = function() {
    last = now;
    now = Date.now();

    delta = (now - last);

    // get the game tick
    me.timer.tick = (delta > minstep && me.sys.interpolation) ? delta / step : 1;
};