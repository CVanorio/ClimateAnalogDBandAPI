/**
 * Routes: Ingestion
 * GET /addallcountydata
 */
const { Router } = require('express');
const { addAllCountyData } = require('../controllers/ingest.controller');

const router = Router();

router.get('/addallcountydata', addAllCountyData);

module.exports = router;
