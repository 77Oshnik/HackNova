const express = require('express');
const router = express.Router();
const analyzeController = require('../controllers/analyzeAreaController');

// New endpoint for area analysis between two coordinates
router.get('/analyzeArea/:source/:destination/:date', analyzeController.getDataFromGemini);

module.exports = router;