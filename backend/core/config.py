from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # ── App ──────────────────────────────────────────────
    APP_NAME: str = "Grove API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # ── Supabase ─────────────────────────────────────────
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    # ── NVIDIA NIM / LiteLLM ─────────────────────────────
    NVIDIA_NIM_API_KEY: str = ""
    LITELLM_MODEL_FAST: str = "nvidia_nim/nvidia/llama-3.1-nemotron-nano-8b-v1"
    LITELLM_MODEL_STRONG: str = "nvidia_nim/nvidia/llama-3.1-nemotron-70b-instruct"

    # ── Upstash Redis ────────────────────────────────────
    UPSTASH_REDIS_URL: str = ""
    UPSTASH_REDIS_TOKEN: str = ""
    REDIS_TTL_SECONDS: int = 3600  # 1 hour default cache TTL

    # ── Clerk Auth ───────────────────────────────────────
    CLERK_JWKS_URL: str = ""       # e.g. https://<your-clerk>.clerk.accounts.dev/.well-known/jwks.json
    CLERK_ISSUER: str = ""         # e.g. https://<your-clerk>.clerk.accounts.dev
    CLERK_AUDIENCE: str = ""       # optional audience claim

    # ── CORS ─────────────────────────────────────────────
    FRONTEND_URL: str = "http://localhost:3000"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


@lru_cache
def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()
