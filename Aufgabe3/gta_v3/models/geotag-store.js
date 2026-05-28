// File origin: VS1LAB A3

/**
 * This script is a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * A class for in-memory-storage of geotags
 * 
 * Use an array to store a multiset of geotags.
 * - The array must not be accessible from outside the store.
 * 
 * Provide a method 'addGeoTag' to add a geotag to the store.
 * 
 * Provide a method 'removeGeoTag' to delete geo-tags from the store by name.
 * 
 * Provide a method 'getNearbyGeoTags' that returns all geotags in the proximity of a location.
 * - The location is given as a parameter.
 * - The proximity is computed by means of a radius around the location.
 * 
 * Provide a method 'searchNearbyGeoTags' that returns all geotags in the proximity of a location that match a keyword.
 * - The proximity constrained is the same as for 'getNearbyGeoTags'.
 * - Keyword matching should include partial matches from name or hashtag fields. 
 */
class InMemoryGeoTagStore{

    // TODO: ... your code here ...

    #geoTagStore = []

    #distance(lat_1, long_1, lat_2, long_2) {
        return Math.sqrt(
            (lat_1 - lat_2) * (lat_1 - lat_2) +
            (long_1 - long_2) * (long_1 - long_2)  
        );
    }

    addGeoTag(geoTag) {
        this.#geoTagStore.push(geoTag);
    }

    removeGeoTag(name) {
        const idx = this.#geoTagStore.findIndex(t => t.name === name)
        if (idx !== -1) {
            this.#geoTagStore.splice(idx, 1)
        }
    }

    getNearbyGeoTags(location, radius = 0.03) {
        return this.#geoTagStore.filter(
            t => this.#distance(t.latitude, t.longitude, location.latitude, location.longitude) < radius);

    }

    searchNearbyGeoTags(location, radius = 0.03, keyword = "") {
        const lowerKeyword = keyword.toLowerCase();
        return this.#geoTagStore.filter(
            t => this.#distance(t.latitude, t.longitude, location.latitude, location.longitude) < radius
                && (t.name.toLowerCase().includes(lowerKeyword)
                    || t.hashtag.toLowerCase().includes(lowerKeyword))
        );

    }

}
module.exports = InMemoryGeoTagStore
