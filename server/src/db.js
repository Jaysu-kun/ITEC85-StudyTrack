// server/src/db.js
const { MongoClient } = require('mongodb');
const config = require('./config/env');

let client = null;
let db = null;

/**
 * Ensures required collections and performance indexes exist
 * @param {import('mongodb').Db} targetDb
 */
async function initializeIndexes(targetDb) {
  if (!targetDb) return;

  try {
    // 1. Unique index on email in users collection
    const users = targetDb.collection('users');
    await users.createIndex({ email: 1 }, { unique: true });
    
    // 2. Compound index on userId & createdAt in AcadTasks for optimized querying and sorting
    const acadTasks = targetDb.collection('AcadTasks');
    await acadTasks.createIndex({ userId: 1, createdAt: -1 });
    
    console.log('Database indexes verified successfully');
  } catch (err) {
    console.warn('Note on index initialization:', err.message);
  }
}

/**
 * Connects to MongoDB with connection timeout & pooling handling
 * @param {string} [customUri]
 * @returns {Promise<import('mongodb').Db | null>}
 */
async function connectToDatabase(customUri) {
  const uri = customUri || config.mongodbUri;
  if (!uri) {
    console.warn('WARNING: MongoDB URI is not defined in environment variables.');
    return null;
  }

  if (db && client) {
    return db;
  }

  try {
    if (!client) {
      client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        maxPoolSize: 20
      });
    }

    console.log('Attempting to connect to MongoDB...');
    await client.connect();

    db = client.db(config.dbName || undefined);
    console.log('Connected to MongoDB successfully. Using database:', db.databaseName);
    
    // Initialize indexes in the background
    await initializeIndexes(db);

    return db;
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    // Reset client instance so subsequent connection attempts start clean
    if (client) {
      try {
        await client.close();
      } catch {
        // Ignore close error on failed connection
      }
      client = null;
    }
    db = null;
    throw err;
  }
}

/**
 * Closes the active MongoDB client connection gracefully
 */
async function closeDatabase() {
  if (client) {
    try {
      await client.close();
      console.log('MongoDB connection closed.');
    } catch (err) {
      console.error('Error closing MongoDB connection:', err.message);
    } finally {
      client = null;
      db = null;
    }
  }
}

module.exports = {
  connectToDatabase,
  initializeIndexes,
  closeDatabase,
  getDb: () => db,
  setDb: (newDb) => { db = newDb; },
  getClient: () => client
};
