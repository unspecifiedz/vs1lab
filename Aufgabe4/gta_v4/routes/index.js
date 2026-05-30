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

// App routes (A3)
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
router.get('/api/geotags', (req, res) => {
  const { searchTerm, latitude, longitude } = req.query;
  const lat = parseFloat(latitude) || 49.013790;
  const long = parseFloat(longitude) || 8.404435;
  const location = { latitude: lat, longitude: long };

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
router.post('/api/geotags', (req, res) => {
    // 1. User hat Formular abgeschickt. req.body enthält alle Formularfelder.
    //    Pack sie in vier einzelne Variablen.
    const { latitude, longitude, name, hashtag } = req.body;
    
    // 2. Bau einen neuen GeoTag aus den Daten. Reihenfolge beachten.
    const newTag = new GeoTag(latitude, longitude, name, hashtag);
    
    // 3. Pack den neuen Tag in den Store.
    store.addGeoTag(newTag);
    
    
    // 6. Render das Template mit der aktualisierten Liste UND den Koordinaten,
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
router.get('/api/geotags/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const results = store.getGeoTagById(id);

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
router.put('/api/geotags/:id', (req, res) => {

    const { latitude, longitude, name, hashtag } = req.body;
    const id = parseInt(req.params.id);
    const newTag = new GeoTag(latitude, longitude, name, hashtag);
    
    const result = store.updateGeoTag(id, newTag);
    
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

router.delete('/api/geotags/:id', (req, res) => {

  const id = parseInt(req.params.id);
  const result = store.removeGeoTagById(id);

  if (!result) {
    return res.status(404).json({ error: "GeoTag not found, cannot remove"});
  }

  res.json(result);
});

module.exports = router;
