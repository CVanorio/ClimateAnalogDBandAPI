// src/services/noaa.service.js
////////////////////////////////////////////////////////////////////////////////////////////////////
// NOAA fetch service
// - Responsible for fetching a NOAA file via HTTP and delegating parsing/inserts.
////////////////////////////////////////////////////////////////////////////////////////////////////

const axios = require('axios');
const { parseAndInsertAllNormsAndTargetStateData } = require('./parse.service');

/**
 * Function to fetch data from the API (verbatim from original code)
 * @param {string} url
 * @param {'County'|'Grid'} scale
 * @returns {{success:boolean, data?:any, error?:string}}
 */
async function fetchDataFromAPI(url, scale) {
  try {
    console.log("in fetchDataFromAPI");
    var response = await axios.get(url);
    var data = response.data;
    var result = null;

    // Parse and insert data into the database based on scale
    if (scale === 'County') {
      result = await parseAndInsertAllNormsAndTargetStateData(data);
    } else if (scale === 'Grid') {
      // Implement parsing and storing for grid data if needed
    }

    // Return the result from parseAndInsertAllNormsAndWIData
    if (result && result.success) {
      return {
        success: true,
        data: data,
      };
    } else {
      return {
        success: false,
        error: `Error parsing and inserting ${scale} data: ${result ? result.error : 'Unknown error'}`,
      };
    }
  } catch (error) {
    console.error(`Error fetching ${scale} data from API:`, error);
    return {
      success: false,
      error: `Error fetching ${scale} data from API: ${error.message}`,
    };
  }
}

module.exports = {
  fetchDataFromAPI,
};
