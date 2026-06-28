# Resume Job Matcher — Backend

An AI-powered backend that takes a raw resume, understands it, and returns the most relevant job listings — ranked by how well they match the candidate's skills and experience.

Built as a portfolio project to practice **TypeScript**, **RAG pipelines**, and **LangGraph.js** multi-agent orchestration.

---

## What It Does

1. User uploads a resume (PDF)
2. An AI pipeline parses and extracts skills, experience, and role preferences
3. The system searches real job listings via the **Rapidapi Job SearchAPI**
4. Each job is embedded and scored against the resume using **vector similarity**
5. Results are ranked and returned to the user
6. The full search history is saved to MongoDB for future reference

---

## AI Pipeline — LangGraph.js

The core of this project is a **6-node LangGraph pipeline** that processes the resume end to end:

```
Upload Resume
     │
     ▼
┌─────────────┐
│  Parse Node │  ── Extracts raw text from PDF
└─────────────┘
     │
     ▼
┌──────────────┐
│ Extract Node │  ── LLM extracts skills, experience, job title, location
└──────────────┘
     │
     ▼
┌─────────────┐
│ Search Node │  ── Queries Rapidapi Job SearchAPI with extracted profile
└─────────────┘
     │
     ▼
┌───────────────────┐
│ Embed + Score Node│  ── Embeds resume + job descriptions, computes similarity
└───────────────────┘
     │
     ▼
┌───────────┐
│ Rank Node │  ── Sorts jobs by match score
└───────────┘
     │
     ▼
┌───────────┐
│ Save Node │  ── Persists results to MongoDB
└───────────┘
     │
     ▼
  Response returned to user
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express.js |
| AI Orchestration | LangGraph.js |
| LLM (Extraction) | Groq (via OpenRouter) |
| Embeddings | OpenAI / Mistral |
| Vector Database | Pinecone |
| Job Search API | Rapidapi |
| Database | MongoDB + Mongoose |
| Cache / Rate Limiting | Redis (ioredis) |
| Auth | JWT (Access + Refresh tokens) |
| File Upload | Multer |
| Containerization | Docker |
| Logging | Winston |

---

## Project Structure

```
src/
├── app.ts                  # Express app setup and route registration
├── server.ts               # Server bootstrap, DB and Pinecone init
├── config/                 # DB, Pinecone, Redis, environment configs
├── controllers/            # Auth and job match request handlers
├── middlewares/            # Auth, error handling, file upload, rate limiting
├── models/                 # Mongoose schemas (User, JobSearch)
├── routes/                 # API route definitions
├── services/               # External API integrations (Rapidapi, Pinecone, OpenAI)
├── nodes/                  # LangGraph pipeline nodes (parse, extract, search, embed, rank, save)
├── graph/                  # LangGraph state and graph definition
├── validators/             # Request validation
├── types/                  # TypeScript type definitions
└── utils/                  # Shared utilities and logger
```

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
| GET | `/api/job-match/history` | Get past job search results for the user | ✅ Required |

#### POST `/api/job-match/findJobs`

**Request:** `multipart/form-data`

```
resume: <PDF file>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "title": "Backend Engineer",
        "company": "Acme Corp",
        "location": "Remote",
        "matchScore": 0.87,
        "url": "https://...",
        "description": "..."
      }
    ],
    "totalResults": 10
  }
}
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=your mongodb uri

# Redis
REDIS_HOST=your redis host
REDIS_PORT=your redis port
REDIS_PASSWORD=your redis password


# Auth
ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret

# AI / LLM
OPENROUTER_API_KEY=your openrouter api key
GROQ_API_KEY=your groq api key
MISTRAL_API_KEY=your mistral api key


# Vector DB
PINECONE_API_KEY=your pinecone api key

# Job Search
RAPID_API_KEY_API=your rapidapi key
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB running locally or via Atlas
- Redis running locally or via Upstash
- Pinecone account (free tier works)
- Groq API key (free)
- OpenRouter API key (free)
- Mistral API key (free)
- Rapidapi API key (free)

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
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

---

## Docker

```bash
# 3. Build and start
docker-compose up --build

# Run in background
docker-compose up 

# Stop
docker-compose down
```

---

## Key Design Decisions

- **LangGraph for pipeline orchestration** — Each processing stage is a separate node with typed state, making it easy to debug, extend, or swap individual steps
- **Pinecone for vector search** — Resume and job descriptions are embedded and compared using cosine similarity to produce a real match score, not just keyword overlap
- **Redis for rate limiting** — Prevents API abuse per user per time window
- **JWT refresh token rotation** — Refresh tokens are stored in Redis and rotated on each use for security
- **Groq for speed** — Fast inference for the extraction step, keeping the pipeline latency low

---

## Purpose

This is a **portfolio and learning project** built to practice:

- TypeScript in a real backend context
- RAG (Retrieval Augmented Generation) pipeline design
- LangGraph.js multi-agent orchestration
- Vector embeddings and similarity search with Pinecone

---

## Author

**Habeeb Ashraf**
GitHub: [@habeebashraf136](https://github.com/habeebashraf136)