goog.provide('me.levelDirector');
goog.require('me.TMXTileMap');
goog.require('me.Vector2d');

/**
 * a level manager object <br>
 * once ressources loaded, the level director contains all references of defined levels<br>
 * There is no constructor function for me.levelDirector, this is a static object
 * @namespace me.levelDirector
 * @memberOf me
 */

/*---------------------------------------------
 
 PRIVATE STUFF
 
 ---------------------------------------------*/

// our levels
me.levelDirector.levels = {};
// level index table
me.levelDirector.levelIdx = [];
// current level index
me.levelDirector.currentLevelIdx = 0;

/*---------------------------------------------
 
 PUBLIC STUFF
 
 ---------------------------------------------*/
/**
 * reset the level director 
 * @ignore
 */
me.levelDirector.reset = function() {

};

/**
 * add a level  
 * @ignore 
 * @param {type} level 
 */
me.levelDirector.addLevel = function(level) {
    throw "melonJS: no level loader defined";
};

/** 
 * add a TMX level   
 * @param {type} levelId
 * @param {type} callback
 * @returns {Boolean}
 */
me.levelDirector.addTMXLevel = function(levelId, callback) {
    // just load the level with the XML stuff
    if (me.levelDirector.levels[levelId] === undefined) {
        //console.log("loading "+ levelId);
        me.levelDirector.levels[levelId] = new me.TMXTileMap(levelId);
        // set the name of the level
        me.levelDirector.levels[levelId].name = levelId;
        // level index
        me.levelDirector.levelIdx.push(levelId);
    }
    else {
        //console.log("level %s already loaded", levelId);
        return false;
    }

    // call the callback if defined
    if (callback) {
        callback();
    }
    // true if level loaded
    return true;
};

/**
 * load a level into the game manager<br>
 * (will also create all level defined entities, etc..)
 * @name loadLevel
 * @memberOf me.levelDirector
 * @public
 * @function
 * @param {String} levelId level level id
 * @example
 * // the game defined ressources
 * // to be preloaded by the loader
 * // TMX maps
 * ...
 * {name: "a4_level1",   type: "tmx",   src: "data/level/a4_level1.tmx"},
 * {name: "a4_level2",   type: "tmx",   src: "data/level/a4_level2.tmx"},
 * {name: "a4_level3",   type: "tmx",   src: "data/level/a4_level3.tmx"},
 * ...
 * ...
 * // load a level
 * me.levelDirector.loadLevel("a4_level1");
 */
me.levelDirector.loadLevel = function(levelId) {
    // make sure it's a string
    levelId = levelId.toString().toLowerCase();
    // throw an exception if not existing
    if (me.levelDirector.levels[levelId] === undefined) {
        throw ("melonJS: level " + levelId + " not found");
    }

    if (me.levelDirector.levels[levelId] instanceof me.TMXTileMap) {

        // check the status of the state mngr
        var wasRunning = me.state.isRunning();

        if (wasRunning) {
            // stop the game loop to avoid 
            // some silly side effects
            me.state.stop();
        }

        // reset the gameObject Manager (just in case!)
        me.game.reset();

        // reset the GUID generator
        // and pass the level id as parameter
        me.utils.resetGUID(levelId);

        // reset the current (previous) level
        if (me.levelDirector.levels[me.levelDirector.getCurrentLevelId()]) {
            me.levelDirector.levels[me.levelDirector.getCurrentLevelId()].reset();
        }

        // read the map data
        me.mapReader.readMap(me.levelDirector.levels[levelId]);

        // update current level index
        me.levelDirector.currentLevelIdx = me.levelDirector.levelIdx.indexOf(levelId);

        // add the specified level to the game manager
        me.game.loadTMXLevel(me.levelDirector.levels[levelId]);

        if (wasRunning) {
            // resume the game loop if it was
            // previously running
            me.state.restart.defer();
        }
    } else {
        throw "melonJS: no level loader defined";
    }
    return true;
};

/**
 * return the current level id<br>
 * @name getCurrentLevelId
 * @memberOf me.levelDirector
 * @public
 * @function
 * @return {String}
 */
me.levelDirector.getCurrentLevelId = function() {
    return me.levelDirector.levelIdx[me.levelDirector.currentLevelIdx];
};

/**
 * reload the current level<br>
 * @name reloadLevel
 * @memberOf me.levelDirector
 * @public
 * @function
 */
me.levelDirector.reloadLevel = function() {
    // reset the level to initial state
    //levels[currentLevel].reset();
    return me.levelDirector.loadLevel(me.levelDirector.getCurrentLevelId());
};

/**
 * load the next level<br>
 * @name nextLevel
 * @memberOf me.levelDirector
 * @public
 * @function
 */
me.levelDirector.nextLevel = function() {
    //go to the next level 
    if (me.levelDirector.currentLevelIdx + 1 < me.levelDirector.levelIdx.length) {
        return me.levelDirector.loadLevel(me.levelDirector.levelIdx[me.levelDirector.currentLevelIdx + 1]);
    } else {
        return false;
    }
};

/**
 * load the previous level<br>
 * @name previousLevel
 * @memberOf me.levelDirector
 * @public
 * @function
 */
me.levelDirector.previousLevel = function() {
    // go to previous level
    if (me.levelDirector.currentLevelIdx - 1 >= 0) {
        return me.levelDirector.loadLevel(me.levelDirector.levelIdx[me.levelDirector.currentLevelIdx - 1]);
    } else {
        return false;
    }
};

/**
 * return the amount of level preloaded<br>
 * @name levelCount
 * @memberOf me.levelDirector
 * @public
 * @function
 */
me.levelDirector.levelCount = function() {
    return me.levelDirector.levelIdx.length;
};