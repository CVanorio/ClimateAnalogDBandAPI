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
const insertWICountyYearlyTempQuery = 'CALL InsertYearlyTemperatureWI(?, ?, ?);'
const insertYearlyPrecipNormsQuery = 'CALL InsertYearlyPrecipitationNorms(?, ?, ?);'
const insertYearlyTempNormsQuery = 'CALL InsertYearlyTemperatureNorms(?, ?, ?);'
const insertWICountySeasonalPrecipQuery = 'CALL InsertSeasonalPrecipitationWI(?, ?, ?, ?)'
const insertWICountySeasonalTempQuery = 'CALL InsertSeasonalTemperatureWI(?, ?, ?, ?)'
const insertSeasonalPrecipNormsQuery = 'CALL InsertSeasonalPrecipitationNorms(?, ?, ?, ?)'
const insertSeasonalTempNormsQuery = 'CALL InsertSeasonalTemperatureNorms(?, ?, ?, ?)'

const calculateMonthlyPrecipDistancesQuery = 'CALL CalculateMonthlyPrecipitationDistances();'
const calculateMonthlyTempDistancesQuery = 'CALL CalculateMonthlyTemperatureDistances();'
const calculateMonthlyCombinedDistancesQuery = 'CALL CalculateMonthlyCombinedDistances();'
const calculateSeasonalPrecipDistancesQuery = 'CALL CalculateSeasonalPrecipitationDistances();'
const calculateSeasonalTempDistancesQuery = 'CALL CalculateSeasonalTemperatureDistances();'
const calculateSeasonalCombinedDistancesQuery = 'CALL CalculateSeasonalCombinedDistances();'
const calculateYearlyPrecipDistancesQuery = 'CALL CalculateYearlyPrecipitationDistances();'
const calculateYearlyTempDistancesQuery = 'CALL CalculateYearlyTemperatureDistances();'
const calculateYearlyCombinedDistancesQuery = 'CALL CalculateYearlyCombinedDistances();'

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
    database    : process.env.DB_NAME,
    waitForConnections  : true,
    connectionLimit     : 100,
    queueLimit          : 0
};

const pool = mysql.createPool(connectionOptions);

// Create connection
//const db = mysql.createConnection(connectionOptions);

// Function to fetch data from the API
async function fetchDataFromAPI(url, scale) {
    try {
        var response = await axios.get(url)
        var data = response.data
        var result = null
        // Parse and insert data into the database based on scale
        if (scale === 'County') {
            result = await parseAndInsertAllNormsAndWIData(data)
        } else if (scale === 'Grid') {
            // Implement parsing and storing for grid data if needed
        }

        // Return the result from parseAndInsertAllNormsAndWIData
        if (result.success) {
            return {
                success: true,
                data: data
            };
        } else {
            return {
                success: false,
                error: `Error parsing and inserting ${scale} data: ${result.error}`
            };
        }

    } catch (error) {
        console.error(`Error fetching ${scale} data from API:`, error);
        return {
            success: false,
            error: `Error fetching ${scale} data from API: ${error.message}`
        };
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
        // Get a connection from the pool
        connection = await pool.getConnection();
        console.log('Database connected successfully');

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

        // Check if the last line is an empty string
        if (lines[lines.length - 1] === '') {
            lines.pop(); // Remove the last element
        }

        // Iterate over each line and process separately
        for (var line of lines) {

            yearData = await parseMonthlyLineData(line, connection)

            if (yearData.CountyID === null){ continue }

            if (yearData.Year === 1895) { prevDecember = null}

            if (yearData.Year >= climateNormalYears[0] && yearData.Year <= climateNormalYears[1]){

                await calculateNorms(yearData, prevDecember, normProperties, connection)

            }

            if (yearData.StateCode === '47') {
                await insertWIMonthlyData(yearData, connection)
                await insertWISeasonalData(yearData, prevDecember, currentYear, currentMonth, connection)

                if (yearData.Year !== currentYear){
                    await insertWIYearlyData(yearData, connection)
                }
            }

            prevDecember = yearData.MonthData[11]
        }

        if(yearData.DataType === precipDatatype){
            await calculatePrecipDistances(connection)
        } else if (yearData.DataType === tempDatatype){
            await calculateTempDistances(connection)
        }

        console.log('All data inserted successfully.')

        return {
            success: true,
            data: responseData
        };

    } catch (error) {
        console.error('Error inserting data:', error)
        return {
            success: false,
            error: `Error inserting data: ${error.message}`
        };
    } finally {
        if (connection) {
            // Close the database connection
            await connection.end()
            console.log('Database connection closed.')
        }
    }
}

