"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import {
  IndianRupee,
  TrendingDown,
  PiggyBank,
  MessageSquare,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import StatCard from "@/components/StatCard";
import ProgressBar from "@/components/ProgressBar";
import { getFinancialSummary, type FinancialSummary } from "@/lib/api";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring" as const, stiffness: 300, damping: 24 } 
  }
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function DashboardPage() {
  const { getToken } = useAuth();
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSummary() {
      try {
        const data = await getFinancialSummary(() => getToken());
        setSummary(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load summary");
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, [getToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-[var(--foreground)]/50 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-2xl glass-card border-red-500/30 text-red-600 text-sm font-medium">
        {error}
      </div>
    );
  }

  const s = summary!;
  const hasData = s.total_income > 0 || s.total_expenses > 0;

  return (
    <motion.div 
      className="space-y-8 max-w-6xl relative z-10 p-8 pt-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Page header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
          Financial Overview
        </h1>
        <p className="text-sm font-semibold text-[var(--foreground)]/60 mt-1.5 uppercase tracking-wide">
          {new Date().toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
          })}{" "}
          snapshot
        </p>
      </motion.div>

      {/* Stat cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants}>
          <StatCard
            label="Income"
            value={formatCurrency(s.total_income)}
            icon={IndianRupee}
            subtitle="This month"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            label="Expenses"
            value={formatCurrency(s.total_expenses)}
            icon={TrendingDown}
            subtitle="This month"
            trend={s.total_expenses > s.total_income ? "down" : "neutral"}
            trendLabel={
              s.total_expenses > s.total_income ? "Exceeds income" : undefined
            }
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            label="Savings"
            value={formatCurrency(s.net_savings)}
            icon={PiggyBank}
            subtitle={`${s.savings_rate}% savings rate`}
            trend={s.net_savings >= 0 ? "up" : "down"}
            trendLabel={s.net_savings >= 0 ? "On track" : "Overspending"}
          />
        </motion.div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Categories */}
        <motion.div variants={itemVariants} className="glass-card p-8">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--foreground)]/60 mb-6">
            Top Spending Categories
          </h3>
          {s.top_categories.length > 0 ? (
            <div className="space-y-6">
              {s.top_categories.slice(0, 5).map((cat, i) => {
                const maxAmount = s.top_categories[0]?.amount || 1;
                const percentage = (cat.amount / maxAmount) * 100;

                return (
                  <div key={i} className="space-y-2.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-[var(--foreground)] capitalize tracking-wide">
                        {cat.category}
                      </span>
                      <span className="font-bold text-[var(--foreground)]/80 tabular-nums">
                        {formatCurrency(cat.amount)}
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full glass-input p-[1px]">
                      <div
                        className="h-full rounded-full bg-emerald-600 shadow-[0_0_8px_rgba(5,150,105,0.4)] transition-all duration-700 ease-out"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm font-semibold text-[var(--foreground)]/60 py-12 text-center">
              No expenses recorded yet.{" "}
              <Link
                href="/dashboard/expenses"
                className="text-emerald-700 hover:text-emerald-800 underline underline-offset-4"
              >
                Add your first expense
              </Link>
            </p>
          )}
        </motion.div>

        {/* Budget Progress */}
        <motion.div variants={itemVariants} className="glass-card p-8">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--foreground)]/60 mb-6">
            Budget Progress
          </h3>
          {s.budget_status.length > 0 ? (
            <div className="space-y-7">
              {s.budget_status.map((budget) => (
                <div key={budget.id}>
                  <ProgressBar
                    value={budget.percentage_used}
                    label={budget.category}
                  />
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)]/60 mt-2">
                    <span>
                      {formatCurrency(budget.spent)} spent
                    </span>
                    <span>
                      {formatCurrency(budget.limit)} limit
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm font-semibold text-[var(--foreground)]/60 py-12 text-center">
              No budgets set yet.{" "}
              <Link
                href="/dashboard/budgets"
                className="text-emerald-700 hover:text-emerald-800 underline underline-offset-4"
              >
                Create a budget
              </Link>
            </p>
          )}
        </motion.div>
      </div>

      {/* Quick Chat CTA */}
      <motion.div variants={itemVariants}>
        <Link
          href="/dashboard/chat"
          className="
            group flex items-center justify-between
            glass-btn p-8 mt-4
          "
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl glass-input flex items-center justify-center bg-white/40">
              <MessageSquare className="w-7 h-7 text-[var(--foreground)] drop-shadow-sm" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-[var(--foreground)] tracking-tight">
                Ask Grove anything
              </h3>
              <p className="text-sm font-medium text-[var(--foreground)]/70 mt-1">
                {hasData
                  ? "Get personalized insights about your finances"
                  : "Get help creating a budget, understanding SIPs, or planning savings"}
              </p>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full glass-btn flex items-center justify-center mr-2 bg-white/40">
            <ArrowRight className="w-5 h-5 text-[var(--foreground)] group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}
