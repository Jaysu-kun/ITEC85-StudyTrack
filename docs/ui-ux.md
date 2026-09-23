# UI/UX Documentation

## Design structure

The interface uses a student dashboard pattern: fixed top navigation, welcome header, KPI strip, task workspace, and a sidebar for time/weather/music widgets. Cards use translucent surfaces, blue/cyan branding, priority colors, and dark-mode variants.

## Main user flows

1. A visitor chooses Log In or Sign Up from the navbar.
2. After successful auth, the user lands on the dashboard and tasks are fetched.
3. The user creates a task, selects priority/date/subject, and receives a toast.
4. The user searches or filters tasks, edits or deletes a card, or toggles completion.
5. The notification bell and dashboard banner highlight urgent/overdue work.
6. The profile page shows productivity statistics and allows name editing.

## Feedback patterns

- Required and invalid form fields use inline error text and alert semantics.
- Async actions use button spinners or dashboard loading states.
- CRUD actions use toasts.
- Empty sections explain the current state.
- Deadline urgency uses color, icon, labels, and optional browser notifications.
- The study-tip popup can be dismissed by button, backdrop, or Escape.

## Accessibility considerations already present

- Labels, generated ids, and `aria-describedby` are used for reusable inputs.
- Buttons expose labels for icon-only actions.
- Filter controls use `aria-pressed`; dialogs expose dialog roles and labels.
- Toasts and validation messages use live/alert semantics.
- Focus-visible rings are included in common controls.
- Reduced-motion media rules and Framer Motion reduced-motion handling are present.

## Responsive behavior

The dashboard stacks columns on smaller screens, forms switch from two columns to one, task cards wrap long content, and navigation hides the login link on small screens while retaining signup. Widgets remain in the page flow.

## Inconsistent or confusing patterns

- The product is named IskoTasks in UI, while source metadata and some text use StudyTrack/IskoTask.
- A task’s subject is displayed as a category id unless a matching browser-local category exists; server-created or cross-device categories can therefore appear as raw ids.
- Failed profile updates are reported as “saved locally” even though there is no profile synchronization queue.
- Failed task creates are retained locally, but later actions on those random local ids cannot be sent to the API until a synchronization mechanism exists.
- The alert count combines urgent and overdue lists, and the same task can appear in both only if date logic changes across a session; the UI does not explain this counting model.
- Footer social links are generic destinations, not product links.
- The weather widget depends on a client-exposed service key and third-party availability.
- The study-tip modal uses `aria-modal` but does not implement focus trapping or focus restoration.
- No confirmation dialog is shown before deleting a task.
