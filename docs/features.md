# Features and Functionalities

## Authentication and user management

**Purpose:** create an account, authenticate, and maintain a display name.

**Flow:** `AuthForm` validates the form locally, `authService` posts to the server, and `useAuthStore` persists the returned user and JWT. `ProtectedRoute` redirects unauthenticated users to `/login`. Navbar logout clears persisted auth state. Profile editing posts a new name and updates local state.

**Inputs and processing:** signup accepts name, email, and password; login accepts email and password; profile update accepts name. The server normalizes email to lowercase, hashes passwords with bcrypt, signs JWTs, and authorizes profile updates from the token subject.

**Outputs:** signup returns HTTP 201 with token, user id, name, email, and creation time. Login returns the same user shape with HTTP 200. Profile update returns a message and name.

**Implementation:** `AuthForm.tsx`, `LoginPage.tsx`, `SignupPage.tsx`, `ProfilePage.tsx`, `useAuthStore.ts`, `authService.ts`, `auth.routes.js`, `auth.controller.js`, and `auth.service.js`.

## Task management

**Purpose:** manage academic tasks for the authenticated user.

**Flow:** the user opens the create form, enters a title, optional description, priority, date, and subject, then submits. The store attempts the API request. Successful responses replace the temporary task; failed creates are retained locally. Edits are optimistic and roll back on API failure. Deletes are optimistic and roll back on failure. Completion toggles are optimistic and revert if the server request fails.

**Inputs:** title, description, priority, deadline, subject, and optional completion state. The UI requires title, date, and subject. The server limits title to 200 characters, description to 2,000, subject to 100, and priority to `low`, `medium`, or `high`.

**Outputs:** task objects contain id, userId, title, description, priority, deadline, subject, completed, createdAt, and updatedAt.

**Implementation:** `TaskForm.tsx`, `TaskCard.tsx`, `TaskList.tsx`, `useTaskStore.ts`, `taskService.ts`, `task.routes.js`, `task.controller.js`, and `task.service.js`.

## Subjects and categories

The client starts with General, Major Subjects, General Education, Lab & Projects, and Exams & Quizzes. A user can add a custom subject in `TaskForm`; it is stored in the persisted browser task store and the task stores the category id in its `subject` field. The backend has no category model or CRUD API. Category metadata is therefore browser-local and is not a server-backed user feature.

## Priorities and status

The three priorities are represented in both TypeScript and server validation. Task completion is a boolean. The dashboard presents pending and completed sections, allows collapsing each section, and displays visual priority/overdue states. The server also exposes a dedicated toggle endpoint.

## Dashboard, search, filter, and sort

`HomePage` displays total, pending, completed, and overdue metrics. `useTaskFiltering` first scopes tasks to the current user, then supports:

- all, due today, upcoming, overdue, and completed status filters;
- all/low/medium/high priority filtering;
- case-insensitive search in title and description;
- ascending deadline sorting.

Search does not include subject/category or priority text. “Upcoming” means incomplete tasks after today’s end; “overdue” means incomplete tasks before today’s start.

## Notifications and reminders

`useDeadlineNotifier` identifies incomplete tasks due in the next 24 hours and incomplete overdue tasks. The dashboard shows `DeadlineAlertBanner`; `NotificationBell` exposes a dropdown with urgent and overdue lists. In-app toasts are deduplicated per browser session using `sessionStorage`. If permission is granted, browser notifications are sent for newly urgent tasks. The hook checks on mount, task changes, and every two minutes.

There is no backend notification storage, push service, email reminder, or background worker.

## Profile and study statistics

`ProfilePage` shows the current name/email/join date, completed count, completion rate, pending count, overdue count, and priority distribution. Only the name is editable; email, avatar, and password changes are not implemented.

## Study-related and ambient features

- `StudyTipPopup` shows one random static tip per session, with categories and a next-tip action.
- `ClockWidget` displays local browser time and date.
- `WeatherWidget` uses geolocation where available and falls back to configured campus coordinates; it displays current weather from OpenWeatherMap.
- `SpotifyWidget` embeds a fixed Spotify study playlist.
- `ThemeProvider` applies persisted light/dark class-based styling.

## Settings and other functionality

There is no dedicated settings page. Theme switching is available in the navbar. A 404 route is implemented. Footer social links point to generic GitHub and Twitter URLs rather than an application-specific profile.
