# Sahaj (सहज): Voice-First AI Career Counselor - Design Document

> Comprehensive Technical Design

**Version:** 1.0  
**Date:** 2026-02-01  
**Track:** AI for Communities, Access & Public Impact

---

## 1. System Architecture Overview

Sahaj is built as a cloud-native system using FastAPI that integrates with WhatsApp Business API and Bhashini to provide voice-first career counseling in multiple Indian languages.

### 1.1 High-Level Architecture

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
│                           SAHAJ SYSTEM                                      │
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

## 2. Module Structure

```
sahaj/
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

## 3. Request Flow Sequence

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

## 4. Core Components Design

### 4.1 WhatsApp Integration Layer

**Purpose**: Handle all WhatsApp Business API interactions  
**Technology**: FastAPI with WhatsApp Business API

**Key Components**:
- **Webhook Handler**: Receives incoming messages from WhatsApp
- **Message Sender**: Sends voice and text responses to users
- **Media Handler**: Processes voice message uploads and downloads
- **Session Manager**: Maintains conversation state per user

**API Endpoints**:
```python
POST /webhook/whatsapp - Receive WhatsApp messages
GET /webhook/whatsapp - Verify webhook
POST /send/voice - Send voice message to user
POST /send/text - Send text message to user
GET /health - Health check endpoint
```

### 4.2 Voice Processing Service

**Purpose**: Convert speech to text and text to speech using Bhashini  
**Technology**: Python with Bhashini APIs

**Key Components**:
- **Speech-to-Text Engine**: Converts voice messages to text via Bhashini ASR
- **Text-to-Speech Engine**: Generates natural voice responses via Bhashini TTS
- **Audio Processor**: Handles audio format conversion (OGG to WAV, WAV to MP3)
- **Language Detector**: Identifies spoken language automatically

**Processing Pipeline**:
1. Receive voice message from WhatsApp (OGG format)
2. Convert OGG to WAV (16kHz, mono)
3. Detect language if not known
4. Convert to text using Bhashini ASR
5. Return transcribed text with confidence score

**Bhashini Integration**:
```python
# ASR API Call
POST https://dhruva-api.bhashini.gov.in/services/inference/pipeline
{
  "pipelineTasks": [{
    "taskType": "asr",
    "config": {
      "language": {"sourceLanguage": "hi"},
      "serviceId": "<ASR_SERVICE_ID>",
      "audioFormat": "wav",
      "samplingRate": 16000
    }
  }],
  "inputData": {
    "audio": [{"audioContent": "<BASE64_AUDIO>"}]
  }
}

# TTS API Call
POST https://dhruva-api.bhashini.gov.in/services/inference/pipeline
{
  "pipelineTasks": [{
    "taskType": "tts",
    "config": {
      "language": {"sourceLanguage": "hi"},
      "serviceId": "<TTS_SERVICE_ID>",
      "gender": "female"
    }
  }],
  "inputData": {
    "input": [{"source": "नमस्ते! मैं सहज हूं।"}]
  }
}
```

### 4.3 LLM Orchestration Layer

**Purpose**: Manage conversation flow and route to specialized agents  
**Technology**: LangChain with OpenAI/Anthropic

**Key Components**:
- **Orchestrator**: Routes messages to appropriate agents based on state
- **Skill Agent**: Extracts user skills through conversational questions
- **Course Agent**: Recommends courses based on user profile
- **Job Agent**: Matches users with job opportunities
- **Interview Agent**: Conducts mock interviews

**Agent Architecture**:
```python
class SahajOrchestrator:
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
```

### 4.4 RAG System

**Purpose**: Retrieve relevant courses and jobs using vector search  
**Technology**: ChromaDB with OpenAI embeddings

**Key Components**:
- **Embedder**: Generates embeddings for courses and jobs
- **Retriever**: Performs semantic search
- **Indexer**: Indexes course and job data

**Vector Search Flow**:
```python
class CourseRetriever:
    """Retrieve relevant courses using vector search."""

    def __init__(self):
        self.client = chromadb.Client()
        self.collection = self.client.get_or_create_collection("courses")
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

## 5. Data Models

### 5.1 User Profile

