const precipDatatype = '01'
const tempDatatype = '02'

// Function to parse the response data and store it in the database
async function parseAndStoreWICountyData(responseData) {
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

                await calculateNorms(yearData, prevDecember, normProperties, connection)

            }

            if (StateCode === '47') {
                await insertWIMonthlyData(yearData, connection)
                await insertWISeasonalData(yearData, prevDecember, currentYear, currentMonth, connection)

                if (yearData.Year !== currentYear){
                    await insertWIYearlyData(yearData, connection)
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
    console.log(`County data to insert: ${yearData.CountyCode}, ${yearData.StateCode}, ${yearData.CountyID}, ${seasonalValue[0]}, ${winterTotal}`)
    var queryParams = [yearData.CountyID, seasonalValue[0], winterTotal]
    await connection.execute(query, queryParams)

    // spring
    console.log(`County data to insert: ${yearData.CountyCode}, ${yearData.StateCode}, ${yearData.CountyID}, ${seasonalValue[1]}, ${springTotal}`)
    var queryParams = [yearData.CountyID, seasonalValue[1], springTotal]
    await connection.execute(query, queryParams)

    // summer
    console.log(`County data to insert: ${yearData.CountyCode}, ${yearData.StateCode}, ${yearData.CountyID}, ${seasonalValue[2]}, ${summerTotal}`)
    var queryParams = [yearData.CountyID, seasonalValue[2], summerTotal]
    await connection.execute(query, queryParams)

    // fall
    console.log(`County data to insert: ${yearData.CountyCode}, ${yearData.StateCode}, ${yearData.CountyID}, ${seasonalValue[3]}, ${fallTotal}`)
    var queryParams = [yearData.CountyID, seasonalValue[3], fallTotal]
    await connection.execute(query, queryParams) 

}