async function parseMonthlyLineData(line, connection){

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
        MonthData: []
    }

    for (var i = 0; i < monthPositions.length; i++) {
        var { start, end } = monthPositions[i]
        var month = monthValues[i]
        var value = parseFloat(line.substring(start, end))

        yearData.MonthData.push(value)

    }

    return yearData
}

async function calculateNorms(yearData, prevDecember, normProperties, connection) {

    storeMonthlyValues(yearData, normProperties)
    storeYearlyValues(yearData, normProperties)
    storeSeasonalValues(yearData, prevDecember, normProperties)

    if (yearData.Year == climateNormalYears[1]) {

        await calculateAndInsertMonthlyNorms(yearData, normProperties, connection)
        await calculateAndInsertYearlyNorms(yearData, normProperties, connection)
        await calculateAndInsertSeasonalNorms(yearData, normProperties, connection)
        normProperties.monthlyNorms = {}
        normProperties.seasonalNorms = {}
        normProperties.yearlyNorms = {}
    }
}

function storeMonthlyValues(yearData, normProperties){

    var value = 0

    for (var i in yearData.MonthData){

        if (!normProperties.monthlyNorms[i]){
            normProperties.monthlyNorms[i] = {total: 0, values: []}
        }

        value = yearData.MonthData[i]

         // Check if the value is valid (-9.99 and -99.90 are invalid)
         if (value != -9.99 && value != -99.90) {
            normProperties.monthlyNorms[i].total += value;
            normProperties.monthlyNorms[i].values.push(value);
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

    yearTotal = roundToTwo(yearTotal)

    normProperties.yearlyNorms.total += yearTotal
    normProperties.yearlyNorms.total = roundToTwo(normProperties.yearlyNorms.total)
    normProperties.yearlyNorms.values.push(yearTotal)
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

    winterTotal = roundToTwo(winterTotal)
    springTotal = roundToTwo(springTotal)
    summerTotal = roundToTwo(summerTotal)
    fallTotal = roundToTwo(fallTotal)

    // winter
    normProperties.seasonalNorms[seasonalValues[0]].total += winterTotal
    normProperties.seasonalNorms[seasonalValues[0]].values.push(winterTotal)
    
    // spring
    normProperties.seasonalNorms[seasonalValues[1]].total += springTotal
    normProperties.seasonalNorms[seasonalValues[1]].values.push(springTotal)
    // summer
    normProperties.seasonalNorms[seasonalValues[2]].total += summerTotal
    normProperties.seasonalNorms[seasonalValues[2]].values.push(summerTotal)
    // fall
    normProperties.seasonalNorms[seasonalValues[3]].total += fallTotal
    normProperties.seasonalNorms[seasonalValues[3]].values.push(fallTotal)
}

async function calculateAndInsertMonthlyNorms(yearData, normProperties, connection){
    
    var query = ''
    
    if(yearData.DataType === precipDatatype){
        query = insertMonthlyPrecipNormsQuery
    } else if (yearData.DataType === tempDatatype){
        query = insertMonthlyTempNormsQuery
    }

    for (var i in yearData.MonthData){

        var totalMonths = normProperties.monthlyNorms[i].values.length
        var monthlyMean = normProperties.monthlyNorms[i].total / totalMonths
        var sumOfSquares = normProperties.monthlyNorms[i].values.reduce((acc, val) => acc + Math.pow((val - monthlyMean), 2), 0)

        var stddev = Math.sqrt(sumOfSquares / totalMonths)

        // Round mean and stddev to 2 decimal places
        monthlyMean = roundToTwo(monthlyMean)
        stddev = roundToTwo(stddev)

        if (!isNaN(monthlyMean) && stddev !== null) {
            //console.log(`Inserting monthly norm data: ${yearData.CountyCode}, ${yearData.StateCode}, ${yearData.CountyID}, ${monthValues[i]}, ${monthlyMean}, ${stddev}`)
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
        //console.log(`Inserting yearly norm data: ${yearData.CountyCode}, ${yearData.StateCode}, ${yearData.CountyID}, ${yearData.Year}, ${yearlyMean}, ${stddev}`)
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
            //console.log(`Inserting monthly norm data: ${yearData.CountyCode}, ${yearData.StateCode}, ${yearData.CountyID}, ${seasonalValues[i]}, ${seasonalMean}, ${stddev}`)
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
    for (var i = 0; i < yearData.MonthData.length; i++) {
        var value = yearData.MonthData[i]

        // Check if the value is valid (-9.99 and -99.90 are invalid)
        if (value != -9.99 && value != -99.90) {
            //console.log(`County data to insert: ${yearData.CountyCode}, ${yearData.StateCode}, ${yearData.CountyID}, ${yearData.Year}, ${monthValues[i]}, ${value}`)
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

    //console.log(`County data to insert: ${yearData.CountyCode}, ${yearData.StateCode}, ${yearData.CountyID}, ${yearData.Year}, ${yearTotal}`)
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
        winterTotal = winterTotal / monthsPerSeason
        springTotal = springTotal / monthsPerSeason
        summerTotal = summerTotal / monthsPerSeason
        fallTotal = fallTotal / monthsPerSeason
    }

    winterTotal = roundToTwo(winterTotal)
    springTotal = roundToTwo(springTotal)
    summerTotal = roundToTwo(summerTotal)
    fallTotal = roundToTwo(fallTotal)

    // winter
    if (yearData.Year !== 1895){
        //console.log(`County data to insert: ${yearData.CountyCode}, ${yearData.StateCode}, ${yearData.CountyID}, ${seasonalValues[0]}, ${winterTotal}`)
        var queryParams = [yearData.CountyID, yearData.Year, seasonalValues[0], winterTotal]
        await connection.execute(query, queryParams)
    }

    // spring
    //console.log(`County data to insert: ${yearData.CountyCode}, ${yearData.StateCode}, ${yearData.CountyID}, ${seasonalValues[1]}, ${springTotal}`)
    var queryParams = [yearData.CountyID, yearData.Year, seasonalValues[1], springTotal]
    await connection.execute(query, queryParams)

    // summer
    //console.log(`County data to insert: ${yearData.CountyCode}, ${yearData.StateCode}, ${yearData.CountyID}, ${seasonalValues[2]}, ${summerTotal}`)
    var queryParams = [yearData.CountyID, yearData.Year, seasonalValues[2], summerTotal]
    await connection.execute(query, queryParams)

    // fall
    //console.log(`County data to insert: ${yearData.CountyCode}, ${yearData.StateCode}, ${yearData.CountyID}, ${seasonalValues[3]}, ${fallTotal}`)
    var queryParams = [yearData.CountyID, yearData.Year, seasonalValues[3], fallTotal]
    await connection.execute(query, queryParams) 

}

async function calculatePrecipDistances(connection){
    
    console.log("Calculating Precip variable distances!")
    //await connection.execute(calculateMonthlyPrecipDistancesQuery) 
    //await connection.execute(calculateSeasonalPrecipDistancesQuery) 
    await connection.execute(calculateYearlyPrecipDistancesQuery) 
    
}

async function calculateTempDistances(connection){

    console.log("Calculating Temp variable distances!")
    //await connection.execute(calculateMonthlyTempDistancesQuery)
    //await connection.execute(calculateSeasonalTempDistancesQuery)
    await connection.execute(calculateYearlyTempDistancesQuery) 
}

async function calculateTwoVariableDistances(connection){
    console.log("Calculating Combined variable distances!")
    //await connection.execute(calculateMonthlyCombinedDistancesQuery)
   // await connection.execute(calculateSeasonalCombinedDistancesQuery) 
    await connection.execute(calculateYearlyCombinedDistancesQuery) 

}




// Add all county data
app.get('/addallcountydata', async (req, res) => {
    try {
           // Use Promise.all to wait for both fetchDataFromAPI calls to complete
        var preciptResult = null
        var tempResult = null
        await Promise.all([
            preciptResult = fetchDataFromAPI(mainURL.concat(countyPrecipExt), 'County'),
            tempResult = fetchDataFromAPI(mainURL.concat(countyTempExt), 'County')
        ]);

         // Check results and handle accordingly
         if (result1.success && result2.success) {
            await calculateTwoVariableDistances();
            res.send('All county data added successfully.');
        } else {
            res.status(500).send('Error adding county data.');
        }

        res.send('All county data added successfully.');

    } catch (error) {
        if (error.response) {
            console.error('Error response from server:', error.response.status, error.response.data);
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Error setting up the request:', error.message);
        }
        console.error('Error details:', error.config);
        res.status(500).send('Error adding county data.');
    }

});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

// Define the function to call the stored procedure and write the results to a file
async function getTopAnalogsByYear(targetCountyName) {

    var connection;

    try {
        // Define connection to the MySQL database
        connection = await mysql.createConnection(connectionOptions);
        console.log('MySQL Connected');

        var [rows] = await connection.execute(getTopAnalogsForTargetByYear, [targetCountyName])

        //console.log(rows)

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