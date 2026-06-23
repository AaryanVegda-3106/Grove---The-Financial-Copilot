"""
Finance router — expense tracking, budgets, and financial summaries.
"""

import uuid
from datetime import date, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status

from core.auth import get_current_user
from core.supabase import get_supabase
from schemas.finance import (
    ExpenseCreate,
    Expense,
    ExpenseList,
    BudgetCreate,
    Budget,
    FinancialSummary,
)

router = APIRouter(prefix="/api/finance", tags=["finance"])


# ── Expenses ─────────────────────────────────────────────────


@router.post("/expenses", response_model=Expense, status_code=status.HTTP_201_CREATED)
async def create_expense(
    expense: ExpenseCreate,
    user: dict = Depends(get_current_user),
):
    """Add a new expense entry."""
    user_id = user["sub"]
    db = get_supabase()
    now = datetime.now(timezone.utc).isoformat()

    expense_data = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "category": expense.category.lower().strip(),
        "amount": expense.amount,
        "date": expense.date.isoformat(),
        "description": expense.description,
        "created_at": now,
    }

    result = db.table("expenses").insert(expense_data).execute()

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create expense",
        )

    return Expense(**result.data[0])


@router.get("/expenses", response_model=ExpenseList)
async def list_expenses(
    user: dict = Depends(get_current_user),
    start_date: date | None = Query(default=None, description="Filter from this date"),
    end_date: date | None = Query(default=None, description="Filter until this date"),
    category: str | None = Query(default=None, description="Filter by category"),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    """
    List expenses with optional date range and category filters.
    """
    user_id = user["sub"]
    db = get_supabase()

    query = (
        db.table("expenses")
        .select("*", count="exact")
        .eq("user_id", user_id)
    )

    if start_date:
        query = query.gte("date", start_date.isoformat())
    if end_date:
        query = query.lte("date", end_date.isoformat())
    if category:
        query = query.eq("category", category.lower().strip())

    result = (
        query
        .order("date", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )

    expenses = [Expense(**e) for e in (result.data or [])]
    total_amount = sum(e.amount for e in expenses)

    return ExpenseList(
        expenses=expenses,
        total_count=result.count or len(expenses),
        total_amount=total_amount,
    )


@router.delete("/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(
    expense_id: str,
    user: dict = Depends(get_current_user),
):
    """Delete an expense entry."""
    user_id = user["sub"]
    db = get_supabase()

    result = (
        db.table("expenses")
        .delete()
        .eq("id", expense_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found",
        )


# ── Budgets ──────────────────────────────────────────────────


@router.post("/budgets", response_model=Budget, status_code=status.HTTP_201_CREATED)
async def create_or_update_budget(
    budget: BudgetCreate,
    user: dict = Depends(get_current_user),
):
    """
    Create or update a budget limit for a category.
    If a budget already exists for this category, it will be updated.
    """
    user_id = user["sub"]
    db = get_supabase()
    now = datetime.now(timezone.utc).isoformat()
    category = budget.category.lower().strip()

    budget_data = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "category": category,
        "limit": budget.limit,
        "created_at": now,
        "updated_at": now,
    }

    result = (
        db.table("budgets")
        .upsert(budget_data, on_conflict="user_id,category")
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create budget",
        )

    # Calculate spent amount for this category (current month)
    today = date.today()
    first_of_month = today.replace(day=1).isoformat()

    spent_result = (
        db.table("expenses")
        .select("amount")
        .eq("user_id", user_id)
        .eq("category", category)
        .gte("date", first_of_month)
        .execute()
    )

    spent = sum(e["amount"] for e in (spent_result.data or []))
    budget_record = result.data[0]

    return Budget(
        id=budget_record["id"],
        category=budget_record["category"],
        limit=budget_record["limit"],
        spent=spent,
        remaining=max(0, budget_record["limit"] - spent),
        percentage_used=round((spent / budget_record["limit"]) * 100, 1) if budget_record["limit"] > 0 else 0,
    )


@router.get("/budgets", response_model=list[Budget])
async def list_budgets(
    user: dict = Depends(get_current_user),
):
    """Get all budgets with current month spending."""
    user_id = user["sub"]
    db = get_supabase()

    result = (
        db.table("budgets")
        .select("*")
        .eq("user_id", user_id)
        .execute()
    )

    today = date.today()
    first_of_month = today.replace(day=1).isoformat()

    budgets = []
    for b in result.data or []:
        # Calculate spent for each category
        spent_result = (
            db.table("expenses")
            .select("amount")
            .eq("user_id", user_id)
            .eq("category", b["category"])
            .gte("date", first_of_month)
            .execute()
        )
        spent = sum(e["amount"] for e in (spent_result.data or []))

        budgets.append(
            Budget(
                id=b["id"],
                category=b["category"],
                limit=b["limit"],
                spent=spent,
                remaining=max(0, b["limit"] - spent),
                percentage_used=round((spent / b["limit"]) * 100, 1) if b["limit"] > 0 else 0,
            )
        )

    return budgets


# ── Summary ──────────────────────────────────────────────────


@router.get("/summary", response_model=FinancialSummary)
async def get_financial_summary(
    user: dict = Depends(get_current_user),
    month: int | None = Query(default=None, ge=1, le=12, description="Month (1-12)"),
    year: int | None = Query(default=None, description="Year (e.g. 2026)"),
):
    """
    Get a financial summary for the current or specified month.

    Includes total expenses, income vs. expenses, savings rate,
    top spending categories, and budget status.
    """
    user_id = user["sub"]
    db = get_supabase()

    today = date.today()
    target_month = month or today.month
    target_year = year or today.year

    first_of_month = date(target_year, target_month, 1).isoformat()
    if target_month == 12:
        first_of_next = date(target_year + 1, 1, 1).isoformat()
    else:
        first_of_next = date(target_year, target_month + 1, 1).isoformat()

    # ── Fetch all expenses for the month ─────────────────
    expenses_result = (
        db.table("expenses")
        .select("*")
        .eq("user_id", user_id)
        .gte("date", first_of_month)
        .lt("date", first_of_next)
        .execute()
    )

    expenses = expenses_result.data or []
    total_expenses = sum(e["amount"] for e in expenses)

    # ── Aggregate by category ────────────────────────────
    category_totals: dict[str, float] = {}
    for e in expenses:
        cat = e["category"]
        category_totals[cat] = category_totals.get(cat, 0) + e["amount"]

    top_categories = sorted(
        [{"category": k, "amount": round(v, 2)} for k, v in category_totals.items()],
        key=lambda x: x["amount"],
        reverse=True,
    )[:10]

    # ── Get income from onboarding ───────────────────────
    onboarding = (
        db.table("onboarding")
        .select("monthly_income")
        .eq("clerk_id", user_id)
        .execute()
    )

    monthly_income = 0.0
    if onboarding.data and onboarding.data[0].get("monthly_income"):
        monthly_income = float(onboarding.data[0]["monthly_income"])

    net_savings = monthly_income - total_expenses
    savings_rate = round((net_savings / monthly_income) * 100, 1) if monthly_income > 0 else 0.0

    # ── Budget status ────────────────────────────────────
    budgets_result = (
        db.table("budgets")
        .select("*")
        .eq("user_id", user_id)
        .execute()
    )

    budget_status = []
    for b in budgets_result.data or []:
        spent = category_totals.get(b["category"], 0)
        budget_status.append(
            Budget(
                id=b["id"],
                category=b["category"],
                limit=b["limit"],
                spent=spent,
                remaining=max(0, b["limit"] - spent),
                percentage_used=round((spent / b["limit"]) * 100, 1) if b["limit"] > 0 else 0,
            )
        )

    return FinancialSummary(
        total_income=monthly_income,
        total_expenses=round(total_expenses, 2),
        net_savings=round(net_savings, 2),
        savings_rate=savings_rate,
        top_categories=top_categories,
        budget_status=budget_status,
    )
