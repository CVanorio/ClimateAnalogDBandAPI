// src/services/parse.service.js
/**
 * Parse & Insert Service
 * ----------------------------------------------------
 * - Drops & recreates TEMP input tables for TargetState
 * - Parses NOAA fixed-width lines (via utils/fixedWidth)
 * - Accumulates/closes-out climate normals over window
 * - Inserts TargetState monthly/seasonal/yearly rows into *_TEMP
 * - Copies *_TEMP → final TargetState tables
 * - Respects latest (Year,Month) checkpoint unless NEW_CLIMATE_NORMALS is true
 * - Optional TARGET_STATE_CODE filter (null = all states, string/array = restrict)
 */

const { pool } = require('../config/db');

const {
  climateNormalYears,
  monthValues,
  seasonalValues,
  precipDatatype,
  tempDatatype,
  TARGET_STATE_CODE,
  NEW_CLIMATE_NORMALS,
} = require('../config/constants');

const {
  insertMonthlyPrecipNormsQuery,
  insertMonthlyTempNormsQuery,
  insertYearlyPrecipNormsQuery,
  insertYearlyTempNormsQuery,
  insertSeasonalPrecipNormsQuery,
  insertSeasonalTempNormsQuery,
  getCountyIdByStateAndCountyCodes,
} = require('../sql/queries');

const { roundToTwo } = require('../utils/math');
const { parseMonthValues } = require('../utils/fixedWidth');

/* ========================================================================== */
/* Utilities                                                                  */
/* ========================================================================== */

/** Latest (Year, Month) present in monthly_combined_distances. */
async function getLatestInsertedMonth(connection) {
  const [rows] = await connection.execute(`
    SELECT Year, Month
    FROM monthly_combined_distances
    ORDER BY Year DESC, CAST(Month AS UNSIGNED) DESC
    LIMIT 1;
  `);
  if (!rows || rows.length === 0) return null;
  return { year: Number(rows[0].Year), month: Number(rows[0].Month) };
}

/**
 * Parse one fixed-width line → { CountyID, Year, DataType, StateCode, CountyCode, MonthData[] }.
 * Uses a DB lookup to resolve CountyID; returns null CountyID when not found (caller skips those).
 */
async function parseMonthlyLineData(line, connection) {
  const DataType = line.substring(5, 7);
  const Year = parseInt(line.substring(7, 11), 10);
  const StateCode = line.substring(0, 2);
  const CountyCode = line.substring(2, 5);

  // SP returns nested arrays; guard for empty results.
  const [rows] = await connection.execute(getCountyIdByStateAndCountyCodes, [CountyCode, StateCode]);

  let CountyID = null;
  if (rows.length > 0 && rows[0].length > 0 && rows[0][0].CountyID) {
    CountyID = rows[0][0].CountyID;
  }

  const MonthData = parseMonthValues(line);
  // console.log("Row: ", { CountyID, Year, DataType, StateCode, CountyCode, MonthData });
  return { CountyID, Year, DataType, StateCode, CountyCode, MonthData };
}

/* ========================================================================== */
/* Norms accumulation + inserts                                               */
/* ========================================================================== */

async function calculateNorms(yearData, prevDecember, normProperties, connection) {
  storeMonthlyValues(yearData, normProperties);
  storeYearlyValues(yearData, normProperties);
  storeSeasonalValues(yearData, prevDecember, normProperties);

  if (yearData.Year == climateNormalYears[1]) {
    // Flush once we reach the end of the normals window (e.g., 1991–2020).
    await calculateAndInsertMonthlyNorms(yearData, normProperties, connection);
    await calculateAndInsertYearlyNorms(yearData, normProperties, connection);
    await calculateAndInsertSeasonalNorms(yearData, normProperties, connection);

    // reset holders for next normals window
    normProperties.monthlyNorms = {};
    normProperties.seasonalNorms = {};
    normProperties.yearlyNorms = {};
  }
}

function storeMonthlyValues(yearData, normProperties) {
  for (const i in yearData.MonthData) {
    if (!normProperties.monthlyNorms[i]) {
      normProperties.monthlyNorms[i] = { total: 0, values: [] };
    }
    const v = yearData.MonthData[i];
    // -9.99 / -99.90 are sentinel missing values in NOAA datasets
    if (v != -9.99 && v != -99.90) {
      normProperties.monthlyNorms[i].total += v;
      normProperties.monthlyNorms[i].values.push(v);
    }
  }
}

