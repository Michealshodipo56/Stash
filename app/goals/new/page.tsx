"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Sparkles,
  Users,
  User,
  ChevronRight,
  ExternalLink,
  Check,
  Search,
  Loader2,
  Info,
} from "lucide-react";
import { Logo } from "@/app/components/Logo";
import { installmentBreakdown } from "@/lib/calculator";
import { formatNaira, daysLeft } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Frequency, GoalType } from "@/lib/types";
import type { RetailerOption } from "@/lib/catalog";

const EMOJIS = ["🎯", "📱", "💻", "🎥", "🍽️", "✈️", "🏠", "📚", "💊", "🎓", "🚗", "⚽", "⚡", "📷"];

export default function NewGoalPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  // Form state (Manual by default)
  const [emoji, setEmoji] = useState("🎯");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [goalType, setGoalType] = useState<GoalType>("individual");
  const [frequency, setFrequency] = useState<Frequency>("monthly");

  // AI Assistant / Retailer Lookup state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [retailerMatches, setRetailerMatches] = useState<RetailerOption[]>([]);
  const [showAiHelper, setShowAiHelper] = useState(false);
  const [appliedRetailerId, setAppliedRetailerId] = useState<string | null>(null);

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
    setAppliedRetailerId(null);
  }

  // Handle AI Parse & Retailer Lookup
  async function handleAiLookup(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/parse-goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await res.json();
      if (data.success && data.parsed) {
        if (!title) setTitle(data.parsed.itemTitle);
        if (!deadline && data.parsed.deadline) setDeadline(data.parsed.deadline);
        if (data.parsed.emoji) setEmoji(data.parsed.emoji);
        if (data.retailerMatches && data.retailerMatches.length > 0) {
          setRetailerMatches(data.retailerMatches);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  }

  function applyRetailerOption(option: RetailerOption) {
    setTitle(option.itemTitle);
    setAmount(option.price.toLocaleString("en-NG"));
    setEmoji(option.emoji);
    setAppliedRetailerId(option.id);
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
    <div className="min-h-screen bg-[#FBF9F4] text-[#17170F]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#FBF9F4]/90 backdrop-blur-sm border-b border-[#E9E8E0]">
        <div className="mx-auto max-w-xl px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-[#595B52] hover:text-[#17170F] transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <Logo className="text-xl" />
          <div className="w-20" />
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-8">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-[#17170F] tracking-tight">Create a goal</h1>
          <p className="text-[#595B52] mt-1 text-sm">
            Save toward any purchase, project, or event on an automated schedule.
          </p>
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-2 mb-8">
          <StepDot active={step >= 1} done={step > 1} label="Goal Details" />
          <div className={cn("flex-1 h-0.5 rounded-full transition-colors duration-300", step > 1 ? "bg-brand-500" : "bg-line")} />
          <StepDot active={step >= 2} done={false} label="Savings Plan" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="space-y-6">
              {/* Optional AI / Retailer Lookup Banner */}
              <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-4 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-brand-500 text-ink">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-[#17170F]">
                        Buying a specific item? (Optional)
                      </p>
                      <p className="text-[11px] text-[#595B52]">
                        Find verified prices from Slot, Jumia, Konga, &amp; iStore.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAiHelper(!showAiHelper)}
                    className="text-xs font-bold text-brand-700 hover:text-brand-800 underline shrink-0"
                  >
                    {showAiHelper ? "Hide lookup" : "Try price lookup"}
                  </button>
                </div>

                {showAiHelper && (
                  <div className="mt-4 pt-3 border-t border-brand-200/60 space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. iPhone 14 before December, or MacBook Air M2..."
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAiLookup();
                          }
                        }}
                        className="w-full rounded-xl border border-[#D5D4CA] bg-white py-2.5 pl-3.5 pr-24 text-xs text-[#17170F] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleAiLookup()}
                        disabled={aiLoading || !aiPrompt.trim()}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-[#17170F] text-white px-3 py-1.5 text-xs font-semibold hover:bg-black disabled:opacity-40 transition flex items-center gap-1.5"
                      >
                        {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                        <span>Lookup</span>
                      </button>
                    </div>

                    {/* Retailer matches list */}
                    {retailerMatches.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <p className="text-[11px] font-bold text-[#17170F]">
                          Select a verified price to pre-fill:
                        </p>
                        <div className="grid gap-2">
                          {retailerMatches.map((opt) => (
                            <div
                              key={opt.id}
                              className={cn(
                                "flex items-center justify-between p-3 rounded-xl border transition-all text-xs",
                                appliedRetailerId === opt.id
                                  ? "bg-brand-100 border-brand-500 shadow-2xs"
                                  : "bg-white border-[#E5E3D8] hover:border-brand-300"
                              )}
                            >
                              <div className="flex-1 min-w-0 pr-2">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span
                                    className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded text-white"
                                    style={{ backgroundColor: opt.retailerBadgeColor }}
                                  >
                                    {opt.retailer}
                                  </span>
                                  <a
                                    href={opt.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-gray-400 hover:text-gray-600 inline-flex items-center"
                                    title="View store listing"
                                  >
                                    <ExternalLink className="w-3 h-3 ml-0.5" />
                                  </a>
                                </div>
                                <p className="font-semibold text-[#17170F] truncate">{opt.itemTitle}</p>
                                <p className="text-[10px] text-gray-500 truncate">{opt.description}</p>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="font-display font-bold text-sm text-[#17170F]">
                                  {formatNaira(opt.price)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => applyRetailerOption(opt)}
                                  className={cn(
                                    "px-2.5 py-1 rounded-lg font-bold text-[11px] transition",
                                    appliedRetailerId === opt.id
                                      ? "bg-brand-500 text-ink"
                                      : "bg-[#17170F] text-white hover:bg-black"
                                  )}
                                >
                                  {appliedRetailerId === opt.id ? "Applied ✓" : "Apply"}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step 1 Form Fields */}
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
            </div>
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
                className="flex-1 rounded-full border-2 border-[#17170F] py-3 text-sm font-semibold text-[#17170F] hover:bg-[#17170F]/5 transition-colors"
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
                className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[#17170F] py-3 text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black transition-colors"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                id="create-goal-btn"
                disabled={submitting}
                className="flex-1 rounded-full bg-brand-500 py-3 text-sm font-semibold text-[#17170F] hover:bg-brand-400 disabled:opacity-50 transition-colors shadow-sm"
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
          done ? "bg-brand-500 text-ink" : active ? "bg-[#17170F] text-white" : "bg-line-soft text-faint"
        )}
      >
        {done ? "✓" : active ? "●" : "○"}
      </div>
      <span className={cn("text-xs", active ? "text-[#17170F] font-medium" : "text-faint")}>{label}</span>
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
        <label className="block text-sm font-semibold text-[#17170F] mb-2">Pick an icon</label>
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
        <label htmlFor="goal-title" className="block text-sm font-semibold text-[#17170F] mb-2">
          Goal name
        </label>
        <input
          id="goal-title"
          type="text"
          placeholder="e.g. iPhone 14, School Fees, Department Projector…"
          value={title}
          onChange={(e) => onTitle(e.target.value)}
          maxLength={60}
          className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-[#17170F] placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-brand-400 transition"
        />
      </div>

      {/* Target amount */}
      <div>
        <label htmlFor="goal-amount" className="block text-sm font-semibold text-[#17170F] mb-2">
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
            className="w-full rounded-xl border border-line bg-surface py-3 pl-8 pr-4 text-sm text-[#17170F] placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-brand-400 transition tabular"
          />
        </div>
      </div>

      {/* Deadline */}
      <div>
        <label htmlFor="goal-deadline" className="block text-sm font-semibold text-[#17170F] mb-2">
          Target deadline
        </label>
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
          <input
            id="goal-deadline"
            type="date"
            min={minDate}
            value={deadline}
            onChange={(e) => onDeadline(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface py-3 pl-10 pr-4 text-sm text-[#17170F] focus:outline-none focus:ring-2 focus:ring-brand-400 transition"
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
        <label className="block text-sm font-semibold text-[#17170F] mb-2">Goal type</label>
        <div className="grid grid-cols-2 gap-3">
          <TypeCard
            id="type-individual"
            icon={<User className="h-5 w-5" />}
            label="Individual Goal"
            desc="Save solo toward this target"
            active={goalType === "individual"}
            onClick={() => onGoalType("individual")}
          />
          <TypeCard
            id="type-group"
            icon={<Users className="h-5 w-5" />}
            label="Group Goal"
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

/* ── Step 2: Savings Schedule (Live Calculator) ─────────────── */
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
      <div className="rounded-xl bg-[#17170F] text-cream p-5 flex items-start gap-3">
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
        <p className="text-sm font-semibold text-[#17170F] mb-3">How often will you save?</p>
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
          <p className="text-sm text-[#17170F] leading-relaxed">
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

