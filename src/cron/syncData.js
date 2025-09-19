/**
 * Cron job to check NOAA site daily for updated files
 * and trigger /addallcountydata if new data is available.
 */
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

// Track the last processed NOAA file dates (persisted JSON in repo root)
const TRACK_FILE = path.join(__dirname, '../../lastNoaaFile.json');
// Public directory listing for NCEI nclimdiv monthly access files
const BASE_URL = 'https://www.ncei.noaa.gov/data/nclimdiv-monthly/access/';

// Filenames end with an 8-digit yyyymmdd stamp, extract that.
function extractDateFromFilename(filename) {
  const match = filename.match(/(\d{8})$/);
  return match ? match[1] : null;
}

// Reduce yyyymmdd → yyyymm so we only process once per month.
function extractMonth(dateStr) {
  return dateStr?.slice(0, 6); // e.g., '202506' from '20250606'
}

async function getLatestNOAAFileLinks() {
  try {
    // Fetch directory HTML and scrape anchors with cheerio
    const { data } = await axios.get(BASE_URL);
    const $ = cheerio.load(data);

    const tempFiles = [];
    const precipFiles = [];

    $('a').each((i, elem) => {
      const href = $(elem).attr('href');
      const date = extractDateFromFilename(href);
      if (!date) return;

      // Partition by variable type
      if (href.startsWith('climdiv-tmpccy-v1.0.0-')) {
        tempFiles.push({ filename: href, date });
      } else if (href.startsWith('climdiv-pcpncy-v1.0.0-')) {
        precipFiles.push({ filename: href, date });
      }
    });

    if (!tempFiles.length || !precipFiles.length) {
      throw new Error('No NOAA data files found.');
    }

    // Pick the max date per type, in the case multiple files exist
    const latestTemp = tempFiles.sort((a, b) => b.date.localeCompare(a.date))[0];
    const latestPrecip = precipFiles.sort((a, b) => b.date.localeCompare(a.date))[0];

    return {
      tempFilename: latestTemp.filename,
      precipFilename: latestPrecip.filename,
      tempDate: latestTemp.date,
      precipDate: latestPrecip.date,
      tempURL: BASE_URL + latestTemp.filename,
      precipURL: BASE_URL + latestPrecip.filename,
    };
  } catch (err) {
    console.error('Error fetching NOAA links:', err.message);
    throw err;
  }
}

// Read lastNoaaFile.json; default to nulls if not present.
function loadLastCheckedDate() {
  if (fs.existsSync(TRACK_FILE)) {
    const data = fs.readFileSync(TRACK_FILE, 'utf8');
    return JSON.parse(data);
  }
  return { temp: null, precip: null };
}

// Persist the latest processed yyyymmdd for both variables.
function saveLastCheckedDate(tempDate, precipDate) {
  fs.writeFileSync(TRACK_FILE, JSON.stringify({ temp: tempDate, precip: precipDate }, null, 2));
}

function startNOAACronJob() {
  console.log('Cron job initialized');

  // Run daily at 3AM (server local time).
  cron.schedule('00 03 * * *', async () => {
    console.log('[Cron] Checking for NOAA file updates...');

    // Compute current yyyymm for idempotence (one run per month is enough)
    const today = new Date();
    const currentMonth = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;

    const lastChecked = loadLastCheckedDate();
    // If either temp/precip was processed this month, skip.
    const lastMonthChecked = extractMonth(lastChecked.temp) || extractMonth(lastChecked.precip);

    if (lastMonthChecked === currentMonth) {
      console.log(`[Cron] Already processed NOAA file for ${currentMonth}. Skipping check.`);
      return;
    }

    try {
      const { tempDate, precipDate } = await getLatestNOAAFileLinks();

      const isNewTemp = tempDate && tempDate !== lastChecked.temp;
      const isNewPrecip = precipDate && precipDate !== lastChecked.precip;

      if (isNewTemp || isNewPrecip) {
        try {
          // Call local API (server must be listening) to kick off ingestion
          const port = process.env.PORT || 3000;
          const response = await axios.get(`http://localhost:${port}/addallcountydata`);
          console.log(`/addallcountydata responded with: ${response.status}`);
          // Only advance the tracker if ingestion endpoint succeeded
          if(response.status === 200){
            saveLastCheckedDate(tempDate, precipDate);
          }
          else{
            console.error('Error: /addallcountydata did not complete successfully.');
          }
        } catch (err) {
          console.error('Error calling /addallcountydata:', err.message);
        }
      }
    } catch (err) {
      console.error('Cron job error:', err.message);
    }
  });
}

module.exports = {
  startNOAACronJob,
  getLatestNOAAFileLinks,
};
