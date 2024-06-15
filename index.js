// Import required modules
const axios = require('axios');
const mysql = require('mysql2/promise');
const express = require('express');
const jsonfile = require('jsonfile');
const fs = require('fs');
const portfinder = require('portfinder');
const killPort = require('kill-port');

const mainURL = 'https://www.ncei.noaa.gov/data'
const countyTempExt = '/nclimdiv-monthly/access/climdiv-tmpccy-v1.0.0-20240606'
const countyPrecipExt = '/nclimdiv-monthly/access/climdiv-pcpncy-v1.0.0-20240606'
const gridTempExt = '/nclimgrid-monthly/access/202404.tave.conus.pnt'
const gridPrecipExt = '/nclimgrid-monthly/access/202404.prcp.conus.pnt'

const climateNormalYears = [1991, 2020]

const insertWICountyMonthlyPrecipQuery = 'CALL InsertMonthlyPrecipitationWI(?, ?, ?, ?);'
const insertWICountyMonthlyTempQuery = 'CALL InsertMonthlyTemperatureWI(?, ?, ?, ?);'
const insertMonthlyPrecipNormsQuery = 'CALL InsertMonthlyPrecipitationNorms(?, ?, ?, ?);'
const insertMonthlyTempNormsQuery = 'CALL InsertMonthlyTemperatureNorms(?, ?, ?, ?);'
const insertWICountyYearlyPrecipQuery = 'CALL InsertYearlyPrecipitationWI(?, ?, ?);'
const insertWICountyYearlyTempQuery = 'CALL InsertYearlyPrecipitationWI(?, ?, ?);'
const insertYearlyPrecipNormsQuery = 'CALL InsertYearlyPrecipitationNorms(?, ?, ?);'
const insertYearlyTempNormsQuery = 'CALL InsertYearlyTempNorms(?, ?, ?);'
const insertWICountySeasonalPrecipQuery = 'CALL InsertSeasonalPrecipitationWI(?, ?, ?, ?)'
const insertWICountySeasonalTempQuery = 'CALL InsertSeasonalTemperatureWI(?, ?, ?, ?)'
const insertSeasonalPrecipNormsQuery = 'CALL InsertSeasonalPrecipitationNorms(?, ?, ?, ?)'
const insertSeasonalTempNormsQuery = 'CALL InsertSeasonalTemperatureNorms(?, ?, ?, ?)'

const getCountyIdByStateAndCountyCodes = 'CALL GetCountyIDByCodeAndState(?, ?);'
const getTopAnalogsForTargetByYear = 'CALL GetTopAnalogForTargetByYear(?);'

// Load environment variables
require('dotenv').config();

// Create Express application
const app = express();
const PORT = 3000;

const connectionOptions = {
    host        : process.env.DB_HOST,
    user        : process.env.DB_USER,
    password    : process.env.DB_PASSWORD,
    database    : process.env.DB_NAME
};

// Create connection
//const db = mysql.createConnection(connectionOptions);

