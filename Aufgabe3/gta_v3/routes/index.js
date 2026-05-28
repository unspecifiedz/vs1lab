// File origin: VS1LAB A3

/**
 * This script defines the main router of the GeoTag server.
 * It's a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * Define module dependencies.
 */

const express = require('express');
const router = express.Router();

/**
 * The module "geotag" exports a class GeoTagStore. 
 * It represents geotags.
 * 
 * TODO: implement the module in the file "../models/geotag.js"
 */
// eslint-disable-next-line no-unused-vars
const GeoTag = require('../models/geotag');

/**
 * The module "geotag-store" exports a class GeoTagStore. 
 * It provides an in-memory store for geotag objects.
 * 
 * TODO: implement the module in the file "../models/geotag-store.js"
 */
// eslint-disable-next-line no-unused-vars
const GeoTagStore = require('../models/geotag-store');

const GeoTagExamples = require('../models/geotag-examples');

const store = new GeoTagStore();
GeoTagExamples.tagList.forEach(entry => {
  const [name, latitude, longitude, hashtag] = entry;
  store.addGeoTag(new GeoTag(latitude, longitude, name, hashtag));
});

/**
 * Route '/' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests cary no parameters
 *
 * As response, the ejs-template is rendered without geotag objects.
 */

// TODO: extend the following route example if necessary
router.get('/', (req, res) => {
  const defaultLocation = {latitude: 49.013790, longitude: 8.404435};
  const nearby = store.getNearbyGeoTags(defaultLocation);
  res.render('index', { 
    taglist: nearby,
    latitude: defaultLocation.latitude,
    longitude: defaultLocation.longitude
    });
});

/**
 * Route '/tagging' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests cary the fields of the tagging form in the body.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Based on the form data, a new geotag is created and stored.
 *
 * As response, the ejs-template is rendered with geotag objects.
 * All result objects are located in the proximity of the new geotag.
 * To this end, "GeoTagStore" provides a method to search geotags 
 * by radius around a given location.
 */

// TODO: ... your code here ...

router.post('/tagging', (req, res) => {
    // 1. User hat Formular abgeschickt. req.body enthält alle Formularfelder.
    //    Pack sie in vier einzelne Variablen.
    const { latitude, longitude, name, hashtag } = req.body;
    
    // 2. Bau einen neuen GeoTag aus den Daten. Konstruktor-Reihenfolge beachten.
    const newTag = new GeoTag(latitude, longitude, name, hashtag);
    
    // 3. Pack den neuen Tag in den Store.
    store.addGeoTag(newTag);
    
    // 4. Bau ein Location-Objekt für die Suche (mit Shorthand).
    const location = { latitude, longitude };
    
    // 5. Hol alle Tags in der Nähe — inklusive dem gerade hinzugefügten.
    const nearby = store.getNearbyGeoTags(location);
    
    // 6. Render das Template mit der aktualisierten Liste UND den Koordinaten,
    //    damit das Template die Inputs mit den Werten vorbefüllen kann.
    res.render('index', {
        taglist: nearby,
        latitude: latitude,
        longitude: longitude
    });
});

/**
 * Route '/discovery' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests cary the fields of the discovery form in the body.
 * This includes coordinates and an optional search term.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * As response, the ejs-template is rendered with geotag objects.
 * All result objects are located in the proximity of the given coordinates.
 * If a search term is given, the results are further filtered to contain 
 * the term as a part of their names or hashtags. 
 * To this end, "GeoTagStore" provides methods to search geotags 
 * by radius and keyword.
 */

// TODO: ... your code here ...

router.post('/discovery', (req, res) => {
  const { searchTerm, latitude, longitude } = req.body;

  const location = { longitude, latitude };
  const results = store.searchNearbyGeoTags(location, undefined, searchTerm);

  res.render('index', {
    taglist: results,
    latitude: latitude,
    longitude: longitude
  });
});

module.exports = router;
