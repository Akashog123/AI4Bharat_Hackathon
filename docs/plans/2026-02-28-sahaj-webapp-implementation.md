# Sahaj Web App Prototype - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a working web-based voice-first career counselor prototype with Next.js frontend and FastAPI backend.

**Architecture:** Monolithic FastAPI backend serving REST + WebSocket APIs, consumed by a Next.js dashboard frontend. Sarvam AI handles voice (ASR/TTS), AWS Bedrock handles LLM (Claude) and RAG (Knowledge Bases), RDS PostgreSQL stores user data.

**Tech Stack:** Next.js 14, shadcn/ui, Tailwind CSS, FastAPI, SQLAlchemy, Sarvam AI (Saaras v3 + Bulbul v3), AWS Bedrock (Claude), Amazon S3, PostgreSQL, WebSocket, ReportLab

---

## Phase 1: Backend Foundation

### Task 1: Scaffold FastAPI Backend

**Files:**
- Create: `backend/app/__init__.py`
- Create: `backend/app/main.py`
- Create: `backend/app/config.py`
- Create: `backend/requirements.txt`
- Create: `backend/.env.example`

**Step 1: Create requirements.txt**

```
fastapi==0.109.2
uvicorn[standard]==0.27.1
python-dotenv==1.0.1
sqlalchemy==2.0.27
asyncpg==0.29.0
psycopg2-binary==2.9.9
pydantic==2.6.1
pydantic-settings==2.1.0
httpx==0.27.0
websockets==12.0
python-multipart==0.0.9
boto3==1.34.49
sarvamai==0.1.0
reportlab==4.1.0
aiofiles==23.2.1
```

**Step 2: Create config.py**

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App
    app_name: str = "Sahaj API"
    debug: bool = True

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/sahaj"

    # Sarvam AI
    sarvam_api_key: str = ""

    # AWS
    aws_region: str = "ap-south-1"
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    bedrock_model_id: str = "anthropic.claude-sonnet-4-5-20250929-v1:0"
    bedrock_knowledge_base_id: str = ""
    s3_bucket: str = "sahaj-data"

    # CORS
    frontend_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"

settings = Settings()
```

**Step 3: Create main.py**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "sahaj-api"}
```

**Step 4: Create .env.example**

```
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/sahaj
SARVAM_API_KEY=your_sarvam_api_key
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
BEDROCK_MODEL_ID=anthropic.claude-sonnet-4-5-20250929-v1:0
BEDROCK_KNOWLEDGE_BASE_ID=your_kb_id
S3_BUCKET=sahaj-data
FRONTEND_URL=http://localhost:3000
```

**Step 5: Create __init__.py**

Empty file at `backend/app/__init__.py`

**Step 6: Test it runs**

Run: `cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000`
Expected: Server starts, `http://localhost:8000/api/health` returns `{"status": "ok"}`

**Step 7: Commit**

```bash
git add backend/
git commit -m "feat: scaffold FastAPI backend with config and health endpoint"
```

---

### Task 2: Database Models & Connection

**Files:**
- Create: `backend/app/db/__init__.py`
- Create: `backend/app/db/database.py`
- Create: `backend/app/db/models.py`

**Step 1: Create database.py**

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

engine = create_async_engine(settings.database_url, echo=settings.debug)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with async_session() as session:
        yield session

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
```

**Step 2: Create models.py**

```python
import uuid
from datetime import datetime
from sqlalchemy import Column, String, JSON, DateTime, Boolean, Integer, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone_hash = Column(String(64), unique=True, index=True, nullable=True)
    email = Column(String(255), unique=True, index=True, nullable=True)
    name = Column(String(100), nullable=True)

    # Profile (extracted from conversation)
    education_level = Column(String(50), nullable=True)
    education_stream = Column(String(50), nullable=True)
    skills = Column(JSON, default=list)
    work_experience = Column(JSON, default=list)
    location = Column(String(100), nullable=True)
    location_preference = Column(String(20), nullable=True)
    job_type_preference = Column(String(20), nullable=True)

    # Language
    preferred_language = Column(String(10), default="hi-IN")

    # State
    profile_complete = Column(Boolean, default=False)
    discovery_step = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Session(Base):
    __tablename__ = "sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    current_state = Column(String(50), default="greeting")
    messages = Column(JSON, default=list)
    context = Column(JSON, default=dict)
    started_at = Column(DateTime, default=datetime.utcnow)
    last_active_at = Column(DateTime, default=datetime.utcnow)

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    s3_path = Column(String(500), nullable=True)
    local_path = Column(String(500), nullable=True)
    resume_data = Column(JSON, default=dict)
    generated_at = Column(DateTime, default=datetime.utcnow)
```

**Step 3: Wire DB init into main.py**

Add to `backend/app/main.py`:
```python
from contextlib import asynccontextmanager
from app.db.database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(title=settings.app_name, lifespan=lifespan)
```

**Step 4: Create empty __init__.py**

Empty file at `backend/app/db/__init__.py`

**Step 5: Verify DB connection**

Run: Start a local PostgreSQL (or use Docker: `docker run -d --name sahaj-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=sahaj -p 5432:5432 postgres:15`), then restart the server.
Expected: Tables created without errors.

**Step 6: Commit**

```bash
git add backend/app/db/
git commit -m "feat: add database models for users, sessions, and resumes"
```

---

### Task 3: User & Session Services

**Files:**
- Create: `backend/app/services/__init__.py`
- Create: `backend/app/services/user.py`
- Create: `backend/app/services/session.py`

**Step 1: Create user.py**

```python
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import User

class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_user(self, language: str = "hi-IN", name: str = None) -> User:
        user = User(preferred_language=language, name=name)
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def get_user(self, user_id: UUID) -> User | None:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def update_profile(self, user_id: UUID, updates: dict) -> User:
        user = await self.get_user(user_id)
        if not user:
            raise ValueError(f"User {user_id} not found")
        for key, value in updates.items():
            if hasattr(user, key):
                setattr(user, key, value)
        await self.db.commit()
        await self.db.refresh(user)
        return user
```

**Step 2: Create session.py**

```python
from uuid import UUID
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Session

