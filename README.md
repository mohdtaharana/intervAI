# AI Interviewer - Smart Interview Practice Platform

## Project Overview
- **Name**: AI Interviewer
- **Goal**: AI-powered virtual interviewer that conducts real-time interviews, analyzes candidate performance, and presents detailed results with charts and graphs
- **Tech Stack**: Hono + TypeScript + Cloudflare Workers + D1 Database + Web Speech API + Chart.js

## Live URLs
- **Application**: [Deployed on Cloudflare Pages]
- **Sandbox Preview**: https://3000-iorsfn4ukbl7cxawmtydn-de59bda9.sandbox.novita.ai

## Features

### Completed Features
- **Authentication System**: JWT-based login/signup with secure password hashing
- **AI Interview Engine**: Smart question generation with adaptive difficulty
- **Resume Analysis**: Upload resume text → AI extracts skills, experience, projects, education
- **Resume-based Personalization**: Interview questions tailored to candidate's skills and experience level
- **Real-time Voice Interaction**: Text-to-Speech for AI interviewer + Speech Recognition for candidate answers
- **AI Avatar**: Animated virtual interviewer with speaking indicators
- **Answer Analysis**: Each answer scored on Communication, Technical Knowledge, Confidence, and Clarity (0-10)
- **Adaptive Questions**: Question difficulty adjusts based on previous answer performance
- **Interview Types**: Technical, HR, Behavioral, and Mixed interview modes
- **Multi-language Support**: English, Spanish, French, German, Chinese, Japanese, Hindi
- **Comprehensive Scoring**: Detailed per-question and overall scores with constructive feedback
- **Interactive Dashboard**: Stats cards, radar charts, line graphs, bar charts
- **Score Trends**: Track performance improvement over time
- **Performance by Type**: Compare scores across different interview categories
- **Strengths & Weaknesses Analysis**: Aggregated analysis across all interviews
- **Improvement Suggestions**: AI-generated actionable advice
- **Interview History**: Full history with scores and detailed results
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Modern UI**: Glass morphism, smooth animations, gradient themes

### AI Integration
The application features a dual-mode AI engine:
1. **LLM API Mode**: When configured with a valid OpenAI-compatible API key, uses GPT models for:
   - Natural language resume parsing
   - Dynamic question generation
   - Nuanced answer evaluation
   - Comprehensive feedback generation

2. **Built-in Intelligence Mode**: Always-available smart system that includes:
   - 50+ curated interview questions across all categories
   - Skill-specific question banks (React, Node.js, Python, AWS, Docker, SQL, ML, System Design)
   - Sophisticated answer analysis using NLP heuristics
   - Adaptive difficulty algorithm
   - Comprehensive feedback generation

## API Documentation

### Authentication
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | `{email, password, name}` | Create account |
| POST | `/api/auth/login` | `{email, password}` | Login |
| GET | `/api/auth/me` | - | Get current user (requires Bearer token) |

### Resumes
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/resumes/upload` | `{text, filename}` | Upload & parse resume |
| GET | `/api/resumes` | - | List all resumes |
| GET | `/api/resumes/:id` | - | Get resume details |
| DELETE | `/api/resumes/:id` | - | Delete resume |

### Interviews
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/interviews/start` | `{resumeId?, type, language?}` | Start interview |
| POST | `/api/interviews/:id/answer` | `{questionId, answerText}` | Submit answer |
| GET | `/api/interviews/:id` | - | Get interview details |
| GET | `/api/interviews` | - | List all interviews |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get dashboard statistics |
| GET | `/api/dashboard/analysis` | Get strengths/weaknesses analysis |

### AI Endpoints
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/ai/chat` | `{message, context?}` | Chat with AI |
| POST | `/api/ai/resume-suggestions` | `{resumeText}` | Get resume improvement tips |
| POST | `/api/ai/interview-tips` | `{type, skills?}` | Get interview preparation tips |

## Database Schema

### Users
| Field | Type | Description |
|-------|------|-------------|
| id | TEXT (PK) | Unique user ID |
| email | TEXT (UNIQUE) | User email |
| password_hash | TEXT | SHA-256 hashed password |
| name | TEXT | Full name |
| role | TEXT | 'user' or 'admin' |
| created_at | DATETIME | Registration date |

### Resumes
| Field | Type | Description |
|-------|------|-------------|
| id | TEXT (PK) | Resume ID |
| user_id | TEXT (FK) | Owner user |
| filename | TEXT | Resume name |
| raw_text | TEXT | Original text |
| parsed_data | TEXT (JSON) | Extracted skills, experience, projects |

### Interviews
| Field | Type | Description |
|-------|------|-------------|
| id | TEXT (PK) | Interview ID |
| user_id | TEXT (FK) | Candidate |
| resume_id | TEXT (FK) | Associated resume |
| type | TEXT | technical/hr/behavioral/mixed |
| status | TEXT | in_progress/completed/cancelled |
| total_score | REAL | Overall average (0-10) |
| communication_score | REAL | Communication rating |
| technical_score | REAL | Technical knowledge rating |
| confidence_score | REAL | Confidence level rating |
| clarity_score | REAL | Answer clarity rating |
| overall_feedback | TEXT | AI-generated feedback |
| strengths | TEXT (JSON) | Identified strengths |
| weaknesses | TEXT (JSON) | Areas for improvement |
| improvements | TEXT (JSON) | Specific suggestions |

### Interview Questions
| Field | Type | Description |
|-------|------|-------------|
| id | TEXT (PK) | Question ID |
| interview_id | TEXT (FK) | Parent interview |
| question_text | TEXT | The question |
| question_type | TEXT | technical/behavioral/hr/situational/project |
| difficulty | TEXT | easy/medium/hard |
| answer_text | TEXT | Candidate's answer |
| score | REAL | Overall score (0-10) |
| feedback | TEXT | Per-question feedback |
| communication_score | REAL | Per-question communication |
| technical_score | REAL | Per-question technical |
| confidence_score | REAL | Per-question confidence |
| clarity_score | REAL | Per-question clarity |

## System Architecture

```
┌──────────────────────────────────────────┐
│            Browser (Client)               │
│  ┌─────────────┐ ┌──────────────────┐    │
│  │   React SPA  │ │  Web Speech API  │    │
│  │  (Tailwind)  │ │  TTS + STT       │    │
│  │  Chart.js    │ │  Voice I/O       │    │
│  └──────┬───────┘ └────────┬─────────┘    │
│         │ HTTPS            │              │
└─────────┼──────────────────┼──────────────┘
          │                  │
