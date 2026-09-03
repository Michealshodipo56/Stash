import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-aware className combiner. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

const nairaFmt = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 });

/** e.g. ₦345,600 */
export function formatNaira(amount: number): string {
  return `₦${nairaFmt.format(Math.round(amount))}`;
}

/** e.g. 345,600 (grouped, no currency symbol) */
export function formatNumber(amount: number): string {
  return nairaFmt.format(Math.round(amount));
}

/** Compact form for tight spaces: ₦480k, ₦1.2m */
export function formatNairaShort(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) return `₦${trimZero(amount / 1_000_000)}m`;
  if (abs >= 1_000) return `₦${trimZero(amount / 1_000)}k`;
  return `₦${Math.round(amount)}`;
}

function trimZero(n: number): string {
  return n.toFixed(1).replace(/\.0$/, "");
}

/** e.g. "12 Jun, 2026" */
export function formatDate(input: Date | string): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Whole days from now until the deadline (clamped at 0). */
export function daysLeft(deadline: Date | string): number {
  const d = typeof deadline === "string" ? new Date(deadline) : deadline;
  const ms = d.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/** 0–100 progress percentage, clamped and rounded. */
export function pct(saved: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((saved / target) * 100)));
}

/** Initials for avatar fallbacks, e.g. "Tolu A." -> "TA". */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
