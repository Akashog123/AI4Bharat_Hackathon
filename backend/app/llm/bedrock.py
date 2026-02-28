import json
import asyncio
import boto3
from app.config import settings

class BedrockClient:
    def __init__(self):
        self._client = None
        self.model_id = settings.bedrock_model_id

    @property
    def client(self):
        if not self._client:
            self._client = boto3.client(
                "bedrock-runtime",
                region_name=settings.aws_region,
                aws_access_key_id=settings.aws_access_key_id or None,
                aws_secret_access_key=settings.aws_secret_access_key or None,
            )
        return self._client

    async def chat(self, system_prompt: str, messages: list[dict]) -> dict:
        """Send a conversation to Claude via Bedrock and get structured JSON response."""
        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1024,
            "system": system_prompt,
            "messages": messages,
        })

        def _invoke():
            return self.client.invoke_model(
                modelId=self.model_id,
                body=body,
                contentType="application/json",
                accept="application/json",
            )

        # Fix CRITICAL 2: Run blocking call in thread pool
        response = await asyncio.to_thread(_invoke)

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
