// src/server.js
const express = require('express');
const cors = require('cors');
const killPort = require('kill-port');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// routes
const ingestRoutes = require('./src/routes/ingest.routes');
const dataRoutes   = require('./src/routes/data.routes');
const adminRoutes  = require('./src/routes/admin.routes');

// mount
app.use(ingestRoutes);
app.use(dataRoutes);
app.use(adminRoutes);

// cron
const {startNOAACronJob} = require('./src/cron/syncData');

async function startServer(port) {
  try {
    await killPort(port, 'tcp');
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
      // start cron AFTER server is listening (so /addallcountydata is reachable)
      startNOAACronJob();
    });
  } catch (err) {
    console.error('Error starting server:', err);
  }
}

startServer(PORT);

module.exports = app;
