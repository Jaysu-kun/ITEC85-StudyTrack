// server/src/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/env');
const { connectToDatabase, closeDatabase, getDb, setDb } = require('./db');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Security: Disable Express fingerprinting header
app.disable('x-powered-by');

// Security: Standard HTTP protection headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// CORS Configuration with strict origin verification
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, tests)
    if (!origin) {
      return callback(null, true);
    }

    const isAllowed = config.allowedOrigins.includes(origin) || config.corsOrigin === '*';
    if (isAllowed) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked: Origin ${origin} is not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-auth-token'],
  exposedHeaders: ['Retry-After', 'X-RateLimit-Limit', 'X-RateLimit-Remaining']
};

app.use(cors(corsOptions));

// Body parsing with payload size limits
app.use(express.json({ limit: '100kb' }));

// Request context: Inject database instance (with on-demand connection for serverless/cold-starts)
app.use(async (req, res, next) => {
  if (!getDb() && config.mongodbUri) {
    try {
      await connectToDatabase();
    } catch {
      // Service layer will handle 503 if DB is unreachable
    }
  }
  req.db = getDb();
  next();
});

// Health check and connectivity verification routes
app.get(['/test', '/health'], (req, res) => {
  const dbConnected = Boolean(getDb());
  res.status(200).json({ 
    status: 'ok',
    message: 'Server is working!',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Mount modular API routes
const authRoutes = require('./routes/auth.routes');
app.use('/auth', authRoutes);

const acadTaskRoutes = require('./routes/task.routes');
app.use('/acadtasks', acadTaskRoutes);

// Static uploads serving (if directory exists)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 404 Handler for undefined API routes
app.use(notFoundHandler);

// Centralized Error Handling Middleware
app.use(errorHandler);

/**
 * Starts HTTP server and initializes database connection
 */
async function startServer() {
  let serverInstance = null;
  const PORT = config.port;

  try {
    await connectToDatabase();
    
    serverInstance = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} [${config.nodeEnv}]`);
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    
    // Start server in offline fallback mode
    serverInstance = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (WITHOUT DATABASE CONNECTION)`);
      console.log('WARNING: Database operations will fail with 503');
    });
  }

  // Graceful shutdown handling
  const shutdown = async () => {
    console.log('\nShutting down server gracefully...');
    if (serverInstance) {
      serverInstance.close(() => {
        console.log('HTTP server closed.');
      });
    }
    await closeDatabase();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  return serverInstance;
}

// Start server if executed directly
if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  startServer,
  connectToDatabase,
  closeDatabase,
  getDb,
  setDb
};
