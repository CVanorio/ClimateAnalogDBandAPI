// config.js

module.exports = {
    dbConfig: {
        host        : process.env.DB_HOST,
        user        : process.env.DB_USER,
        password    : process.env.DB_PASSWORD,
        database    : process.env.DB_NAME,
        waitForConnections  : true,
        connectionLimit     : 100,
        queueLimit          : 0  },
    api: {
        mainURL: 'your_main_api_url',
        countyTempExt: '/nclimdiv-monthly/access/climdiv-tmpccy-v1.0.0-20240606',
        countyPrecipExt: '/nclimdiv-monthly/access/climdiv-pcpncy-v1.0.0-20240606',
        gridTempExt: '/nclimgrid-monthly/access/202404.tave.conus.pnt',
        gridPrecipExt: '/nclimgrid-monthly/access/202404.prcp.conus.pnt'
    }
};
