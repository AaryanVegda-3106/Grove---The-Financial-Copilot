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
      ? "bg-red-400"
      : value >= 75
        ? "bg-amber-400"
        : "bg-emerald-400";

  const heights = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs">
          {label && (
            <span className="font-medium text-[var(--foreground)]/70 capitalize">
              {label}
            </span>
          )}
          {showPercentage && (
            <span
              className={`font-semibold tabular-nums ${
                value >= 100
                  ? "text-red-400"
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
          bg-white/10 ${heights[size]}
        `}
      >
        <div
          className={`
            ${heights[size]} rounded-full ${barColor}
            transition-all duration-700 ease-out
          `}
          style={{ width: `${clampedVisual}%` }}
        />
      </div>
    </div>
  );
}
