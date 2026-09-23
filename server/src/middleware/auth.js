// server/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const ApiError = require('../utils/ApiError');

const getJwtSecret = () => config.jwtSecret;

/**
 * Authentication middleware to verify JWT tokens
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : (authHeader || req.headers['x-auth-token']);

  if (!token) {
    return next(ApiError.unauthorized('Access denied. No authentication token provided.'));
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (!decoded || !decoded.userId) {
      return next(ApiError.unauthorized('Invalid token payload.'));
    }
    req.user = decoded; // Contains userId, email
    next();
  } catch (err) {
    return next(ApiError.unauthorized('Invalid or expired authentication token.'));
  }
}

module.exports = {
  authenticateToken,
  get JWT_SECRET() {
    return getJwtSecret();
  },
  getJwtSecret
};
