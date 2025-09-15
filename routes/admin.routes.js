/**
 * Routes: Admin
 * POST /addcounty/:countyID/:countyName/:stateCode/:lat/:long
 * POST /addstate/:StateCode/:StateAbbr/:StateName
 * GET  /getcounties
 * GET  /getcounty/:CountyID
 */
const { Router } = require('express');
const {
  addCounty,
  addState,
  getCounties,
  getCountyById,
} = require('../src/controllers/admin.controller');

const router = Router();

router.post('/addcounty/:countyID/:countyName/:stateCode/:lat/:long', addCounty);
router.post('/addstate/:StateCode/:StateAbbr/:StateName', addState);
router.get('/getcounties', getCounties);
router.get('/getcounty/:CountyID', getCountyById);

module.exports = router;
