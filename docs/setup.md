# Installation and Setup

## Prerequisites

- Node.js compatible with the installed Vite, React, and Express dependencies.
- npm.
- A reachable MongoDB deployment or local MongoDB instance.
- Optional OpenWeatherMap API key for weather data.

## Install dependencies

From the repository root:

```bash
npm run install:all
```

This runs npm installation at the root, client, and server with `--legacy-peer-deps`. Individual installs can also be run with `npm install` in each package directory.

## Environment variables

Create local environment files from `.env.example` without committing secret values.

### Server

| Variable | Purpose | Default/notes |
|---|---|---|
| `ATLAS_URI` or `MONGODB_URI` | MongoDB connection URI | Required for persistence |
| `PORT` | HTTP port | `3000` |
| `NODE_ENV` | Runtime mode | `development` |
| `JWT_SECRET` | JWT signing secret | Must be replaced in production |
| `JWT_EXPIRES_IN` | JWT lifetime | `7d` |
| `ENCRYPTION_KEY` | Task encryption key material | Must be managed as a secret |
| `CORS_ORIGIN` | Comma-separated allowed browser origins or `*` | Local defaults are built in |

### Client

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | API base URL; otherwise `http://localhost:3000` |
| `VITE_OPENWEATHER_KEY` | Browser weather API key |

Do not copy real credentials into documentation, source, or committed config files. The current server config loader also reads `server/config.env`; secure deployments should inject environment variables instead.

## Development commands

From the root:

```bash
npm run dev       # server nodemon + client Vite concurrently
npm start         # same current orchestration as dev
npm run build     # client production build
```

Individually:

```bash
npm run start --prefix server
npm run dev --prefix client
npm run build --prefix client
npm run lint --prefix client
npm test --prefix server
```

The Vite development server is configured for port 5174, can try another port when occupied, and opens the browser. The server listens on port 3000 by default.

## Database setup

Set `ATLAS_URI` or `MONGODB_URI` to a valid MongoDB URI. On successful connection, the server creates/verifies the unique users email index and the task user/createdAt index. No seed script is provided.

## Production configuration

Build the client with its production `VITE_*` variables, serve the resulting `client/dist`, and run the server with production secrets and a managed process. The server has no checked-in reverse proxy, container, process manager, or hosting configuration. The client includes `client/vercel.json` for SPA rewrites, but a complete backend deployment is not defined.
