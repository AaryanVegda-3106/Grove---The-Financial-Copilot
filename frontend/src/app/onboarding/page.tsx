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
    activeClass: "glass-btn-active",
  },
  {
    id: "moderate" as const,
    label: "Moderate",
    icon: Zap,
    description: "Balanced approach. Mix of equity and debt mutual funds.",
    activeClass: "glass-btn-active",
  },
  {
    id: "aggressive" as const,
    label: "Aggressive",
    icon: Flame,
    description: "Maximize growth. Stocks, equity funds, higher risk tolerance.",
    activeClass: "glass-btn-active",
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
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4 relative overflow-hidden">
      {/* Abstract background decorative elements for glassmorphism */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-[var(--foreground)]/5 blur-[120px] mix-blend-multiply" />
        <div className="absolute bottom-[20%] right-[15%] w-[600px] h-[600px] rounded-full bg-emerald-600/5 blur-[150px] mix-blend-multiply" />
        <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] rounded-full bg-amber-500/5 blur-[100px] mix-blend-multiply" />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center">
            <Leaf className="w-6 h-6 text-emerald-600 drop-shadow-sm" />
          </div>
          <span className="text-4xl font-serif font-bold text-[var(--foreground)] tracking-tight drop-shadow-sm">
            Grove.
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex gap-3 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`
                h-2.5 flex-1 rounded-full transition-all duration-500
                glass-input p-[1px]
              `}
            >
              <div 
                className={`h-full rounded-full transition-all duration-500 ${i <= step ? "bg-emerald-600 shadow-[0_0_8px_rgba(5,150,105,0.5)]" : "bg-transparent"}`}
              />
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="glass-card p-10 relative">
          {/* Step 1: Goals */}
          {step === 0 && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
                  What are your financial goals?
                </h2>
                <p className="text-sm font-semibold text-[var(--foreground)]/60 mt-2">
                  Select all that apply. This helps Grove personalize advice for you.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {GOALS.map((goal) => {
                  const isSelected = selectedGoals.includes(goal.id);
                  return (
                    <button
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className={`
                        flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 text-left
                        ${
                          isSelected
                            ? "glass-btn-active bg-[var(--foreground)] text-[var(--background)]"
                            : "glass-btn text-[var(--foreground)]/80 hover:text-[var(--foreground)]"
                        }
                      `}
                    >
                      <div
                        className={`
                          w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                          ${isSelected ? "bg-white/20 shadow-inner" : "glass-input bg-white/40"}
                        `}
                      >
                        {isSelected ? (
                          <Check className="w-5 h-5 text-[var(--background)] drop-shadow-sm" />
                        ) : (
                          <goal.icon className="w-5 h-5 drop-shadow-sm" />
                        )}
                      </div>
                      <span className="text-sm font-bold">
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
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
                  Comfort level with risk?
                </h2>
                <p className="text-sm font-semibold text-[var(--foreground)]/60 mt-2">
                  This helps us tailor investment-related advice.
                </p>
              </div>

              <div className="space-y-4">
                {RISK_LEVELS.map((level) => {
                  const isSelected = riskTolerance === level.id;
                  return (
                    <button
                      key={level.id}
                      onClick={() => setRiskTolerance(level.id)}
                      className={`
                        w-full flex items-center gap-5 p-5 rounded-3xl transition-all duration-200 text-left
                        ${
                          isSelected
                            ? "glass-btn-active bg-[var(--foreground)] text-[var(--background)]"
                            : "glass-btn text-[var(--foreground)]/80 hover:text-[var(--foreground)]"
                        }
                      `}
                    >
                      <div
                        className={`
                          w-14 h-14 rounded-2xl flex items-center justify-center shrink-0
                          ${isSelected ? "bg-white/20 shadow-inner" : "glass-input bg-white/40"}
                        `}
                      >
                        <level.icon
                          className={`w-7 h-7 drop-shadow-sm ${
                            isSelected
                              ? "text-[var(--background)]"
                              : "text-[var(--foreground)]/60"
                          }`}
                        />
                      </div>
                      <div>
                        <span className="text-lg font-extrabold block">
                          {level.label}
                        </span>
                        <span className={`text-xs font-semibold mt-1 block ${isSelected ? "text-[var(--background)]/80" : "text-[var(--foreground)]/60"}`}>
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
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
                  Let&apos;s set up your finances
                </h2>
                <p className="text-sm font-semibold text-[var(--foreground)]/60 mt-2">
                  Optional, but helps Grove give better advice. You can update these anytime.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60 mb-2 pl-1">
                    Monthly Income (₹)
                  </label>
                  <div className="relative">
                    <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)]/40 drop-shadow-sm" />
                    <input
                      type="number"
                      placeholder="e.g. 50000"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value)}
                      className="
                        w-full pl-12 pr-4 py-4
                        glass-input text-[var(--foreground)] font-bold text-lg
                        placeholder-[var(--foreground)]/30
                      "
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60 mb-2 pl-1">
                    Monthly Expenses (₹)
                  </label>
                  <div className="relative">
                    <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)]/40 drop-shadow-sm" />
                    <input
                      type="number"
                      placeholder="e.g. 25000"
                      value={monthlyExpenses}
                      onChange={(e) => setMonthlyExpenses(e.target.value)}
                      className="
                        w-full pl-12 pr-4 py-4
                        glass-input text-[var(--foreground)] font-bold text-lg
                        placeholder-[var(--foreground)]/30
                      "
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-2xl glass-card border-red-500/30 text-red-600 font-semibold text-sm">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-10 pt-8 border-t border-white/40">
            {step > 0 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-white/40 transition-all uppercase tracking-wide glass-btn border-transparent shadow-none"
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
                  flex items-center gap-3 px-8 py-4 rounded-2xl
                  text-sm font-bold uppercase tracking-wide transition-all
                  glass-btn-active bg-[var(--foreground)] text-[var(--background)]
                  hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed
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
                  flex items-center gap-3 px-8 py-4 rounded-2xl
                  text-sm font-bold uppercase tracking-wide transition-all
                  glass-btn-active bg-[var(--foreground)] text-[var(--background)]
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
        <p className="text-center font-bold text-xs uppercase tracking-widest text-[var(--foreground)]/40 mt-8">
          Step {step + 1} of {totalSteps}
        </p>
      </div>
    </div>
  );
}
