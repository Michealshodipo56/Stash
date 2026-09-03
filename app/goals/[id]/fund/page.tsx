"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Check,
  Building2,
  Users,
  ShieldCheck,
  Zap,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/app/components/Logo";
import { formatNaira } from "@/lib/utils";
import type { Goal } from "@/lib/types";
import { ProgressBar } from "@/app/components/ProgressBar";

interface GoalWithFunding extends Goal {
  currentAmount: number;
  virtualAccount: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}

export default function PublicFundGoalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [goal, setGoal] = useState<GoalWithFunding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);
  const [contributorName, setContributorName] = useState("");
  const [amount, setAmount] = useState("5000");
  const [simulating, setSimulating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function loadGoal() {
    try {
      const res = await fetch(`/api/goals/${id}`);
      if (!res.ok) {
        throw new Error("Goal not found");
      }
      const data = await res.json();
      setGoal(data.goal);
    } catch (err: any) {
      setError(err.message || "Failed to load goal");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGoal();
  }, [id]);

  function copyAccountNumber(accountNo: string) {
    navigator.clipboard.writeText(accountNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSimulateTransfer(e: React.FormEvent) {
    e.preventDefault();
    if (!goal || !amount) return;

    setSimulating(true);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalId: goal.id,
          amount: parseFloat(amount),
          contributorName: contributorName.trim() || "Anonymous Contributor",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Contribution failed");
      }

      await res.json();
      setSuccessMessage(
        `🎉 Successfully sent ${formatNaira(parseFloat(amount))}! The goal balance has updated.`
      );
      // Reload updated goal balance
      await loadGoal();
    } catch (err: any) {
      alert(err.message || "Failed to process transfer simulation");
    } finally {
      setSimulating(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-muted">Loading goal details...</p>
        </div>
      </div>
    );
  }

  if (error || !goal) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4">
        <div className="bg-surface rounded-2xl border border-line p-8 max-w-md text-center space-y-4">
          <div className="text-3xl">🔍</div>
          <h2 className="text-xl font-bold text-ink">Goal Not Found</h2>
          <p className="text-sm text-muted">
            The savings goal you are trying to fund does not exist or has been closed.
          </p>
          <Link
            href="/"
            className="inline-block rounded-full bg-ink text-cream px-6 py-2.5 text-sm font-semibold hover:bg-ink-hover transition-colors"
          >
            Back to Aidex Home
          </Link>
        </div>
      </div>
    );
  }

  const progress = Math.min(
    100,
    Math.round((goal.currentAmount / goal.targetAmount) * 100)
  );

  return (
    <div className="min-h-screen bg-cream selection:bg-brand-200">
      {/* Public Header */}
      <header className="sticky top-0 z-30 bg-cream/90 backdrop-blur-md border-b border-line">
        <div className="mx-auto max-w-2xl px-4 py-3.5 flex items-center justify-between">
          <Link href="/" className="shrink-0">
            <Logo className="text-xl" />
          </Link>
          <div className="flex items-center gap-3 text-xs">
            <span className="hidden sm:inline text-muted font-medium">Public Contribution Portal</span>
            <Link
              href="/signup"
              className="rounded-full bg-ink text-cream px-4 py-1.5 font-semibold hover:bg-ink-hover transition-colors"
            >
              Start a Goal
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        {/* Goal Hero Overview */}
        <div className="rounded-card border border-line bg-surface p-6 space-y-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 border border-brand-200 mb-2">
                <Sparkles className="w-3 h-3 text-brand-600" />
                {goal.type === "group" ? "Group Goal" : "Individual Goal"}
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">
                Fund &ldquo;{goal.title}&rdquo;
              </h1>
              <p className="text-xs text-muted mt-1">
                Created on Aidex for saving toward {goal.title}.
              </p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-surface-2 flex items-center justify-center text-3xl border border-line shrink-0">
              {goal.emoji || "🎯"}
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-2 pt-2">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-display font-extrabold text-xl text-ink">
                {formatNaira(goal.currentAmount)}
              </span>
              <span className="text-xs text-muted">
                target: <strong className="text-ink">{formatNaira(goal.targetAmount)}</strong>
              </span>
            </div>
            <ProgressBar value={progress} color="brand" className="h-2.5 rounded-full" />
            <div className="flex justify-between text-[11px] text-faint">
              <span>{progress}% funded</span>
              <span>Deadline: {new Date(goal.deadline).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
          </div>
        </div>

        {/* Bank Account Transfer Card */}
        <div className="rounded-card border-2 border-brand-300 bg-brand-50/40 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-brand-600" />
            <h2 className="font-display text-lg font-bold text-ink">
              Direct Bank Transfer (No Login Required)
            </h2>
          </div>
          <p className="text-xs text-muted">
            Send money from any Nigerian bank app (GTBank, Kuda, Access, OPay, Zenith, PalmPay, etc.). Funds instantly credit this goal.
          </p>

          <div className="rounded-xl border border-line bg-surface p-4 space-y-3 font-mono text-sm">
            <div className="flex items-center justify-between border-b border-line pb-2.5">
              <span className="text-xs text-muted font-sans font-medium">Bank Name:</span>
              <span className="font-bold text-ink">{goal.virtualAccount.bankName}</span>
            </div>

            <div className="flex items-center justify-between border-b border-line pb-2.5">
              <span className="text-xs text-muted font-sans font-medium">Account Number:</span>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-ink tracking-wider">
                  {goal.virtualAccount.accountNumber}
                </span>
                <button
                  type="button"
                  onClick={() => copyAccountNumber(goal.virtualAccount.accountNumber)}
                  className="flex items-center gap-1 rounded-md bg-brand-100 px-2 py-1 text-xs font-sans font-semibold text-brand-700 hover:bg-brand-200 transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-brand-700" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted font-sans font-medium">Account Name:</span>
              <span className="font-semibold text-ink text-right text-xs truncate max-w-[200px]">
                {goal.virtualAccount.accountName}
              </span>
            </div>
          </div>
        </div>

        {/* Instant Interactive Transfer Simulator */}
        <div className="rounded-card border border-line bg-surface p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-brand-500 fill-brand-400" />
            <h2 className="font-display text-base font-bold text-ink">
              Simulate Direct Inbound Payment
            </h2>
          </div>
          <p className="text-xs text-muted">
            Test contributing to this goal right now without opening a separate banking app:
          </p>

          {successMessage && (
            <div className="rounded-xl bg-brand-100 border border-brand-300 p-3 text-xs font-semibold text-ink">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSimulateTransfer} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Your Name / Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Auntie Chioma, Bayo (Class Rep)"
                value={contributorName}
                onChange={(e) => setContributorName(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Contribution Amount (₦)
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {["1000", "5000", "10000", "25000"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      amount === preset
                        ? "bg-brand-500 text-ink border-brand-500"
                        : "bg-surface-2 border-line text-muted hover:text-ink"
                    }`}
                  >
                    ₦{parseInt(preset).toLocaleString()}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="100"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>

            <button
              type="submit"
              disabled={simulating || !amount || parseFloat(amount) <= 0}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-ink text-cream py-3 text-sm font-bold hover:bg-ink-hover disabled:opacity-40 transition-colors shadow-sm"
            >
              {simulating ? "Processing Instant Deposit..." : `Send ${formatNaira(parseFloat(amount) || 0)} Now`}
            </button>
          </form>
        </div>

        {/* Security / Settlement Guarantee */}
        <div className="rounded-xl border border-line bg-surface-2 p-4 flex items-start gap-3 text-xs text-muted">
          <ShieldCheck className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-ink">Settlement Layer: BMONI Embedded</p>
            <p className="text-[11px] text-faint mt-0.5">
              Funds deposited into this dedicated virtual account are locked on-chain and can only be released upon reaching target or through verified proportional refunds.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