class SessionService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_session(self, user_id: UUID) -> Session:
        session = Session(user_id=user_id, current_state="greeting")
        self.db.add(session)
        await self.db.commit()
        await self.db.refresh(session)
        return session

    async def get_session(self, session_id: UUID) -> Session | None:
        result = await self.db.execute(select(Session).where(Session.id == session_id))
        return result.scalar_one_or_none()

    async def get_active_session(self, user_id: UUID) -> Session | None:
        result = await self.db.execute(
            select(Session)
            .where(Session.user_id == user_id)
            .order_by(Session.started_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def update_session(self, session_id: UUID, state: str = None, messages: list = None, context: dict = None) -> Session:
        session = await self.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        if state:
            session.current_state = state
        if messages is not None:
            session.messages = messages
        if context is not None:
            session.context = context
        session.last_active_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(session)
        return session

    async def add_message(self, session_id: UUID, role: str, content: str) -> Session:
        session = await self.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        messages = session.messages or []
        messages.append({"role": role, "content": content, "timestamp": datetime.utcnow().isoformat()})
        session.messages = messages
        session.last_active_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(session)
        return session
```

**Step 3: Create empty __init__.py**

Empty file at `backend/app/services/__init__.py`

**Step 4: Commit**

```bash
git add backend/app/services/
git commit -m "feat: add user and session services"
```

---

## Phase 2: Voice Pipeline (Sarvam AI)

### Task 4: Sarvam AI Client

**Files:**
- Create: `backend/app/voice/__init__.py`
- Create: `backend/app/voice/sarvam.py`

**Step 1: Create sarvam.py**

```python
import base64
import httpx
from app.config import settings

SARVAM_BASE_URL = "https://api.sarvam.ai"

class SarvamClient:
    def __init__(self):
        self.api_key = settings.sarvam_api_key
        self.headers = {
            "api-subscription-key": self.api_key,
        }

    async def speech_to_text(self, audio_bytes: bytes, language: str = None) -> dict:
        """Transcribe audio using Saaras v3."""
        async with httpx.AsyncClient(timeout=30.0) as client:
            files = {"file": ("audio.wav", audio_bytes, "audio/wav")}
            data = {"model": "saaras:v3", "mode": "transcribe"}
            if language:
                data["language_code"] = language

            response = await client.post(
                f"{SARVAM_BASE_URL}/speech-to-text",
                headers=self.headers,
                files=files,
                data=data,
            )
            response.raise_for_status()
            result = response.json()
            return {
                "text": result.get("transcript", ""),
                "language": result.get("language_code", "hi-IN"),
                "confidence": result.get("confidence", 0.0),
            }

    async def text_to_speech(self, text: str, language: str = "hi-IN", speaker: str = "anushka") -> bytes:
        """Convert text to speech using Bulbul v3."""
        # TTS-supported languages
        tts_languages = ["hi-IN", "bn-IN", "ta-IN", "te-IN", "kn-IN", "ml-IN", "mr-IN", "gu-IN", "pa-IN", "od-IN", "en-IN"]
        if language not in tts_languages:
            return None  # Caller should fall back to text-only

        async with httpx.AsyncClient(timeout=30.0) as client:
            payload = {
                "target_language_code": language,
                "text": text,
                "model": "bulbul:v3",
                "speaker": speaker,
                "speech_sample_rate": 24000,
                "enable_preprocessing": True,
            }
            response = await client.post(
                f"{SARVAM_BASE_URL}/text-to-speech",
                headers={**self.headers, "Content-Type": "application/json"},
                json=payload,
            )
            response.raise_for_status()
            result = response.json()
            audio_base64 = result.get("audios", [None])[0]
            if audio_base64:
                return base64.b64decode(audio_base64)
            return None

    async def translate_text(self, text: str, source_lang: str, target_lang: str) -> str:
        """Translate text between languages using Sarvam Translate."""
        async with httpx.AsyncClient(timeout=30.0) as client:
            payload = {
                "source_language_code": source_lang,
                "target_language_code": target_lang,
                "input": text,
                "model": "mayura:v1",
                "mode": "formal",
            }
            response = await client.post(
                f"{SARVAM_BASE_URL}/translate",
                headers={**self.headers, "Content-Type": "application/json"},
                json=payload,
            )
            response.raise_for_status()
            return response.json().get("translated_text", text)


sarvam_client = SarvamClient()
```

**Step 2: Create empty __init__.py**

Empty file at `backend/app/voice/__init__.py`

**Step 3: Commit**

```bash
git add backend/app/voice/
git commit -m "feat: add Sarvam AI client for ASR (Saaras v3) and TTS (Bulbul v3)"
```

---

## Phase 3: LLM Orchestration

### Task 5: AWS Bedrock Claude Client

**Files:**
- Create: `backend/app/llm/__init__.py`
- Create: `backend/app/llm/bedrock.py`
- Create: `backend/app/llm/prompts.py`
- Create: `backend/app/llm/orchestrator.py`

**Step 1: Create prompts.py**

```python
SYSTEM_PROMPT_BASE = """You are Sahaj (सहज), a friendly AI career counselor for Indian youth.

Your personality:
- Warm and encouraging, like an older sibling
- Simple language, no jargon (8th-grade vocabulary)
- Patient, never rush the user
- Celebrate small wins and existing skills

Language rules:
- Respond in the same language the user speaks
- For Hindi, use simple Hindustani (avoid Sanskrit-heavy Hindi)
- Support code-mixing (Hinglish is fine)
- Keep responses under 80 words (for TTS)

IMPORTANT: You MUST respond with valid JSON in this exact format:
{
  "conversation_text": "Your natural language reply to the user",
  "profile_updates": {"field": "value"},
  "state_transition": "current_state or next_state",
  "recommendations": []
}
"""

DISCOVERY_PROMPT = SYSTEM_PROMPT_BASE + """
Your task: Extract the user's education, skills, and job preferences.
- Ask ONE question at a time
- Recognize informal skills (farming, cooking, repair work, driving)
- Always validate what you understood

Discovery steps (ask in order, skip if already known):
1. Name and greeting
2. Education level (10th, 12th, graduate, etc.)
3. Education stream (science, commerce, arts)
4. Current/past work experience (formal or informal)
5. Skills (technical, vocational, digital)
6. Location preference (local, city, remote/online)
7. Job type preference (gig, full-time, self-employed)

Current user profile:
{user_profile}

Current step: {discovery_step}/7

Set profile_updates for any new info extracted.
Set state_transition to "discovery" until step 7, then "profile_complete".
"""

COURSES_PROMPT = SYSTEM_PROMPT_BASE + """
You are helping the user find training courses.

User profile:
{user_profile}

Available courses (from knowledge base):
{retrieved_courses}

Your task:
- Recommend 2-3 most relevant FREE courses
- Explain why each fits the user
- Mention duration and provider
- Offer to share links

Put recommended courses in "recommendations" field as objects with: title, provider, duration, cost, url, reason.
Set state_transition to "courses".
"""

JOBS_PROMPT = SYSTEM_PROMPT_BASE + """
You are helping the user find job opportunities.

User profile:
{user_profile}

Available jobs (from knowledge base):
{retrieved_jobs}

Your task:
- Recommend 2-3 most relevant jobs
- Explain why each fits
- Mention salary range and location
- Offer application help

Put recommended jobs in "recommendations" field as objects with: title, company, salary, location, job_type, reason.
Set state_transition to "jobs".
"""

INTERVIEW_PROMPT = SYSTEM_PROMPT_BASE + """
You are conducting a mock interview with the user.

Role being interviewed for: {job_role}
Interview stage: {stage}/5
- Stage 1: Introduction (tell me about yourself)
- Stage 2: Experience questions
- Stage 3: Skill-based questions
- Stage 4: Situational questions
- Stage 5: Closing & feedback summary

Rules:
- Ask ONE question, wait for answer
- Be encouraging but realistic
- After each answer, give brief feedback
- At stage 5, summarize strengths and improvement areas

Previous Q&A:
{interview_history}

Set state_transition to "interview".
"""

RESUME_PROMPT = SYSTEM_PROMPT_BASE + """
You are helping generate a resume for the user.

User profile:
{user_profile}

Your task:
- Ask for any missing info needed for a resume (e.g., full name, contact, objective)
- Once you have enough info, set state_transition to "resume_ready"
- Put the complete resume data in "recommendations" as a single object with fields:
  name, email, phone, objective, education, skills, experience, languages

Set state_transition to "resume" or "resume_ready".
"""
```

**Step 2: Create bedrock.py**

```python
import json
import boto3
from app.config import settings

class BedrockClient:
    def __init__(self):
        self.client = boto3.client(
            "bedrock-runtime",
            region_name=settings.aws_region,
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
        )
        self.model_id = settings.bedrock_model_id

    async def chat(self, system_prompt: str, messages: list[dict]) -> dict:
        """Send a conversation to Claude via Bedrock and get structured JSON response."""
        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1024,
            "system": system_prompt,
            "messages": messages,
        })

        response = self.client.invoke_model(
            modelId=self.model_id,
            body=body,
            contentType="application/json",
            accept="application/json",
        )

        response_body = json.loads(response["body"].read())
        text = response_body["content"][0]["text"]

        # Parse JSON from response
        try:
            # Try direct JSON parse
            return json.loads(text)
        except json.JSONDecodeError:
            # Try extracting JSON from markdown code block
            if "```json" in text:
                json_str = text.split("```json")[1].split("```")[0].strip()
                return json.loads(json_str)
            elif "```" in text:
                json_str = text.split("```")[1].split("```")[0].strip()
                return json.loads(json_str)
            # Fallback: return as plain text
            return {
                "conversation_text": text,
                "profile_updates": {},
                "state_transition": None,
                "recommendations": [],
            }


