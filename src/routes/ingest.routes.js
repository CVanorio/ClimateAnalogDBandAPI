// src/routes/ingest.routes.js
const express = require('express');
const router = express.Router();
const { addAllCountyData } = require('../controllers/ingest.controller');

// Add all county data
router.get('/addallcountydata', addAllCountyData);

module.exports = router;
