/**
 * NOAA data service: discover latest files, fetch and dispatch parsing.
 * 
 */
const axios = require('axios');
const cheerio = require('cheerio');

const { BASE_URL } = require('../config/constants');
const { parseAndInsertAllNormsAndTargetStateData } = require('./parse.service');

/**
 * Scrape NOAA directory to find latest temp & precip county files.
 */
async function getLatestNOAAFileLinks() {
  function extractDateFromFilename(filename) {
    const match = filename.match(/(\d{8})$/);
    return match ? match[1] : null;
  }

  try {
    const { data } = await axios.get(BASE_URL);
    const $ = cheerio.load(data);

    const tempFiles = [];
    const precipFiles = [];

    $('a').each((i, elem) => {
      const href = $(elem).attr('href');
      const date = extractDateFromFilename(href);
      if (!date) return;

      if (href.startsWith('climdiv-tmpccy-v')) tempFiles.push({ filename: href, date });
      else if (href.startsWith('climdiv-pcpncy-v')) precipFiles.push({ filename: href, date });
    });

    if (!tempFiles.length || !precipFiles.length) {
      throw new Error('NOAA file links not found.');
    }

    const latestTemp   = tempFiles.sort((a, b) => b.date.localeCompare(a.date))[0];
    const latestPrecip = precipFiles.sort((a, b) => b.date.localeCompare(a.date))[0];

    return { tempURL: BASE_URL + latestTemp.filename, precipURL: BASE_URL + latestPrecip.filename };
  } catch (err) {
    console.error('Error fetching NOAA links:', err.message);
    throw err;
  }
}

/**
 * Fetch a file and parse+insert to DB for the given scale.
 */
async function fetchDataFromAPI(url, scale) {
  try {
    const response = await axios.get(url);
    const data = response.data;
    let result = null;

    if (scale === 'County') {
      result = await parseAndInsertAllNormsAndTargetStateData(data);
    } else if (scale === 'Grid') {
      // (future grid support)
    }

    if (result.success) {
      return { success: true, data };
    } else {
      return { success: false, error: `Error parsing and inserting ${scale} data: ${result.error}` };
    }
  } catch (error) {
    console.error(`Error fetching ${scale} data from API:`, error);
    return { success: false, error: `Error fetching ${scale} data from API: ${error.message}` };
  }
}

module.exports = {
  getLatestNOAAFileLinks,
  fetchDataFromAPI,
};
