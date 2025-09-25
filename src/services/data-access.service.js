
// src/services/data-access.service.js
////////////////////////////////////////////////////////////////////////////////////////////////////
// Data Accessors (Year / Season / Month) – DB Calls
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
 */
async function getTopAnalogsByYear(targetCountyName, dataType, targetState) {
  var connection;

  try {
    // Get a connection from the pool
    connection = await pool.getConnection();
    console.log('Database connected successfully');

    var rows = null;

    if (dataType === 'precipitation') {
      console.log('Inside preciptation');
      rows = await Promise.all([
        connection.execute(getTopPrecipitationAnalogsByYearQuery, [targetCountyName, targetState]),
      ]);
    } else if (dataType === 'temperature') {
      console.log('Inside temperature');
      rows = await Promise.all([
        connection.execute(getTopTemperatureAnalogsByYearQuery, [targetCountyName, targetState]),
      ]);
    } else if (dataType === 'both') {
      console.log('Inside both');
      rows = await Promise.all([
        connection.execute(getTopCombinedAnalogsByYearQuery, [targetCountyName, targetState]),
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


async function getDataByYear(targetCounty, yearNumber, dataType, targetState) {
  var connection;

  try {
    // Get a connection from the pool
    connection = await pool.getConnection();
    console.log('Database connected successfully');

    var rows = null;

    if (dataType === 'precipitation') {
      console.log('Inside preciptation');
      rows = await Promise.all([
        connection.execute(getPrecipitationAnalogsByYearQuery, [targetCounty, yearNumber, targetState]),
      ]);
    } else if (dataType === 'temperature') {
      console.log('Inside temperature');
      rows = await Promise.all([
        connection.execute(getTemperatureAnalogsByYearQuery, [targetCounty, yearNumber, targetState]),
      ]);
    } else if (dataType === 'both') {
      console.log('Inside both');
      console.log(getCombinedAnalogsByYearQuery, [targetCounty, yearNumber, targetState]);
      rows = await Promise.all([
        connection.execute(getCombinedAnalogsByYearQuery, [targetCounty, yearNumber, targetState]),
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


async function getTopAnalogsBySeason(targetCounty, timeScaleValue, dataType, targetState) {
  var connection;

  try {
    // Get a connection from the pool
    connection = await pool.getConnection();
    console.log('Database connected successfully');

    var rows = null;

    if (dataType === 'precipitation') {
      console.log('Inside preciptation');
      rows = await Promise.all([
        connection.execute(getTopPrecipitationAnalogsBySeasonQuery, [targetCounty, timeScaleValue, targetState]),
      ]);
    } else if (dataType === 'temperature') {
      console.log('Inside temperature');
      rows = await Promise.all([
        connection.execute(getTopTemperatureAnalogsBySeasonQuery, [targetCounty, timeScaleValue, targetState]),
      ]);
    } else if (dataType === 'both') {
      console.log('Inside both');
      rows = await Promise.all([
        connection.execute(getTopCombinedAnalogsBySeasonQuery, [targetCounty, timeScaleValue, targetState]),
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
        connection.execute(getPrecipitationAnalogsBySeasonQuery, [targetCounty, yearNumber, timeScaleValue, targetState]),
      ]);
    } else if (dataType === 'temperature') {
      console.log('Inside preciptation');
      rows = await Promise.all([
        connection.execute(getTemperatureAnalogsBySeasonQuery, [targetCounty, yearNumber, timeScaleValue, targetState]),
      ]);
    } else if (dataType === 'both') {
      console.log('Inside preciptation');
      rows = await Promise.all([
        connection.execute(getCombinedAnalogsBySeasonQuery, [targetCounty, yearNumber, timeScaleValue, targetState]),
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
        connection.execute(getTopPrecipitationAnalogsByMonthQuery, [targetCounty, timeScaleValue, targetState]),
      ]);
    } else if (dataType === 'temperature') {
      console.log('Inside temperature');
      rows = await Promise.all([
        connection.execute(getTopTemperatureAnalogsByMonthQuery, [targetCounty, timeScaleValue, targetState]),
      ]);
    } else if (dataType === 'both') {
      console.log('Inside both');
      rows = await Promise.all([
        connection.execute(getTopCombinedAnalogsByMonthQuery, [targetCounty, timeScaleValue, targetState]),
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
        connection.execute(getPrecipitationAnalogsByMonthQuery, [targetCounty, yearNumber, timeScaleValue, targetState]),
      ]);
    } else if (dataType === 'temperature') {
      console.log('Inside preciptation');
      rows = await Promise.all([
        connection.execute(getTemperatureAnalogsByMonthQuery, [targetCounty, yearNumber, timeScaleValue, targetState]),
      ]);
    } else if (dataType === 'both') {
      console.log('Inside preciptation');
      rows = await Promise.all([
        connection.execute(getCombinedAnalogsByMonthQuery, [targetCounty, yearNumber, timeScaleValue, targetState]),
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