bedrock_client = BedrockClient()
```

**Step 3: Create orchestrator.py**

```python
import json
from app.llm.bedrock import bedrock_client
from app.llm.prompts import (
    DISCOVERY_PROMPT, COURSES_PROMPT, JOBS_PROMPT,
    INTERVIEW_PROMPT, RESUME_PROMPT,
)

class ConversationOrchestrator:
    """Routes messages to the right prompt based on conversation state."""

    async def process(self, user_message: str, session_state: str, user_profile: dict,
                      messages_history: list, context: dict = None) -> dict:
        """Process a user message and return structured response."""

        # Build system prompt based on state
        system_prompt = self._get_prompt(session_state, user_profile, context or {})

        # Build message history for Claude (last 10 messages for context window)
        claude_messages = []
        for msg in (messages_history or [])[-10:]:
            claude_messages.append({
                "role": msg["role"],
                "content": msg["content"],
            })

        # Add current message
        claude_messages.append({"role": "user", "content": user_message})

        # Call Bedrock Claude
        result = await bedrock_client.chat(system_prompt, claude_messages)

        return result

    def _get_prompt(self, state: str, profile: dict, context: dict) -> str:
        profile_str = json.dumps(profile, indent=2, ensure_ascii=False)

        if state in ("greeting", "discovery"):
            return DISCOVERY_PROMPT.format(
                user_profile=profile_str,
                discovery_step=profile.get("discovery_step", 0),
            )
        elif state == "courses":
            return COURSES_PROMPT.format(
                user_profile=profile_str,
                retrieved_courses=json.dumps(context.get("courses", []), ensure_ascii=False),
            )
        elif state == "jobs":
            return JOBS_PROMPT.format(
                user_profile=profile_str,
                retrieved_jobs=json.dumps(context.get("jobs", []), ensure_ascii=False),
            )
        elif state == "interview":
            return INTERVIEW_PROMPT.format(
                job_role=context.get("job_role", "general"),
                stage=context.get("interview_stage", 1),
                interview_history=json.dumps(context.get("interview_history", []), ensure_ascii=False),
            )
        elif state in ("resume", "resume_ready"):
            return RESUME_PROMPT.format(user_profile=profile_str)
        else:
            return DISCOVERY_PROMPT.format(
                user_profile=profile_str,
                discovery_step=0,
            )


orchestrator = ConversationOrchestrator()
```

**Step 4: Create empty __init__.py**

Empty file at `backend/app/llm/__init__.py`

**Step 5: Commit**

```bash
git add backend/app/llm/
git commit -m "feat: add LLM orchestrator with Bedrock Claude and conversation prompts"
```

---

## Phase 4: WebSocket & REST API

### Task 6: WebSocket Voice Handler

**Files:**
- Create: `backend/app/api/__init__.py`
- Create: `backend/app/api/websocket.py`

**Step 1: Create websocket.py**

```python
import json
import base64
from uuid import UUID
from fastapi import WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db, async_session
from app.voice.sarvam import sarvam_client
from app.llm.orchestrator import orchestrator
from app.services.user import UserService
from app.services.session import SessionService

