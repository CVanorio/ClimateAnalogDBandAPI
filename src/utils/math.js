// src/utils/math.js


/**
 * Round a number to two decimal places.
 * @param {number} num
 * @returns {number}
 */
function roundToTwo(num) {
  return Math.round(num * 100) / 100;
}

module.exports = {
  roundToTwo,
};
