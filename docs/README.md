# IskoTasks System Documentation

This documentation describes the implementation in the current working tree as reviewed on 2026-09-24. The application is branded as **IskoTasks** in the client and as **StudyTrack / IskoTasks** in server metadata.

## Contents

1. [System overview](system-overview.md)
2. [Architecture](architecture.md)
3. [Project structure](project-structure.md)
4. [Features and functionalities](features.md)
5. [Database](database.md)
6. [API reference](api.md)
7. [Authentication and security](authentication-security.md)
8. [Frontend](frontend.md)
9. [Backend](backend.md)
10. [UI/UX](ui-ux.md)
11. [Setup](setup.md)
12. [Testing](testing.md)
13. [Deployment](deployment.md)
14. [Maintenance](maintenance.md)
15. [Known issues and technical debt](known-issues.md)
16. [Requirements traceability](requirements-traceability.md)
17. [Glossary](glossary.md)

## Documentation conventions

- “Implemented” means verified in the current source tree.
- “Limitation” or “Recommended” means it is not currently implemented.
- Paths are relative to the repository root.
- No secrets, tokens, connection strings, or real key values are reproduced here.

## Current verification snapshot

The following commands were run successfully during this documentation audit:

```text
npm run build              # client production build
npm run lint --prefix client
npm test --prefix server   # 77 passed, 0 failed
```

The server test is a custom Node-based integration/security test using an in-memory mock database. There is no separate frontend test suite in the repository.