// Function to fetch data from the API
async function fetchDataFromAPI(url, scale) {
    try {
      var response = await axios.get(url);
      var data = response.data;

      if(scale == 'County') {
        parseAndInsertAllNormsAndWIData(data);
      } else if (scale == 'Grid'){
        //parseAndStoreGridData(data);
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

const seasonalValues = [
    'winter', 
    'spring', 
    'summer', 
    'fall'
];

const precipDatatype = '01'
const tempDatatype = '02'

function roundToTwo(num) {
    return Math.round(num * 100) / 100;
}

// Function to parse the response data and store it in the database
async function parseAndInsertAllNormsAndWIData(responseData) {
    var connection

    try {
        // Define connection to the MySQL database
        connection = await mysql.createConnection(connectionOptions)
        console.log('MySQL Connected')

        var currentYear = new Date().getFullYear()
        var currentMonth = new Date().getMonth()
        var lines = responseData.split('\n')

        var yearData = {}
        var prevDecember = null
        var normProperties = { 
            monthlyNorms: {},
            seasonalNorms: {},
            yearlyNorms: {}
        }

        // Iterate over each line and process separately
        for (var line of lines) {

            yearData = parseMonthlyLineData(line)

            if (yearData.CountyID === null){ continue }

            if (yearData.Year === 1895) { prevDecember = null}

            if (year >= climateNormalYears[0] && year <= climateNormalYears[1]){

                //await calculateNorms(yearData, prevDecember, normProperties, connection)

            }

            if (StateCode === '47') {
                await insertWIMonthlyData(yearData, connection)
                //await insertWISeasonalData(yearData, prevDecember, currentYear, currentMonth, connection)

                if (yearData.Year !== currentYear){
                    //await insertWIYearlyData(yearData, connection)
                }
            }

            prevDecember = yearData.MonthlyData[-1]
        }

        console.log('All data inserted successfully.')

    } catch (error) {
        console.error('Error inserting data:', error)
    } finally {
        if (connection) {
            // Close the database connection
            await connection.end()
            console.log('Database connection closed.')
        }
    }
}

async function parseMonthlyLineData(line){

    var dataType = line.substring(5, 7);
    var year = parseInt(line.substring(7, 11));
    var stateCode = line.substring(0, 2);
    var countyCode = line.substring(2, 5);

    // Check if the county exists in the Counties table
    var [rows] = await connection.execute(
        getCountyIdByStateAndCountyCodes,
        [countyCode, stateCode]
    );

    var countyID = null
    if (rows.length > 0 && rows[0].length > 0 && rows[0][0].CountyID) {
        countyID = rows[0][0].CountyID
    }

    var yearData = {
        CountyID: countyID, 
        Year: year, 
        DataType: dataType,
        StateCode: stateCode,
        CountyCode: countyCode,
        MonthData: {}
    }

    for (var i = 0; i < monthPositions.length; i++) {
        var { start, end } = monthPositions[i]
        var month = monthValues[i]
        var value = parseFloat(line.substring(start, end))

        yearData.MonthData[month] = value

    }

    return yearData
}

async function calculateNorms(yearData, prevDecember, normProperties, connection) {

    storeMonthlyValues(yearData, normProperties)
    storeYearlyValues(yearData, normProperties)
    storeSeasonalValues(yearData, prevDecember, normProperties)

    if (year == climateNormalYears[1]) {

        await calculateAndInsertMonthlyNorms(yearData, normProperties, connection)
        await calculateAndInsertYearlyNorms(yearData, normProperties, connection)
        await calculateAndInsertSeasonalNorms(yearData, normProperties, connection)

        // Reset norm values for the next county
        normProperties = {}
    }
}

function storeMonthlyValues(yearData, normProperties){

    var value = 0

    for (var i in yearData.MonthData){

        if (!normProperties.monthlyNorms[monthValues[i]]){
            normProperties.monthlyNorms[monthValues[i]] = {total: 0, values: []}
        }

        value = yearData.MonthData[i]

         // Check if the value is valid (-9.99 and -99.90 are invalid)
         if (value != -9.99 && value != -99.90) {
            normProperties.monthlyNorms[monthValues[i]].total += value;
            normProperties.monthlyNorms[monthValues[i]].values.push(value);
         }
    }
}

function storeYearlyValues(yearData, normProperties){

    if (!normProperties.yearlyNorms.total){
        normProperties.yearlyNorms = {total: 0, values: []}
    }

    var value = 0
    var yearTotal = 0

    for (var i in yearData.MonthData){

        value = yearData.MonthData[i]

         // Check if the value is valid (-9.99 and -99.90 are invalid)
         if (value != -9.99 && value != -99.90) {
            yearTotal += value
         }
    }

    if (yearData.DataType === tempDatatype){
        yearTotal = yearTotal / yearData.MonthData.length
    }

    normProperties.yearlyNorms.total += yearTotal
    normProperties.yearlyNorms.values.push(value)
}

function storeSeasonalValues(yearData, prevDecember, normProperties){
    
    for (var i in seasonalValues){

        if (!normProperties.seasonalNorms[seasonalValues[i]]){
            normProperties.seasonalNorms[seasonalValues[i]] = {total: 0, values: []}
        }
    }

    var value = 0
    var winterTotal = prevDecember
    var springTotal = 0
    var summerTotal = 0
    var fallTotal = 0
    var monthsPerSeason = 3

    for (var i in yearData.MonthData){

        value = yearData.MonthData[i]

        if (i < 2){
            winterTotal += value
        } else if (i < 5){
            springTotal += value
        } else if (i < 8) {
            summerTotal += value
        } else if (i < 11) {
            fallTotal += value
        }
    }

    if (yearData.DataType === tempDatatype){
        winterTotal = winterTotal / monthsPerSeason
        springTotal = springTotal / monthsPerSeason
        summerTotal = summerTotal / monthsPerSeason
        fallTotal = fallTotal / monthsPerSeason
    }

    // winter
    normProperties.seasonalNorms[0].total += winterTotal
    normProperties.seasonalNorms[0].values.push(winterTotal)
    // spring
    normProperties.seasonalNorms[1].total += springTotal
    normProperties.seasonalNorms[1].values.push(springTotal)
    // summer
    normProperties.seasonalNorms[2].total += summerTotal
    normProperties.seasonalNorms[2].values.push(summerTotal)
    // fall
    normProperties.seasonalNorms[3].total += fallTotal
    normProperties.seasonalNorms[3].values.push(fallTotal)
}

async function calculateAndInsertMonthlyNorms(yearData, normProperties, connection){
    
    var query = ''
    
    if(yearData.DataType === precipDatatype){
        query = insertMonthlyPrecipNormsQuery
    } else if (yearData.DataType === tempDatatype){
        query = insertMonthlyTempNormsQuery
    }

    for (var i in yearData.MonthData){

        var totalMonths = normProperties.monthlyNorms[monthValues[i]].values.length
        var monthlyMean = normProperties.monthlyNorms[monthValues[i]].total / totalMonths
        var sumOfSquares = normProperties.monthlyNorms[monthValues[i]].values.reduce((acc, val) => acc + Math.pow((val - monthlyMean), 2), 0)

        var stddev = Math.sqrt(sumOfSquares / totalMonths)

        // Round mean and stddev to 2 decimal places
        monthlyMean = roundToTwo(monthlyMean)
        stddev = roundToTwo(stddev)

        if (!isNaN(monthlyMean) && stddev !== null) {
            console.log(`Inserting monthly norm data: ${yearData.CountyCode}, ${yearData.StateCode}, ${yearData.CountyID}, ${monthValues[i]}, ${monthlyMean}, ${stddev}`)
            var queryParams = [yearData.CountyID, monthValues[i], monthlyMean, stddev]
            await connection.execute(query, queryParams)
        }
    }
}

async function calculateAndInsertYearlyNorms(yearData, normProperties, connection){

    var query = ''
    
    if(yearData.DataType === precipDatatype){
        query = insertYearlyPrecipNormsQuery
    } else if (yearData.DataType === tempDatatype){
        query = insertYearlyTempNormsQuery
    }

    var totalYears = normProperties.yearlyNorms.values.length
    var yearlyMean = normProperties.yearlyNorms.total / totalYears
    var sumOfSquares = normProperties.yearlyNorms.values.reduce((acc, val) => acc + Math.pow((val - yearlyMean), 2), 0)

    var stddev = Math.sqrt(sumOfSquares / totalYears)

    // Round mean and stddev to 2 decimal places
    yearlyMean = roundToTwo(yearlyMean)
    stddev = roundToTwo(stddev)

    if (!isNaN(yearlyMean) && stddev !== null) {
        console.log(`Inserting monthly norm data: ${yearData.CountyCode}, ${yearData.StateCode}, ${yearData.CountyID}, ${yearlyMean}, ${stddev}`)
        var queryParams = [yearData.CountyID, yearlyMean, stddev]
        await connection.execute(query, queryParams)
    }

}

async function calculateAndInsertSeasonalNorms(yearData, normProperties, connection){

    var query = ''
    
    if(yearData.DataType === precipDatatype){
        query = insertSeasonalPrecipNormsQuery
    } else if (yearData.DataType === tempDatatype){
        query = insertSeasonalTempNormsQuery
    }

    for (var i in seasonalValues){

        var totalSeasons = normProperties.seasonalNorms[seasonalValues[i]].values.length
        var seasonalMean = normProperties.seasonalNorms[seasonalValues[i]].total / totalSeasons
        var sumOfSquares = normProperties.seasonalNorms[seasonalValues[i]].values.reduce((acc, val) => acc + Math.pow((val - seasonalMean), 2), 0)

        var stddev = Math.sqrt(sumOfSquares / totalSeasons)

        // Round mean and stddev to 2 decimal places
        seasonalMean = roundToTwo(seasonalMean)
        stddev = roundToTwo(stddev)

        if (!isNaN(seasonalMean) && stddev !== null) {
            console.log(`Inserting monthly norm data: ${yearData.CountyCode}, ${yearData.StateCode}, ${yearData.CountyID}, ${seasonalValues[i]}, ${seasonalMean}, ${stddev}`)
            var queryParams = [yearData.CountyID, seasonalValues[i], seasonalMean, stddev]
            await connection.execute(query, queryParams)
        }
    }
}

async function insertWIMonthlyData(yearData, connection){

    var query = ''

    if(yearData.DataType === precipDatatype){
        query = insertWICountyMonthlyPrecipQuery
    } else if (yearData.DataType === tempDatatype){
        query = insertWICountyMonthlyTempQuery
    }

    // Insert monthly data for Wisconsin counties
    for (var i = 0; i < yearData.MonthValues.length; i++) {
        var value = yearData.MonthData[monthValues[i]]

        // Check if the value is valid (-9.99 and -99.90 are invalid)
        if (value != -9.99 && value != -99.90) {
            console.log(`County data to insert: ${yearData.CountyCode}, ${yearData.StateCode}, ${yearData.CountyID}, ${yearData.Year}, ${monthValues[i]}, ${value}`)
            var queryParams = [yearData.CountyID, yearData.Year, monthValues[i], value]
            await connection.execute(query, queryParams)
        }
    }
}

async function insertWIYearlyData(yearData, connection){

    var query = ''

    if(yearData.DataType === precipDatatype){
        query = insertWICountyYearlyPrecipQuery
    } else if (yearData.DataType === tempDatatype){
        query = insertWICountyYearlyTempQuery
    }

    var value = 0
    var yearTotal = 0

    for (var i in yearData.MonthData){

        value = yearData.MonthData[i]

         // Check if the value is valid (-9.99 and -99.90 are invalid)
         if (value != -9.99 && value != -99.90) {
            yearTotal += value
         }
    }

    if (yearData.DataType === tempDatatype){
        yearTotal = yearTotal / yearData.MonthData.length
    }

    console.log(`County data to insert: ${yearData.CountyCode}, ${yearData.StateCode}, ${yearData.CountyID}, ${yearData.Year}, ${yearTotal}`)
    var queryParams = [yearData.CountyID, yearData.Year, yearTotal]
    await connection.execute(query, queryParams)

}

async function insertWISeasonalData(yearData, prevDecember, currentYear, currentMonth, connection){

    var query = ''

    if(yearData.DataType === precipDatatype){
        query = insertWICountySeasonalPrecipQuery
    } else if (yearData.DataType === tempDatatype){
        query = insertWICountySeasonalTempQuery
    }

    var value = 0
    var winterTotal = prevDecember
    var springTotal = 0
    var summerTotal = 0
    var fallTotal = 0
    var monthsPerSeason = 3
    var numWinterMonths = 3
    
    if (yearData.Year === 1895){
        numWinterMonths = 2
    }

    if (yearData.Year === currentYear){

        for (var i in yearData.MonthData){

            value = yearData.MonthData[i]
    
            if (i < 2 && currentMonth > 2){
                winterTotal += value
            } else if (i < 5 && currentMonth > 5){
                springTotal += value
            } else if (i < 8 && currentMonth > 8) {
                summerTotal += value
            } else if (i < 11 && currentMonth === 11) {
                fallTotal += value
            }
        }
    } else {

        for (var i in yearData.MonthData){

            value = yearData.MonthData[i]
    
            if (i < 2){
                winterTotal += value
            } else if (i < 5){
                springTotal += value
            } else if (i < 8) {
                summerTotal += value
            } else if (i < 11) {
                fallTotal += value
            }
        }
    }

    if (yearData.DataType === tempDatatype){
        winterTotal = winterTotal / numWinterMonths
        springTotal = springTotal / monthsPerSeason
        summerTotal = summerTotal / monthsPerSeason
        fallTotal = fallTotal / monthsPerSeason
    }

    // winter
    console.log(`County data to insert: ${yearData.CountyCode}, ${yearData.StateCode}, ${yearData.CountyID}, ${seasonalValues[0]}, ${winterTotal}`)
    var queryParams = [yearData.CountyID, seasonalValues[0], winterTotal]
    await connection.execute(query, queryParams)

    // spring
    console.log(`County data to insert: ${yearData.CountyCode}, ${yearData.StateCode}, ${yearData.CountyID}, ${seasonalValues[1]}, ${springTotal}`)
    var queryParams = [yearData.CountyID, seasonalValues[1], springTotal]
    await connection.execute(query, queryParams)

    // summer
    console.log(`County data to insert: ${yearData.CountyCode}, ${yearData.StateCode}, ${yearData.CountyID}, ${seasonalValues[2]}, ${summerTotal}`)
    var queryParams = [yearData.CountyID, seasonalValues[2], summerTotal]
    await connection.execute(query, queryParams)

    // fall
    console.log(`County data to insert: ${yearData.CountyCode}, ${yearData.StateCode}, ${yearData.CountyID}, ${seasonalValues[3]}, ${fallTotal}`)
    var queryParams = [yearData.CountyID, seasonalValues[3], fallTotal]
    await connection.execute(query, queryParams) 

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
            await fetchDataFromAPI(mainURL.concat(countyPrecipExt), 'County')
            //await fetchDataFromAPI(mainURL.concat(countyTempExt), 'County')
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

async function startServer(port) {
    try {
      // Kill any process currently using port 3000
      await killPort(PORT, 'tcp');
  
      // Start the server on port 3000
      app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
      });
    } catch (err) {
      console.error('Error starting server:', err);
    }
}
  
// Start server on port 3000
startServer(PORT);