"""
Upstash Redis client for caching and rate limiting.
"""

import json
from typing import Any
from upstash_redis import Redis
from core.config import get_settings

_redis_client: Redis | None = None


def get_redis() -> Redis:
    """
    Return a cached Upstash Redis client instance.
    Uses REST-based Upstash SDK (no persistent TCP connection needed).
    """
    global _redis_client

    if _redis_client is None:
        settings = get_settings()
        if not settings.UPSTASH_REDIS_URL or not settings.UPSTASH_REDIS_TOKEN:
            raise RuntimeError(
                "UPSTASH_REDIS_URL and UPSTASH_REDIS_TOKEN must be set in environment"
            )
        _redis_client = Redis(
            url=settings.UPSTASH_REDIS_URL,
            token=settings.UPSTASH_REDIS_TOKEN,
        )

    return _redis_client


def cache_get(key: str) -> Any | None:
    """
    Retrieve a JSON-serialized value from Redis.
    Returns None if key doesn't exist or Redis is unavailable.
    """
    try:
        client = get_redis()
        value = client.get(key)
        if value is None:
            return None
        if isinstance(value, str):
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return value
        return value
    except Exception:
        return None


def cache_set(key: str, value: Any, ttl: int | None = None) -> bool:
    """
    Store a JSON-serialized value in Redis with optional TTL.
    Returns True on success, False on failure.
    """
    try:
        settings = get_settings()
        client = get_redis()
        serialized = json.dumps(value) if not isinstance(value, str) else value
        ex = ttl or settings.REDIS_TTL_SECONDS
        client.set(key, serialized, ex=ex)
        return True
    except Exception:
        return False


def cache_delete(key: str) -> bool:
    """Delete a key from Redis."""
    try:
        client = get_redis()
        client.delete(key)
        return True
    except Exception:
        return False


async def check_redis_health() -> bool:
    """Ping Redis to verify connectivity."""
    try:
        client = get_redis()
        result = client.ping()
        return result == "PONG" or result is True
    except Exception:
        return False
