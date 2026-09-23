# Maintenance and Development Guide

## Current conventions

- React components and hooks use PascalCase/camelCase TypeScript files.
- Zustand stores use `use...Store` names.
- Server modules use lower-case CommonJS files and route/controller/service separation.
- Client types are centralized in `client/src/types/index.ts`.
- Server operational failures use `ApiError`; async controllers use `asyncHandler`.
- Tailwind utility classes provide most UI styling; shared button, card, input, loading, and toast primitives should be reused.

## Adding a feature

1. Define the user flow and whether the feature is client-only or persisted.
2. Add or update client types.
3. For persisted data, define server validation and database representation first.
4. Add service methods and controller/route wiring.
5. Add client service methods and store actions.
6. Compose UI from existing primitives and add loading/error/empty states.
7. Add authorization checks for every user-owned resource.
8. Add tests before changing behavior and update the relevant documentation.

## Adding an API endpoint

- Add the route in the relevant `server/src/routes/*.routes.js` file.
- Apply `authenticateToken` unless the endpoint is intentionally public.
- Add a controller method wrapped by `asyncHandler`.
- Put validation, authorization, persistence, and response transformation in a service.
- Use `ApiError` for expected statuses.
- Add request/response coverage to `server/tests/security.test.js` or a dedicated test.
- Document method, route, auth, validation, response, and errors in `docs/api.md`.

## Adding a model/collection

The project uses native MongoDB documents, not Mongoose models. Document the fields and constraints, add index creation in `server/src/db.js`, enforce validation in the service, and update the relationship diagram. If the data is user-owned, store and verify the authenticated owner explicitly.

## Adding frontend pages/components

- Add a page under `client/src/pages` and lazy-load/register it in `App.tsx`.
- Use `ProtectedRoute` for authenticated pages.
- Use `services/` for HTTP calls rather than embedding fetch logic in presentation components.
- Keep reusable primitives in `components/ui` and domain pieces in their domain folder.
- Provide labels, keyboard behavior, focus states, and reduced-motion behavior for interactive UI.

## Dependency and workflow guidance

Install dependencies with npm and commit lockfile changes deliberately. Run client lint, client build, and server tests before review. Keep secrets in environment management, not `config.env` or source. Review third-party client integrations and their browser-visible keys during dependency or deployment changes.
