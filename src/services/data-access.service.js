/**
 * Data Access Service
 * ----------------------------------------------------
 * Wraps DB calls used by /getData endpoint.
 * 
 */

const pool = require('../config/db');

const {
  getTopPrecipitationAnalogsByYearQuery,
  getTopTemperatureAnalogsByYearQuery,
  getTopCombinedAnalogsByYearQuery,
  getPrecipitationAnalogsByYearQuery,
  getTemperatureAnalogsByYearQuery,
  getCombinedAnalogsByYearQuery,

  getTopPrecipitationAnalogsBySeasonQuery,
  getTopTemperatureAnalogsBySeasonQuery,
  getTopCombinedAnalogsBySeasonQuery,
  getPrecipitationAnalogsBySeasonQuery,
  getTemperatureAnalogsBySeasonQuery,
  getCombinedAnalogsBySeasonQuery,

  getTopPrecipitationAnalogsByMonthQuery,
  getTopTemperatureAnalogsByMonthQuery,
  getTopCombinedAnalogsByMonthQuery,
  getPrecipitationAnalogsByMonthQuery,
  getTemperatureAnalogsByMonthQuery,
  getCombinedAnalogsByMonthQuery,
} = require('../sql/queries');

/* ========= YEAR ========= */

async function getTopAnalogsByYear(targetCountyName, dataType) {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Database connected successfully');

    let rows = null;

    if (dataType === 'precipitation') {
      console.log('Inside preciptation');
      rows = await Promise.all([
        connection.execute(getTopPrecipitationAnalogsByYearQuery, [targetCountyName]),
      ]);
    } else if (dataType === 'temperature') {
      console.log('Inside temperature');
      rows = await Promise.all([
        connection.execute(getTopTemperatureAnalogsByYearQuery, [targetCountyName]),
      ]);
    } else if (dataType === 'both') {
      console.log('Inside both');
      rows = await Promise.all([
        connection.execute(getTopCombinedAnalogsByYearQuery, [targetCountyName]),
      ]);
    }

    return { success: true, data: rows };
  } catch (error) {
    console.error('Error getting data:', error);
    return { success: false, error: error.message };
  } finally {
    if (connection) {
      connection.release();
      console.log('Database connection closed.');
    }
  }
}

async function getDataByYear(targetCounty, yearNumber, dataType) {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Database connected successfully');

    let rows = null;

    if (dataType === 'precipitation') {
      console.log('Inside preciptation');
      rows = await Promise.all([
        connection.execute(getPrecipitationAnalogsByYearQuery, [targetCounty, yearNumber]),
      ]);
    } else if (dataType === 'temperature') {
      console.log('Inside temperature');
      rows = await Promise.all([
        connection.execute(getTemperatureAnalogsByYearQuery, [targetCounty, yearNumber]),
      ]);
    } else if (dataType === 'both') {
      console.log('Inside both');
      rows = await Promise.all([
        connection.execute(getCombinedAnalogsByYearQuery, [targetCounty, yearNumber]),
      ]);
    }

    console.log(rows[0]);
    return { success: true, data: rows };
  } catch (error) {
    console.error('Error getting data:', error);
    return { success: false, error: error.message };
  } finally {
    if (connection) {
      connection.release();
      console.log('Database connection closed.');
    }
  }
}

/* ========= SEASON ========= */

async function getTopAnalogsBySeason(targetCounty, timeScaleValue, dataType) {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Database connected successfully');

    let rows = null;

    if (dataType === 'precipitation') {
      console.log('Inside preciptation');
      rows = await Promise.all([
        connection.execute(getTopPrecipitationAnalogsBySeasonQuery, [targetCounty, timeScaleValue]),
      ]);
    } else if (dataType === 'temperature') {
      console.log('Inside temperature');
      rows = await Promise.all([
        connection.execute(getTopTemperatureAnalogsBySeasonQuery, [targetCounty, timeScaleValue]),
      ]);
    } else if (dataType === 'both') {
      console.log('Inside both');
      rows = await Promise.all([
        connection.execute(getTopCombinedAnalogsBySeasonQuery, [targetCounty, timeScaleValue]),
      ]);
    }

    return { success: true, data: rows };
  } catch (error) {
    console.error('Error getting data:', error);
    return { success: false, error: error.message };
  } finally {
    if (connection) {
      connection.release();
      console.log('Database connection closed.');
    }
  }
}