```python
from sqlalchemy import Column, String, JSON, DateTime, Boolean, Integer
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

### 5.2 Conversation Session

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

### 5.3 Course Data

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

### 5.4 Job Listing

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

## 6. Conversation State Machine

```
                              ┌───────────────┐
                              │   GREETING    │
                              │ Language Set  │
                              └───────┬───────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │   DISCOVERY   │◀─────────────┐
                              │ Skill Questions│             │
                              └───────┬───────┘              │
                                      │                      │
                                      ▼                      │
                              ┌───────────────┐              │
                              │    PROFILE    │              │
                              │   Complete    │              │
                              └───────┬───────┘              │
                                      │                      │
                    ┌─────────────────┼─────────────────┐    │
                    │                 │                 │    │
                    ▼                 ▼                 ▼    │
            ┌───────────┐     ┌───────────┐     ┌───────────┐│
            │  COURSES  │     │   JOBS    │     │ INTERVIEW ││
            │  Matching │     │  Matching │     │  Practice ││
            └─────┬─────┘     └─────┬─────┘     └─────┬─────┘│
                  │                 │                 │      │
                  └─────────────────┼─────────────────┘      │
                                    │                        │
                                    ▼                        │
                              ┌───────────────┐              │
                              │   FOLLOW-UP   │──────────────┘
                              │   & Refine    │
                              └───────────────┘
```

## 7. User Experience Design

### 7.1 Conversation Principles

1. **Warm & Friendly**: Like talking to an elder sibling, not a government office
2. **Simple Language**: No jargon, 8th-grade vocabulary
3. **One Thing at a Time**: Never ask multiple questions
4. **Confirm Understanding**: Repeat back what user said
5. **Always Provide Options**: "Do you want A, B, or something else?"

### 7.2 Sample Conversation Flow

```
[User sends voice note in Hindi]
User: "Namaste, mujhe kaam chahiye"
      (Hello, I need work)

AI:   "Namaste! Main Sahaj hoon, tumhara career guide.
       Pehle batao, tumne kitni padhai ki hai?"
      (Hello! I'm Sahaj, your career guide.
       First tell me, how much have you studied?)

User: "12th pass hoon, science se"
      (12th pass, science stream)

AI:   "Bahut achha! 12th science matlab bahut options hain.
       Kya tum computer ya mobile chala lete ho?"
      (Very good! 12th science means many options.
       Can you use computers or mobiles?)

User: "Haan, mobile toh achhe se chalata hoon, thoda computer bhi"
      (Yes, I use mobile well, some computer too)

AI:   "Perfect! Ab batao — kaam kahan chahiye?
       1. Apne gaon/sheher mein
       2. Kisi bade sheher mein
       3. Ghar se online kaam"
      (Perfect! Now tell me — where do you want work?
       1. In your village/town
       2. In a big city
       3. Online work from home)

User: "Ghar se online ho toh achha hai"
      (Online from home would be good)

AI:   "Samajh gaya. Online kaam ke liye yeh 3 courses free hain:
       1. Data Entry — NPTEL, 2 hafte
       2. Digital Marketing — Skill India, 1 mahina
       3. Graphic Design basics — YouTube course

       Kaunsa sunna hai? Number bolo ya naam bolo."
      (Understood. For online work, these 3 courses are free:
       1. Data Entry — NPTEL, 2 weeks
       2. Digital Marketing — Skill India, 1 month
       3. Graphic Design basics — YouTube course

       Which one to hear about? Say the number or name.)
```

### 7.3 Error Handling

| Scenario | Response |
|----------|----------|
| **Unclear audio** | "Sorry, awaaz clear nahi aayi. Ek baar phir bolo?" |
| **Off-topic** | "Main sirf career aur jobs mein help kar sakta hoon. Kaam dhundhne mein madad chahiye?" |
| **Language switch** | Auto-detect and switch, confirm: "Tamil mein baat karein?" |
| **No match found** | "Abhi exact match nahi mila, lekin yeh similar options hain..." |

## 8. Prompt Engineering

### 8.1 System Prompt — Skill Discovery

```python
SKILL_DISCOVERY_SYSTEM_PROMPT = """
You are Sahaj (सहज), a friendly career counselor for Indian youth.

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

### 8.2 System Prompt — Course Recommendation

```python
COURSE_RECOMMENDATION_PROMPT = """
You are Sahaj, helping the user find the right training courses.

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

### 8.3 System Prompt — Mock Interview

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

## 9. Security & Privacy

### 9.1 Data Handling