class VoiceWebSocketHandler:
    """Handles bidirectional voice streaming over WebSocket."""

    async def handle(self, websocket: WebSocket):
        await websocket.accept()

        # Get or create user/session from initial handshake
        async with async_session() as db:
            user_service = UserService(db)
            session_service = SessionService(db)

            try:
                # Wait for init message with user_id or create new
                init_data = await websocket.receive_json()
                user_id = init_data.get("user_id")
                language = init_data.get("language", "hi-IN")

                if user_id:
                    user = await user_service.get_user(UUID(user_id))
                    if not user:
                        user = await user_service.create_user(language=language)
                else:
                    user = await user_service.create_user(language=language)

                session = await session_service.get_active_session(user.id)
                if not session:
                    session = await session_service.create_session(user.id)

                # Send session info back
                await websocket.send_json({
                    "type": "session_init",
                    "user_id": str(user.id),
                    "session_id": str(session.id),
                    "state": session.current_state,
                    "profile": {
                        "education_level": user.education_level,
                        "skills": user.skills or [],
                        "work_experience": user.work_experience or [],
                        "location_preference": user.location_preference,
                        "job_type_preference": user.job_type_preference,
                        "profile_complete": user.profile_complete,
                        "name": user.name,
                    },
                })

                # Send greeting
                greeting = await self._generate_greeting(user, session, language)
                await websocket.send_json(greeting)

            except WebSocketDisconnect:
                return

            # Main message loop
            try:
                while True:
                    message = await websocket.receive()

                    if "bytes" in message:
                        # Audio data received
                        audio_bytes = message["bytes"]
                        response = await self._process_voice(
                            audio_bytes, user, session, db, user_service, session_service
                        )
                        await websocket.send_json(response)

                    elif "text" in message:
                        # Text message received
                        data = json.loads(message["text"])

                        if data.get("type") == "text_message":
                            response = await self._process_text(
                                data["text"], user, session, db, user_service, session_service,
                                language=user.preferred_language
                            )
                            await websocket.send_json(response)

                        elif data.get("type") == "change_state":
                            session = await session_service.update_session(
                                session.id, state=data["state"]
                            )
                            await websocket.send_json({
                                "type": "state_changed",
                                "state": data["state"],
                            })

            except WebSocketDisconnect:
                pass

    async def _process_voice(self, audio_bytes, user, session, db, user_service, session_service):
        """Process voice input: ASR -> LLM -> TTS."""
        # 1. Speech to text
        asr_result = await sarvam_client.speech_to_text(audio_bytes, language=user.preferred_language)
        transcript = asr_result["text"]
        detected_lang = asr_result.get("language", user.preferred_language)

        if not transcript.strip():
            return {
                "type": "error",
                "message": "Could not understand audio. Please try again.",
            }

        # Update language if detected differently
        if detected_lang != user.preferred_language:
            user = await user_service.update_profile(user.id, {"preferred_language": detected_lang})

        return await self._process_text(
            transcript, user, session, db, user_service, session_service,
            language=detected_lang, is_voice=True
        )

    async def _process_text(self, text, user, session, db, user_service, session_service,
                            language="hi-IN", is_voice=False):
        """Process text input: LLM -> TTS (if voice)."""
        # Build user profile dict
        user_profile = {
            "name": user.name,
            "education_level": user.education_level,
            "education_stream": user.education_stream,
            "skills": user.skills or [],
            "work_experience": user.work_experience or [],
            "location_preference": user.location_preference,
            "job_type_preference": user.job_type_preference,
            "preferred_language": user.preferred_language,
            "discovery_step": user.discovery_step,
        }

        # 2. LLM orchestration
        llm_result = await orchestrator.process(
            user_message=text,
            session_state=session.current_state,
            user_profile=user_profile,
            messages_history=session.messages or [],
            context=session.context or {},
        )

        response_text = llm_result.get("conversation_text", "")
        profile_updates = llm_result.get("profile_updates", {})
        state_transition = llm_result.get("state_transition")
        recommendations = llm_result.get("recommendations", [])

        # 3. Update user profile if needed
        if profile_updates:
            # Increment discovery step
            if session.current_state in ("greeting", "discovery"):
                profile_updates["discovery_step"] = user.discovery_step + 1
            if state_transition == "profile_complete":
                profile_updates["profile_complete"] = True
            user = await user_service.update_profile(user.id, profile_updates)

        # 4. Update session state
        await session_service.add_message(session.id, "user", text)
        await session_service.add_message(session.id, "assistant", response_text)
        if state_transition and state_transition != session.current_state:
            session = await session_service.update_session(session.id, state=state_transition)

        # 5. Generate TTS audio
        response_audio_b64 = None
        if is_voice or True:  # Always generate audio for now
            audio_bytes = await sarvam_client.text_to_speech(response_text, language=language)
            if audio_bytes:
                response_audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")

        return {
            "type": "response",
            "transcript": text,
            "response_text": response_text,
            "response_audio": response_audio_b64,
            "profile_update": profile_updates,
            "recommendations": recommendations,
            "state": state_transition or session.current_state,
            "discovery_step": user.discovery_step,
            "profile_complete": user.profile_complete,
        }

    async def _generate_greeting(self, user, session, language):
        """Generate initial greeting message."""
        if user.name:
            greeting = f"Namaste {user.name}! Main Sahaj hoon, aapka career guide. Aaj kya madad karoon?"
        else:
            greeting = "Namaste! Main Sahaj hoon, aapka career guide. Pehle apna naam bataiye?"

        audio_bytes = await sarvam_client.text_to_speech(greeting, language=language)
        audio_b64 = base64.b64encode(audio_bytes).decode("utf-8") if audio_bytes else None

        return {
            "type": "greeting",
            "response_text": greeting,
            "response_audio": audio_b64,
            "state": session.current_state,
        }


voice_handler = VoiceWebSocketHandler()
```

**Step 2: Create empty __init__.py**

Empty file at `backend/app/api/__init__.py`

**Step 3: Wire WebSocket into main.py**

Add to `backend/app/main.py`:
```python
from fastapi import WebSocket
from app.api.websocket import voice_handler

@app.websocket("/ws/voice")
async def voice_ws(websocket: WebSocket):
    await voice_handler.handle(websocket)
