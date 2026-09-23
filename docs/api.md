# API Documentation

## Common behavior

- Base URL: the client default is `http://localhost:3000`; production uses `VITE_API_URL`.
- JSON is accepted and limited to 100 KB.
- Protected calls use `Authorization: Bearer <JWT>`; legacy `x-auth-token` is also accepted by middleware.
- Success and error responses are JSON.
- Unknown routes return HTTP 404 with a `message` field.
- A missing database produces HTTP 503 for service operations.

## Health and service checks

| Method/route | Auth | Success response |
|---|---|---|
| `GET /health` | No | `{ status: "ok", message, database: "connected"\|"disconnected", timestamp }` |
| `GET /test` | No | Same health response |
| `GET /acadtasks/test` | No | `{ message: "AcadTasks route is working!" }` |

## Authentication routes

### `POST /auth/signup`

Creates a user and returns a signed JWT. Body: `{ name, email, password }`. Name must be a non-empty string no longer than 100 characters. Email must match the server regex and be no longer than 254 characters. Password must be 8–128 characters.

Response 201: `{ token, id, _id, name, email, createdAt }`. Errors: 400 invalid input, 409 duplicate email, 503 unavailable database, or 500 for unhandled failures. The route is limited to 30 requests per IP per 15 minutes.

### `POST /auth/login`

Authenticates with `{ email, password }`; email is normalized to lowercase. Response 200 uses the same public user shape as signup. Errors: 400 missing/non-string credentials, 401 invalid credentials or oversized password, 503 unavailable database. It shares the 30-per-15-minute auth limiter.

### `POST /auth/update-profile`

Protected route. Body: `{ name }`. The name is trimmed and must be non-empty and no longer than 100 characters. Response 200: `{ message: "Profile updated successfully", name }`. Errors: 401 missing/invalid JWT, 400 invalid name, 404 user not found, 503 database unavailable.

## Task routes

All routes below except `/acadtasks/test` require a valid JWT. The authenticated user id is taken from the token.

### `GET /acadtasks`

Returns the current user’s tasks sorted by `createdAt` descending. Response 200 is an array of transformed task objects. Errors: 401 or 503.

### `GET /acadtasks/user/:userId`

Backward-compatible user-list route. The path parameter must equal the authenticated token user id or the server returns 403. Otherwise it behaves like `GET /acadtasks`. Errors: 401, 403, or 503.

### `GET /acadtasks/:id`

Returns one owned task. `id` must be a valid 24-character hexadecimal ObjectId. Response 200 is a transformed task. Errors: 400 invalid id, 401, 403 if owned by another user, 404 missing task, or 503.

### `POST /acadtasks`

Creates a task. Body fields: `{ title, description?, priority?, deadline?, subject?, completed? }`; a client `userId` may be sent but is ignored for ownership. Title is required and max 200 characters. Description max 2,000, subject max 100. Deadline must be parseable when supplied. Create priority uses `medium` for a missing or unsupported value; completion is boolean-coerced.

Response 201 is the newly created task in plaintext API form. Errors: 400 validation, 401, 503, or 500.

### `PUT /acadtasks/:id`

Updates any supplied subset of `{ title?, description?, priority?, deadline?, subject?, completed? }`. The task must exist and belong to the user. Title cannot be blank and retains the 200-character limit. Priority must be one of the three allowed values; deadline must parse; other length limits remain enforced.

Response 200: `{ message: "Task updated successfully", id }`. Errors: 400 invalid id/input, 401, 403, 404, or 503.

### `DELETE /acadtasks/:id`

Deletes an owned task. Response 200: `{ message: "Task deleted successfully" }`. Errors: 400 invalid id, 401, 403, 404, or 503.

### `PATCH /acadtasks/:id/toggle`

Inverts the owned task’s `completed` field. Response 200: `{ message: "Task completion toggled successfully", completed }`. Errors: 400 invalid id, 401, 403, 404, or 503.

## Cross-cutting errors and headers

Malformed JSON returns 400 `{ message: "Malformed JSON payload" }`. A duplicate MongoDB key returns 409. CORS rejection returns 403. Auth rate-limit exhaustion returns 429 with `{ message, retryAfter }`, plus `Retry-After` and rate-limit headers. In development, unhandled HTTP 500 responses include a stack field; production suppresses it.

## Source mapping

Routes: `server/src/routes/auth.routes.js` and `task.routes.js`. Controllers: `server/src/controllers/`. Business logic and validation: `server/src/services/`. Shared error behavior: `server/src/middleware/errorHandler.js` and `server/src/utils/ApiError.js`.
