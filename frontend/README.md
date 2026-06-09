# Frontend — AI Smart Asset Management (Vite + React)

Welcome! This document explains the frontend (the part you use in your browser) in plain language. It tells you what the frontend does, how the code is organized, and how to run it.

What the frontend does (simple)
- Shows the user interface (pages, buttons, forms, dashboards) for managing assets.
- Fetches data from the backend (the server) and displays it; sends user actions (create, update, delete) back to the backend.

Why files are organized the way they are (simple reasons)
- Small focused folders make the project easier to understand and maintain.
- Each folder has a clear purpose so developers and non-developers can find things quickly.

Folder overview (what each folder holds and why)
- `src/` — All frontend code lives here.
	- `src/components/` — Reusable UI parts (buttons, tables, cards) organized by feature. Keeps visual pieces in one place so they can be reused.
	- `src/pages/` — Full pages/screens. Pages combine components to create what the user sees.
	- `src/api/` — Centralized HTTP code that talks to the backend. Keeps network logic in one place for easy updates.
	- `src/store/` — Small shared data (like logged-in user and tokens). Lets different parts of the app access the same information.
	- `src/hooks/` — Reusable helper functions for components (e.g., `useDebounce`, `useToast`).
	- `src/utils/` — Small utility functions (formatting, calculations) used across the app.

Key files explained (where to look and why)
- `src/main.jsx` — App entry point: boots React and renders the application.
- `src/App.jsx` — App layout and routes: decides which page shows for each URL.
- `src/api/axiosClient.js` — The single HTTP client used by the app. It adds authentication tokens automatically and handles token refresh.
- `src/store/` — Holds user session details (access token, refresh token) and basic app state.
- `index.css` & `tailwind.config.cjs` — Styling and design rules.

How authentication works (non-technical)
- The backend provides short `accessToken` and longer `refreshToken` when a user logs in.
- The frontend sends the `accessToken` with requests so the server knows who made the request.
- If the `accessToken` expires, the frontend automatically uses the `refreshToken` to get a new one and retries the request.

Configuration & environment variables
- Frontend uses Vite. Variables used by the frontend must start with `VITE_`.
- Important: `VITE_API_BASE_URL` — where your backend API lives (example: `http://localhost:8080/api`). If not set, the app defaults to `http://localhost:8080/api`.

How to run (copy-paste friendly)
1. Install Node.js (https://nodejs.org).
2. In a terminal run:

```powershell
cd frontend
npm install
npm run dev
```

3. Open your browser at http://localhost:5173/ (Vite prints the exact address).

Build for production (create optimized static files):

```powershell
npm run build
npm run preview
```

Troubleshooting (plain guidance)
- If the UI loads but data is missing, the backend may be offline or the API URL is incorrect.
	- Fix: start the backend or set `VITE_API_BASE_URL` to the correct server and restart the frontend.
- If login fails, check browser console and the network tab to see which API call returned an error.

Why this layout benefits non-developers and teams
- Easier navigation: designers/tests/users can find UI files (`src/components`) and pages (`src/pages`) quickly.
- Safer changes: changing styles or a small component rarely affects other unrelated parts.

Next steps I can help with (pick one)
- Draw a simple diagram of the folder structure.
- List the specific files for the `assets` feature (page, components, API client).

If you want any of those, tell me which and I'll produce it.
