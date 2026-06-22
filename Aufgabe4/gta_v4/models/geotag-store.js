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

    #geoTagStore = [];
    // A4: Counter für eindeutige Primärschlüssel. Jeder neue GeoTag bekommt
    // die nächste freie ID; der Counter zählt nur hoch und vergibt IDs nie
    // erneut, damit jede ID über die Server-Laufzeit eindeutig bleibt.
    #nextID = 1;    

    #distance(lat_1, long_1, lat_2, long_2) {
        return Math.sqrt(
            (lat_1 - lat_2) * (lat_1 - lat_2) +
            (long_1 - long_2) * (long_1 - long_2)  
        );
    }

    addGeoTag(geoTag) {
        // A4: Primärschlüssel vergeben, bevor der Tag gespeichert wird.
        // Das Objekt wird editiert -> Aufrufer hat danach die ID am Tag
        // (z.B. für den Location-Header der POST-Route).
        geoTag.id = this.#nextID;
        this.#nextID++;
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
    


    // A4: ID-basierte Methoden für die REST-API (GET/PUT/DELETE auf /:id)

    //  Liefert den GeoTag mit der ID oder undefined, wenn keiner existiert.
    // .find gibt das erste passende Element zurück (undefined bei Nichtfund).
    getGeoTagById(id) {
        return this.#geoTagStore.find(t => t.id === id);
    }

    // A4: Ersetzt den GeoTag mit der ID durch newGeoTag. Die ID bleibt
    // stabil (wird auf das neue Objekt übertragen). Rückgabe: aktualisierter
    // Tag, oder undefined wenn die ID nicht existiert.
    updateGeoTag(id, newGeoTag) {
        const idx = this.#geoTagStore.findIndex(t => t.id === id);
        if (idx === -1) return undefined;
        newGeoTag.id = id;
        this.#geoTagStore[idx] = newGeoTag;
        return newGeoTag;
    }

    // A4: Löscht den GeoTag mit der ID und gibt ihn zurück (undefined bei
    // Nichtfund). .splice liefert das array mit den entfernten elementen die man hier als parameter mitgibt,
    // daher die Destrukturierung [removed].
    removeGeoTagById(id) {
        const idx = this.#geoTagStore.findIndex(t => t.id === id);
        if (idx === -1) return undefined;
        const[removed] = this.#geoTagStore.splice(idx, 1);
        return removed;
    }

}
module.exports = InMemoryGeoTagStore
