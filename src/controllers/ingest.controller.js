/**
 * Controller: Data ingestion endpoint (/addallcountydata).
 * 
 */
const { fetchDataFromAPI } = require('../services/noaa.service');
const { calculateAndInsertEuclideanDistances } = require('../services/distances.service');
const { getLatestNOAAFileLinks } = require('../cron/syncData');

async function addAllCountyData(req, res) {
  try {
    let preciptResult = null;
    let tempResult = null;
    let distanceResult = null;

    const { tempURL, precipURL } = await getLatestNOAAFileLinks();

    await Promise.all([
      (preciptResult = fetchDataFromAPI(precipURL, 'County')),
      (tempResult = fetchDataFromAPI(tempURL, 'County')),
    ]);

    console.log('Calculating distances');
    distanceResult = await calculateAndInsertEuclideanDistances();

    if (!distanceResult.success) {
      // bubble up the proper HTTP status + error payload
      return res.status(distanceResult.status || 500).json(distanceResult);
    }

    // success
    return res.status(200).send('All county data added successfully.');
    
  } catch (error) {
    if (error.response) {
      console.error('Error response from server:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up the request:', error.message);
    }
    console.error('Error details:', error.config);
    res.status(500).send('Error adding county data.');
  }
}

module.exports = { addAllCountyData };
