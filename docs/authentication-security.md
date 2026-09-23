# Authentication and Security

## Implemented controls

### Authentication and authorization

- Signup hashes passwords with bcrypt using 10 salt rounds.
- Login compares the submitted password with the bcrypt hash.
- JWTs contain `userId` and `email` and use configured expiration, defaulting to seven days.
- `authenticateToken` accepts Bearer tokens and the legacy `x-auth-token` header.
- Protected task and profile routes require a valid token.
- Task reads/writes check ownership against the token user id, preventing cross-user access in the tested flows.
- The server ignores the client-supplied `userId` for task ownership.

### Input and error handling

- Auth fields, task lengths, priorities, dates, and ObjectIds are validated in services.
- JSON payloads are limited to 100 KB.
- Async controllers forward rejected promises to centralized error middleware.
- Duplicate email/index errors map to 409.
- Production-style 500 responses avoid exposing stack traces unless `NODE_ENV=development`.

### Transport and HTTP controls

- Express fingerprinting is disabled.
- CORS uses configured origins, permits requests without an Origin header, and supports credentials.
- Headers set manually include `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, and `X-XSS-Protection`.
- Signup and login have an in-memory limit of 30 requests per IP per 15 minutes.

### Data protection

Task title, description, priority, and subject are encrypted before storage with AES-256-GCM, random 12-byte IVs, and authentication tags. The utility can read legacy CBC data. Passwords are not encrypted reversibly; they are bcrypt hashes.

## Configuration and secret handling

`server/src/config/env.js` loads `server/config.env` and then the root `.env`. Supported variables are `ATLAS_URI`/`MONGODB_URI`, `PORT`, `NODE_ENV`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `ENCRYPTION_KEY`, and `CORS_ORIGIN`. The client supports `VITE_API_URL` and `VITE_OPENWEATHER_KEY`.

The repository contains fallback JWT and encryption values in code, and a server environment file is present in the working tree. These are not safe production practices. Actual values are intentionally omitted from this documentation. Rotate any exposed credentials, keep environment files out of version control, and fail startup when required production secrets are absent.

## Not implemented or insufficiently hardened

- No refresh-token rotation, token revocation, logout invalidation, or server-side session store.
- Auth rate limiting is process-local and resets on restart; the client-IP value can be influenced by forwarded headers without a trusted proxy configuration.
- No Helmet/CSP policy, request correlation, audit logging, or security monitoring.
- CORS can be configured as `*` while credentials are enabled, and requests without an Origin are intentionally allowed.
- Task decryption falls back to returning the original stored value. Encryption itself also falls back to plaintext if encryption fails; this preserves availability but can expose data.
- Legacy CBC decryption has no authentication tag and should be migrated away from.
- JWT and Zustand auth state are persisted in browser localStorage, which is accessible to JavaScript if an XSS issue occurs.
- The weather component contains a fallback API key in client code; browser-delivered API keys should be restricted or proxied.
- `X-XSS-Protection` is obsolete in modern browsers and is not a substitute for CSP/output safety.
