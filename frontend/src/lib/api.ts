"use client";

/**
 * Grove API Client
 *
 * Typed fetch wrapper with Clerk token injection for all backend calls.
 * Every request attaches the Bearer token from Clerk's session.
 */

// ── Types ───────────────────────────────────────────────────

export interface ChatResponse {
  response: string;
  conversation_id: string;
  message_id: string | null;
  model_tier: "fast" | "strong" | null;
}

export interface ChatMessage {
  id: string | null;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ConversationSummary {
  id: string;
  title: string | null;
  last_message: string | null;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationDetail {
  id: string;
  title: string | null;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  clerk_id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface OnboardingData {
  financial_goals: string[];
  risk_tolerance: "conservative" | "moderate" | "aggressive";
  monthly_income: number | null;
  monthly_expenses: number | null;
}

export interface OnboardingResponse {
  message: string;
  profile: UserProfile;
}

export interface Expense {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  date: string;
  description: string | null;
  created_at: string;
}

export interface ExpenseCreate {
  category: string;
  amount: number;
  date?: string;
  description?: string | null;
}

export interface ExpenseList {
  expenses: Expense[];
  total_count: number;
  total_amount: number;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage_used: number;
}

export interface BudgetCreate {
  category: string;
  limit: number;
}

export interface FinancialSummary {
  total_income: number;
  total_expenses: number;
  net_savings: number;
  savings_rate: number;
  top_categories: { category: string; amount: number }[];
  budget_status: Budget[];
}

export interface ExpenseFilters {
  start_date?: string;
  end_date?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

// ── Core fetch helper ───────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  getToken?: () => Promise<string | null>
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (getToken) {
    const token = await getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `API error: ${res.status}`);
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

// ── Chat ────────────────────────────────────────────────────

export async function chatSend(
  message: string,
  getToken: () => Promise<string | null>,
  conversationId?: string
): Promise<ChatResponse> {
  return apiFetch<ChatResponse>(
    "/api/chat",
    {
      method: "POST",
      body: JSON.stringify({
        message,
        conversation_id: conversationId || null,
      }),
    },
    getToken
  );
}

export async function chatHistory(
  getToken: () => Promise<string | null>
): Promise<ConversationSummary[]> {
  return apiFetch<ConversationSummary[]>("/api/chat/history", {}, getToken);
}

export async function chatConversation(
  id: string,
  getToken: () => Promise<string | null>
): Promise<ConversationDetail> {
  return apiFetch<ConversationDetail>(`/api/chat/${id}`, {}, getToken);
}

// ── User ────────────────────────────────────────────────────

export async function getProfile(
  getToken: () => Promise<string | null>
): Promise<UserProfile> {
  return apiFetch<UserProfile>("/api/user/profile", {}, getToken);
}

export async function submitOnboarding(
  data: OnboardingData,
  getToken: () => Promise<string | null>
): Promise<OnboardingResponse> {
  return apiFetch<OnboardingResponse>(
    "/api/user/onboarding",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    getToken
  );
}

// ── Finance ─────────────────────────────────────────────────

export async function createExpense(
  data: ExpenseCreate,
  getToken: () => Promise<string | null>
): Promise<Expense> {
  return apiFetch<Expense>(
    "/api/finance/expenses",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    getToken
  );
}

export async function listExpenses(
  getToken: () => Promise<string | null>,
  filters?: ExpenseFilters
): Promise<ExpenseList> {
  const params = new URLSearchParams();
  if (filters?.start_date) params.set("start_date", filters.start_date);
  if (filters?.end_date) params.set("end_date", filters.end_date);
  if (filters?.category) params.set("category", filters.category);
  if (filters?.limit) params.set("limit", String(filters.limit));
  if (filters?.offset) params.set("offset", String(filters.offset));

  const query = params.toString();
  return apiFetch<ExpenseList>(
    `/api/finance/expenses${query ? `?${query}` : ""}`,
    {},
    getToken
  );
}

export async function deleteExpense(
  id: string,
  getToken: () => Promise<string | null>
): Promise<void> {
  return apiFetch<void>(
    `/api/finance/expenses/${id}`,
    { method: "DELETE" },
    getToken
  );
}

export async function createBudget(
  data: BudgetCreate,
  getToken: () => Promise<string | null>
): Promise<Budget> {
  return apiFetch<Budget>(
    "/api/finance/budgets",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    getToken
  );
}

export async function listBudgets(
  getToken: () => Promise<string | null>
): Promise<Budget[]> {
  return apiFetch<Budget[]>("/api/finance/budgets", {}, getToken);
}

export async function getFinancialSummary(
  getToken: () => Promise<string | null>,
  month?: number,
  year?: number
): Promise<FinancialSummary> {
  const params = new URLSearchParams();
  if (month) params.set("month", String(month));
  if (year) params.set("year", String(year));

  const query = params.toString();
  return apiFetch<FinancialSummary>(
    `/api/finance/summary${query ? `?${query}` : ""}`,
    {},
    getToken
  );
}
