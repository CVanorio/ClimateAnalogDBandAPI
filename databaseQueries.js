// databaseQueries.js
const db = require('./src/database'); // Your database connection

const getTopAnalogsByYear = async (county, dataType) => {
  // Call the stored procedure for top analogs by year
  const result = null
  if (dataType === "Both"){
    result = await db.query('CALL GetTopCombinedAnalogsByYear(?);', [county])
  } else if (dataType === "Precipitation") {
    result = await db.query('CALL GetTopPrecipitationAnalogsByYear(?);', [county])
  } else if (dataType === "Temperature"){
    result = await db.query('CALL GetTopTemperatureAnalogsByYear(?);', [county])
  }
  
  return result;
};

const getDataBySeason = async (county, year, season, dataType) => {
    const rseult = null
    if (dataType === "Both"){
        result = await db.query('CALL GetCombinedDataBySeason(?, ?, ?);', [county, year, season])
    } else if (dataType === "Precipitation") {
        result = await db.query('CALL GetPrecipitationDataBySeason(?, ?, ?);', [county, year, season])
    } else if (dataType === "Temperature"){
        result = await db.query('CALL GetTemperatureDataBySeason(?, ?, ?);', [county, year, season])
    }

  return result;
};

const getDataByMonth = async (county, year, month, dataType) => {
    const result = null
    if (dataType === "Both"){
        result = await db.query('CALL GetCombinedDataByMonth(?, ?, ?);', [county, year, month])
    } else if (dataType === "Precipitation") {
        result = await db.query('CALL GetPrecipitationDataByMonth(?, ?, ?);', [county, year, month])
    } else if (dataType === "Temperature"){
        result = await db.query('CALL GetTemperatureDataByMonth(?, ?, ?);', [county, year, month])
    }

  return result;
};

const getDataForYear = async (county, year, dataType) => {
    const result = null
    if (dataType === "Both"){
        result = await db.query('CALL GetDataForYear(?, ?);', [county, year])
    } else if (dataType === "Precipitation") {
        result = await db.query('CALL GetDataForYear(?, ?);', [county, year])
    } else if (dataType === "Temperature"){
        result = await db.query('CALL GetDataForYear(?, ?);', [county, year])
    }

  return result;
};

module.exports = {
  getTopAnalogsByYear,
  getDataBySeason,
  getDataByMonth,
  getDataForYear,
};
