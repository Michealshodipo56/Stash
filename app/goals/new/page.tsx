"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
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
  Info,
  Laptop,
  Check,
} from "lucide-react";
import { Logo } from "@/app/components/Logo";
import { installmentBreakdown } from "@/lib/calculator";
import { formatNaira, daysLeft } from "@/lib/utils";
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

  // Form State
  const [title, setTitle] = useState("MacBook Air");
  const [amount, setAmount] = useState("480,000");
  const [deadline, setDeadline] = useState("2026-12-12");
  const [goalType, setGoalType] = useState<GoalType>("individual");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [emoji, setEmoji] = useState("💻");

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState("I want to save for a MacBook Air by December...");
  const [aiLoading, setAiLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [retailerMatches, setRetailerMatches] = useState<any[]>([]);
  const [appliedRetailerId, setAppliedRetailerId] = useState<string | null>(null);

  // Installment calculations
  const [breakdown, setBreakdown] = useState<Record<Frequency, number>>({
    daily: 7077,
    weekly: 49539,
    monthly: 214285,
  });

  const amountNum = parseFloat(amount.replace(/,/g, "")) || 0;

  useEffect(() => {
    if (amountNum > 0 && deadline) {
      setBreakdown(installmentBreakdown({ target: amountNum, deadline }));
    }
  }, [amountNum, deadline]);

  const days = deadline ? daysLeft(deadline) : 365;
  const weeks = Math.max(1, Math.ceil(days / 7));
  const months = Math.max(1, Math.round(days / 30));

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

  // Handle AI Parse & Populate
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
        if (data.parsed.itemTitle) setTitle(data.parsed.itemTitle);
        if (data.parsed.deadline) setDeadline(data.parsed.deadline);
        if (data.parsed.emoji) setEmoji(data.parsed.emoji);
        if (data.retailerMatches && data.retailerMatches.length > 0) {
          setRetailerMatches(data.retailerMatches);
          const topMatch = data.retailerMatches[0];
          setAmount(topMatch.price.toLocaleString("en-NG"));
          if (topMatch.emoji) setEmoji(topMatch.emoji);
          setAppliedRetailerId(topMatch.id);
        }
      }
    } catch (err) {
      console.error(err);
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

          <div className="flex items-center gap-3.5">
            <button
              type="button"
              className="p-1.5 text-gray-500 hover:text-[#17170F] transition-colors rounded-full hover:bg-gray-100"
            >
              <Bell className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5 cursor-pointer pl-1">
              <div className="w-8 h-8 rounded-full bg-[#E5E3D8] text-[#17170F] font-bold text-xs flex items-center justify-center border border-white shadow-2xs">
                {userInitials}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </div>
          </div>
        </div>
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
                    Tell us what you want, when you need it, and we'll build the plan.
                  </p>
                </div>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  maxLength={300}
                  rows={3}
                  placeholder="I want to save for a MacBook Air by December..."
                  className="w-full rounded-2xl border border-[#D5E6BC] bg-white p-4 text-sm text-[#17170F] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8CC63F] focus:border-transparent transition-all shadow-2xs resize-none"
                />
                <span className="absolute right-3.5 bottom-3 text-[10px] text-gray-400 font-medium">
                  {aiPrompt.length}/300
                </span>
              </div>

              {/* Tags and Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAiPrompt("I want to save for a MacBook Air M2 256GB by December")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#D8ECC0] bg-white/80 hover:bg-white text-[11px] text-[#4A4C42] transition-colors"
                  >
                    <span>💡</span>
                    <span>Be specific</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiPrompt((prev) => prev + " by 12 December 2026")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#D8ECC0] bg-white/80 hover:bg-white text-[11px] text-[#4A4C42] transition-colors"
                  >
                    <span>📅</span>
                    <span>Include the deadline</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiPrompt("Save ₦480,000 for Apple MacBook Air M2 Laptop")}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#D8ECC0] bg-white/80 hover:bg-white text-[11px] text-[#4A4C42] transition-colors"
                  >
                    <span>🏷️</span>
                    <span>Add details</span>
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
                      <span>Finding best prices...</span>
                    </>
                  ) : (
                    <>
                      <span>Create my plan</span>
                      <Sparkles className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {/* Verified Retailer Options (Surfaced 2-3 real options with price + link) */}
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
                  Prefer to set it up yourself?
                </h2>
                <p className="text-xs text-[#595B52] font-normal mt-0.5">
                  No problem. You can enter the details manually.
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
                      placeholder="e.g. iPhone 16, School Fees, Department Projector..."
                      className="w-full rounded-xl border border-[#E2DFD2] bg-white px-3.5 py-3 text-sm text-[#17170F] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8CC63F] focus:border-transparent transition-all shadow-2xs"
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
                      className="w-full rounded-xl border border-[#E2DFD2] bg-white px-3.5 py-3 text-sm text-[#17170F] focus:outline-none focus:ring-2 focus:ring-[#8CC63F] focus:border-transparent transition-all shadow-2xs"
                    />
                  </div>
                </div>

                {/* Saving As (Individual vs Group) */}
                <div>
                  <label className="block text-xs font-bold text-[#17170F] mb-1.5">
                    I'm saving as
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
                  <span>Great! We've built a plan for you.</span>
                </p>
              </div>

              {/* Goal Snapshot Card */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FAF9F5] border border-[#ECEAE0]">
                {/* Visual Thumbnail */}
                <div className="w-16 h-12 rounded-xl bg-white border border-[#E5E3D8] flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
                  {title.toLowerCase().includes("laptop") || title.toLowerCase().includes("macbook") ? (
                    <svg viewBox="0 0 48 32" className="w-full h-full" fill="none">
                      <rect x="6" y="2" width="36" height="23" rx="2.5" fill="#1C1E21" stroke="#A6ACB5" strokeWidth="1.5" />
                      <rect x="8" y="4" width="32" height="19" rx="1" fill="#4B77BE" />
                      <path d="M 12 18 Q 24 10, 36 15" stroke="#E26A6A" strokeWidth="3" fill="none" />
                      <path d="M 2 26 L 46 26 L 43 28 L 5 28 Z" fill="#D3D7DC" stroke="#A6ACB5" strokeWidth="1" />
                    </svg>
                  ) : (
                    <span className="text-2xl select-none">{emoji}</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs text-[#17170F] truncate">{title || "Goal item"}</p>
                  <p className="font-display font-extrabold text-xl text-[#17170F] tracking-tight mt-0.5">
                    ₦{amountNum > 0 ? amountNum.toLocaleString("en-NG") : "0"}
                  </p>
                  <p className="text-[10px] text-gray-400">Target amount</p>
                  <p className="text-[11px] text-[#595B52] font-medium flex items-center gap-1 mt-1">
                    <span>📅</span>
                    <span>
                      {deadline
                        ? new Date(deadline).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "12 Dec 2026"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Recommended Daily Savings */}
              <div className="pt-1">
                <p className="text-xs font-semibold text-[#595B52]">
                  Recommended daily savings
                </p>
                <div className="flex items-baseline justify-between mt-1">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-extrabold text-2xl text-[#8CC63F] tracking-tight">
                      ₦{breakdown.daily > 0 ? breakdown.daily.toLocaleString("en-NG") : "7,077"}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">/ day</span>
                  </div>
                  <span className="rounded-full bg-[#EBF5D7] text-[#427418] text-[10px] font-bold px-2.5 py-1">
                    {months} months left
                  </span>
                </div>
                <p className="text-xs text-[#595B52] font-medium mt-0.5">
                  ₦{breakdown.weekly > 0 ? breakdown.weekly.toLocaleString("en-NG") : "49,539"} / week
                </p>
              </div>

              {/* Plan Summary Table */}
              <div className="pt-2 border-t border-[#ECEAE0] space-y-2.5 text-xs">
                <p className="font-bold text-[#17170F] text-[11px] uppercase tracking-wider">
                  Plan summary
                </p>
                <div className="flex items-center justify-between text-[#595B52]">
                  <span>Target amount</span>
                  <span className="font-bold text-[#17170F]">₦{amountNum.toLocaleString("en-NG")}</span>
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
                      : "12 Dec 2026"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#595B52]">
                  <span>Time to goal</span>
                  <span className="font-bold text-[#17170F]">{days} days</span>
                </div>
                <div className="flex items-center justify-between text-[#595B52]">
                  <span>Total weeks</span>
                  <span className="font-bold text-[#17170F]">{weeks} weeks</span>
                </div>
                <div className="flex items-center justify-between text-[#595B52]">
                  <span>Recommended weekly savings</span>
                  <span className="font-bold text-[#17170F]">
                    ₦{breakdown.weekly > 0 ? breakdown.weekly.toLocaleString("en-NG") : "49,539"}
                  </span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="pt-1">
                <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold mb-1">
                  <span>0%</span>
                  <span className="text-[#17170F]">₦0 saved</span>
                  <span>₦{amountNum.toLocaleString("en-NG")}</span>
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
                    Contributions are flexible. You're in control.
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
