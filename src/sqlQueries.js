// sqlQueries.js

const sqlQueries = {
    insertWICountyMonthlyPrecipQuery: 'CALL InsertMonthlyPrecipitationWI(?, ?, ?, ?);',
    insertWICountyMonthlyTempQuery: 'CALL InsertMonthlyTemperatureWI(?, ?, ?, ?);',
    insertMonthlyPrecipNormsQuery: 'CALL InsertMonthlyPrecipitationNorms(?, ?, ?, ?);',
    insertMonthlyTempNormsQuery: 'CALL InsertMonthlyTemperatureNorms(?, ?, ?, ?);',
    insertWICountyYearlyPrecipQuery: 'CALL InsertYearlyPrecipitationWI(?, ?, ?);',
    insertWICountyYearlyTempQuery: 'CALL InsertYearlyTemperatureWI(?, ?, ?);',
    insertYearlyPrecipNormsQuery: 'CALL InsertYearlyPrecipitationNorms(?, ?, ?);',
    insertYearlyTempNormsQuery: 'CALL InsertYearlyTemperatureNorms(?, ?, ?);',
    insertWICountySeasonalPrecipQuery: 'CALL InsertSeasonalPrecipitationWI(?, ?, ?, ?)',
    insertWICountySeasonalTempQuery: 'CALL InsertSeasonalTemperatureWI(?, ?, ?, ?)',
    insertSeasonalPrecipNormsQuery: 'CALL InsertSeasonalPrecipitationNorms(?, ?, ?, ?)',
    insertSeasonalTempNormsQuery: 'CALL InsertSeasonalTemperatureNorms(?, ?, ?, ?)',
    
    calculateYearlyCombinedDistancesQuery: 'CALL CalculateYearlyCombinedDistances();',
    getCountyIdByStateAndCountyCodes: 'CALL GetCountyIDByCodeAndState(?, ?);',
    getTopAnalogsForTargetByYear: 'CALL GetTopAnalogForTargetByYear(?);',
    insertCountyQuery: 'CALL InsertCounty(?, ?, ?, ?, ?)',
    insertStateQuery: 'CALL InsertState(?, ?, ?)'
    // Add other queries as needed
};


module.exports = sqlQueries;
