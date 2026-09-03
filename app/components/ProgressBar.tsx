import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0–100
  color?: "brand" | "amber" | "coral";
  className?: string;
  showPulse?: boolean;
}

const colorMap = {
  brand: "bg-brand-500",
  amber: "bg-amber-400",
  coral: "bg-coral-400",
};

export function ProgressBar({
  value,
  color = "brand",
  className,
  showPulse = false,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-line",
        className
      )}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-700",
          colorMap[color],
          showPulse && clamped > 0 && "animate-[pulse-ring_2.4s_ease-out_infinite]"
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
