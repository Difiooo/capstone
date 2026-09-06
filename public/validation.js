/**
 * Validation Logic for Settings Form
 * Shared between browser and Node.js testing environment.
 */

const VALIDATION_REGEX = {
  // Username: Letters, numbers, and underscores, 3 to 15 characters
  USERNAME: /^[a-zA-Z0-9_]{3,15}$/,
  // Standard robust email validation regex
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
};

/**
 * Validates a username string.
 * @param {string} val 
 * @returns {boolean}
 */
const isUsernameValid = (val) => {
  if (typeof val !== 'string') return false;
  return VALIDATION_REGEX.USERNAME.test(val);
};

/**
 * Validates an email string.
 * @param {string} val 
 * @returns {boolean}
 */
const isEmailValid = (val) => {
  if (typeof val !== 'string') return false;
  return VALIDATION_REGEX.EMAIL.test(val);
};

/**
 * Validates an age value.
 * @param {string|number} val 
 * @returns {boolean}
 */
const isAgeValid = (val) => {
  if (val === '' || val === null || val === undefined) return false;
  
  const strVal = String(val).trim();
  if (strVal === '') return false;

  const num = Number(strVal);
  // Must be a number, an integer, and within 1-120
  // Number.isInteger ensures no decimals (e.g., 25.5 is invalid)
  return !isNaN(num) && 
         Number.isInteger(num) && 
         num >= 1 && 
         num <= 120;
};

// Export for Node.js if available
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    isUsernameValid,
    isEmailValid,
    isAgeValid,
    VALIDATION_REGEX
  };
}
