/**
 * Parse & Insert Service
 * ----------------------------------------------------
 * Creates input TEMP tables, parses NOAA fixed-width lines,
 * accumulates/flushes climate normals, writes WI monthly/seasonal/yearly data,
 * and copies *_TEMP → final WI tables.
 *
 * Behavior and outputs match the original code.
 */

const pool = require('../config/db');

const {
  climateNormalYears,
  monthValues,
  monthPositions,
  seasonalValues,
  precipDatatype,
  tempDatatype,
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

/**
 * TEMP input tables (drop & recreate)
 */
async function createTempTables(connection) {
  const tables = [
    {
      name: 'WICountyMonthlyPrecip_TEMP',
      create: `
        CREATE TABLE WICountyMonthlyPrecip_TEMP (
          CountyID INT,
          Year INT,
          Month CHAR(2),
          Precipitation FLOAT
        );`,
    },
    {
      name: 'WICountyMonthlyTemp_TEMP',
      create: `
        CREATE TABLE WICountyMonthlyTemp_TEMP (
          CountyID INT,
          Year INT,
          Month CHAR(2),
          Temperature FLOAT
        );`,
    },
    {
      name: 'WICountySeasonalPrecip_TEMP',
      create: `
        CREATE TABLE WICountySeasonalPrecip_TEMP (
          CountyID INT,
          Year INT,
          Season VARCHAR(10),
          Precipitation FLOAT
        );`,
    },
    {
      name: 'WICountySeasonalTemp_TEMP',
      create: `
        CREATE TABLE WICountySeasonalTemp_TEMP (
          CountyID INT,
          Year INT,
          Season VARCHAR(10),
          Temperature FLOAT
        );`,
    },
    {
      name: 'WICountyYearlyPrecip_TEMP',
      create: `
        CREATE TABLE WICountyYearlyPrecip_TEMP (
          CountyID INT,
          Year INT,
          Precipitation FLOAT
        );`,
    },
    {
      name: 'WICountyYearlyTemp_TEMP',
      create: `
        CREATE TABLE WICountyYearlyTemp_TEMP (
          CountyID INT,
          Year INT,
          Temperature FLOAT
        );`,
    },
  ];

  for (const { name, create } of tables) {
    await connection.execute(`DROP TABLE IF EXISTS ${name}`);
    await connection.execute(create);
  }
  console.log('Temporary tables dropped and recreated.');
}

/**
 * Find most recent (Year, Month) already in WI precip table.
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
 * Copy input TEMP → final WI tables (temp vs precip).
 */
async function copyTempToDataWITables(connection, dataType) {
  const isTemp = dataType === tempDatatype;

  if (isTemp) {
    const tempTables = [
      {
        temp: 'WICountyMonthlyTemp_TEMP',
        target: 'monthly_temperature_data_wi',
        columns: '(CountyID, Year, Month, Temperature)',
      },
      {
        temp: 'WICountySeasonalTemp_TEMP',
        target: 'seasonal_temperature_data_wi',
        columns: '(CountyID, Year, Season, Temperature)',
      },
      {
        temp: 'WICountyYearlyTemp_TEMP',
        target: 'yearly_temperature_data_wi',
        columns: '(CountyID, Year, Temperature)',
      },
    ];
    for (const { temp, target, columns } of tempTables) {
      const query = `INSERT IGNORE INTO ${target} ${columns}
                     SELECT ${columns.slice(1, -1)} FROM ${temp};`;
      await connection.execute(query);
      console.log(`Copied temperature data from ${temp} to ${target}`);
    }
  } else {
    const precipTables = [
      {
        temp: 'WICountyMonthlyPrecip_TEMP',
        target: 'monthly_precipitation_data_wi',
        columns: '(CountyID, Year, Month, Precipitation)',
      },
      {
        temp: 'WICountySeasonalPrecip_TEMP',
        target: 'seasonal_precipitation_data_wi',
        columns: '(CountyID, Year, Season, Precipitation)',
      },
      {
        temp: 'WICountyYearlyPrecip_TEMP',
        target: 'yearly_precipitation_data_wi',
        columns: '(CountyID, Year, Precipitation)',
      },
    ];
    for (const { temp, target, columns } of precipTables) {
      const query = `INSERT IGNORE INTO ${target} ${columns}
                     SELECT ${columns.slice(1, -1)} FROM ${temp};`;
      await connection.execute(query);
      console.log(`Copied precipitation data from ${temp} to ${target}`);
    }
  }
}

/**
 * Parse a fixed-width line, look up CountyID, and return structured yearData.
 */
async function parseMonthlyLineData(line, connection) {
  const DataType = line.substring(5, 7);
  const Year = parseInt(line.substring(7, 11));
  const StateCode = line.substring(0, 2);
  const CountyCode = line.substring(2, 5);

  const [rows] = await connection.execute(
    getCountyIdByStateAndCountyCodes,
    [CountyCode, StateCode],
  );

  let CountyID = null;
  if (rows.length > 0 && rows[0].length > 0 && rows[0][0].CountyID) {
    CountyID = rows[0][0].CountyID;
  }

  const MonthData = parseMonthValues(line);

  return { CountyID, Year, DataType, StateCode, CountyCode, MonthData };
}

/**
 * Norms accumulation + flush at end of window.
 */
async function calculateNorms(yearData, prevDecember, normProperties, connection) {
  storeMonthlyValues(yearData, normProperties);
  storeYearlyValues(yearData, normProperties);
  storeSeasonalValues(yearData, prevDecember, normProperties);

  if (yearData.Year == climateNormalYears[1]) {
    await calculateAndInsertMonthlyNorms(yearData, normProperties, connection);
    await calculateAndInsertYearlyNorms(yearData, normProperties, connection);
    await calculateAndInsertSeasonalNorms(yearData, normProperties, connection);

    normProperties.monthlyNorms = {};
    normProperties.seasonalNorms = {};
    normProperties.yearlyNorms = {};
  }
}

/* ===== Norms storage helpers ===== */

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
  normProperties.yearlyNorms.total = roundToTwo(normProperties.yearlyNorms.total + yearTotal);
  normProperties.yearlyNorms.values.push(yearTotal);
}

