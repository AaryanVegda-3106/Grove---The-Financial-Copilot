"""
LLM service powered by LiteLLM → NVIDIA NIM.
"""

import litellm
from core.config import get_settings

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
) -> str:
    """
    Send a chat completion request via LiteLLM.

    Args:
        messages: List of {"role": "user"|"assistant", "content": "..."} dicts.
        model: Override the default model from settings.
        system_prompt: Override the default Grove system prompt.
        temperature: Sampling temperature (0-1).
        max_tokens: Maximum tokens in the response.

    Returns:
        The assistant's response text.
    """
    _configure_litellm()
    settings = get_settings()

    # Build the full message list with system prompt
    full_messages = [
        {"role": "system", "content": system_prompt or GROVE_SYSTEM_PROMPT}
    ]
    full_messages.extend(messages)

    response = await litellm.acompletion(
        model=model or settings.LITELLM_MODEL,
        messages=full_messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )

    return response.choices[0].message.content


async def chat_completion_stream(
    messages: list[dict],
    model: str | None = None,
    system_prompt: str | None = None,
    temperature: float = 0.7,
    max_tokens: int = 1024,
):
    """
    Stream a chat completion response via LiteLLM.

    Yields:
        Chunks of the assistant's response text.
    """
    _configure_litellm()
    settings = get_settings()

    full_messages = [
        {"role": "system", "content": system_prompt or GROVE_SYSTEM_PROMPT}
    ]
    full_messages.extend(messages)

    response = await litellm.acompletion(
        model=model or settings.LITELLM_MODEL,
        messages=full_messages,
        temperature=temperature,
        max_tokens=max_tokens,
        stream=True,
    )

    async for chunk in response:
        delta = chunk.choices[0].delta
        if delta and delta.content:
            yield delta.content
