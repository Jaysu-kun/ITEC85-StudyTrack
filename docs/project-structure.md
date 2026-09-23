# Project Structure

Only the current active structure is described below. The repository also contains a `dist` directory and a large set of deleted legacy paths in the current git worktree; those are not runtime modules in the active `client/` and `server/src/` implementation.

```text
.
├── package.json                 # root orchestration scripts
├── .env.example                 # environment variable template
├── ENCRYPTION.md                # task encryption notes
├── client/
│   ├── package.json
│   ├── vite.config.ts
│   ├── vercel.json
│   ├── index.html
│   ├── public/                  # favicon and logo assets
│   └── src/
│       ├── App.tsx, main.tsx
│       ├── pages/               # routed pages
│       ├── components/          # layout, auth, tasks, UI, widgets, notifications
│       ├── services/            # Axios, auth, task API calls
│       ├── store/               # Zustand stores
│       ├── hooks/               # filtering and deadline notification logic
│       ├── types/               # shared client TypeScript types
│       ├── utils/               # date helpers
│       ├── data/                # static study tips
│       └── assets/images/       # logos
└── server/
    ├── package.json
    ├── config.env               # server environment file; must not contain committed secrets
    ├── start.bat
    ├── src/
    │   ├── index.js             # Express composition and startup
    │   ├── db.js                # MongoDB connection and indexes
    │   ├── config/env.js        # dotenv loading and config defaults
    │   ├── routes/              # auth and task routes
    │   ├── controllers/         # HTTP adapters
    │   ├── services/            # auth/task business logic
    │   ├── middleware/          # JWT, errors, rate limiting
    │   └── utils/               # encryption, async handler, ApiError
    └── tests/security.test.js   # custom integration/security test
```

## Module responsibilities

| Area | Important files | Responsibility |
|---|---|---|
| App shell | `client/src/App.tsx` | Routes, lazy pages, providers, initial task load |
| Auth UI | `pages/LoginPage.tsx`, `pages/SignupPage.tsx`, `components/auth/AuthForm.tsx` | Form validation and auth flow |
| Task UI | `components/tasks/*`, `pages/HomePage.tsx` | Task creation, editing, display, deletion, completion |
| Client state | `store/useAuthStore.ts`, `useTaskStore.ts`, `useThemeStore.ts`, `useToast.ts` | Persisted and transient state |
| Client API | `services/api.ts`, `authService.ts`, `taskService.ts` | HTTP calls and JWT attachment |
| Server composition | `server/src/index.js` | Middleware, routes, startup/shutdown |
| Server business logic | `server/src/services/*.service.js` | Validation, authorization, persistence, transformation |
| Persistence | `server/src/db.js` | MongoDB connection and index creation |

## Inconsistencies and non-runtime structures

- `Category` exists only as a client type/store concept; no backend category route or collection exists.
- `uploads` is statically mounted by the server, but no upload route or active upload module is present.
- `client/src/services/api.ts` contains both Axios and fetch-header helpers; current task/auth calls use Axios.
- The Vite `/api` proxy is configured, while the client default URL targets the server root directly.
