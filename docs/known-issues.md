# Known Issues and Technical Debt

The items below are findings from the current implementation, not claims about intended future behavior.

## High priority

1. **Sensitive values in server configuration.** `server/config.env` is present in the working tree and the loader has fallback secrets. Treat the database credential and all related keys as potentially exposed, rotate them, remove secret-bearing files from version control, and require production environment injection.
2. **Client-visible weather key.** `WeatherWidget.tsx` includes a fallback OpenWeatherMap key. Browser code cannot keep this value private; restrict, rotate, or proxy the integration.
3. **Plaintext fallback in encryption utility.** `encrypt` returns input text if encryption fails, and `decrypt` returns original data if decryption fails. This can preserve availability at the cost of confidentiality/integrity guarantees.
4. **LocalStorage JWT persistence.** A successful XSS could access the token. Add a deliberate token-storage/CSRF strategy and a content security policy before production.

## Functional consistency

- Categories are local-only. A category created in one browser/device is not available to the same account elsewhere.
- Offline-created tasks use random client ids. Subsequent update/delete/toggle calls cannot address them through the ObjectId-only API, and there is no retry queue.
- The profile path can update local state after a server error and calls this “saved locally,” but no sync mechanism exists.
- A server-fetched task whose subject has no local category displays the raw subject value.
- API 401 responses are warned about but do not clear the auth store or redirect to login.
- The Vite `/api` proxy is unused by the current API base URL.
- `/uploads` is mounted without an active upload feature.

## Security and operations

- The in-memory rate limiter is not shared across instances, resets on restart, and uses forwarded IP data without an explicit trusted-proxy policy.
- No refresh/revocation flow, audit log, security monitoring, or production process/deployment configuration is present.
- CORS intentionally permits no-Origin requests and supports a wildcard configuration path; production origins should be explicit.
- Legacy CBC decryption remains supported even though CBC records do not carry an authentication tag.
- No schema validation at the MongoDB level or migration/versioning process exists.

## Quality and accessibility

- No frontend unit, component, or end-to-end tests are present.
- No confirmation is requested before destructive task deletion.
- The study-tip modal does not trap or restore focus.
- The notification timer is client-side and does not provide reliable background delivery.
- Some displayed text contains encoding artifacts in the current source (for example bullet, copyright, degree, and apostrophe glyphs in selected files), which should be normalized to UTF-8.
- Large image assets and the generated CSS/third-party chunks are substantial; image optimization and bundle review may improve load time.

## Repository maintenance

The git worktree shows extensive deletion/replacement of an older root-level structure alongside the active `client/` and `server/src/` tree. This documentation treats only the current active paths as runtime code. The migration should be finalized and obsolete paths removed or clearly archived in version control.
