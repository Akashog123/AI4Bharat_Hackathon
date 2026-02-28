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
