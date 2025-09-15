/**
 * Routes: Data (frontend consumption)
 * GET /getData
 */
const { Router } = require('express');
const { getData } = require('../controllers/data.controller');

const router = Router();

router.get('/getData', getData);

module.exports = router;
