// Import required modules
const axios = require('axios');
const mysql = require('mysql2/promise');
const express = require('express');
const jsonfile = require('jsonfile');

const mainURL = 'https://www.ncei.noaa.gov/data'
const countyTempExt = '/nclimdiv-monthly/access/climdiv-tmpccy-v1.0.0-20240506'
const countyPrecipExt = '/nclimdiv-monthly/access/climdiv-pcpncy-v1.0.0-20240506'
const gridTempExt = '/nclimgrid-monthly/access/202404.tave.conus.pnt'
const gridPrecipExt = '/nclimgrid-monthly/access/202404.prcp.conus.pnt'

const countyPrecipQuery = 'CALL InsertCountyPrecipitationData(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);'
const countyTempQuery = 'CALL InsertCountyTemperatureData(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);'
const calculateCountyAnalogDataQuery = 'CALL CalculateCountyAnalogData;'
const calculateEuclideanDistancesQuery = 'CALL CalculateEuclideanDistances';

// Load environment variables
require('dotenv').config();

// Create Express application
const app = express();

const connectionOptions = {
    host        : process.env.DB_HOST,
    user        : process.env.DB_USER,
    password    : process.env.DB_PASSWORD,
    database    : process.env.DB_NAME
};

// Create connection
//const db = mysql.createConnection(connectionOptions);

// Function to fetch data from the API
async function fetchDataFromAPI(url, scale, query) {
    try {
      var response = await axios.get(url);
      var data = response.data;

      if(scale == 'County') {
        parseAndStoreCountyData(data, query);
      } else if (scale == 'Grid'){
        //parseAndStoreGridData(data, query);
      }

      return data;
    } catch (error) {
      console.error('Error fetching data from the API:', error);
      return error;
    }
  }

const monthColumns = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 
    'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 
    'Nov', 'Dece'
];

const monthPositions = [
    { start: 11, end: 18 },  // January
    { start: 18, end: 25 },  // February
    { start: 25, end: 32 },  // March
    { start: 32, end: 39 },  // April
    { start: 39, end: 46 },  // May
    { start: 46, end: 53 },  // June
    { start: 53, end: 60 },  // July
    { start: 60, end: 67 },  // August
    { start: 67, end: 74 },  // September
    { start: 74, end: 81 },  // October
    { start: 81, end: 88 },  // November
    { start: 88, end: 95 }   // December
];

// Function to parse the response data and store it in the database
async function parseAndStoreCountyData(responseData, query) {

    var connection;

    try {
        // Define connection to the MySQL database
        connection = await mysql.createConnection(connectionOptions);
        console.log('MySQL Connected');
        
        // var lines = responseData.split('\n');
        
        // // Iterate over each line and process separately
        // for (var line of lines) {
        //     // Extract data from the line based on character positions
        //     var StateCode = line.substring(0, 2);
        //     var CountyCode = line.substring(2, 5);
        //     var DatasetID = line.substring(5, 7);
        //     var Year = parseInt(line.substring(7, 11));

        //     // Check if the county exists in the Counties table
        //     var [rows] = await connection.execute(
        //         'SELECT CountyID FROM Counties WHERE CountyCode = ? AND StateCode = ?',
        //         [CountyCode, StateCode]
        //     );

            
        //     var monthValues = {};

        //     if (rows.length > 0) {
        //         // Extract variable values
        //         for (var i = 0; i < monthPositions.length; i++) {
        //             var { start, end } = monthPositions[i];
        //             monthValues[monthColumns[i]] = parseFloat(line.substring(start, end));
        //         }
                

        //         console.log(`County data to insert: ${CountyCode}, ${StateCode}, ${Year}, ${monthValues}`)
        //         var queryParams = [CountyCode, StateCode, Year, ...Object.values(monthValues)];

        //         // Execute the insert query
        //         await connection.execute(query, queryParams);
        //     } else {
        //         console.log(`No County: ${CountyCode}, ${StateCode}`)
        //     }

            
            
        // }
        // Execute the insert query
        //await connection.execute(calculateCountyAnalogDataQuery);
        await connection.execute(calculateEuclideanDistancesQuery);

        console.log('All data inserted successfully.');

    } catch (error) {
        console.error('Error inserting data:', error);
    } finally {
        if (connection) {
            // Close the database connection
            await connection.end();
            console.log('Database connection closed.');
        }
    }
}


//////////////////////////////////////////////////////////////////////////////////////////////////////

// Add all county data
app.get('/addallcountydata', async (req, res) => {
    try {
            //await fetchDataFromAPI(mainURL.concat(countyPrecipExt), 'County', countyPrecipQuery)
            await fetchDataFromAPI(mainURL.concat(countyTempExt), 'County', countyTempQuery)

    } catch (error) {
        if (error.response) {
            console.error('Error response from server:', error.response.status, error.response.data);
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Error setting up the request:', error.message);
        }
        console.error('Error details:', error.config);
    }

});


///////////////////////////////////////////////////////////////////////////
// Get all counties
app.get('/getcounties', (req, res) => {
    let sql = 'SELECT * FROM counties';
    let query = db.query(sql, (err, results) => {
        if(err) {
            throw err;
        }
        console.log(results);
        res.send('Counties fetched')
    })
})

// Get a county
app.get('/getcounty/:CountyID', (req, res) => {
    let sql = `SELECT * FROM counties WHERE CountyID = ${req.params.CountyID}`;
    let query = db.query(sql, (err, result) => {
        if(err) {
            throw err;
        }
        console.log(result);
        res.send('County fetched')
    })
})

app.listen('3000', () => {
    console.log('Sever started on port 3000');
});