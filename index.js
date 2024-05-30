// Import required modules
const axios = require('axios');
const mysql = require('mysql2');
const express = require('express');

// Load environment variables
require('dotenv').config();

// Create connection
const db = mysql.createConnection({
    host        : process.env.DB_HOST,
    user        : process.env.DB_USER,
    password    : process.env.DB_PASSWORD,
    database    : process.env.DB_NAME
});

const connectionOptions = {
    host        : process.env.DB_HOST,
    user        : process.env.DB_USER,
    password    : process.env.DB_PASSWORD,
    database    : process.env.DB_NAME
};

// Connect
db.connect((err) => {
    if(err){
        throw err;
    }
    console.log('MySQL Connected');
});

const app = express();

const stateNamesByCode = {
    '01': 'Alabama',
    '02': 'Arizona',
    '03': 'Arkansas',
    '04': 'California',
    '05': 'Colorado',
    '06': 'Connecticut',
    '07': 'Delaware',
    '08': 'Florida',
    '09': 'Georgia',
    '10': 'Idaho',
    '11': 'Illinois',
    '12': 'Indiana',
    '13': 'Iowa',
    '14': 'Kansas',
    '15': 'Kentucky',
    '16': 'Louisiana',
    '17': 'Maine',
    '18': 'Maryland',
    '19': 'Massachusetts',
    '20': 'Michigan',
    '21': 'Minnesota',
    '22': 'Mississippi',
    '23': 'Missouri',
    '24': 'Montana',
    '25': 'Nebraska',
    '26': 'Nevada',
    '27': 'New Hampshire',
    '28': 'New Jersey',
    '29': 'New Mexico',
    '30': 'New York',
    '31': 'North Carolina',
    '32': 'North Dakota',
    '33': 'Ohio',
    '34': 'Oklahoma',
    '35': 'Oregon',
    '36': 'Pennsylvania',
    '37': 'Rhode Island',
    '38': 'South Carolina',
    '39': 'South Dakota',
    '40': 'Tennessee',
    '41': 'Texas',
    '42': 'Utah',
    '43': 'Vermont',
    '44': 'Virginia',
    '45': 'Washington',
    '46': 'West Virginia',
    '47': 'Wisconsin',
    '48': 'Wyoming',
    '50': 'Alaska'
};

// Function to fetch data from the API
async function fetchDataFromAPI() {
    try {
      const response = await axios.get('https://www.ncei.noaa.gov/data/nclimdiv-monthly/access/climdiv-tmpccy-v1.0.0-20240506');
      const data = response.data;

      //console.log(data);

      parseAndStoreData(data);
  
      // Process the data
      //const processedData = processData(data);
  
      // Store specific values in the database
      //storeDataInDatabase(processedData);
      return data;
    } catch (error) {
      console.error('Error fetching data from the API:', error);
      return error;
    }
  }

