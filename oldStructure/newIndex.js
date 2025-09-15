// Import required modules
const cors = require('cors');
const mysql = require('mysql2/promise');
const express = require('express');

// Get yearly top analogs
const getTopPrecipitationAnalogsByYearQuery = 'CALL GetAllTopPrecipAnalogsForCountyByYear(?);'
const getTopTemperatureAnalogsByYearQuery = 'CALL GetAllTopTempAnalogsForCountyByYear(?);'
const getTopCombinedAnalogsByYearQuery = 'CALL GetAllTopCombinedAnalogsForCountyByYear(?);'
// Get yearly analogs by year
const getPrecipitationAnalogsByYearQuery = 'CALL GetTopPrecipAnalogsForCountyByYear(?, ?);'
const getTemperatureAnalogsByYearQuery = 'CALL GetTopTempAnalogsForCountyByYear(?, ?);'
const getCombinedAnalogsByYearQuery = 'CALL GetTopCombinedAnalogsForCountyByYear(?, ?);'

// Get seasonal top analogs
const getTopPrecipitationAnalogsBySeasonQuery = 'CALL GetAllTopPrecipAnalogsForCountyBySeason(?, ?);'
const getTopTemperatureAnalogsBySeasonQuery = 'CALL GetAllTopTempAnalogsForCountyBySeason(?, ?);'
const getTopCombinedAnalogsBySeasonQuery = 'CALL GetAllTopCombinedAnalogsForCountyBySeason(?, ?);'
// Get seasonal analogs by year
const getPrecipitationAnalogsBySeasonQuery = 'CALL GetPrecipAnalogsForCountyByYearAndSeason(?, ?, ?);'
const getTemperatureAnalogsBySeasonQuery = 'CALL GetTempAnalogsForCountyByYearAndSeason(?, ?, ?);'
const getCombinedAnalogsBySeasonQuery = 'CALL GetCombinedAnalogsForCountyByYearAndSeason(?, ?, ?);'

// Get monthly top analogs
const getTopPrecipitationAnalogsByMonthQuery = 'CALL GetAllTopPrecipAnalogsForCountyByMonth(?, ?);'
const getTopTemperatureAnalogsByMonthQuery = 'CALL GetAllTopTempAnalogsForCountyByMonth(?, ?);'
const getTopCombinedAnalogsByMonthQuery = 'CALL GetAllTopCombinedAnalogsForCountyByMonth(?, ?);'
// Get monthly analogs by year
const getPrecipitationAnalogsByMonthQuery = 'CALL GetPrecipAnalogsForCountyByYearAndMonth(?, ?, ?);'
const getTemperatureAnalogsByMonthQuery = 'CALL GetTempAnalogsForCountyByYearAndMonth(?, ?, ?);'
const getCombinedAnalogsByMonthQuery = 'CALL GetCombinedAnalogsForCountyByYearAndMonth(?, ?, ?);'


// Load environment variables
require('dotenv').config();

// Create Express application
const app = express();

app.use(cors());
app.use(express.json());

const connectionOptions = {
    host        : process.env.DB_HOST,
    user        : process.env.DB_USER,
    password    : process.env.DB_PASSWORD,
    database    : process.env.DB_NAME,
    waitForConnections  : true,
    connectionLimit     : 100,
    queueLimit          : 0
};

const pool = mysql.createPool(connectionOptions);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// FRONT END API CALLS

