goog.provide('me.audio');

/**
 * There is no constructor function for me.audio.
 * @namespace me.audio
 * @memberOf me
 */

/*
 * ---------------------------------------------
 * PRIVATE STUFF
 * ---------------------------------------------
 */
// audio channel list
var audioTracks = {};

// unique store for callbacks
var callbacks = {};

// current music
var current_track_id = null;
var current_track_instance = null;

// a retry counter
var retry_counter = 0;

/**
 * event listener callback on load error
 * @param {number} sound_id
 * @param {Function} onerror_cb 
 */
function soundLoadError(sound_id, onerror_cb) {
    // check the retry counter
    if (retry_counter++ > 3) {
        // something went wrong
        var errmsg = "melonJS: failed loading " + sound_id;
        if (me.sys.stopOnAudioError === false) {
            // disable audio
            me.audio.disable();
            // call error callback if defined
            if (onerror_cb) {
                onerror_cb();
            }
            // warning
            console.log(errmsg + ", disabling audio");
        }
        else {
            // throw an exception and stop everything !
            throw errmsg;
        }
        // else try loading again !
    }
    else {
        audioTracks[sound_id].load();
    }
}
/**
 * 
 * @param {number} id 
 */
function setTrackInstance(id) {
    current_track_instance = id;
}

/**
 *  event listener callback on load error
 * @param {Object} sound_id
 * @param {Function} onerror_cb
 * @returns {undefined}
 * @ignore
 */
me.audio.soundLoadError = function(sound_id, onerror_cb) {
    // check the retry counter
    if (retry_counter++ > 3) {
        // something went wrong
        var errmsg = "melonJS: failed loading " + sound_id;
        if (me.sys.stopOnAudioError === false) {
            // disable audio
            me.audio.disable();
            // call error callback if defined
            if (onerror_cb) {
                onerror_cb();
            }
            // warning
            console.log(errmsg + ", disabling audio");
        }
        else {
            // throw an exception and stop everything !
            throw errmsg;
        }
        // else try loading again !
    }
    else {
        audioTracks[sound_id].load();
    }
};

/*
 *---------------------------------------------
 * PUBLIC STUFF
 *---------------------------------------------
 */

/**
 * initialize the audio engine<br>
 * the melonJS loader will try to load audio files corresponding to the
 * browser supported audio format<br>
 * if no compatible audio codecs are found, audio will be disabled
 * @name init
 * @memberOf me.audio
 * @public
 * @function
 * @constructor
 * @param {string}  audioFormat audio format provided ("mp3, ogg, m4a, wav")
 * @example
 * // initialize the "sound engine", giving "mp3" and "ogg" as desired audio format 
 * // i.e. on Safari, the loader will load all audio.mp3 files, 
 * // on Opera the loader will however load audio.ogg files
 * me.audio.init("mp3,ogg"); 
 */
me.audio.init = function(audioFormat) {
    if (!me.initialized) {
        throw "melonJS: me.audio.init() called before engine initialization.";
    }
    // if no param is given to init we use mp3 by default
    audioFormat = typeof audioFormat === "string" ? audioFormat : "mp3";
    // convert it into an array
    me.audio.audioFormats = audioFormat.split(",");
};

/**
 * enable audio output <br>
 * only useful if audio supported and previously disabled through
 * audio.disable()
 * 
 * @see me.audio#disable
 * @name enable
 * @memberOf me.audio
 * @public
 * @function
 */
me.audio.enable = function() {
    me.audio.unmuteAll();
};

/**
 * disable audio output
 * 
 * @name disable
 * @memberOf me.audio
 * @public
 * @function
 */
me.audio.disable = function() {
    me.audio.muteAll();
};

/**
 * Load an audio file.<br>
 * <br>
 * sound item must contain the following fields :<br>
 * - name    : id of the sound<br>
 * - src     : source path<br>
 * - channel : [Optional] number of channels to allocate<br>
 * - stream  : [Optional] boolean to enable streaming<br>
 * @ignore
 * @param {Object} sound
 * @param {Object} onload_cb
 * @param {Object} onerror_cb
 * @returns {number}
 */
me.audio.load = function(sound, onload_cb, onerror_cb) {
    var urls = [];
    for (var i = 0; i < me.audio.audioFormats.length; i++) {
        urls.push(sound.src + sound.name + "." + me.audio.audioFormats[i] + me.loader.nocache);
    }
    var soundclip = new window.Howl({
        urls: urls,
        volume: window.Howler.volume(),
        onend: function(soundId) {
            if (callbacks[soundId]) {
                // fire call back if it exists, then delete it
                callbacks[soundId]();
                callbacks[soundId] = null;
            }
        },
        onloaderror: function() {
            soundLoadError.call(me.audio, sound.name, onerror_cb);
        },
        onload: function() {
            retry_counter = 0;
            if (onload_cb) {
                onload_cb();
            }
        }
    });

    audioTracks[sound.name] = soundclip;

    return 1;
};

me.auio.play = function(sound_id, loop, callback, volume) {
    var sound = audioTracks[sound_id.toLowerCase()];
    if (sound && typeof sound !== "undefined") {
        sound.loop(loop || false);
        sound.volume(typeof(volume) === "number" ? volume.clamp(0.0, 1.0) :window.Howler.volume());
        sound.play(null, callback);
        return sound;
    }
};

/**
 * stop the specified sound on all channels
 * 
 * @name stop
 * @memberOf me.audio
 * @public
 * @function
 * @param {string} sound_id audio clip id
 * @example
 * me.audio.stop("cling");
 */
me.audio.stop = function(sound_id,instance_id) {
    var sound = audioTracks[sound_id.toLowerCase()];
    if (sound && typeof sound !== "undefined") {
        sound.stop(instance_id);
    }
};

