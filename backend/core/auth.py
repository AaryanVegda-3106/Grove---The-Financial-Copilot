"""
Clerk JWT authentication for FastAPI.

Verifies Bearer tokens issued by Clerk using their JWKS endpoint.
"""

import jwt
import httpx
from typing import Annotated
from fastapi import Depends, HTTPException, Header, status
from core.config import get_settings, Settings

# ── JWKS key cache ───────────────────────────────────────────
_jwks_cache: dict | None = None


async def _fetch_jwks(jwks_url: str) -> dict:
    """Fetch and cache the JWKS from Clerk."""
    global _jwks_cache

    if _jwks_cache is not None:
        return _jwks_cache

    async with httpx.AsyncClient() as client:
        response = await client.get(jwks_url)
        response.raise_for_status()
        _jwks_cache = response.json()
        return _jwks_cache


def _get_signing_key(jwks: dict, token: str) -> jwt.algorithms.RSAAlgorithm:
    """Extract the correct signing key from JWKS based on the token's kid."""
    unverified_header = jwt.get_unverified_header(token)
    kid = unverified_header.get("kid")

    if not kid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing 'kid' header",
        )

    for key_data in jwks.get("keys", []):
        if key_data.get("kid") == kid:
            return jwt.algorithms.RSAAlgorithm.from_jwk(key_data)

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Unable to find matching signing key",
    )


async def verify_clerk_token(token: str) -> dict:
    """
    Verify a Clerk JWT and return the decoded payload.

    Returns a dict with at least:
        - sub: Clerk user ID
        - email: User email (if available)
        - iat: Issued at timestamp
        - exp: Expiration timestamp
    """
    settings = get_settings()

    if not settings.CLERK_JWKS_URL:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="CLERK_JWKS_URL not configured",
        )

    jwks = await _fetch_jwks(settings.CLERK_JWKS_URL)
    public_key = _get_signing_key(jwks, token)

    try:
        decode_options = {
            "verify_aud": bool(settings.CLERK_AUDIENCE),
        }

        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            issuer=settings.CLERK_ISSUER or None,
            audience=settings.CLERK_AUDIENCE or None,
            options=decode_options,
        )
        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except jwt.InvalidIssuerError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token issuer",
        )
    except jwt.InvalidAudienceError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token audience",
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
        )


async def get_current_user(
    authorization: Annotated[str, Header()],
) -> dict:
    """
    FastAPI dependency that extracts and verifies the Clerk JWT.

    Usage:
        @router.get("/protected")
        async def protected_route(user: dict = Depends(get_current_user)):
            user_id = user["sub"]
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header must start with 'Bearer '",
        )

    token = authorization[7:]  # Strip "Bearer "
    return await verify_clerk_token(token)


def clear_jwks_cache() -> None:
    """Clear the cached JWKS (useful for key rotation)."""
    global _jwks_cache
    _jwks_cache = None
