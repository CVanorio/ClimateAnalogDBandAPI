// Import required modules
const axios = require('axios');
const mysql = require('mysql2/promise');
const express = require('express');
const jsonfile = require('jsonfile');
const fs = require('fs');

const mainURL = 'https://www.ncei.noaa.gov/data'
const countyTempExt = '/nclimdiv-monthly/access/climdiv-tmpccy-v1.0.0-20240606'
const countyPrecipExt = '/nclimdiv-monthly/access/climdiv-pcpncy-v1.0.0-20240606'
const gridTempExt = '/nclimgrid-monthly/access/202404.tave.conus.pnt'
const gridPrecipExt = '/nclimgrid-monthly/access/202404.prcp.conus.pnt'

const climateNormalYears = [1991, 2020]

const countyPrecipQuery = 'CALL  InsertMonthlyPrecipitationWI(?, ?, ?, ?);'
const countyTempQuery = 'CALL InsertMonthlyTemperatureWI(?, ?, ?, ?);'
const getCountyIdByStateAndCountyCodes = 'CALL GetCountyIDByCodeAndState(?, ?);'
const calculateMonthlyPrecipNormsQuery= 'CALL InsertMonthlyPrecipitationNorms(?, ?, ?, ?);'
const calculateMonthlyTempNormsQuery = 'CALL InsertMonthlyTemperatureNorms(?, ?, ?, ?);'
const getTopAnalogsForTargetByYear = 'CALL GetTopAnalogForTargetByYear(?);'

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
        parseAndStoreWICountyData(data, query);
      } else if (scale == 'Grid'){
        //parseAndStoreGridData(data, query);
      }

      return data;
    } catch (error) {
      console.error('Error fetching data from the API:', error);
      return error;
    }
  }