| Data Type | Storage | Retention |
|-----------|---------|-----------|
| Voice recordings | Processed, not stored | Deleted after transcription |
| User profile | Encrypted in DB | Until user deletes |
| Conversation logs | Anonymized | 30 days |
| Phone number | Hashed (SHA-256) | For session management only |

### 9.2 Privacy Principles

1. **Minimal Data**: Only collect what's needed
2. **User Control**: Delete profile anytime via voice command
3. **No Selling**: Never share data with third parties
4. **Transparency**: Tell users what we store

## 10. Testing Strategy

### 10.1 Unit Testing
- **Coverage Target**: 90% code coverage
- **Framework**: pytest for Python
- **Mock Strategy**: Mock external APIs (Bhashini, WhatsApp, OpenAI)
- **Test Data**: Synthetic conversation data in multiple languages

### 10.2 Integration Testing
- **API Testing**: Automated testing of all REST endpoints
- **WhatsApp Integration**: End-to-end message flow testing
- **Voice Processing**: Audio file processing validation
- **Database Integration**: Data persistence and retrieval testing

### 10.3 Performance Testing
- **Load Testing**: Simulate 100 concurrent users
- **Voice Processing**: Test transcription accuracy and speed
- **Response Time**: Validate sub-5-second response times
- **Memory Usage**: Monitor memory consumption under load

### 10.4 Language Testing
- **Accuracy Testing**: Voice recognition accuracy per language
- **Cultural Appropriateness**: Response validation by native speakers
- **Dialect Support**: Testing with regional variations
- **Code-switching**: Mixed language conversation handling

## 11. Deployment Strategy

### 11.1 Environment Strategy
- **Development**: Local development with Docker Compose
- **Staging**: Railway/Render with test data
- **Production**: Railway/Render (MVP) → AWS/GCP (scale)

### 11.2 CI/CD Pipeline
```yaml
# GitHub Actions workflow
name: Deploy Sahaj
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: python -m pytest
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Railway
        run: railway up
```

### 11.3 Monitoring and Alerting
- **Application Metrics**: Response times, error rates, user engagement
- **Infrastructure Metrics**: CPU, memory, disk usage
- **Business Metrics**: Conversation completion rates, course enrollments
- **Logging**: Structured logging with log levels

## 12. Correctness Properties

Based on the requirements, the following correctness properties must be validated through property-based testing:

### 12.1 Conversation Flow Properties
**Property 1.1**: For any valid voice message input, the system shall produce a meaningful response within 5 seconds  
**Property 1.2**: Conversation context shall be maintained across message exchanges for the duration of a session  
**Property 1.3**: Language detection shall correctly identify the primary language with >90% accuracy

### 12.2 Skill Assessment Properties  
**Property 2.1**: Skills extracted from conversation shall be relevant to the user's described experience  
**Property 2.2**: Skill confidence scores shall correlate with the amount and quality of evidence provided  
**Property 2.3**: User profiles shall be updated consistently after each skill discovery interaction

### 12.3 Recommendation Properties
**Property 3.1**: Career recommendations shall match at least 70% of the user's identified skills  
**Property 3.2**: Training program suggestions shall be accessible to the user based on their location and constraints  
**Property 3.3**: Job opportunities shall match the user's skill level and career goals

### 12.4 System Reliability Properties
**Property 4.1**: The system shall handle network interruptions gracefully without losing conversation state  
**Property 4.2**: Voice processing shall maintain accuracy >85% across all supported languages  
**Property 4.3**: User data shall remain encrypted and secure throughout all processing stages

## 13. Implementation Phases

### Phase 1: Core Infrastructure (MVP - Hackathon)
- WhatsApp Business API integration
- Basic voice processing pipeline with Bhashini
- User profile management
- Single language support (Hindi)
- Skill discovery flow (5-7 questions)
- Basic course recommendation

### Phase 2: Multi-Language & Intelligence (Post-Hackathon)
- Full 22-language support
- Advanced conversation management
- Skill extraction algorithms
- Course recommendation engine with RAG
- Interview practice feature

### Phase 3: Job Matching & Scale (6 months)
- Job matching algorithms
- Partner API integrations
- Performance optimization
- Production deployment at scale

This design provides a comprehensive foundation for building Sahaj as a scalable, multilingual, voice-first career counseling platform that can serve millions of Indian youth effectively.