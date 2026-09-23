# Requirements Traceability

Only requirements verifiable from the current implementation are listed.

| Requirement | Frontend implementation | Backend implementation | Database implementation | Status |
|---|---|---|---|---|
| User can register | `AuthForm`, `SignupPage`, `authService.signup` | `POST /auth/signup`, auth service | `users` insert, unique email | Implemented |
| User can log in | `LoginPage`, auth store | `POST /auth/login`, bcrypt/JWT | `users` lookup | Implemented |
| Protected user sessions | `ProtectedRoute`, Axios interceptor | JWT middleware | Logical user id in JWT/task data | Implemented |
| User can edit profile name | `ProfilePage`, `authService.updateProfile` | `POST /auth/update-profile` | `users.name` update | Implemented |
| User can create tasks | `TaskForm`, task store/service | `POST /acadtasks` | `AcadTasks` insert | Implemented |
| User can view own tasks | `HomePage`, `TaskList` | `GET /acadtasks` and ownership checks | `AcadTasks.userId` query | Implemented |
| User can edit/delete tasks | `TaskCard`, `TaskForm`, task store | PUT/DELETE task routes | Owned document updates/deletes | Implemented |
| User can complete tasks | `TaskCard`, notification bell | `PATCH /:id/toggle` | `completed` boolean | Implemented |
| Tasks support priority | `Priority` type and controls | Service validation/default | Encrypted `priority` field | Implemented |
| Tasks support deadlines | date input and date utilities | `Date.parse` and `Date` storage | `deadline` date | Implemented |
| User can search/filter/sort | `useTaskFiltering`, dashboard controls | None; client-side only | None | Implemented client-side |
| User receives deadline reminders | banner, bell, toast, browser API | None | None | Implemented client-side only |
| User can create categories | Task form and task store | No category endpoint | No category collection | Partial; browser-local |
| Sensitive task fields are protected at rest | Transparent to UI | AES-GCM service utility | Encrypted strings for selected fields | Implemented with fallback risks |
| User can change theme | navbar and theme provider | None | localStorage only | Implemented client-side |
| Student dashboard includes study support | study tips, clock, weather, Spotify | None for most widgets | None | Implemented client/external-service side |
| Production deployment is defined | Vercel SPA rewrite and Vite build | No server hosting config | No infrastructure config | Partial |
| Automated tests cover system behavior | None for client | Custom security integration test | In-memory mock only | Partial |
