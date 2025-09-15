# Climate Analog Database & API

This project provides a Node.js + Express backend to ingest NOAA climate data, store it in MySQL, calculate Euclidean distances between counties, and serve results to a frontend via JSON endpoints.  

It is designed to be modular and production-ready, with a clean folder structure.

---

## Project Structure

```text
project-root/
  package.json
  package-lock.json
  .env
  .gitignore
  lastNoaaFile.json          # Cron tracker file
  node_modules/

  src/
    server.js                # Main entrypoint
    config/
      constants.js           # Shared constants (NOAA config, months, etc.)
      db.js                  # MySQL connection pool
    cron/
      syncData.js            # Cron job to auto-fetch new NOAA data
    sql/
      queries.js             # Stored procedure + SQL call strings
    utils/
      math.js                # Helper: rounding, etc.
      fixedWidth.js          # NOAA fixed-width line parsing
    services/
      noaa.service.js        # NOAA file discovery + fetch
      parse.service.js       # Parsing, temp tables, norms, data insertion
      distances.service.js   # Distance calculations (monthly/seasonal/yearly)
      data-access.service.js # Data fetchers for analogs
    controllers/
      ingest.controller.js   # /addallcountydata
      data.controller.js     # /getData
      admin.controller.js    # /addcounty, /addstate, /getcounties, etc.
    routes/
      ingest.routes.js       # Routes for ingestion
      data.routes.js         # Routes for data fetching
      admin.routes.js        # Routes for admin operations
```
---

## Setup & Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd <your-project-folder>
```

### 2. Install dependencies
```bash
npm install
```
### 3. Environment variables

Create a .env file in the project root:

```env
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=your_database
PORT=3000
```
Adjust values as needed for your MySQL setup.

### 4. Database

- Ensure your MySQL database exists and contains the stored procedures and tables referenced in src/sql/queries.js.  
- The app relies heavily on stored procedures (e.g., InsertMonthlyPrecipitationWI, CalculateMonthlyPrecipitationDistances, etc.).

### 5. Run the server

```bash
npm start
```
Server will start on:
http://localhost:3000

---

## Cron Job

The cron job (src/cron/syncData.js) checks daily for updated NOAA files and, if new data is found, automatically calls /addallcountydata.  

It uses lastNoaaFile.json (at project root) to track what’s already been processed.

---

## API Endpoints

### Data Ingestion

- GET /addallcountydata → Fetches latest NOAA data, parses, inserts into DB, and calculates distances.

### Data Access

- GET /getData?targetCounty=<name>&timeScale=by_year&year=2025&dataType=precipitation  
- GET /getData?targetCounty=<name>&timeScale=by_season&timeScaleValue=summer&year=2020&dataType=temperature  
- GET /getData?targetCounty=<name>&timeScale=by_month&timeScaleValue=07&year=2022&dataType=both  

timeScale can be by_year, by_season, or by_month.  
year can be a number or \"top_analogs\".

### Admin

- POST /addcounty/:countyID/:countyName/:stateCode/:lat/:long  
- POST /addstate/:StateCode/:StateAbbr/:StateName  
- GET /getcounties  
- GET /getcounty/:CountyID  

---

## Development Notes
 
- CORS is enabled, so you can call the API from a frontend running on a different port

---

## Running From Scratch

1. Clone repo & install deps:  

```bash
git clone <your-repo-url>  
cd <your-project-folder>  
npm install  
```

2. Create .env with DB connection info.  

3. Example package.json
Here’s a sample package.json you can adapt for this project:

```json
{
  "name": "climate-analog-db-api",
  "version": "1.0.0",
  "description": "Node.js + Express backend to ingest NOAA climate data, store it in MySQL, calculate analog distances, and serve results to a frontend via API endpoints.",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "lint": "eslint .",
    "test": "echo \"No tests specified\" && exit 0"
  },
  "keywords": [
    "NOAA",
    "climate",
    "MySQL",
    "express",
    "api",
    "backend"
  ],
  "author": "Courtney Vanorio",
  "license": "SEE LICENSE IN LICENSE",
  "dependencies": {
    "axios": "^1.7.2",
    "cheerio": "^1.0.0-rc.12",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "jsonfile": "^6.1.0",
    "kill-port": "^2.0.1",
    "mysql2": "^3.9.7",
    "node-cron": "^3.0.3",
    "portfinder": "^1.0.32"
  },
  "devDependencies": {
    "eslint": "^9.7.0",
    "nodemon": "^3.1.0"
  }
}
```


4. Set up MySQL database and stored procedures.  

5. Start server:  
```bash
npm start  
```
---

## License
This project is licensed under the Creative Commons Attribution–NonCommercial 4.0 International License.  

You are free to fork and adapt this project for personal or research use.  
Commercial use of any kind requires prior written permission.  

See the full license [here](./LICENSE).