function storeSeasonalValues(yearData, prevDecember, normProperties) {
  for (const key of seasonalValues) {
    if (!normProperties.seasonalNorms[key]) {
      normProperties.seasonalNorms[key] = { total: 0, values: [] };
    }
  }

  let winterTotal = prevDecember;
  let springTotal = 0;
  let summerTotal = 0;
  let fallTotal = 0;
  const monthsPerSeason = 3;

  for (const i in yearData.MonthData) {
    const value = yearData.MonthData[i];
    if (i < 2) winterTotal += value;
    else if (i < 5) springTotal += value;
    else if (i < 8) summerTotal += value;
    else if (i < 11) fallTotal += value;
  }

  if (yearData.DataType === tempDatatype) {
    winterTotal /= monthsPerSeason;
    springTotal /= monthsPerSeason;
    summerTotal /= monthsPerSeason;
    fallTotal /= monthsPerSeason;
  }

  winterTotal = roundToTwo(winterTotal);
  springTotal = roundToTwo(springTotal);
  summerTotal = roundToTwo(summerTotal);
  fallTotal = roundToTwo(fallTotal);

  normProperties.seasonalNorms.winter.total += winterTotal;
  normProperties.seasonalNorms.winter.values.push(winterTotal);

  normProperties.seasonalNorms.spring.total += springTotal;
  normProperties.seasonalNorms.spring.values.push(springTotal);

  normProperties.seasonalNorms.summer.total += summerTotal;
  normProperties.seasonalNorms.summer.values.push(summerTotal);

  normProperties.seasonalNorms.fall.total += fallTotal;
  normProperties.seasonalNorms.fall.values.push(fallTotal);
}

/* ===== Norms insert helpers ===== */

async function calculateAndInsertMonthlyNorms(yearData, normProperties, connection) {
  let query = '';
  if (yearData.DataType === precipDatatype) query = insertMonthlyPrecipNormsQuery;
  else if (yearData.DataType === tempDatatype) query = insertMonthlyTempNormsQuery;

  for (const i in yearData.MonthData) {
    const totalMonths = normProperties.monthlyNorms[i].values.length;
    const monthlyMean = normProperties.monthlyNorms[i].total / totalMonths;
    const sumOfSquares = normProperties.monthlyNorms[i].values
      .reduce((acc, val) => acc + Math.pow(val - monthlyMean, 2), 0);
    let stddev = Math.sqrt(sumOfSquares / totalMonths);

    let meanRounded = roundToTwo(monthlyMean);
    stddev = roundToTwo(stddev);

    if (!isNaN(meanRounded) && stddev !== null) {
      const params = [yearData.CountyID, monthValues[i], meanRounded, stddev];
      await connection.execute(query, params);
    }
  }
}

async function calculateAndInsertYearlyNorms(yearData, normProperties, connection) {
  let query = '';
  if (yearData.DataType === precipDatatype) query = insertYearlyPrecipNormsQuery;
  else if (yearData.DataType === tempDatatype) query = insertYearlyTempNormsQuery;

  const totalYears = normProperties.yearlyNorms.values.length;
  const yearlyMean = normProperties.yearlyNorms.total / totalYears;
  const sumOfSquares = normProperties.yearlyNorms.values
    .reduce((acc, val) => acc + Math.pow(val - yearlyMean, 2), 0);
  let stddev = Math.sqrt(sumOfSquares / totalYears);

  let meanRounded = roundToTwo(yearlyMean);
  stddev = roundToTwo(stddev);

  if (!isNaN(meanRounded) && stddev !== null) {
    const params = [yearData.CountyID, meanRounded, stddev];
    await connection.execute(query, params);
  }
}

