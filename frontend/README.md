# Frontend (React + TypeScript + Vite)

This is the React frontend for the Medium-style blog app. It talks to the backend over REST and uses cookies for auth.

## Tech

- React 19 + TypeScript
- Vite 7
- React Router
- Tailwind CSS (via `@tailwindcss/vite`)
- ESLint (flat config)

## Prerequisites

- Node.js 18+ and npm
- Backend running at `http://localhost:3000/api/v1` (default). You can change this in `src/utils/api.ts` by editing `API_BASE_URL`.

## Getting started

1. Install deps (from repo root or inside `frontend/`):
  - From root workspace with workspaces: `npm install`
  - Or here only: `npm install`
2. Create a `.env` file in `frontend/` (see variables below).
3. Start the dev server: `npm run dev`
4. Open the app at the URL Vite prints (usually `http://localhost:5173`).

## Environment variables

Used for Cloudinary image uploads (see `src/utils/cloudinary.ts`). Create `frontend/.env` with:

```
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
```

> Note: The app uses cookie-based auth (`credentials: 'include'`). Ensure the backend CORS allows the frontend origin and credentials.

## Scripts

- `npm run dev` – Start Vite dev server
- `npm run build` – Type-check and build for production
- `npm run preview` – Preview the production build
- `npm run lint` – Run ESLint

In the monorepo root there’s also a VS Code task named `vite-build-frontend` that runs the build for this package.

## Features

- Auth: register, login, logout, session via cookies
- Profile: view/update bio and avatar (Cloudinary upload)
- Posts: create, edit, delete, list, like
- Comments: thread, like/unlike
- Social: follow/unfollow, personalized feed
- Search and user/public profile pages

## Project structure

- `src/pages` – Route pages (Home, Login, Register, Write, Post, Edit, Profile, UserProfile)
- `src/components` – UI components (e.g., `Navbar`)
- `src/contexts` – `AuthContext` for auth state
- `src/utils` – `api.ts` (REST client), `cloudinary.ts` (uploads)

## Backend expectations

- Base URL: `http://localhost:3000/api/v1`
- Must set CORS to allow the frontend origin and `credentials: true`
- Provides routes used in `src/utils/api.ts` (users, posts, comments, feed, search)

## Troubleshooting

- 401/unauthorized in dev: ensure backend is running and CORS allows your dev origin with credentials
- Avatar upload fails: verify Cloudinary env vars and that the upload preset is unsigned and allows image uploads
- API base URL different: update `API_BASE_URL` in `src/utils/api.ts`

## License

MIT (see repository root)
