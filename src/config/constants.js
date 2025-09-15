/**
 * Shared constants for NOAA climate backend.
 * Direct copy from original code, no logic changed.
 */

const BASE_URL = 'https://www.ncei.noaa.gov/data/nclimdiv-monthly/access/';
const climateNormalYears = [1991, 2020];

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
};
