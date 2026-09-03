"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Target, Users, User, ChevronRight } from "lucide-react";
import { Logo } from "@/app/components/Logo";
import { installmentBreakdown } from "@/lib/calculator";
import { formatNaira, daysLeft } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Frequency, GoalType } from "@/lib/types";

const EMOJIS = ["🎯", "📱", "💻", "🎥", "🍽️", "✈️", "🏠", "📚", "💊", "🎓", "🚗", "⚽"];

export default function NewGoalPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  // Form state
  const [emoji, setEmoji] = useState("🎯");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [goalType, setGoalType] = useState<GoalType>("individual");
  const [frequency, setFrequency] = useState<Frequency>("monthly");

  // Calculator
  const [breakdown, setBreakdown] = useState<Record<Frequency, number>>({
    daily: 0,
    weekly: 0,
    monthly: 0,
  });

  const amountNum = parseFloat(amount.replace(/,/g, "")) || 0;
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  useEffect(() => {
    if (amountNum > 0 && deadline) {
      setBreakdown(installmentBreakdown({ target: amountNum, deadline }));
    }
  }, [amountNum, deadline]);

  const days = deadline ? daysLeft(deadline) : 0;
  const step1Valid = title.trim().length > 0 && amountNum > 0 && deadline !== "";
  const chosenInstallment = breakdown[frequency];

  function handleAmountChange(raw: string) {
    const digits = raw.replace(/[^\d]/g, "");
    setAmount(digits ? Number(digits).toLocaleString("en-NG") : "");
  }

  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          type: goalType,
          targetAmount: amountNum,
          deadline,
          frequency,
          emoji,
        }),
      });
      const data = await res.json();
      if (data.success && data.goal?.id) {
        router.push(`/goals/${data.goal.id}`);
      } else {
        router.push("/dashboard");
      }
    } catch {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-cream/80 backdrop-blur-sm border-b border-line">
        <div className="mx-auto max-w-xl px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted hover:text-ink transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <Logo className="text-xl" />
          <div className="w-20" />
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-8">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-ink tracking-tight">Create a goal</h1>
          <p className="text-muted mt-1 text-sm">Set what you want, its price, and your deadline.</p>
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-2 mb-8">
          <StepDot active={step >= 1} done={step > 1} label="Details" />
          <div className={cn("flex-1 h-0.5 rounded-full transition-colors duration-300", step > 1 ? "bg-brand-400" : "bg-line")} />
          <StepDot active={step >= 2} done={false} label="Schedule" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <Step1
              emoji={emoji}
              onEmoji={setEmoji}
              title={title}
              onTitle={setTitle}
              amount={amount}
              onAmount={handleAmountChange}
              deadline={deadline}
              onDeadline={setDeadline}
              minDate={minDateStr}
              goalType={goalType}
              onGoalType={setGoalType}
              days={days}
            />
          )}

          {step === 2 && (
            <Step2
              frequency={frequency}
              onFrequency={setFrequency}
              breakdown={breakdown}
              amountNum={amountNum}
              deadline={deadline}
              title={title}
              emoji={emoji}
              chosenInstallment={chosenInstallment}
            />
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 rounded-full border-2 border-ink py-3 text-sm font-semibold text-ink hover:bg-ink/5 transition-colors"
              >
                Back
              </button>
            )}
            {step === 1 ? (
              <button
                type="button"
                id="next-step-btn"
                disabled={!step1Valid}
                onClick={() => setStep(2)}
                className="flex-1 flex items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-semibold text-cream disabled:opacity-40 disabled:cursor-not-allowed hover:bg-ink-hover transition-colors"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                id="create-goal-btn"
                disabled={submitting}
                className="flex-1 rounded-full bg-brand-500 py-3 text-sm font-semibold text-ink hover:bg-brand-400 disabled:opacity-50 transition-colors"
              >
                {submitting ? "Creating goal..." : "Create goal 🎯"}
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}

/* ── Step dots ─────────────────────────────────────────────── */
function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300",
          done ? "bg-brand-500 text-ink" : active ? "bg-ink text-cream" : "bg-line-soft text-faint"
        )}
      >
        {done ? "✓" : active ? "●" : "○"}
      </div>
      <span className={cn("text-xs", active ? "text-ink font-medium" : "text-faint")}>{label}</span>
    </div>
  );
}

