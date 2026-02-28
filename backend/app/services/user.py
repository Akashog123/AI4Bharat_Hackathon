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

        # Fix HIGH 6: Mass assignment vulnerability
        ALLOWED_FIELDS = {
            "education_level", "education_stream", "skills", "work_experience",
            "location", "location_preference", "job_type_preference",
            "preferred_language", "profile_complete", "discovery_step", "name"
        }

        for key, value in updates.items():
            if key in ALLOWED_FIELDS and hasattr(user, key):
                setattr(user, key, value)
        await self.db.commit()
        await self.db.refresh(user)
        return user
