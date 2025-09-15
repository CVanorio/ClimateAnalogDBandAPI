/**
 * Cron job to check NOAA site daily for updated files
 * and trigger /addallcountydata if new data is available.
 */
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const TRACK_FILE = path.join(__dirname, '../../lastNoaaFile.json');
const BASE_URL = 'https://www.ncei.noaa.gov/data/nclimdiv-monthly/access/';

function extractDateFromFilename(filename) {
  const match = filename.match(/(\d{8})$/);
  return match ? match[1] : null;
}

function extractMonth(dateStr) {
  return dateStr?.slice(0, 6); // e.g., '202506' from '20250606'
}

async function getLatestNOAAFileLinks() {
  try {
    const { data } = await axios.get(BASE_URL);
    const $ = cheerio.load(data);

    const tempFiles = [];
    const precipFiles = [];

    $('a').each((i, elem) => {
      const href = $(elem).attr('href');
      const date = extractDateFromFilename(href);
      if (!date) return;

      if (href.startsWith('climdiv-tmpccy-v1.0.0-')) {
        tempFiles.push({ filename: href, date });
      } else if (href.startsWith('climdiv-pcpncy-v1.0.0-')) {
        precipFiles.push({ filename: href, date });
      }
    });

    if (!tempFiles.length || !precipFiles.length) {
      throw new Error('No NOAA data files found.');
    }

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

function loadLastCheckedDate() {
  if (fs.existsSync(TRACK_FILE)) {
    const data = fs.readFileSync(TRACK_FILE, 'utf8');
    return JSON.parse(data);
  }
  return { temp: null, precip: null };
}

function saveLastCheckedDate(tempDate, precipDate) {
  fs.writeFileSync(TRACK_FILE, JSON.stringify({ temp: tempDate, precip: precipDate }, null, 2));
}

function startNOAACronJob() {
  console.log('Cron job initialized');

  cron.schedule('13 13 * * *', async () => {
    console.log('[Cron] Checking for NOAA file updates...');

    const today = new Date();
    const currentMonth = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;

    const lastChecked = loadLastCheckedDate();
    const lastMonthChecked = extractMonth(lastChecked.temp) || extractMonth(lastChecked.precip);

    if (lastMonthChecked === currentMonth) {
      console.log(`[Cron] Already processed NOAA file for ${currentMonth}. Skipping check.`);
      return;
    }

    try {
      const { tempDate, precipDate, tempURL, precipURL } = await getLatestNOAAFileLinks();

      const isNewTemp = tempDate && tempDate !== lastChecked.temp;
      const isNewPrecip = precipDate && precipDate !== lastChecked.precip;

      if (isNewTemp || isNewPrecip) {
        try {
          const port = process.env.PORT || 3000;
          const response = await axios.get(`http://localhost:${port}/addallcountydata`);
          console.log(`/addallcountydata responded with: ${response.status}`);
          saveLastCheckedDate(tempDate, precipDate);
        } catch (err) {
          console.error('Error calling /addallcountydata:', err.message);
        }
      }
    } catch (err) {
      console.error('Cron job error:', err.message);
    }
  });
}

module.exports = startNOAACronJob;
