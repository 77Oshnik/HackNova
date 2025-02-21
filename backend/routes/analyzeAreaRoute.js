const express = require('express');
const router = express.Router();

const { analyzeArea } = require('../controllers/analyzeAreaController');

router.get('/analyzeArea', analyzeArea);