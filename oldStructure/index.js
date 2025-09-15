////////////////////////////////////////////////////////////////////////////////////////////////////
// 1) Imports & Setup
////////////////////////////////////////////////////////////////////////////////////////////////////

const axios = require('axios');
const cors = require('cors');
const mysql = require('mysql2/promise');
const express = require('express');
const jsonfile = require('jsonfile');
const path = require('path');
const fs = require('fs');
const portfinder = require('portfinder');
const killPort = require('kill-port');
const cheerio = require('cheerio');
const startNOAACronJob = require('./cron/syncData');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

////////////////////////////////////////////////////////////////////////////////////////////////////
// 2) Constants
////////////////////////////////////////////////////////////////////////////////////////////////////

const BASE_URL = 'https://www.ncei.noaa.gov/data/nclimdiv-monthly/access/';
const climateNormalYears = [1991, 2020];

const monthValues = ['01','02','03','04','05','06','07','08','09','10','11','12'];

// Month positions in fixed-width NOAA file lines
const monthPositions = [
  { start: 11, end: 18 }, { start: 18, end: 25 }, { start: 25, end: 32 },
  { start: 32, end: 39 }, { start: 39, end: 46 }, { start: 46, end: 53 },
  { start: 53, end: 60 }, { start: 60, end: 67 }, { start: 67, end: 74 },
  { start: 74, end: 81 }, { start: 81, end: 88 }, { start: 88, end: 95 }
];
const seasonalValues = ['winter','spring','summer','fall'];

const precipDatatype = '01';
const tempDatatype = '02';

////////////////////////////////////////////////////////////////////////////////////////////////////
// 3) SQL / Stored Procedure Strings
////////////////////////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////////////////////////
// 4) Database Pool
////////////////////////////////////////////////////////////////////////////////////////////////////

const connectionOptions = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 0
};
const pool = mysql.createPool(connectionOptions);

////////////////////////////////////////////////////////////////////////////////////////////////////
// 5) Generic Helpers
////////////////////////////////////////////////////////////////////////////////////////////////////

function roundToTwo(num) {
  return Math.round(num * 100) / 100;
}

async function withConnection(fn) {
  const conn = await pool.getConnection();
  try {
    return await fn(conn);
  } finally {
    conn.release();
  }
}

