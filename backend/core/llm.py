"""
LLM service powered by LiteLLM → NVIDIA NIM.

Supports dual-model routing:
  • FAST  → Nemotron Nano 8B   (greetings, definitions, simple Q&A)
  • STRONG → Nemotron 70B       (planning, analysis, multi-step reasoning)
"""

import logging
import litellm
from core.config import get_settings
from core.router import route_query, ModelTier

logger = logging.getLogger(__name__)

# ── Default system prompt for the financial copilot ──────────
GROVE_SYSTEM_PROMPT = """You are Grove 🌿, an AI-powered financial copilot designed specifically for students and young adults.

Your role:
- Help users understand personal finance concepts in simple, approachable language.
- Assist with budgeting, expense tracking, savings goals, and basic investing education.
- Provide actionable, step-by-step financial advice tailored to a student's situation.
- Be encouraging and non-judgmental — many users are learning about money for the first time.

Guidelines:
- Always clarify that you provide educational guidance, NOT professional financial advice.
- Use relatable examples (textbooks, part-time jobs, student loans, dorm expenses).
- When discussing investments, emphasize risk awareness and long-term thinking.
- Keep responses concise but thorough. Use bullet points and structure for clarity.
- If a question is outside your scope (tax law, specific stock picks), say so honestly and suggest consulting a professional.

Tone: Warm, knowledgeable, and empowering — like a financially savvy older sibling."""


def _configure_litellm() -> None:
    """Set API keys and configuration for LiteLLM."""
    settings = get_settings()
    if settings.NVIDIA_NIM_API_KEY:
        litellm.api_key = settings.NVIDIA_NIM_API_KEY
    # Drop unsupported params silently instead of raising
    litellm.drop_params = True


async def chat_completion(
    messages: list[dict],
    model: str | None = None,
    system_prompt: str | None = None,
    temperature: float = 0.7,
    max_tokens: int = 1024,
) -> tuple[str, ModelTier]:
    """
    Send a chat completion request via LiteLLM with automatic model routing.

    If no explicit model is provided, the router classifies the latest user
    message and selects the appropriate model tier (FAST or STRONG).

    Args:
        messages: List of {"role": "user"|"assistant", "content": "..."} dicts.
        model: Override the router and force a specific model.
        system_prompt: Override the default Grove system prompt.
        temperature: Sampling temperature (0-1).
        max_tokens: Maximum tokens in the response.

    Returns:
        Tuple of (response_text, model_tier).
    """
    _configure_litellm()

    # ── Route to the right model ─────────────────────────
    if model:
        selected_model = model
        tier = ModelTier.STRONG  # Explicit override → treat as strong
    else:
        # Use the latest user message for classification
        latest_user_msg = ""
        for msg in reversed(messages):
            if msg.get("role") == "user":
                latest_user_msg = msg.get("content", "")
                break
        selected_model, tier = route_query(latest_user_msg)

    logger.info(f"🌿 Router → {tier.value.upper()} model: {selected_model}")

    # ── Build the full message list with system prompt ───
    full_messages = [
        {"role": "system", "content": system_prompt or GROVE_SYSTEM_PROMPT}
    ]
    full_messages.extend(messages)

    response = await litellm.acompletion(
        model=selected_model,
        messages=full_messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )

    return response.choices[0].message.content, tier


async def chat_completion_stream(
    messages: list[dict],
    model: str | None = None,
    system_prompt: str | None = None,
    temperature: float = 0.7,
    max_tokens: int = 1024,
):
    """
    Stream a chat completion response via LiteLLM with automatic model routing.

    Yields:
        Chunks of the assistant's response text.
        After all chunks, the tier can be accessed via the .tier attribute
        set on the generator (not directly available in async generators).
    """
    _configure_litellm()

    # ── Route to the right model ─────────────────────────
    if model:
        selected_model = model
    else:
        latest_user_msg = ""
        for msg in reversed(messages):
            if msg.get("role") == "user":
                latest_user_msg = msg.get("content", "")
                break
        selected_model, _ = route_query(latest_user_msg)

    logger.info(f"🌿 Router (stream) → {selected_model}")

    full_messages = [
        {"role": "system", "content": system_prompt or GROVE_SYSTEM_PROMPT}
    ]
    full_messages.extend(messages)

    response = await litellm.acompletion(
        model=selected_model,
        messages=full_messages,
        temperature=temperature,
        max_tokens=max_tokens,
        stream=True,
    )

    async for chunk in response:
        delta = chunk.choices[0].delta
        if delta and delta.content:
            yield delta.content
