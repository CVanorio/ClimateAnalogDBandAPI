
// src/services/data-access.service.js
////////////////////////////////////////////////////////////////////////////////////////////////////
// Data Accessors (Year / Season / Month) – DB Calls
// - Preserves original logic, console logs, Promise.all wrapping, and return shapes.
// - getTopAnalogsByYear
// - getDataByYear
// - getTopAnalogsBySeason
// - getDataBySeason
// - getTopAnalogsByMonth
// - getDataByMonth
////////////////////////////////////////////////////////////////////////////////////////////////////

const {pool} = require('../config/db');

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

/**
 * Define the function to call the stored procedure and return the results as a JSON object
 * (getTopAnalogsByYear) — preserved verbatim.
 */
async function getTopAnalogsByYear(targetCountyName, dataType) {
  var connection;

  try {
    // Get a connection from the pool
    connection = await pool.getConnection();
    console.log('Database connected successfully');

    var rows = null;

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

    // console.log(rows[0][0][0]);

    // Return the rows as a JSON object
    return { success: true, data: rows };
  } catch (error) {
    console.error('Error getting data:', error);
    // Return an error object
    return { success: false, error: error.message };
  } finally {
    if (connection) {
      // Close the database connection
      connection.release();
      console.log('Database connection closed.');
    }
  }
}

/**
 * getDataByYear — preserved verbatim.
 */
async function getDataByYear(targetCounty, yearNumber, dataType) {
  var connection;

  try {
    // Get a connection from the pool
    connection = await pool.getConnection();
    console.log('Database connected successfully');

    var rows = null;

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

  // console.log(rows[0][0][0]);

    // Return the rows as a JSON object
    return { success: true, data: rows };
  } catch (error) {
    console.error('Error getting data:', error);
    // Return an error object
    return { success: false, error: error.message };
  } finally {
    if (connection) {
      // Close the database connection
      connection.release();
      console.log('Database connection closed.');
    }
  }
}

/**
 * getTopAnalogsBySeason — preserved verbatim.
 */
async function getTopAnalogsBySeason(targetCounty, timeScaleValue, dataType) {
  var connection;

  try {
    // Get a connection from the pool
    connection = await pool.getConnection();
    console.log('Database connected successfully');

    var rows = null;

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

  // console.log(rows[0][0][0]);

    // Return the rows as a JSON object
    return { success: true, data: rows };
  } catch (error) {
    console.error('Error getting data:', error);
    // Return an error object
    return { success: false, error: error.message };
  } finally {
    if (connection) {
      // Close the database connection
      connection.release();
      console.log('Database connection closed.');
    }
  }
}

/**
 * getDataBySeason — preserved verbatim.
 */
async function getDataBySeason(targetCounty, yearNumber, timeScaleValue, dataType) {
  var connection;

  try {
    // Get a connection from the pool
    connection = await pool.getConnection();
    console.log('Database connected successfully');

    var rows = null;

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

  // console.log(rows[0][0][0]);

    // Return the rows as a JSON object
    return { success: true, data: rows };
  } catch (error) {
    console.error('Error getting data:', error);
    // Return an error object
    return { success: false, error: error.message };
  } finally {
    if (connection) {
      // Close the database connection
      connection.release();
      console.log('Database connection closed.');
    }
  }
}

/**
 * getTopAnalogsByMonth — preserved verbatim.
 */
async function getTopAnalogsByMonth(targetCounty, timeScaleValue, dataType) {
  var connection;

  try {
    // Get a connection from the pool
    connection = await pool.getConnection();
    console.log('Database connected successfully');

    var rows = null;

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

  // console.log(rows[0][0][0]);

    // Return the rows as a JSON object
    return { success: true, data: rows };
  } catch (error) {
    console.error('Error getting data:', error);
    // Return an error object
    return { success: false, error: error.message };
  } finally {
    if (connection) {
      // Close the database connection
      connection.release();
      console.log('Database connection closed.');
    }
  }
}

/**
 * getDataByMonth — preserved verbatim.
 */
async function getDataByMonth(targetCounty, yearNumber, timeScaleValue, dataType) {
  var connection;

  try {
    // Get a connection from the pool
    connection = await pool.getConnection();
    console.log('Database connected successfully');

    var rows = null;

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

 // console.log(rows[0][0][0]);

    // Return the rows as a JSON object
    return { success: true, data: rows };
  } catch (error) {
    console.error('Error getting data:', error);
    // Return an error object
    return { success: false, error: error.message };
  } finally {
    if (connection) {
      // Close the database connection
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
