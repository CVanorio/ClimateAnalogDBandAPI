
// src/config/db.js

////////////////////////////////////////////////////////////////////////////////////////////////////
// Database Pool (and optional single connection)
// - Uses environment variables from .env
// - Provides a MySQL connection pool for the app
////////////////////////////////////////////////////////////////////////////////////////////////////

const mysql = require('mysql2/promise');
require('dotenv').config();

const connectionOptions = {
  host              : process.env.DB_HOST,
  user              : process.env.DB_USER,
  password          : process.env.DB_PASSWORD,
  database          : process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit   : 100,
  queueLimit        : 0
};

console.log("DB Host: ", process.env.DB_HOST)

const pool = mysql.createPool(connectionOptions);

module.exports = { pool };
