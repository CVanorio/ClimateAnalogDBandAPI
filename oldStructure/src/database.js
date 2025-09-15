// database.js

const mysql = require('mysql2/promise');
const { dbConfig } = require('../config/config'); // Ensure you have dbConfig with database credentials

let pool;

async function connect() {
    pool = mysql.createPool(dbConfig);
}

async function getConnection() {
    if (!pool) {
        await connect();
    }
    return await pool.getConnection();
}

module.exports = {
    getConnection
};
