// ProcessData.js

const axios = require('axios');
const { getConnection } = require('./database');
const { monthValues, monthPositions, seasonalValues, precipDatatype, tempDatatype } = require('../config/constants');
const sqlQueries = require('./sqlQueries');


async function fetchDataFromAPI(url, scale) {
    try {
        const response = await axios.get(url);
        const data = response.data;

        if (scale === 'County') {
            await parseAndInsertAllNormsAndWIData(data);
        } else if (scale === 'Grid') {
            // Implement parsing and storing for grid data if needed
        }

        return { success: true, data };
    } catch (error) {
        console.error(`Error fetching ${scale} data from API:`, error);
        return { success: false, error: `Error fetching ${scale} data from API: ${error.message}` };
    }
}

function roundToTwo(num) {
    return Math.round(num * 100) / 100;
}

// Function to parse the response data and store it in the database
async function parseAndInsertAllNormsAndWIData(responseData) {
    var connection

    try {
        // Get a connection from the pool
        connection = getConnection()
        console.log('Database connected successfully')

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
            connection.release()
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
        query = sqlQueries.insertMonthlyPrecipNormsQuery
    } else if (yearData.DataType === tempDatatype){
        query = sqlQueries.insertMonthlyTempNormsQuery
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
        query = sqlQueries.insertYearlyPrecipNormsQuery
    } else if (yearData.DataType === tempDatatype){
        query = sqlQueries.insertYearlyTempNormsQuery
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
        query = sqlQueries.insertSeasonalPrecipNormsQuery
    } else if (yearData.DataType === tempDatatype){
        query = sqlQueries.insertSeasonalTempNormsQuery
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
        query = sqlQueries.insertWICountyMonthlyPrecipQuery
    } else if (yearData.DataType === tempDatatype){
        query = sqlQueries.insertWICountyMonthlyTempQuery
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
        query = sqlQueries.insertWICountyYearlyPrecipQuery
    } else if (yearData.DataType === tempDatatype){
        query = sqlQueries.insertWICountyYearlyTempQuery
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
        query = sqlQueries.insertWICountySeasonalPrecipQuery
    } else if (yearData.DataType === tempDatatype){
        query = sqlQueries.insertWICountySeasonalTempQuery
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

// async function calculatePrecipDistances(connection){
    
//     console.log("Calculating Precip variable distances!")
//     //await connection.execute(calculateMonthlyPrecipDistancesQuery) 
//     //await connection.execute(calculateSeasonalPrecipDistancesQuery) 
//     await connection.execute(calculateYearlyPrecipDistancesQuery) 
    
// }

// async function calculateTempDistances(connection){

//     console.log("Calculating Temp variable distances!")
//     //await connection.execute(calculateMonthlyTempDistancesQuery)
//     //await connection.execute(calculateSeasonalTempDistancesQuery)
//     await connection.execute(calculateYearlyTempDistancesQuery) 
// }

// async function calculateTwoVariableDistances(connection){
//     console.log("Calculating Combined variable distances!")
//     //await connection.execute(calculateMonthlyCombinedDistancesQuery)
//    // await connection.execute(calculateSeasonalCombinedDistancesQuery) 
//     await connection.execute(calculateYearlyCombinedDistancesQuery) 

// }

async function calculateYearlyDistances(connection){

    console.log("Calculating yearly distances!")
    //await connection.execute(sqlQueries.calculateYearlyDistancesQuery) 
    await connection.execute(sqlQueries.calculateYearlyCombinedDistancesQuery)
}


// Function to parse the response data and store it in the database
async function calculateAndInsertEuclideanDistances() {
    var connection

    try {
        // Get a connection from the pool
        connection = await pool.getConnection()
        console.log('Database connected successfully')

        await calculateYearlyDistances(connection)
        
        //await calculateTempDistances(connection)

        //await calculateTwoVariableDistances(connection)

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
            connection.release()
            console.log('Database connection closed.')
        }
    }
}

module.exports = {
    fetchDataFromAPI,
    //parseAndInsertAllNormsAndWIData
};
