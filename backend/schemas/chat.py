"""
Pydantic schemas for the chat system.
"""

from datetime import datetime, timezone
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """Incoming chat message from the user."""

    message: str = Field(
        ...,
        min_length=1,
        max_length=4000,
        description="The user's message to the financial copilot.",
    )
    conversation_id: str | None = Field(
        default=None,
        description="Existing conversation ID to continue. Omit to start new.",
    )


class ChatMessage(BaseModel):
    """A single message in a conversation."""

    id: str | None = None
    role: str = Field(
        ...,
        description="Message role: 'user' or 'assistant'.",
    )
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ChatResponse(BaseModel):
    """Response from the AI copilot."""

    response: str = Field(..., description="The assistant's reply.")
    conversation_id: str = Field(
        ..., description="Conversation ID for follow-up messages."
    )
    message_id: str | None = Field(
        default=None, description="Unique ID of this response message."
    )
    model_tier: str | None = Field(
        default=None, description="Model tier used: 'fast' or 'strong'."
    )


class ConversationSummary(BaseModel):
    """Summary of a conversation for listing purposes."""

    id: str
    title: str | None = None
    last_message: str | None = None
    message_count: int = 0
    created_at: datetime
    updated_at: datetime


class ConversationDetail(BaseModel):
    """Full conversation with all messages."""

    id: str
    title: str | None = None
    messages: list[ChatMessage] = []
    created_at: datetime
    updated_at: datetime
