"use client";

import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="space-y-8 max-w-4xl p-8 pt-6 relative z-10">
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
          Notifications
        </h1>
        <p className="text-sm font-semibold text-[var(--foreground)]/60 mt-1.5 uppercase tracking-wide">
          Alerts and updates from Grove
        </p>
      </div>

      <div className="text-center py-24 glass-card">
        <div className="w-20 h-20 rounded-3xl glass-card mx-auto mb-6 flex items-center justify-center">
          <Bell className="w-8 h-8 text-[var(--foreground)]/40" />
        </div>
        <p className="text-sm font-bold uppercase tracking-widest text-[var(--foreground)]/60">
          No notifications yet.
        </p>
        <p className="text-xs font-medium text-[var(--foreground)]/40 mt-2">
          Grove will alert you when budgets are exceeded or goals are reached.
        </p>
      </div>
    </div>
  );
}