// Helper: run a single SQL statement on its own connection (used by distance runners)
async function runOnce(label, sql) {
  console.log(`--- Starting: ${label} ---`);
  const conn = await pool.getConnection();
  try {
    await conn.execute(sql);
    console.log(`Finished: ${label}`);
  } catch (err) {
    console.error(`Error in ${label}:`, err);
    throw err;
  } finally {
    conn.release();
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// 6) NOAA Link Discovery & Fetch
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Scrape NOAA directory to find latest temp & precip county files.
 */
async function getLatestNOAAFileLinks() {
  const BASE_URL = 'https://www.ncei.noaa.gov/data/nclimdiv-monthly/access/';

  function extractDateFromFilename(filename) {
    const match = filename.match(/(\d{8})$/);
    return match ? match[1] : null;
  }

  try {
    const { data } = await axios.get(BASE_URL);
    const $ = cheerio.load(data);

    const tempFiles = [];
    const precipFiles = [];

    $('a').each((i, elem) => {
      const href = $(elem).attr('href');
      const date = extractDateFromFilename(href);
      if (!date) return;

      if (href.startsWith('climdiv-tmpccy-v')) tempFiles.push({ filename: href, date });
      else if (href.startsWith('climdiv-pcpncy-v')) precipFiles.push({ filename: href, date });
    });

    if (!tempFiles.length || !precipFiles.length) {
      throw new Error('NOAA file links not found.');
    }

    const latestTemp   = tempFiles.sort((a, b) => b.date.localeCompare(a.date))[0];
    const latestPrecip = precipFiles.sort((a, b) => b.date.localeCompare(a.date))[0];

    return { tempURL: BASE_URL + latestTemp.filename, precipURL: BASE_URL + latestPrecip.filename };
  } catch (err) {
    console.error('Error fetching NOAA links:', err.message);
    throw err;
  }
}

/**
 * Fetch a file and parse+insert to DB for the given scale.
 */
async function fetchDataFromAPI(url, scale) {
  try {
    const response = await axios.get(url);
    const data = response.data;
    let result = null;

    if (scale === 'County') {
      result = await parseAndInsertAllNormsAndWIData(data);
    } else if (scale === 'Grid') {
      // (future grid support)
    }

    if (result.success) {
      return { success: true, data };
    } else {
      return { success: false, error: `Error parsing and inserting ${scale} data: ${result.error}` };
    }
  } catch (error) {
    console.error(`Error fetching ${scale} data from API:`, error);
    return { success: false, error: `Error fetching ${scale} data from API: ${error.message}` };
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// 7) TEMP Table Management (Inputs & Distances)
////////////////////////////////////////////////////////////////////////////////////////////////////

async function createTempTables(connection) {
  const tables = [
    { name: 'WICountyMonthlyPrecip_TEMP', create: `
      CREATE TABLE WICountyMonthlyPrecip_TEMP (
        CountyID INT, Year INT, Month CHAR(2), Precipitation FLOAT
      );`
    },
    { name: 'WICountyMonthlyTemp_TEMP', create: `
      CREATE TABLE WICountyMonthlyTemp_TEMP (
        CountyID INT, Year INT, Month CHAR(2), Temperature FLOAT
      );`
    },
    { name: 'WICountySeasonalPrecip_TEMP', create: `
      CREATE TABLE WICountySeasonalPrecip_TEMP (
        CountyID INT, Year INT, Season VARCHAR(10), Precipitation FLOAT
      );`
    },
    { name: 'WICountySeasonalTemp_TEMP', create: `
      CREATE TABLE WICountySeasonalTemp_TEMP (
        CountyID INT, Year INT, Season VARCHAR(10), Temperature FLOAT
      );`
    },
    { name: 'WICountyYearlyPrecip_TEMP', create: `
      CREATE TABLE WICountyYearlyPrecip_TEMP (
        CountyID INT, Year INT, Precipitation FLOAT
      );`
    },
    { name: 'WICountyYearlyTemp_TEMP', create: `
      CREATE TABLE WICountyYearlyTemp_TEMP (
        CountyID INT, Year INT, Temperature FLOAT
      );`
    }
  ];

  try {
    for (const { name, create } of tables) {
      await connection.execute(`DROP TABLE IF EXISTS ${name}`);
      await connection.execute(create);
    }
    console.log('Temporary tables dropped and recreated.');
  } catch (error) {
    console.error('Error recreating temp tables:', error.message);
    throw error;
  }
}

async function dropTempTables(connection) {
  const tempTables = [
    // Distance TEMP Tables
    'yearly_precipitation_distances_TEMP',
    'yearly_temperature_distances_TEMP',
    'seasonal_precipitation_distances_TEMP',
    'seasonal_temperature_distances_TEMP',
    'monthly_precipitation_distances_TEMP',
    'monthly_temperature_distances_TEMP',

    // Input TEMP Tables
    'WICountyMonthlyPrecip_TEMP',
    'WICountyMonthlyTemp_TEMP',
    'WICountySeasonalPrecip_TEMP',
    'WICountySeasonalTemp_TEMP',
    'WICountyYearlyPrecip_TEMP',
    'WICountyYearlyTemp_TEMP',
  ];

  for (const table of tempTables) {
    try {
      await connection.query(`DROP TABLE IF EXISTS \`${table}\``);
      console.log(`Dropped table: ${table}`);
    } catch (err) {
      console.error(`Error dropping table ${table}:`, err);
    }
  }
}

async function createTempDistanceTables(connection) {
  const queries = [
    // YEARLY
    `CREATE TABLE IF NOT EXISTS yearly_precipitation_distances_TEMP (
      TargetCountyID INT, AnalogCountyID INT, Year INT, Distance DECIMAL(5,2),
      PRIMARY KEY (TargetCountyID, AnalogCountyID, Year)
    )`,
    `CREATE TABLE IF NOT EXISTS yearly_temperature_distances_TEMP (
      TargetCountyID INT, AnalogCountyID INT, Year INT, Distance DECIMAL(5,2),
      PRIMARY KEY (TargetCountyID, AnalogCountyID, Year)
    )`,
    // SEASONAL
    `CREATE TABLE IF NOT EXISTS seasonal_precipitation_distances_TEMP (
      TargetCountyID INT, AnalogCountyID INT, Year INT, Season VARCHAR(6), Distance DECIMAL(5,2),
      PRIMARY KEY (TargetCountyID, AnalogCountyID, Year, Season)
    )`,
    `CREATE TABLE IF NOT EXISTS seasonal_temperature_distances_TEMP (
      TargetCountyID INT, AnalogCountyID INT, Year INT, Season VARCHAR(6), Distance DECIMAL(5,2),
      PRIMARY KEY (TargetCountyID, AnalogCountyID, Year, Season)
    )`,
    // MONTHLY
    `CREATE TABLE IF NOT EXISTS monthly_precipitation_distances_TEMP (
      TargetCountyID INT, AnalogCountyID INT, Year INT, Month VARCHAR(2), Distance DECIMAL(5,2),
      PRIMARY KEY (TargetCountyID, AnalogCountyID, Year, Month)
    )`,
    `CREATE TABLE IF NOT EXISTS monthly_temperature_distances_TEMP (
      TargetCountyID INT, AnalogCountyID INT, Year INT, Month VARCHAR(2), Distance DECIMAL(5,2),
      PRIMARY KEY (TargetCountyID, AnalogCountyID, Year, Month)
    )`
  ];

  for (const query of queries) {
    await connection.execute(query);
  }
  console.log("All TEMP distance tables created.");
}

// Helpers to wrap create/drop cycles for distance runs
async function createAllTEMPDistanceTables() {
  console.log("--- Creating TEMP distance tables ---");
  const conn = await pool.getConnection();
  try {
    await createTempDistanceTables(conn);
    console.log("TEMP distance tables created");
  } finally {
    conn.release();
  }
}

async function dropAllTempTables() {
  console.log("--- Dropping TEMP tables ---");
  const conn = await pool.getConnection();
  try {
    await dropTempTables(conn);
    console.log("TEMP tables dropped");
  } finally {
    conn.release();
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// 8) Parse, Norms, and Insert (County & Norms)
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Process NOAA file: create temp tables, parse lines, compute norms, insert WI data,
 * and copy temp → final tables.
 */
async function parseAndInsertAllNormsAndWIData(responseData) {
  let connection;

  try {
    connection = await pool.getConnection();
    console.log('Database connected successfully');

    await createTempTables(connection);

    const latestYearMonth = await getLatestInsertedMonth(connection);
    console.log(`Latest inserted (year/month): ${latestYearMonth?.year || 'none'}/${latestYearMonth?.month || 'none'}`);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-based

    const lines = responseData.split('\n');
    let yearData = {};
    let prevDecember = null;
    const normProperties = { monthlyNorms: {}, seasonalNorms: {}, yearlyNorms: {} };

    if (lines[lines.length - 1] === '') lines.pop();

    for (const line of lines) {
      yearData = await parseMonthlyLineData(line, connection);
      if (yearData.CountyID === null) continue;

      if (latestYearMonth && (yearData.Year < latestYearMonth.year ||
        (yearData.Year === latestYearMonth.year && latestYearMonth.month === 12))) {
        continue;
      }

      if (yearData.Year === 1895) prevDecember = null;

      if (yearData.Year >= climateNormalYears[0] && yearData.Year <= climateNormalYears[1]) {
        await calculateNorms(yearData, prevDecember, normProperties, connection);
      }

      if (yearData.StateCode === '47' && (yearData.Year === latestYearMonth.year)) {
        await insertWIMonthlyData(yearData, connection, latestYearMonth);
        await insertWISeasonalData(yearData, prevDecember, currentYear, currentMonth, connection, latestYearMonth);
        if (yearData.Year !== currentYear) {
          await insertWIYearlyData(yearData, connection);
        }
      }

      prevDecember = yearData.MonthData[11];
    }

    await copyTempToDataWITables(connection, yearData.dataType);

    console.log('All data inserted successfully.');
    return { success: true, data: responseData };

  } catch (error) {
    console.error('Error inserting data:', error);
    return { success: false, error: `Error inserting data: ${error.message}` };
  } finally {
    if (connection) {
      connection.release();
      console.log('Database connection closed.');
    }
  }
}

/**
 * Determine the most recent (Year, Month) in WI precipitation table.
 */
async function getLatestInsertedMonth(connection) {
  const [rows] = await connection.execute(`
    SELECT Year, Month
    FROM monthly_precipitation_data_wi
    ORDER BY Year DESC, CAST(Month AS UNSIGNED) DESC
    LIMIT 1;
  `);

  if (rows.length === 0) return null;
  return { year: parseInt(rows[0].Year), month: parseInt(rows[0].Month) };
}

/**
 * Copy from *_TEMP to final WI tables (temperature or precipitation).
 */
async function copyTempToDataWITables(connection, dataType) {
  const isTemp = (dataType === tempDatatype);

  if (isTemp) {
    const tempTables = [
      { temp: 'WICountyMonthlyTemp_TEMP',  target: 'monthly_temperature_data_wi', columns: '(CountyID, Year, Month, Temperature)' },
      { temp: 'WICountySeasonalTemp_TEMP', target: 'seasonal_temperature_data_wi', columns: '(CountyID, Year, Season, Temperature)' },
      { temp: 'WICountyYearlyTemp_TEMP',   target: 'yearly_temperature_data_wi',  columns: '(CountyID, Year, Temperature)' },
    ];
    for (const { temp, target, columns } of tempTables) {
      const query = `INSERT IGNORE INTO ${target} ${columns} SELECT ${columns.slice(1, -1)} FROM ${temp};`;
      await connection.execute(query);
      console.log(`Copied temperature data from ${temp} to ${target}`);
    }
  } else {
    const precipTables = [
      { temp: 'WICountyMonthlyPrecip_TEMP',  target: 'monthly_precipitation_data_wi',  columns: '(CountyID, Year, Month, Precipitation)' },
      { temp: 'WICountySeasonalPrecip_TEMP', target: 'seasonal_precipitation_data_wi', columns: '(CountyID, Year, Season, Precipitation)' },
      { temp: 'WICountyYearlyPrecip_TEMP',   target: 'yearly_precipitation_data_wi',   columns: '(CountyID, Year, Precipitation)' },
    ];
    for (const { temp, target, columns } of precipTables) {
      const query = `INSERT IGNORE INTO ${target} ${columns} SELECT ${columns.slice(1, -1)} FROM ${temp};`;
      await connection.execute(query);
      console.log(`Copied precipitation data from ${temp} to ${target}`);
    }
  }
}

/**
 * Parse a fixed-width NOAA line into structured yearData and resolve CountyID.
 */
async function parseMonthlyLineData(line, connection) {
  const dataType  = line.substring(5, 7);
  const year      = parseInt(line.substring(7, 11));
  const stateCode = line.substring(0, 2);
  const countyCode= line.substring(2, 5);

  const [rows] = await connection.execute(getCountyIdByStateAndCountyCodes, [countyCode, stateCode]);

  let countyID = null;
  if (rows.length > 0 && rows[0].length > 0 && rows[0][0].CountyID) {
    countyID = rows[0][0].CountyID;
  }

  const yearData = {
    CountyID: countyID,
    Year: year,
    DataType: dataType,
    StateCode: stateCode,
    CountyCode: countyCode,
    MonthData: []
  };

  for (let i = 0; i < monthPositions.length; i++) {
    const { start, end } = monthPositions[i];
    const value = parseFloat(line.substring(start, end));
    yearData.MonthData.push(value);
  }

  return yearData;
}

/**
 * Accumulate values across normals window, then insert when end-year reached.
 */
async function calculateNorms(yearData, prevDecember, normProperties, connection) {
  storeMonthlyValues(yearData, normProperties);
  storeYearlyValues(yearData, normProperties);
  storeSeasonalValues(yearData, prevDecember, normProperties);

  if (yearData.Year == climateNormalYears[1]) {
    await calculateAndInsertMonthlyNorms(yearData, normProperties, connection);
    await calculateAndInsertYearlyNorms(yearData, normProperties, connection);
    await calculateAndInsertSeasonalNorms(yearData, normProperties, connection);
    normProperties.monthlyNorms  = {};
    normProperties.seasonalNorms = {};
    normProperties.yearlyNorms   = {};
  }
}

// ---- Norms storage helpers ----

function storeMonthlyValues(yearData, normProperties) {
  for (const i in yearData.MonthData) {
    if (!normProperties.monthlyNorms[i]) {
      normProperties.monthlyNorms[i] = { total: 0, values: [] };
    }
    const value = yearData.MonthData[i];
    if (value != -9.99 && value != -99.90) {
      normProperties.monthlyNorms[i].total += value;
      normProperties.monthlyNorms[i].values.push(value);
    }
  }
}

function storeYearlyValues(yearData, normProperties) {
  if (!normProperties.yearlyNorms.total) {
    normProperties.yearlyNorms = { total: 0, values: [] };
  }

  let yearTotal = 0;
  for (const i in yearData.MonthData) {
    const value = yearData.MonthData[i];
    if (value != -9.99 && value != -99.90) {
      yearTotal += value;
    }
  }
  if (yearData.DataType === tempDatatype) {
    yearTotal = yearTotal / yearData.MonthData.length;
  }
  yearTotal = roundToTwo(yearTotal);

  normProperties.yearlyNorms.total += yearTotal;
  normProperties.yearlyNorms.total = roundToTwo(normProperties.yearlyNorms.total);
  normProperties.yearlyNorms.values.push(yearTotal);
}

function storeSeasonalValues(yearData, prevDecember, normProperties) {
  for (const i in seasonalValues) {
    if (!normProperties.seasonalNorms[seasonalValues[i]]) {
      normProperties.seasonalNorms[seasonalValues[i]] = { total: 0, values: [] };
    }
  }

  let winterTotal = prevDecember;
  let springTotal = 0;
  let summerTotal = 0;
  let fallTotal   = 0;
  const monthsPerSeason = 3;

  for (const i in yearData.MonthData) {
    const value = yearData.MonthData[i];
    if (i < 2)        winterTotal += value;
    else if (i < 5)   springTotal += value;
    else if (i < 8)   summerTotal += value;
    else if (i < 11)  fallTotal   += value;
  }

  if (yearData.DataType === tempDatatype) {
    winterTotal /= monthsPerSeason;
    springTotal /= monthsPerSeason;
    summerTotal /= monthsPerSeason;
    fallTotal   /= monthsPerSeason;
  }

  winterTotal = roundToTwo(winterTotal);
  springTotal = roundToTwo(springTotal);
  summerTotal = roundToTwo(summerTotal);
  fallTotal   = roundToTwo(fallTotal);

  normProperties.seasonalNorms.winter.total += winterTotal;
  normProperties.seasonalNorms.winter.values.push(winterTotal);

  normProperties.seasonalNorms.spring.total += springTotal;
  normProperties.seasonalNorms.spring.values.push(springTotal);

  normProperties.seasonalNorms.summer.total += summerTotal;
  normProperties.seasonalNorms.summer.values.push(summerTotal);

  normProperties.seasonalNorms.fall.total += fallTotal;
  normProperties.seasonalNorms.fall.values.push(fallTotal);
}

// ---- Norms insert helpers ----

async function calculateAndInsertMonthlyNorms(yearData, normProperties, connection) {
  let query = '';
  if (yearData.DataType === precipDatatype) query = insertMonthlyPrecipNormsQuery;
  else if (yearData.DataType === tempDatatype) query = insertMonthlyTempNormsQuery;

  for (const i in yearData.MonthData) {
    const totalMonths = normProperties.monthlyNorms[i].values.length;
    const monthlyMean = normProperties.monthlyNorms[i].total / totalMonths;
    const sumOfSquares = normProperties.monthlyNorms[i].values.reduce((acc, val) => acc + Math.pow((val - monthlyMean), 2), 0);
    let stddev = Math.sqrt(sumOfSquares / totalMonths);

    let meanRounded = roundToTwo(monthlyMean);
    stddev = roundToTwo(stddev);

    if (!isNaN(meanRounded) && stddev !== null) {
      const queryParams = [yearData.CountyID, monthValues[i], meanRounded, stddev];
      await connection.execute(query, queryParams);
    }
  }
}

async function calculateAndInsertYearlyNorms(yearData, normProperties, connection) {
  let query = '';
  if (yearData.DataType === precipDatatype) query = insertYearlyPrecipNormsQuery;
  else if (yearData.DataType === tempDatatype) query = insertYearlyTempNormsQuery;

  const totalYears = normProperties.yearlyNorms.values.length;
  const yearlyMean = normProperties.yearlyNorms.total / totalYears;
  const sumOfSquares = normProperties.yearlyNorms.values.reduce((acc, val) => acc + Math.pow((val - yearlyMean), 2), 0);
  let stddev = Math.sqrt(sumOfSquares / totalYears);

  let meanRounded = roundToTwo(yearlyMean);
  stddev = roundToTwo(stddev);

  if (!isNaN(meanRounded) && stddev !== null) {
    const queryParams = [yearData.CountyID, meanRounded, stddev];
    await connection.execute(query, queryParams);
  }
}

async function calculateAndInsertSeasonalNorms(yearData, normProperties, connection) {
  let query = '';
  if (yearData.DataType === precipDatatype) query = insertSeasonalPrecipNormsQuery;
  else if (yearData.DataType === tempDatatype) query = insertSeasonalTempNormsQuery;

  for (const i in seasonalValues) {
    const key = seasonalValues[i];
    const totalSeasons = normProperties.seasonalNorms[key].values.length;
    const seasonalMean = normProperties.seasonalNorms[key].total / totalSeasons;
    const sumOfSquares = normProperties.seasonalNorms[key].values.reduce((acc, val) => acc + Math.pow((val - seasonalMean), 2), 0);
    let stddev = Math.sqrt(sumOfSquares / totalSeasons);

    let meanRounded = roundToTwo(seasonalMean);
    stddev = roundToTwo(stddev);

    if (!isNaN(meanRounded) && stddev !== null) {
      const queryParams = [yearData.CountyID, key, meanRounded, stddev];
      await connection.execute(query, queryParams);
    }
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// 9) Insert WI Data (Monthly / Seasonal / Yearly)
////////////////////////////////////////////////////////////////////////////////////////////////////

async function insertWIMonthlyData(yearData, connection, latestYearMonth) {
  let query = '';
  if (yearData.DataType === precipDatatype) {
    query = 'REPLACE INTO WICountyMonthlyPrecip_TEMP (CountyID, Year, Month, Precipitation) VALUES (?, ?, ?, ?);';
  } else if (yearData.DataType === tempDatatype) {
    query = 'REPLACE INTO WICountyMonthlyTemp_TEMP (CountyID, Year, Month, Temperature) VALUES (?, ?, ?, ?);';
  }

  for (let i = 0; i < yearData.MonthData.length; i++) {
    const value = yearData.MonthData[i];
    const monthNum = parseInt(monthValues[i]);
    if (value === -9.99 || value === -99.90) continue;

    const shouldSkip = latestYearMonth &&
      (yearData.Year < latestYearMonth.year || (yearData.Year === latestYearMonth.year && monthNum <= latestYearMonth.month));
    if (shouldSkip) continue;

    const queryParams = [yearData.CountyID, yearData.Year, monthValues[i], value];
    await connection.execute(query, queryParams);
  }
}

async function insertWIYearlyData(yearData, connection) {
  let query = '';
  if (yearData.DataType === precipDatatype) {
    query = 'REPLACE INTO WICountyYearlyPrecip_TEMP (CountyID, Year, Precipitation) VALUES (?, ?, ?);';
  } else if (yearData.DataType === tempDatatype) {
    query = 'REPLACE INTO WICountyYearlyTemp_TEMP (CountyID, Year, Temperature) VALUES (?, ?, ?);';
  }

  let yearTotal = 0;
  for (const i in yearData.MonthData) {
    const value = yearData.MonthData[i];
    if (value !== -9.99 && value !== -99.90) yearTotal += value;
  }
  if (yearData.DataType === tempDatatype) {
    yearTotal = yearTotal / yearData.MonthData.length;
  }

  const queryParams = [yearData.CountyID, yearData.Year, yearTotal];
  await connection.execute(query, queryParams);
}

async function insertWISeasonalData(yearData, prevDecember, currentYear, currentMonth, connection, latestYearMonth) {
  let query = '';
  if (yearData.DataType === precipDatatype) {
    query = 'REPLACE INTO WICountySeasonalPrecip_TEMP (CountyID, Year, Season, Precipitation) VALUES (?, ?, ?, ?);';
  } else if (yearData.DataType === tempDatatype) {
    query = 'REPLACE INTO WICountySeasonalTemp_TEMP (CountyID, Year, Season, Temperature) VALUES (?, ?, ?, ?);';
  }

  let winterTotal = prevDecember;
  let springTotal = 0;
  let summerTotal = 0;
  let fallTotal   = 0;
  const monthsPerSeason = 3;

  if (yearData.Year === currentYear) {
    for (const i in yearData.MonthData) {
      const value = yearData.MonthData[i];
      if (i < 2 && currentMonth > 2)       winterTotal += value;
      else if (i < 5 && currentMonth > 5)  springTotal += value;
      else if (i < 8 && currentMonth > 8)  summerTotal += value;
      else if (i < 11 && currentMonth === 11) fallTotal += value;
    }
  } else {
    for (const i in yearData.MonthData) {
      const value = yearData.MonthData[i];
      if (i < 2)       winterTotal += value;
      else if (i < 5)  springTotal += value;
      else if (i < 8)  summerTotal += value;
      else if (i < 11) fallTotal += value;
    }
  }

  if (yearData.DataType === tempDatatype) {
    winterTotal /= monthsPerSeason;
    springTotal /= monthsPerSeason;
    summerTotal /= monthsPerSeason;
    fallTotal   /= monthsPerSeason;
  }

  winterTotal = roundToTwo(winterTotal);
  springTotal = roundToTwo(springTotal);
  summerTotal = roundToTwo(summerTotal);
  fallTotal   = roundToTwo(fallTotal);

  const baseYear = Number(yearData.Year);
  const latest = { year: Number(latestYearMonth.year), month: Number(latestYearMonth.month) };

  const seasonEnd = {
    winter: { year: baseYear + 1, month: 2 },
    spring: { year: baseYear,     month: 5 },
    summer: { year: baseYear,     month: 8 },
    fall:   { year: baseYear,     month: 11 }
  };

  function isAfterLatest(season) {
    const end = seasonEnd[season];
    return end.year > latest.year || (end.year === latest.year && end.month > latest.month);
  }

  if (baseYear !== 1895 && isAfterLatest('winter')) {
    await connection.execute(query, [yearData.CountyID, baseYear, seasonalValues[0], winterTotal]);
  }
  if (isAfterLatest('spring')) {
    await connection.execute(query, [yearData.CountyID, baseYear, seasonalValues[1], springTotal]);
  }
  if (isAfterLatest('summer')) {
    await connection.execute(query, [yearData.CountyID, baseYear, seasonalValues[2], summerTotal]);
  }
  if (isAfterLatest('fall')) {
    await connection.execute(query, [yearData.CountyID, baseYear, seasonalValues[3], fallTotal]);
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// 10) Distance Calculations (Precip, Temp, Combined)
////////////////////////////////////////////////////////////////////////////////////////////////////

async function calculatePrecipDistances() {
  try {
    await createAllTEMPDistanceTables();
    await runOnce("Monthly Precipitation Distances", calculateMonthlyPrecipDistancesQuery);
    await runOnce("Seasonal Precipitation Distances", calculateSeasonalPrecipDistancesQuery);
    await runOnce("Yearly Precipitation Distances", calculateYearlyPrecipDistancesQuery);
  } catch (error) {
    console.error("Error in calculatePrecipDistances:", error);
    throw error;
  }
}

async function calculateTempDistances() {
  try {
    await runOnce("Monthly Temperature Distances", calculateMonthlyTempDistancesQuery);
    await runOnce("Seasonal Temperature Distances", calculateSeasonalTempDistancesQuery);
    await runOnce("Yearly Temperature Distances", calculateYearlyTempDistancesQuery);
  } catch (error) {
    console.error("Error in calculateTempDistances:", error);
    throw error;
  }
}

async function calculateTwoVariableDistances() {
  try {
    await runOnce("Monthly Combined Distances", calculateMonthlyCombinedDistancesQuery);
    await runOnce("Seasonal Combined Distances", calculateSeasonalCombinedDistancesQuery);
    await runOnce("Yearly Combined Distances", calculateYearlyCombinedDistancesQuery);
    await dropAllTempTables();
  } catch (error) {
    console.error("Error in calculateTwoVariableDistances:", error);
    throw error;
  }
}

/**
 * Master orchestrator for distance calculations.
 */
async function calculateAndInsertEuclideanDistances() {
  try {
    await calculatePrecipDistances();
    await calculateTempDistances();
    await calculateTwoVariableDistances();
    return { success: true };
  } catch (error) {
    console.error('Error inserting data:', error);
    return { success: false, error: `Error inserting data: ${error.message}` };
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// 11) HTTP: Data Ingestion Endpoint (Add All County Data)
////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/addallcountydata', async (req, res) => {
  try {
    let preciptResult = null;
    let tempResult = null;
    let distanceResult = null;

    const { tempURL, precipURL } = await getLatestNOAAFileLinks();

    await Promise.all([
      preciptResult = fetchDataFromAPI(precipURL, 'County'),
      tempResult    = fetchDataFromAPI(tempURL, 'County')
    ]);

    console.log('Calculating distances');
    distanceResult = await calculateAndInsertEuclideanDistances();

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

////////////////////////////////////////////////////////////////////////////////////////////////////
// 12) HTTP: Frontend Data Endpoint (Central /getData)
////////////////////////////////////////////////////////////////////////////////////////////////////

const baseDirectory = path.join(__dirname, './mockDB');

const writeResponseData = (targetCounty, timeScale, timeScaleValue, year, dataType, data) => {
  const fileName = `${targetCounty}_${timeScale}_${year}_${timeScaleValue}_${dataType}.json`;
  const filePath = path.join(baseDirectory, fileName);
  if (!fs.existsSync(baseDirectory)) fs.mkdirSync(baseDirectory, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), (err) => {
    if (err) console.error('Error writing response data to file:', err);
    else console.log(`Response data written to ${filePath}`);
  });
};

app.get('/getData', async (req, res) => {
  const { targetCounty, timeScale, timeScaleValue, year, dataType } = req.query;

  try {
    console.log("Inside getData");
    console.log(req.query);
    let result;
    const yearNumber = Number(year);

    if (timeScale === 'by_year') {
      if (year === 'top_analogs') {
        console.log("In top analogs by year");
        result = await getTopAnalogsByYear(targetCounty, dataType);
      } else if (!isNaN(yearNumber)) {
        result = await getDataByYear(targetCounty, yearNumber, dataType);
      }
    } else if (timeScale === 'by_season') {
      if (year === 'top_analogs') {
        console.log("In top analogs by season");
        result = await getTopAnalogsBySeason(targetCounty, timeScaleValue, dataType);
      } else if (!isNaN(yearNumber)) {
        result = await getDataBySeason(targetCounty, yearNumber, timeScaleValue, dataType);
      }
    } else if (timeScale === 'by_month') {
      if (year === 'top_analogs') {
        console.log("In top analogs by month");
        result = await getTopAnalogsByMonth(targetCounty, timeScaleValue, dataType);
      } else if (!isNaN(yearNumber)) {
        result = await getDataByMonth(targetCounty, yearNumber, timeScaleValue, dataType);
      }
    } else {
      throw new Error('Invalid timeScale');
    }

    writeResponseData(targetCounty, timeScale, timeScaleValue, year, dataType, result.data);
    res.json(result);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// 13) Data Accessors (Year / Season / Month) – DB Calls
////////////////////////////////////////////////////////////////////////////////////////////////////

async function getTopAnalogsByYear(targetCountyName, dataType) {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Database connected successfully');

    let rows = null;
    if (dataType === 'precipitation') {
      console.log('Inside preciptation');
      rows = await Promise.all([ connection.execute(getTopPrecipitationAnalogsByYearQuery, [targetCountyName]) ]);
    } else if (dataType === 'temperature') {
      console.log('Inside temperature');
      rows = await Promise.all([ connection.execute(getTopTemperatureAnalogsByYearQuery, [targetCountyName]) ]);
    } else if (dataType === 'both') {
      console.log('Inside both');
      rows = await Promise.all([ connection.execute(getTopCombinedAnalogsByYearQuery, [targetCountyName]) ]);
    }

    return { success: true, data: rows };
  } catch (error) {
    console.error('Error getting data:', error);
    return { success: false, error: error.message };
  } finally {
    if (connection) { connection.release(); console.log('Database connection closed.'); }
  }
}

async function getDataByYear(targetCounty, yearNumber, dataType) {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Database connected successfully');

    let rows = null;
    if (dataType === 'precipitation') {
      console.log('Inside preciptation');
      rows = await Promise.all([ connection.execute(getPrecipitationAnalogsByYearQuery, [targetCounty, yearNumber]) ]);
    } else if (dataType === 'temperature') {
      console.log('Inside temperature');
      rows = await Promise.all([ connection.execute(getTemperatureAnalogsByYearQuery, [targetCounty, yearNumber]) ]);
    } else if (dataType === 'both') {
      console.log('Inside both');
      rows = await Promise.all([ connection.execute(getCombinedAnalogsByYearQuery, [targetCounty, yearNumber]) ]);
    }

    console.log(rows[0]);
    return { success: true, data: rows };
  } catch (error) {
    console.error('Error getting data:', error);
    return { success: false, error: error.message };
  } finally {
    if (connection) { connection.release(); console.log('Database connection closed.'); }
  }
}

async function getTopAnalogsBySeason(targetCounty, timeScaleValue, dataType) {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Database connected successfully');

    let rows = null;
    if (dataType === 'precipitation') {
      console.log('Inside preciptation');
      rows = await Promise.all([ connection.execute(getTopPrecipitationAnalogsBySeasonQuery, [targetCounty, timeScaleValue]) ]);
    } else if (dataType === 'temperature') {
      console.log('Inside temperature');
      rows = await Promise.all([ connection.execute(getTopTemperatureAnalogsBySeasonQuery, [targetCounty, timeScaleValue]) ]);
    } else if (dataType === 'both') {
      console.log('Inside both');
      rows = await Promise.all([ connection.execute(getTopCombinedAnalogsBySeasonQuery, [targetCounty, timeScaleValue]) ]);
    }

    return { success: true, data: rows };
  } catch (error) {
    console.error('Error getting data:', error);
    return { success: false, error: error.message };
  } finally {
    if (connection) { connection.release(); console.log('Database connection closed.'); }
  }
}

async function getDataBySeason(targetCounty, yearNumber, timeScaleValue, dataType) {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Database connected successfully');

    let rows = null;
    if (dataType === 'precipitation') {
      console.log('Inside preciptation');
      rows = await Promise.all([ connection.execute(getPrecipitationAnalogsBySeasonQuery, [targetCounty, yearNumber, timeScaleValue]) ]);
    } else if (dataType === 'temperature') {
      console.log('Inside preciptation');
      rows = await Promise.all([ connection.execute(getTemperatureAnalogsBySeasonQuery, [targetCounty, yearNumber, timeScaleValue]) ]);
    } else if (dataType === 'both') {
      console.log('Inside preciptation');
      rows = await Promise.all([ connection.execute(getCombinedAnalogsBySeasonQuery, [targetCounty, yearNumber, timeScaleValue]) ]);
    }

    return { success: true, data: rows };
  } catch (error) {
    console.error('Error getting data:', error);
    return { success: false, error: error.message };
  } finally {
    if (connection) { connection.release(); console.log('Database connection closed.'); }
  }
}

async function getTopAnalogsByMonth(targetCounty, timeScaleValue, dataType) {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Database connected successfully');

    let rows = null;
    if (dataType === 'precipitation') {
      console.log('Inside preciptation');
      rows = await Promise.all([ connection.execute(getTopPrecipitationAnalogsByMonthQuery, [targetCounty, timeScaleValue]) ]);
    } else if (dataType === 'temperature') {
      console.log('Inside temperature');
      rows = await Promise.all([ connection.execute(getTopTemperatureAnalogsByMonthQuery, [targetCounty, timeScaleValue]) ]);
    } else if (dataType === 'both') {
      console.log('Inside both');
      rows = await Promise.all([ connection.execute(getTopCombinedAnalogsByMonthQuery, [targetCounty, timeScaleValue]) ]);
    }

    return { success: true, data: rows };
  } catch (error) {
    console.error('Error getting data:', error);
    return { success: false, error: error.message };
  } finally {
    if (connection) { connection.release(); console.log('Database connection closed.'); }
  }
}

async function getDataByMonth(targetCounty, yearNumber, timeScaleValue, dataType) {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Database connected successfully');

    let rows = null;
    if (dataType === 'precipitation') {
      console.log('Inside preciptation');
      rows = await Promise.all([ connection.execute(getPrecipitationAnalogsByMonthQuery, [targetCounty, yearNumber, timeScaleValue]) ]);
    } else if (dataType === 'temperature') {
      console.log('Inside preciptation');
      rows = await Promise.all([ connection.execute(getTemperatureAnalogsByMonthQuery, [targetCounty, yearNumber, timeScaleValue]) ]);
    } else if (dataType === 'both') {
      console.log('Inside preciptation');
      rows = await Promise.all([ connection.execute(getCombinedAnalogsByMonthQuery, [targetCounty, yearNumber, timeScaleValue]) ]);
    }

    return { success: true, data: rows };
  } catch (error) {
    console.error('Error getting data:', error);
    return { success: false, error: error.message };
  } finally {
    if (connection) { connection.release(); console.log('Database connection closed.'); }
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// 14) HTTP: Admin – Add County / Add State
////////////////////////////////////////////////////////////////////////////////////////////////////

app.post('/addcounty/:countyID/:countyName/:stateCode/:lat/:long', (req, res) => {
  try {
    const { countyID, countyName, stateCode, lat, long } = req.params;
    insertCounty(countyID, countyName, stateCode, lat, long);
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

async function insertCounty(countyID, countyName, stateCode, lat, long) {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Database connected successfully');

    const Latitude = parseFloat(lat);
    const Longitude = parseFloat(long);

    if (!countyID || !countyName || !stateCode || isNaN(Latitude) || isNaN(Longitude)) {
      console.log(`Invalid parameters: ${countyID}, ${countyName}, ${stateCode}, ${Latitude}, ${Longitude}`);
      return res.status(400).send('Invalid parameters');
    }

    connection.execute(insertCountyQuery, [countyID, countyName, stateCode, Latitude, Longitude], (err, result) => {
      if (err) {
        console.error('Error inserting county:', err);
        res.status(500).send('Error inserting county');
      } else {
        res.send(result);
      }
    });
  } catch (error) {
    console.error('Error getting data:', error);
  } finally {
    if (connection) {
      connection.release();
      console.log('Database connection closed.');
    }
  }
}

app.post('/addstate/:StateCode/:StateAbbr/:StateName', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Database connected successfully');

    const { StateCode, StateAbbr, StateName } = req.params;
    if (!StateCode || !StateAbbr || !StateName) {
      console.log(`Invalid parameters: ${StateCode}, ${StateAbbr}, ${StateName}`);
      return res.status(400).send('Invalid parameters');
    }

    const insertStateQuery = 'INSERT INTO States (StateCode, StateAbbr, StateName) VALUES (?, ?, ?)';
    connection.execute(insertStateQuery, [StateCode, StateAbbr, StateName], (err, result) => {
      if (err) {
        console.error('Error inserting state:', err);
        return res.status(500).send('Error inserting state');
      }
      res.send('State inserted successfully');
    });

  } catch (error) {
    if (error.response) {
      console.error('Error response from server:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up the request:', error.message);
    }
    console.error('Error details:', error.config);
    res.status(500).send('Error adding state data.');
  } finally {
    if (connection) {
      connection.release();
      console.log('Database connection closed.');
    }
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// 15) HTTP: Misc - initial database set up
////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/getcounties', (req, res) => {
  let sql = 'SELECT * FROM counties';
  let query = db.query(sql, (err, results) => {
    if (err) { throw err; }
    console.log(results);
    res.send('Counties fetched');
  });
});

app.get('/getcounty/:CountyID', (req, res) => {
  let sql = `SELECT * FROM counties WHERE CountyID = ${req.params.CountyID}`;
  let query = db.query(sql, (err, result) => {
    if (err) { throw err; }
    console.log(result);
    res.send('County fetched');
  });
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// 16) Server Startup
////////////////////////////////////////////////////////////////////////////////////////////////////

async function startServer(port) {
  try {
    await killPort(PORT, 'tcp');
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Error starting server:', err);
  }
}

startServer(PORT);
startNOAACronJob();
