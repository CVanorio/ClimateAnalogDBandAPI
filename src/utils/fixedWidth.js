/**
 * Helpers for working with NOAA fixed-width line format.
 * 
 */

const { monthPositions } = require('../config/constants');

/**
 * Parse a line into numeric month values.
 * Returns an array of floats (may include -9.99, -99.90 placeholders).
 */
function parseMonthValues(line) {
  const values = [];
  for (let i = 0; i < monthPositions.length; i++) {
    const { start, end } = monthPositions[i];
    const value = parseFloat(line.substring(start, end));
    values.push(value);
  }
  return values;
}

module.exports = { parseMonthValues };
