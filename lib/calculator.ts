import type { Frequency } from "./types";

/** ~average days per month, for period counting. */
const DAYS_PER_MONTH = 30.44;

/** Whole days from `start` to `end` (at least 0). */
export function daysBetween(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/**
 * Number of savings periods between now and the deadline for a given frequency.
 * Always at least 1 — you can't save toward a goal in "zero" installments.
 */
export function periodsUntil(
  deadline: Date | string,
  frequency: Frequency,
  from: Date = new Date(),
): number {
  const end = typeof deadline === "string" ? new Date(deadline) : deadline;
  const days = daysBetween(from, end);
  if (days <= 0) return 1;
  switch (frequency) {
    case "daily":
      return Math.max(1, days);
    case "weekly":
      return Math.max(1, Math.ceil(days / 7));
    case "monthly":
      return Math.max(1, Math.ceil(days / DAYS_PER_MONTH));
  }
}

/**
 * The installment needed to reach `target` (minus what's already `saved`) by the
 * deadline, saving on the given frequency. Rounded UP so the plan actually lands
 * on/above target.
 */
export function installmentFor(params: {
  target: number;
  deadline: Date | string;
  frequency: Frequency;
  saved?: number;
  from?: Date;
}): number {
  const { target, deadline, frequency, saved = 0, from } = params;
  const remaining = Math.max(0, target - saved);
  if (remaining <= 0) return 0;
  const periods = periodsUntil(deadline, frequency, from);
  return Math.ceil(remaining / periods);
}

/** All three installment options at once — powers the live calculator toggle. */
export function installmentBreakdown(params: {
  target: number;
  deadline: Date | string;
  saved?: number;
  from?: Date;
}): Record<Frequency, number> {
  return {
    daily: installmentFor({ ...params, frequency: "daily" }),
    weekly: installmentFor({ ...params, frequency: "weekly" }),
    monthly: installmentFor({ ...params, frequency: "monthly" }),
  };
}

export const FREQUENCY_LABEL: Record<Frequency, string> = {
  daily: "day",
  weekly: "week",
  monthly: "month",
};

export const FREQUENCY_ADVERB: Record<Frequency, string> = {
  daily: "daily",
  weekly: "weekly",
  monthly: "monthly",
};