const monthValues = [
    '01', 
    '02', 
    '03', 
    '04', 
    '05', 
    '06', 
    '07', 
    '08', 
    '09', 
    '10', 
    '11', 
    '12'
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
async function parseAndStoreWICountyData(responseData, query) {
    var connection;

    try {
        // Define connection to the MySQL database
        connection = await mysql.createConnection(connectionOptions);
        console.log('MySQL Connected');

        var currentYear = new Date().getFullYear();
        var lines = responseData.split('\n');
        
        // Initialize variables for accumulating monthly totals
        var monthlyTotals = {
            '01': 0, '02': 0, '03': 0, '04': 0, '05': 0, '06': 0,
            '07': 0, '08': 0, '09': 0, '10': 0, '11': 0, '12': 0
        };

        var monthlyData = {
            '01': [], '02': [], '03': [], '04': [], '05': [], '06': [],
            '07': [], '08': [], '09': [], '10': [], '11': [], '12': []
        }
        
        // Iterate over each line and process separately
        for (var line of lines) {
            var dataType = line.substring(5, 7);
            var year = parseInt(line.substring(7, 11));
            var StateCode = line.substring(0, 2);
            var CountyCode = line.substring(2, 5);

            var insertMonthlyDataQuery = '';
            var insertMonthlyNormDataQuery = '';
            var insertSeasonalDataQuery = '';
            var insertSeasonalNormDataQuery = '';
            var insertYearlyDataQuery = '';
            var insertYearlyNormData = '';

            // Set queries based on dataType (precipitation or temperature)
            if (dataType === '01') {
                insertMonthlyDataQuery = countyPrecipQuery;
                insertMonthlyNormDataQuery = calculateMonthlyPrecipNormsQuery;
            } else if (dataType === '02') {
                insertMonthlyDataQuery = countyTempQuery;
                insertMonthlyNormDataQuery = calculateMonthlyTempNormsQuery;
            }

            // Check if the county exists in the Counties table
            var [rows] = await connection.execute(
                getCountyIdByStateAndCountyCodes,
                [CountyCode, StateCode]
            );

            if (rows.length > 0 && rows[0].length > 0 && rows[0][0].CountyID) {
                var CountyID = rows[0][0].CountyID;

                // If state is Wisconsin, add the monthly values to the monthly precipitation or temperature table
                if (StateCode === '47') {
                    // Insert monthly data for Wisconsin counties
                    for (var i = 0; i < monthPositions.length; i++) {
                        var { start, end } = monthPositions[i];
                        var month = monthValues[i];
                        var value = parseFloat(line.substring(start, end));

                        // Check if the value is valid (-9.99 and -99.90 are invalid)
                        if (value != -9.99 && value != -99.90) {
                            console.log(`County data to insert: ${CountyCode}, ${StateCode}, ${CountyID}, ${year}, ${month}, ${value}`)
                            var queryParams = [CountyID, year, month, value];
                            await connection.execute(insertMonthlyDataQuery, queryParams);
                        }
                    }
                }
                // for all states, get norms for specified normal range
                if (year >= climateNormalYears[0] && year <= climateNormalYears[1]){
                    // for every month, get the value and add it to the running totals
                    // increment month counts
                    // Insert monthly data for Wisconsin counties
                    for (var i = 0; i < monthPositions.length; i++) {
                        var { start, end } = monthPositions[i];
                        var month = monthValues[i];
                        var value = parseFloat(line.substring(start, end));

                        // Check if the value is valid (-9.99 and -99.90 are invalid)
                        if (value != -9.99 && value != -99.90) {
                            monthlyTotals[month] += value;
                            monthlyData[month].push(value);
                        }
                    }

                    
                    // Insert values and reset monthly totals
                    if (year == climateNormalYears[1]) {
                        
                        for (var month in monthValues) {

                            var count = monthlyData[monthValues[month]].length;
                            var mean = monthlyTotals[monthValues[month]] / count;
                            var sumOfSquares = monthlyData[monthValues[month]].reduce((acc, val) => acc + Math.pow((val - mean), 2), 0); // Calculate sum

                            stddev = Math.sqrt(sumOfSquares / count);

                            // Round mean and stddev to 2 decimal places
                            mean = mean.toFixed(2);
                            stddev = stddev.toFixed(2);

                            if (!isNaN(mean) && stddev !== null) {
                                console.log(`Inserting data norm: ${CountyCode}, ${StateCode}, ${CountyID}, ${monthValues[month]}, ${mean}, ${stddev}`);
                                var queryParams = [CountyID, monthValues[month], mean, stddev];
                                await connection.execute(insertMonthlyNormDataQuery, queryParams);
                            }
                        }
    
                        // Reset monthly totals for the next cycle
                        for (var month in monthlyTotals) {
                            monthlyTotals[month] = 0;
                            monthlyData[month] = [];
                        }
                    }
                }
            
            } else {
                console.log(`No County: ${CountyCode}, ${StateCode}`)
            }
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


async function calculateMonthlyNorms(line, insertMonthlyNormDataQuery, CountyID, year){
    // Calculate total precipitation and standard deviation for each month
    var monthlyValues = {};
    var monthlyCounts = 0;
    var monthlySums = 0;

    // Initialize month totals and counts
    for (var month of monthValues) {
        monthlyValues[month] = 0;
    }

    // Extract variable values
    for (var i = 0; i < monthPositions.length; i++) {
        var { start, end } = monthPositions[i];
        var month = monthValues[i];
        var value = parseFloat(line.substring(start, end));

        // Check if the value is valid (-9.99 and -99.90 are invalid)
        if (value !== -9.99 && value !== -99.90) {
            monthlyValue[month] += value;
            monthlyCounts++;
            monthlySums += value;
        }
    }

    // Calculate standard deviation for each month
    var monthlyStdDevs = {};
    for (var month of monthValues) {
        if (monthlyCounts[month] > 0) {
            var mean = monthlySums[month] / monthlyCounts[month];
            var variance = (monthlySumsSquared[month] / monthlyCounts[month]) - Math.pow(mean, 2);
            var stdDev = Math.sqrt(variance);
            monthlyStdDevs[month] = stdDev.toFixed(2); // Limit to 2 decimal places
        } else {
            monthlyStdDevs[month] = null; // Handle case where no valid data exists
        }
    }

    // Insert into precipitation norms table
    for (var month of monthValues) {
        var normPrecipitation = monthlyTotals[month] / monthlyCounts[month];
        var stdDev = monthlyStdDevs[month];

        if (!isNaN(normPrecipitation) && stdDev !== null) {
            console.log(`Inserting norms for County: ${CountyID}, Year: ${year}, Month: ${month}`);
            var queryParams = [CountyID, year, month, normPrecipitation, stdDev];
            await connection.execute(insertMonthlyNormDataQuery, queryParams);
        }
    }
}

// Function to parse the response data and store it in the database
async function calculateNormalsAndAnalogs() {

    var connection;

    try {

         // Define connection to the MySQL database
         connection = await mysql.createConnection(connectionOptions);
         console.log('MySQL Connected');

        // Execute calculation query

        // To recalculate climate normals using new climate normal year range, update the climateNormalYears constant and uncomment this line and run. Re-comment out when done.
        //await connection.execute(calculateCountyAnalogDataQuery, climateNormalYears);

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


// Define the function to call the stored procedure and write the results to a file
async function getTopAnalogsByYear(targetCountyName) {

    var connection;

    try {
        // Define connection to the MySQL database
        connection = await mysql.createConnection(connectionOptions);
        console.log('MySQL Connected');

        var [rows] = await connection.execute(getTopAnalogsForTargetByYear, [targetCountyName])

        console.log(rows)

        // Convert the rows to a string format
        var data = rows.map(row => JSON.stringify(row)).join('\n');

        // Define the output file path
        var filePath = `${process.env.OUTPUT_FILEPATH}/${targetCountyName}_best_analogs.txt`;

        // Write the data to a file
        fs.writeFile(filePath, data, (err) => {
            if (err) {
                console.error('Error writing to file:', err);
            } else {
                console.log(`Results written to ${filePath}`);
            }
        });

    } catch (error) {
        console.error('Error getting data:', error);
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
            await fetchDataFromAPI(mainURL.concat(countyPrecipExt), 'County', countyPrecipQuery)
            await fetchDataFromAPI(mainURL.concat(countyTempExt), 'County', countyTempQuery)
            //await calculateNormalsAndAnalogs()

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

// Get top analogs for every year for target county
app.get('/getTopAnalogsForTargetCounty/:TargetCounty', async (req, res) => {
    try {
        await getTopAnalogsByYear(req.params.TargetCounty)

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