# Kaushal Mitra — Technical Specification

> Comprehensive Implementation Specification

**Version:** 1.0
**Date:** 2026-02-01

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture Specification](#2-architecture-specification)
3. [API Specifications](#3-api-specifications)
4. [Data Models](#4-data-models)
5. [Agent Specifications](#5-agent-specifications)
6. [Prompt Engineering](#6-prompt-engineering)
7. [RAG System Specification](#7-rag-system-specification)
8. [Voice Pipeline Specification](#8-voice-pipeline-specification)
9. [WhatsApp Integration](#9-whatsapp-integration)
10. [Database Schema](#10-database-schema)
11. [Error Handling](#11-error-handling)
12. [Testing Strategy](#12-testing-strategy)
13. [Deployment Specification](#13-deployment-specification)
14. [Monitoring & Observability](#14-monitoring--observability)
15. [Implementation Checklist](#15-implementation-checklist)

---

## 1. System Overview

### 1.1 System Context Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              EXTERNAL SYSTEMS                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ WhatsApp │  │ Bhashini │  │  OpenAI  │  │  Twilio  │  │ Supabase │     │
│  │ Business │  │   APIs   │  │   API    │  │   Voice  │  │    DB    │     │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘     │
│       │             │             │             │             │            │
└───────┼─────────────┼─────────────┼─────────────┼─────────────┼────────────┘
        │             │             │             │             │
        ▼             ▼             ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           KAUSHAL MITRA SYSTEM                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         FastAPI Application                          │   │
│  │                                                                      │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐    │   │
│  │  │  Webhook   │  │   Voice    │  │    LLM     │  │    RAG     │    │   │
│  │  │  Handler   │  │  Pipeline  │  │ Orchestrator│ │   Engine   │    │   │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘    │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Data Stores                                  │   │
│  │                                                                      │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐                     │   │
│  │  │ PostgreSQL │  │  ChromaDB  │  │   Redis    │                     │   │
│  │  │  (Users)   │  │ (Vectors)  │  │  (Cache)   │                     │   │
│  │  └────────────┘  └────────────┘  └────────────┘                     │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Runtime** | Python | 3.11+ | Core application |
| **Framework** | FastAPI | 0.109+ | HTTP server, webhooks |
| **LLM Orchestration** | LangChain | 0.1+ | Agent orchestration |
| **LLM Provider** | OpenAI / Anthropic | GPT-4 / Claude 3 | Conversation AI |
| **Vector DB** | ChromaDB | 0.4+ | Course/job embeddings |
| **Database** | PostgreSQL | 15+ | User data, sessions |
| **ORM** | SQLAlchemy | 2.0+ | Database operations |
| **Cache** | Redis | 7+ | Session state, rate limiting |
| **Voice ASR** | Bhashini | - | Speech-to-text |
| **Voice TTS** | Bhashini | - | Text-to-speech |
| **Messaging** | WhatsApp Business API | Cloud | Primary channel |
| **Voice Fallback** | Twilio | - | IVR support |
| **Hosting** | Railway / Render | - | Application hosting |

---

## 2. Architecture Specification

### 2.1 Module Structure

```
kaushal-mitra/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry
│   ├── config.py               # Configuration management
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── webhooks.py         # WhatsApp/Twilio webhook handlers
│   │   ├── health.py           # Health check endpoints
│   │   └── admin.py            # Admin endpoints (optional)
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── orchestrator.py     # Main conversation orchestrator
│   │   ├── state_machine.py    # Conversation state management
│   │   └── language_detector.py # Language detection
│   │
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── skill_agent.py      # Skill extraction agent
│   │   ├── course_agent.py     # Course recommendation agent
│   │   ├── job_agent.py        # Job matching agent
│   │   └── interview_agent.py  # Mock interview agent
│   │
│   ├── voice/
│   │   ├── __init__.py
│   │   ├── bhashini.py         # Bhashini ASR/TTS client
│   │   ├── pipeline.py         # Voice processing pipeline
│   │   └── audio_utils.py      # Audio format conversion
│   │
│   ├── messaging/
│   │   ├── __init__.py
│   │   ├── whatsapp.py         # WhatsApp Business API client
│   │   └── twilio_ivr.py       # Twilio IVR handler
│   │
│   ├── rag/
│   │   ├── __init__.py
│   │   ├── embeddings.py       # Embedding generation
│   │   ├── retriever.py        # Vector search
│   │   └── indexer.py          # Data indexing
│   │
│   ├── db/
│   │   ├── __init__.py
│   │   ├── models.py           # SQLAlchemy models
│   │   ├── repository.py       # Database operations
│   │   └── migrations/         # Alembic migrations
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── user_service.py     # User profile management
│   │   ├── session_service.py  # Session management
│   │   └── resume_service.py   # Resume generation
│   │
│   └── utils/
│       ├── __init__.py
│       ├── logger.py           # Logging configuration
│       └── helpers.py          # Utility functions
│
├── data/
│   ├── courses/                # Course data (JSON/CSV)
│   ├── jobs/                   # Job data (JSON/CSV)
│   └── prompts/                # Prompt templates
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── scripts/
│   ├── seed_data.py            # Data seeding script
│   ├── index_courses.py        # Vector indexing script
│   └── test_voice.py           # Voice pipeline testing
│
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
├── .env.example
└── README.md
```

### 2.2 Request Flow Sequence

```
┌──────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ User │     │ WhatsApp │     │  FastAPI │     │  Voice   │     │   LLM    │
└──┬───┘     └────┬─────┘     └────┬─────┘     │ Pipeline │     │Orchestrator│
   │              │                │           └────┬─────┘     └────┬─────┘
   │ Voice Note   │                │                │                │
   │─────────────▶│                │                │                │
   │              │ Webhook POST   │                │                │
   │              │───────────────▶│                │                │
   │              │                │ Download Audio │                │
   │              │                │───────────────▶│                │
   │              │                │                │                │
   │              │                │                │ Bhashini ASR   │
   │              │                │                │───────────────▶│
   │              │                │                │                │
   │              │                │                │◀───────────────│
   │              │                │                │  Hindi Text    │
   │              │                │◀───────────────│                │
   │              │                │                │                │
   │              │                │ Process Message│                │
   │              │                │───────────────────────────────▶│
   │              │                │                │                │
   │              │                │                │  Query RAG     │
   │              │                │                │◀──────────────▶│
   │              │                │                │                │
   │              │                │◀───────────────────────────────│
   │              │                │ Response Text  │                │
   │              │                │                │                │
   │              │                │ Generate Audio │                │
   │              │                │───────────────▶│                │
   │              │                │                │ Bhashini TTS   │
   │              │                │                │───────────────▶│
   │              │                │◀───────────────│                │
   │              │                │ Audio File     │                │
   │              │ Send Voice     │                │                │
   │              │◀───────────────│                │                │
   │ Voice Reply  │                │                │                │
   │◀─────────────│                │                │                │
   │              │                │                │                │
```

---

## 3. API Specifications

### 3.1 Internal APIs

#### 3.1.1 Webhook Endpoint

```python
# POST /webhook/whatsapp
# Handles incoming WhatsApp messages

Request Headers:
  Content-Type: application/json
  X-Hub-Signature-256: <signature>

Request Body:
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "<WHATSAPP_BUSINESS_ACCOUNT_ID>",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "<DISPLAY_PHONE>",
          "phone_number_id": "<PHONE_NUMBER_ID>"
        },
        "messages": [{
          "from": "<USER_PHONE>",
          "id": "<MESSAGE_ID>",
          "timestamp": "<TIMESTAMP>",
          "type": "audio",
          "audio": {
            "id": "<AUDIO_ID>",
            "mime_type": "audio/ogg; codecs=opus"
          }
        }]
      },
      "field": "messages"
    }]
  }]
}

Response:
  200 OK (acknowledge receipt)
```

#### 3.1.2 Health Check

```python
# GET /health

Response:
{
  "status": "healthy",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "redis": "connected",
    "bhashini": "available",
    "openai": "available"
  }
}
```

### 3.2 External API Integrations

#### 3.2.1 Bhashini ASR API

```python
# POST https://dhruva-api.bhashini.gov.in/services/inference/pipeline

Request Headers:
  Authorization: <API_KEY>
  Content-Type: application/json

Request Body:
{
  "pipelineTasks": [{
    "taskType": "asr",
    "config": {
      "language": {
        "sourceLanguage": "hi"  # ISO 639-1 code
      },
      "serviceId": "<ASR_SERVICE_ID>",
      "audioFormat": "wav",
      "samplingRate": 16000
    }
  }],
  "inputData": {
    "audio": [{
      "audioContent": "<BASE64_ENCODED_AUDIO>"
    }]
  }
}

Response:
{
  "pipelineResponse": [{
    "taskType": "asr",
    "output": [{
      "source": "मुझे काम चाहिए"
    }]
  }]
}
```

#### 3.2.2 Bhashini TTS API

```python
# POST https://dhruva-api.bhashini.gov.in/services/inference/pipeline

Request Body:
{
  "pipelineTasks": [{
    "taskType": "tts",
    "config": {
      "language": {
        "sourceLanguage": "hi"
      },
      "serviceId": "<TTS_SERVICE_ID>",
      "gender": "female"
    }
  }],
  "inputData": {
    "input": [{
      "source": "नमस्ते! मैं कौशल मित्र हूं।"
    }]
  }
}

Response:
{
  "pipelineResponse": [{
    "taskType": "tts",
    "audio": [{
      "audioContent": "<BASE64_ENCODED_AUDIO>"
    }]
  }]
}
```

#### 3.2.3 WhatsApp Business API — Send Audio

```python
# POST https://graph.facebook.com/v18.0/<PHONE_NUMBER_ID>/messages

Request Headers:
  Authorization: Bearer <ACCESS_TOKEN>
  Content-Type: application/json

Request Body:
{
  "messaging_product": "whatsapp",
  "to": "<USER_PHONE>",
  "type": "audio",
  "audio": {
    "id": "<MEDIA_ID>"  # Pre-uploaded audio
  }
}

# Or with URL:
{
  "messaging_product": "whatsapp",
  "to": "<USER_PHONE>",
  "type": "audio",
  "audio": {
    "link": "https://example.com/audio.mp3"
  }
}
```

---

## 4. Data Models

### 4.1 User Profile

```python
from sqlalchemy import Column, String, JSON, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone_hash = Column(String(64), unique=True, index=True)  # SHA-256 hash

    # Profile data (extracted from conversation)
    education_level = Column(String(50))  # "10th", "12th", "graduate", etc.
    education_stream = Column(String(50))  # "science", "commerce", "arts"
    skills = Column(JSON)  # ["mobile_repair", "driving", "computer_basic"]
    work_experience = Column(JSON)  # [{"type": "informal", "domain": "farming", "years": 2}]
    location_preference = Column(String(20))  # "local", "city", "remote"
    job_type_preference = Column(String(20))  # "gig", "fulltime", "self_employed"

    # Language preference
    preferred_language = Column(String(10), default="hi")  # ISO 639-1

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_active_at = Column(DateTime)

    # Profile completion
    profile_complete = Column(Boolean, default=False)
    discovery_step = Column(Integer, default=0)  # 0-7 for skill discovery
```

### 4.2 Conversation Session

```python
class ConversationSession(Base):
    __tablename__ = "conversation_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    # State management
    current_state = Column(String(50))  # "greeting", "discovery", "courses", "jobs", "interview"
    context = Column(JSON)  # Conversation context for LLM

    # Timestamps
    started_at = Column(DateTime, default=datetime.utcnow)
    last_message_at = Column(DateTime)
    expires_at = Column(DateTime)  # 30 min timeout

    # Message history (last N messages for context)
    messages = Column(JSON)  # [{"role": "user", "content": "..."}, ...]
```

### 4.3 Course Data

```python
class Course(Base):
    __tablename__ = "courses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Basic info
    title = Column(String(200))
    title_hindi = Column(String(200))  # Localized title
    description = Column(Text)
    description_hindi = Column(Text)

    # Provider
    provider = Column(String(50))  # "NSDC", "NPTEL", "YouTube", "Skill India"
    provider_url = Column(String(500))

    # Details
    duration_weeks = Column(Integer)
    cost = Column(Integer, default=0)  # 0 = free
    certification = Column(Boolean, default=False)

    # Categorization
    skill_category = Column(String(100))  # "technical", "vocational", "digital"
    skills_taught = Column(JSON)  # ["data_entry", "excel", "typing"]
    education_required = Column(String(50))  # "10th", "12th", "any"

    # Languages available
    languages = Column(JSON)  # ["hi", "en", "ta"]

    # For RAG
    embedding = Column(Vector(1536))  # OpenAI embedding dimension
```

### 4.4 Job Listing

```python
class JobListing(Base):
    __tablename__ = "job_listings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Basic info
    title = Column(String(200))
    company = Column(String(200))
    description = Column(Text)

    # Location
    location_type = Column(String(20))  # "local", "city", "remote"
    city = Column(String(100))
    state = Column(String(100))

    # Details
    job_type = Column(String(20))  # "fulltime", "parttime", "gig"
    salary_min = Column(Integer)
    salary_max = Column(Integer)

    # Requirements
    education_required = Column(String(50))
    skills_required = Column(JSON)
    experience_years = Column(Integer, default=0)

    # Contact
    contact_type = Column(String(20))  # "phone", "link", "email"
    contact_value = Column(String(500))

    # Metadata
    source = Column(String(50))  # "manual", "indeed", "naukri"
    posted_at = Column(DateTime)
    expires_at = Column(DateTime)

    # For RAG
    embedding = Column(Vector(1536))
```

---

## 5. Agent Specifications

### 5.1 Agent Architecture

```python
from langchain.agents import AgentExecutor
from langchain.tools import Tool

class KaushalMitraOrchestrator:
    """Main orchestrator that routes to specialized agents."""

    def __init__(self):
        self.skill_agent = SkillExtractionAgent()
        self.course_agent = CourseRecommendationAgent()
        self.job_agent = JobMatchingAgent()
        self.interview_agent = InterviewPracticeAgent()

    async def process_message(
        self,
        user_id: str,
        message: str,
        session: ConversationSession
    ) -> str:
        """Route message to appropriate agent based on state."""

        state = session.current_state

        if state in ["greeting", "discovery"]:
            return await self.skill_agent.process(message, session)
        elif state == "courses":
            return await self.course_agent.process(message, session)
        elif state == "jobs":
            return await self.job_agent.process(message, session)
        elif state == "interview":
            return await self.interview_agent.process(message, session)
        else:
            # Intent classification for free-form requests
            intent = await self._classify_intent(message)
            return await self._route_by_intent(intent, message, session)
```

### 5.2 Skill Extraction Agent

```python
class SkillExtractionAgent:
    """Extracts user skills through conversational questions."""

    DISCOVERY_QUESTIONS = [
        {
            "step": 1,
            "field": "education_level",
            "question_hi": "सबसे पहले बताओ, तुमने कितनी पढ़ाई की है?",
            "question_en": "First tell me, how much have you studied?",
            "options": ["10th", "12th", "graduate", "other"]
        },
        {
            "step": 2,
            "field": "education_stream",
            "question_hi": "किस stream से पढ़ाई की? Science, Commerce, या Arts?",
            "question_en": "Which stream? Science, Commerce, or Arts?",
            "condition": lambda profile: profile.education_level in ["12th", "graduate"]
        },
        # ... more questions
    ]

    async def process(self, message: str, session: ConversationSession) -> str:
        """Process message and extract skills."""

        user = await self.get_user(session.user_id)
        current_step = user.discovery_step

        # Extract answer from previous question
        if current_step > 0:
            extracted = await self._extract_answer(message, current_step - 1)
            await self._update_profile(user, extracted)

        # Get next question
        next_question = self._get_next_question(user, current_step)

        if next_question:
            user.discovery_step = next_question["step"]
            await self.save_user(user)
            return next_question[f"question_{user.preferred_language}"]
        else:
            # Discovery complete
            user.profile_complete = True
            session.current_state = "profile_complete"
            return await self._generate_profile_summary(user)
```

### 5.3 Course Recommendation Agent

```python
class CourseRecommendationAgent:
    """Recommends courses based on user profile."""

    def __init__(self):
        self.retriever = CourseRetriever()
        self.llm = ChatOpenAI(model="gpt-4")

    async def process(self, message: str, session: ConversationSession) -> str:
        """Process course-related queries."""

        user = await self.get_user(session.user_id)

        # Build query from user profile
        query = self._build_course_query(user, message)

        # Retrieve relevant courses
        courses = await self.retriever.search(
            query=query,
            filters={
                "education_required": {"$lte": user.education_level},
                "cost": 0,  # Free courses first
                "languages": {"$contains": user.preferred_language}
            },
            limit=5
        )

        # Generate response
        response = await self._generate_course_response(user, courses, message)

        return response

    def _build_course_query(self, user: User, message: str) -> str:
        """Build semantic search query from user profile."""
        return f"""
        User profile:
        - Education: {user.education_level} {user.education_stream}
        - Skills: {', '.join(user.skills or [])}
        - Preference: {user.job_type_preference}

        User query: {message}

        Find relevant skill courses.
        """
```

---

## 6. Prompt Engineering

### 6.1 System Prompt — Skill Discovery

```python
SKILL_DISCOVERY_SYSTEM_PROMPT = """
You are Kaushal Mitra (कौशल मित्र), a friendly career counselor for Indian youth.

Your personality:
- Warm and encouraging, like an older sibling
- Simple language, no jargon (8th-grade vocabulary)
- Patient, never rush the user
- Celebrate small wins and existing skills

Your task:
- Extract the user's education, skills, and job preferences
- Ask ONE question at a time
- Recognize informal skills (farming, cooking, repair work)
- Always validate what you understood

Language rules:
- Respond in the same language the user speaks
- For Hindi, use simple Hindustani (avoid Sanskrit-heavy Hindi)
- Support code-mixing (Hinglish is fine)

Current user profile:
{user_profile}

Current step: {discovery_step}/7

Previous messages:
{conversation_history}
"""
```

### 6.2 System Prompt — Course Recommendation

```python
COURSE_RECOMMENDATION_PROMPT = """
You are Kaushal Mitra, helping the user find the right training courses.

User profile:
{user_profile}

Available courses (from database):
{retrieved_courses}

Your task:
- Recommend 2-3 most relevant FREE courses
- Explain why each course fits the user
- Mention duration and provider
- Offer to share links

Response format:
- Speak naturally, not like a list
- Use the user's language ({language})
- Keep response under 100 words (for TTS)

User's message: {user_message}
"""
```

### 6.3 System Prompt — Mock Interview

```python
MOCK_INTERVIEW_PROMPT = """
You are conducting a mock interview with the user.

Role being interviewed for: {job_role}
User's language: {language}

Interview stage: {stage}/5
- Stage 1: Introduction
- Stage 2: Experience questions
- Stage 3: Skill questions
- Stage 4: Situational questions
- Stage 5: Closing & feedback

Rules:
- Ask ONE question, wait for answer
- Be encouraging but realistic
- After each answer, give brief feedback
- At the end, summarize strengths and areas to improve

Previous Q&A:
{interview_history}

User's last answer: {user_answer}
"""
```

---

## 7. RAG System Specification

### 7.1 Embedding Strategy

```python
from langchain.embeddings import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter

class CourseEmbedder:
    """Generate embeddings for course data."""

    def __init__(self):
        self.embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

    def prepare_course_text(self, course: Course) -> str:
        """Prepare course text for embedding."""
        return f"""
        Title: {course.title}
        Provider: {course.provider}
        Description: {course.description}
        Skills taught: {', '.join(course.skills_taught)}
        Duration: {course.duration_weeks} weeks
        Education required: {course.education_required}
        Cost: {'Free' if course.cost == 0 else f'₹{course.cost}'}
        """

    async def embed_course(self, course: Course) -> list[float]:
        """Generate embedding for a course."""
        text = self.prepare_course_text(course)
        return await self.embeddings.aembed_query(text)
```

### 7.2 Vector Search

```python
import chromadb
from chromadb.config import Settings

class CourseRetriever:
    """Retrieve relevant courses using vector search."""

    def __init__(self):
        self.client = chromadb.Client(Settings(
            chroma_db_impl="duckdb+parquet",
            persist_directory="./data/chroma"
        ))
        self.collection = self.client.get_or_create_collection(
            name="courses",
            metadata={"hnsw:space": "cosine"}
        )
        self.embeddings = OpenAIEmbeddings()

    async def search(
        self,
        query: str,
        filters: dict = None,
        limit: int = 5
    ) -> list[Course]:
        """Search for relevant courses."""

        query_embedding = await self.embeddings.aembed_query(query)

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=limit,
            where=filters
        )

        return self._results_to_courses(results)
```

### 7.3 Course Data Schema (for indexing)

```json
// data/courses/nsdc_courses.json
[
  {
    "id": "nsdc-001",
    "title": "Mobile Phone Hardware Repair Technician",
    "title_hi": "मोबाइल फोन हार्डवेयर रिपेयर टेक्नीशियन",
    "provider": "NSDC",
    "provider_url": "https://www.nsdcindia.org/course/...",
    "description": "Learn to diagnose and repair mobile phone hardware issues...",
    "description_hi": "मोबाइल फोन हार्डवेयर की समस्याओं को पहचानना और ठीक करना सीखें...",
    "duration_weeks": 2,
    "cost": 0,
    "certification": true,
    "skill_category": "technical",
    "skills_taught": ["mobile_repair", "electronics_basic", "troubleshooting"],
    "education_required": "10th",
    "languages": ["hi", "en"]
  }
]
```

---

## 8. Voice Pipeline Specification

### 8.1 Bhashini Client

```python
import aiohttp
import base64

class BhashiniClient:
    """Client for Bhashini ASR and TTS APIs."""

    BASE_URL = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"

    def __init__(self, api_key: str, user_id: str):
        self.api_key = api_key
        self.user_id = user_id
        self.service_ids = self._load_service_ids()

    async def speech_to_text(
        self,
        audio_bytes: bytes,
        language: str = "hi"
    ) -> str:
        """Convert speech to text using Bhashini ASR."""

        audio_base64 = base64.b64encode(audio_bytes).decode()

        payload = {
            "pipelineTasks": [{
                "taskType": "asr",
                "config": {
                    "language": {"sourceLanguage": language},
                    "serviceId": self.service_ids["asr"][language],
                    "audioFormat": "wav",
                    "samplingRate": 16000
                }
            }],
            "inputData": {
                "audio": [{"audioContent": audio_base64}]
            }
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(
                self.BASE_URL,
                json=payload,
                headers={"Authorization": self.api_key}
            ) as response:
                result = await response.json()
                return result["pipelineResponse"][0]["output"][0]["source"]

    async def text_to_speech(
        self,
        text: str,
        language: str = "hi",
        gender: str = "female"
    ) -> bytes:
        """Convert text to speech using Bhashini TTS."""

        payload = {
            "pipelineTasks": [{
                "taskType": "tts",
                "config": {
                    "language": {"sourceLanguage": language},
                    "serviceId": self.service_ids["tts"][language],
                    "gender": gender
                }
            }],
            "inputData": {
                "input": [{"source": text}]
            }
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(
                self.BASE_URL,
                json=payload,
                headers={"Authorization": self.api_key}
            ) as response:
                result = await response.json()
                audio_base64 = result["pipelineResponse"][0]["audio"][0]["audioContent"]
                return base64.b64decode(audio_base64)
```

### 8.2 Audio Format Conversion

```python
from pydub import AudioSegment
import io

class AudioConverter:
    """Convert between audio formats."""

    @staticmethod
    def ogg_to_wav(ogg_bytes: bytes) -> bytes:
        """Convert OGG (WhatsApp format) to WAV (Bhashini format)."""
        audio = AudioSegment.from_ogg(io.BytesIO(ogg_bytes))
        audio = audio.set_frame_rate(16000).set_channels(1)

        wav_buffer = io.BytesIO()
        audio.export(wav_buffer, format="wav")
        return wav_buffer.getvalue()

    @staticmethod
    def wav_to_mp3(wav_bytes: bytes) -> bytes:
        """Convert WAV to MP3 for WhatsApp delivery."""
        audio = AudioSegment.from_wav(io.BytesIO(wav_bytes))

        mp3_buffer = io.BytesIO()
        audio.export(mp3_buffer, format="mp3", bitrate="64k")
        return mp3_buffer.getvalue()
```

### 8.3 Voice Pipeline

```python
class VoicePipeline:
    """End-to-end voice processing pipeline."""

    def __init__(self):
        self.bhashini = BhashiniClient(
            api_key=os.getenv("BHASHINI_API_KEY"),
            user_id=os.getenv("BHASHINI_USER_ID")
        )
        self.converter = AudioConverter()
        self.language_detector = LanguageDetector()

    async def process_voice_message(
        self,
        audio_bytes: bytes,
        user_language: str = None
    ) -> tuple[str, str]:
        """
        Process incoming voice message.
        Returns: (transcribed_text, detected_language)
        """
        # Convert OGG to WAV
        wav_audio = self.converter.ogg_to_wav(audio_bytes)

        # Detect language if not known
        if not user_language:
            user_language = await self.language_detector.detect(wav_audio)

        # Transcribe
        text = await self.bhashini.speech_to_text(wav_audio, user_language)

        return text, user_language

    async def generate_voice_response(
        self,
        text: str,
        language: str
    ) -> bytes:
        """Generate voice response from text."""

        # Generate speech
        wav_audio = await self.bhashini.text_to_speech(text, language)

        # Convert to MP3 for WhatsApp
        mp3_audio = self.converter.wav_to_mp3(wav_audio)

        return mp3_audio
```

---

## 9. WhatsApp Integration

### 9.1 Webhook Handler

```python
from fastapi import APIRouter, Request, HTTPException
import hmac
import hashlib

router = APIRouter()

@router.post("/webhook/whatsapp")
async def whatsapp_webhook(request: Request):
    """Handle incoming WhatsApp messages."""

    # Verify signature
    signature = request.headers.get("X-Hub-Signature-256", "")
    body = await request.body()

    if not verify_signature(body, signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    data = await request.json()

    # Process each message
    for entry in data.get("entry", []):
        for change in entry.get("changes", []):
            if change.get("field") == "messages":
                value = change.get("value", {})
                messages = value.get("messages", [])

                for message in messages:
                    await process_message(message, value.get("metadata", {}))

    return {"status": "ok"}


@router.get("/webhook/whatsapp")
async def verify_webhook(request: Request):
    """Verify webhook for WhatsApp."""

    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")

    if mode == "subscribe" and token == os.getenv("WHATSAPP_VERIFY_TOKEN"):
        return int(challenge)

    raise HTTPException(status_code=403, detail="Verification failed")


def verify_signature(payload: bytes, signature: str) -> bool:
    """Verify WhatsApp webhook signature."""
    expected = hmac.new(
        os.getenv("WHATSAPP_APP_SECRET").encode(),
        payload,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(f"sha256={expected}", signature)
```

### 9.2 WhatsApp Client

```python
import aiohttp

class WhatsAppClient:
    """Client for WhatsApp Business API."""

    BASE_URL = "https://graph.facebook.com/v18.0"

    def __init__(self, phone_number_id: str, access_token: str):
        self.phone_number_id = phone_number_id
        self.access_token = access_token

    async def send_audio(self, to: str, audio_bytes: bytes) -> dict:
        """Send audio message to user."""

        # First, upload media
        media_id = await self._upload_media(audio_bytes, "audio/mpeg")

        # Then send message
        url = f"{self.BASE_URL}/{self.phone_number_id}/messages"

        payload = {
            "messaging_product": "whatsapp",
            "to": to,
            "type": "audio",
            "audio": {"id": media_id}
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(
                url,
                json=payload,
                headers={"Authorization": f"Bearer {self.access_token}"}
            ) as response:
                return await response.json()

    async def send_text(self, to: str, text: str) -> dict:
        """Send text message to user."""

        url = f"{self.BASE_URL}/{self.phone_number_id}/messages"

        payload = {
            "messaging_product": "whatsapp",
            "to": to,
            "type": "text",
            "text": {"body": text}
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(
                url,
                json=payload,
                headers={"Authorization": f"Bearer {self.access_token}"}
            ) as response:
                return await response.json()

    async def download_media(self, media_id: str) -> bytes:
        """Download media from WhatsApp."""

        # Get media URL
        url = f"{self.BASE_URL}/{media_id}"

        async with aiohttp.ClientSession() as session:
            async with session.get(
                url,
                headers={"Authorization": f"Bearer {self.access_token}"}
            ) as response:
                data = await response.json()
                media_url = data["url"]

            # Download actual media
            async with session.get(
                media_url,
                headers={"Authorization": f"Bearer {self.access_token}"}
            ) as response:
                return await response.read()

    async def _upload_media(self, data: bytes, mime_type: str) -> str:
        """Upload media to WhatsApp."""

        url = f"{self.BASE_URL}/{self.phone_number_id}/media"

        form = aiohttp.FormData()
        form.add_field("file", data, content_type=mime_type)
        form.add_field("messaging_product", "whatsapp")

        async with aiohttp.ClientSession() as session:
            async with session.post(
                url,
                data=form,
                headers={"Authorization": f"Bearer {self.access_token}"}
            ) as response:
                result = await response.json()
                return result["id"]
```

---

## 10. Database Schema

### 10.1 PostgreSQL Schema

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_hash VARCHAR(64) UNIQUE NOT NULL,

    -- Profile data
    education_level VARCHAR(50),
    education_stream VARCHAR(50),
    skills JSONB DEFAULT '[]',
    work_experience JSONB DEFAULT '[]',
    location_preference VARCHAR(20),
    job_type_preference VARCHAR(20),

    -- Language
    preferred_language VARCHAR(10) DEFAULT 'hi',

    -- State
    profile_complete BOOLEAN DEFAULT FALSE,
    discovery_step INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_active_at TIMESTAMP
);

CREATE INDEX idx_users_phone_hash ON users(phone_hash);

-- Conversation sessions
CREATE TABLE conversation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),

    current_state VARCHAR(50) DEFAULT 'greeting',
    context JSONB DEFAULT '{}',
    messages JSONB DEFAULT '[]',

    started_at TIMESTAMP DEFAULT NOW(),
    last_message_at TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE INDEX idx_sessions_user_id ON conversation_sessions(user_id);
CREATE INDEX idx_sessions_expires ON conversation_sessions(expires_at);

-- Courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title VARCHAR(200) NOT NULL,
    title_hindi VARCHAR(200),
    description TEXT,
    description_hindi TEXT,

    provider VARCHAR(50) NOT NULL,
    provider_url VARCHAR(500),

    duration_weeks INTEGER,
    cost INTEGER DEFAULT 0,
    certification BOOLEAN DEFAULT FALSE,

    skill_category VARCHAR(100),
    skills_taught JSONB DEFAULT '[]',
    education_required VARCHAR(50),
    languages JSONB DEFAULT '["en"]',

    created_at TIMESTAMP DEFAULT NOW()
);

-- Job listings table
CREATE TABLE job_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title VARCHAR(200) NOT NULL,
    company VARCHAR(200),
    description TEXT,

    location_type VARCHAR(20),
    city VARCHAR(100),
    state VARCHAR(100),

    job_type VARCHAR(20),
    salary_min INTEGER,
    salary_max INTEGER,

    education_required VARCHAR(50),
    skills_required JSONB DEFAULT '[]',
    experience_years INTEGER DEFAULT 0,

    contact_type VARCHAR(20),
    contact_value VARCHAR(500),

    source VARCHAR(50),
    posted_at TIMESTAMP,
    expires_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW()
);

-- Analytics events
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),

    event_type VARCHAR(50) NOT NULL,
    event_data JSONB DEFAULT '{}',

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created ON analytics_events(created_at);
```

---

## 11. Error Handling

### 11.1 Error Types

```python
class KaushalMitraError(Exception):
    """Base exception for Kaushal Mitra."""
    pass

class VoiceProcessingError(KaushalMitraError):
    """Error in voice processing pipeline."""
    pass

class ASRError(VoiceProcessingError):
    """Error in speech-to-text conversion."""
    pass

class TTSError(VoiceProcessingError):
    """Error in text-to-speech conversion."""
    pass

class LLMError(KaushalMitraError):
    """Error from LLM provider."""
    pass

class DatabaseError(KaushalMitraError):
    """Database operation error."""
    pass

class WhatsAppError(KaushalMitraError):
    """WhatsApp API error."""
    pass
```

### 11.2 Error Handling Strategy

```python
FALLBACK_RESPONSES = {
    "hi": {
        "asr_error": "माफ़ कीजिए, आवाज़ साफ़ नहीं आई। कृपया फिर से बोलें।",
        "llm_error": "अभी कुछ तकनीकी समस्या है। कृपया थोड़ी देर बाद कोशिश करें।",
        "general_error": "कुछ गड़बड़ हो गई। कृपया फिर से कोशिश करें।"
    },
    "en": {
        "asr_error": "Sorry, I couldn't hear you clearly. Please try again.",
        "llm_error": "There's a technical issue. Please try again later.",
        "general_error": "Something went wrong. Please try again."
    }
}

async def handle_message_with_errors(message: dict, metadata: dict):
    """Process message with comprehensive error handling."""

    user_phone = message["from"]
    language = await get_user_language(user_phone) or "hi"

    try:
        await process_message_internal(message, metadata)

    except ASRError as e:
        logger.error(f"ASR error for {user_phone}: {e}")
        await send_fallback_response(user_phone, "asr_error", language)

    except LLMError as e:
        logger.error(f"LLM error for {user_phone}: {e}")
        await send_fallback_response(user_phone, "llm_error", language)

    except Exception as e:
        logger.exception(f"Unexpected error for {user_phone}: {e}")
        await send_fallback_response(user_phone, "general_error", language)
```

---

## 12. Testing Strategy

### 12.1 Unit Tests

```python
# tests/unit/test_skill_extraction.py

import pytest
from app.agents.skill_agent import SkillExtractionAgent

class TestSkillExtraction:

    @pytest.fixture
    def agent(self):
        return SkillExtractionAgent()

    async def test_extract_education_level(self, agent):
        """Test extraction of education level from Hindi text."""

        test_cases = [
            ("main 10th pass hoon", "10th"),
            ("12th kiya hai science se", "12th"),
            ("graduation complete hai", "graduate"),
            ("BA kiya hai", "graduate"),
        ]

        for text, expected in test_cases:
            result = await agent._extract_education(text)
            assert result == expected, f"Failed for: {text}"

    async def test_extract_skills(self, agent):
        """Test extraction of informal skills."""

        text = "Main gaadi chalata hoon aur mobile repair bhi aata hai"
        skills = await agent._extract_skills(text)

        assert "driving" in skills
        assert "mobile_repair" in skills
```

### 12.2 Integration Tests

```python
# tests/integration/test_voice_pipeline.py

import pytest
from app.voice.pipeline import VoicePipeline

class TestVoicePipeline:

    @pytest.fixture
    def pipeline(self):
        return VoicePipeline()

    async def test_hindi_transcription(self, pipeline):
        """Test Hindi voice transcription."""

        # Load test audio file
        with open("tests/fixtures/hindi_sample.ogg", "rb") as f:
            audio_bytes = f.read()

        text, language = await pipeline.process_voice_message(audio_bytes)

        assert language == "hi"
        assert len(text) > 0

    async def test_tts_generation(self, pipeline):
        """Test Hindi TTS generation."""

        text = "नमस्ते, मैं कौशल मित्र हूं"
        audio = await pipeline.generate_voice_response(text, "hi")

        assert len(audio) > 0
        assert audio[:3] == b"ID3"  # MP3 header
```

### 12.3 End-to-End Tests

```python
# tests/e2e/test_conversation_flow.py

import pytest
from app.core.orchestrator import KaushalMitraOrchestrator

class TestConversationFlow:

    async def test_complete_discovery_flow(self):
        """Test complete skill discovery conversation."""

        orchestrator = KaushalMitraOrchestrator()
        user_id = "test_user_123"

        # Simulate conversation
        messages = [
            "Namaste, mujhe kaam chahiye",
            "12th pass hoon science se",
            "Haan computer aata hai",
            "Ghar se kaam karna hai",
            "Full time job chahiye"
        ]

        for message in messages:
            response = await orchestrator.process_text_message(user_id, message)
            assert len(response) > 0

        # Verify profile was created
        user = await get_user(user_id)
        assert user.profile_complete == True
        assert user.education_level == "12th"
        assert user.education_stream == "science"
```

---

## 13. Deployment Specification

### 13.1 Environment Variables

```bash
# .env.example

# Application
APP_ENV=development
APP_DEBUG=true
APP_SECRET_KEY=your-secret-key-here

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/kaushal_mitra
REDIS_URL=redis://localhost:6379

# Bhashini
BHASHINI_API_KEY=your-bhashini-api-key
BHASHINI_USER_ID=your-bhashini-user-id

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# WhatsApp
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_VERIFY_TOKEN=your-verify-token
WHATSAPP_APP_SECRET=your-app-secret

# Twilio (optional)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### 13.2 Docker Configuration

```dockerfile
# Dockerfile

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# docker-compose.yml

version: '3.8'

services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/kaushal_mitra
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - ./data:/app/data

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: kaushal_mitra
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  chroma:
    image: chromadb/chroma:latest
    ports:
      - "8001:8000"
    volumes:
      - chroma_data:/chroma/chroma

volumes:
  postgres_data:
  redis_data:
  chroma_data:
```

### 13.3 Railway Deployment

```toml
# railway.toml

[build]
builder = "dockerfile"

[deploy]
startCommand = "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
healthcheckTimeout = 30

[env]
APP_ENV = "production"
```

---

## 14. Monitoring & Observability

### 14.1 Logging Configuration

```python
# app/utils/logger.py

import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    """JSON log formatter for structured logging."""

    def format(self, record):
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
        }

        if hasattr(record, "user_id"):
            log_data["user_id"] = record.user_id

        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_data)

def setup_logging():
    """Configure application logging."""

    logger = logging.getLogger("kaushal_mitra")
    logger.setLevel(logging.INFO)

    handler = logging.StreamHandler()
    handler.setFormatter(JSONFormatter())
    logger.addHandler(handler)

    return logger
```

### 14.2 Metrics

```python
# Key metrics to track

METRICS = {
    # User metrics
    "users_total": "Total registered users",
    "users_active_daily": "Daily active users",
    "profiles_completed": "Users who completed skill discovery",

    # Conversation metrics
    "messages_received": "Total voice messages received",
    "messages_processed": "Successfully processed messages",
    "avg_response_time_ms": "Average response latency",

    # Feature metrics
    "courses_recommended": "Course recommendations made",
    "courses_clicked": "Course links clicked",
    "interviews_practiced": "Mock interviews completed",
    "jobs_matched": "Job matches shown",

    # Error metrics
    "asr_errors": "Speech recognition failures",
    "tts_errors": "Speech synthesis failures",
    "llm_errors": "LLM API failures",

    # Language metrics
    "messages_by_language": "Messages per language",
}
```

---

## 15. Implementation Checklist

### 15.1 MVP Checklist

```markdown
## Phase 1: Setup (Hours 0-4)
- [ ] Initialize FastAPI project structure
- [ ] Set up PostgreSQL database
- [ ] Set up Redis for caching
- [ ] Configure WhatsApp Business API webhook
- [ ] Get Bhashini API credentials
- [ ] Set up OpenAI API

## Phase 2: Voice Pipeline (Hours 4-12)
- [ ] Implement Bhashini ASR client
- [ ] Implement Bhashini TTS client
- [ ] Implement audio format conversion (OGG ↔ WAV ↔ MP3)
- [ ] Build voice processing pipeline
- [ ] Test Hindi voice round-trip
- [ ] Add language detection

## Phase 3: Conversation Engine (Hours 12-20)
- [ ] Implement user profile model
- [ ] Implement session management
- [ ] Build skill discovery agent
- [ ] Build course recommendation agent
- [ ] Implement RAG for course search
- [ ] Seed course data (50-100 courses)

## Phase 4: Integration (Hours 20-28)
- [ ] Connect WhatsApp webhook to pipeline
- [ ] Implement end-to-end message flow
- [ ] Add mock interview agent (basic)
- [ ] Add job matching (static data)
- [ ] Test with multiple languages

## Phase 5: Polish & Demo (Hours 28-36)
- [ ] Error handling and fallbacks
- [ ] Edge case testing
- [ ] Record demo video
- [ ] Prepare pitch deck
- [ ] Deploy to Railway/Render
- [ ] Final testing on deployed version
```

### 15.2 Demo Checklist

```markdown
## Demo Video Requirements
- [ ] 2-3 minutes total length
- [ ] Shows problem statement (30 sec)
- [ ] Shows skill discovery flow (45 sec)
- [ ] Shows course recommendation (30 sec)
- [ ] Shows mock interview (30 sec)
- [ ] Shows impact/conclusion (15 sec)
- [ ] Clear audio and visuals
- [ ] Hindi + 1 regional language demo

## Pitch Deck Requirements
- [ ] Problem slide with statistics
- [ ] Solution overview
- [ ] Demo screenshots/GIFs
- [ ] Technical architecture diagram
- [ ] Impact metrics
- [ ] Business model (future)
- [ ] Team slide
```

---

## Appendix A: Bhashini Language Codes

| Language | ISO Code | ASR Available | TTS Available |
|----------|----------|---------------|---------------|
| Assamese | as | ✅ | ✅ |
| Bengali | bn | ✅ | ✅ |
| Bodo | brx | ✅ | ⚠️ |
| Dogri | doi | ✅ | ⚠️ |
| Gujarati | gu | ✅ | ✅ |
| Hindi | hi | ✅ | ✅ |
| Kannada | kn | ✅ | ✅ |
| Kashmiri | ks | ⚠️ | ⚠️ |
| Konkani | kok | ⚠️ | ⚠️ |
| Maithili | mai | ✅ | ⚠️ |
| Malayalam | ml | ✅ | ✅ |
| Manipuri | mni | ⚠️ | ⚠️ |
| Marathi | mr | ✅ | ✅ |
| Nepali | ne | ✅ | ⚠️ |
| Odia | or | ✅ | ✅ |
| Punjabi | pa | ✅ | ✅ |
| Sanskrit | sa | ⚠️ | ⚠️ |
| Santali | sat | ⚠️ | ⚠️ |
| Sindhi | sd | ⚠️ | ⚠️ |
| Tamil | ta | ✅ | ✅ |
| Telugu | te | ✅ | ✅ |
| Urdu | ur | ✅ | ✅ |

✅ = Full support | ⚠️ = Limited/Beta support

---

## Appendix B: Sample Course Data

```json
[
  {
    "id": "nsdc-mobile-repair",
    "title": "Mobile Phone Hardware Repair Technician",
    "title_hi": "मोबाइल फोन हार्डवेयर रिपेयर टेक्नीशियन",
    "provider": "NSDC",
    "duration_weeks": 2,
    "cost": 0,
    "skills_taught": ["mobile_repair", "electronics", "troubleshooting"],
    "education_required": "10th"
  },
  {
    "id": "nptel-python",
    "title": "Programming in Python",
    "title_hi": "पायथन प्रोग्रामिंग",
    "provider": "NPTEL",
    "duration_weeks": 8,
    "cost": 0,
    "skills_taught": ["python", "programming", "data_structures"],
    "education_required": "12th"
  },
  {
    "id": "skillind-electrician",
    "title": "Domestic Electrician",
    "title_hi": "घरेलू इलेक्ट्रीशियन",
    "provider": "Skill India",
    "duration_weeks": 4,
    "cost": 0,
    "skills_taught": ["electrical", "wiring", "safety"],
    "education_required": "10th"
  }
]
```

---

*End of Technical Specification*
