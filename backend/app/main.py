from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from contextlib import asynccontextmanager
from app.db.database import init_db
from app.api.websocket import voice_handler

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.websocket("/ws/voice")
async def voice_ws(websocket: WebSocket):
    await voice_handler.handle(websocket)

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "sahaj-api"}