async function getDataBySeason(targetCounty, yearNumber, timeScaleValue, dataType) {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Database connected successfully');

    let rows = null;

    if (dataType === 'precipitation') {
      console.log('Inside preciptation');
      rows = await Promise.all([
        connection.execute(getPrecipitationAnalogsBySeasonQuery, [targetCounty, yearNumber, timeScaleValue]),
      ]);
    } else if (dataType === 'temperature') {
      console.log('Inside preciptation');
      rows = await Promise.all([
        connection.execute(getTemperatureAnalogsBySeasonQuery, [targetCounty, yearNumber, timeScaleValue]),
      ]);
    } else if (dataType === 'both') {
      console.log('Inside preciptation');
      rows = await Promise.all([
        connection.execute(getCombinedAnalogsBySeasonQuery, [targetCounty, yearNumber, timeScaleValue]),
      ]);
    }

    return { success: true, data: rows };
  } catch (error) {
    console.error('Error getting data:', error);
    return { success: false, error: error.message };
  } finally {
    if (connection) {
      connection.release();
      console.log('Database connection closed.');
    }
  }
}

/* ========= MONTH ========= */

async function getTopAnalogsByMonth(targetCounty, timeScaleValue, dataType) {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Database connected successfully');

    let rows = null;

    if (dataType === 'precipitation') {
      console.log('Inside preciptation');
      rows = await Promise.all([
        connection.execute(getTopPrecipitationAnalogsByMonthQuery, [targetCounty, timeScaleValue]),
      ]);
    } else if (dataType === 'temperature') {
      console.log('Inside temperature');
      rows = await Promise.all([
        connection.execute(getTopTemperatureAnalogsByMonthQuery, [targetCounty, timeScaleValue]),
      ]);
    } else if (dataType === 'both') {
      console.log('Inside both');
      rows = await Promise.all([
        connection.execute(getTopCombinedAnalogsByMonthQuery, [targetCounty, timeScaleValue]),
      ]);
    }

    return { success: true, data: rows };
  } catch (error) {
    console.error('Error getting data:', error);
    return { success: false, error: error.message };
  } finally {
    if (connection) {
      connection.release();
      console.log('Database connection closed.');
    }
  }
}

async function getDataByMonth(targetCounty, yearNumber, timeScaleValue, dataType) {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Database connected successfully');

    let rows = null;

    if (dataType === 'precipitation') {
      console.log('Inside preciptation');
      rows = await Promise.all([
        connection.execute(getPrecipitationAnalogsByMonthQuery, [targetCounty, yearNumber, timeScaleValue]),
      ]);
    } else if (dataType === 'temperature') {
      console.log('Inside preciptation');
      rows = await Promise.all([
        connection.execute(getTemperatureAnalogsByMonthQuery, [targetCounty, yearNumber, timeScaleValue]),
      ]);
    } else if (dataType === 'both') {
      console.log('Inside preciptation');
      rows = await Promise.all([
        connection.execute(getCombinedAnalogsByMonthQuery, [targetCounty, yearNumber, timeScaleValue]),
      ]);
    }

    return { success: true, data: rows };
  } catch (error) {
    console.error('Error getting data:', error);
    return { success: false, error: error.message };
  } finally {
    if (connection) {
      connection.release();
      console.log('Database connection closed.');
    }
  }
}

module.exports = {
  getTopAnalogsByYear,
  getDataByYear,
  getTopAnalogsBySeason,
  getDataBySeason,
  getTopAnalogsByMonth,
  getDataByMonth,
};