function storeYearlyValues(yearData, normProperties) {
  if (!normProperties.yearlyNorms.total) {
    normProperties.yearlyNorms = { total: 0, values: [] };
  }
  let sum = 0;
  for (const i in yearData.MonthData) {
    const v = yearData.MonthData[i];
    if (v != -9.99 && v != -99.90) sum += v;
  }
  // Temperature normals use the mean of the 12 monthly values; precip uses sum.
  if (yearData.DataType === tempDatatype) {
    sum = sum / yearData.MonthData.length;
  }
  sum = roundToTwo(sum);

  normProperties.yearlyNorms.total = roundToTwo(normProperties.yearlyNorms.total + sum);
  normProperties.yearlyNorms.values.push(sum);
}

function storeSeasonalValues(yearData, prevDecember, normProperties) {
  for (const key of seasonalValues) {
    if (!normProperties.seasonalNorms[key]) {
      normProperties.seasonalNorms[key] = { total: 0, values: [] };
    }
  }

  // DJF uses prevDecember from the previous line, then Jan/Feb of current Year.
  let winter = prevDecember;
  let spring = 0;
  let summer = 0;
  let fall = 0;

  for (const i in yearData.MonthData) {
    const v = yearData.MonthData[i];
    if (i < 2) winter += v;
    else if (i < 5) spring += v;
    else if (i < 8) summer += v;
    else if (i < 11) fall += v;
  }

  // Temperature seasonal normals are averages; precipitation are totals.
  if (yearData.DataType === tempDatatype) {
    winter /= 3;
    spring /= 3;
    summer /= 3;
    fall /= 3;
  }

  winter = roundToTwo(winter);
  spring = roundToTwo(spring);
  summer = roundToTwo(summer);
  fall = roundToTwo(fall);

  normProperties.seasonalNorms.winter.total += winter;
  normProperties.seasonalNorms.winter.values.push(winter);

  normProperties.seasonalNorms.spring.total += spring;
  normProperties.seasonalNorms.spring.values.push(spring);

  normProperties.seasonalNorms.summer.total += summer;
  normProperties.seasonalNorms.summer.values.push(summer);

  normProperties.seasonalNorms.fall.total += fall;
  normProperties.seasonalNorms.fall.values.push(fall);
}

async function calculateAndInsertMonthlyNorms(yearData, normProperties, connection) {
  let query = '';
  if (yearData.DataType === precipDatatype) query = insertMonthlyPrecipNormsQuery;
  else if (yearData.DataType === tempDatatype) query = insertMonthlyTempNormsQuery;

  for (const i in yearData.MonthData) {
    const total = normProperties.monthlyNorms[i].values.length;
    const mean = normProperties.monthlyNorms[i].total / total;
    // Population std dev (divide by N); matches original behavior.
    const ss = normProperties.monthlyNorms[i].values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
    let stddev = Math.sqrt(ss / total);

    const meanRounded = roundToTwo(mean);
    stddev = roundToTwo(stddev);

    if (!isNaN(meanRounded) && stddev !== null) {
      await connection.execute(query, [yearData.CountyID, monthValues[i], meanRounded, stddev]);
    }
  }
}

async function calculateAndInsertYearlyNorms(yearData, normProperties, connection) {
  let query = '';
  if (yearData.DataType === precipDatatype) query = insertYearlyPrecipNormsQuery;
  else if (yearData.DataType === tempDatatype) query = insertYearlyTempNormsQuery;

  const totalYears = normProperties.yearlyNorms.values.length;
  const mean = normProperties.yearlyNorms.total / totalYears;
  // Population std dev again (N, not N-1).
  const ss = normProperties.yearlyNorms.values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
  let stddev = Math.sqrt(ss / totalYears);

  const meanRounded = roundToTwo(mean);
  stddev = roundToTwo(stddev);

  if (!isNaN(meanRounded) && stddev !== null) {
    await connection.execute(query, [yearData.CountyID, meanRounded, stddev]);
  }
}

