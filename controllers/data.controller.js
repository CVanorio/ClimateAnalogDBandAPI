/**
 * Controller: Central data endpoint (/getData).
 * Dispatches to DB accessors.
 * Behavior matches original logic, minus writing mock JSON files.
 */

const {
  getTopAnalogsByYear,
  getDataByYear,
  getTopAnalogsBySeason,
  getDataBySeason,
  getTopAnalogsByMonth,
  getDataByMonth,
} = require('../src/services/data-access.service');

async function getData(req, res) {
  const { targetCounty, timeScale, timeScaleValue, year, dataType } = req.query;

  try {
    console.log('Inside getData');
    console.log(req.query);

    let result;
    const yearNumber = Number(year);

    if (timeScale === 'by_year') {
      if (year === 'top_analogs') {
        console.log('In top analogs by year');
        result = await getTopAnalogsByYear(targetCounty, dataType);
      } else if (!isNaN(yearNumber)) {
        result = await getDataByYear(targetCounty, yearNumber, dataType);
      }
    } else if (timeScale === 'by_season') {
      if (year === 'top_analogs') {
        console.log('In top analogs by season');
        result = await getTopAnalogsBySeason(targetCounty, timeScaleValue, dataType);
      } else if (!isNaN(yearNumber)) {
        result = await getDataBySeason(targetCounty, yearNumber, timeScaleValue, dataType);
      }
    } else if (timeScale === 'by_month') {
      if (year === 'top_analogs') {
        console.log('In top analogs by month');
        result = await getTopAnalogsByMonth(targetCounty, timeScaleValue, dataType);
      } else if (!isNaN(yearNumber)) {
        result = await getDataByMonth(targetCounty, yearNumber, timeScaleValue, dataType);
      }
    } else {
      throw new Error('Invalid timeScale');
    }

    res.json(result);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { getData };
