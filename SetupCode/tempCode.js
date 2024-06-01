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

// app.get('/fetchapidata', (req, res) => {
//     data = fetchDataFromAPI()
//     res.send("Data fetched from API");
// });

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
