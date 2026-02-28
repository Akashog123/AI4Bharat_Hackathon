# Sahaj Web App Prototype - Design Document

**Date:** 2026-02-28
**Status:** Approved
**Goal:** Demo-ready prototype that real users can also test

---

## 1. Summary

Build a web-based voice-first career counselor for Indian youth. Users speak in their language, the system extracts skills, recommends courses, matches jobs, conducts mock interviews, and generates resumes -- all through voice conversation with a visual dashboard.

## 2. Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js + shadcn/ui + Tailwind CSS | Dashboard web app |
| Frontend hosting | AWS Amplify | Static site hosting + CI/CD |
| Backend | FastAPI (Python 3.11+) | API server + WebSocket |
| Backend hosting | AWS ECS Fargate (or EC2) | Container hosting |
| LLM | AWS Bedrock (Claude) | Conversation AI |
| ASR | Sarvam AI Saaras v3 | Speech-to-text (22 Indian languages) |
| TTS | Sarvam AI Bulbul v3 | Text-to-speech (11 languages) |
| RAG | Amazon Bedrock Knowledge Bases | Course/job vector search |
| Database | Amazon RDS PostgreSQL | Users, sessions, history |
| Storage | Amazon S3 | Course data, audio files, resumes |
| Resume PDF | ReportLab (Python) | PDF generation with Devanagari support |

## 3. Architecture

```
┌─────────────────────────────────────────────────────────┐
│              NEXT.JS FRONTEND (AWS Amplify)               │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌────────┐  ┌──────────┐  │
│  │  Voice   │  │  Profile  │  │ Course │  │  Resume  │  │
│  │  Chat    │  │  Panel    │  │ & Jobs │  │  Panel   │  │
│  │  Panel   │  │          │  │ Panel  │  │          │  │
│  └────┬─────┘  └──────────┘  └────────┘  └──────────┘  │
│       │ WebSocket (streaming audio + JSON)               │
└───────┼──────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│           FASTAPI BACKEND (AWS ECS Fargate)               │
│                                                          │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐  │
│  │ Voice Pipeline│  │ LLM Orchestr  │  │ Resume Gen   │  │
│  │ Sarvam AI    │  │ AWS Bedrock   │  │ ReportLab    │  │
│  │ ASR + TTS    │  │ (Claude)      │  │              │  │
│  └──────────────┘  └───────────────┘  └──────────────┘  │
│                                                          │
│  ┌──────────────────────────┐  ┌──────────────────────┐  │
│  │ Amazon Bedrock           │  │ Amazon S3            │  │
│  │ Knowledge Bases (RAG)    │  │ (data, audio,        │  │
│  │ courses + jobs vectors   │  │  resumes)            │  │
│  └──────────────────────────┘  └──────────────────────┘  │
│                                                          │
│  ┌──────────────────────────┐                            │
│  │ Amazon RDS PostgreSQL    │                            │
│  │ (users, sessions)        │                            │
│  └──────────────────────────┘                            │
└─────────────────────────────────────────────────────────┘
```

## 4. Voice Data Flow (WebSocket)

1. User clicks mic -> browser opens WebSocket to `/ws/voice`
2. Browser records audio using WebAudio API, streams chunks to backend
3. On speech end (silence detection): backend sends full audio to Sarvam ASR (Saaras v3)
4. Transcribed text + session context -> AWS Bedrock Claude
5. Claude returns structured response: conversation text + profile updates + recommendations
6. Response text -> Sarvam TTS (Bulbul v3) -> audio
7. Backend streams JSON over WebSocket:
   ```json
   {
     "transcript": "User's speech as text",
     "response_text": "Sahaj's reply",
     "response_audio": "<base64 encoded audio>",
     "profile_update": {"education_level": "12th", "skills": ["mobile_repair"]},
     "courses": [{"title": "...", "provider": "NSDC", "duration": "2 weeks"}],
     "jobs": [...],
     "state": "discovery"
   }
   ```
8. Frontend plays audio + updates dashboard panels in real-time

## 5. Frontend Design

### Layout
- **Left panel (40%)**: Voice chat with message bubbles, audio waveform, mic button + text input
- **Right panel (60%)**: Tabbed dashboard (Profile, Courses, Jobs, Interview, Resume)
- **Top bar**: Language selector, settings

### Pre-built Components (shadcn/ui)
| Component | Source |
|-----------|--------|
| Chat interface | shadcn-chat template |
| Dashboard layout | shadcn Sidebar + Tabs |
| Profile cards | shadcn Card + Badge |
| Course/Job listings | shadcn Card + Badge |
| Audio waveform | wavesurfer.js |
| Language selector | shadcn Select |
| Resume preview | react-pdf |
| Icons | Lucide icons |

### Pages
- `/` - Landing page with "Start Counseling" CTA
- `/app` - Main dashboard (voice chat + panels)
- `/resume/[id]` - Resume preview + download

## 6. Backend API Design