┌─────────▼──────────────────▼──────────────┐
│        Cloudflare Workers (Edge)           │
│  ┌──────────────────────────────────────┐  │
│  │          Hono Framework               │  │
│  │  ┌──────┐ ┌──────────┐ ┌─────────┐  │  │
│  │  │ Auth │ │ Interview│ │ Resume  │  │  │
│  │  │Routes│ │ Routes   │ │ Routes  │  │  │
│  │  └──────┘ └──────────┘ └─────────┘  │  │
│  │  ┌──────────┐ ┌──────────────────┐  │  │
│  │  │Dashboard │ │   AI Engine      │  │  │
│  │  │ Routes   │ │  Built-in + LLM  │  │  │
│  │  └──────────┘ └──────────────────┘  │  │
│  └──────────────────┬───────────────────┘  │
│                     │                      │
│  ┌──────────────────▼───────────────────┐  │
│  │         Cloudflare D1 (SQLite)        │  │
│  │  users | resumes | interviews | q&a   │  │
│  └───────────────────────────────────────┘  │
└────────────────────────────────────────────┘
          │
          │ (Optional)
┌─────────▼──────────────────────────────────┐
│        OpenAI-Compatible LLM API           │
│  Resume parsing, question gen, analysis    │
└────────────────────────────────────────────┘
```

## User Guide

### Getting Started
1. **Sign Up** - Create an account with your email and password
2. **Upload Resume** - Go to Resumes page, paste your resume text, and click "Analyze & Save"
3. **Start Interview** - Go to New Interview, select type and resume, then click Start

### During Interview
- The AI interviewer asks questions one by one
- **Type** your answer in the text area, or
- **Click the microphone** to speak your answer (voice recognition)
- Click **"Listen"** to hear the question spoken aloud
- Click **"Submit Answer"** to get scored and move to the next question
- View real-time scores and feedback after each answer
- The interview has 8 questions total

### After Interview
- View detailed scores across 4 dimensions
- See radar chart of your skills breakdown
- Review per-question scores and feedback
- Read overall feedback with strengths, weaknesses, and improvement suggestions

### Dashboard
- View aggregate statistics across all interviews
- Track score trends over time (line chart)
- Compare performance by interview type (bar chart)
- See your skills radar profile

## Deployment

### Platform
- **Runtime**: Cloudflare Workers (Edge)
- **Database**: Cloudflare D1 (SQLite)
- **Status**: ✅ Active

### Local Development
```bash
npm install
npm run build
npm run db:migrate:local
npm run dev:sandbox
```

### Production Deployment
```bash
npm run build
npx wrangler d1 migrations apply ai-interviewer-db
npx wrangler pages deploy dist
```

### Environment Variables
Set in `.dev.vars` for local, or Cloudflare dashboard for production:
- `OPENAI_API_KEY` - OpenAI-compatible API key (optional, enables enhanced AI)
- `OPENAI_BASE_URL` - API base URL
- `JWT_SECRET` - Secret for JWT token signing

## Project Structure
```
webapp/
├── src/
│   ├── index.tsx          # Main Hono app entry point
│   ├── frontend.ts        # Complete React-like SPA
│   ├── ai-engine.ts       # AI question generation & analysis engine
│   └── routes/
│       ├── auth.ts         # Authentication (signup, login, JWT)
│       ├── interview.ts    # Interview CRUD & flow
│       ├── resume.ts       # Resume upload & parsing
│       ├── dashboard.ts    # Analytics & stats
│       └── ai.ts           # AI chat & tips endpoints
├── migrations/
│   └── 0001_initial_schema.sql
├── public/static/          # Static assets
├── .dev.vars               # Local env variables
├── ecosystem.config.cjs    # PM2 configuration
├── wrangler.jsonc          # Cloudflare configuration
├── vite.config.ts          # Vite build configuration
├── package.json            # Dependencies & scripts
└── README.md               # This file
```

## Last Updated
February 22, 2026
