"""
Pydantic schemas for financial data — expenses, budgets, and summaries.
"""

from datetime import date, datetime
from pydantic import BaseModel, Field


class ExpenseCreate(BaseModel):
    """Create a new expense entry."""

    category: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Expense category (e.g., 'food', 'transport', 'textbooks').",
    )
    amount: float = Field(
        ...,
        gt=0,
        description="Expense amount in USD.",
    )
    date: date = Field(
        default_factory=date.today,
        description="Date of the expense.",
    )
    description: str | None = Field(
        default=None,
        max_length=500,
        description="Optional note about the expense.",
    )


class Expense(BaseModel):
    """An expense record from the database."""

    id: str
    user_id: str
    category: str
    amount: float
    date: date
    description: str | None = None
    created_at: datetime


class ExpenseList(BaseModel):
    """Paginated list of expenses."""

    expenses: list[Expense] = []
    total_count: int = 0
    total_amount: float = 0.0


class BudgetCreate(BaseModel):
    """Set a budget limit for a category."""

    category: str = Field(..., min_length=1, max_length=100)
    limit: float = Field(..., gt=0, description="Monthly budget limit in USD.")


class Budget(BaseModel):
    """Budget overview for a category."""

    id: str
    category: str
    limit: float
    spent: float = 0.0
    remaining: float = 0.0
    percentage_used: float = 0.0


class FinancialSummary(BaseModel):
    """High-level financial overview for the user."""

    total_income: float = 0.0
    total_expenses: float = 0.0
    net_savings: float = 0.0
    savings_rate: float = Field(
        default=0.0,
        description="Savings as a percentage of income (0-100).",
    )
    top_categories: list[dict] = Field(
        default=[],
        description="Top spending categories with amounts.",
    )
    budget_status: list[Budget] = Field(
        default=[],
        description="Budget usage for each tracked category.",
    )