async function calculateAndInsertSeasonalNorms(yearData, normProperties, connection) {
  let query = '';
  if (yearData.DataType === precipDatatype) query = insertSeasonalPrecipNormsQuery;
  else if (yearData.DataType === tempDatatype) query = insertSeasonalTempNormsQuery;

  for (const key of seasonalValues) {
    const total = normProperties.seasonalNorms[key].values.length;
    const mean = normProperties.seasonalNorms[key].total / total;
    const ss = normProperties.seasonalNorms[key].values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
    let stddev = Math.sqrt(ss / total);

    const meanRounded = roundToTwo(mean);
    stddev = roundToTwo(stddev);

    if (!isNaN(meanRounded) && stddev !== null) {
      await connection.execute(query, [yearData.CountyID, key, meanRounded, stddev]);
    }
  }
}

/* ========================================================================== */
/* TEMP input tables (TargetState) + copy to final                            */
/* ========================================================================== */

async function createTempTables(connection) {
  const tables = [
    {
      name: 'TargetStateCountyMonthlyPrecip_TEMP',
      create: `
        CREATE TABLE IF NOT EXISTS TargetStateCountyMonthlyPrecip_TEMP (
          CountyID INT,
          Year INT,
          Month CHAR(2),
          Precipitation FLOAT
        );`,
    },
    {
      name: 'TargetStateCountyMonthlyTemp_TEMP',
      create: `
        CREATE TABLE IF NOT EXISTS TargetStateCountyMonthlyTemp_TEMP (
          CountyID INT,
          Year INT,
          Month CHAR(2),
          Temperature FLOAT
        );`,
    },
    {
      name: 'TargetStateCountySeasonalPrecip_TEMP',
      create: `
        CREATE TABLE IF NOT EXISTS TargetStateCountySeasonalPrecip_TEMP (
          CountyID INT,
          Year INT,
          Season VARCHAR(10),
          Precipitation FLOAT
        );`,
    },
    {
      name: 'TargetStateCountySeasonalTemp_TEMP',
      create: `
        CREATE TABLE IF NOT EXISTS TargetStateCountySeasonalTemp_TEMP (
          CountyID INT,
          Year INT,
          Season VARCHAR(10),
          Temperature FLOAT
        );`,
    },
    {
      name: 'TargetStateCountyYearlyPrecip_TEMP',
      create: `
        CREATE TABLE IF NOT EXISTS TargetStateCountyYearlyPrecip_TEMP (
          CountyID INT,
          Year INT,
          Precipitation FLOAT
        );`,
    },
    {
      name: 'TargetStateCountyYearlyTemp_TEMP',
      create: `
        CREATE TABLE IF NOT EXISTS TargetStateCountyYearlyTemp_TEMP (
          CountyID INT,
          Year INT,
          Temperature FLOAT
        );`,
    },
  ];

  // Drop then create for a clean slate on each run (idempotent ingestion).
  for (const { name, create } of tables) {
    await connection.execute(`DROP TABLE IF EXISTS ${name}`);
    await connection.execute(create);
  }
  console.log('Temporary tables dropped and recreated.');
}

async function copyTempToDataTargetStateTables(connection, dataType) {
  const isTemp = dataType === tempDatatype;

  // Use REPLACE to upsert into final tables without duplicates.
  if (isTemp) {
    const sets = [
      { temp: 'TargetStateCountyMonthlyTemp_TEMP',   target: 'monthly_temperature_data_TargetState',  cols: '(CountyID, Year, Month, Temperature)' },
      { temp: 'TargetStateCountySeasonalTemp_TEMP',  target: 'seasonal_temperature_data_TargetState', cols: '(CountyID, Year, Season, Temperature)' },
      { temp: 'TargetStateCountyYearlyTemp_TEMP',    target: 'yearly_temperature_data_TargetState',   cols: '(CountyID, Year, Temperature)' },
    ];
    for (const { temp, target, cols } of sets) {
      await connection.execute(`REPLACE INTO ${target} ${cols} SELECT ${cols.slice(1, -1)} FROM ${temp};`);
      console.log(`Copied temperature data from ${temp} to ${target}`);
    }
  } else {
    const sets = [
      { temp: 'TargetStateCountyMonthlyPrecip_TEMP',  target: 'monthly_precipitation_data_TargetState',  cols: '(CountyID, Year, Month, Precipitation)' },
      { temp: 'TargetStateCountySeasonalPrecip_TEMP', target: 'seasonal_precipitation_data_TargetState', cols: '(CountyID, Year, Season, Precipitation)' },
      { temp: 'TargetStateCountyYearlyPrecip_TEMP',   target: 'yearly_precipitation_data_TargetState',   cols: '(CountyID, Year, Precipitation)' },
    ];
    for (const { temp, target, cols } of sets) {
      await connection.execute(`REPLACE INTO ${target} ${cols} SELECT ${cols.slice(1, -1)} FROM ${temp};`);
      console.log(`Copied precipitation data from ${temp} to ${target}`);
    }
  }
}

