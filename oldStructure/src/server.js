// server.js

const express = require('express');
const app = express();
const { fetchDataFromAPI } = require('./ProcessData');

// Load environment variables
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Middleware, routes, and other configurations for your express app

// Route to fetch and process data
app.get('/addallcountydata', async (req, res) => {
    try {
        var { success, error } = await fetchDataFromAPI('your-api-url', 'County');

        if (success) {
            res.send('All county data added successfully.');
        } else {
            res.status(500).send(error);
        }
    } catch (error) {
        console.error('Error adding county data:', error);
        res.status(500).send('Error adding county data.');
    }
});


// Fetch Data for Visulization
app.get('/data', async (req, res) => {
    const { county, dateType, dateValue, year, dataType } = req.query;
  
    try {
      let result;
  
      // Determine the stored procedure to call based on the parameters
      if (dateType === 'by_year') {
        if (dateValue === 'top_analogs') {
          result = await getTopAnalogsByYear(county, dataType);
        } else {
          result = await getDataForYear(county, year, dataType);
        }
      } else if (dateType === 'by_season') {
        result = await getDataBySeason(county, dateValue, dataType);
      } else if (dateType === 'by_month') {
        result = await getDataByMonth(county, dateValue, dataType);
      } else {
        throw new Error('Invalid dateType');
      }
  
      res.json(result);
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

async function startServer(port) {
    try {
      // Kill any process currently using port 3000
      await killPort(PORT, 'tcp');
  
      // Start the server on port 3000
      app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
      });
    } catch (err) {
      console.error('Error starting server:', err);
    }
}
  
// Start server on port 3000
startServer(PORT);