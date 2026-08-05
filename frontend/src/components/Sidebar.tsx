"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  MessageSquare,
  TrendingUp,
  Wallet,
  Target,
  Bell,
  Settings,
  Leaf,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const navItems = [
  { href: "/dashboard/chat", label: "Chat", icon: MessageSquare },
  { href: "/dashboard", label: "Dashboard", icon: TrendingUp },
  { href: "/dashboard/expenses", label: "Expenses", icon: Wallet },
  { href: "/dashboard/budgets", label: "Budgets", icon: Target },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);
  const { user } = useUser();

  return (
    <aside className={`relative h-full flex flex-col py-6 bg-[#164132] z-50 shrink-0 border-r border-[#164132] transition-all duration-300 ${collapsed ? "w-[88px] items-center" : "w-[260px] px-4"}`}>
      
      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-12 w-7 h-7 rounded-full bg-[#164132] border-2 border-[#FFF9D4]/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-[#164132]/90 transition-colors z-40 shadow-md"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 ml-0.5" />
        ) : (
          <ChevronLeft className="w-4 h-4 mr-0.5" />
        )}
      </button>

      {/* Top Logo */}
      <Link href="/" className={`mb-12 flex items-center gap-3 ${collapsed ? "justify-center" : "px-2"}`}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/20 bg-gradient-to-br from-white/10 to-transparent shadow-sm shrink-0">
          <Leaf className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <span className="text-2xl font-serif font-bold text-white tracking-tight whitespace-nowrap">
            Grove.
          </span>
        )}
      </Link>

      {/* Navigation Icons */}
      <nav className={`flex flex-col gap-4 flex-1 w-full ${collapsed ? "items-center" : ""}`}>
        {navItems.map((item) => {
          let isActive = false;
          if (item.href === "/dashboard") {
            isActive = pathname === "/dashboard";
          } else {
            isActive = pathname.startsWith(item.href);
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`
                relative flex items-center gap-4 transition-all duration-300
                ${collapsed ? "justify-center w-12 h-12 rounded-2xl" : "w-full px-4 py-3 rounded-xl"}
                ${
                  isActive
                    ? "bg-[#8DB596]/30 text-white shadow-inner font-bold"
                    : "text-white/50 hover:bg-white/10 hover:text-white font-semibold"
                }
              `}
            >
              <item.icon className="w-[22px] h-[22px] shrink-0" strokeWidth={isActive ? 2.5 : 2} />
              
              {!collapsed && (
                <span className="text-[14px] whitespace-nowrap">{item.label}</span>
              )}

              {/* Active Indicator Dot */}
              {isActive && collapsed && (
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#8DB596] rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile */}
      <div className={`mt-auto ${collapsed ? "" : "px-2"}`}>
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : "p-2 rounded-xl bg-white/5 border border-white/10"}`}>
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-11 h-11",
                }
              }}
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-white truncate">{user?.firstName || "Dev"}</span>
              <span className="text-[11px] font-medium text-white/50 truncate">Pro Member</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
