# Glossary

| Term | Meaning in this system |
|---|---|
| AcadTask | The server’s name for a student task; stored in the `AcadTasks` MongoDB collection. |
| API | The Express HTTP service used by the React client. |
| Authentication | Verifying a user’s identity with email/password and a JWT. |
| Authorization | Checking that a valid user may access or modify the requested resource. |
| Bearer token | The JWT sent in the HTTP `Authorization` header. |
| Bcrypt | One-way password hashing algorithm used for stored passwords. |
| BOLA/IDOR | Broken object-level authorization/insecure direct object reference; the task service prevents cross-user object access. |
| Category | A browser-local label object used by the client for task subjects. It is not a server collection. |
| Client | The React/TypeScript application in `client/`. |
| Completion status | The task’s boolean `completed` field. |
| Deadline | The task due date stored as a MongoDB `Date`. |
| Express middleware | A function in the server request pipeline, such as JWT auth or error handling. |
| GCM | Galois/Counter Mode; the authenticated encryption mode used for new task-field ciphertext. |
| JWT | JSON Web Token used by the server to carry user id/email and expiration. |
| MongoDB collection | A group of documents; this system uses `users` and `AcadTasks`. |
| Optimistic update | Updating the client UI before the API request finishes, then rolling back on failure where implemented. |
| Priority | `low`, `medium`, or `high`; stored encrypted on tasks. |
| Protected route | A client route or API route requiring authentication. |
| Service layer | Backend module containing validation, business rules, authorization, and database operations. |
| Subject | The task field used by the UI to identify a category or subject. |
| Toast | A short-lived in-app feedback message. |
| Vite | The client development server and production bundler. |
| Zustand | The client state-management library used for auth, tasks, theme, and toasts. |
