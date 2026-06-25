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
    try {
      const data: BudgetCreate = {
        category: formCategory,
        limit: parseFloat(formLimit),
      };
      await createBudget(data, () => getToken());
      setFormLimit("");
      setShowForm(false);
      await fetchBudgets();
    } catch {
      // Handle error
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Budgets
          </h1>
          <p className="text-sm text-[var(--foreground)]/50 mt-1">
            Set limits and track your spending
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="
            flex items-center gap-2 px-4 py-2.5 rounded-xl
            bg-[var(--foreground)] text-[var(--background)]
            text-sm font-semibold hover:opacity-90 transition-all
          "
        >
          {showForm ? (
            <>
              <X className="w-4 h-4" /> Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" /> Set Budget
            </>
          )}
        </button>
      </div>

      {/* Add Budget Form */}
      {showForm && (
        <form
          onSubmit={handleSetBudget}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--foreground)]/50">
            Set Budget Limit
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)]/60 mb-1.5">
                Category
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/40" />
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="
                    w-full pl-9 pr-4 py-2.5 rounded-xl appearance-none
                    bg-white/5 border border-white/10
                    text-[var(--foreground)] text-sm capitalize
                    focus:outline-none focus:border-[var(--foreground)]/30
                  "
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#163a2e] capitalize">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Limit */}
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)]/60 mb-1.5">
                Monthly Limit (₹)
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/40" />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0"
                  value={formLimit}
                  onChange={(e) => setFormLimit(e.target.value)}
                  required
                  className="
                    w-full pl-9 pr-4 py-2.5 rounded-xl
                    bg-white/5 border border-white/10
                    text-[var(--foreground)] text-sm
                    placeholder-[var(--foreground)]/30
                    focus:outline-none focus:border-[var(--foreground)]/30
                  "
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !formLimit}
            className="
              flex items-center gap-2 px-5 py-2.5 rounded-xl
              bg-[var(--foreground)] text-[var(--background)]
              text-sm font-semibold hover:opacity-90
              disabled:opacity-40 transition-all
            "
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Save Budget
          </button>
        </form>
      )}

      {/* Budgets Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-5 h-5 text-[var(--foreground)]/30 animate-spin" />
        </div>
      ) : budgets.length === 0 ? (
        <div className="text-center py-16">
          <PiggyBank className="w-12 h-12 text-[var(--foreground)]/20 mx-auto mb-4" />
          <p className="text-sm text-[var(--foreground)]/40">
            No budgets set yet. Start by setting a limit for a category!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((budget) => {
            const isOver = budget.percentage_used > 100;

            return (
              <div
                key={budget.id}
                className={`
                  rounded-2xl border p-5 transition-all
                  ${
                    isOver
                      ? "bg-red-500/5 border-red-500/20"
                      : "bg-white/5 border-white/10 hover:bg-white/[0.08]"
                  }
                `}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {CATEGORY_ICONS[budget.category] || "📦"}
                    </span>
                    <h3 className="font-semibold text-[var(--foreground)] capitalize">
                      {budget.category}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[var(--foreground)]">
                      {formatCurrency(budget.spent)}
                    </div>
                    <div className="text-xs text-[var(--foreground)]/50">
                      of {formatCurrency(budget.limit)}
                    </div>
                  </div>
                </div>

                <ProgressBar
                  value={budget.percentage_used}
                  showPercentage={false}
                  size="lg"
                  className="mb-3"
                />

                <div className="flex items-center justify-between text-xs">
                  <span
                    className={
                      isOver ? "text-red-400 font-medium" : "text-[var(--foreground)]/60"
                    }
                  >
                    {isOver
                      ? `${formatCurrency(budget.spent - budget.limit)} over budget`
                      : `${formatCurrency(budget.remaining)} left`}
                  </span>
                  <span
                    className={`font-semibold ${
                      isOver ? "text-red-400" : "text-[var(--foreground)]/60"
                    }`}
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
