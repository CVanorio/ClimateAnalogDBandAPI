/**
 * Controller: Data ingestion endpoint (/addallcountydata).
 * Preserves orchestration of NOAA fetch + parse + distance calculations.
 */
const { getLatestNOAAFileLinks, fetchDataFromAPI } = require('../services/noaa.service');
const { calculateAndInsertEuclideanDistances } = require('../services/distances.service'); // <-- fixed path

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

    res.send('All county data added successfully.');
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
