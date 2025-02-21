const express = require('express');
const router = express.Router();
const analyzeController = require('../controllers/analyzeAreaController');
const { getUserTrips } = require("../controllers/tripFetchController"); // Adjust path if necessary

// New endpoint for area analysis between two coordinates
// router.get('/analyzeArea/:source/:destination/:date', analyzeController.getDataFromGemini);
router.get('/analyzeArea/:userId/:source/:destination/:date', analyzeController.getDataFromGemini);
router.get('/fetchtrip/:userId', getUserTrips);


module.exports = router;