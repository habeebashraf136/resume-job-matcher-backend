# Resume Job Matcher Frontend

This is the frontend application for Resume Job Matcher, a high-performance, visually stunning AI-powered job matching system.

## Features

- **Dynamic 3D Aesthetics**: Immersive Three.js starfield backgrounds and smooth Framer Motion animations.
- **Accessibility & Preferences**: Full ARIA support, keyboard navigation, and `prefers-reduced-motion` integration for seamless, inclusive UX.
- **Rate Limit Resilience**: Gracefully handles API rate limits (HTTP 429) via a global banner and exponential backoff queues.
- **Robust Authentication**: Stateless JWT pattern with secure, `httpOnly` cookie-based refresh tokens and automatic Axios interceptor refresh logic.
- **Performance**: Caches API requests with TanStack Query to eliminate redundant history loading.
- **Job Matching Pipeline**: Simulates a high-end analysis pipeline interface with `aria-live` regions.

## Setup & Running

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   The application will run at `http://localhost:5173`.

3. **Build for Production**:
   ```bash
   npm run build
   ```

## Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:3000
```
*(If omitted, it defaults to `http://localhost:3000`)*

## API Endpoints Used

The application interfaces with the following backend contracts:

- `POST /api/auth/register` - Creates a new user account.
- `POST /api/auth/login` - Authenticates and returns `{ user, accessToken, message }`.
- `GET /api/auth/get-user` - Returns the authenticated user profile.
- `GET /api/auth/get-refresh` - Re-issues an `accessToken` using a secure `httpOnly` cookie.
- `POST /api/auth/logout` - Invalidates the refresh token cookie.
- `POST /api/job-match/findJobs` - Accepts a `multipart/form-data` PDF file and returns `{ rankedJobs: [...] }`.
- `GET /api/job-match/history` - Returns a flat, snake_case history array, locally parsed into grouped, camelCase mission records.

## Architecture

- **React Router v6**: Used for nested layouts and protected route wrappers.
- **Zustand**: Lightweight global state management for the `authStore`.
- **TanStack Query**: Robust API data fetching, caching, and background invalidation (`['jobHistory']`).
- **Axios**: Handles request interceptors, including a centralized queued retry mechanism for 401s and global 429 event dispatchers.
- **Tailwind CSS**: Strict theming, using the `@tailwindcss/typography` and `@tailwindcss/forms` plugins.
- **Vitest**: Unit testing utilities and history transformers.
