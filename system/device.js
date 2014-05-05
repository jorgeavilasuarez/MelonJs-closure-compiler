
/**
 * A singleton object representing the device capabilities and specific events
 * @namespace me.device
 * @memberOf me
 */
goog.provide('me.device');
goog.require('me.audio');
//goog.require('me.video');
//goog.require('me.save');

// private properties
var accelInitialized = false;
var deviceOrientationInitialized = false;
var devicePixelRatio = null;

/**
 * check the device capapbilities
 * @ignore
 */
me.device._check = function() {

    // detect audio capabilities (should be moved here too)
    me.audio.detectCapabilities();

    // future proofing (MS) feature detection
    navigator.pointerEnabled = navigator.pointerEnabled || navigator.msPointerEnabled;
    navigator.maxTouchPoints = navigator.maxTouchPoints || navigator.msMaxTouchPoints || 0;
    window.gesture = window.gesture || window.MSGesture;

    // detect touch capabilities
    me.device.touch = ('createTouch' in document) || ('ontouchstart' in window) ||
            (navigator.isCocoonJS) || (navigator.maxTouchPoints > 0);

    // detect platform
    me.device.isMobile = me.device.ua.match(/Android|iPhone|iPad|iPod|BlackBerry|Windows Phone|Mobi/i);

    // accelerometer detection
    me.device.hasAccelerometer = (
            (typeof (window.DeviceMotionEvent) !== 'undefined') || (
            (typeof (window.Windows) !== 'undefined') &&
            (typeof (Windows.Devices.Sensors.Accelerometer) === 'function')
            )
            );

    if (window.DeviceOrientationEvent) {
        me.device.hasDeviceOrientation = true;
    }

    try {
        me.device.localStorage = (typeof window.localStorage !== 'undefined');
    } catch (e) {
        // the above generates an exception when cookies are blocked
        me.device.localStorage = false;
    }
};

// ----- PUBLIC Properties & Functions -----

// Browser capabilities

/**
 * Browser User Agent
 * @type Boolean
 
 * @name ua
 * @memberOf me.device
 */
me.device.ua = navigator.userAgent;
/**
 * Browser Audio capabilities
 * @type Boolean
 
 * @name sound
 * @memberOf me.device
 */
me.device.sound = false;
/**
 * Browser Local Storage capabilities <br>
 * (this flag will be set to false if cookies are blocked) 
 * @type Boolean
 
 * @name localStorage
 * @memberOf me.device
 */
me.device.localStorage = false;
/**
 * Browser accelerometer capabilities
 * @type Boolean
 
 * @name hasAccelerometer
 * @memberOf me.device
 */
me.device.hasAccelerometer = false;

/**
 * Browser device orientation
 * @type Boolean
 
 * @name hasDeviceOrientation
 * @memberOf me.device
 */
me.device.hasDeviceOrientation = false;

/**
 * Browser Base64 decoding capability
 * @type Boolean
 
 * @name nativeBase64
 * @memberOf me.device
 */
me.device.nativeBase64 = (typeof(window.atob) === 'function');

/**
 * Touch capabilities
 * @type Boolean
 
 * @name touch
 * @memberOf me.device
 */
me.device.touch = false;

/**
 * equals to true if a mobile device <br>
 * (Android | iPhone | iPad | iPod | BlackBerry | Windows Phone)
 * @type Boolean
 
 * @name isMobile
 * @memberOf me.device
 */
me.device.isMobile = false;

/**
 * The device current orientation status. <br>
 *   0 : default orientation<br>
 *  90 : 90 degrees clockwise from default<br>
 * -90 : 90 degrees anti-clockwise from default<br>
 * 180 : 180 degrees from default
 * @type Number
 
 * @name orientation
 * @memberOf me.device
 */
me.device.orientation = 0;

/**
 * contains the g-force acceleration along the x-axis.
 * @public
 * @type Number
 
 * @name accelerationX
 * @memberOf me.device
 */
me.device.accelerationX = 0;

/**
 * contains the g-force acceleration along the y-axis.
 * @public
 * @type Number
 
 * @name accelerationY
 * @memberOf me.device
 */
me.device.accelerationY = 0;

/**
 * contains the g-force acceleration along the z-axis.
 * @public
 * @type Number
 
 * @name accelerationZ
 * @memberOf me.device
 */
me.device.accelerationZ = 0;


/**
 * Device orientation Gamma property. Gives angle on tilting a portrait held phone left or right
 * @public
 * @type Number
 
 * @name gamma
 * @memberOf me.device
 */
me.device.gamma = 0;

/**
 * Device orientation Beta property. Gives angle on tilting a portrait held phone forward or backward
 * @public
 * @type Number
 
 * @name beta
 * @memberOf me.device
 */
me.device.beta = 0;

