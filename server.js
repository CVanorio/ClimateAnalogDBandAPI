/**
 * Server entrypoint.
 * Sets up Express app, middleware, routes, and starts the server.
 */
const express = require('express');
const cors = require('cors');
const killPort = require('kill-port');
require('dotenv').config();

const ingestRoutes = require('./src/routes/ingest.routes');
const dataRoutes = require('./src/routes/data.routes');
const adminRoutes = require('./src/routes/admin.routes');
const startNOAACronJob = require('./src/cron/syncData');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mount routes
app.use('/', ingestRoutes);
app.use('/', dataRoutes);
app.use('/', adminRoutes);

async function startServer(port) {
  try {
    await killPort(port, 'tcp');
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Error starting server:', err);
  }
}

startServer(PORT);
startNOAACronJob();

module.exports = app;
