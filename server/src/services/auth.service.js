// server/src/services/auth.service.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const config = require('../config/env');
const ApiError = require('../utils/ApiError');

const SALT_ROUNDS = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PASSWORD_LENGTH = 128; // Prevent bcrypt CPU exhaustion / DoS attacks
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;

class AuthService {
  /**
   * Registers a new user account
   */
  async signup(db, data = {}) {
    if (!db) {
      throw ApiError.serviceUnavailable('Database service unavailable');
    }

    const { name, email, password } = data;
    
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw ApiError.badRequest('Valid name is required');
    }

    const trimmedName = name.trim();
    if (trimmedName.length > MAX_NAME_LENGTH) {
      throw ApiError.badRequest(`Name cannot exceed ${MAX_NAME_LENGTH} characters`);
    }
    
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim()) || email.trim().length > MAX_EMAIL_LENGTH) {
      throw ApiError.badRequest('Valid email address is required');
    }
    
    if (!password || typeof password !== 'string' || password.length < 8) {
      throw ApiError.badRequest('Password must be at least 8 characters long');
    }

    if (password.length > MAX_PASSWORD_LENGTH) {
      throw ApiError.badRequest(`Password cannot exceed ${MAX_PASSWORD_LENGTH} characters`);
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    const usersCollection = db.collection('users');
    
    const existingUser = await usersCollection.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw ApiError.conflict('User already exists with this email');
    }
    
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    const newUser = {
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
      createdAt: new Date()
    };
    
    let result;
    try {
      result = await usersCollection.insertOne(newUser);
    } catch (dbErr) {
      if (dbErr.code === 11000) {
        throw ApiError.conflict('User already exists with this email');
      }
      throw dbErr;
    }
    
    const userId = result.insertedId.toString();
    const token = jwt.sign(
      { userId, email: normalizedEmail },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
    
    return {
      token,
      id: userId,
      _id: userId,
      name: trimmedName,
      email: normalizedEmail,
      createdAt: newUser.createdAt
    };
  }

  /**
   * Authenticates user credentials and issues JWT token
   */
  async login(db, data = {}) {
    if (!db) {
      throw ApiError.serviceUnavailable('Database service unavailable');
    }

    const { email, password } = data;
    
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      throw ApiError.badRequest('Email and password are required');
    }

    if (password.length > MAX_PASSWORD_LENGTH) {
      throw ApiError.unauthorized('Invalid credentials');
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    const usersCollection = db.collection('users');
    
    const user = await usersCollection.findOne({ email: normalizedEmail });
    if (!user) {
      throw ApiError.unauthorized('Invalid credentials');
    }
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw ApiError.unauthorized('Invalid credentials');
    }
    
    const userId = user._id.toString();
    const token = jwt.sign(
      { userId, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
    
    return {
      token,
      id: userId,
      _id: userId,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    };
  }

  /**
   * Updates user profile (name)
   */
  async updateProfile(db, userId, data = {}) {
    if (!db) {
      throw ApiError.serviceUnavailable('Database service unavailable');
    }

    const { name } = data;
    
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw ApiError.badRequest('A valid name is required');
    }

    const trimmedName = name.trim();
    if (trimmedName.length > MAX_NAME_LENGTH) {
      throw ApiError.badRequest(`Name cannot exceed ${MAX_NAME_LENGTH} characters`);
    }

    const usersCollection = db.collection('users');
    
    let objectId;
    try {
      objectId = new ObjectId(userId);
    } catch {
      objectId = userId;
    }
    
    const result = await usersCollection.updateOne(
      { _id: objectId },
      { $set: { name: trimmedName } }
    );
    
    if (result.matchedCount === 0) {
      throw ApiError.notFound('User not found');
    }
    
    return {
      message: 'Profile updated successfully',
      name: trimmedName
    };
  }
}

module.exports = new AuthService();
