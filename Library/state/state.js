goog.provide('me.state');
goog.require('me.audio');
goog.require('me.sys');
goog.require('me.timer');
//goog.require('goog.array');
goog.require('me.game');
goog.require('me.DefaultLoadingScreen');

// based on the requestAnimationFrame polyfill by Erik Möller
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    // get unprefixed rAF and cAF, if present
    var requestAnimationFrame = window.requestAnimationFrame;
    var cancelAnimationFrame = window.cancelAnimationFrame;
    for (var x = 0; x < vendors.length; ++x) {
        if (requestAnimationFrame && cancelAnimationFrame) {
            break;
        }
        requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
                window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!requestAnimationFrame || !cancelAnimationFrame) {
        requestAnimationFrame = function(callback, element) {
            var currTime = Date.now();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

        cancelAnimationFrame = function(id) {
            window.clearTimeout(id);
        };
    }

    // put back in global namespace
    window.requestAnimationFrame = requestAnimationFrame;
    window.cancelAnimationFrame = cancelAnimationFrame;
}());


/**
 * a State Manager (state machine)<p>
 * There is no constructor function for me.state.
 * @namespace me.state
 * @memberOf me
 */

/*-------------------------------------------
 PRIVATE STUFF
 --------------------------------------------*/

// current state
me.state._state = -1;

// requestAnimeFrame Id
me.state._animFrameId = -1;

// whether the game state is "paused"
me.state._isPaused = false;

// list of screenObject
me.state._screenObject = {};

// fading transition parameters between screen
me.state._fade = {
    color: "",
    duration: 0
};

// callback when state switch is done
/** @ignore */
me.state._onSwitchComplete = null;

// just to keep track of possible extra arguments
me.state._extraArgs = null;

// cache reference to the active screen update frame
me.state._activeUpdateFrame = null;

/**
 * @ignore
 */
me.state._startRunLoop = function() {
    // ensure nothing is running first and in valid state
    if ((me.state._animFrameId === -1) && (me.state._state !== -1)) {
        // reset the timer
        me.timer.reset();

        // start the main loop
        me.state._animFrameId = window.requestAnimationFrame(me.state._renderFrame);
    }
};

/**
 * Resume the game loop after a pause.
 * @ignore
 * @private
 */
me.state._resumeRunLoop = function() {
    // ensure game is actually paused and in valid state
    if (me.state._isPaused && (me.state._state !== -1)) {
        // reset the timer
        me.timer.reset();

        me.state._isPaused = false;
    }
};

/**
 * Pause the loop for most screen objects.
 * @ignore
 * @private
 */
me.state._pauseRunLoop = function() {
    // Set the paused boolean to stop updates on (most) entities
    me.state._isPaused = true;
}

/**
 * this is only called when using requestAnimFrame stuff
 * @ignore
 * @private
 */
me.state._renderFrame = function() {
    me.state._activeUpdateFrame();
    if (me.state._animFrameId !== -1) {
        me.state._animFrameId = window.requestAnimationFrame(me.state._renderFrame);
    }
}

/**
 * stop the SO main loop
 * @ignore
 * @private
 */
me.state._stopRunLoop = function() {
    // cancel any previous animationRequestFrame
    window.cancelAnimationFrame(me.state._animFrameId);
    me.state._animFrameId = -1;
}

/**
 * start the SO main loop 
 * @param {Object} state 
 * @private
 */
me.state._switchState = function(state) {
    // clear previous interval if any
    me.state._stopRunLoop();

    // call the screen object destroy method
    if (me.state._screenObject[me.state._state]) {
        if (me.state._screenObject[me.state._state].screen.visible) {
            // persistent or not, make sure we remove it
            // from the current object list
            me.game.remove.call(me.game, me.state._screenObject[me.state._state].screen, true);
        } else {
            // just notify the object
            me.state._screenObject[me.state._state].screen.destroy();
        }
    }

    if (me.state._screenObject[state])
    {
        // set the global variable
        me.state._state = state;

        // call the reset function with me.state._extraArgs as arguments
        me.state._screenObject[me.state._state].screen.reset.apply(me.state._screenObject[me.state._state].screen, me.state._extraArgs);

        // cache the new screen object update function
        me.state._activeUpdateFrame = me.state._screenObject[me.state._state].screen.onUpdateFrame.bind(me.state._screenObject[me.state._state].screen);

        // and start the main loop of the
        // new requested state
        me.state._startRunLoop();

        // execute callback if defined
        if (me.state._onSwitchComplete) {
            me.state._onSwitchComplete();
        }

        // force repaint
        me.game.repaint();
    }
};

