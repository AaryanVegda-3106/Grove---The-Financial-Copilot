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
  const [submitError, setSubmitError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

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
    setSubmitError("");
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
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to save expense. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setDeleteError("");
    try {
      await deleteExpense(id, () => getToken());
      await fetchExpenses();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete expense. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl pb-10 relative z-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
            Expenses
          </h1>
          <p className="text-sm font-semibold text-[var(--foreground)]/60 mt-1.5 uppercase tracking-wide">
            Track and manage your spending
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="
            flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl
            glass-btn text-[var(--foreground)]
            font-bold text-sm uppercase tracking-wide
          "
        >
          {showForm ? (
            <>
              <div className="w-6 h-6 rounded-lg bg-red-100/50 flex items-center justify-center text-red-600 shadow-inner">
                <X className="w-4 h-4" />
              </div>
              Cancel
            </>
          ) : (
            <>
              <div className="w-6 h-6 rounded-lg bg-white/50 flex items-center justify-center shadow-inner text-[var(--foreground)]">
                <Plus className="w-4 h-4" />
              </div>
              Add Expense
            </>
          )}
        </button>
      </div>

      {/* Add Expense Form */}
      {showForm && (
        <form
          onSubmit={handleAddExpense}
          className="glass-card p-8 space-y-6"
        >
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--foreground)]/60">
            New Expense
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)]/60 mb-2 pl-1">
                Category
              </label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/50" />
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

            {/* Amount */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)]/60 mb-2 pl-1">
                Amount (₹)
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/50" />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  required
                  className="
                    w-full pl-11 pr-4 py-3.5
                    glass-input text-[var(--foreground)] font-bold text-sm
                    placeholder-[var(--foreground)]/30
                  "
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)]/60 mb-2 pl-1">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/50" />
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="
                    w-full pl-11 pr-4 py-3.5
                    glass-input text-[var(--foreground)] font-semibold text-sm
                  "
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)]/60 mb-2 pl-1">
                Note (optional)
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/50" />
                <input
                  type="text"
                  placeholder="e.g. Lunch at canteen"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="
                    w-full pl-11 pr-4 py-3.5
                    glass-input text-[var(--foreground)] font-semibold text-sm
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
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || !formAmount}
              className="
                w-full sm:w-auto
                flex items-center justify-center gap-3 px-8 py-3.5 rounded-2xl
                glass-btn-active bg-[var(--foreground)] text-[var(--background)] font-bold text-sm uppercase tracking-wide
                hover:opacity-90
                disabled:opacity-50 disabled:shadow-none
                transition-all
              "
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
              )}
              Save Expense
            </button>
          </div>
        </form>
      )}

      {/* Summary strip + Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-5">
        <div className="flex items-center gap-3 text-sm font-bold text-[var(--foreground)]/70 uppercase tracking-wide pl-2">
          <div className="w-8 h-8 rounded-xl bg-white/50 shadow-inner flex items-center justify-center">
            <Receipt className="w-4 h-4 text-[var(--foreground)]" />
          </div>
          <span>
            {totalCount} expense{totalCount !== 1 ? "s" : ""}
          </span>
          <span className="text-[var(--foreground)]/20">|</span>
          <span className="text-[var(--foreground)] font-extrabold text-base drop-shadow-sm">
            {formatCurrency(totalAmount)}
          </span>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide
            ${
              filterCategory
                ? "glass-btn-active"
                : "glass-btn text-[var(--foreground)]/70 hover:text-[var(--foreground)]"
            }
          `}
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Filter chips */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 p-2">
          <button
            onClick={() => setFilterCategory("")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all
              ${!filterCategory ? "glass-btn-active" : "glass-btn text-[var(--foreground)]/70 hover:text-[var(--foreground)]"}`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2
                ${filterCategory === cat ? "glass-btn-active" : "glass-btn text-[var(--foreground)]/70 hover:text-[var(--foreground)]"}`}
            >
              <span className="text-base">{CATEGORY_ICONS[cat]}</span> {cat}
            </button>
          ))}
        </div>
      )}

      {/* Delete error */}
      {deleteError && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold">
          {deleteError}
        </div>
      )}

      {/* Expense list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-[var(--foreground)]/50 animate-spin" />
        </div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-20 glass-card">
          <div className="w-20 h-20 rounded-3xl glass-card mx-auto mb-6 flex items-center justify-center">
            <Receipt className="w-8 h-8 text-[var(--foreground)]/40" />
          </div>
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--foreground)]/60">
            {filterCategory
              ? `No ${filterCategory} expenses found.`
              : "No expenses yet. Add your first one!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="
                group flex items-center justify-between
                px-6 py-5
                glass-btn cursor-default hover:bg-white/50
              "
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white/40 shadow-inner flex items-center justify-center text-2xl border border-white/50">
                  {CATEGORY_ICONS[expense.category] || "📦"}
                </div>
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <span className="text-base font-bold text-[var(--foreground)] capitalize tracking-wide">
                      {expense.category}
                    </span>
                    {expense.description && (
                      <span className="text-xs font-semibold text-[var(--foreground)]/70">
                        <span className="hidden sm:inline text-[var(--foreground)]/30 mr-2">•</span>
                        {expense.description}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)]/50 mt-1 block">
                    {new Date(expense.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-lg font-extrabold text-[var(--foreground)] tabular-nums tracking-tight">
                  {formatCurrency(expense.amount)}
                </span>
                <button
                  onClick={() => handleDelete(expense.id)}
                  disabled={deletingId === expense.id}
                  className="
                    opacity-0 group-hover:opacity-100
                    w-9 h-9 rounded-xl flex items-center justify-center
                    bg-white/40 shadow-sm border border-white/50
                    text-red-500 hover:text-white hover:bg-red-500 hover:border-transparent
                    transition-all
                  "
                >
                  {deletingId === expense.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
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
