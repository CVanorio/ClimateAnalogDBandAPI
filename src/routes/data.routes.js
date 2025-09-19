
// src/routes/data.routes.js
const express = require('express');
const router = express.Router();
const { getData } = require('../controllers/data.controller');

// Central endpoint to handle all data requests
router.get('/getData', getData);

module.exports = router;
