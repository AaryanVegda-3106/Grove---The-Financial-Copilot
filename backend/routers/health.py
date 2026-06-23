"""
Health check endpoint with dependency status.
"""

from fastapi import APIRouter
from core.config import get_settings
from core.supabase import check_supabase_health
from core.redis import check_redis_health

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check():
    """
    Health check endpoint that reports status of all dependencies.

    Returns:
        - "healthy" if all dependencies are reachable
        - "degraded" if some dependencies are down
        - "unhealthy" if critical services are unreachable
    """
    settings = get_settings()

    supabase_ok = await check_supabase_health()
    redis_ok = await check_redis_health()

    dependencies = {
        "supabase": "connected" if supabase_ok else "disconnected",
        "redis": "connected" if redis_ok else "disconnected",
    }

    all_healthy = all([supabase_ok, redis_ok])
    any_healthy = any([supabase_ok, redis_ok])

    if all_healthy:
        overall_status = "healthy"
    elif any_healthy:
        overall_status = "degraded"
    else:
        overall_status = "unhealthy"

    return {
        "status": overall_status,
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "dependencies": dependencies,
    }
