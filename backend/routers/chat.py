"""
Chat router — AI-powered financial conversation endpoints.
"""

import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status

from core.auth import get_current_user
from core.supabase import get_supabase
from core.redis import cache_get, cache_set
from core.llm import chat_completion
from schemas.chat import (
    ChatRequest,
    ChatResponse,
    ConversationSummary,
    ConversationDetail,
    ChatMessage,
)

router = APIRouter(prefix="/api/chat", tags=["chat"])


def _conversation_cache_key(conversation_id: str) -> str:
    """Build a Redis cache key for a conversation."""
    return f"conversation:{conversation_id}"


@router.post("", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    user: dict = Depends(get_current_user),
):
    """
    Send a message to the AI financial copilot and get a response.

    - If `conversation_id` is provided, continues that conversation.
    - If omitted, starts a new conversation.
    """
    user_id = user["sub"]
    db = get_supabase()
    now = datetime.now(timezone.utc).isoformat()

    # ── Resolve or create conversation ───────────────────
    if request.conversation_id:
        conversation_id = request.conversation_id

        # Verify the conversation belongs to this user
        result = (
            db.table("conversations")
            .select("id")
            .eq("id", conversation_id)
            .eq("user_id", user_id)
            .execute()
        )
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found",
            )
    else:
        conversation_id = str(uuid.uuid4())
        # Generate a title from the first message (truncated)
        title = request.message[:80] + ("..." if len(request.message) > 80 else "")
        db.table("conversations").insert(
            {
                "id": conversation_id,
                "user_id": user_id,
                "title": title,
                "created_at": now,
                "updated_at": now,
            }
        ).execute()

    # ── Load conversation history ────────────────────────
    cached = cache_get(_conversation_cache_key(conversation_id))
    if cached:
        history = cached
    else:
        result = (
            db.table("messages")
            .select("role, content")
            .eq("conversation_id", conversation_id)
            .order("created_at")
            .execute()
        )
        history = [{"role": m["role"], "content": m["content"]} for m in (result.data or [])]

    # ── Append the new user message ──────────────────────
    user_msg_id = str(uuid.uuid4())
    db.table("messages").insert(
        {
            "id": user_msg_id,
            "conversation_id": conversation_id,
            "role": "user",
            "content": request.message,
            "created_at": now,
        }
    ).execute()

    history.append({"role": "user", "content": request.message})

    # ── Get AI response (with automatic model routing) ──
    try:
        ai_response, model_tier = await chat_completion(messages=history)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"LLM service error: {str(e)}",
        )

    # ── Store AI response ────────────────────────────────
    assistant_msg_id = str(uuid.uuid4())
    response_now = datetime.now(timezone.utc).isoformat()
    db.table("messages").insert(
        {
            "id": assistant_msg_id,
            "conversation_id": conversation_id,
            "role": "assistant",
            "content": ai_response,
            "created_at": response_now,
        }
    ).execute()

    # Update conversation timestamp
    db.table("conversations").update(
        {"updated_at": response_now}
    ).eq("id", conversation_id).execute()

    # ── Update cache ─────────────────────────────────────
    history.append({"role": "assistant", "content": ai_response})
    cache_set(_conversation_cache_key(conversation_id), history)

    return ChatResponse(
        response=ai_response,
        conversation_id=conversation_id,
        message_id=assistant_msg_id,
        model_tier=model_tier.value,
    )


@router.get("/history", response_model=list[ConversationSummary])
async def list_conversations(
    user: dict = Depends(get_current_user),
):
    """List all conversations for the current user, most recent first."""
    user_id = user["sub"]
    db = get_supabase()

    result = (
        db.table("conversations")
        .select("*")
        .eq("user_id", user_id)
        .order("updated_at", desc=True)
        .limit(50)
        .execute()
    )

    conversations = []
    for conv in result.data or []:
        # Get the last message for preview
        last_msg = (
            db.table("messages")
            .select("content")
            .eq("conversation_id", conv["id"])
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        # Get message count
        msg_count = (
            db.table("messages")
            .select("id", count="exact")
            .eq("conversation_id", conv["id"])
            .execute()
        )

        conversations.append(
            ConversationSummary(
                id=conv["id"],
                title=conv.get("title"),
                last_message=last_msg.data[0]["content"] if last_msg.data else None,
                message_count=msg_count.count or 0,
                created_at=conv["created_at"],
                updated_at=conv["updated_at"],
            )
        )

    return conversations


@router.get("/{conversation_id}", response_model=ConversationDetail)
async def get_conversation(
    conversation_id: str,
    user: dict = Depends(get_current_user),
):
    """Get all messages in a specific conversation."""
    user_id = user["sub"]
    db = get_supabase()

    # Verify ownership
    conv_result = (
        db.table("conversations")
        .select("*")
        .eq("id", conversation_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not conv_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    conv = conv_result.data[0]

    # Fetch all messages
    msg_result = (
        db.table("messages")
        .select("*")
        .eq("conversation_id", conversation_id)
        .order("created_at")
        .execute()
    )

    messages = [
        ChatMessage(
            id=m["id"],
            role=m["role"],
            content=m["content"],
            timestamp=m["created_at"],
        )
        for m in (msg_result.data or [])
    ]

    return ConversationDetail(
        id=conv["id"],
        title=conv.get("title"),
        messages=messages,
        created_at=conv["created_at"],
        updated_at=conv["updated_at"],
    )