/**
 * Device orientation Alpha property. Gives angle based on the rotation of the phone around its z axis. 
 * The z-axis is perpendicular to the phone, facing out from the center of the screen.
 * @public
 * @type Number
 
 * @name alpha
 * @memberOf me.device
 */
me.device.alpha = 0;

/**
 * return the device pixel ratio
 * @name getPixelRatio
 * @memberOf me.device
 * @function
 */
me.device.getPixelRatio = function() {

    if (devicePixelRatio === null) {
        var _context = me.video.getScreenContext();
        var _devicePixelRatio = window.devicePixelRatio || 1,
                _backingStoreRatio = _context.webkitBackingStorePixelRatio ||
                _context.mozBackingStorePixelRatio ||
                _context.msBackingStorePixelRatio ||
                _context.oBackingStorePixelRatio ||
                _context.backingStorePixelRatio || 1;
        devicePixelRatio = _devicePixelRatio / _backingStoreRatio;
    }
    return devicePixelRatio;
};

/**
 * return the device storage
 * @name getStorage
 * @memberOf me.device
 * @function
 * @param {String} [type="local"]
 * @return me.save object
 */
me.device.getStorage = function(type) {

    type = type || "local";

    switch (type) {
        case "local" :
            return me.save;

        default :
            break;
    }
    throw "melonJS : storage type " + type + " not supported";
};

/**
 * event management (Accelerometer)
 * http://www.mobilexweb.com/samples/ball.html
 * http://www.mobilexweb.com/blog/safari-ios-accelerometer-websockets-html5         
 * @param {type} e
 * @returns {undefined}
 */
function onDeviceMotion(e) {
    if (e.reading) {
        // For Windows 8 devices
        me.device.accelerationX = e.reading.accelerationX;
        me.device.accelerationY = e.reading.accelerationY;
        me.device.accelerationZ = e.reading.accelerationZ;
    } else {
        // Accelerometer information
        me.device.accelerationX = e.accelerationIncludingGravity.x;
        me.device.accelerationY = e.accelerationIncludingGravity.y;
        me.device.accelerationZ = e.accelerationIncludingGravity.z;
    }
}
/**
 * 
 * @param {type} e
 * @returns {undefined}
 */
function onDeviceRotate(e) {
    me.device.gamma = e.gamma;
    me.device.beta = e.beta;
    me.device.alpha = e.alpha;
}

/**
 * watch Accelerator event 
 * @name watchAccelerometer
 * @memberOf me.device
 * @public
 * @function
 * @return {boolean} false if not supported by the device
 */
me.device.watchAccelerometer = function() {
    if (me.device.hasAccelerometer) {
        if (!accelInitialized) {
            if (typeof Windows === 'undefined') {
                // add a listener for the devicemotion event
                window.addEventListener('devicemotion', onDeviceMotion, false);
            } else {
                // On Windows 8 Device
                var accelerometer = Windows.Devices.Sensors.Accelerometer.getDefault();
                if (accelerometer) {
                    // Capture event at regular intervals
                    var minInterval = accelerometer.minimumReportInterval;
                    var Interval = minInterval >= 16 ? minInterval : 25;
                    accelerometer.reportInterval = Interval;

                    accelerometer.addEventListener('readingchanged', onDeviceMotion, false);
                }
            }
            accelInitialized = true;
        }
        return true;
    }
    return false;
};

/**
 * unwatch Accelerometor event 
 * @name unwatchAccelerometer
 * @memberOf me.device
 * @public
 * @function
 */
me.device.unwatchAccelerometer = function() {
    if (accelInitialized) {
        if (typeof Windows === 'undefined') {
            // add a listener for the mouse
            window.removeEventListener('devicemotion', onDeviceMotion, false);
        } else {
            // On Windows 8 Devices
            var accelerometer = Windows.Device.Sensors.Accelerometer.getDefault();

            accelerometer.removeEventListener('readingchanged', onDeviceMotion, false);
        }
        accelInitialized = false;
    }
};

/**
 * watch the device orientation event 
 * @name watchDeviceOrientation
 * @memberOf me.device
 * @public
 * @function
 * @return {boolean} false if not supported by the device
 */
me.device.watchDeviceOrientation = function() {
    if (me.device.hasDeviceOrientation && !deviceOrientationInitialized) {
        window.addEventListener('deviceorientation', onDeviceRotate, false);
        deviceOrientationInitialized = true;
    }
    return false;
};

/**
 * unwatch Device orientation event 
 * @name unwatchDeviceOrientation
 * @memberOf me.device
 * @public
 * @function
 */
me.device.unwatchDeviceOrientation = function() {
    if (deviceOrientationInitialized) {
        window.removeEventListener('deviceorientation', onDeviceRotate, false);
        deviceOrientationInitialized = false;
    }
};
