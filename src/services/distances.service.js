/**
 * Distances Service
 * ----------------------------------------------------
 * Creates TEMP distance tables, runs stored procedures to compute
 * monthly/seasonal/yearly distances (precip, temp, combined),
 * and drops TEMP tables when finished
 */

const pool = require('../config/db');

const {
  calculateMonthlyPrecipDistancesQuery,
  calculateMonthlyTempDistancesQuery,
  calculateMonthlyCombinedDistancesQuery,
  calculateSeasonalPrecipDistancesQuery,
  calculateSeasonalTempDistancesQuery,
  calculateSeasonalCombinedDistancesQuery,
  calculateYearlyPrecipDistancesQuery,
  calculateYearlyTempDistancesQuery,
  calculateYearlyCombinedDistancesQuery,
} = require('../sql/queries');

/* ===== Utilities (local to this service) ===== */

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
    )`,
    `CREATE TABLE IF NOT EXISTS yearly_temperature_distances_TEMP (
      TargetCountyID INT,
      AnalogCountyID INT,
      Year INT,
      Distance DECIMAL(5,2),
      PRIMARY KEY (TargetCountyID, AnalogCountyID, Year)
    )`,

    // SEASONAL
    `CREATE TABLE IF NOT EXISTS seasonal_precipitation_distances_TEMP (
      TargetCountyID INT,
      AnalogCountyID INT,
      Year INT,
      Season VARCHAR(6),
      Distance DECIMAL(5,2),
      PRIMARY KEY (TargetCountyID, AnalogCountyID, Year, Season)
    )`,
    `CREATE TABLE IF NOT EXISTS seasonal_temperature_distances_TEMP (
      TargetCountyID INT,
      AnalogCountyID INT,
      Year INT,
      Season VARCHAR(6),
      Distance DECIMAL(5,2),
      PRIMARY KEY (TargetCountyID, AnalogCountyID, Year, Season)
    )`,

    // MONTHLY
    `CREATE TABLE IF NOT EXISTS monthly_precipitation_distances_TEMP (
      TargetCountyID INT,
      AnalogCountyID INT,
      Year INT,
      Month VARCHAR(2),
      Distance DECIMAL(5,2),
      PRIMARY KEY (TargetCountyID, AnalogCountyID, Year, Month)
    )`,
    `CREATE TABLE IF NOT EXISTS monthly_temperature_distances_TEMP (
      TargetCountyID INT,
      AnalogCountyID INT,
      Year INT,
      Month VARCHAR(2),
      Distance DECIMAL(5,2),
      PRIMARY KEY (TargetCountyID, AnalogCountyID, Year, Month)
    )`,
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

/* ===== Distance runners (match original sequencing) ===== */

async function calculatePrecipDistances() {
  try {
    await createAllTEMPDistanceTables();
    await runOnce('Monthly Precipitation Distances', calculateMonthlyPrecipDistancesQuery);
    await runOnce('Seasonal Precipitation Distances', calculateSeasonalPrecipDistancesQuery);
    await runOnce('Yearly Precipitation Distances', calculateYearlyPrecipDistancesQuery);
  } catch (error) {
    console.error('Error in calculatePrecipDistances:', error);
    throw error;
  }
}

async function calculateTempDistances() {
  try {
    await runOnce('Monthly Temperature Distances', calculateMonthlyTempDistancesQuery);
    await runOnce('Seasonal Temperature Distances', calculateSeasonalTempDistancesQuery);
    await runOnce('Yearly Temperature Distances', calculateYearlyTempDistancesQuery);
  } catch (error) {
    console.error('Error in calculateTempDistances:', error);
    throw error;
  }
}

async function calculateTwoVariableDistances() {
  try {
    await runOnce('Monthly Combined Distances', calculateMonthlyCombinedDistancesQuery);
    await runOnce('Seasonal Combined Distances', calculateSeasonalCombinedDistancesQuery);
    await runOnce('Yearly Combined Distances', calculateYearlyCombinedDistancesQuery);
    // mirror original behavior: drop temp tables after combined distances
    await dropAllTempTables();
  } catch (error) {
    console.error('Error in calculateTwoVariableDistances:', error);
    throw error;
  }
}

/**
 * Master orchestrator (unchanged logic): run precip → temp → combined.
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

module.exports = {
  // lifecycle helpers (exported because original code used them)
  createAllTEMPDistanceTables,
  dropAllTempTables,

  // runners
  calculatePrecipDistances,
  calculateTempDistances,
  calculateTwoVariableDistances,
  calculateAndInsertEuclideanDistances,
};
