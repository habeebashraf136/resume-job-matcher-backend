# Resume Job Matcher

An AI-powered full-stack application that takes a PDF resume, understands it, finds real job listings, and returns them ranked by how well they fit the candidate.

Built as a portfolio project to practice **TypeScript**, **LangGraph.js** pipelines, **React** (with a Neo-Brutalism design system), **embeddings**, and **relational database design**.

---

## Table of Contents

- [What It Does](#what-it-does)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Backend Pipeline](#backend-pipeline)
- [Frontend Architecture](#frontend-architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Migrations](#database-migrations)
- [Deploying to Render](#deploying-to-render)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Key Design Decisions](#key-design-decisions)
- [Known Limitations](#known-limitations)
- [Author](#author)

---

## What It Does

1. A logged-in user uploads a resume as a PDF via the React frontend.
2. The backend converts the PDF to plain text.
3. An LLM (Groq) pulls out the candidate's skills, work history, target role, and preferred location.
4. The backend searches live job listings through the JSearch API (RapidAPI).
5. The resume and every job are turned into embeddings (Mistral) and compared with cosine similarity.
6. A second LLM (Google Gemini) re-scores each job for role, experience, and location fit, and writes a short reason for each score.
7. The search and its ranked jobs are saved to PostgreSQL, so the user can view their history later on the dashboard.
8. The frontend displays the results with smooth animations and a Neo-Brutalist UI that supports both light and dark modes.

---

## Tech Stack

### Frontend

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS (custom Neo-Brutalist design system)
- **State Management**: Zustand (global) + React Query (server state)
- **Routing**: React Router v7
- **Forms & Validation**: React Hook Form + Zod
- **Animations & 3D**: Framer Motion + Three.js (@react-three/fiber)
- **Icons**: Lucide React

### Backend

- **Runtime**: Node.js 22.18+ (ES modules, runs TypeScript directly, no build step)
- **Framework**: Express 5
- **Pipeline Orchestration**: LangGraph.js
- **Extraction LLM**: Groq (`openai/gpt-oss-120b`)
- **Ranking LLM**: Google Gemini (with a fallback model, see `rank.matches.node.ts`)
- **Embeddings**: Mistral (`mistral-embed`, 1024 dimensions)
- **Vector Database**: Pinecone (index `resume-job-matcher`). The resume vector is stored per user; job similarity is calculated in code.
- **Job Data**: JSearch API via RapidAPI
- **Database**: PostgreSQL (Neon) with `pg` and `node-pg-migrate`
- **Cache & Rate Limiting**: Redis (`ioredis`)
- **Auth**: JWT access + refresh tokens, bcrypt
- **File Upload & PDF Parsing**: Multer + `@cedrugs/pdf-parse`

---

## Project Structure

```
resume-job-matcher-backend/
├── README.md
├── backend/                       # Node.js Express backend
│   ├── migrations/                # SQL migrations (users, job_searches, ranked_jobs)
│   └── src/
│       ├── config/                # Env validation, Postgres pool, Redis, Pinecone
│       ├── routes/                # API route definitions
│       ├── controllers/           # Route logic (Auth, Job Match)
│       ├── middlewares/           # JWT auth, Multer upload, error handling
│       ├── graph/                 # LangGraph state + graph definition
│       ├── nodes/                 # The six pipeline nodes for LangGraph
│       ├── services/              # JSearch, embeddings, Pinecone, PDF parsing
│       ├── validators/            # Request validation (Zod)
│       └── utils/                 # Logger, rate limiters, async handler
└── frontend/                      # React Vite frontend
    ├── src/
    │   ├── api/                   # Axios client and API calls
    │   ├── components/            # Reusable UI components
    │   ├── hooks/                 # Custom React hooks
    │   ├── pages/                 # Home, Login, Register, Dashboard, History
    │   ├── store/                 # Zustand stores
    │   └── index.css              # Global styles and CSS variables (light/dark)
    └── tailwind.config.js
```

---

## Backend Pipeline

The pipeline is a **LangGraph.js** graph with six nodes that run one after another.

```mermaid
flowchart TD
    A[Upload PDF] --> B[parseResume]
    B --> C[extractProfile]
    C --> D[searchJobs]
    D --> E[embedAndScore]
    E --> F[rankMatches]
    F --> G[saveResults]
    G --> H[Response]
```

- **parseResume**: Extracts text from the uploaded PDF, then deletes the temp file.
- **extractProfile**: Groq model reads skills, role and work history. Years of experience are calculated in code, not by the model.
- **searchJobs**: Queries the JSearch API using the target role, top skills and preferred location.
- **embedAndScore**: Embeds the profile and jobs with Mistral, then computes cosine similarity.
- **rankMatches**: Gemini re-scores each job on role, experience, location and skills, and writes a reason.
- **saveResults**: Saves the search and ranked jobs to PostgreSQL in one transaction.

---

## Frontend Architecture

The frontend uses a **Neo-Brutalist** style: high contrast, thick borders, bold type.

- **Theming**: Light and dark modes, managed with CSS variables in `index.css`.
- **UI Components**: Custom-built Buttons, Inputs and Cards. No generic component library.
- **Data Fetching**: React Query handles API requests, caching and loading states.
- **Global State**: Zustand stores the auth state and theme.
- **3D Elements**: The landing page has an interactive particle scene built with Three.js and `@react-three/fiber`.

---

## Getting Started

### Prerequisites

- **Node.js 22.18 or newer.** Older versions cannot run `.ts` files directly.
- **PostgreSQL**: A free Neon database works well.
- **Redis**: Used for rate limiting and refresh tokens.
- **Pinecone**: Create an index named `resume-job-matcher`, dimension `1024`, metric `cosine`.
- API keys for **Groq**, **Google Gemini**, **Mistral** and **RapidAPI** (JSearch).

### Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values

# Create the database tables (see Database Migrations below)
npx dotenv -e .env -- npm run migrate

# Start the server
npm run dev
```

The uploads folder is created automatically. You do not need to create it.

### Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Fill in your frontend .env (see below)

npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

### Backend (`backend/.env`)

The server stops at startup if any of these are missing.

| Variable | What it is |
| --- | --- |
| `PORT` | Server port. Render sets this for you. Defaults to 4000. |
| `NODE_ENV` | `development` or `production` |
| `FRONTEND_URL` | Exact frontend address for CORS, with no trailing slash. Example: `http://localhost:5173` |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_HOST` | Redis host |
| `REDIS_PORT` | Redis port |
| `REDIS_PASSWORD` | Redis password |
| `ACCESS_TOKEN_SECRET` | Long random string for access tokens |
| `REFRESH_TOKEN_SECRET` | A different long random string for refresh tokens |
| `GROQ_API_KEY` | Groq API key (profile extraction) |
| `GEMINI_API_KEY` | Google Gemini API key (ranking) |
| `MISTRAL_API_KEY` | Mistral API key (embeddings) |
| `PINECONE_API_KEY` | Pinecone API key |
| `RAPID_API_KEY_API` | RapidAPI key for JSearch |

### Frontend (`frontend/.env`)

```
VITE_BACKEND_URL=http://localhost:3000
VITE_API_URL=http://localhost:3000
```

- Set both to the same backend address.
- Do not add `/api` at the end and do not add a trailing slash.
- Use your `PORT` value. The server defaults to 4000 if `PORT` is not set.

---

## Database Migrations

Migrations are SQL files in `backend/migrations/`, run by `node-pg-migrate`.

From the `backend` folder:

```bash
# Using your .env file
npx dotenv -e .env -- npm run migrate

# Or set the variable yourself
# Mac/Linux
DATABASE_URL="postgres://user:pass@host/db" npm run migrate

# Windows PowerShell
$env:DATABASE_URL="postgres://user:pass@host/db"; npm run migrate
```

- Run it once per database. Running it again is safe. It skips migrations that already ran.
- Test on a throwaway database first, then run it against production.
- To undo the last migration: `npx node-pg-migrate down`

---

## Deploying to Render

Deploy the backend as a **Web Service**. Deploy the frontend separately (a Render Static Site or Vercel).

1. Create the production database and run the migrations against it (see above).
2. In Render, create a new Web Service from this repository and use these settings:

| Setting | Value |
| --- | --- |
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |

3. Add environment variables:
   - Every backend variable from the table above.
   - `NODE_ENV=production`
   - `NODE_VERSION=22.22.0`
   - `FRONTEND_URL` set to your deployed frontend address.
4. Deploy the frontend and set `VITE_BACKEND_URL` and `VITE_API_URL` to your Render service address.
5. Check that `https://your-service.onrender.com/` returns `{"message":"server is running"}`.

Notes:
- The free Render plan sleeps after about 15 minutes of no traffic. The first request afterwards is slow.
- The refresh cookie uses `SameSite=None; Secure` in production. Some browsers block it when the frontend and backend are on different domains. A custom domain for both avoids this.
- If your Redis provider requires TLS (Upstash, Redis Cloud), the Redis config needs `tls: {}`.

---

## Database Schema

Three main tables in PostgreSQL:

- **`users`**: User accounts (username, email, hashed password).
- **`job_searches`**: One row per resume upload, including the extracted JSON profile.
- **`ranked_jobs`**: The ranked jobs for each search, linked to `job_searches`.

---

## API Endpoints

| Method | Path | Auth | What it does |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | No | Create an account |
| POST | `/api/auth/login` | No | Log in |
| GET | `/api/auth/get-refresh` | Cookie | Get a new access token |
| GET | `/api/auth/get-user` | Yes | Get the current user |
| POST | `/api/auth/logout` | Yes | Log out |
| POST | `/api/job-match/findJobs` | Yes | Upload a PDF (field name `resume`) and get ranked jobs |
| GET | `/api/job-match/history` | Yes | Get past searches |

---

## Key Design Decisions

- **LangGraph for the pipeline**: Keeps each step separate and easy to test.
- **Two-stage scoring**: Embedding similarity is a fast first pass. An LLM then adjusts scores for role level and experience.
- **Years of experience calculated in code**: The LLM only extracts dates. This avoids made-up numbers.
- **Redis-backed rate limits and token store**: Limits work across restarts, and logout can block a token before it expires.
- **Neo-Brutalism UI**: Chosen to look different from standard corporate designs.

---

## Known Limitations

- **Slow, single-request pipeline**: A search can take 30-40 seconds and runs inside one HTTP request. There is no background queue.
- **Limited job source**: Only the JSearch API is used, restricted to India (`in`).
- **Embedding rate limits**: Jobs are embedded in parallel. On a free Mistral plan, some may fail and be skipped.
- **One refresh token per user**: Logging in on a second device logs out the first.

---

## Author

**Habeeb Ashraf**
GitHub: [@habeebashraf136](https://github.com/habeebashraf136)