### REST Endpoints
```
POST   /api/auth/register        # Register user
GET    /api/profile               # Get user profile
PUT    /api/profile               # Update profile
GET    /api/courses               # Get recommended courses
GET    /api/jobs                  # Get matched jobs
POST   /api/resume/generate       # Generate resume PDF
GET    /api/resume/download/{id}  # Download resume PDF
GET    /api/session/history       # Conversation history
GET    /api/health                # Health check
```

### WebSocket
```
WS     /ws/voice                  # Bidirectional voice streaming
```

## 7. Conversation State Machine

```
GREETING
    │
    ▼
DISCOVERY (5-7 guided questions)
    │  - Education level
    │  - Skills (formal + informal)
    │  - Work experience
    │  - Location preference
    │  - Job type preference
    ▼
PROFILE_COMPLETE
    │
    ├──> COURSES (RAG-powered recommendations)
    ├──> JOBS (RAG-powered matching)
    ├──> INTERVIEW (mock interview via voice)
    └──> RESUME (generate + download PDF)
    │
    ▼
FOLLOW_UP (loop back to refine)
```

## 8. LLM Orchestration

Claude via Bedrock with structured output. Each response returns:
- `conversation_text`: Natural language reply for TTS
- `profile_updates`: Extracted structured data (skills, education, etc.)
- `state_transition`: Next conversation state
- `recommendations`: Courses/jobs if applicable

System prompts per state (from existing design.md): Skill Discovery, Course Recommendation, Mock Interview, Resume Builder.

## 9. Data

### Seed Data
- ~50-100 curated courses (NSDC, NPTEL, YouTube, Skill India) as JSON
- ~30-50 sample jobs across categories
- Uploaded to S3, ingested by Bedrock Knowledge Bases

### Database Schema (PostgreSQL)
- `users`: id, phone_hash, education, skills (JSON), preferences, language, created_at
- `sessions`: id, user_id, state, messages (JSON), started_at, last_active_at
- `resumes`: id, user_id, s3_path, generated_at

## 10. Language Support

| Feature | Languages |
|---------|-----------|
| ASR (Saaras v3) | 22 Indian + English |
| TTS (Bulbul v3) | Hindi, Bengali, Tamil, Telugu, Kannada, Malayalam, Marathi, Gujarati, Punjabi, Odia, English |
| LLM (Claude) | All languages (responds in user's language) |
| Fallback | For TTS-unsupported languages: text-only response |

## 11. Project Structure

```
sahaj/
├── frontend/                    # Next.js app
│   ├── app/
│   │   ├── page.tsx             # Landing page
│   │   ├── app/page.tsx         # Main dashboard
│   │   └── resume/[id]/page.tsx # Resume preview
│   ├── components/
│   │   ├── voice-chat/          # Chat panel components
│   │   ├── dashboard/           # Right panel components
│   │   └── ui/                  # shadcn/ui components
│   ├── lib/
│   │   ├── websocket.ts         # WebSocket client
│   │   └── audio.ts             # Audio recording/playback
│   └── package.json
│
├── backend/                     # FastAPI app
│   ├── app/
│   │   ├── main.py              # FastAPI entry
│   │   ├── config.py            # Settings
│   │   ├── api/
│   │   │   ├── routes.py        # REST endpoints
│   │   │   └── websocket.py     # WebSocket handler
│   │   ├── voice/
│   │   │   ├── sarvam.py        # Sarvam AI client
│   │   │   └── pipeline.py      # Voice processing
│   │   ├── llm/
│   │   │   ├── orchestrator.py  # Conversation orchestrator
│   │   │   ├── prompts.py       # System prompts
│   │   │   └── bedrock.py       # AWS Bedrock client
│   │   ├── rag/
│   │   │   └── knowledge.py     # Bedrock Knowledge Bases
│   │   ├── services/
│   │   │   ├── user.py          # User management
│   │   │   ├── session.py       # Session management
│   │   │   └── resume.py        # Resume generation
│   │   └── db/
│   │       ├── models.py        # SQLAlchemy models
│   │       └── database.py      # DB connection
│   ├── data/
│   │   ├── courses.json         # Seed course data
│   │   ├── jobs.json            # Seed job data
│   │   └── prompts/             # Prompt templates
│   ├── requirements.txt
│   └── Dockerfile
│
├── docs/
│   └── plans/
│       └── 2026-02-28-sahaj-webapp-prototype-design.md
│
├── docker-compose.yml
└── README.md
```

## 12. Error Handling

| Scenario | Handling |
|----------|---------|
| Unclear audio | Sarvam returns low confidence -> ask user to repeat |
| TTS language unsupported | Fall back to text-only response |
| Bedrock timeout | Retry once, then return cached/fallback response |
| WebSocket disconnect | Auto-reconnect with session preservation |
| No course/job matches | Return "no exact match" with similar options |

## 13. Success Criteria

1. User can speak in Hindi and get voice reply within 5 seconds
2. Skill discovery completes in 5-7 conversational turns
3. Course recommendations are relevant to extracted profile
4. Resume generates as downloadable PDF
5. Dashboard updates live as conversation progresses
6. Works in at least 3 languages (Hindi + 2 regional)
7. Demo-worthy: smooth enough for a 3-minute presentation
