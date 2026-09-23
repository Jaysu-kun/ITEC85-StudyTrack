# Deployment Documentation

## Configuration present in the repository

The client has `client/vercel.json`, which rewrites all paths to `/index.html` for a single-page application. `client/vite.config.ts` defines a production build and manual chunks. No server hosting configuration, Dockerfile, CI workflow, reverse proxy, process manager, or infrastructure definition is present.

## Client deployment

1. Provide `VITE_API_URL` for the deployed API and, if needed, `VITE_OPENWEATHER_KEY`.
2. Run `npm run build` from the root.
3. Publish `client/dist` to a static host.
4. Configure SPA fallback rewrites, as represented by `client/vercel.json`.
5. Add the deployed client origin to the server’s `CORS_ORIGIN`.

Client-side environment values are bundled into browser assets. They are not secret storage.

## Server deployment

The server can be started with `npm run start --prefix server`, which invokes nodemon and is therefore a development-oriented command. A production deployment should use a stable Node process command/process manager, inject secrets through the platform, expose HTTPS, and configure health monitoring around `/health`.

Required production dependencies are a reachable MongoDB database and valid `ATLAS_URI`/`MONGODB_URI`, `JWT_SECRET`, `ENCRYPTION_KEY`, `PORT`, `NODE_ENV`, and `CORS_ORIGIN` values. The server can start without MongoDB, but task and auth operations then return 503; this is an offline fallback, not a complete production mode.

## Database requirements

MongoDB must permit the server to connect and create/verify the two indexes. Backups, point-in-time recovery, access control, encryption at rest, and monitoring are outside the repository configuration and must be supplied by the operator.

## Deployment gaps

There is no documented production domain, TLS configuration, secret manager, database migration strategy, rollback procedure, log aggregation, uptime monitor, or release pipeline. These are recommended before production use.
