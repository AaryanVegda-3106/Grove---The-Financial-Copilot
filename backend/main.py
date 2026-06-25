"""
Grove API — AI-powered financial copilot for students.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from core.config import get_settings
from routers.health import router as health_router
from routers.chat import router as chat_router
from routers.user import router as user_router
from routers.finance import router as finance_router

settings = get_settings()


# ── Lifespan ─────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.
    Runs startup logic before yield, cleanup logic after.
    """
    # ── Startup ──────────────────────────────────────────
    print(f"{settings.APP_NAME} v{settings.APP_VERSION} starting...")
    print(f"   Debug mode: {settings.DEBUG}")
    print(f"   Frontend:   {settings.FRONTEND_URL}")

    # Eagerly validate critical config (warn, don't crash)
    if not settings.SUPABASE_URL:
        print("   ⚠️  SUPABASE_URL not set — database features disabled")
    if not settings.CLERK_JWKS_URL:
        print("   ⚠️  CLERK_JWKS_URL not set — auth will fail")
    if not settings.NVIDIA_NIM_API_KEY:
        print("   ⚠️  NVIDIA_NIM_API_KEY not set — chat features disabled")

    print(f"{settings.APP_NAME} ready!")

    yield

    # ── Shutdown ─────────────────────────────────────────
    print(f"{settings.APP_NAME} shutting down...")


# ── App ──────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Grove — AI-powered financial copilot for students.",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────
app.include_router(health_router)
app.include_router(chat_router)
app.include_router(user_router)
app.include_router(finance_router)


# ── Global Exception Handlers ───────────────────────────────
@app.exception_handler(401)
async def auth_exception_handler(request: Request, exc):
    """Handle authentication errors with a consistent format."""
    return JSONResponse(
        status_code=401,
        content={
            "error": "unauthorized",
            "detail": "Authentication required. Provide a valid Bearer token.",
        },
    )


@app.exception_handler(422)
async def validation_exception_handler(request: Request, exc):
    """Handle validation errors with a consistent format."""
    return JSONResponse(
        status_code=422,
        content={
            "error": "validation_error",
            "detail": str(exc),
        },
    )


# ── Root ─────────────────────────────────────────────────────
@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to the Grove API 🌿",
        "docs": "/docs",
        "version": settings.APP_VERSION,
    }
