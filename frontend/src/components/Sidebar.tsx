"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Receipt,
  PiggyBank,
  ChevronLeft,
  ChevronRight,
  Leaf,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/chat", label: "Chat", icon: MessageSquare },
  { href: "/dashboard/expenses", label: "Expenses", icon: Receipt },
  { href: "/dashboard/budgets", label: "Budgets", icon: PiggyBank },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`
        relative flex flex-col h-full
        bg-[#163a2e] border-r border-white/10
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-[72px]" : "w-[260px]"}
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--foreground)]/10">
          <Leaf className="w-5 h-5 text-[var(--foreground)]" />
        </div>
        {!collapsed && (
          <span className="text-xl font-serif font-bold text-[var(--foreground)] tracking-tight">
            Grove.
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl
                text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? "bg-[var(--foreground)]/15 text-[var(--foreground)]"
                    : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]/90 hover:bg-[var(--foreground)]/5"
                }
              `}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="
          absolute -right-3 top-1/2 -translate-y-1/2
          w-6 h-6 rounded-full
          bg-[#163a2e] border border-white/20
          flex items-center justify-center
          text-[var(--foreground)]/60 hover:text-[var(--foreground)]
          transition-colors z-10
        "
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>
    </aside>
  );
}