/*---------------------------------------------
 PUBLIC STUFF
 ---------------------------------------------*/

/**
 * default state value for Loading Screen
 * @constant
 * @name LOADING
 * @memberOf me.state
 */
me.state.LOADING = 0;
/**
 * default state value for Menu Screen
 * @constant
 * @name MENU
 * @memberOf me.state
 */
me.state.MENU = 1;
/**
 * default state value for "Ready" Screen
 * @constant
 * @name READY
 * @memberOf me.state
 */
me.state.READY = 2;
/**
 * default state value for Play Screen
 * @constant
 * @name PLAY
 * @memberOf me.state
 */
me.state.PLAY = 3;
/**
 * default state value for Game Over Screen
 * @constant
 * @name GAMEOVER
 * @memberOf me.state
 */
me.state.GAMEOVER = 4;
/**
 * default state value for Game End Screen
 * @constant
 * @name GAME_END
 * @memberOf me.state
 */
me.state.GAME_END = 5;
/**
 * default state value for High Score Screen
 * @constant
 * @name SCORE
 * @memberOf me.state
 */
me.state.SCORE = 6;
/**
 * default state value for Credits Screen
 * @constant
 * @name CREDITS
 * @memberOf me.state
 */
me.state.CREDITS = 7;
/**
 * default state value for Settings Screen
 * @constant
 * @name SETTINGS
 * @memberOf me.state
 */
me.state.SETTINGS = 8;

/**
 * default state value for user defined constants<br>
 * @constant
 * @name USER
 * @memberOf me.state
 * @example
 * var STATE_INFO = me.state.USER + 0;
 * var STATE_WARN = me.state.USER + 1;
 * var STATE_ERROR = me.state.USER + 2;
 * var STATE_CUTSCENE = me.state.USER + 3;
 */
me.state.USER = 100;

/**
 * onPause callback
 
 * @name onPause
 * @memberOf me.state
 */
me.state.onPause = null;

/**
 * onResume callback
 
 * @name onResume
 * @memberOf me.state
 */
me.state.onResume = null;

/**
 * onStop callback
 
 * @name onStop
 * @memberOf me.state
 */
me.state.onStop = null;

/**
 * onRestart callback
 
 * @name onRestart
 * @memberOf me.state
 */
me.state.onRestart = null;

/**
 * @ignore
 */
me.state.init = function() {
    // set the embedded loading screen
    me.state.set(me.state.LOADING, new me.DefaultLoadingScreen());

    // set pause/stop action on losing focus
    window.addEventListener("blur", function() {
        // only in case we are not loading stuff
        if (me.state._state !== me.state.LOADING) {
            if (me.sys.stopOnBlur) {
                me.state.stop(true);

                // callback?
                if (me.state.onStop)
                    me.state.onStop();

                // publish the pause notification
                me.event.publish(me.event.STATE_STOP);
            }
            if (me.sys.pauseOnBlur) {
                me.state.pause(true);
                // callback?
                if (me.state.onPause)
                    me.state.onPause();

                // publish the pause notification
                me.event.publish(me.event.STATE_PAUSE);
            }
        }
    }, false);
    // set restart/resume action on gaining focus
    window.addEventListener("focus", function() {
        // only in case we are not loading stuff
        if (me.state._state !== me.state.LOADING) {
            // note: separate boolean so we can stay paused if user prefers
            if (me.sys.resumeOnFocus) {
                me.state.resume(true);

                // callback?
                if (me.state.onResume)
                    me.state.onResume();

                // publish the resume notification
                me.event.publish(me.event.STATE_RESUME);
            }
            if (me.sys.stopOnBlur) {
                me.state.restart(true);

                // force repaint
                me.game.repaint();

                // callback?
                if (me.state.onRestart)
                    me.state.onRestart();

                // publish the resume notification
                me.event.publish(me.event.STATE_RESTART);
            }
        }

    }, false);

};

/**
 * Stop the current screen object.
 * @name stop
 * @memberOf me.state
 * @public
 * @function
 * @param {Boolean} music pauseTrack pause current track on screen stop.
 */
me.state.stop = function(music) {
    // stop the main loop
    me.state._stopRunLoop();
    // current music stop
    if (music)
        me.audio.pauseTrack();

};

