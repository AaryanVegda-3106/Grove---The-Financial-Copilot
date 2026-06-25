"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { submitOnboarding, type OnboardingData } from "@/lib/api";
import {
  Leaf,
  Target,
  ShieldCheck,
  TrendingUp,
  Wallet,
  GraduationCap,
  PiggyBank,
  CreditCard,
  BarChart3,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
  Flame,
  Shield,
  Zap,
} from "lucide-react";

const GOALS = [
  { id: "save_tuition", label: "Save for tuition", icon: GraduationCap },
  { id: "emergency_fund", label: "Build emergency fund", icon: ShieldCheck },
  { id: "start_investing", label: "Start investing", icon: TrendingUp },
  { id: "pay_debt", label: "Pay off debt", icon: CreditCard },
  { id: "track_spending", label: "Track spending", icon: BarChart3 },
  { id: "budget_better", label: "Budget better", icon: PiggyBank },
];

const RISK_LEVELS = [
  {
    id: "conservative" as const,
    label: "Conservative",
    icon: Shield,
    description: "Prioritize safety. Savings accounts, FDs, low-risk funds.",
    color: "from-emerald-500/20 to-emerald-700/20",
    border: "border-emerald-500/30",
  },
  {
    id: "moderate" as const,
    label: "Moderate",
    icon: Zap,
    description: "Balanced approach. Mix of equity and debt mutual funds.",
    color: "from-amber-500/20 to-amber-700/20",
    border: "border-amber-500/30",
  },
  {
    id: "aggressive" as const,
    label: "Aggressive",
    icon: Flame,
    description: "Maximize growth. Stocks, equity funds, higher risk tolerance.",
    color: "from-red-500/20 to-red-700/20",
    border: "border-red-500/30",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { getToken } = useAuth();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [riskTolerance, setRiskTolerance] = useState<
    "conservative" | "moderate" | "aggressive" | ""
  >("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");

  const totalSteps = 3;

  const canProceed = () => {
    if (step === 0) return selectedGoals.length > 0;
    if (step === 1) return riskTolerance !== "";
    if (step === 2) return true; // Income/expenses are optional
    return false;
  };

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((g) => g !== goalId)
        : [...prev, goalId]
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    try {
      const data: OnboardingData = {
        financial_goals: selectedGoals,
        risk_tolerance: riskTolerance as "conservative" | "moderate" | "aggressive",
        monthly_income: monthlyIncome ? parseFloat(monthlyIncome) : null,
        monthly_expenses: monthlyExpenses ? parseFloat(monthlyExpenses) : null,
      };

      await submitOnboarding(data, () => getToken());
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[var(--foreground)] opacity-[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[var(--foreground)] opacity-[0.02] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Leaf className="w-7 h-7 text-[var(--foreground)]" />
          <span className="text-2xl font-serif font-bold text-[var(--foreground)]">
            Grove.
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`
                h-1 flex-1 rounded-full transition-all duration-500
                ${i <= step ? "bg-[var(--foreground)]" : "bg-white/15"}
              `}
            />
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8">
          {/* Step 1: Goals */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[var(--foreground)]">
                  What are your financial goals?
                </h2>
                <p className="text-sm text-[var(--foreground)]/60 mt-1">
                  Select all that apply. This helps Grove personalize advice for you.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {GOALS.map((goal) => {
                  const isSelected = selectedGoals.includes(goal.id);
                  return (
                    <button
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className={`
                        flex items-center gap-3 p-4 rounded-xl
                        border transition-all duration-200 text-left
                        ${
                          isSelected
                            ? "border-[var(--foreground)]/40 bg-[var(--foreground)]/10"
                            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]"
                        }
                      `}
                    >
                      <div
                        className={`
                          w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                          ${isSelected ? "bg-[var(--foreground)]/20" : "bg-white/10"}
                        `}
                      >
                        {isSelected ? (
                          <Check className="w-4 h-4 text-[var(--foreground)]" />
                        ) : (
                          <goal.icon className="w-4 h-4 text-[var(--foreground)]/60" />
                        )}
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          isSelected
                            ? "text-[var(--foreground)]"
                            : "text-[var(--foreground)]/70"
                        }`}
                      >
                        {goal.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Risk tolerance */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[var(--foreground)]">
                  What&apos;s your comfort level with risk?
                </h2>
                <p className="text-sm text-[var(--foreground)]/60 mt-1">
                  This helps us tailor investment-related advice.
                </p>
              </div>

              <div className="space-y-3">
                {RISK_LEVELS.map((level) => {
                  const isSelected = riskTolerance === level.id;
                  return (
                    <button
                      key={level.id}
                      onClick={() => setRiskTolerance(level.id)}
                      className={`
                        w-full flex items-center gap-4 p-5 rounded-xl
                        border transition-all duration-200 text-left
                        ${
                          isSelected
                            ? `${level.border} bg-gradient-to-r ${level.color}`
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        }
                      `}
                    >
                      <div
                        className={`
                          w-12 h-12 rounded-xl flex items-center justify-center shrink-0
                          ${isSelected ? "bg-white/10" : "bg-white/5"}
                        `}
                      >
                        <level.icon
                          className={`w-6 h-6 ${
                            isSelected
                              ? "text-[var(--foreground)]"
                              : "text-[var(--foreground)]/50"
                          }`}
                        />
                      </div>
                      <div>
                        <span
                          className={`text-base font-semibold block ${
                            isSelected
                              ? "text-[var(--foreground)]"
                              : "text-[var(--foreground)]/80"
                          }`}
                        >
                          {level.label}
                        </span>
                        <span className="text-xs text-[var(--foreground)]/50 mt-0.5 block">
                          {level.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Income & Expenses */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[var(--foreground)]">
                  Let&apos;s set up your finances
                </h2>
                <p className="text-sm text-[var(--foreground)]/60 mt-1">
                  Optional, but helps Grove give better advice. You can update
                  these anytime.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-2">
                    Monthly Income (₹)
                  </label>
                  <div className="relative">
                    <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/40" />
                    <input
                      type="number"
                      placeholder="e.g. 15000"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value)}
                      className="
                        w-full pl-11 pr-4 py-3 rounded-xl
                        bg-white/5 border border-white/10
                        text-[var(--foreground)] placeholder-[var(--foreground)]/30
                        focus:outline-none focus:border-[var(--foreground)]/30
                        transition-colors
                      "
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-2">
                    Monthly Expenses (₹)
                  </label>
                  <div className="relative">
                    <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/40" />
                    <input
                      type="number"
                      placeholder="e.g. 8000"
                      value={monthlyExpenses}
                      onChange={(e) => setMonthlyExpenses(e.target.value)}
                      className="
                        w-full pl-11 pr-4 py-3 rounded-xl
                        bg-white/5 border border-white/10
                        text-[var(--foreground)] placeholder-[var(--foreground)]/30
                        focus:outline-none focus:border-[var(--foreground)]/30
                        transition-colors
                      "
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            {step > 0 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-white/5 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < totalSteps - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="
                  flex items-center gap-2 px-6 py-2.5 rounded-xl
                  text-sm font-semibold transition-all
                  bg-[var(--foreground)] text-[var(--background)]
                  hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed
                "
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="
                  flex items-center gap-2 px-6 py-2.5 rounded-xl
                  text-sm font-semibold transition-all
                  bg-[var(--foreground)] text-[var(--background)]
                  hover:opacity-90 disabled:opacity-60
                "
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Launch Grove
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Step indicator */}
        <p className="text-center text-xs text-[var(--foreground)]/40 mt-4">
          Step {step + 1} of {totalSteps}
        </p>
      </div>
    </div>
  );
}
