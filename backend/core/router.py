"""
Query Router — classifies user messages to select the right model tier.

Uses lightweight heuristics (no LLM call for routing) to decide:
  • FAST  → Nemotron Nano 8B  (greetings, definitions, simple Q&A)
  • STRONG → Nemotron 70B      (planning, analysis, multi-step reasoning)
"""

import re
from enum import Enum

from core.config import get_settings


class ModelTier(str, Enum):
    """Which model tier to use for a query."""
    FAST = "fast"
    STRONG = "strong"


# ── Patterns that signal a COMPLEX query ─────────────────────
_COMPLEX_SIGNALS: list[re.Pattern] = [
    # Planning & strategy
    re.compile(r"\b(plan|budget|strategy|roadmap|allocat|optimiz|rebalance)\b", re.I),
    # Analysis & comparison
    re.compile(r"\b(analy[sz]|compar|evaluat|assess|review my|break\s*down)\b", re.I),
    # Multi-step / detailed
    re.compile(r"\b(step[- ]by[- ]step|detail|in[- ]depth|comprehensive|thorough)\b", re.I),
    # Financial calculations
    re.compile(r"\b(calculat|compound|interest rate|amortiz|roi|return on|cagr|npv|irr)\b", re.I),
    # Investment reasoning
    re.compile(r"\b(invest|portfolio|mutual fund|stock|bond|equity|sip|etf|diversif)\b", re.I),
    # Debt & loans
    re.compile(r"\b(loan|emi|debt|repay|mortgage|credit score)\b", re.I),
    # Tax
    re.compile(r"\b(tax|deduction|80c|80d|huf|itr|filing)\b", re.I),
    # Long messages (likely complex)
    re.compile(r".{300,}", re.S),
]

# ── Patterns that signal a SIMPLE query ──────────────────────
_SIMPLE_SIGNALS: list[re.Pattern] = [
    # Greetings
    re.compile(r"^\s*(hi|hello|hey|good\s*(morning|evening|afternoon)|thanks|thank you|bye|okay|ok)\s*[!?.]*\s*$", re.I),
    # Simple definitions
    re.compile(r"^\s*(what\s+is|define|meaning\s+of|explain)\s+\w+(\s+\w+){0,3}\s*\??\s*$", re.I),
    # Yes/No answers
    re.compile(r"^\s*(yes|no|sure|nope|yep|nah|got it)\s*[!?.]*\s*$", re.I),
    # Very short messages
    re.compile(r"^.{1,30}$", re.S),
]


def classify_query(message: str) -> ModelTier:
    """
    Classify a user message into a model tier.

    The algorithm scores the message:
      +1 for each complex signal matched
      -1 for each simple signal matched
    If score > 0 → STRONG, otherwise → FAST.

    Args:
        message: The latest user message text.

    Returns:
        ModelTier.FAST or ModelTier.STRONG
    """
    score = 0

    for pattern in _COMPLEX_SIGNALS:
        if pattern.search(message):
            score += 1

    for pattern in _SIMPLE_SIGNALS:
        if pattern.search(message):
            score -= 1

    return ModelTier.STRONG if score > 0 else ModelTier.FAST


def get_model_for_tier(tier: ModelTier) -> str:
    """
    Return the LiteLLM model string for a given tier.

    Args:
        tier: The model tier (FAST or STRONG).

    Returns:
        The model identifier string from settings.
    """
    settings = get_settings()
    if tier == ModelTier.STRONG:
        return settings.LITELLM_MODEL_STRONG
    return settings.LITELLM_MODEL_FAST


def route_query(message: str) -> tuple[str, ModelTier]:
    """
    Convenience function: classify and return (model_string, tier).

    Args:
        message: The user's latest message.

    Returns:
        Tuple of (litellm_model_string, tier).
    """
    tier = classify_query(message)
    model = get_model_for_tier(tier)
    return model, tier
