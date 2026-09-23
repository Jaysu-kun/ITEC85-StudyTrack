# Testing Documentation

## Existing test suite

The only test file is `server/tests/security.test.js`. It is executed by `npm test --prefix server` and uses Node’s built-in HTTP, a custom assertion runner, and an in-memory mock MongoDB implementation. It does not require a live MongoDB connection.

The verified run on 2026-09-24 reported **77 passed and 0 failed**.

## Covered areas

- Signup status, JWT issuance, password non-disclosure, bcrypt hashing, duplicate email handling, and input validation.
- Login success/failure, email normalization, and auth rate-limit headers.
- JWT-required protected routes and tampered-token rejection.
- User/task ownership checks and IDOR/BOLA attempts across list, read, update, toggle, delete, and profile operations.
- Task input validation for dates, priorities, and blank titles.
- AES-GCM format, decryption, fresh IVs, tamper detection, CBC compatibility, and ciphertext storage.
- CORS allow/deny behavior and no-Origin behavior.
- Safe handling of corrupt ciphertext, security headers, unknown routes, and malformed JSON.

## Verification commands

```bash
npm test --prefix server
npm run lint --prefix client
npm run build
```

The client lint and production build passed during this audit. This is a report of the observed run, not a claim that all future changes will pass.

## Untested or lightly tested areas

- React components, routing, form behavior, accessibility, and responsive layouts.
- Zustand persistence, offline fallback, optimistic rollback, and cross-account browser state.
- Weather, geolocation, browser notifications, Spotify embedding, and theme persistence.
- Live MongoDB behavior, index failures, network timeouts, and connection recovery.
- Production CORS configuration, HTTPS, deployment, and browser security policy.
- Password/JWT secret rotation and encryption-key rotation.
- Large task lists, pagination, performance, and concurrent updates.

## Recommended test cases

- Add unit tests for date boundaries at midnight and exactly 24 hours.
- Add service tests for every validation branch and database failure.
- Add API tests against a temporary MongoDB instance.
- Add component tests for auth, task CRUD, filters, notification dismissal, and empty/error states.
- Add end-to-end tests for signup → task creation → refresh → logout/login.
- Add accessibility checks for dialogs, focus management, keyboard-only flows, and contrast.
- Add security tests for production configuration, CORS combinations, localStorage exposure, and rate-limiter behavior behind a proxy.
