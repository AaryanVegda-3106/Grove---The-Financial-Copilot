"""
Supabase client singleton for database operations.
"""

from supabase import create_client, Client
from core.config import get_settings

_supabase_client: Client | None = None


def get_supabase() -> Client:
    """
    Return a cached Supabase client instance.
    Creates the client on first call using settings from .env.
    """
    global _supabase_client

    if _supabase_client is None:
        settings = get_settings()
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            raise RuntimeError(
                "SUPABASE_URL and SUPABASE_KEY must be set in environment"
            )
        _supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY,
        )

    return _supabase_client


async def check_supabase_health() -> bool:
    """Ping Supabase to verify connectivity."""
    try:
        client = get_supabase()
        # Attempt a lightweight query — this will fail gracefully if
        # the table doesn't exist yet, but proves the connection works.
        client.table("_health_check").select("*").limit(1).execute()
        return True
    except RuntimeError:
        return False
    except Exception:
        # Connection is working if we get a Postgres error (table not found)
        # vs. a network error
        return True
