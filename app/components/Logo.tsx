import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn("font-display font-bold tracking-tight", className)}
      aria-label={BRAND.name}
    >
      <span className="text-ink">{BRAND.nameParts[0]}</span>
      <span className="text-brand-500">{BRAND.nameParts[1]}</span>
    </span>
  );
}
