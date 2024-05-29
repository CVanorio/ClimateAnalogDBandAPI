require('dotenv').config();
const axios = require('axios');
const mysql = require('mysql2/promise');

// SQL statements for creating tables and view
const createTablesSQL = `
CREATE TABLE IF NOT EXISTS Counties (
    CountyID INT AUTO_INCREMENT PRIMARY KEY,      
    CountyName VARCHAR(100),        
    StateCode CHAR(2),     
    Latitude DECIMAL(8, 6),         
    Longitude DECIMAL(9, 6),        
    IsWICounty BOOLEAN
);

CREATE TABLE IF NOT EXISTS CountyData (
    CountyID INT,      
    Date DATE,     
    Precipitation DECIMAL(5, 2),        
    Temperature DECIMAL(5, 2),      
    PRIMARY KEY (CountyID, Date),       
    FOREIGN KEY (CountyID) REFERENCES Counties(CountyID)
);

CREATE TABLE IF NOT EXISTS AnalogData (
    CountyID INT PRIMARY KEY,       
    AvgPrecipitation DECIMAL(5, 2),         
    AvgTemperature DECIMAL(5, 2),       
    FOREIGN KEY (CountyID) REFERENCES Counties(CountyID)
);

CREATE TABLE IF NOT EXISTS CountyMatches (
    TargetCountyID INT,         
    Date DATE,      
    AnalogCountyID INT,         
    EuclideanDist DECIMAL(5, 2),        
    EuclideanDistPrecip DECIMAL(5, 2),      
    EuclideanDistTemp DECIMAL(5, 2),        
    IsMedianAnalog BOOLEAN,
    PRIMARY KEY (TargetCountyID, Date, AnalogCountyID),     
    FOREIGN KEY (TargetCountyID) REFERENCES Counties(CountyID),     
    FOREIGN KEY (AnalogCountyID) REFERENCES Counties(CountyID)
);

CREATE VIEW IF NOT EXISTS TargetCountyData AS
SELECT 
    c.CountyID, 
    c.CountyName, 
    t.Date, 
    t.Precipitation, 
    t.Temperature
FROM 
    Counties c
JOIN 
    CountyData t ON c.CountyID = t.CountyID
WHERE 
    c.IsWICounty = TRUE;
`;

// Function to create tables and view
async function createTablesAndView(connection) {
    try {
        await connection.query(createTablesSQL);
        console.log('Tables and view created successfully.');
    } catch (error) {
        console.error('Error creating tables and view:', error);
        throw error;
    }
}

// Function to fetch data from the API
async function fetchData(apiUrl) {
    try {
        const response = await axios.get(apiUrl);
        return response.data;
    } catch (error) {
        console.error('Error fetching data from the API:', error);
        throw error;
    }
}

// Function to insert county data into MySQL using prepared statements
async function insertCountyData(data, connection) {
    const countyQuery = 'INSERT INTO Counties (CountyName, StateCode, Latitude, Longitude, IsWICounty) VALUES (?, ?, ?, ?, ?)';
    const countyDataQuery = 'INSERT INTO CountyData (CountyID, Date, Precipitation, Temperature) VALUES (?, ?, ?, ?)';
    const analogDataQuery = 'INSERT INTO AnalogData (CountyID, AvgPrecipitation, AvgTemperature) VALUES (?, ?, ?)';
    const countyMatchesQuery = 'INSERT INTO CountyMatches (TargetCountyID, Date, AnalogCountyID, EuclideanDist, EuclideanDistPrecip, EuclideanDistTemp, IsMedianAnalog) VALUES (?, ?, ?, ?, ?, ?, ?)';

    try {
        // Insert counties and their data
        for (const county of data.counties) {
            const [result] = await connection.execute(countyQuery, [county.name, county.stateCode, county.latitude, county.longitude, county.isWICounty]);
            const countyID = result.insertId;

            for (const entry of county.data) {
                await connection.execute(countyDataQuery, [countyID, entry.date, entry.precipitation, entry.temperature]);
            }

            await connection.execute(analogDataQuery, [countyID, county.avgPrecipitation, county.avgTemperature]);

            for (const match of county.matches) {
                await connection.execute(countyMatchesQuery, [countyID, match.date, match.analogCountyID, match.euclideanDist, match.euclideanDistPrecip, match.euclideanDistTemp, match.isMedianAnalog]);
            }
        }

        console.log('County data successfully inserted into MySQL database.');
    } catch (error) {
        console.error('Error inserting county data into MySQL:', error);
        throw error;
    }
}

