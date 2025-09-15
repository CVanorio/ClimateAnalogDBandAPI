/**
 * Controller: Admin endpoints (add county/state; simple fetches).
 * Mirrors original behavior while keeping the same stored procedures and responses.
 */

const pool = require('../config/db');
const { insertCountyQuery, insertStateQuery } = require('../sql/queries');

/**
 * POST /addcounty/:countyID/:countyName/:stateCode/:lat/:long
 */
async function addCounty(req, res) {
  let connection;
  try {
    const { countyID, countyName, stateCode, lat, long } = req.params;

    connection = await pool.getConnection();
    console.log('Database connected successfully');

    const Latitude = parseFloat(lat);
    const Longitude = parseFloat(long);

    if (!countyID || !countyName || !stateCode || isNaN(Latitude) || isNaN(Longitude)) {
      console.log(
        `Invalid parameters: ${countyID}, ${countyName}, ${stateCode}, ${Latitude}, ${Longitude}`
      );
      return res.status(400).send('Invalid parameters');
    }

    // Use promise API directly; preserve same procedure + side effects
    const [result] = await connection.execute(insertCountyQuery, [
      countyID,
      countyName,
      stateCode,
      Latitude,
      Longitude,
    ]);

    // Match original: on success, send the procedure result
    return res.send(result);
  } catch (error) {
    console.error('Error inserting county:', error);
    return res.status(500).send('Error inserting county');
  } finally {
    if (connection) {
      connection.release();
      console.log('Database connection closed.');
    }
  }
}

/**
 * POST /addstate/:StateCode/:StateAbbr/:StateName
 */
async function addState(req, res) {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Database connected successfully');

    const { StateCode, StateAbbr, StateName } = req.params;

    if (!StateCode || !StateAbbr || !StateName) {
      console.log(`Invalid parameters: ${StateCode}, ${StateAbbr}, ${StateName}`);
      return res.status(400).send('Invalid parameters');
    }

    // Use the same text of the query that was in the original code path
    const [result] = await connection.execute(insertStateQuery, [
      StateCode,
      StateAbbr,
      StateName,
    ]);

    // Match original success message
    return res.send('State inserted successfully');
  } catch (error) {
    console.error('Error inserting state:', error);
    return res.status(500).send('Error inserting state');
  } finally {
    if (connection) {
      connection.release();
      console.log('Database connection closed.');
    }
  }
}

/**
 * GET /getcounties
 * Note: Original code referenced a non-existent `db` connection.
 * Here we use the shared pool to preserve the intended behavior.
 */
async function getCounties(_req, res) {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM counties');
    console.log(rows);
    return res.send('Counties fetched');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error fetching counties');
  } finally {
    if (connection) connection.release();
  }
}

/**
 * GET /getcounty/:CountyID
 * Same note as above regarding `db` → pool.
 */
async function getCountyById(req, res) {
  const { CountyID } = req.params;
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM counties WHERE CountyID = ?', [CountyID]);
    console.log(rows);
    return res.send('County fetched');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error fetching county');
  } finally {
    if (connection) connection.release();
  }
}

module.exports = {
  addCounty,
  addState,
  getCounties,
  getCountyById,
};
