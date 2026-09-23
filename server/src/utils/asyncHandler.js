// server/src/utils/asyncHandler.js

/**
 * Higher-order function to wrap async Express controllers and pass errors to next()
 * Eliminates repetitive try-catch blocks across controllers.
 * 
 * @param {Function} fn - Async controller function (req, res, next)
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
