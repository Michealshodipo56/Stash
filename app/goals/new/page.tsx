"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Users,
  User,
  ShieldCheck,
  Lock,
  Wallet,
  Zap,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Bell,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { Logo } from "@/app/components/Logo";
import { installmentBreakdown, FREQUENCY_LABEL } from "@/lib/calculator";
import { daysLeft } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Frequency, GoalType } from "@/lib/types";
import { useAuth } from "@/app/context/AuthContext";

export default function NewGoalPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  // Auth & KYC guard
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login?redirect=/goals/new");
      } else if (!user.isKycVerified) {
        router.push("/onboarding?redirect=/goals/new");
      }
    }
  }, [user, authLoading, router]);

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Form State — starts completely clean with no hardcoded pre-filled template data
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [goalType, setGoalType] = useState<GoalType>("individual");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [emoji, setEmoji] = useState("🎯");

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccess, setAiSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [retailerMatches, setRetailerMatches] = useState<any[]>([]);
  const [appliedRetailerId, setAppliedRetailerId] = useState<string | null>(null);

  // Installment calculations
  const [breakdown, setBreakdown] = useState<Record<Frequency, number>>({
    daily: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0,
  });

  const amountNum = parseFloat(amount.replace(/,/g, "")) || 0;

  useEffect(() => {
    if (amountNum > 0 && deadline) {
      setBreakdown(installmentBreakdown({ target: amountNum, deadline }));
    } else {
      setBreakdown({ daily: 0, weekly: 0, monthly: 0, yearly: 0 });
    }
  }, [amountNum, deadline]);

  const daysToDeadline = deadline ? daysLeft(deadline) : 0;
  const isYearlyDisabled = daysToDeadline > 0 && daysToDeadline < 365;
  const isMonthlyDisabled = daysToDeadline > 0 && daysToDeadline < 30;
  const isWeeklyDisabled = daysToDeadline > 0 && daysToDeadline < 7;

  // Auto-adjust frequency if chosen frequency exceeds the deadline range
  useEffect(() => {
    if (deadline && daysToDeadline > 0) {
      if (frequency === "yearly" && isYearlyDisabled) {
        setFrequency(daysToDeadline >= 30 ? "monthly" : daysToDeadline >= 7 ? "weekly" : "daily");
      } else if (frequency === "monthly" && isMonthlyDisabled) {
        setFrequency(daysToDeadline >= 7 ? "weekly" : "daily");
      } else if (frequency === "weekly" && isWeeklyDisabled) {
        setFrequency("daily");
      }
    }
  }, [deadline, daysToDeadline, frequency, isYearlyDisabled, isMonthlyDisabled, isWeeklyDisabled]);

  const weeks = Math.max(1, Math.ceil((daysToDeadline || 365) / 7));
  const months = Math.max(1, Math.round((daysToDeadline || 365) / 30));

  function handleAmountChange(raw: string) {
    const digits = raw.replace(/[^\d]/g, "");
    setAmount(digits ? Number(digits).toLocaleString("en-NG") : "");
    setAppliedRetailerId(null);
  }

  function applyRetailerOption(opt: any) {
    if (opt.itemTitle) setTitle(opt.itemTitle);
    if (opt.price) setAmount(Number(opt.price).toLocaleString("en-NG"));
    if (opt.emoji) setEmoji(opt.emoji);
    setAppliedRetailerId(opt.id);
  }

  // Handle AI Parse & Auto-populate Form
  async function handleAiLookup(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    setAiError(null);
    setAiSuccess(false);
    try {
      const res = await fetch("/api/ai/parse-goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await res.json();

      if (data.error) {
        setAiError(data.error);
        return;
      }

      if (data.success && data.parsed) {
        if (data.parsed.itemTitle) setTitle(data.parsed.itemTitle);
        if (data.parsed.deadline) setDeadline(data.parsed.deadline);
        if (data.parsed.emoji) setEmoji(data.parsed.emoji);

        if (data.retailerMatches && data.retailerMatches.length > 0) {
          setRetailerMatches(data.retailerMatches);
          const topMatch = data.retailerMatches[0];
          setAmount(topMatch.price.toLocaleString("en-NG"));
          if (topMatch.emoji) setEmoji(topMatch.emoji);
          setAppliedRetailerId(topMatch.id);
        } else {
          setRetailerMatches([]);
          setAppliedRetailerId(null);
        }
        setAiSuccess(true);
      }
    } catch (err) {
      console.error(err);
      setAiError("Could not reach the AI assistant. Please fill in the details manually.");
    } finally {
      setAiLoading(false);
    }
  }

  // Submit Goal
  async function handleCreateGoal(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!user || !title || amountNum <= 0 || !deadline) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          ownerId: user.id,
          ownerName: user.name,
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

  if (authLoading || !user || !user.isKycVerified) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#8CC63F] animate-spin mx-auto" />
          <p className="text-sm font-medium text-[#595B52]">Checking KYC &amp; Payout verification...</p>
        </div>
      </div>
    );
  }

  const userInitials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AA";

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#17170F] font-sans selection:bg-[#d0e8a4] selection:text-[#17170F]">
      {/* ── TOP APP NAVIGATION ────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#ECEAE0]">
        <div className="mx-auto max-w-7xl px-6 md:px-12 py-3.5 flex items-center justify-between">
          <Link href="/" className="shrink-0">
            <Logo className="text-2xl tracking-tight" />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-[#4A4C42]">
            <Link href="/dashboard" className="hover:text-[#17170F] transition-colors">
              Dashboard
            </Link>
            <Link href="/dashboard" className="text-[#17170F] font-bold">
              Goals
            </Link>
            <Link href="/dashboard" className="hover:text-[#17170F] transition-colors">
              Groups
            </Link>
            <Link href="/activity" className="hover:text-[#17170F] transition-colors">
              Activity
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3.5">
            <button
              type="button"
              className="hidden sm:inline-flex p-1.5 text-gray-500 hover:text-[#17170F] transition-colors rounded-full hover:bg-gray-100"
            >
              <Bell className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-1.5 cursor-pointer pl-1">
              <div className="w-8 h-8 rounded-full bg-[#E5E3D8] text-[#17170F] font-bold text-xs flex items-center justify-center border border-white shadow-2xs">
                {userInitials}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <button
              type="button"
              className="md:hidden rounded-xl border border-[#ECEAE0] bg-white p-2.5 text-[#17170F] hover:bg-[#F0EFEA] transition-colors"
              aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen((v) => !v)}
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileNavOpen && (
          <div className="md:hidden border-t border-[#ECEAE0] bg-[#FAF9F5] px-6 py-4 space-y-1">
            {[
              { href: "/dashboard", label: "Dashboard" },
              { href: "/dashboard", label: "Goals" },
              { href: "/dashboard", label: "Groups" },
              { href: "/activity", label: "Activity" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[#4A4C42] hover:bg-white hover:text-[#17170F] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* ── MAIN CONTAINER ────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-6 md:px-12 py-8 space-y-8">
        {/* Title & Step Tracker */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#17170F] tracking-tight">
              Create a goal
            </h1>
            <p className="mt-1 text-sm text-[#595B52] font-normal">
              Plan your goal, save on a schedule, and hit your target.
            </p>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#8CC63F] text-[#17170F] font-bold text-[11px] flex items-center justify-center">
                1
              </span>
              <span className="font-bold text-[#17170F]">Goal details</span>
            </div>
            <div className="w-12 h-px bg-gray-300" />
            <div className="flex items-center gap-2 text-gray-400">
              <span className="w-5 h-5 rounded-full border border-gray-300 text-[11px] flex items-center justify-center font-medium">
                2
              </span>
              <span>Savings plan</span>
            </div>
          </div>
        </div>

        {/* ── TWO-COLUMN MAIN GRID ──────────────────────── */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* ── LEFT COLUMN (AI Box + Manual Form) ────────── */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. AI Goal Plan Builder Card */}
            <div className="rounded-[24px] border border-[#D8ECC0] bg-[#F7FBEF] p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#8CC63F] text-[#17170F] flex items-center justify-center font-extrabold text-lg shadow-xs shrink-0">
                  <Sparkles className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#17170F] leading-snug">
                    What are you saving for?
                  </h2>
                  <p className="text-xs text-[#595B52] font-normal mt-0.5">
                    Tell us what you want, when you need it, and we&apos;ll build the plan.
                  </p>
                </div>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => {
                    setAiPrompt(e.target.value);
                    setAiError(null);
                    setAiSuccess(false);
                  }}
                  maxLength={300}
                  rows={3}
                  placeholder="e.g. I want an iPhone 14 before December, or a MacBook Air soon..."
                  className={cn(
                    "w-full rounded-2xl border bg-white p-4 text-sm text-[#17170F] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all shadow-2xs resize-none",
                    aiError
                      ? "border-red-300 focus:ring-red-300"
                      : aiSuccess
                      ? "border-[#8CC63F] focus:ring-[#8CC63F]"
                      : "border-[#D5E6BC] focus:ring-[#8CC63F]"
                  )}
                />
                <span className="absolute right-3.5 bottom-3 text-[10px] text-gray-400 font-medium">
                  {aiPrompt.length}/300
                </span>
              </div>

              {/* AI Error Banner */}
              {aiError && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs text-red-700">
                  <span className="shrink-0 mt-0.5">⚠️</span>
                  <span>{aiError}</span>
                </div>
              )}

              {/* AI Success Banner */}
              {aiSuccess && !aiError && (
                <div className="flex items-center gap-2 rounded-xl bg-[#EBF5D7] border border-[#C4E09A] px-3.5 py-2 text-xs text-[#3b6e12] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 fill-[#8CC63F] text-white" />
                  <span>Plan auto-filled from your prompt — review and adjust below.</span>
                </div>
              )}

              {/* Tags and Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAiPrompt("I want to save for an iPhone 14 before December")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#D8ECC0] bg-white/80 hover:bg-white text-[11px] text-[#4A4C42] transition-colors"
                  >
                    <span>💡</span>
                    <span>iPhone 14</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiPrompt("Save for a MacBook Air M2 by 12 December 2026")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#D8ECC0] bg-white/80 hover:bg-white text-[11px] text-[#4A4C42] transition-colors"
                  >
                    <span>💻</span>
                    <span>MacBook Air</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleAiLookup()}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8CC63F] hover:bg-[#7db835] text-[#17170F] px-5 py-2.5 text-xs sm:text-sm font-bold transition-all shadow-xs shrink-0 disabled:opacity-40"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Parsing intent...</span>
                    </>
                  ) : (
                    <>
                      <span>Create my plan</span>
                      <Sparkles className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {/* Verified Retailer Options */}
              {retailerMatches.length > 0 && (
                <div className="pt-3 border-t border-[#D8ECC0] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#17170F]">
                      Verified Retailer Prices in Nigeria:
                    </p>
                    <span className="text-[11px] text-[#427418] font-semibold">
                      Click apply to auto-fill target amount
                    </span>
                  </div>
                  <div className="grid gap-2">
                    {retailerMatches.map((opt) => (
                      <div
                        key={opt.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl border transition-all text-xs",
                          appliedRetailerId === opt.id
                            ? "bg-[#EBF5D7] border-[#8CC63F] shadow-2xs"
                            : "bg-white border-[#D5E6BC] hover:border-[#8CC63F]"
                        )}
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span
                              className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded text-white"
                              style={{ backgroundColor: opt.retailerBadgeColor || "#4361ee" }}
                            >
                              {opt.retailer}
                            </span>
                            <a
                              href={opt.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-gray-400 hover:text-gray-600 inline-flex items-center text-[10px]"
                              title="View store listing"
                            >
                              <span>View store</span>
                              <span className="ml-0.5">↗</span>
                            </a>
                          </div>
                          <p className="font-bold text-[#17170F] truncate">{opt.itemTitle}</p>
                          <p className="text-[10px] text-gray-500 truncate">{opt.description}</p>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="font-display font-extrabold text-sm text-[#17170F]">
                            ₦{Number(opt.price).toLocaleString("en-NG")}
                          </span>
                          <button
                            type="button"
                            onClick={() => applyRetailerOption(opt)}
                            className={cn(
                              "px-3 py-1.5 rounded-lg font-bold text-xs transition shadow-2xs",
                              appliedRetailerId === opt.id
                                ? "bg-[#8CC63F] text-[#17170F]"
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

            {/* 2. Manual Setup Card */}
            <div className="rounded-[24px] border border-[#ECEAE0] bg-white p-6 sm:p-7 shadow-2xs space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#17170F]">
                  Manual Goal Details &amp; Frequency
                </h2>
                <p className="text-xs text-[#595B52] font-normal mt-0.5">
                  The AI pre-fills these fields based on your prompt, or you can enter them manually.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                {/* Goal Name */}
                <div>
                  <label className="block text-xs font-bold text-[#17170F] mb-1.5">
                    Goal name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. iPhone 14, MacBook Air, School Fees..."
                      className="w-full rounded-xl border border-[#E2DFD2] bg-white px-3.5 py-3 text-sm text-[#17170F] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8CC63F] focus:border-transparent transition-all shadow-2xs font-medium"
                    />
                  </div>
                </div>

                {/* Target Amount */}
                <div>
                  <label className="block text-xs font-bold text-[#17170F] mb-1.5">
                    Target amount (₦)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-sm">
                      ₦
                    </span>
                    <input
                      type="text"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-xl border border-[#E2DFD2] bg-white pl-8 pr-3.5 py-3 text-sm text-[#17170F] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8CC63F] focus:border-transparent transition-all shadow-2xs tabular-nums font-semibold"
                    />
                  </div>
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-xs font-bold text-[#17170F] mb-1.5">
                    Deadline
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full rounded-xl border border-[#E2DFD2] bg-white px-3.5 py-3 text-sm text-[#17170F] focus:outline-none focus:ring-2 focus:ring-[#8CC63F] focus:border-transparent transition-all shadow-2xs font-medium"
                    />
                  </div>
                </div>

                {/* Saving As (Individual vs Group) */}
                <div>
                  <label className="block text-xs font-bold text-[#17170F] mb-1.5">
                    I&apos;m saving as
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGoalType("individual")}
                      className={cn(
                        "flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs transition-all",
                        goalType === "individual"
                          ? "border-2 border-[#8CC63F] bg-[#F4F9EB] text-[#17170F] font-bold shadow-2xs"
                          : "border border-[#E2DFD2] bg-white text-gray-600 hover:bg-gray-50 font-medium"
                      )}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Individual</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGoalType("group")}
                      className={cn(
                        "flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs transition-all",
                        goalType === "group"
                          ? "border-2 border-[#8CC63F] bg-[#F4F9EB] text-[#17170F] font-bold shadow-2xs"
                          : "border border-[#E2DFD2] bg-white text-gray-600 hover:bg-gray-50 font-medium"
                      )}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Group</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ── SAVINGS FREQUENCY SELECTOR (Daily, Weekly, Monthly, Yearly) ── */}
              <div className="pt-2 border-t border-[#ECEAE0] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#17170F]">
                    Savings Frequency
                  </label>
                  {deadline && (
                    <span className="text-[11px] text-[#595B52] font-medium">
                      Deadline in {daysToDeadline} days
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { key: "daily" as Frequency, label: "Daily", disabled: false },
                    {
                      key: "weekly" as Frequency,
                      label: "Weekly",
                      disabled: isWeeklyDisabled,
                      tooltip: "Requires at least 7 days deadline",
                    },
                    {
                      key: "monthly" as Frequency,
                      label: "Monthly",
                      disabled: isMonthlyDisabled,
                      tooltip: "Requires at least 30 days deadline",
                    },
                    {
                      key: "yearly" as Frequency,
                      label: "Yearly",
                      disabled: isYearlyDisabled,
                      tooltip: "Requires at least 365 days deadline",
                    },
                  ].map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      disabled={f.disabled}
                      onClick={() => setFrequency(f.key)}
                      title={f.disabled ? f.tooltip : undefined}
                      className={cn(
                        "py-2.5 px-3 rounded-xl text-xs font-bold transition-all relative flex flex-col items-center justify-center gap-0.5",
                        frequency === f.key
                          ? "border-2 border-[#8CC63F] bg-[#F4F9EB] text-[#17170F] shadow-2xs"
                          : f.disabled
                          ? "border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-50"
                          : "border border-[#E2DFD2] bg-white text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <span>{f.label}</span>
                      {f.disabled && (
                        <span className="text-[9px] font-normal text-gray-400">Short deadline</span>
                      )}
                    </button>
                  ))}
                </div>

                {isYearlyDisabled && frequency === "yearly" && (
                  <p className="text-[11px] text-amber-600 font-medium">
                    ⚠️ Yearly saving is disabled because your deadline is less than 1 year (365 days) away.
                  </p>
                )}
                {isMonthlyDisabled && frequency === "monthly" && (
                  <p className="text-[11px] text-amber-600 font-medium">
                    ⚠️ Monthly saving is disabled because your deadline is less than 30 days away.
                  </p>
                )}
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleCreateGoal}
                  disabled={submitting || !title || amountNum <= 0 || !deadline}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#17170F] hover:bg-[#17170F] hover:text-white text-[#17170F] px-6 py-2.5 text-xs sm:text-sm font-bold transition-all disabled:opacity-40"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN (Your Plan Preview) ──────────── */}
          <div className="lg:col-span-5">
            <div className="rounded-[24px] border border-[#ECEAE0] bg-white p-6 sm:p-7 shadow-2xs space-y-5 sticky top-24">
              {/* Header */}
              <div>
                <h2 className="text-base font-bold text-[#17170F]">
                  Your plan preview
                </h2>
                <p className="text-xs text-[#427418] font-semibold flex items-center gap-1.5 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 fill-[#8CC63F] text-white" />
                  <span>
                    {title ? "Plan configured" : "Waiting for goal details"}
                  </span>
                </p>
              </div>

              {/* Goal Snapshot Card (NO thumbnail emoji box as requested) */}
              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#ECEAE0]">
                <div className="min-w-0">
                  <p className="font-bold text-sm text-[#17170F] truncate">{title || "Goal item name"}</p>
                  <p className="font-display font-extrabold text-2xl text-[#17170F] tracking-tight mt-1">
                    ₦{amountNum > 0 ? amountNum.toLocaleString("en-NG") : "0"}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Target amount</p>
                  <p className="text-[11px] text-[#595B52] font-medium flex items-center gap-1 mt-2">
                    <span>📅</span>
                    <span>
                      {deadline
                        ? new Date(deadline).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "No deadline set"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Recommended Savings according to chosen frequency */}
              <div className="pt-1">
                <p className="text-xs font-semibold text-[#595B52] capitalize">
                  Recommended {frequency} savings
                </p>
                <div className="flex items-baseline justify-between mt-1">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-extrabold text-2xl text-[#8CC63F] tracking-tight">
                      ₦{breakdown[frequency] > 0 ? breakdown[frequency].toLocaleString("en-NG") : "0"}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">/ {FREQUENCY_LABEL[frequency]}</span>
                  </div>
                  {daysToDeadline > 0 && (
                    <span className="rounded-full bg-[#EBF5D7] text-[#427418] text-[10px] font-bold px-2.5 py-1">
                      {daysToDeadline} days left
                    </span>
                  )}
                </div>
              </div>

              {/* Plan Summary Table */}
              <div className="pt-2 border-t border-[#ECEAE0] space-y-2.5 text-xs">
                <p className="font-bold text-[#17170F] text-[11px] uppercase tracking-wider">
                  Plan summary
                </p>
                <div className="flex items-center justify-between text-[#595B52]">
                  <span>Target amount</span>
                  <span className="font-bold text-[#17170F]">
                    ₦{amountNum > 0 ? amountNum.toLocaleString("en-NG") : "0"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#595B52]">
                  <span>Deadline</span>
                  <span className="font-bold text-[#17170F]">
                    {deadline
                      ? new Date(deadline).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Not set"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#595B52]">
                  <span>Time to goal</span>
                  <span className="font-bold text-[#17170F]">{daysToDeadline} days</span>
                </div>
                <div className="flex items-center justify-between text-[#595B52]">
                  <span>Total weeks</span>
                  <span className="font-bold text-[#17170F]">{weeks} weeks</span>
                </div>
                <div className="flex items-center justify-between text-[#595B52]">
                  <span>Frequency</span>
                  <span className="font-bold text-[#17170F] capitalize">{frequency}</span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="pt-1">
                <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold mb-1">
                  <span>0%</span>
                  <span className="text-[#17170F]">₦0 saved</span>
                  <span>₦{amountNum > 0 ? amountNum.toLocaleString("en-NG") : "0"}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="w-0 h-full bg-[#8CC63F] rounded-full" />
                </div>
              </div>

              {/* Security Alert Card */}
              <div className="rounded-xl bg-[#F4F9EB] border border-[#E0EFCC] p-3 flex items-start gap-2.5">
                <div className="p-1 rounded-lg bg-[#8CC63F] text-[#17170F] shrink-0 mt-0.5">
                  <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#17170F]">
                    You can adjust your plan anytime
                  </p>
                  <p className="text-[11px] text-[#595B52] leading-snug mt-0.5">
                    Contributions are flexible. You&apos;re in control.
                  </p>
                </div>
              </div>

              {/* Direct Submit Action */}
              <button
                type="button"
                onClick={handleCreateGoal}
                disabled={submitting || !title || amountNum <= 0 || !deadline}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#8CC63F] hover:bg-[#7db835] text-[#17170F] text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow disabled:opacity-40"
              >
                <span>{submitting ? "Creating goal..." : "Confirm & Start Goal 🎯"}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* ── BOTTOM TRUST & FEATURE BADGES BAR ─────────── */}
        <section className="pt-6">
          <div className="rounded-[24px] border border-[#E7E5DC] bg-white grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5DC] shadow-2xs">
            {[
              {
                icon: <ShieldCheck className="h-6 w-6 stroke-[1.8] text-[#17170F]" />,
                title: "Secure & regulated",
                body: "Your money is protected.",
              },
              {
                icon: <Users className="h-6 w-6 stroke-[1.8] text-[#17170F]" />,
                title: "No account needed",
                body: "Anyone can contribute.",
              },
              {
                icon: <Wallet className="h-6 w-6 stroke-[1.8] text-[#17170F]" />,
                title: "Fair when plans change",
                body: "Refunds are safe and proportional.",
              },
              {
                icon: <Zap className="h-6 w-6 stroke-[1.8] text-[#17170F]" />,
                title: "Built for real goals",
                body: "Simple, transparent, and affordable.",
              },
            ].map(({ icon, title, body }) => (
              <div key={title} className="flex items-center gap-3.5 px-6 py-4">
                <div className="shrink-0 text-[#17170F]">{icon}</div>
                <div>
                  <p className="text-xs font-bold text-[#17170F] leading-tight">{title}</p>
                  <p className="text-[11px] text-[#595B52] mt-0.5 leading-snug font-normal">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
