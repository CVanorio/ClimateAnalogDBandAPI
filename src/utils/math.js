/**
 * Math utilities.
 * Mirrors original helper behavior exactly.
 */

function roundToTwo(num) {
  return Math.round(num * 100) / 100;
}

module.exports = { roundToTwo };