```

**Step 4: Commit**

```bash
git add backend/app/api/
git commit -m "feat: add WebSocket voice handler with ASR -> LLM -> TTS pipeline"
```

---

### Task 7: REST API Endpoints

**Files:**
- Create: `backend/app/api/routes.py`

**Step 1: Create routes.py**

```python
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.db.database import get_db
from app.services.user import UserService
from app.services.session import SessionService

router = APIRouter(prefix="/api")

class RegisterRequest(BaseModel):
    language: str = "hi-IN"
    name: str = None

class ProfileUpdate(BaseModel):
    education_level: str = None
    education_stream: str = None
    skills: list = None
    work_experience: list = None
    location_preference: str = None
    job_type_preference: str = None
    preferred_language: str = None
    name: str = None

@router.post("/auth/register")
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    service = UserService(db)
    user = await service.create_user(language=req.language, name=req.name)
    return {"user_id": str(user.id), "language": user.preferred_language}

@router.get("/profile/{user_id}")
async def get_profile(user_id: UUID, db: AsyncSession = Depends(get_db)):
    service = UserService(db)
    user = await service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": str(user.id),
        "name": user.name,
        "education_level": user.education_level,
        "education_stream": user.education_stream,
        "skills": user.skills or [],
        "work_experience": user.work_experience or [],
        "location_preference": user.location_preference,
        "job_type_preference": user.job_type_preference,
        "preferred_language": user.preferred_language,
        "profile_complete": user.profile_complete,
        "discovery_step": user.discovery_step,
    }

@router.put("/profile/{user_id}")
async def update_profile(user_id: UUID, updates: ProfileUpdate, db: AsyncSession = Depends(get_db)):
    service = UserService(db)
    update_dict = {k: v for k, v in updates.model_dump().items() if v is not None}
    user = await service.update_profile(user_id, update_dict)
    return {"status": "updated", "user_id": str(user.id)}

@router.get("/session/{user_id}/history")
async def get_session_history(user_id: UUID, db: AsyncSession = Depends(get_db)):
    service = SessionService(db)
    session = await service.get_active_session(user_id)
    if not session:
        return {"messages": [], "state": "greeting"}
    return {
        "session_id": str(session.id),
        "state": session.current_state,
        "messages": session.messages or [],
    }
```

**Step 2: Wire routes into main.py**

Add to `backend/app/main.py`:
```python
from app.api.routes import router
app.include_router(router)
```

**Step 3: Commit**

```bash
git add backend/app/api/routes.py
git commit -m "feat: add REST API endpoints for user profile and session history"
```

---

## Phase 5: Seed Data & Resume

### Task 8: Seed Course & Job Data

**Files:**
- Create: `backend/data/courses.json`
- Create: `backend/data/jobs.json`

**Step 1: Create courses.json**

Create a JSON file with 50+ curated courses. Structure:

```json
[
  {
    "id": "c001",
    "title": "Data Entry Operator Course",
    "title_hindi": "डेटा एंट्री ऑपरेटर कोर्स",
    "provider": "NSDC",
    "url": "https://www.nsdcindia.org/course/data-entry",
    "duration": "2 weeks",
    "cost": 0,
    "certification": true,
    "category": "digital",
    "skills_taught": ["data_entry", "typing", "excel", "computer_basic"],
    "education_required": "10th",
    "languages": ["hi", "en"],
    "description": "Learn data entry, typing speed improvement, MS Excel basics, and office computer skills."
  },
  {
    "id": "c002",
    "title": "Digital Marketing Fundamentals",
    "title_hindi": "डिजिटल मार्केटिंग फंडामेंटल्स",
    "provider": "Skill India",
    "url": "https://www.skillindia.gov.in/digital-marketing",
    "duration": "4 weeks",
    "cost": 0,
    "certification": true,
    "category": "digital",
    "skills_taught": ["social_media", "seo", "content_creation", "google_ads"],
    "education_required": "12th",
    "languages": ["hi", "en"],
    "description": "Complete digital marketing course covering social media, SEO, Google Ads, and content strategy."
  }
]
```

(Create at least 20 entries across categories: digital, vocational, technical, business, healthcare, agriculture)

**Step 2: Create jobs.json**

```json
[
  {
    "id": "j001",
    "title": "Delivery Partner",
    "title_hindi": "डिलीवरी पार्टनर",
    "company": "Zomato/Swiggy",
    "location": "Pan India",
    "location_type": "local",
    "job_type": "gig",
    "salary_min": 15000,
    "salary_max": 25000,
    "education_required": "10th",
    "skills_required": ["driving", "mobile_basic", "navigation"],
    "description": "Food delivery partner. Own vehicle required. Flexible hours.",
    "contact_type": "link",
    "contact_value": "https://www.zomato.com/delivery-partner"
  }
]
```

(Create at least 15 entries across: gig, full-time, remote, vocational)

**Step 3: Commit**

```bash
git add backend/data/
git commit -m "feat: add seed data for courses and jobs"
```

---

### Task 9: Resume Generation Service

**Files:**
- Create: `backend/app/services/resume.py`

**Step 1: Create resume.py**

```python
import io
import os
from uuid import UUID, uuid4
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Resume

