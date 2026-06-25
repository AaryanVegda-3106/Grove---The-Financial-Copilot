import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  className?: string;
}

export default function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  className = "",
}: StatCardProps) {
  const trendColors = {
    up: "text-emerald-400",
    down: "text-red-400",
    neutral: "text-[var(--foreground)]/50",
  };

  return (
    <div
      className={`
        relative overflow-hidden
        rounded-2xl border border-white/10
        bg-white/5 backdrop-blur-sm
        p-5 transition-all duration-300
        hover:bg-white/[0.08] hover:border-white/15
        group
        ${className}
      `}
    >
      {/* Subtle glow effect */}
      <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-[var(--foreground)]/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--foreground)]/50">
            {label}
          </span>
          <span className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
            {value}
          </span>
          {subtitle && (
            <span className="text-sm text-[var(--foreground)]/60 mt-0.5">
              {subtitle}
            </span>
          )}
          {trend && trendLabel && (
            <span
              className={`text-xs font-medium mt-1 ${trendColors[trend]}`}
            >
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}{" "}
              {trendLabel}
            </span>
          )}
        </div>
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--foreground)]/10">
          <Icon className="w-5 h-5 text-[var(--foreground)]/70" />
        </div>
      </div>
    </div>
  );
}
