/**
 * Database pool configuration.
 * 
 */
const mysql = require('mysql2/promise');

const connectionOptions = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 0,
};

const pool = mysql.createPool(connectionOptions);

module.exports = pool;
