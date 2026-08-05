interface ProgressBarProps {
  value: number; // 0-100+
  label?: string;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function ProgressBar({
  value,
  label,
  showPercentage = true,
  size = "md",
  className = "",
}: ProgressBarProps) {
  const clampedVisual = Math.min(value, 100);

  // Color thresholds
  const barColor =
    value >= 100
      ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
      : value >= 75
        ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
        : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]";

  const heights = {
    sm: "h-2",
    md: "h-3",
    lg: "h-5",
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide">
          {label && (
            <span className="text-[var(--foreground)]/80">
              {label}
            </span>
          )}
          {showPercentage && (
            <span
              className={`tabular-nums ${
                value >= 100
                  ? "text-red-600"
                  : "text-[var(--foreground)]/60"
              }`}
            >
              {Math.round(value)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`
          w-full rounded-full overflow-hidden
          glass-input
          ${heights[size]} p-0.5
        `}
      >
        <div
          className={`
            ${heights[size]} rounded-full ${barColor}
            transition-all duration-700 ease-out h-full
          `}
          style={{ width: `${clampedVisual}%` }}
        />
      </div>
    </div>
  );
}