// Central endpoint to handle all data requests
app.get('/getData', async (req, res) => {
  const { targetCounty, timeScale, timeScaleValue, year, dataType } = req.query;

  try {
    let result;
    var yearNumber = Number(year);

    // Determine the stored procedure to call based on the parameters
    if (timeScale === 'by_year') {
      if (year === 'top_analogs') {
        result = await getTopAnalogsByYear(targetCounty, dataType);
      } else if (!isNaN(yearNumber)) {
        result = await getDataByYear(targetCounty, yearNumber, dataType);
      }
    } else if (timeScale === 'by_season') {
      if (year === 'top_analogs') {
        result = await getTopAnalogsBySeason(targetCounty, timeScaleValue, dataType);
      } else if (!isNaN(yearNumber)) {
        result = await getDataBySeason(targetCounty, yearNumber, timeScaleValue, dataType);
      }
    } else if (timeScale === 'by_month') {
      if (year === 'top_analogs') {
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
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Define the function to call the stored procedure and return the results as a JSON object
async function getTopAnalogsByYear(targetCountyName, dataType) {

    var connection;

    try {
        // Get a connection from the pool
        connection = await pool.getConnection();

        var rows = null

        if(dataType === 'precipitation'){

           rows = await Promise.all([
            
                connection.execute(getTopPrecipitationAnalogsByYearQuery, [targetCountyName])
           ])

        } else if (dataType === 'temperature'){

           rows = await Promise.all([
            
                connection.execute(getTopTemperatureAnalogsByYearQuery, [targetCountyName])
           ])

        } else if (dataType === 'both'){

            rows = await Promise.all([
             
                 connection.execute(getTopCombinedAnalogsByYearQuery, [targetCountyName])
            ])
        }     
        
        // Return the rows as a JSON object
        return{ success: true, data: rows };

    } catch (error) {
        console.error('Error getting data:', error);
        // Return an error object
        return { success: false, error: error.message };
    } finally {
        if (connection) {
            // Close the database connection
            connection.release();
        }
    }
}

async function getDataByYear(targetCounty, yearNumber, dataType){

    var connection;

    try {
        // Get a connection from the pool
        connection = await pool.getConnection();
        var rows = null

        if(dataType === 'precipitation'){
           rows = await Promise.all([
            
                connection.execute(getPrecipitationAnalogsByYearQuery, [targetCounty, yearNumber])
           ])

        } else if (dataType === 'temperature'){
           rows = await Promise.all([
            
                connection.execute(getTemperatureAnalogsByYearQuery, [targetCounty, yearNumber])
           ])

        } else if (dataType === 'both'){
           rows = await Promise.all([
            
                connection.execute(getCombinedAnalogsByYearQuery, [targetCounty, yearNumber])
           ])

        }        
        
        // Return the rows as a JSON object
        return{ success: true, data: rows };

    } catch (error) {
        console.error('Error getting data:', error);
        // Return an error object
        return { success: false, error: error.message };
    } finally {
        if (connection) {
            // Close the database connection
            connection.release();
        }
    }
}

async function getTopAnalogsBySeason(targetCounty, timeScaleValue, dataType) {

    var connection;

    try {
        // Get a connection from the pool
        connection = await pool.getConnection();
        var rows = null

        if(dataType === 'precipitation'){
           rows = await Promise.all([
            
                connection.execute(getTopPrecipitationAnalogsBySeasonQuery, [targetCounty, timeScaleValue])
           ])

        } else if (dataType === 'temperature'){
           rows = await Promise.all([
            
                connection.execute(getTopTemperatureAnalogsBySeasonQuery, [targetCounty, timeScaleValue])
           ])

        } else if (dataType === 'both'){
            rows = await Promise.all([
             
                 connection.execute(getTopCombinedAnalogsBySeasonQuery, [targetCounty, timeScaleValue])
            ])
        }        
        
        // Return the rows as a JSON object
        return{ success: true, data: rows };

    } catch (error) {
        console.error('Error getting data:', error);
        // Return an error object
        return { success: false, error: error.message };
    } finally {
        if (connection) {
            // Close the database connection
            connection.release();
        }
    }
}

async function getDataBySeason(targetCounty, yearNumber, timeScaleValue, dataType){

    var connection;

    try {
        // Get a connection from the pool
        connection = await pool.getConnection();
        var rows = null

        if(dataType === 'precipitation'){
           rows = await Promise.all([
            
                connection.execute(getPrecipitationAnalogsBySeasonQuery, [targetCounty, yearNumber, timeScaleValue])
           ])

        } else if (dataType === 'temperature'){
           rows = await Promise.all([
            
                connection.execute(getTemperatureAnalogsBySeasonQuery, [targetCounty, yearNumber, timeScaleValue])
           ])

        } else if (dataType === 'both'){
           rows = await Promise.all([
            
                connection.execute(getCombinedAnalogsBySeasonQuery, [targetCounty, yearNumber, timeScaleValue])
           ])

        }      

        // Return the rows as a JSON object
        return{ success: true, data: rows };

    } catch (error) {
        console.error('Error getting data:', error);
        // Return an error object
        return { success: false, error: error.message };
    } finally {
        if (connection) {
            // Close the database connection
            connection.release();
        }
    }
}

async function getTopAnalogsByMonth(targetCounty, timeScaleValue, dataType) {

    var connection;

    try {
        // Get a connection from the pool
        connection = await pool.getConnection();
        var rows = null

        if(dataType === 'precipitation'){
           rows = await Promise.all([
            
                connection.execute(getTopPrecipitationAnalogsByMonthQuery, [targetCounty, timeScaleValue])
           ])

        } else if (dataType === 'temperature'){
           rows = await Promise.all([
            
                connection.execute(getTopTemperatureAnalogsByMonthQuery, [targetCounty, timeScaleValue, ])
           ])

        } else if (dataType === 'both'){
            rows = await Promise.all([
             
                 connection.execute(getTopCombinedAnalogsByMonthQuery, [targetCounty, timeScaleValue])
            ])
        }        
        
        // Return the rows as a JSON object
        return{ success: true, data: rows };

    } catch (error) {
        console.error('Error getting data:', error);
        // Return an error object
        return { success: false, error: error.message };
    } finally {
        if (connection) {
            // Close the database connection
            connection.release();
        }
    }
}

async function getDataByMonth(targetCounty, yearNumber, timeScaleValue, dataType){

    var connection;

    try {
        // Get a connection from the pool
        connection = await pool.getConnection();
        var rows = null

        if(dataType === 'precipitation'){
           rows = await Promise.all([
            
                connection.execute(getPrecipitationAnalogsByMonthQuery, [targetCounty, yearNumber, timeScaleValue])
           ])

        } else if (dataType === 'temperature'){
           rows = await Promise.all([
            
                connection.execute(getTemperatureAnalogsByMonthQuery, [targetCounty, yearNumber, timeScaleValue])
           ])

        } else if (dataType === 'both'){
           rows = await Promise.all([
            
                connection.execute(getCombinedAnalogsByMonthQuery, [targetCounty, yearNumber, timeScaleValue])
           ])

        }        
        
        // Return the rows as a JSON object
        return{ success: true, data: rows };

    } catch (error) {
        console.error('Error getting data:', error);
        // Return an error object
        return { success: false, error: error.message };
    } finally {
        if (connection) {
            // Close the database connection
            connection.release();
        }
    }
}