/* ── Step 1: Goal Details ───────────────────────────────────── */
function Step1({
  emoji, onEmoji, title, onTitle, amount, onAmount,
  deadline, onDeadline, minDate, goalType, onGoalType, days,
}: {
  emoji: string; onEmoji: (e: string) => void;
  title: string; onTitle: (t: string) => void;
  amount: string; onAmount: (a: string) => void;
  deadline: string; onDeadline: (d: string) => void;
  minDate: string; goalType: GoalType; onGoalType: (t: GoalType) => void;
  days: number;
}) {
  return (
    <div className="space-y-5">
      {/* Emoji picker */}
      <div>
        <label className="block text-sm font-semibold text-ink mb-2">Pick an emoji</label>
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => onEmoji(e)}
              className={cn(
                "w-10 h-10 rounded-xl text-xl transition-all hover:scale-110",
                emoji === e
                  ? "bg-brand-100 ring-2 ring-brand-500 scale-110"
                  : "bg-surface border border-line hover:bg-surface-2"
              )}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Goal name */}
      <div>
        <label htmlFor="goal-title" className="block text-sm font-semibold text-ink mb-2">
          Goal name
        </label>
        <input
          id="goal-title"
          type="text"
          placeholder="e.g. New Phone, Departmental Projector…"
          value={title}
          onChange={(e) => onTitle(e.target.value)}
          maxLength={60}
          className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-brand-400 transition"
        />
      </div>

      {/* Target amount */}
      <div>
        <label htmlFor="goal-amount" className="block text-sm font-semibold text-ink mb-2">
          Target amount (₦)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-bold select-none">₦</span>
          <input
            id="goal-amount"
            type="text"
            inputMode="numeric"
            placeholder="150,000"
            value={amount}
            onChange={(e) => onAmount(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface py-3 pl-8 pr-4 text-sm text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-brand-400 transition tabular"
          />
        </div>
      </div>

      {/* Deadline */}
      <div>
        <label htmlFor="goal-deadline" className="block text-sm font-semibold text-ink mb-2">
          Deadline
        </label>
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
          <input
            id="goal-deadline"
            type="date"
            min={minDate}
            value={deadline}
            onChange={(e) => onDeadline(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface py-3 pl-10 pr-4 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400 transition"
          />
        </div>
        {days > 0 && (
          <p className="text-xs text-muted mt-1.5 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-400" />
            {days} day{days !== 1 ? "s" : ""} until your deadline
          </p>
        )}
      </div>

      {/* Goal type */}
      <div>
        <label className="block text-sm font-semibold text-ink mb-2">Goal type</label>
        <div className="grid grid-cols-2 gap-3">
          <TypeCard
            id="type-individual"
            icon={<User className="h-5 w-5" />}
            label="Individual"
            desc="Save solo toward this goal"
            active={goalType === "individual"}
            onClick={() => onGoalType("individual")}
          />
          <TypeCard
            id="type-group"
            icon={<Users className="h-5 w-5" />}
            label="Group"
            desc="Pool contributions with others"
            active={goalType === "group"}
            onClick={() => onGoalType("group")}
          />
        </div>
      </div>
    </div>
  );
}

function TypeCard({
  id, icon, label, desc, active, onClick,
}: {
  id: string; icon: React.ReactNode; label: string; desc: string;
  active: boolean; onClick: () => void;
}) {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-1.5 rounded-xl border-2 p-4 text-left transition-all",
        active
          ? "border-brand-500 bg-brand-50"
          : "border-line bg-surface hover:border-brand-300 hover:bg-surface-2"
      )}
    >
      <div className={cn("rounded-lg p-1.5", active ? "bg-brand-500 text-ink" : "bg-line-soft text-muted")}>
        {icon}
      </div>
      <p className={cn("text-sm font-semibold", active ? "text-ink" : "text-muted")}>{label}</p>
      <p className="text-xs text-faint leading-snug">{desc}</p>
    </button>
  );
}

/* ── Step 2: Savings Schedule (Calculator) ──────────────────── */
function Step2({
  frequency, onFrequency, breakdown, amountNum, deadline, title, emoji, chosenInstallment,
}: {
  frequency: Frequency; onFrequency: (f: Frequency) => void;
  breakdown: Record<Frequency, number>;
  amountNum: number; deadline: string;
  title: string; emoji: string;
  chosenInstallment: number;
}) {
  const freqs: { key: Frequency; label: string; sub: string }[] = [
    { key: "daily", label: "Daily", sub: "every day" },
    { key: "weekly", label: "Weekly", sub: "every week" },
    { key: "monthly", label: "Monthly", sub: "every month" },
  ];

  return (
    <div className="space-y-5">
      {/* Preview tile */}
      <div className="rounded-xl bg-ink text-cream p-5 flex items-start gap-3">
        <span className="text-3xl">{emoji}</span>
        <div>
          <p className="font-display font-bold text-lg leading-tight">{title || "Your goal"}</p>
          <p className="text-cream/60 text-sm mt-0.5">
            {formatNaira(amountNum)} · due {deadline ? new Date(deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
          </p>
        </div>
      </div>

      {/* Frequency selector */}
      <div>
        <p className="text-sm font-semibold text-ink mb-3">How often will you save?</p>
        <div className="space-y-2">
          {freqs.map(({ key, label, sub }) => (
            <button
              key={key}
              id={`freq-${key}`}
              type="button"
              onClick={() => onFrequency(key)}
              className={cn(
                "w-full flex items-center justify-between rounded-xl border-2 px-4 py-3 transition-all",
                frequency === key
                  ? "border-brand-500 bg-brand-50"
                  : "border-line bg-surface hover:border-brand-300"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                    frequency === key ? "border-brand-500" : "border-line"
                  )}
                >
                  {frequency === key && <div className="w-2 h-2 rounded-full bg-brand-500" />}
                </div>
                <div className="text-left">
                  <p className={cn("text-sm font-semibold", frequency === key ? "text-ink" : "text-muted")}>{label}</p>
                  <p className="text-xs text-faint">{sub}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn("font-display font-bold tabular text-lg", frequency === key ? "text-ink" : "text-muted")}>
                  {formatNaira(breakdown[key])}
                </p>
                <p className="text-xs text-faint">/{key === "daily" ? "day" : key === "weekly" ? "wk" : "mo"}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Summary callout */}
      {chosenInstallment > 0 && (
        <div className="rounded-xl bg-brand-50 border border-brand-200 p-4 flex items-start gap-3">
          <span className="text-brand-500 font-bold text-xl leading-none">✓</span>
          <p className="text-sm text-ink leading-relaxed">
            Save{" "}
            <span className="font-semibold tabular">{formatNaira(chosenInstallment)}</span>{" "}
            {frequency} and you'll hit{" "}
            <span className="font-semibold">{formatNaira(amountNum)}</span> by your deadline.
          </p>
        </div>
      )}
    </div>
  );
}
