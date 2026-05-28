// File origin: VS1LAB A2

/* eslint-disable no-unused-vars */

// This script is executed when the browser loads index.html.

// "console.log" writes to the browser's console. 
// The console window must be opened explicitly in the browser.
// Try to find this output in the browser...
console.log("The geoTagging script is going to start...");

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
//GEOLOCATION_API = navigator.geolocation;

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
    const mapManager = new MapManager();
    mapManager.initMap(latitude, longitude);

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

// Wait for the page to fully load its DOM content, then call updateLocation
document.addEventListener("DOMContentLoaded", () => {
    updateLocation();
    //alert("Please change the script 'geotagging.js'");


});