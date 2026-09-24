// server/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth');
const { createRateLimiter } = require('../middleware/rateLimiter');

// Rate limiters for auth endpoints: 30 attempts per 15 mins
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 30,
  message: 'Too many authentication attempts. Please try again later.'
});

// User Registration (supports both /signup and /register)
router.post('/signup', authLimiter, authController.signup);
router.post('/register', authLimiter, authController.signup);

// User Login
router.post('/login', authLimiter, authController.login);

// Update Profile (Protected)
router.post('/update-profile', authenticateToken, authController.updateProfile);

module.exports = router;
