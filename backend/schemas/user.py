"""
Pydantic schemas for user profiles and onboarding.
"""

from datetime import datetime
from pydantic import BaseModel, Field


class UserProfile(BaseModel):
    """User profile stored in Supabase."""

    clerk_id: str
    email: str | None = None
    name: str | None = None
    avatar_url: str | None = None
    onboarding_completed: bool = False
    created_at: datetime | None = None
    updated_at: datetime | None = None


class UserProfileUpdate(BaseModel):
    """Fields that can be updated on the user profile."""

    name: str | None = None
    avatar_url: str | None = None


class OnboardingRequest(BaseModel):
    """Onboarding form data submitted after sign-up."""

    financial_goals: list[str] = Field(
        ...,
        min_length=1,
        max_length=10,
        description="User's financial goals (e.g., 'save for tuition', 'build emergency fund').",
    )
    risk_tolerance: str = Field(
        ...,
        description="Risk tolerance level: 'conservative', 'moderate', or 'aggressive'.",
    )
    monthly_income: float | None = Field(
        default=None,
        ge=0,
        description="Approximate monthly income in USD.",
    )
    monthly_expenses: float | None = Field(
        default=None,
        ge=0,
        description="Approximate monthly expenses in USD.",
    )


class OnboardingResponse(BaseModel):
    """Response after completing onboarding."""

    message: str = "Onboarding completed successfully"
    profile: UserProfile
