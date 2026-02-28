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

        # Build message history for Claude (last 10 messages max, ensuring valid ordering)
        claude_messages = []
        history = messages_history or []

        # Ensure we start with a user message for Claude
        start_idx = max(0, len(history) - 10)
        while start_idx < len(history):
            if history[start_idx].get("role") == "user":
                break
            start_idx += 1

        # Add messages, ensuring no consecutive same-role messages
        last_role = None
        for msg in history[start_idx:]:
            current_role = msg.get("role")
            if current_role and current_role != last_role:
                claude_messages.append({
                    "role": current_role,
                    "content": msg.get("content", ""),
                })
                last_role = current_role
            elif current_role == last_role and len(claude_messages) > 0:
                # Append to previous message if same role
                claude_messages[-1]["content"] += "\n" + msg.get("content", "")

        # Add current message
        if last_role == "user":
            # If the last message was also user, we append to it to maintain alternating roles
            claude_messages[-1]["content"] += "\n" + user_message
        else:
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
