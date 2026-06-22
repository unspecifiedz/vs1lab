// File origin: VS1LAB A3, A4

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
 */
// eslint-disable-next-line no-unused-vars
const GeoTag = require('../models/geotag');

/**
 * The module "geotag-store" exports a class GeoTagStore. 
 * It provides an in-memory store for geotag objects.
 */
// eslint-disable-next-line no-unused-vars
const GeoTagStore = require('../models/geotag-store');



// A4: Store einmalig beim Modul-Laden anlegen und mit Beispieldaten füllen.
// Diese eine Instanz wird von allen Routen geteilt und lebt über die
// gesamte Server-Laufzeit (sonst wären Tags nach jedem Request weg).
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

router.get('/', (req, res) => {
  const defaultLocation = {latitude: 49.013790, longitude: 8.404435};
  const nearby = store.getNearbyGeoTags(defaultLocation);
  res.render('index', { 
    taglist: nearby,
    latitude: defaultLocation.latitude,
    longitude: defaultLocation.longitude
    });
});

// API routes (A4)

/**
 * Route '/api/geotags' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the fields of the Discovery form as query.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * As a response, an array with Geo Tag objects is rendered as JSON.
 * If 'searchterm' is present, it will be filtered by search term.
 * If 'latitude' and 'longitude' are available, it will be further filtered based on radius.
 */

// TODO: ... your code here ...
// A4: REST-Route zum Lesen/Suchen der GeoTag-Liste (Container-Ressource).
// Filter kommen als Query-Parameter (req.query), Antwort ist JSON statt HTML.
router.get('/api/geotags', (req, res) => {
  const { searchTerm, latitude, longitude } = req.query;
  //  Query-Werte sind Strings -> parseFloat. Fehlen die Koordinaten
  // (parseFloat -> NaN -> falsy), greift der Default-Standort, damit die
  // Route auch ohne Parameter ein sinnvolles Ergebnis liefert.
  const lat = parseFloat(latitude) || 49.013790;
  const long = parseFloat(longitude) || 8.404435;
  const location = { latitude: lat, longitude: long };

  //  Ohne Suchbegriff "" -> matcht alle Tags (leerer String ist überall enthalten)
  const keyword = searchTerm || "";

  const results = store.searchNearbyGeoTags(location, undefined, keyword);

  res.json(results)
});

/**
 * Route '/api/geotags' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * The URL of the new resource is returned in the header as a response.
 * The new resource is rendered as JSON in the response.
 */

// TODO: ... your code here ...
// A4: REST-Route zum Erstellen eines GeoTags. Tag kommt als JSON im Body
// (geparst durch express.json() in app.js).
router.post('/api/geotags', (req, res) => {
    // 1. User hat Formular abgeschickt. req.body enthält alle Formularfelder.
    //    Pack sie in vier einzelne Variablen.
    const { latitude, longitude, name, hashtag } = req.body;
    
    // 2. Bau einen neuen GeoTag aus den Daten. Reihenfolge beachten.
    const newTag = new GeoTag(latitude, longitude, name, hashtag);
    
    // 3. Pack den neuen Tag in den Store.
    store.addGeoTag(newTag); // setzt die ID am Tag
    
    
    // 6. Render das Template mit der aktualisierten Liste UND den Koordinaten,
    //  REST-Konvention bei Erstellung: Location-Header mit der URL der
    // neuen Ressource + Status 201 (Created), neuer Tag als JSON im Body.
    res.location('/api/geotags/' + newTag.id);
    res.status(201).json(newTag);
});

/**
 * Route '/api/geotags/:id' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * The requested tag is rendered as JSON in the response.
 */

// TODO: ... your code here ...
// A4: REST-Route zum Lesen einer einzelnen Ressource über ihre ID.
// Die ID steckt im URL-Pfad und kommt über req.params.
router.get('/api/geotags/:id', (req, res) => {
  // req.params.id ist String -> parseInt, da der Store mit === (Zahl) vergleicht
  const id = parseInt(req.params.id)
  const results = store.getGeoTagById(id);

  // 404, wenn kein Tag mit dieser ID existiert.
  if (!results) {
    return res.status(404).json({ error: "GeoTag not found" });
  }

  res.json(results)
});

/**
 * Route '/api/geotags/:id' for HTTP 'PUT' requests.
 * (http://expressjs.com/de/4x/api.html#app.put.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 * 
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * Changes the tag with the corresponding ID to the sent value.
 * The updated resource is rendered as JSON in the response. 
 */

// TODO: ... your code here ...
//  REST-Route zum Ändern einer einzelnen Ressource. ID aus dem Pfad
// (req.params), neue Daten als JSON im Body. Antwort: aktualisierter Tag.
router.put('/api/geotags/:id', (req, res) => {

    const { latitude, longitude, name, hashtag } = req.body;
    const id = parseInt(req.params.id);
    const newTag = new GeoTag(latitude, longitude, name, hashtag);
    
    const result = store.updateGeoTag(id, newTag);
    
    // A4: 404, wenn die zu ändernde ID nicht existiert.
    if (!result) {
      return res.status(404).json({ error: "GeoTag-ID not found or GeoTag does not exist"})
    }
    res.json(result);
});

/**
 * Route '/api/geotags/:id' for HTTP 'DELETE' requests.
 * (http://expressjs.com/de/4x/api.html#app.delete.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * Deletes the tag with the corresponding ID.
 * The deleted resource is rendered as JSON in the response.
 */

// TODO: ... your code here ...
// A4: REST-Route zum Löschen einer einzelnen Ressource über ihre ID.
// Kein Body. Antwort: der gelöschte Tag als JSON.
router.delete('/api/geotags/:id', (req, res) => {

  const id = parseInt(req.params.id);
  const result = store.removeGeoTagById(id);

  // 404, wenn die zu löschende ID nicht existiert.
  if (!result) {
    return res.status(404).json({ error: "GeoTag not found, cannot remove"});
  }

  res.json(result);
});

module.exports = router;
