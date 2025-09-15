/**
 * All stored procedure / SQL query strings.
 * Logic preserved — only grouped in one module.
 */

// Insert data from NOAA files
// Monthly
const insertWICountyMonthlyPrecipQuery = 'CALL InsertMonthlyPrecipitationWI(?, ?, ?, ?);';
const insertWICountyMonthlyTempQuery   = 'CALL InsertMonthlyTemperatureWI(?, ?, ?, ?);';
const insertMonthlyPrecipNormsQuery    = 'CALL InsertMonthlyPrecipitationNorms(?, ?, ?, ?);';
const insertMonthlyTempNormsQuery      = 'CALL InsertMonthlyTemperatureNorms(?, ?, ?, ?);';

// Yearly
const insertWICountyYearlyPrecipQuery  = 'CALL InsertYearlyPrecipitationWI(?, ?, ?);';
const insertWICountyYearlyTempQuery    = 'CALL InsertYearlyTemperatureWI(?, ?, ?);';
const insertYearlyPrecipNormsQuery     = 'CALL InsertYearlyPrecipitationNorms(?, ?, ?);';
const insertYearlyTempNormsQuery       = 'CALL InsertYearlyTemperatureNorms(?, ?, ?);';

// Seasonal
const insertWICountySeasonalPrecipQuery = 'CALL InsertSeasonalPrecipitationWI(?, ?, ?, ?)';
const insertWICountySeasonalTempQuery   = 'CALL InsertSeasonalTemperatureWI(?, ?, ?, ?)';
const insertSeasonalPrecipNormsQuery    = 'CALL InsertSeasonalPrecipitationNorms(?, ?, ?, ?)';
const insertSeasonalTempNormsQuery      = 'CALL InsertSeasonalTemperatureNorms(?, ?, ?, ?)';

// Calculate euclidean distances
// Monthly
const calculateMonthlyPrecipDistancesQuery   = 'CALL CalculateMonthlyPrecipitationDistances();';
const calculateMonthlyTempDistancesQuery     = 'CALL CalculateMonthlyTemperatureDistances();';
const calculateMonthlyCombinedDistancesQuery = 'CALL CalculateAllMonthlyCombinedDistances();';

// Seasonal
const calculateSeasonalPrecipDistancesQuery   = 'CALL CalculateSeasonalPrecipitationDistances();';
const calculateSeasonalTempDistancesQuery     = 'CALL CalculateSeasonalTemperatureDistances();';
const calculateSeasonalCombinedDistancesQuery = 'CALL CalculateAllSeasonalCombinedDistances();';

// Yearly
const calculateYearlyPrecipDistancesQuery   = 'CALL CalculateYearlyPrecipitationDistances();';
const calculateYearlyTempDistancesQuery     = 'CALL CalculateYearlyTemperatureDistances();';
const calculateYearlyCombinedDistancesQuery = 'CALL CalculateYearlyCombinedDistances();';

// Get yearly top analogs
const getTopPrecipitationAnalogsByYearQuery = 'CALL GetAllTopPrecipAnalogsForCountyByYear(?);';
const getTopTemperatureAnalogsByYearQuery   = 'CALL GetAllTopTempAnalogsForCountyByYear(?);';
const getTopCombinedAnalogsByYearQuery      = 'CALL GetAllTopCombinedAnalogsForCountyByYear(?);';

// Get yearly analogs by year
const getPrecipitationAnalogsByYearQuery = 'CALL GetTopPrecipAnalogsForCountyByYear(?, ?);';
const getTemperatureAnalogsByYearQuery   = 'CALL GetTopTempAnalogsForCountyByYear(?, ?);';
const getCombinedAnalogsByYearQuery      = 'CALL GetTopCombinedAnalogsForCountyByYear(?, ?);';

// Get seasonal top analogs
const getTopPrecipitationAnalogsBySeasonQuery = 'CALL GetAllTopPrecipAnalogsForCountyBySeason(?, ?);';
const getTopTemperatureAnalogsBySeasonQuery   = 'CALL GetAllTopTempAnalogsForCountyBySeason(?, ?);';
const getTopCombinedAnalogsBySeasonQuery      = 'CALL GetAllTopCombinedAnalogsForCountyBySeason(?, ?);';