/* ========================================================================== */
/* TargetState inserts (TEMP)                                                 */
/* ========================================================================== */

async function insertTargetStateMonthlyData(yearData, connection, latestYearMonth) {
  let query = '';
  if (yearData.DataType === precipDatatype) {
    query = 'REPLACE INTO TargetStateCountyMonthlyPrecip_TEMP (CountyID, Year, Month, Precipitation) VALUES (?, ?, ?, ?);';
  } else if (yearData.DataType === tempDatatype) {
    query = 'REPLACE INTO TargetStateCountyMonthlyTemp_TEMP (CountyID, Year, Month, Temperature) VALUES (?, ?, ?, ?);';
  }

  for (let i = 0; i < yearData.MonthData.length; i++) {
    const value = yearData.MonthData[i];
    if (value === -9.99 || value === -99.90) continue;

    // If same year as checkpoint, skip months already processed.
    if (latestYearMonth && Number(yearData.Year) === Number(latestYearMonth.year)) {
      const monthNum = parseInt(monthValues[i], 10);
      if (monthNum <= Number(latestYearMonth.month)) continue;
    }

    await connection.execute(query, [yearData.CountyID, yearData.Year, monthValues[i], value]);
  }
}

async function insertTargetStateYearlyData(yearData, connection) {
  let query = '';
  if (yearData.DataType === precipDatatype) {
    query = 'REPLACE INTO TargetStateCountyYearlyPrecip_TEMP (CountyID, Year, Precipitation) VALUES (?, ?, ?);';
  } else if (yearData.DataType === tempDatatype) {
    query = 'REPLACE INTO TargetStateCountyYearlyTemp_TEMP (CountyID, Year, Temperature) VALUES (?, ?, ?);';
  }

  // Yearly totals (precip = sum; temp = mean of months).
  let total = 0;
  for (const i in yearData.MonthData) {
    const v = yearData.MonthData[i];
    if (v !== -9.99 && v !== -99.90) total += v;
  }
  if (yearData.DataType === tempDatatype) {
    total = total / yearData.MonthData.length;
  }

  await connection.execute(query, [yearData.CountyID, yearData.Year, total]);
}

async function insertTargetStateSeasonalData(
  yearData,
  prevDecember,
  currentYear,
  currentMonth,
  connection,
  latestYearMonth
) {
  let query = '';
  if (yearData.DataType === precipDatatype) {
    query = 'REPLACE INTO TargetStateCountySeasonalPrecip_TEMP (CountyID, Year, Season, Precipitation) VALUES (?, ?, ?, ?);';
  } else if (yearData.DataType === tempDatatype) {
    query = 'REPLACE INTO TargetStateCountySeasonalTemp_TEMP (CountyID, Year, Season, Temperature) VALUES (?, ?, ?, ?);';
  }

  let winter = prevDecember;
  let spring = 0;
  let summer = 0;
  let fall = 0;

  // For current year, only include seasons that are "complete" so far.
  if (yearData.Year === currentYear) {
    for (const i in yearData.MonthData) {
      const v = yearData.MonthData[i];
      if (i < 2 && currentMonth > 2) winter += v;
      else if (i < 5 && currentMonth > 5) spring += v;
      else if (i < 8 && currentMonth > 8) summer += v;
      else if (i < 11 && currentMonth === 11) fall += v;
    }
  } else {
    // Historical years: include full seasons.
    for (const i in yearData.MonthData) {
      const v = yearData.MonthData[i];
      if (i < 2) winter += v;
      else if (i < 5) spring += v;
      else if (i < 8) summer += v;
      else if (i < 11) fall += v;
    }
  }

  if (yearData.DataType === tempDatatype) {
    winter /= 3; spring /= 3; summer /= 3; fall /= 3;
  }

  winter = roundToTwo(winter);
  spring = roundToTwo(spring);
  summer = roundToTwo(summer);
  fall   = roundToTwo(fall);

  // Guard against seasons whose "end" is already captured by the checkpoint.
  const baseYear = Number(yearData.Year);
  const seasonEnd = {
    winter: { year: baseYear + 1, month: 2 }, // Feb next year
    spring: { year: baseYear,     month: 5 }, // May
    summer: { year: baseYear,     month: 8 }, // Aug
    fall:   { year: baseYear,     month: 11 }, // Nov
  };
  function isAfterLatest(season) {
    if (!latestYearMonth) return true;
    const end = seasonEnd[season];
    const ly = Number(latestYearMonth.year);
    const lm = Number(latestYearMonth.month);
    return end.year > ly || (end.year === ly && end.month > lm);
  }

  if (baseYear !== 1895 && isAfterLatest('winter')) {
    await connection.execute(query, [yearData.CountyID, baseYear, seasonalValues[0], winter]);
  }
  if (isAfterLatest('spring')) {
    await connection.execute(query, [yearData.CountyID, baseYear, seasonalValues[1], spring]);
  }
  if (isAfterLatest('summer')) {
    await connection.execute(query, [yearData.CountyID, baseYear, seasonalValues[2], summer]);
  }
  if (isAfterLatest('fall')) {
    await connection.execute(query, [yearData.CountyID, baseYear, seasonalValues[3], fall]);
  }
}