class ResumeService:
    def __init__(self, db: AsyncSession = None):
        self.db = db

    def generate_pdf(self, resume_data: dict) -> bytes:
        """Generate a resume PDF from structured data. Returns PDF bytes."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4,
                                topMargin=0.5*inch, bottomMargin=0.5*inch,
                                leftMargin=0.75*inch, rightMargin=0.75*inch)

        styles = getSampleStyleSheet()
        name_style = ParagraphStyle('Name', parent=styles['Title'], fontSize=20, spaceAfter=6)
        heading_style = ParagraphStyle('Heading', parent=styles['Heading2'], fontSize=13,
                                        textColor=colors.HexColor('#1a56db'), spaceAfter=6)
        body_style = ParagraphStyle('Body', parent=styles['Normal'], fontSize=11, spaceAfter=4)

        elements = []

        # Name
        name = resume_data.get("name", "Name")
        elements.append(Paragraph(name, name_style))

        # Contact info
        contact_parts = []
        if resume_data.get("phone"):
            contact_parts.append(resume_data["phone"])
        if resume_data.get("email"):
            contact_parts.append(resume_data["email"])
        if resume_data.get("location"):
            contact_parts.append(resume_data["location"])
        if contact_parts:
            elements.append(Paragraph(" | ".join(contact_parts), body_style))

        elements.append(Spacer(1, 12))

        # Objective
        if resume_data.get("objective"):
            elements.append(Paragraph("Career Objective", heading_style))
            elements.append(Paragraph(resume_data["objective"], body_style))
            elements.append(Spacer(1, 8))

        # Education
        if resume_data.get("education"):
            elements.append(Paragraph("Education", heading_style))
            edu = resume_data["education"]
            if isinstance(edu, str):
                elements.append(Paragraph(f"• {edu}", body_style))
            elif isinstance(edu, list):
                for item in edu:
                    elements.append(Paragraph(f"• {item}", body_style))
            elements.append(Spacer(1, 8))

        # Skills
        if resume_data.get("skills"):
            elements.append(Paragraph("Skills", heading_style))
            skills = resume_data["skills"]
            if isinstance(skills, list):
                skills_text = " | ".join(skills)
            else:
                skills_text = str(skills)
            elements.append(Paragraph(skills_text, body_style))
            elements.append(Spacer(1, 8))

        # Work Experience
        if resume_data.get("experience"):
            elements.append(Paragraph("Work Experience", heading_style))
            exp = resume_data["experience"]
            if isinstance(exp, list):
                for item in exp:
                    if isinstance(item, dict):
                        elements.append(Paragraph(
                            f"• <b>{item.get('role', '')}</b> at {item.get('company', '')} ({item.get('duration', '')})",
                            body_style))
                        if item.get("description"):
                            elements.append(Paragraph(f"  {item['description']}", body_style))
                    else:
                        elements.append(Paragraph(f"• {item}", body_style))
            elements.append(Spacer(1, 8))

        # Languages
        if resume_data.get("languages"):
            elements.append(Paragraph("Languages", heading_style))
            langs = resume_data["languages"]
            if isinstance(langs, list):
                elements.append(Paragraph(" | ".join(langs), body_style))
            elements.append(Spacer(1, 8))

        doc.build(elements)
        return buffer.getvalue()

    async def save_resume(self, user_id: UUID, resume_data: dict, pdf_bytes: bytes) -> Resume:
        """Save resume to database and return the record."""
        # Save PDF locally (for prototype; use S3 in production)
        os.makedirs("generated_resumes", exist_ok=True)
        resume_id = uuid4()
        filename = f"generated_resumes/{resume_id}.pdf"
        with open(filename, "wb") as f:
            f.write(pdf_bytes)

        resume = Resume(
            id=resume_id,
            user_id=user_id,
            local_path=filename,
            resume_data=resume_data,
        )
        self.db.add(resume)
        await self.db.commit()
        await self.db.refresh(resume)
        return resume
```

**Step 2: Add resume endpoints to routes.py**

Add to `backend/app/api/routes.py`:

```python
from app.services.resume import ResumeService

@router.post("/resume/generate/{user_id}")
async def generate_resume(user_id: UUID, resume_data: dict, db: AsyncSession = Depends(get_db)):
    user_service = UserService(db)
    user = await user_service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    resume_service = ResumeService(db)
    pdf_bytes = resume_service.generate_pdf(resume_data)
    resume = await resume_service.save_resume(user_id, resume_data, pdf_bytes)
    return {"resume_id": str(resume.id), "download_url": f"/api/resume/download/{resume.id}"}

@router.get("/resume/download/{resume_id}")
async def download_resume(resume_id: UUID, db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select
    from app.db.models import Resume
    result = await db.execute(select(Resume).where(Resume.id == resume_id))
    resume = result.scalar_one_or_none()
    if not resume or not resume.local_path:
        raise HTTPException(status_code=404, detail="Resume not found")
    return FileResponse(resume.local_path, media_type="application/pdf", filename="sahaj_resume.pdf")
```

**Step 3: Commit**

```bash
git add backend/app/services/resume.py backend/app/api/routes.py
git commit -m "feat: add resume PDF generation service with download endpoint"
```

---

## Phase 6: Frontend Foundation

### Task 10: Scaffold Next.js Frontend

**Step 1: Create Next.js app**

Run:
```bash
cd D:/Projects/AI4Bharat_Hackathon
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm
```

**Step 2: Install shadcn/ui**

Run:
```bash
cd frontend
npx shadcn@latest init -d
```

**Step 3: Add shadcn components**

Run:
```bash
npx shadcn@latest add button card tabs badge select input scroll-area avatar separator sheet dialog progress
```

**Step 4: Install additional dependencies**

Run:
```bash
npm install wavesurfer.js lucide-react
```

**Step 5: Commit**

```bash
git add frontend/
git commit -m "feat: scaffold Next.js frontend with shadcn/ui and Tailwind CSS"
```

---

### Task 11: WebSocket Client & Audio Utils

**Files:**
- Create: `frontend/lib/websocket.ts`
- Create: `frontend/lib/audio.ts`
- Create: `frontend/lib/types.ts`

**Step 1: Create types.ts**

```typescript
export interface UserProfile {
  name: string | null;
  education_level: string | null;
  education_stream: string | null;
  skills: string[];
  work_experience: { type: string; domain: string; years: number }[];
  location_preference: string | null;
  job_type_preference: string | null;
  profile_complete: boolean;
}

export interface Course {
  title: string;
  provider: string;
  duration: string;
  cost: number;
  url: string;
  reason: string;
}

export interface Job {
  title: string;
  company: string;
  salary: string;
  location: string;
  job_type: string;
  reason: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  audioUrl?: string;
  timestamp: string;
}

export interface ServerResponse {
  type: "greeting" | "response" | "session_init" | "state_changed" | "error";
  transcript?: string;
  response_text?: string;
  response_audio?: string; // base64
  profile_update?: Partial<UserProfile>;
  recommendations?: (Course | Job)[];
  state?: string;
  user_id?: string;
  session_id?: string;
  profile?: UserProfile;
  discovery_step?: number;
  profile_complete?: boolean;
  message?: string;
}

export type ConversationState = "greeting" | "discovery" | "profile_complete" | "courses" | "jobs" | "interview" | "resume" | "resume_ready";
```

**Step 2: Create websocket.ts**

```typescript
import { ServerResponse } from "./types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/voice";

export class SahajWebSocket {
  private ws: WebSocket | null = null;
  private onMessage: (data: ServerResponse) => void;
  private onConnect: () => void;
  private onDisconnect: () => void;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(callbacks: {
    onMessage: (data: ServerResponse) => void;
    onConnect: () => void;
    onDisconnect: () => void;
  }) {
    this.onMessage = callbacks.onMessage;
    this.onConnect = callbacks.onConnect;
    this.onDisconnect = callbacks.onDisconnect;
  }

  connect(userId?: string, language: string = "hi-IN") {
    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.onConnect();
      // Send init message
      this.ws?.send(JSON.stringify({
        user_id: userId || null,
        language,
      }));
    };

    this.ws.onmessage = (event) => {
      try {
        const data: ServerResponse = JSON.parse(event.data);
        this.onMessage(data);
      } catch (e) {
        console.error("Failed to parse WebSocket message:", e);
      }
    };

    this.ws.onclose = () => {
      this.onDisconnect();
      this.attemptReconnect(userId, language);
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  private attemptReconnect(userId?: string, language: string = "hi-IN") {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(userId, language), 2000 * this.reconnectAttempts);
    }
  }

  sendAudio(audioBlob: Blob) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      audioBlob.arrayBuffer().then((buffer) => {
        this.ws?.send(buffer);
      });
    }
  }

  sendText(text: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: "text_message",
        text,
      }));
    }
  }

  changeState(state: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: "change_state",
        state,
      }));
    }
  }

  disconnect() {
    this.maxReconnectAttempts = 0; // Prevent reconnect
    this.ws?.close();
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
```

**Step 3: Create audio.ts**

```typescript
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async start(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: "audio/webm;codecs=opus",
    });
    this.audioChunks = [];

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(100); // Collect data every 100ms
  }

  async stop(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(new Blob());
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
        this.cleanup();
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  private cleanup() {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    this.mediaRecorder = null;
  }

  get isRecording() {
    return this.mediaRecorder?.state === "recording";
  }
}

export function playAudioBase64(base64Audio: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const audioBytes = Uint8Array.from(atob(base64Audio), (c) => c.charCodeAt(0));
      const blob = new Blob([audioBytes], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      audio.onerror = reject;
      audio.play();
    } catch (e) {
      reject(e);
    }
  });
}
```

**Step 4: Commit**

```bash
git add frontend/lib/
git commit -m "feat: add WebSocket client, audio recorder, and TypeScript types"
```

---

### Task 12: Landing Page

**Files:**
- Modify: `frontend/app/page.tsx`

**Step 1: Create landing page**

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="text-2xl font-bold text-blue-900">
          सहज <span className="text-sm font-normal text-gray-500">Sahaj</span>
        </div>
        <div className="text-sm text-gray-500">AI4Bharat Hackathon</div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Your Voice-First
          <br />
          <span className="text-blue-600">Career Counselor</span>
        </h1>

        <p className="text-xl text-gray-600 mb-4 max-w-2xl">
          Discover your skills, find free courses, prepare for interviews, and
          get matched with jobs — all through a simple voice conversation in your
          language.
        </p>

        <p className="text-lg text-orange-600 font-medium mb-8">
          Supports 22 Indian languages. No app download needed.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Link href="/app">
            <Button size="lg" className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700">
              🎤 Start Counseling
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "22", label: "Languages" },
            { value: "100+", label: "Free Courses" },
            { value: "50+", label: "Job Listings" },
            { value: "5min", label: "To Get Started" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-gray-400">
        Powered by Sarvam AI + Claude | Built for AI4Bharat Hackathon
      </footer>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add frontend/app/page.tsx
git commit -m "feat: add landing page with hero section and stats"
```

---

### Task 13: Main Dashboard Layout

**Files:**
- Create: `frontend/app/app/page.tsx`
- Create: `frontend/app/app/layout.tsx`
- Create: `frontend/components/voice-chat/chat-panel.tsx`
- Create: `frontend/components/voice-chat/message-bubble.tsx`
- Create: `frontend/components/voice-chat/mic-button.tsx`
- Create: `frontend/components/dashboard/profile-tab.tsx`
- Create: `frontend/components/dashboard/courses-tab.tsx`
- Create: `frontend/components/dashboard/jobs-tab.tsx`
- Create: `frontend/components/dashboard/interview-tab.tsx`
- Create: `frontend/components/dashboard/resume-tab.tsx`
- Create: `frontend/components/dashboard/dashboard-panel.tsx`

This is the largest task. Build the main `/app` page with:

- Left panel: `ChatPanel` component containing message list, mic button, text input
- Right panel: `DashboardPanel` with Tabs (Profile, Courses, Jobs, Interview, Resume)
- Global state managed via React `useState` + `useRef` for WebSocket

**Step 1: Create app/app/layout.tsx**

```tsx
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <div className="h-screen overflow-hidden">{children}</div>;
}
```

**Step 2: Create app/app/page.tsx** (main dashboard - connects everything)

```tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SahajWebSocket } from "@/lib/websocket";
import { ChatPanel } from "@/components/voice-chat/chat-panel";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { ChatMessage, UserProfile, Course, Job, ServerResponse, ConversationState } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LANGUAGES = [
  { code: "hi-IN", label: "हिन्दी (Hindi)" },
  { code: "en-IN", label: "English" },
  { code: "bn-IN", label: "বাংলা (Bengali)" },
  { code: "ta-IN", label: "தமிழ் (Tamil)" },
  { code: "te-IN", label: "తెలుగు (Telugu)" },
  { code: "kn-IN", label: "ಕನ್ನಡ (Kannada)" },
  { code: "ml-IN", label: "മലയാളം (Malayalam)" },
  { code: "mr-IN", label: "मराठी (Marathi)" },
  { code: "gu-IN", label: "ગુજરાતી (Gujarati)" },
  { code: "pa-IN", label: "ਪੰਜਾਬੀ (Punjabi)" },
  { code: "od-IN", label: "ଓଡ଼ିଆ (Odia)" },
];

export default function AppPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    name: null, education_level: null, education_stream: null,
    skills: [], work_experience: [], location_preference: null,
    job_type_preference: null, profile_complete: false,
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [state, setState] = useState<ConversationState>("greeting");
  const [language, setLanguage] = useState("hi-IN");
  const [connected, setConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const wsRef = useRef<SahajWebSocket | null>(null);

  const handleServerMessage = useCallback((data: ServerResponse) => {
    setIsProcessing(false);

    if (data.type === "session_init") {
      setUserId(data.user_id || null);
      if (data.profile) setProfile(data.profile);
      if (data.state) setState(data.state as ConversationState);
      return;
    }

    if (data.type === "greeting" || data.type === "response") {
      if (data.transcript) {
        setMessages((prev) => [...prev, {
          id: crypto.randomUUID(),
          role: "user",
          content: data.transcript!,
          timestamp: new Date().toISOString(),
        }]);
      }

      if (data.response_text) {
        setMessages((prev) => [...prev, {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.response_text!,
          audioUrl: data.response_audio || undefined,
          timestamp: new Date().toISOString(),
        }]);
      }

      if (data.profile_update) {
        setProfile((prev) => ({ ...prev, ...data.profile_update }));
      }

      if (data.state) setState(data.state as ConversationState);
      if (data.profile_complete) setProfile((prev) => ({ ...prev, profile_complete: true }));

      if (data.recommendations?.length) {
        if (data.state === "courses") {
          setCourses(data.recommendations as Course[]);
        } else if (data.state === "jobs") {
          setJobs(data.recommendations as Job[]);
        }
      }
    }

    if (data.type === "error") {
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message || "Something went wrong. Please try again.",
        timestamp: new Date().toISOString(),
      }]);
    }
  }, []);

  useEffect(() => {
    const savedUserId = localStorage.getItem("sahaj_user_id");
    const ws = new SahajWebSocket({
      onMessage: handleServerMessage,
      onConnect: () => setConnected(true),
      onDisconnect: () => setConnected(false),
    });
    ws.connect(savedUserId || undefined, language);
    wsRef.current = ws;

    return () => ws.disconnect();
  }, [language, handleServerMessage]);

  useEffect(() => {
    if (userId) localStorage.setItem("sahaj_user_id", userId);
  }, [userId]);

  const handleSendAudio = (audioBlob: Blob) => {
    setIsProcessing(true);
    wsRef.current?.sendAudio(audioBlob);
  };

  const handleSendText = (text: string) => {
    setIsProcessing(true);
    setMessages((prev) => [...prev, {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    }]);
    wsRef.current?.sendText(text);
  };

  const handleStateChange = (newState: string) => {
    wsRef.current?.changeState(newState);
    setState(newState as ConversationState);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <header className="h-14 border-b bg-white px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-blue-900">सहज</span>
          <span className="text-xs text-gray-400">Voice Career Counselor</span>
          <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
        </div>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((l) => (
              <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Chat Panel */}
        <div className="w-2/5 border-r bg-white flex flex-col">
          <ChatPanel
            messages={messages}
            onSendAudio={handleSendAudio}
            onSendText={handleSendText}
            isProcessing={isProcessing}
            connected={connected}
          />
        </div>

        {/* Right: Dashboard */}
        <div className="w-3/5 bg-gray-50 overflow-auto">
          <DashboardPanel
            profile={profile}
            courses={courses}
            jobs={jobs}
            state={state}
            onStateChange={handleStateChange}
          />
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Create each component** (see file list above)

Each component should be a focused React component using shadcn/ui primitives. Build them as simple, data-driven components that receive props from the parent page.

Key components:
- `ChatPanel`: ScrollArea of messages + MicButton + text Input
- `MicButton`: Hold-to-record button using AudioRecorder
- `MessageBubble`: User/assistant message with optional audio play
- `DashboardPanel`: shadcn Tabs wrapper
- `ProfileTab`: Cards showing extracted profile fields
- `CoursesTab`: List of Course cards
- `JobsTab`: List of Job cards
- `InterviewTab`: Interview mode toggle + feedback display
- `ResumeTab`: Generate button + PDF download link

**Step 4: Commit**

```bash
git add frontend/
git commit -m "feat: add main dashboard with voice chat and tabbed panels"
```

---

## Phase 7: Integration & Polish

### Task 14: Docker Compose for Local Development

**Files:**
- Create: `docker-compose.yml`

**Step 1: Create docker-compose.yml**

```yaml
version: "3.9"

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: sahaj
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    env_file:
      - ./backend/.env
    depends_on:
      - db
    volumes:
      - ./backend:/app

volumes:
  pgdata:
```

**Step 2: Create backend Dockerfile**

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

**Step 3: Commit**

```bash
git add docker-compose.yml backend/Dockerfile
git commit -m "feat: add Docker Compose for local development"
```

---

### Task 15: Environment Setup & End-to-End Test

**Step 1: Create .env from .env.example**

Copy `backend/.env.example` to `backend/.env` and fill in real API keys.

**Step 2: Start services**

```bash
docker-compose up -d db
cd backend && uvicorn app.main:app --reload --port 8000
# In another terminal:
cd frontend && npm run dev
```

**Step 3: Test end-to-end**

1. Open `http://localhost:3000` -> landing page loads
2. Click "Start Counseling" -> dashboard loads, WebSocket connects
3. Click mic, speak in Hindi -> transcript appears, Sahaj responds with voice
4. Complete 5-7 discovery questions -> profile panel populates
5. Switch to Courses tab -> course recommendations appear
6. Switch to Jobs tab -> job matches appear
7. Switch to Resume tab -> generate and download PDF

**Step 4: Fix any issues and commit**

```bash
git add -A
git commit -m "feat: complete end-to-end integration and polish"
```

---

## Summary of Tasks

| # | Task | Phase | Estimated Effort |
|---|------|-------|-----------------|
| 1 | Scaffold FastAPI backend | Backend Foundation | Small |
| 2 | Database models & connection | Backend Foundation | Small |
| 3 | User & session services | Backend Foundation | Small |
| 4 | Sarvam AI client (ASR + TTS) | Voice Pipeline | Medium |
| 5 | AWS Bedrock Claude + prompts | LLM Orchestration | Medium |
| 6 | WebSocket voice handler | API | Large |
| 7 | REST API endpoints | API | Small |
| 8 | Seed course & job data | Data | Medium |
| 9 | Resume generation service | Services | Medium |
| 10 | Scaffold Next.js frontend | Frontend Foundation | Small |
| 11 | WebSocket client + audio utils | Frontend Foundation | Medium |
| 12 | Landing page | Frontend | Small |
| 13 | Main dashboard + all panels | Frontend | Large |
| 14 | Docker Compose | DevOps | Small |
| 15 | End-to-end integration test | Integration | Medium |
