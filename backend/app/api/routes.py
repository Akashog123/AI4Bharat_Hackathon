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
