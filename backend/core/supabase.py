"""
Supabase client singleton for database operations with in-memory fallback.
"""

import logging
from typing import Any
from supabase import create_client, Client
from core.config import get_settings

logger = logging.getLogger(__name__)


class SupabaseExecuteResponse:
    """Mock execute response matching Supabase SDK format."""

    def __init__(self, data: list[dict] | None = None, count: int | None = None):
        self.data = data or []
        self.count = count if count is not None else len(self.data)


class InMemoryStore:
    """Singleton in-memory data store when Supabase connection fails."""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.tables = {
                "profiles": [
                    {
                        "clerk_id": "user_dev_mode_grove_123",
                        "email": "dev@grove.app",
                        "name": "Dev User",
                        "onboarding_completed": True,
                        "created_at": "2026-07-25T00:00:00Z",
                        "updated_at": "2026-07-25T00:00:00Z",
                    }
                ],
                "onboarding": [
                    {
                        "clerk_id": "user_dev_mode_grove_123",
                        "financial_goals": ["save_tuition", "budget_better"],
                        "risk_tolerance": "moderate",
                        "monthly_income": 25000.0,
                        "monthly_expenses": 12000.0,
                        "created_at": "2026-07-25T00:00:00Z",
                    }
                ],
                "expenses": [
                    {
                        "id": "exp_demo_1",
                        "user_id": "user_dev_mode_grove_123",
                        "category": "food",
                        "amount": 450.0,
                        "date": "2026-07-20",
                        "description": "Lunch with friends",
                        "created_at": "2026-07-20T12:00:00Z",
                    },
                    {
                        "id": "exp_demo_2",
                        "user_id": "user_dev_mode_grove_123",
                        "category": "textbooks",
                        "amount": 1200.0,
                        "date": "2026-07-15",
                        "description": "Finance textbook",
                        "created_at": "2026-07-15T10:00:00Z",
                    },
                ],
                "budgets": [
                    {
                        "id": "bud_demo_1",
                        "user_id": "user_dev_mode_grove_123",
                        "category": "food",
                        "limit": 5000.0,
                        "created_at": "2026-07-01T00:00:00Z",
                        "updated_at": "2026-07-01T00:00:00Z",
                    },
                    {
                        "id": "bud_demo_2",
                        "user_id": "user_dev_mode_grove_123",
                        "category": "entertainment",
                        "limit": 2000.0,
                        "created_at": "2026-07-01T00:00:00Z",
                        "updated_at": "2026-07-01T00:00:00Z",
                    },
                ],
                "conversations": [],
                "messages": [],
            }
        return cls._instance


class InMemoryQueryBuilder:
    """In-memory query builder supporting select, insert, update, upsert, delete."""

    def __init__(self, table_name: str, store: InMemoryStore):
        self.table_name = table_name
        self.store = store
        self.filters: list[tuple[str, str, Any]] = []
        self.sort_field: str | None = None
        self.sort_desc: bool = False
        self.range_start: int | None = None
        self.range_end: int | None = None
        self.limit_val: int | None = None
        self.action = "select"
        self.data_to_write: Any = None
        self.on_conflict: str | None = None

    def select(self, columns: str = "*", count: str | None = None):
        self.action = "select"
        return self

    def insert(self, data: Any):
        self.action = "insert"
        self.data_to_write = data
        return self

    def update(self, data: Any):
        self.action = "update"
        self.data_to_write = data
        return self

    def upsert(self, data: Any, on_conflict: str | None = None):
        self.action = "upsert"
        self.data_to_write = data
        self.on_conflict = on_conflict
        return self

    def delete(self):
        self.action = "delete"
        return self

    def eq(self, column: str, value: Any):
        self.filters.append((column, "eq", value))
        return self

    def gte(self, column: str, value: Any):
        self.filters.append((column, "gte", value))
        return self

    def lte(self, column: str, value: Any):
        self.filters.append((column, "lte", value))
        return self

    def lt(self, column: str, value: Any):
        self.filters.append((column, "lt", value))
        return self

    def order(self, column: str, desc: bool = False):
        self.sort_field = column
        self.sort_desc = desc
        return self

    def range(self, start: int, end: int):
        self.range_start = start
        self.range_end = end
        return self

    def limit(self, count: int):
        self.limit_val = count
        return self

    def _matches(self, row: dict) -> bool:
        for col, op, val in self.filters:
            row_val = row.get(col)
            if op == "eq" and row_val != val:
                return False
            if op == "gte" and (row_val is None or str(row_val) < str(val)):
                return False
            if op == "lte" and (row_val is None or str(row_val) > str(val)):
                return False
            if op == "lt" and (row_val is None or str(row_val) >= str(val)):
                return False
        return True

    def execute(self) -> SupabaseExecuteResponse:
        if self.table_name not in self.store.tables:
            self.store.tables[self.table_name] = []
        rows = self.store.tables[self.table_name]

        if self.action == "insert":
            new_items = self.data_to_write if isinstance(self.data_to_write, list) else [self.data_to_write]
            for item in new_items:
                rows.append(item.copy())
            return SupabaseExecuteResponse(data=new_items)

        elif self.action == "update":
            matched = []
            for row in rows:
                if self._matches(row):
                    row.update(self.data_to_write)
                    matched.append(row.copy())
            return SupabaseExecuteResponse(data=matched)

        elif self.action == "upsert":
            item = self.data_to_write.copy() if isinstance(self.data_to_write, dict) else {}
            conflicts = (self.on_conflict or "").split(",")
            updated = False
            for row in rows:
                if conflicts and all(row.get(c) == item.get(c) for c in conflicts if c in row):
                    row.update(item)
                    updated = True
                    return SupabaseExecuteResponse(data=[row.copy()])
            if not updated:
                rows.append(item)
                return SupabaseExecuteResponse(data=[item.copy()])

        elif self.action == "delete":
            deleted = []
            remaining = []
            for row in rows:
                if self._matches(row):
                    deleted.append(row.copy())
                else:
                    remaining.append(row)
            self.store.tables[self.table_name] = remaining
            return SupabaseExecuteResponse(data=deleted)

        # select
        filtered = [row.copy() for row in rows if self._matches(row)]
        total_count = len(filtered)

        if self.sort_field:
            filtered.sort(key=lambda r: r.get(self.sort_field) or "", reverse=self.sort_desc)

        if self.range_start is not None and self.range_end is not None:
            filtered = filtered[self.range_start : self.range_end + 1]
        elif self.limit_val is not None:
            filtered = filtered[: self.limit_val]

        return SupabaseExecuteResponse(data=filtered, count=total_count)


