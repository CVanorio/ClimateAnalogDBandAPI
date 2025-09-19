
// src/routes/admin.routes.js
const express = require('express');
const router = express.Router();

const {
  addCounty,
  addState,
  getAllCounties,
  getCountyById,
} = require('../controllers/admin.controller');

// Add county
router.post('/addcounty/:countyID/:countyName/:stateCode/:lat/:long', addCounty);

// Add state
router.post('/addstate/:StateCode/:StateAbbr/:StateName', addState);

// Get all counties
router.get('/getcounties', getAllCounties);

// Get a county by ID
router.get('/getcounty/:CountyID', getCountyById);

module.exports = router;