/**
 * pause the specified sound on all channels<br>
 * this function does not reset the currentTime property
 * 
 * @name pause
 * @memberOf me.audio
 * @public
 * @function
 * @param {string} sound_id audio clip id
 * @example
 * me.audio.pause("cling");
 */
me.audio.pause = function(sound_id, instance_id) {
    var sound = audioTracks[sound_id.toLowerCase()];
    if (sound && typeof sound !== "undefined") {
        sound.pause(instance_id);
    }
};

/**
 * play the specified audio track<br>
 * this function automatically set the loop property to true<br>
 * and keep track of the current sound being played.
 * 
 * @name playTrack
 * @memberOf me.audio
 * @public
 * @function
 * @param {string} sound_id audio track id
 * @param {number} [volume=default] Float specifying volume (0.0 - 1.0 values accepted).
 * @example
 * me.audio.playTrack("awesome_music");
 */
me.audio.playTrack = function(sound_id, volume) {
    current_track_id = sound_id.toLowerCase();
    return me.audio.play(
            current_track_id,
            true,
            navigator.isCocoonJS && (!window.Howler.usingWebAudio) ? setTrackInstance : undefined,
            volume
            );
};

/**
 * stop the current audio track
 * 
 * @see me.audio#playTrack
 * @name stopTrack
 * @memberOf me.audio
 * @public
 * @function
 * @example
 * // play a awesome music 
 * me.audio.playTrack("awesome_music"); 
 * // stop the current music 
 * me.audio.stopTrack();
 */
me.audio.stopTrack = function() {
    if (current_track_id !== null) {
        audioTracks[current_track_id].stop(
                navigator.isCocoonJS && (!window.Howler.usingWebAudio) ? current_track_instance : undefined
                );
        current_track_id = null;
    }
};

/**
 * pause the current audio track
 * 
 * @name pauseTrack
 * @memberOf me.audio
 * @public
 * @function
 * @example
 * me.audio.pauseTrack();
 */
me.audio.pauseTrack = function() {
    if (current_track_id !== null) {
        audioTracks[current_track_id].pause(
                navigator.isCocoonJS && (!window.Howler.usingWebAudio) ? current_track_instance : undefined
                );
    }
};

/**
 * resume the previously paused audio track
 * 
 * @name resumeTrack
 * @memberOf me.audio
 * @public
 * @function 
 * @example
 * // play an awesome music 
 * me.audio.playTrack("awesome_music");
 * // pause the audio track 
 * me.audio.pauseTrack();
 * // resume the music 
 * me.audio.resumeTrack();
 */
me.audio.resumeTrack = function() {
    if (current_track_id !== null) {
        audioTracks[current_track_id].play(
                null,
                navigator.isCocoonJS && (!window.Howler.usingWebAudio) ? setTrackInstance : undefined
                );
    }
};

/**
 * returns the current track Id
 * @name getCurrentTrack
 * @memberOf me.audio
 * @public
 * @function
 * @return {string} audio track id
 */
me.audio.getCurrentTrack = function() {
    return current_track_id;
};


/**
 * set the default global volume
 * @name setVolume
 * @memberOf me.audio
 * @public
 * @function
 * @param {number} volume Float specifying volume (0.0 - 1.0 values accepted).
 */
me.audio.setVolume = function(volume) {
   window.Howler.volume(volume);
};

/**
 * get the default global volume
 * @name getVolume
 * @memberOf me.audio
 * @public
 * @function
 * @returns {number} current volume value in Float [0.0 - 1.0] .
 */
me.audio.getVolume = function() {
    return window.Howler.volume();
};

/**
 * mute the specified sound
 * @name mute
 * @memberOf me.audio
 * @public
 * @function
 * @param {Object} mute
 * @param {string} sound_id audio clip id
 */
me.audio.mute = function(sound_id, mute) {
    // if not defined : true
    mute = (typeof(mute) === "undefined" ? true : !!mute);
    var sound = audioTracks[sound_id.toLowerCase()];
    if (sound && typeof(sound) !== "undefined") {
        sound.mute(true);
    }
};

/**
 * unmute the specified sound
 * @name unmute
 * @memberOf me.audio
 * @public
 * @function
 * @param {string} sound_id audio clip id
 */
me.audio.unmute = function(sound_id) {
    me.audio.mute(sound_id, false);
};

/**
 * mute all audio 
 * @name muteAll
 * @memberOf me.audio
 * @public
 * @function
 */
me.audio.muteAll = function() {
   window.Howler.mute();
};

/**
 * unmute all audio 
 * @name unmuteAll
 * @memberOf me.audio
 * @public
 * @function
 */
me.audio.unmuteAll = function() {
   window.Howler.unmute();
};

/**
 * unload specified audio track to free memory
 *
 * @name unload
 * @memberOf me.audio
 * @public
 * @function
 * @param {string} sound_id audio track id
 * @return {boolean} true if unloaded
 * @example
 * me.audio.unload("awesome_music");
 */
me.audio.unload = function(sound_id) {
    sound_id = sound_id.toLowerCase();
    if (!(sound_id in audioTracks)) {
        return false;
    }

    // destroy the Howl object
    audioTracks[sound_id].unload();
    delete audioTracks[sound_id];

    return true;
};

/**
 * unload all audio to free memory
 *
 * @name unloadAll
 * @memberOf me.audio
 * @public
 * @function
 * @example
 * me.audio.unloadAll();
 */
me.audio.unloadAll = function() {
    for (var sound_id in audioTracks) {
        if (audioTracks.hasOwnProperty(sound_id)) {
            me.audio.unload(sound_id);
        }
    }
};