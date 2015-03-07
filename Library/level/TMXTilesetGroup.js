goog.provide('me.TMXTilesetGroup');
//goog.require('goog.object');

/**
 * an object containing all tileset
 * @class
 * @memberOf me
 * @constructor
 */
me.TMXTilesetGroup = function() {
    this.tilesets = [];
};
//goog.inherits(me.TMXTilesetGroup, goog.object);

/**
 * add a tileset to the tileset group
 * @param {Object} tileset 
 * */
me.TMXTilesetGroup.prototype.add = function(tileset) {
    this.tilesets.push(tileset);
};

/**
 * return the tileset at the specified index
 * @param {Object} i 
 */
me.TMXTilesetGroup.prototype.getTilesetByIndex = function(i) {
    return this.tilesets[i];
};

/**
 * return the tileset corresponding to the specified id <br>
 * will throw an exception if no matching tileset is found
 * @name me.TMXTilesetGroup#getTilesetByGid
 * @public
 * @function
 * @param {Integer} gid 
 * @return {me.TMXTileset} corresponding tileset
 */
me.TMXTilesetGroup.prototype.getTilesetByGid = function(gid) {
    var invalidRange = -1;
    // cycle through all tilesets
    for (var i = 0, len = this.tilesets.length; i < len; i++) {
// return the corresponding tileset if matching
        if (this.tilesets[i].contains(gid))
            return this.tilesets[i];
        // typically indicates a layer with no asset loaded (collision?)
        if (this.tilesets[i].firstgid === this.tilesets[i].lastgid) {
            if (gid >= this.tilesets[i].firstgid)
                // store the id if the [firstgid .. lastgid] is invalid
                invalidRange = i;
        }
    }
// return the tileset with the invalid range
    if (invalidRange !== -1)
        return this.tilesets[invalidRange];
    else
        throw "no matching tileset found for gid " + gid;
};