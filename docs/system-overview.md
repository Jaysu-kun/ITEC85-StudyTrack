# System Overview

## Identity and purpose

IskoTasks is a student-oriented task and deadline manager. It lets an authenticated student record academic tasks, assign a subject/category and priority, set a due date, monitor completion, and receive deadline reminders.

The current implementation addresses the need to keep coursework, deadlines, and study-related notes in one dashboard. The target user is an individual student; the data model and authorization rules are user-scoped rather than collaborative.

## Main objectives

- Provide account registration and login.
- Give each user a private task list.
- Make task deadlines and completion status visible.
- Support quick filtering and searching on the dashboard.
- Provide lightweight study guidance and contextual widgets.
- Preserve some client state locally when the server cannot be reached.

## Implemented capabilities

- JWT-based signup, login, and protected routes.
- Profile display and name update.
- Create, read, update, delete, and completion-toggle operations for academic tasks.
- Priorities: `low`, `medium`, and `high`.
- Subject/category selection and client-side custom category creation.
- Deadline formatting, overdue detection, and due-within-24-hours alerts.
- Dashboard metrics, search, status filters, priority filter, collapsible task sections, and optimistic updates.
- Light/dark theme persistence.
- Study-tip modal, local clock, weather lookup, and embedded Spotify playlist.
- Encrypted storage of task title, description, priority, and subject fields.

## Scope

The system is a single-user-per-account task manager. It does not currently implement team sharing, course enrollment, calendars, recurring tasks, attachments, server-side search, email reminders, a notification collection, or a server-side category model.

## Major limitations

- Categories are maintained in the browser and are not synchronized with MongoDB.
- Client fallback can retain local tasks, but there is no synchronization queue or conflict resolution.
- Browser notifications require permission and work only while the client application is active enough to run its timer.
- The server has no production deployment definition, migration system, or automated frontend tests.
- `server/config.env` exists in the working tree and contains deployment-sensitive values; it must be treated as a credential-management issue.

## Technology stack

| Layer | Technologies verified in source |
|---|---|
| Client | React 19, TypeScript 5, Vite 6, React Router 6, Zustand 4, Axios, Tailwind CSS, HeroUI, Framer Motion, Lucide React, date-fns |
| Server | Node.js, Express 5, CommonJS JavaScript, dotenv, bcrypt, jsonwebtoken, cors, nodemon |
| Database | MongoDB Node driver 6; collections `users` and `AcadTasks` |
| External services | OpenWeatherMap HTTP API, Spotify embed iframe, Google Fonts, browser Geolocation and Notifications APIs |
| Build/development | npm, concurrently, Vite, ESLint, custom Node test runner |
