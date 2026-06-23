"""
User router — profile management and onboarding.
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status

from core.auth import get_current_user
from core.supabase import get_supabase
from schemas.user import (
    UserProfile,
    UserProfileUpdate,
    OnboardingRequest,
    OnboardingResponse,
)

router = APIRouter(prefix="/api/user", tags=["user"])


@router.get("/profile", response_model=UserProfile)
async def get_profile(
    user: dict = Depends(get_current_user),
):
    """
    Get the current user's profile.

    If the profile doesn't exist yet (first login), it will be auto-created
    from Clerk JWT claims.
    """
    user_id = user["sub"]
    db = get_supabase()

    result = (
        db.table("profiles")
        .select("*")
        .eq("clerk_id", user_id)
        .execute()
    )

    if result.data:
        return UserProfile(**result.data[0])

    # Auto-create profile on first access
    now = datetime.now(timezone.utc).isoformat()
    new_profile = {
        "clerk_id": user_id,
        "email": user.get("email") or user.get("email_address"),
        "name": user.get("name") or user.get("first_name", ""),
        "onboarding_completed": False,
        "created_at": now,
        "updated_at": now,
    }

    db.table("profiles").insert(new_profile).execute()

    return UserProfile(**new_profile)


@router.put("/profile", response_model=UserProfile)
async def update_profile(
    updates: UserProfileUpdate,
    user: dict = Depends(get_current_user),
):
    """Update the current user's profile fields."""
    user_id = user["sub"]
    db = get_supabase()
    now = datetime.now(timezone.utc).isoformat()

    update_data = updates.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )

    update_data["updated_at"] = now

    result = (
        db.table("profiles")
        .update(update_data)
        .eq("clerk_id", user_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Access GET /api/user/profile first.",
        )

    return UserProfile(**result.data[0])


@router.post("/onboarding", response_model=OnboardingResponse)
async def complete_onboarding(
    request: OnboardingRequest,
    user: dict = Depends(get_current_user),
):
    """
    Save the user's onboarding answers and mark onboarding as complete.

    This stores financial goals, risk tolerance, and income data that
    personalizes the AI copilot's advice.
    """
    user_id = user["sub"]
    db = get_supabase()
    now = datetime.now(timezone.utc).isoformat()

    # Store onboarding data
    onboarding_data = {
        "clerk_id": user_id,
        "financial_goals": request.financial_goals,
        "risk_tolerance": request.risk_tolerance,
        "monthly_income": request.monthly_income,
        "monthly_expenses": request.monthly_expenses,
        "created_at": now,
    }

    # Upsert onboarding answers
    db.table("onboarding").upsert(
        onboarding_data,
        on_conflict="clerk_id",
    ).execute()

    # Mark profile as onboarded
    profile_result = (
        db.table("profiles")
        .update({"onboarding_completed": True, "updated_at": now})
        .eq("clerk_id", user_id)
        .execute()
    )

    if not profile_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Access GET /api/user/profile first.",
        )

    return OnboardingResponse(
        message="Onboarding completed successfully",
        profile=UserProfile(**profile_result.data[0]),
    )