async function calculateAndInsertSeasonalNorms(yearData, normProperties, connection) {
  let query = '';
  if (yearData.DataType === precipDatatype) query = insertSeasonalPrecipNormsQuery;
  else if (yearData.DataType === tempDatatype) query = insertSeasonalTempNormsQuery;

  for (const key of seasonalValues) {
    const totalSeasons = normProperties.seasonalNorms[key].values.length;
    const seasonalMean = normProperties.seasonalNorms[key].total / totalSeasons;
    const sumOfSquares = normProperties.seasonalNorms[key].values
      .reduce((acc, val) => acc + Math.pow(val - seasonalMean, 2), 0);
    let stddev = Math.sqrt(sumOfSquares / totalSeasons);

    let meanRounded = roundToTwo(seasonalMean);
    stddev = roundToTwo(stddev);

    if (!isNaN(meanRounded) && stddev !== null) {
      const params = [yearData.CountyID, key, meanRounded, stddev];
      await connection.execute(query, params);
    }
  }
}

/* ===== WI data insert helpers (monthly / seasonal / yearly) ===== */

async function insertWIMonthlyData(yearData, connection, latestYearMonth) {
  let query = '';
  if (yearData.DataType === precipDatatype) {
    query =
      'REPLACE INTO WICountyMonthlyPrecip_TEMP (CountyID, Year, Month, Precipitation) VALUES (?, ?, ?, ?);';
  } else if (yearData.DataType === tempDatatype) {
    query =
      'REPLACE INTO WICountyMonthlyTemp_TEMP (CountyID, Year, Month, Temperature) VALUES (?, ?, ?, ?);';
  }

  for (let i = 0; i < yearData.MonthData.length; i++) {
    const value = yearData.MonthData[i];
    const monthNum = parseInt(monthValues[i]);
    if (value === -9.99 || value === -99.90) continue;

    const shouldSkip =
      latestYearMonth &&
      (yearData.Year < latestYearMonth.year ||
        (yearData.Year === latestYearMonth.year &&
          monthNum <= latestYearMonth.month));
    if (shouldSkip) continue;

    const params = [yearData.CountyID, yearData.Year, monthValues[i], value];
    await connection.execute(query, params);
  }
}

async function insertWIYearlyData(yearData, connection) {
  let query = '';
  if (yearData.DataType === precipDatatype) {
    query =
      'REPLACE INTO WICountyYearlyPrecip_TEMP (CountyID, Year, Precipitation) VALUES (?, ?, ?);';
  } else if (yearData.DataType === tempDatatype) {
    query =
      'REPLACE INTO WICountyYearlyTemp_TEMP (CountyID, Year, Temperature) VALUES (?, ?, ?);';
  }

  let yearTotal = 0;
  for (const i in yearData.MonthData) {
    const value = yearData.MonthData[i];
    if (value !== -9.99 && value !== -99.90) yearTotal += value;
  }
  if (yearData.DataType === tempDatatype) {
    yearTotal = yearTotal / yearData.MonthData.length;
  }

  const params = [yearData.CountyID, yearData.Year, yearTotal];
  await connection.execute(query, params);
}

