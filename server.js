// src/server.js

// Lightweight HTTP server bootstrap for the API.

const express = require('express'); // Web framework
const cors = require('cors');       // Cross-origin requests
const killPort = require('kill-port'); // Ensures port is free before starting

require('dotenv').config(); // Load environment variables from .env

const app = express();
const PORT = process.env.PORT || 3000; // Prefer env var, fallback to 3000

// Global middleware
app.use(cors());            // Allow CORS for all routes
app.use(express.json());    // Parse JSON bodies

// Route modules (keep imports at top-level to attach below)
const ingestRoutes = require('./src/routes/ingest.routes');
const dataRoutes   = require('./src/routes/data.routes');
const adminRoutes  = require('./src/routes/admin.routes');

// Mount routes (mount order can matter if prefixes overlap)
app.use(ingestRoutes);
app.use(dataRoutes);
app.use(adminRoutes);

// Cron (scheduled NOAA sync)
const {startNOAACronJob} = require('./src/cron/syncData');

async function startServer(port) {
  try {
    // Avoid "EADDRINUSE" by killing any process already bound to the port
    await killPort(port, 'tcp');

    // Start HTTP server; capture reference to disable socket timeouts for long ingest runs
    const server = app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);

      // Start cron AFTER server is listening so it can call /addallcountydata
      startNOAACronJob();
    });
    server.timeout = 0;          // no HTTP-layer socket timeout
    server.keepAliveTimeout = 0; // no keep-alive cut-off
  } catch (err) {
    console.error('Error starting server:', err);
  }
}

// Entrypoint
startServer(PORT);

module.exports = app; // Export for testing or external usage
