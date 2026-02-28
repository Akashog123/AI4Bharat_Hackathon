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
