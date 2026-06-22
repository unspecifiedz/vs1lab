// File origin: VS1LAB A2

/* eslint-disable no-unused-vars */

// This script is executed when the browser loads index.html.

// "console.log" writes to the browser's console. 
// The console window must be opened explicitly in the browser.
// Try to find this output in the browser...
console.log("The geoTagging script is going to start...");

// A4: Eine gemeinsame MapManager-Instanz für alle Funktionen. Die Karte
// wird nur EINMAL erstellt (initMap), danach werden nur noch Marker
// aktualisiert. Verhindert den Leaflet-Fehler "Map container is already
// initialized" bei wiederholten Suchen/Taggings.
let mapManager = null;

// Here the API used for geolocations is selected
// The following declaration is a 'mockup' that always works and returns a fixed position.
var GEOLOCATION_API = {
    getCurrentPosition: function(onsuccess) {
        onsuccess({
            "coords": {
                "latitude": 49.013790,
                "longitude": 8.390071,
                "altitude": null,
                "accuracy": 39,
                "altitudeAccuracy": null,
                "heading": null,
                "speed": null
            },
            "timestamp": 1775140116396
        });
    }
};

// This is the real API.
// If there are problems with it, comment out the line.
GEOLOCATION_API = navigator.geolocation;

/**
 * Updates UI elements (forms, map, removes placeholder) with given coordinates.
 */
function updateUI(latitude, longitude) {
    // Tagging-Form
    document.getElementById("tag-latitude").value = latitude;
    document.getElementById("tag-longitude").value = longitude;

    // Discovery-Form (hidden inputs)
    document.getElementById("discovery-latitude").value = latitude;
    document.getElementById("discovery-longitude").value = longitude;

    // Map
    // A4: Karte nur beim ersten Mal initialisieren (mapManager noch null).
    // Bei späteren Aufrufen wird der Block übersprungen, da die globale
    // Instanz schon existiert -> keine doppelte Initialisierung.
    if (mapManager === null) {
        mapManager = new MapManager();
        mapManager.initMap(latitude, longitude);
    }

    // Read taglist from data-tags attribute on #map and parse JSON
    const mapDiv = document.getElementById("map");
    const tagsJson = mapDiv.dataset.tags;
    const tags = tagsJson ? JSON.parse(tagsJson) : [];
    mapManager.updateMarkers(latitude, longitude, tags);

    // Remove placeholder image and span
    const image = document.getElementById("mapView");
    if (image) image.remove();

    const span = document.querySelector("#map span");
    if (span) span.remove();
}

/**
 * TODO: 'updateLocation'
 * A function to retrieve the current location and update the page.
 * It is called once the page has been fully loaded.
 */
// ... your code here ...

function updateLocation() {

    const latInput = document.getElementById("tag-latitude");
        const longInput = document.getElementById("tag-longitude");

        const cachedLat = latInput.value;
        const cachedLong = longInput.value;

        if (cachedLat && cachedLong) {
            updateUI(cachedLat, cachedLong);
        }
        else {
            LocationHelper.findLocation(function(helper) {
                updateUI(helper.latitude, helper.longitude);
            });
        }
}

// A4: Aktualisiert die Anzeige (Ergebnisliste + Karte) clientseitig aus
// einer Tag-Liste, ohne Seiten-Reload. Wird nach Discovery-Suche UND nach
// dem Anlegen eines Tags aufgerufen. In A3 hat das noch der Server per
// EJS gerendert; in A4 baut der Client die <li>-Einträge selbst.
function updateDiscovery(tags) {
    // //Ergebnisliste leeren und pro Tag neu aufbauen (Template-String).
    const list = document.getElementById("discoveryResults");
    list.innerHTML = "";
    
    tags.forEach(tag => {
        list.innerHTML += `<li>${tag.name} (${tag.latitude}, ${tag.longitude}) ${tag.hashtag}</li>`;

    });

     // // Nur die Marker aktualisieren (Karte existiert bereits, s. updateUI)
    const latitude = document.getElementById("tag-latitude").value;
    const longitude = document.getElementById("tag-longitude").value;
    mapManager.updateMarkers(latitude, longitude, tags);

}

// Wait for the page to fully load its DOM content, then call updateLocation
document.addEventListener("DOMContentLoaded", () => {
    updateLocation();
    //alert("Please change the script 'geotagging.js'");

    // MY CHANGES

    // catch tagging form
    // A4: Tagging-Formular abfangen und per AJAX (statt Form-Submit) senden
    const taggingForm = document.getElementById("tag-form");
    taggingForm.addEventListener("submit", async (event) => {
        // // natives Absenden + Page-Reload verhindern.
        event.preventDefault();
        // // HTML5-Formularvalidierung aus A1 erhalten.
        if (!taggingForm.checkValidity()) {
            taggingForm.reportValidity();
            return;
        }
        
        // // Formularfelder einsammeln und in ein Objekt umwandeln.
        const formData = new FormData(taggingForm);
        const data = Object.fromEntries(formData);
        
        try {
            // // Neuen Tag per HTTP POST als JSON an die REST-API senden.
            const response = await fetch("/api/geotags", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            const newTag = await response.json();
            
            // // Nach dem Anlegen die Umgebung des neuen Tags per GET holen
            // (POST liefert nur den einen Tag, updateDiscovery braucht aber
            // eine Liste) und Anzeige aktualisieren.
            const params = new URLSearchParams({
                latitude: newTag.latitude,
                longitude: newTag.longitude
            });
            const listResponse = await fetch(("/api/geotags?" + params.toString()));
            const tags = await listResponse.json();
            updateDiscovery(tags);
        }
        catch (error) {
            console.error("network-error", error);
        }
    });

    // catch discovery form
    // A4: Discovery-Formular abfangen und per AJAX (statt Form-Submit) suchen.
    const discoveryForm = document.getElementById("discoveryFilterForm");
    discoveryForm.addEventListener("submit", async (event) => {
         // // natives Absenden + Page-Reload verhindern, Validierung erhalten.
        event.preventDefault();
        if (!discoveryForm.checkValidity()) {
            discoveryForm.reportValidity();
            return;
        }

        // A4: Formularfelder als Query-Parameter für den GET-Request aufbereiten.
        const formData = new FormData(discoveryForm);
        const data = Object.fromEntries(formData);
        const params = new URLSearchParams(data);
        const url = "/api/geotags?" + params.toString();
        try {
            // // Suche per HTTP GET mit Query-Parametern, Ergebnis ist JSON-Array
            const response = await fetch(url);
            const result = await response.json();
            
            // // Liste + Karte mit den Suchergebnissen aktualisieren
            updateDiscovery(result);
        }
        catch (error){
            console.error("network-error", error)
        }
    });


});