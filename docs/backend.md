# Backend Documentation

## Startup and request lifecycle

`server/src/index.js` creates the Express app and applies, in order: security headers, CORS, JSON parsing, database context injection, health routes, auth routes, task routes, static `/uploads`, not-found handling, and centralized error handling.

`startServer()` attempts MongoDB connection before listening. If connection fails, it still starts in offline mode and database operations return 503. SIGINT and SIGTERM close the HTTP server and database client.

## Routes and controllers

- `routes/auth.routes.js` applies a 30-request/15-minute limiter to signup/login and JWT protection to profile update.
- `routes/task.routes.js` exposes a public service check, then protects all task operations with JWT middleware.
- Controllers in `server/src/controllers/` translate request data into service calls and set status codes.

## Services

`auth.service.js` validates and normalizes identity data, hashes/checks passwords, signs JWTs, creates users, and updates names.

`task.service.js` validates task fields, parses ObjectIds and deadlines, enforces ownership, encrypts/decrypts fields, transforms MongoDB documents into API objects, and performs CRUD/toggle operations.

## Middleware and utilities

- `middleware/auth.js`: JWT extraction and verification.
- `middleware/rateLimiter.js`: process-local IP sliding window.
- `middleware/errorHandler.js`: malformed JSON, CORS, duplicate key, custom error, and 404 handling.
- `utils/asyncHandler.js`: promise rejection forwarding.
- `utils/ApiError.js`: status-aware operational errors.
- `utils/encryption.js`: AES-256-GCM encryption, legacy CBC decryption, key derivation, safe fallback.

## Database context

The request middleware places the active database on `req.db`. It attempts a lazy connection when no database is active and a URI is configured. Services explicitly reject missing `req.db` with 503 rather than dereferencing an absent connection.

## Configuration

Configuration is loaded from `server/config.env`, then root `.env`. The server defaults to port 3000 and development mode, and has fallback JWT/encryption values. See [setup](setup.md) and [authentication and security](authentication-security.md) for handling requirements.

## Error behavior

Expected validation and authorization failures use `ApiError`; unhandled errors are logged for 5xx responses. Development 500 responses may include a stack. The database connection intentionally allows an HTTP server to run without database connectivity.

## Backend gaps

There are no separate repository classes, service tests, schema validators, migrations, production process manager configuration, request logging package, or upload implementation. The `/uploads` static mount is present but not connected to an active feature.
