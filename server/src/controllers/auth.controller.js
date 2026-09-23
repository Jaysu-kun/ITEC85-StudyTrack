// server/src/controllers/auth.controller.js
const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');

class AuthController {
  signup = asyncHandler(async (req, res) => {
    const result = await authService.signup(req.db, req.body);
    res.status(201).json(result);
  });

  login = asyncHandler(async (req, res) => {
    const result = await authService.login(req.db, req.body);
    res.status(200).json(result);
  });

  updateProfile = asyncHandler(async (req, res) => {
    const result = await authService.updateProfile(req.db, req.user.userId, req.body);
    res.status(200).json(result);
  });
}

module.exports = new AuthController();
