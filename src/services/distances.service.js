// src/services/distances.service.js

////////////////////////////////////////////////////////////////////////////////////////////////////
// Distance calculations (verbatim logic preserved)
// Now opens a NEW DB connection for EACH individual execute() call.
// Public API signatures unchanged so existing callers keep working.
////////////////////////////////////////////////////////////////////////////////////////////////////

const {pool} = require('../config/db');

const {
  calculateMonthlyPrecipDistancesQuery,
  calculateSeasonalPrecipDistancesQuery,
  calculateYearlyPrecipDistancesQuery,
  calculateMonthlyTempDistancesQuery,
  calculateSeasonalTempDistancesQuery,
  calculateYearlyTempDistancesQuery,
  calculateMonthlyCombinedDistancesQuery,
  calculateSeasonalCombinedDistancesQuery,
  calculateYearlyCombinedDistancesQuery,
} = require('../sql/queries');

/**
 * Internal helper: run a single query with its own connection.
 */
async function runWithNewConnection(query) {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.execute(query);
  } finally {
    if (connection) connection.release();
  }
}

/**
 * Verbatim calculatePrecipDistances(connection)
 * (connection param kept for API compatibility; it is intentionally ignored.)
 */
async function calculatePrecipDistances(/* connection */) {
  console.log('Calculating Precip variable distances!');
  await runWithNewConnection(calculateMonthlyPrecipDistancesQuery);
  await runWithNewConnection(calculateSeasonalPrecipDistancesQuery);
  await runWithNewConnection(calculateYearlyPrecipDistancesQuery);
}

/**
 * Verbatim calculateTempDistances(connection)
 * (connection param kept for API compatibility; it is intentionally ignored.)
 */
async function calculateTempDistances(/* connection */) {
  console.log('Calculating Temp variable distances!');
  await runWithNewConnection(calculateMonthlyTempDistancesQuery);
  await runWithNewConnection(calculateSeasonalTempDistancesQuery);
  await runWithNewConnection(calculateYearlyTempDistancesQuery);
}

/**
 * Verbatim calculateTwoVariableDistances(connection)
 * (connection param kept for API compatibility; it is intentionally ignored.)
 */
async function calculateTwoVariableDistances(/* connection */) {
  console.log('Calculating Combined variable distances!');
  await runWithNewConnection(calculateMonthlyCombinedDistancesQuery);
  await runWithNewConnection(calculateSeasonalCombinedDistancesQuery);
  await runWithNewConnection(calculateYearlyCombinedDistancesQuery);
}

/**
 * Verbatim calculateAndInsertEuclideanDistances()
 * Preserves the original return shape (including undefined 'responseData').
 * No single shared connection is opened here anymore — each execute has its own.
 */
async function calculateAndInsertEuclideanDistances() {
  try {

    await createAllTEMPDistanceTables();
  
    await calculatePrecipDistances();
    await calculateTempDistances();
    await calculateTwoVariableDistances();

    await dropAllTempTables();

    return {
      success: true,
      data: 'Euclidean distance calculations completed', // or null if you prefer
    };
  } catch (error) {
    console.error('Error inserting data:', error);
    return {
      success: false,
      error: `Error inserting data: ${error.message}`,
    };
  }
}


/* ===== TEMP distance table lifecycle ===== */

async function createTempDistanceTables(connection) {
  const queries = [
    // YEARLY
    `CREATE TABLE IF NOT EXISTS yearly_precipitation_distances_TEMP (
      TargetCountyID INT,
      AnalogCountyID INT,
      Year INT,
      Distance DECIMAL(5,2),
      PRIMARY KEY (TargetCountyID, AnalogCountyID, Year)
    );`,
      `TRUNCATE TABLE yearly_precipitation_distances_TEMP;`,
    `CREATE TABLE IF NOT EXISTS yearly_temperature_distances_TEMP (
      TargetCountyID INT,
      AnalogCountyID INT,
      Year INT,
      Distance DECIMAL(5,2),
      PRIMARY KEY (TargetCountyID, AnalogCountyID, Year)
    );`,
    `TRUNCATE TABLE yearly_precipitation_distances_TEMP;`,

    // SEASONAL
    `CREATE TABLE IF NOT EXISTS seasonal_precipitation_distances_TEMP (
      TargetCountyID INT,
      AnalogCountyID INT,
      Year INT,
      Season VARCHAR(6),
      Distance DECIMAL(5,2),
      PRIMARY KEY (TargetCountyID, AnalogCountyID, Year, Season)
    );`,
   `TRUNCATE TABLE seasonal_precipitation_distances_TEMP;`,
    `CREATE TABLE IF NOT EXISTS seasonal_temperature_distances_TEMP (
      TargetCountyID INT,
      AnalogCountyID INT,
      Year INT,
      Season VARCHAR(6),
      Distance DECIMAL(5,2),
      PRIMARY KEY (TargetCountyID, AnalogCountyID, Year, Season)
    );`,
    `TRUNCATE TABLE yearly_precipitation_distances_TEMP;`,

    // MONTHLY
    `CREATE TABLE IF NOT EXISTS monthly_precipitation_distances_TEMP (
      TargetCountyID INT,
      AnalogCountyID INT,
      Year INT,
      Month VARCHAR(2),
      Distance DECIMAL(5,2),
      PRIMARY KEY (TargetCountyID, AnalogCountyID, Year, Month)
    );`,
    `TRUNCATE TABLE monthly_precipitation_distances_TEMP;`,
    `CREATE TABLE IF NOT EXISTS monthly_temperature_distances_TEMP (
      TargetCountyID INT,
      AnalogCountyID INT,
      Year INT,
      Month VARCHAR(2),
      Distance DECIMAL(5,2),
      PRIMARY KEY (TargetCountyID, AnalogCountyID, Year, Month)
    );`,
    `TRUNCATE TABLE yearly_precipitation_distances_TEMP;`,
  ];

  for (const q of queries) {
    await connection.execute(q);
  }
  console.log('All TEMP distance tables created.');
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

    // Input TEMP Tables (mirrors original dropAllTempTables behavior)
    'TargetStateCountyMonthlyPrecip_TEMP',
    'TargetStateCountyMonthlyTemp_TEMP',
    'TargetStateCountySeasonalPrecip_TEMP',
    'TargetStateCountySeasonalTemp_TEMP',
    'TargetStateCountyYearlyPrecip_TEMP',
    'TargetStateCountyYearlyTemp_TEMP',
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

async function createAllTEMPDistanceTables() {
  console.log('--- Creating TEMP distance tables ---');
  const conn = await pool.getConnection();
  try {
    await createTempDistanceTables(conn);
    console.log('TEMP distance tables created');
  } finally {
    conn.release();
  }
}

async function dropAllTempTables() {
  console.log('--- Dropping TEMP tables ---');
  const conn = await pool.getConnection();
  try {
    await dropTempTables(conn);
    console.log('TEMP tables dropped');
  } finally {
    conn.release();
  }
}


module.exports = {
  calculateAndInsertEuclideanDistances,
};
