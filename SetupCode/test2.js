const precipDatatype = '01'
const tempDatatype = '02'

// Function to parse the response data and store it in the database
async function parseAndStoreWICountyData(responseData) {
    var connection

    try {
        // Define connection to the MySQL database
        connection = await mysql.createConnection(connectionOptions)
        console.log('MySQL Connected')

        // var currentYear = new Date().getFullYear()
        // var currentMonth = new Date().getMonth()
        var lines = responseData.split('\n')
        
        // // Initialize variables for accumulating monthly and yearly totals
        // var monthlyTotals = {
        //     '01': 0, '02': 0, '03': 0, '04': 0, '05': 0, '06': 0,
        //     '07': 0, '08': 0, '09': 0, '10': 0, '11': 0, '12': 0
        // }

        // var monthlyData = {
        //     '01': [], '02': [], '03': [], '04': [], '05': [], '06': [],
        //     '07': [], '08': [], '09': [], '10': [], '11': [], '12': []
        // }

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

                calculateNorms(yearData, prevDecember, normProperties)

            }

            if (StateCode === '47') {
                await insertWIMonthlyData(yearData, connection)
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
        MonthData: []
    }

    for (var i = 0; i < monthPositions.length; i++) {
        var { start, end } = monthPositions[i]
        var month = monthValues[i]
        var value = parseFloat(line.substring(start, end))

        yearData.MonthData[month] = value

    }

    return yearData
}


async function insertWIMonthlyData(yearData, connection){

    var query = ''

    if(yearData.DataType === precipDatatype){
        query = insertWICountyPrecipQuery
    } else if (yearData.DataType === tempDatatype){
        query = insertWICountyTempQuery
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

function calculateNorms(yearData, prevDecember)