async function insertWISeasonalData(
  yearData,
  prevDecember,
  currentYear,
  currentMonth,
  connection,
  latestYearMonth,
) {
  let query = '';
  if (yearData.DataType === precipDatatype) {
    query =
      'REPLACE INTO WICountySeasonalPrecip_TEMP (CountyID, Year, Season, Precipitation) VALUES (?, ?, ?, ?);';
  } else if (yearData.DataType === tempDatatype) {
    query =
      'REPLACE INTO WICountySeasonalTemp_TEMP (CountyID, Year, Season, Temperature) VALUES (?, ?, ?, ?);';
  }

  let winterTotal = prevDecember;
  let springTotal = 0;
  let summerTotal = 0;
  let fallTotal = 0;
  const monthsPerSeason = 3;

  if (yearData.Year === currentYear) {
    for (const i in yearData.MonthData) {
      const value = yearData.MonthData[i];
      if (i < 2 && currentMonth > 2) winterTotal += value;
      else if (i < 5 && currentMonth > 5) springTotal += value;
      else if (i < 8 && currentMonth > 8) summerTotal += value;
      else if (i < 11 && currentMonth === 11) fallTotal += value;
    }
  } else {
    for (const i in yearData.MonthData) {
      const value = yearData.MonthData[i];
      if (i < 2) winterTotal += value;
      else if (i < 5) springTotal += value;
      else if (i < 8) summerTotal += value;
      else if (i < 11) fallTotal += value;
    }
  }

  if (yearData.DataType === tempDatatype) {
    winterTotal /= monthsPerSeason;
    springTotal /= monthsPerSeason;
    summerTotal /= monthsPerSeason;
    fallTotal /= monthsPerSeason;
  }

  winterTotal = roundToTwo(winterTotal);
  springTotal = roundToTwo(springTotal);
  summerTotal = roundToTwo(summerTotal);
  fallTotal = roundToTwo(fallTotal);

  const baseYear = Number(yearData.Year);
  const latest = {
    year: Number(latestYearMonth.year),
    month: Number(latestYearMonth.month),
  };

  // Meteorological season endpoints (DJF, MAM, JJA, SON)
  const seasonEnd = {
    winter: { year: baseYear + 1, month: 2 }, // Feb of next year
    spring: { year: baseYear, month: 5 }, // May
    summer: { year: baseYear, month: 8 }, // Aug
    fall: { year: baseYear, month: 11 }, // Nov
  };

  function isAfterLatest(season) {
    const end = seasonEnd[season];
    return (
      end.year > latest.year ||
      (end.year === latest.year && end.month > latest.month)
    );
  }

  if (baseYear !== 1895 && isAfterLatest('winter')) {
    await connection.execute(query, [
      yearData.CountyID,
      baseYear,
      seasonalValues[0],
      winterTotal,
    ]);
  }
  if (isAfterLatest('spring')) {
    await connection.execute(query, [
      yearData.CountyID,
      baseYear,
      seasonalValues[1],
      springTotal,
    ]);
  }
  if (isAfterLatest('summer')) {
    await connection.execute(query, [
      yearData.CountyID,
      baseYear,
      seasonalValues[2],
      summerTotal,
    ]);
  }
  if (isAfterLatest('fall')) {
    await connection.execute(query, [
      yearData.CountyID,
      baseYear,
      seasonalValues[3],
      fallTotal,
    ]);
  }
}

/**
 * Main: parse file & insert
 * - Creates input TEMP tables
 * - Iterates lines, accumulates normals in window
 * - Inserts WI data for current year vs historical
 * - Copies *_TEMP → final WI tables (using last seen DataType)
 */
async function parseAndInsertAllNormsAndWIData(responseData) {
  let connection;
  let lastDataType = null; // to decide which set of final tables to copy into

  try {
    connection = await pool.getConnection();
    console.log('Database connected successfully');

    await createTempTables(connection);

    const latestYearMonth = await getLatestInsertedMonth(connection);
    console.log(
      `Latest inserted (year/month): ${latestYearMonth?.year || 'none'}/${
        latestYearMonth?.month || 'none'
      }`,
    );

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-based

    const lines = responseData.split('\n');
    if (lines[lines.length - 1] === '') lines.pop();

    let prevDecember = null;
    const normProperties = {
      monthlyNorms: {},
      seasonalNorms: {},
      yearlyNorms: {},
    };

    for (const line of lines) {
      const yearData = await parseMonthlyLineData(line, connection);
      if (yearData.CountyID === null) continue;

      lastDataType = yearData.DataType; // remember last seen datatype

      // skip if we already have full year up to Dec
      if (
        latestYearMonth &&
        (yearData.Year < latestYearMonth.year ||
          (yearData.Year === latestYearMonth.year &&
            latestYearMonth.month === 12))
      ) {
        continue;
      }

      if (yearData.Year === 1895) prevDecember = null;

      // normals window
      if (
        yearData.Year >= climateNormalYears[0] &&
        yearData.Year <= climateNormalYears[1]
      ) {
        await calculateNorms(
          yearData,
          prevDecember,
          normProperties,
          connection,
        );
      }

      // WI data: stateCode '47' and only for the most recent DB year
      if (yearData.StateCode === '47' && yearData.Year === latestYearMonth.year) {
        await insertWIMonthlyData(yearData, connection, latestYearMonth);
        await insertWISeasonalData(
          yearData,
          prevDecember,
          currentYear,
          currentMonth,
          connection,
          latestYearMonth,
        );
        if (yearData.Year !== currentYear) {
          await insertWIYearlyData(yearData, connection);
        }
      }

      prevDecember = yearData.MonthData[11];
    }

    // Use the correct (last seen) DataType for copying temp → final
    if (lastDataType) {
      await copyTempToDataWITables(connection, lastDataType);
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

module.exports = {
  parseAndInsertAllNormsAndWIData,
};
