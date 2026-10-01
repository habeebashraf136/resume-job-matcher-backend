# Resume Job Matcher — Backend

An AI-powered backend that takes a raw resume, understands it, and returns the most relevant job listings — ranked by how well they match the candidate's skills and experience.

Built as a portfolio project to practice **TypeScript**, **RAG pipelines**, and **LangGraph.js** multi-agent orchestration.

---

## What It Does

1. User uploads a resume (PDF)
2. The PDF is parsed into raw text
3. An LLM (Groq) extracts skills, experience, and role preferences from the text
4. The system searches real job listings via the **JSearch API (RapidAPI)**
5. Each job is embedded and scored against the resume using **vector similarity**
6. An OpenAI model (via OpenRouter) re-ranks the jobs for role, experience, and location fit
7. The full search history is saved to **PostgreSQL** for future reference

---

## AI Pipeline — LangGraph.js

The core of this project is a **LangGraph pipeline** that processes the resume end to end:

Upload Resume
│
▼
┌─────────────┐
│ Parse Node │ ── Extracts raw text from the uploaded PDF
└─────────────┘
│
▼
┌──────────────┐
│ Extract Node │ ── Groq LLM extracts skills, experience (with dates), job title, location
└──────────────┘
│
▼
┌─────────────┐
│ Search Node │ ── Queries JSearch API (RapidAPI) with the extracted profile
└─────────────┘
│
▼
┌───────────────────┐
│ Embed + Score Node│ ── Embeds resume + job descriptions, computes cosine similarity
└───────────────────┘
│
▼
┌───────────┐
│ Rank Node │ ── OpenAI model (via OpenRouter) re-scores jobs on role/experience/location fit
└───────────┘
│
▼
┌───────────┐
│ Save Node │ ── Persists the search and ranked jobs to PostgreSQL
└───────────┘
│
▼
Response returned to user


---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express.js |
| AI Orchestration | LangGraph.js |
| LLM (Extraction) | Groq |
| LLM (Ranking) | OpenAI (via OpenRouter) |
| Embeddings | Mistral |
| Vector Database | Pinecone (resume embeddings) |
| Job Search API | JSearch (RapidAPI) |
| Database | PostgreSQL (Neon) |
| Cache / Rate Limiting | Redis (ioredis) |
| Auth | JWT (Access + Refresh tokens) |
| File Upload | Multer |
| PDF Parsing | PDF parser library |
| Schema Validation | Zod |
| Logging | Winston |

---

## Project Structure

src/
├── app.ts # Express app setup and route registration
├── server.ts # Server bootstrap, DB and Pinecone init
├── config/ # DB, Pinecone, Redis, environment configs
├── controllers/ # Auth and job match request handlers
├── middlewares/ # Auth, error handling, file upload, rate limiting
├── models/ # Postgres queries / data access for job searches and users
├── routes/ # API route definitions
├── services/ # External API integrations (JSearch, Pinecone, embeddings)
├── nodes/ # LangGraph pipeline nodes (parse, extract, search, embed+score, rank, save)
├── graph/ # LangGraph state and graph definition
├── validators/ # Zod request validation schemas
├── types/ # TypeScript type definitions
└── utils/ # Shared utilities and logger


---

## API Endpoints

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive tokens |
| GET | `/api/auth/get-refresh` | Refresh access token |
| GET | `/api/auth/get-user` | Get current authenticated user |
| POST | `/api/auth/logout` | Logout and invalidate refresh token |

### Job Matching

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/job-match/findJobs` | Upload resume and get ranked job matches | ✅ Required |
| GET | `/api/job-match/history` | Get past job search results for the user, grouped by search | ✅ Required |

#### POST `/api/job-match/findJobs`

**Request:** `multipart/form-data`

resume: <PDF file>


**Response:**

```json
{
  "success": true,
  "jobSearchId": "abc-123",
  "rankedJobs": [
    {
      "jobId": "...",
      "title": "Backend Developer Intern",
      "company": "Acme Corp",
      "location": "IN",
      "score": 90,
      "matchReason": "Strong fit for an entry-level candidate with Node.js skills.",
      "url": "https://...",
      "jobType": "full-time",
      "salary": "40000-60000 INR",
      "postedAt": "2026-09-20T10:00:00Z"
    }
  ]
}
```

#### GET `/api/job-match/history`

**Response:**

```json
{
  "success": true,
  "message": "Job search history retrieved successfully",
  "data": [
    {
      "jobSearchId": "abc-123",
      "createdAt": "2026-09-28T10:30:56.993Z",
      "targetRole": "Backend Developer",
      "jobs": [
        { "title": "...", "company": "...", "score": 90, "matchReason": "...", "url": "..." }
      ]
    }
  ]
}
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
# Server
PORT=3000
NODE_ENV=development

# PostgreSQL (Neon)
DATABASE_URL=your_postgres_connection_string

# Redis
REDIS_HOST=your redis host
REDIS_PORT=your redis port
REDIS_PASSWORD=your redis password

# Auth
ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret

# AI / LLM
GROQ_API_KEY=your groq api key
OPENROUTER_API_KEY=your openrouter api key
MISTRAL_API_KEY=your mistral api key

# Vector DB
PINECONE_API_KEY=your pinecone api key

# Job Search
RAPID_API_KEY_API=your rapidapi key
```

---

## Getting Started

### Prerequisites

- Node.js v22+
- A PostgreSQL database (Neon free tier works)
- Redis running locally or via Upstash
- Pinecone account (free tier works)
- Groq API key (free)
- OpenRouter API key (free)
- Mistral API key (free)
- RapidAPI account subscribed to JSearch (free tier works)

### Installation

```bash
# Clone the repo
git clone https://github.com/habeebashraf136/resume-job-matcher-backend.git
cd resume-job-matcher-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your values in .env

# Run the Postgres migration (creates job_searches / ranked_jobs tables)
# see migrations/ for the SQL file
```

### Development

```bash
npm run dev
```

### Type checking

```bash
npm run typecheck
```

### Production

```bash
npm start
```

---

## Key Design Decisions

- **LangGraph for pipeline orchestration** — Each processing stage is a separate node with typed state, making it easy to debug, extend, or swap individual steps
- **Postgres over MongoDB for search history** — `job_searches` and `ranked_jobs` are normalized relational tables, enforcing data integrity (foreign keys, score range checks) that a document-store array couldn't guarantee
- **Pinecone for vector search** — Resume embeddings are stored for similarity comparison against job descriptions, producing a real match score instead of keyword overlap
- **Two-stage scoring** — Embedding similarity gives a fast first-pass score; an LLM re-ranks on top of that for role, experience, and location fit that embeddings alone can't capture
- **Redis for rate limiting and refresh token rotation** — Refresh tokens are stored in Redis and rotated on each use for security
- **Groq for extraction speed** — Fast inference keeps resume parsing latency low

---

## Known Limitations

- Pipeline latency is currently in the tens-of-seconds range per search (LLM extraction + job search + embeddings + LLM ranking run sequentially); background job processing is a planned improvement
- Job embeddings are recomputed per search rather than cached, since current traffic doesn't justify the added complexity

---

## Purpose

This is a **portfolio and learning project** built to practice:

- TypeScript in a real backend context
- RAG (Retrieval Augmented Generation) pipeline design
- LangGraph.js multi-agent orchestration
- Vector embeddings and similarity search with Pinecone
- Relational database design (Postgres) for an AI pipeline's output

---

## Author

**Habeeb Ashraf**
GitHub: [@habeebashraf136](https://github.com/habeebashraf136)