/**
 * pause the current screen object
 * @name pause
 * @memberOf me.state
 * @public
 * @function
 * @param {Boolean} music pauseTrack pause current track on screen pause
 */
me.state.pause = function(music) {
    // stop the main loop
    me.state._pauseRunLoop();
    // current music stop
    if (music)
        me.audio.pauseTrack();

};

/**
 * Restart the screen object from a full stop.
 * @name restart
 * @memberOf me.state
 * @public
 * @function
 * @param {Boolean} music  resumeTrack resume current track on screen resume
 */
me.state.restart = function(music) {
    // restart the main loop
    me.state._startRunLoop();
    // current music stop
    if (music)
        me.audio.resumeTrack();
};

/**
 * resume the screen object
 * @name resume
 * @memberOf me.state
 * @public
 * @function
 * @param {Boolean} music resumeTrack resume current track on screen resume
 */
me.state.resume = function(music) {
    // resume the main loop
    me.state._resumeRunLoop();
    // current music stop
    if (music)
        me.audio.resumeTrack();
};

/**
 * return the running state of the state manager
 * @name isRunning
 * @memberOf me.state
 * @public
 * @function 
 */
me.state.isRunning = function() {
    return me.state._animFrameId !== -1;
};

/**
 * Return the pause state of the state manager
 * @name isPaused
 * @memberOf me.state
 * @public
 * @function 
 */
me.state.isPaused = function() {
    return me.state._isPaused;
};

/**
 * associate the specified state with a screen object
 * @name set
 * @memberOf me.state
 * @public
 * @function
 * @param {Int} state @see me.state#Constant
 * @param {me.ScreenObject} so
 */
me.state.set = function(state, so) {
    me.state._screenObject[state] = {};
    me.state._screenObject[state].screen = so;
    me.state._screenObject[state].transition = true;
};

/**
 * return a reference to the current screen object<br>
 * useful to call a object specific method
 * @name current
 * @memberOf me.state
 * @public
 * @function
 * @return {me.ScreenObject}
 */
me.state.current = function() {
    return me.state._screenObject[me.state._state].screen;
};

/**
 * specify a global transition effect
 * @name transition
 * @memberOf me.state
 * @public
 * @function
 * @param {string} effect (only "fade" is supported for now)
 * @param {string} color a CSS color value
 * @param {Int} [duration=1000] expressed in milliseconds
 */
me.state.transition = function(effect, color, duration) {
    if (effect === "fade") {
        me.state._fade.color = color;
        me.state._fade.duration = duration;
    }
};

/**
 * enable/disable transition for a specific state (by default enabled for all)
 * @name setTransition
 * @memberOf me.state
 * @public
 * @function 
 * @param {Object} state
 * @param {Object} enable
 * @returns {undefined}
 */
me.state.setTransition = function(state, enable) {
    me.state._screenObject[state].transition = enable;
};

/**
 * change the game/app state
 * @name change
 * @memberOf me.state
 * @public
 * @function
 * @param {Int} state @see me.state#Constant 
 * @example
 * // The onResetEvent method on the play screen will receive two args:
 * // "level_1" and the number 3
 * me.state.change(me.state.PLAY, "level_1", 3);
 */
me.state.change = function(state) {
    // Protect against undefined ScreenObject
    if (typeof(me.state._screenObject[state]) === "undefined") {
        throw "melonJS : Undefined ScreenObject for state '" + state + "'";
    }

    me.state._extraArgs = null;
    if (arguments.length > 1) {
        // store extra arguments if any        
        me.state._extraArgs = Array.prototype.slice.call(arguments, 1);
    }
    // if fading effect
    if (me.state._fade.duration && me.state._screenObject[state].transition) {
        /** @ignore */
        me.state._onSwitchComplete = function() {
            me.game.viewport.fadeOut(me.state._fade.color, me.state._fade.duration);
        };
        me.game.viewport.fadeIn(me.state._fade.color, me.state._fade.duration,
                function() {
                    me.state._switchState.defer(state);
                });

    }
    // else just switch without any effects
    else {
        // wait for the last frame to be
        // "finished" before switching
        me.state._switchState.defer(state);

    }
};

/**
 * return true if the specified state is the current one
 * @name isCurrent
 * @memberOf me.state
 * @public
 * @function
 * @param {Int} state @see me.state#Constant
 */
me.state.isCurrent = function(state) {
    return me.state._state === state;
};  