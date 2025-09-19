
// src/controllers/admin.controller.js
////////////////////////////////////////////////////////////////////////////////////////////////////
// Admin Controller
// - /addcounty/:countyID/:countyName/:stateCode/:lat/:long
// - /addstate/:StateCode/:StateAbbr/:StateName
// - /getcounties
// - /getcounty/:CountyID
////////////////////////////////////////////////////////////////////////////////////////////////////


const {pool} = require('../config/db'); // mysql2/promise pool
const { insertCountyQuery, insertStateQuery } = require('../sql/queries');

// Fire-and-forget helper to mimic original behavior for /addcounty
async function _insertCountyFF(countyID, countyName, stateCode, lat, long) {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Database connected successfully');

    const Latitude = parseFloat(lat);
    const Longitude = parseFloat(long);

    if (!countyID || !countyName || !stateCode || isNaN(Latitude) || isNaN(Longitude)) {
      console.log(`Invalid parameters: ${countyID}, ${countyName}, ${stateCode}, ${Latitude}, ${Longitude}`);
      return;
    }

    const [result] = await connection.execute(insertCountyQuery, [
      countyID,
      countyName,
      stateCode,
      Latitude,
      Longitude,
    ]);

    console.log(result);
  } catch (error) {
    console.error('Error inserting county:', error);
  } finally {
    if (connection) {
      connection.release();
      console.log('Database connection closed.');
    }
  }
}

// POST /addcounty/:countyID/:countyName/:stateCode/:lat/:long
// Responds immediately, then kicks off insert.
async function addCounty(req, res) {
  try {
    const { countyID, countyName, stateCode, lat, long } = req.params;

    // Send response immediately (original behavior)
    res.send('All county data added successfully.');

    // Do the insert in the background (do not await)
    _insertCountyFF(countyID, countyName, stateCode, lat, long);
  } catch (error) {
    // If something throws before we send (unlikely), match original error logs:
    if (error?.response) {
      console.error('Error response from server:', error.response.status, error.response.data);
    } else if (error?.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up the request:', error.message);
    }
    console.error('Error details:', error?.config);
    // If res wasn’t sent yet, try to send 500 (best-effort)
    if (!res.headersSent) {
      return res.status(500).send('Error adding county data.');
    }
  }
}

// POST /addstate/:StateCode/:StateAbbr/:StateName
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

    const [result] = await connection.execute(insertStateQuery, [StateCode, StateAbbr, StateName]);
    console.log(result);

    return res.send('State inserted successfully');
  } catch (error) {
    if (error?.response) {
      console.error('Error response from server:', error.response.status, error.response.data);
    } else if (error?.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up the request:', error.message);
    }
    console.error('Error details:', error?.config);
    return res.status(500).send('Error adding state data.');
  } finally {
    if (connection) {
      connection.release();
      console.log('Database connection closed.');
    }
  }
}

// GET /getcounties
async function getAllCounties(req, res) {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Database connected successfully');

    const sql = 'SELECT * FROM counties';
    const [results] = await connection.query(sql);

    console.log(results);
    return res.send('Counties fetched');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error fetching counties');
  } finally {
    if (connection) {
      connection.release();
      console.log('Database connection closed.');
    }
  }
}

// GET /getcounty/:CountyID
async function getCountyById(req, res) {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Database connected successfully');

    const { CountyID } = req.params;
    const sql = 'SELECT * FROM counties WHERE CountyID = ?';
    const [result] = await connection.query(sql, [CountyID]);

    console.log(result);
    return res.send('County fetched');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error fetching county');
  } finally {
    if (connection) {
      connection.release();
      console.log('Database connection closed.');
    }
  }
}

module.exports = {
  addCounty,
  addState,
  getAllCounties,
  getCountyById,
};