// Get seasonal analogs by year
const getPrecipitationAnalogsBySeasonQuery = 'CALL GetPrecipAnalogsForCountyByYearAndSeason(?, ?, ?);';
const getTemperatureAnalogsBySeasonQuery   = 'CALL GetTempAnalogsForCountyByYearAndSeason(?, ?, ?);';
const getCombinedAnalogsBySeasonQuery      = 'CALL GetCombinedAnalogsForCountyByYearAndSeason(?, ?, ?);';

// Get monthly top analogs
const getTopPrecipitationAnalogsByMonthQuery = 'CALL GetAllTopPrecipAnalogsForCountyByMonth(?, ?);';
const getTopTemperatureAnalogsByMonthQuery   = 'CALL GetAllTopTempAnalogsForCountyByMonth(?, ?);';
const getTopCombinedAnalogsByMonthQuery      = 'CALL GetAllTopCombinedAnalogsForCountyByMonth(?, ?);';

// Get monthly analogs by year
const getPrecipitationAnalogsByMonthQuery = 'CALL GetPrecipAnalogsForCountyByYearAndMonth(?, ?, ?);';
const getTemperatureAnalogsByMonthQuery   = 'CALL GetTempAnalogsForCountyByYearAndMonth(?, ?, ?);';
const getCombinedAnalogsByMonthQuery      = 'CALL GetCombinedAnalogsForCountyByYearAndMonth(?, ?, ?);';

// Other queries
const getCountyIdByStateAndCountyCodes = 'CALL GetCountyIDByCodeAndState(?, ?);';
const getTopAnalogsForTargetByYear     = 'CALL GetTopAnalogForTargetByYear(?);';
const insertCountyQuery                = 'CALL InsertCounty(?, ?, ?, ?, ?)';
const insertStateQuery                 = 'CALL InsertState(?, ?, ?)';

module.exports = {
  insertWICountyMonthlyPrecipQuery,
  insertWICountyMonthlyTempQuery,
  insertMonthlyPrecipNormsQuery,
  insertMonthlyTempNormsQuery,
  insertWICountyYearlyPrecipQuery,
  insertWICountyYearlyTempQuery,
  insertYearlyPrecipNormsQuery,
  insertYearlyTempNormsQuery,
  insertWICountySeasonalPrecipQuery,
  insertWICountySeasonalTempQuery,
  insertSeasonalPrecipNormsQuery,
  insertSeasonalTempNormsQuery,
  calculateMonthlyPrecipDistancesQuery,
  calculateMonthlyTempDistancesQuery,
  calculateMonthlyCombinedDistancesQuery,
  calculateSeasonalPrecipDistancesQuery,
  calculateSeasonalTempDistancesQuery,
  calculateSeasonalCombinedDistancesQuery,
  calculateYearlyPrecipDistancesQuery,
  calculateYearlyTempDistancesQuery,
  calculateYearlyCombinedDistancesQuery,
  getTopPrecipitationAnalogsByYearQuery,
  getTopTemperatureAnalogsByYearQuery,
  getTopCombinedAnalogsByYearQuery,
  getPrecipitationAnalogsByYearQuery,
  getTemperatureAnalogsByYearQuery,
  getCombinedAnalogsByYearQuery,
  getTopPrecipitationAnalogsBySeasonQuery,
  getTopTemperatureAnalogsBySeasonQuery,
  getTopCombinedAnalogsBySeasonQuery,
  getPrecipitationAnalogsBySeasonQuery,
  getTemperatureAnalogsBySeasonQuery,
  getCombinedAnalogsBySeasonQuery,
  getTopPrecipitationAnalogsByMonthQuery,
  getTopTemperatureAnalogsByMonthQuery,
  getTopCombinedAnalogsByMonthQuery,
  getPrecipitationAnalogsByMonthQuery,
  getTemperatureAnalogsByMonthQuery,
  getCombinedAnalogsByMonthQuery,
  getCountyIdByStateAndCountyCodes,
  getTopAnalogsForTargetByYear,
  insertCountyQuery,
  insertStateQuery,
};
