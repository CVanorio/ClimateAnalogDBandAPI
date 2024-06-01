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
async function fetchDataFromAPI(url, dataset) {
    try {
      const response = await axios.get(url);
      const data = response.data;

      if(dataset == 'countyPrecip') {
        parseAndStoreCountyData(data, 'CALL InsertCountyData(?, ?, ?, ?, ?, ?);');
      } else if (dataset == 'countyTemp'){
        parseAndStoreCountyData(data, 'CALL UpdateCountyData;');
      }

      return data;
    } catch (error) {
      console.error('Error fetching data from the API:', error);
      return error;
    }
  }

  const precipColumns = [
    'PrecipJan', 'PrecipFeb', 'PrecipMar', 'PrecipApr', 'PrecipMay', 
    'PrecipJun', 'PrecipJul', 'PrecipAug', 'PrecipSep', 'PrecipOct', 
    'PrecipNov', 'PrecipDec'
];

const tempColumns = [
    'TempJan', 'TempFeb', 'TempMar', 'TempApr', 'TempMay', 
    'TempJun', 'TempJul', 'TempAug', 'TempSep', 'TempOct', 
    'TempNov', 'TempDec'
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
async function parseAndStoreCountyData(responseData) {
    let connection;
    try {
        // Define connection to the MySQL database
        connection = await mysql.createConnection(connectionOptions);
        console.log('MySQL Connected');
        
        const lines = responseData.split('\n');
        
        // Iterate over each line and process separately
        for (let line of lines) {
            // Extract data from the line based on character positions
            const StateCode = line.substring(0, 2);
            const CountyCode = line.substring(2, 5);
            const DatasetID = line.substring(5, 7);
            const Year = parseInt(line.substring(7, 11));

            const precipValues = {};
            const tempValues = {};
            
            // Extract precipitation values
            for (let i = 0; i < monthPositions.length; i++) {
                const { start, end } = monthPositions[i];
                precipValues[precipColumns[i]] = parseFloat(line.substring(start, end));
            }
            
            // Extract temperature values (assuming they follow precipitation values)
            for (let i = 0; i < monthPositions.length; i++) {
                const { start, end } = monthPositions[i];
                const tempStart = start + 84;  // Adjust position for temperature values if they follow precipitation
                const tempEnd = end + 84;
                tempValues[tempColumns[i]] = parseFloat(line.substring(tempStart, tempEnd));
            }

            const placeholders = Array(24).fill('?').join(', ');
            const columns = [...precipColumns, ...tempColumns].join(', ');

            const query = `INSERT IGNORE INTO CountyData (CountyID, Year, ${columns}) VALUES ((SELECT CountyID FROM Counties WHERE StateCode = ? AND CountyCode = ?), ?, ${placeholders})`;
            
            const queryParams = [StateCode, CountyCode, Year, ...Object.values(precipValues), ...Object.values(tempValues)];

            // Execute the insert query
            await connection.execute(query, queryParams);
        }

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
            fetchDataFromAPI(mainURL.concat(countyPrecipExt), 'countyPrecip')
            //fetchDataFromAPI(mainURL.concat(countyTempExt), 'countyTemp')

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