// Function to parse the response data and store it in the database
async function parseAndStoreData(responseData) {
    // Define connection to the MySQL database
    //const connection = mysql.createConnection(connectionOptions);

    try {
        // Define SQL query template for inserting data
        const insertQuery = `
            INSERT INTO MonthlyData (StateCode, CountyFIPS, DatasetID, Year, Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Connect to the MySQL database
       // connection.connect();

       const lines = responseData.split('\n');
        
       // Iterate over each line and process separately
       for (let line of lines) {
           // Extract data from the line based on character positions
           const StateName = stateNamesByCode[line.substring(0, 2)];
           const CountyFIPS = line.substring(2, 5);
           const DatasetID = line.substring(5, 7);
           const Year = parseInt(line.substring(7, 11));
           const Jan = parseFloat(line.substring(11, 18));
           const Feb = parseFloat(line.substring(18, 25));
           const Mar = parseFloat(line.substring(25, 32));
           const Apr = parseFloat(line.substring(32, 39));
           const May = parseFloat(line.substring(39, 46));
           const Jun = parseFloat(line.substring(46, 53));
           const Jul = parseFloat(line.substring(53, 60));
           const Aug = parseFloat(line.substring(60, 67));
           const Sep = parseFloat(line.substring(67, 74));
           const Oct = parseFloat(line.substring(74, 81));
           const Nov = parseFloat(line.substring(81, 88));
           const Dec = parseFloat(line.substring(88, 95));
           
           // Output the extracted data
           console.log('Extracted data:', {
               StateName, CountyFIPS, DatasetID, Year, Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec
           });
            // Execute the insert query
            // await connection.query(insertQuery, [
            //     StateCode, CountyFIPS, DatasetID, Year, Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec
            // ]);

            //console.log('Data inserted:', dataItem);
        }

        console.log('All data inserted successfully.');
    } catch (error) {
        console.error('Error inserting data:', error);
    } finally {
        // Close the database connection
        //connection.end();
        console.log('Database connection closed.');
    }
}

app.get('/fetchapidata', (req, res) => {
    data = fetchDataFromAPI()
    res.send("Data fetched from API");
});

// Create DB
app.get('/createdb', (req, res) => {
    let sql = 'CREATE DATABASE climateanalogdb';
    db.query(sql, (err, result) => {
        if(err){
            throw err;
        }
        console.log(result);
        res.send('Database created...');
    });
});

// Create county tables

app.get('/createcountiestable', (req, res) => {
    let sql = 'CALL CreateCountiesTable();';

    db.query(sql, (err, result) => {
        if(err) {
            throw err;
        }
        console.log(result);
        res.send('Stored procedure executed: Counties table created');
    });
});

app.get('/createcountydatatable', (req, res) => {
    let sql = 'CALL CreateCountyDataTable();';

    db.query(sql, (err, result) => {
        if(err) {
            throw err;
        }
        console.log(result);
        res.send('Stored procedure executed: CountyData table created');
    });
});

app.get('/createcountyanalogdatatable', (req, res) => {
    let sql = 'CALL CreateCountyAnalogDataTable();';

    db.query(sql, (err, result) => {
        if(err) {
            throw err;
        }
        console.log(result);
        res.send('Stored procedure executed: CountyAnalogData table created');
    });
});

app.get('/createcountymatchestable', (req, res) => {
    let sql = 'CALL CreateCountyMatchesTable();';

    db.query(sql, (err, result) => {
        if(err) {
            throw err;
        }
        console.log(result);
        res.send('Stored procedure executed: CountyMatches table created');
    });
});
    
// // Create grid tables

// app.get('/creategridstable', (req, res) => {
//     let sql = 'CALL CreateGridsTable();';
//////////////  remake stored procedure
//     db.query(sql, (err, result) => {
//         if(err) {
//             throw err;
//         }
//         console.log(result);
//         res.send('Stored procedure executed: Grids table created');
//     });
// });

// app.get('/creategriddatatable', (req, res) => {
//     let sql = 'CALL CreateGridDataTable();';

//     db.query(sql, (err, result) => {
//         if(err) {
//             throw err;
//         }
//         console.log(result);
//         res.send('Stored procedure executed: GridData table created');
//     });
// });

// app.get('/creategridanalogdatatable', (req, res) => {
//     let sql = 'CALL CreateGridAnalogDataTable();';

//     db.query(sql, (err, result) => {
//         if(err) {
//             throw err;
//         }
//         console.log(result);
//         res.send('Stored procedure executed: GridAnalogData table created');
//     });
// });

// app.get('/creategridmatchestable', (req, res) => {
//     let sql = 'CALL CreateGridMatchesTable();';

//     db.query(sql, (err, result) => {
//         if(err) {
//             throw err;
//         }
//         console.log(result);
//         res.send('Stored procedure executed: GridMatches table created');
//     });
// });
        

// Add county
app.get('/addcounty/:CountyName/:StateCode/:Latitude/:Longitude', (req, res) => {
    // Extract parameters from query string
    let { CountyName, StateCode, Latitude, Longitude} = req.params;

    // Convert Latitude and Longitude to numbers and IsWICounty to boolean
    Latitude = parseFloat(Latitude);
    Longitude = parseFloat(Longitude);

    // Validate parameters
    if (!CountyName || !StateCode || isNaN(Latitude) || isNaN(Longitude)) {
        return res.status(400).send('Invalid parameters');
    }

    let sql = 'CALL AddCounty(?, ?, ?, ?)';
    db.query(sql, [CountyName, StateCode, Latitude, Longitude], (err, result) => {
        if(err) {
            throw err;
        }
        console.log(result);
        res.send('County inserted');
    });
});


// Get all counties
app.get('/getcounties', (req, res) => {
    let sql = 'SELECT * FROM counties';
    let query = db.query(sql, (err, results) => {
        if(err) {
            throw err;
        }
        console.log(results);
        res.send('Counties fetched')
    })
})

// Get a county
app.get('/getcounty/:CountyID', (req, res) => {
    let sql = `SELECT * FROM counties WHERE CountyID = ${req.params.CountyID}`;
    let query = db.query(sql, (err, result) => {
        if(err) {
            throw err;
        }
        console.log(result);
        res.send('County fetched')
    })
})

app.listen('3000', () => {
    console.log('Sever started on port 3000');
});