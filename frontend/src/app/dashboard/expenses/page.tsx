"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Plus,
  Trash2,
  Loader2,
  Receipt,
  Filter,
  X,
  Calendar,
  Tag,
  IndianRupee,
  FileText,
} from "lucide-react";
import {
  createExpense,
  listExpenses,
  deleteExpense,
  type Expense,
  type ExpenseCreate,
} from "@/lib/api";

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

export default function ExpensesPage() {
  const { getToken } = useAuth();

  // List state
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [filterCategory, setFilterCategory] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formCategory, setFormCategory] = useState(CATEGORIES[0]);
  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [formDescription, setFormDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchExpenses = async () => {
    try {
      const data = await listExpenses(() => getToken(), {
        category: filterCategory || undefined,
        limit: 100,
      });
      setExpenses(data.expenses);
      setTotalCount(data.total_count);
      setTotalAmount(data.total_amount);
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || submitting) return;

    setSubmitting(true);
    try {
      const data: ExpenseCreate = {
        category: formCategory,
        amount: parseFloat(formAmount),
        date: formDate,
        description: formDescription || null,
      };
      await createExpense(data, () => getToken());
      setFormAmount("");
      setFormDescription("");
      setShowForm(false);
      await fetchExpenses();
    } catch {
      // Handle error
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteExpense(id, () => getToken());
      await fetchExpenses();
    } catch {
      // Handle error
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Expenses
          </h1>
          <p className="text-sm text-[var(--foreground)]/50 mt-1">
            Track and manage your spending
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
              <Plus className="w-4 h-4" /> Add Expense
            </>
          )}
        </button>
      </div>

      {/* Add Expense Form */}
      {showForm && (
        <form
          onSubmit={handleAddExpense}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--foreground)]/50">
            New Expense
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

            {/* Amount */}
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)]/60 mb-1.5">
                Amount (₹)
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/40" />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
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

            {/* Date */}
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)]/60 mb-1.5">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/40" />
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="
                    w-full pl-9 pr-4 py-2.5 rounded-xl
                    bg-white/5 border border-white/10
                    text-[var(--foreground)] text-sm
                    focus:outline-none focus:border-[var(--foreground)]/30
                    [color-scheme:dark]
                  "
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)]/60 mb-1.5">
                Note (optional)
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/40" />
                <input
                  type="text"
                  placeholder="e.g. Lunch at canteen"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
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
            disabled={submitting || !formAmount}
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
            Add Expense
          </button>
        </form>
      )}

      {/* Summary strip + Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-[var(--foreground)]/60">
            <Receipt className="w-4 h-4" />
            <span>
              {totalCount} expense{totalCount !== 1 ? "s" : ""} ·{" "}
              <span className="font-semibold text-[var(--foreground)]">
                {formatCurrency(totalAmount)}
              </span>
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
            transition-all
            ${
              filterCategory
                ? "bg-[var(--foreground)]/10 text-[var(--foreground)]"
                : "text-[var(--foreground)]/50 hover:text-[var(--foreground)]/70"
            }
          `}
        >
          <Filter className="w-3.5 h-3.5" />
          Filter
        </button>
      </div>

      {/* Filter chips */}
      {showFilters && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCategory("")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all
              ${!filterCategory ? "bg-[var(--foreground)]/15 text-[var(--foreground)]" : "bg-white/5 text-[var(--foreground)]/50 hover:bg-white/10"}`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all
                ${filterCategory === cat ? "bg-[var(--foreground)]/15 text-[var(--foreground)]" : "bg-white/5 text-[var(--foreground)]/50 hover:bg-white/10"}`}
            >
              {CATEGORY_ICONS[cat]} {cat}
            </button>
          ))}
        </div>
      )}

      {/* Expense list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-5 h-5 text-[var(--foreground)]/30 animate-spin" />
        </div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-16">
          <Receipt className="w-12 h-12 text-[var(--foreground)]/20 mx-auto mb-4" />
          <p className="text-sm text-[var(--foreground)]/40">
            {filterCategory
              ? `No ${filterCategory} expenses found.`
              : "No expenses yet. Add your first one!"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="
                group flex items-center justify-between
                px-5 py-4 rounded-xl
                border border-white/10 bg-white/5
                hover:bg-white/[0.08] transition-all
              "
            >
              <div className="flex items-center gap-4">
                <span className="text-xl">
                  {CATEGORY_ICONS[expense.category] || "📦"}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--foreground)] capitalize">
                      {expense.category}
                    </span>
                    {expense.description && (
                      <span className="text-xs text-[var(--foreground)]/40">
                        · {expense.description}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[var(--foreground)]/40">
                    {new Date(expense.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-[var(--foreground)] tabular-nums">
                  {formatCurrency(expense.amount)}
                </span>
                <button
                  onClick={() => handleDelete(expense.id)}
                  disabled={deletingId === expense.id}
                  className="
                    opacity-0 group-hover:opacity-100
                    p-1.5 rounded-lg
                    text-red-400/60 hover:text-red-400 hover:bg-red-500/10
                    transition-all
                  "
                >
                  {deletingId === expense.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
