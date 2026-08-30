"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Plus,
  Loader2,
  PiggyBank,
  Tag,
  IndianRupee,
  X,
} from "lucide-react";
import {
  createBudget,
  listBudgets,
  type Budget,
  type BudgetCreate,
} from "@/lib/api";
import ProgressBar from "@/components/ProgressBar";

const CATEGORIES = [
  "food",
  "transport",
  "entertainment",
  "textbooks",
  "rent",
  "utilities",
  "clothes",
  "health",
  "subscriptions",
  "other",
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const CATEGORY_ICONS: Record<string, string> = {
  food: "🍕",
  transport: "🚌",
  entertainment: "🎬",
  textbooks: "📚",
  rent: "🏠",
  utilities: "💡",
  clothes: "👕",
  health: "💊",
  subscriptions: "📱",
  other: "📦",
};

export default function BudgetsPage() {
  const { getToken } = useAuth();

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formCategory, setFormCategory] = useState(CATEGORIES[0]);
  const [formLimit, setFormLimit] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fetchBudgets = async () => {
    try {
      const data = await listBudgets(() => getToken());
      setBudgets(data);
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSetBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLimit || submitting) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      const data: BudgetCreate = {
        category: formCategory,
        limit: parseFloat(formLimit),
      };
      await createBudget(data, () => getToken());
      setFormLimit("");
      setShowForm(false);
      await fetchBudgets();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to save budget. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
            Budgets
          </h1>
          <p className="text-sm font-semibold text-[var(--foreground)]/60 mt-1 uppercase tracking-wide">
            Set limits and track your spending
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="
            flex items-center gap-2 px-5 py-3 rounded-2xl
            glass-btn font-bold text-sm uppercase tracking-wide text-[var(--foreground)]
          "
        >
          {showForm ? (
            <>
              <div className="w-5 h-5 rounded-lg bg-red-100/50 flex items-center justify-center text-red-600 shadow-inner">
                <X className="w-3.5 h-3.5" />
              </div>
              Cancel
            </>
          ) : (
            <>
              <div className="w-5 h-5 rounded-lg bg-white/50 flex items-center justify-center shadow-inner">
                <Plus className="w-3.5 h-3.5" />
              </div>
              Set Budget
            </>
          )}
        </button>
      </div>

      {/* Add Budget Form */}
      {showForm && (
        <form
          onSubmit={handleSetBudget}
          className="glass-card p-8 space-y-6"
        >
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--foreground)]/60">
            Set Budget Limit
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)]/60 mb-2 pl-1">
                Category
              </label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/40" />
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="
                    w-full pl-11 pr-4 py-3.5
                    glass-input text-[var(--foreground)] font-semibold text-sm capitalize
                    appearance-none bg-transparent
                  "
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="capitalize bg-white text-[#1C4A39]">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Limit */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)]/60 mb-2 pl-1">
                Monthly Limit (₹)
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/40" />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={formLimit}
                  onChange={(e) => setFormLimit(e.target.value)}
                  required
                  className="
                    w-full pl-11 pr-4 py-3.5
                    glass-input text-[var(--foreground)] font-bold text-sm
                    placeholder-[var(--foreground)]/30
                  "
                />
              </div>
            </div>
          </div>

          {submitError && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold">
              {submitError}
            </div>
          )}
          <button
            type="submit"
            disabled={submitting || !formLimit}
            className="
              flex items-center gap-2 px-8 py-3.5 rounded-2xl
              glass-btn-active bg-[var(--foreground)] text-[var(--background)] font-bold text-sm uppercase tracking-wide
              hover:opacity-90 disabled:opacity-40 transition-all
            "
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            Save Budget
          </button>
        </form>
      )}

      {/* Budgets Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-[var(--foreground)]/40 animate-spin" />
        </div>
      ) : budgets.length === 0 ? (
        <div className="text-center py-16 glass-card">
          <PiggyBank className="w-16 h-16 text-[var(--foreground)]/30 mx-auto mb-4" />
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--foreground)]/60">
            No budgets set yet. Start by setting a limit for a category!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets.map((budget) => {
            const isOver = budget.percentage_used > 100;

            return (
              <div
                key={budget.id}
                className={`
                  glass-card p-6 transition-all duration-300 hover:bg-white/50
                  ${isOver ? "border-red-500/30 bg-red-500/5 shadow-[0_8px_32px_rgba(239,68,68,0.1)]" : ""}
                `}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl glass-input flex items-center justify-center text-2xl bg-white/40 border border-white/50">
                      {CATEGORY_ICONS[budget.category] || "📦"}
                    </div>
                    <h3 className="font-extrabold text-[var(--foreground)] text-lg capitalize tracking-wide">
                      {budget.category}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-extrabold text-[var(--foreground)] tabular-nums">
                      {formatCurrency(budget.spent)}
                    </div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)]/50 mt-1">
                      of {formatCurrency(budget.limit)}
                    </div>
                  </div>
                </div>

                <ProgressBar
                  value={budget.percentage_used}
                  showPercentage={false}
                  size="lg"
                  className="mb-4"
                />

                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide">
                  <span
                    className={
                      isOver ? "text-red-500" : "text-[var(--foreground)]/70"
                    }
                  >
                    {isOver
                      ? `${formatCurrency(budget.spent - budget.limit)} over budget`
                      : `${formatCurrency(budget.remaining)} left`}
                  </span>
                  <span
                    className={
                      isOver ? "text-red-500" : "text-[var(--foreground)]/70"
                    }
                  >
                    {Math.round(budget.percentage_used)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
