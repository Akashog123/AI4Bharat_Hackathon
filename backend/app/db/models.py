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
