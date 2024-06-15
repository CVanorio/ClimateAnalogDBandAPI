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

function roundToTwo(num) {
    return Math.round(num * 100) / 100;
}

// Function to parse the response data and store it in the database
async function parseAndStoreWICountyData(responseData) {
    var connection;

    try {
        // Define connection to the MySQL database
        connection = await mysql.createConnection(connectionOptions);
        console.log('MySQL Connected');

        var currentYear = new Date().getFullYear();
        var currentMonth = new Date().getMonth();
        var lines = responseData.split('\n');
        
        // Initialize variables for accumulating monthly and yearly totals
        var monthlyTotals = {
            '01': 0, '02': 0, '03': 0, '04': 0, '05': 0, '06': 0,
            '07': 0, '08': 0, '09': 0, '10': 0, '11': 0, '12': 0
        };

        var monthlyData = {
            '01': [], '02': [], '03': [], '04': [], '05': [], '06': [],
            '07': [], '08': [], '09': [], '10': [], '11': [], '12': []
        }

        var yearlyData = {};
        
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
            var insertYearlyNormDataQuery = '';

            // Set queries based on dataType (precipitation or temperature)
            if (dataType === '01') {
                insertMonthlyDataQuery = insertWICountyPrecipQuery;
                insertMonthlyNormDataQuery = insertMonthlyPrecipNormsQuery;
                insertYearlyDataQuery = insertWICountyYearlyPrecipQuery; 
                insertYearlyNormDataQuery = insertYearlyPrecipNormsQuery; 
            } else if (dataType === '02') {
                insertMonthlyDataQuery = insertWICountyTempQuery;
                insertMonthlyNormDataQuery = insertMonthlyTempNormsQuery;
                insertYearlyDataQuery = insertWICountyYearlyTempQuery; 
                insertYearlyNormDataQuery = insertYearlyTempNormsQuery; 
            }

            // Check if the county exists in the Counties table
            var [rows] = await connection.execute(
                getCountyIdByStateAndCountyCodes,
                [CountyCode, StateCode]
            );

            if (rows.length > 0 && rows[0].length > 0 && rows[0][0].CountyID) {
                var CountyID = rows[0][0].CountyID;

                // Initialize yearly data if not already
                if (!yearlyData[year] && StateCode === '47') {
                    yearlyData[year] = { total: 0, count: 0, values: [] };
                } else if (!yearlyData[year] && year >= climateNormalYears[0] && year <= climateNormalYears[1]){
                    yearlyData[year] = { total: 0, count: 0, values: [] };
                }

                // If state is Wisconsin, add the monthly values to the monthly precipitation or temperature table
                if (StateCode === '47') {
                    // Insert monthly data for Wisconsin counties
                    for (var i = 0; i < monthPositions.length; i++) {
                        var { start, end } = monthPositions[i];
                        var month = monthValues[i];
                        var value = parseFloat(line.substring(start, end));

                        // Check if the value is valid (-9.99 and -99.90 are invalid)
                        if (value != -9.99 && value != -99.90) {
                            console.log(`County data to insert: ${CountyCode}, ${StateCode}, ${CountyID}, ${year}, ${month}, ${value}`);
                            var queryParams = [CountyID, year, month, value];
                            await connection.execute(insertMonthlyDataQuery, queryParams);
                        
                            // Accumulate yearly data
                            yearlyData[year].total += value;
                            yearlyData[year].count += 1;
                            yearlyData[year].values.push(value);
                        }
                    }
                    
                    // Insert yearly data for Wisconsin counties for all years but the current year
                    // Current years are not complete
                    if (year !== currentYear) {
                        if (dataType === '01') { // Precipitation
                            var yearlySum = yearlyData[year].total;
                            var queryParams = [CountyID, year, yearlySum];
                            // await connection.execute(insertYearlyDataQuery, queryParams);
                            console.log(`Yearly Precip data for: ${CountyCode}, ${StateCode}, ${year}, ${yearlySum}`)
                        } else if (dataType === '02') { // Temperature
                            var yearlyAverage = yearlyData[year].total / yearlyData[year].count;
                            var queryParams = [CountyID, year, yearlyAverage];
                            // await connection.execute(insertYearlyDataQuery, queryParams);
                            console.log(`Yearly Temp data for: ${CountyCode}, ${StateCode}, ${year}, ${yearlyAverage}`)
                        }
                    }
                }

                // For all states, get norms for specified normal range
                if (year >= climateNormalYears[0] && year <= climateNormalYears[1]) {
                    //console.log(`Year: ${year}, bool: ${year >= climateNormalYears[0] && year <= climateNormalYears[1]}`)
                    // Accumulate monthly and yearly totals for norms
                    for (var i = 0; i < monthPositions.length; i++) {
                        var { start, end } = monthPositions[i];
                        var month = monthValues[i];
                        var value = parseFloat(line.substring(start, end));

                        // Check if the value is valid (-9.99 and -99.90 are invalid)
                        if (value != -9.99 && value != -99.90) {
                            monthlyTotals[month] += value;
                            monthlyData[month].push(value);
                            
                            // WI county yearly values have already been added
                            if (StateCode != '47'){
                                yearlyData[year].total += value;
                                yearlyData[year].values.push(value);
                               // console.log(`Value: ${value}`)
                            }
                        }
                    }

                    
                    // Insert values and reset monthly totals at end of year range
                    if (year == climateNormalYears[1]) {
                       // console.log(`Year: ${year}, bool: ${year == climateNormalYears[1]}`)
                        
                        for (var month in monthValues) {

                            var totalMonths = monthlyData[monthValues[month]].length;
                            var monthlyMean = monthlyTotals[monthValues[month]] / totalMonths;
                            var sumOfSquares = monthlyData[monthValues[month]].reduce((acc, val) => acc + Math.pow((val - monthlyMean), 2), 0); // Calculate sum

                            var stddev = Math.sqrt(sumOfSquares / totalMonths);

                            // Round mean and stddev to 2 decimal places
                            monthlyMean = roundToTwo(monthlyMean);
                            stddev = roundToTwo(stddev);

                            if (!isNaN(monthlyMean) && stddev !== null) {
                                console.log(`Inserting monthly norm data: ${CountyCode}, ${StateCode}, ${CountyID}, ${monthValues[month]}, ${monthlyMean}, ${stddev}`);
                                var queryParams = [CountyID, monthValues[month], monthlyMean, stddev];
                                await connection.execute(insertMonthlyNormDataQuery, queryParams);
                            }

                            // Reset monthly totals for the next county
                            monthlyTotals[month] = 0;
                            monthlyData[month] = [];
                        }

                        var value = 0;
                        var totalYears = Object.keys(yearlyData).length;
                        var yearlyNormMean = 0;
                        var sumOfSquares = 0;
                        var yearlyNormStddev = 0;

                        if (dataType === '01') { // Precipitation
                            //Get yearly totals
                            var yearlyTotals = []
                            var yearlyTotalSum = 0;
                            
                            for (var y in yearlyData){
                                value = yearlyData[y].total;
                                yearlyTotals.push(value);
                                console.log(`Data in year for loop: ${y}, ${value}`)
                            }

                            yearlyTotalSum = yearlyTotals.reduce((acc, val) => acc + val, 0);
                            console.log(`yearlySum: ${yearlyTotalSum}`)
                            yearlyNormMean = roundToTwo(yearlyTotalSum / totalYears);
                            sumOfSquares = yearlyTotals.reduce((acc, val) => acc + Math.pow((val - yearlyNormMean), 2), 0);
                            yearlyNormStddev = roundToTwo(Math.sqrt(sumOfSquares / totalYears));


                        } else if (dataType === '02') { // Temperature
                            var yearlyAvg = []
                            var yearlyAvgSum = 0;

                            for (var y in yearlyData){
                                value = yearlyData[y].total;
                                avgValue = value/12
                                yearlyAvg.push(avgValue);
                                console.log(`Data in year for loop: ${y}, ${avgValue}`)
                            }

                            yearlyAvgSum = yearlyTotals.reduce((acc, val) => acc + val, 0);
                            console.log(`yearlySum: ${yearlyAvgSum}`)
                            yearlyNormMean = roundToTwo(yearlyAvgSum / totalYears);
                            sumOfSquares = yearlyAvg.reduce((acc, val) => acc + Math.pow((val - yearlyNormMean), 2), 0);
                            yearlyNormStddev = roundToTwo(Math.sqrt(sumOfSquares / totalYears));


                        }
                        console.log(`Inserting yearly Precip norm data: ${CountyCode}, ${StateCode}, ${CountyID}, ${year}, ${yearlyNormMean}, ${yearlyNormStddev}`);

                        if (!isNaN(yearlyNormMean) && yearlyNormStddev !== null) {
                            
                            //console.log(`Inserting yearly Precip norm data: ${CountyCode}, ${StateCode}, ${CountyID}, ${year}, ${yearlyNormMean}, ${yearlyNormStddev}`);
                            var queryParams = [CountyID, yearlyNormMean, yearlyNormStddev];
                            //await connection.execute(insertYearlyNormDataQuery, queryParams);
                        }

                        // reset yearlyData list
                        yearlyData = {}
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