// Function to insert grid data into MySQL using prepared statements
async function insertGridData(data, connection) {
    const gridQuery = 'INSERT INTO Grids (GridName, StateCode, Latitude, Longitude, IsWIGrid) VALUES (?, ?, ?, ?, ?)';
    const gridDataQuery = 'INSERT INTO GridData (GridID, Date, Precipitation, Temperature) VALUES (?, ?, ?, ?)';
    const analogGridDataQuery = 'INSERT INTO AnalogGridData (GridID, AvgPrecipitation, AvgTemperature) VALUES (?, ?, ?)';
    const gridMatchesQuery = 'INSERT INTO GridMatches (TargetGridID, Date, AnalogGridID, EuclideanDist, EuclideanDistPrecip, EuclideanDistTemp, IsMedianAnalog) VALUES (?, ?, ?, ?, ?, ?, ?)';

    try {
        // Insert grids and their data
        for (const grid of data.grids) {
            const [result] = await connection.execute(gridQuery, [grid.name, grid.stateCode, grid.latitude, grid.longitude, grid.isWIGrid]);
            const gridID = result.insertId;

            for (const entry of grid.data) {
                await connection.execute(gridDataQuery, [gridID, entry.date, entry.precipitation, entry.temperature]);
            }

            await connection.execute(analogGridDataQuery, [gridID, grid.avgPrecipitation, grid.avgTemperature]);

            for (const match of grid.matches) {
                await connection.execute(gridMatchesQuery, [gridID, match.date, match.analogGridID, match.euclideanDist, match.euclideanDistPrecip, match.euclideanDistTemp, match.isMedianAnalog]);
            }
        }

        console.log('Grid data successfully inserted into MySQL database.');
    } catch (error) {
        console.error('Error inserting grid data into MySQL:', error);
        throw error;
    }
}

// Main function to orchestrate creating tables, fetching data, and inserting data
(async () => {
    const countiesApiUrl = process.env.COUNTIES_API_URL;
    const gridsApiUrl = process.env.GRIDS_API_URL;
    const apiToken = process.env.API_TOKEN;

    console.log(process.env.DB_HOST); // Should output your MySQL username
    console.log(process.env.DB_USER);
    console.log(process.env.DB_PASSWORD);
    console.log(process.env.DB_NAME);

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        // Revoke DELETE permission from all users for all tables
        //await revokeDeletePermissions(connection);

        // Create tables and view
        await createTablesAndView(connection);

        // Fetch data from the APIs with API token passed in headers and using CORS
        // const [countyData, gridData] = await Promise.all([
        //     fetchDataWithCORS(countiesApiUrl, { headers: { Authorization: `Bearer ${apiToken}` } }),
        //     fetchDataWithCORS(gridsApiUrl, { headers: { Authorization: `Bearer ${apiToken}` } })
        // ]);

        // Insert data into MySQL
        //await insertCountyData(countyData, connection);
        //await insertGridData(gridData, connection);

        await connection.end();
    } catch (error) {
        console.error('An error occurred:', error);
    }
})();

// Function to fetch data from the API with CORS
async function fetchDataWithCORS(apiUrl, config) {
    try {
        const response = await axios.get(apiUrl, config);
        return response.data;
    } catch (error) {
        console.error('Error fetching data from the API:', error);
        throw error;
    }
}

// Function to revoke DELETE permission from all users for all tables
async function revokeDeletePermissions(connection) {
    try {
        // Generate and execute REVOKE statements for all tables
        const revokeStatements = `
            SELECT CONCAT('REVOKE DELETE ON ', table_name, ' FROM ALL;')
            FROM information_schema.tables
            WHERE table_schema = '${process.env.DB_NAME}'
            AND table_type = 'BASE TABLE';
        `;
        await connection.query(revokeStatements);

        // Revoke DELETE permission for the database
        await connection.query(`REVOKE DELETE ON ${process.env.DB_NAME}.* FROM ALL;`);
    } catch (error) {
        console.error('Error revoking delete permissions:', error);
        throw error;
    }
}