/* ========================================================================== */
/* Main entry                                                                 */
/* ========================================================================== */

async function parseAndInsertAllNormsAndTargetStateData(responseData) {
  let connection;
  let lastDataType = null;

  try {
    connection = await pool.getConnection();
    console.log('Database connected successfully');

    await createTempTables(connection);

    const latestYearMonth = await getLatestInsertedMonth(connection);
    console.log(`Latest inserted (year/month): ${latestYearMonth ? `${latestYearMonth.year}/${latestYearMonth.month}` : 'none'}`);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0–11

    const lines = responseData.split('\n');
    if (lines[lines.length - 1] === '') lines.pop(); // NOAA files often end with a trailing newline

    let prevDecember = null;
    const normProps = { monthlyNorms: {}, seasonalNorms: {}, yearlyNorms: {} };

    for (const line of lines) {
      const yearData = await parseMonthlyLineData(line, connection);
      if (yearData.CountyID === null) continue;

      lastDataType = yearData.DataType;

      // If NOT recomputing normals, skip whole years that are fully processed or when latest month is December
      // or any year earlier than the checkpoint.
      if (!NEW_CLIMATE_NORMALS && latestYearMonth) {
        const y = Number(yearData.Year);
        const ly = Number(latestYearMonth.year);
        const lm = Number(latestYearMonth.month);
        if (y < ly || (y === ly && lm === 12)) {
          prevDecember = yearData.MonthData[11];
          continue;
        }
      }

      if (yearData.Year === 1895) prevDecember = null;

      console.log(`Processing Year ${yearData.Year}, DataType ${yearData.DataType}, CountyID ${yearData.CountyID}`);
      // Norms window (e.g., 1991–2020)
      if (yearData.Year >= climateNormalYears[0] && yearData.Year <= climateNormalYears[1]) {
        await calculateNorms(yearData, prevDecember, normProps, connection);
      }

      // Target state filter: null => all states; array => restrict
      const isTargetState =
        TARGET_STATE_CODE == null ||
       (TARGET_STATE_CODE.includes(Number(yearData.StateCode)));

      if (isTargetState) {
        await insertTargetStateMonthlyData(yearData, connection, latestYearMonth);
        await insertTargetStateSeasonalData(
          yearData,
          prevDecember,
          currentYear,
          currentMonth,
          connection,
          latestYearMonth
        );
        if (yearData.Year !== currentYear) {
          await insertTargetStateYearlyData(yearData, connection);
        }
      }

      prevDecember = yearData.MonthData[11];
    }

    if (lastDataType) {
      await copyTempToDataTargetStateTables(connection, lastDataType);
    }

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

/* " ========================================================================== */
/* Exports                                                                    */
/* ========================================================================== */

module.exports = {
  // main
  parseAndInsertAllNormsAndTargetStateData,

};