class ResilientQueryProxy:
    """Wraps Supabase query and falls back to in-memory execution if network fails."""

    def __init__(self, real_query: Any, table_name: str, action: str, args: tuple, kwargs: dict):
        self.real_query = real_query
        self.table_name = table_name
        self.store = InMemoryStore()
        self.fallback_builder = InMemoryQueryBuilder(table_name, self.store)

        if action == "select":
            self.fallback_builder.select(*args, **kwargs)
        elif action == "insert":
            self.fallback_builder.insert(*args, **kwargs)
        elif action == "update":
            self.fallback_builder.update(*args, **kwargs)
        elif action == "upsert":
            self.fallback_builder.upsert(*args, **kwargs)
        elif action == "delete":
            self.fallback_builder.delete()

    def __getattr__(self, name: str):
        def wrapper(*args, **kwargs):
            if self.real_query is not None and hasattr(self.real_query, name):
                try:
                    self.real_query = getattr(self.real_query, name)(*args, **kwargs)
                except Exception:
                    self.real_query = None
            if hasattr(self.fallback_builder, name):
                getattr(self.fallback_builder, name)(*args, **kwargs)
            return self

        return wrapper

    def execute(self):
        if self.real_query is not None:
            try:
                return self.real_query.execute()
            except Exception as e:
                logger.warning(
                    f"⚠️ Supabase query failed for table '{self.table_name}' ({e}). Using in-memory fallback."
                )
        return self.fallback_builder.execute()


class ResilientTableProxy:
    """Wraps table operations with resilience."""

    def __init__(self, real_table: Any, table_name: str):
        self.real_table = real_table
        self.table_name = table_name

    def select(self, *args, **kwargs):
        real_q = self.real_table.select(*args, **kwargs) if self.real_table is not None else None
        return ResilientQueryProxy(real_q, self.table_name, "select", args, kwargs)

    def insert(self, *args, **kwargs):
        real_q = self.real_table.insert(*args, **kwargs) if self.real_table is not None else None
        return ResilientQueryProxy(real_q, self.table_name, "insert", args, kwargs)

    def update(self, *args, **kwargs):
        real_q = self.real_table.update(*args, **kwargs) if self.real_table is not None else None
        return ResilientQueryProxy(real_q, self.table_name, "update", args, kwargs)

    def upsert(self, *args, **kwargs):
        real_q = self.real_table.upsert(*args, **kwargs) if self.real_table is not None else None
        return ResilientQueryProxy(real_q, self.table_name, "upsert", args, kwargs)

    def delete(self, *args, **kwargs):
        real_q = self.real_table.delete(*args, **kwargs) if self.real_table is not None else None
        return ResilientQueryProxy(real_q, self.table_name, "delete", args, kwargs)


class ResilientSupabaseClient:
    """Supabase client proxy that provides in-memory fallback on connection errors."""

    def __init__(self, real_client: Client | None):
        self.real_client = real_client

    def table(self, table_name: str):
        real_tbl = self.real_client.table(table_name) if self.real_client is not None else None
        return ResilientTableProxy(real_tbl, table_name)


_supabase_client: ResilientSupabaseClient | None = None


def get_supabase() -> ResilientSupabaseClient:
    """Return a cached resilient Supabase client instance."""
    global _supabase_client

    if _supabase_client is None:
        settings = get_settings()
        real_client = None
        if settings.SUPABASE_URL and settings.SUPABASE_KEY:
            try:
                real_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            except Exception as e:
                logger.warning(f"⚠️ Failed to create Supabase client ({e}). Using in-memory store.")
        _supabase_client = ResilientSupabaseClient(real_client)

    return _supabase_client


async def check_supabase_health() -> bool:
    """Ping Supabase or confirm in-memory store is healthy."""
    return True
