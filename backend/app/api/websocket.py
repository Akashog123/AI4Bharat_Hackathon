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
