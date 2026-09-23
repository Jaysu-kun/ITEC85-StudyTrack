// server/src/middleware/errorHandler.js
const config = require('../config/env');
const ApiError = require('../utils/ApiError');

/**
 * Centralized Express Error Handling Middleware
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Handle JSON parsing syntax errors from express.json()
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Malformed JSON payload' });
  }

  // Handle CORS Origin Blocked Error
  if (err && typeof err.message === 'string' && err.message.startsWith('CORS blocked:')) {
    return res.status(403).json({ message: err.message });
  }

  // Handle MongoDB Duplicate Key Error (E11000)
  if (err.code === 11000) {
    return res.status(409).json({ message: 'A record with this unique value already exists' });
  }

  // Handle custom ApiError or standard errors
  const statusCode = err.statusCode || err.status || 500;
  
  if (statusCode >= 500) {
    console.error('Unhandled server error:', err);
  }

  const message = statusCode === 500 && !err.isOperational
    ? 'Internal server error'
    : err.message || 'Internal server error';

  const response = {
    message,
    ...(config.nodeEnv === 'development' && statusCode === 500 ? { stack: err.stack } : {})
  };

  res.status(statusCode).json(response);
}

/**
 * 404 Catch-All Middleware for undefined routes
 */
function notFoundHandler(req, res) {
  res.status(404).json({ message: `Cannot ${req.method} ${req.path} - Route not found` });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
