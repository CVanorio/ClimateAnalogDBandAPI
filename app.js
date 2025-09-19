
const express = require('express');
const cors = require('cors');

// Route modules
const ingestRoutes = require('./src/routes/ingest.routes'); // GET /addallcountydata
const dataRoutes   = require('./src/routes/data.routes');   // GET /getData
const adminRoutes  = require('./src/routes/admin.routes');  // POST /addcounty, POST /addstate, GET /getcounties, GET /getcounty/:CountyID

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount routes at root
app.use('/', ingestRoutes);
app.use('/', dataRoutes);
app.use('/', adminRoutes);

module.exports = app;
