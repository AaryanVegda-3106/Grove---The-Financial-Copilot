"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { Settings, User, Shield, Bell, Loader2, Check } from "lucide-react";
import { submitOnboarding } from "@/lib/api";

const RISK_LEVELS = ["conservative", "moderate", "aggressive"] as const;

export default function SettingsPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [riskTolerance, setRiskTolerance] = useState<typeof RISK_LEVELS[number]>("moderate");

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await submitOnboarding(
        {
          financial_goals: [],
          risk_tolerance: riskTolerance,
          monthly_income: monthlyIncome ? parseFloat(monthlyIncome) : null,
          monthly_expenses: monthlyExpenses ? parseFloat(monthlyExpenses) : null,
        },
        () => getToken()
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl p-8 pt-6 relative z-10">
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
          Settings
        </h1>
        <p className="text-sm font-semibold text-[var(--foreground)]/60 mt-1.5 uppercase tracking-wide">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Section */}
      <div className="glass-card p-8 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-xl glass-input flex items-center justify-center">
            <User className="w-4 h-4 text-[var(--foreground)]/70" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--foreground)]/60">
            Profile
          </h2>
        </div>
        <div className="space-y-2 pl-1">
          <p className="text-base font-bold text-[var(--foreground)]">
            {user?.fullName || user?.firstName || "User"}
          </p>
          <p className="text-sm font-medium text-[var(--foreground)]/60">
            {user?.primaryEmailAddress?.emailAddress || ""}
          </p>
        </div>
      </div>

      {/* Financial Preferences */}
      <div className="glass-card p-8 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-xl glass-input flex items-center justify-center">
            <Shield className="w-4 h-4 text-[var(--foreground)]/70" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--foreground)]/60">
            Financial Preferences
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)]/60 mb-2 pl-1">
              Monthly Income (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 50000"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              className="w-full px-4 py-3 glass-input text-[var(--foreground)] font-semibold text-sm placeholder-[var(--foreground)]/30"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)]/60 mb-2 pl-1">
              Monthly Expenses (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 25000"
              value={monthlyExpenses}
              onChange={(e) => setMonthlyExpenses(e.target.value)}
              className="w-full px-4 py-3 glass-input text-[var(--foreground)] font-semibold text-sm placeholder-[var(--foreground)]/30"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)]/60 mb-2 pl-1">
              Risk Tolerance
            </label>
            <div className="flex gap-3">
              {RISK_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => setRiskTolerance(level)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all capitalize
                    ${riskTolerance === level ? "glass-btn-active" : "glass-btn text-[var(--foreground)]/60 hover:text-[var(--foreground)]"}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl glass-btn-active bg-[var(--foreground)] text-[var(--background)] font-bold text-sm uppercase tracking-wide hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <Check className="w-4 h-4" />
          ) : (
            <Settings className="w-4 h-4" />
          )}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Notifications placeholder */}
      <div className="glass-card p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl glass-input flex items-center justify-center">
            <Bell className="w-4 h-4 text-[var(--foreground)]/70" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--foreground)]/60">
            Notifications
          </h2>
        </div>
        <p className="text-sm font-medium text-[var(--foreground)]/50 pl-1">
          Notification preferences coming soon.
        </p>
      </div>
    </div>
  );
}
