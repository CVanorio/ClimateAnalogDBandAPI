/**
 * Routes: Ingestion
 * GET /addallcountydata
 */
const { Router } = require('express');
const { addAllCountyData } = require('../src/controllers/ingest.controller');

const router = Router();

router.get('/addallcountydata', addAllCountyData);

module.exports = router;
