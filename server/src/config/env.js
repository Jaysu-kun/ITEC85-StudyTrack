// server/src/config/env.js
const path = require('path');
const dotenv = require('dotenv');

// Load environment configuration with reliable absolute paths
dotenv.config({ path: path.resolve(__dirname, '../../config.env') });
// Fallback: load root .env file if available
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const defaultOrigins = [
  'https://isko-tasks.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:4173',
  'http://127.0.0.1:4173'
];

const customOrigins = (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== '*')
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean)
  : [];

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...customOrigins]));

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.ATLAS_URI || process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? undefined : 'studytrack_jwt_secret_key_2026'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  encryptionKey: process.env.ENCRYPTION_KEY || (process.env.NODE_ENV === 'production' ? undefined : 'studytrack_secret_key_32_bytes_!'),
  corsOrigin: process.env.CORS_ORIGIN || '',
  allowedOrigins: allowedOrigins
};

module.exports = config;
