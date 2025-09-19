
// src/config/constants.js

////////////////////////////////////////////////////////////////////////////////////////////////////
// Shared Constants (moved verbatim from the original file)
// - NOAA base URLs & file extensions
// - Climate normals window
// - Month/season metadata
// - Datatype identifiers
////////////////////////////////////////////////////////////////////////////////////////////////////

const mainURL = 'https://www.ncei.noaa.gov/data';
const countyTempExt = '/nclimdiv-monthly/access/climdiv-tmpccy-v1.0.0-20240806';
const countyPrecipExt = '/nclimdiv-monthly/access/climdiv-pcpncy-v1.0.0-20240806';

const climateNormalYears = [1991, 2020];

const TARGET_STATE_CODE = ['47']; // or '47', or null
const NEW_CLIMATE_NORMALS = false; // set to true to recalculate all norms for new climate normals on next data load


const monthValues = [
  '01','02','03','04','05','06','07','08','09','10','11','12'
];

const monthPositions = [
  { start: 11, end: 18 },  // January
  { start: 18, end: 25 },  // February
  { start: 25, end: 32 },  // March
  { start: 32, end: 39 },  // April
  { start: 39, end: 46 },  // May
  { start: 46, end: 53 },  // June
  { start: 53, end: 60 },  // July
  { start: 60, end: 67 },  // August
  { start: 67, end: 74 },  // September
  { start: 74, end: 81 },  // October
  { start: 81, end: 88 },  // November
  { start: 88, end: 95 }   // December
];

const seasonalValues = ['winter','spring','summer','fall'];

const precipDatatype = '01';
const tempDatatype   = '02';

module.exports = {
  mainURL,
  countyTempExt,
  countyPrecipExt,
  climateNormalYears,
  monthValues,
  monthPositions,
  seasonalValues,
  precipDatatype,
  tempDatatype,
  TARGET_STATE_CODE,
  NEW_CLIMATE_NORMALS
};
