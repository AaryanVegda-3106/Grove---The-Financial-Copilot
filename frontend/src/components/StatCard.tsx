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
    up: "text-emerald-700 font-bold",
    down: "text-red-600 font-bold",
    neutral: "text-[var(--foreground)]/60 font-semibold",
  };

  return (
    <div
      className={`
        relative overflow-hidden
        glass-card
        p-6 transition-all duration-300 hover:bg-white/50
        group
        ${className}
      `}
    >
      <div className="flex items-start justify-between relative z-10">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--foreground)]/60">
            {label}
          </span>
          <span className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight mt-1 drop-shadow-sm">
            {value}
          </span>
          {subtitle && (
            <span className="text-sm font-medium text-[var(--foreground)]/70 mt-1">
              {subtitle}
            </span>
          )}
          {trend && trendLabel && (
            <span
              className={`text-[11px] uppercase tracking-wider mt-2 px-2.5 py-1 inline-flex items-center gap-1 w-fit rounded-lg bg-white/40 shadow-sm border border-white/50 backdrop-blur-md ${trendColors[trend]}`}
            >
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}{" "}
              {trendLabel}
            </span>
          )}
        </div>
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl glass-input">
          <Icon className="w-6 h-6 text-[var(--foreground)] drop-shadow-md" />
        </div>
      </div>
    </div>
  );
}
