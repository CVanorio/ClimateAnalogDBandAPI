/**
 * Shared constants for NOAA climate backend.
 *
 */

const BASE_URL = 'https://www.ncei.noaa.gov/data/nclimdiv-monthly/access/';

// Climate normal years for calculating norms
// Current NOAA standard is 1991-2020
const climateNormalYears = [1991, 2020];

// FIPS state code for target state to process, e.g., '47' for WI
// State FIPS also found in ClimateAnalogDBandAPI\InitialSetup\StoreStatesAndCounties.js
// To process all states, set to null
// To process multiple states, use an array of strings, e.g. ['47', '11'] for WI and Illinois
TARGET_STATE_CODE =  ['47'];

const monthValues = [
  '01','02','03','04','05','06',
  '07','08','09','10','11','12'
];

// Month positions in fixed-width NOAA file lines
const monthPositions = [
  { start: 11, end: 18 }, { start: 18, end: 25 }, { start: 25, end: 32 },
  { start: 32, end: 39 }, { start: 39, end: 46 }, { start: 46, end: 53 },
  { start: 53, end: 60 }, { start: 60, end: 67 }, { start: 67, end: 74 },
  { start: 74, end: 81 }, { start: 81, end: 88 }, { start: 88, end: 95 }
];

const seasonalValues = ['winter','spring','summer','fall'];

const precipDatatype = '01';
const tempDatatype   = '02';

module.exports = {
  BASE_URL,
  climateNormalYears,
  monthValues,
  monthPositions,
  seasonalValues,
  precipDatatype,
  tempDatatype,
  TARGET_STATE_CODE,
};
