"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardSidebar } from "@/app/components/DashboardSidebar";
import { Avatar } from "@/app/components/Avatar";
import { useAuth } from "@/app/context/AuthContext";
import { formatNaira, formatDate } from "@/lib/utils";
import { Landmark, CheckCircle2, Clock, Plus, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PayoutItem {
  id: string;
  goalId: string;
  goalTitle: string;
  recipientUserId: string;
  recipientName: string;
  bankName: string;
  bankAccountNumber: string;
  amount: number;
  type: "completion_payout" | "emergency_refund";
  bmoniProposalId?: string;
  bmoniStatus?: string;
  createdAt: string;
}

export default function PayoutsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"all" | "completion" | "refunds">("all");
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function loadPayouts() {
      try {
        const res = await fetch(`/api/payouts?userId=${encodeURIComponent(user!.id)}`);
        const data = await res.json();
        if (data.success) {
          setPayouts(data.payouts || []);
        }
      } catch (err) {
        console.error("Failed to load payouts:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPayouts();
  }, [user]);

  const filtered = payouts.filter((p) => {
    if (tab === "completion") return p.type === "completion_payout";
    if (tab === "refunds") return p.type === "emergency_refund";
    return true;
  });

  const totalPaidOut = payouts.reduce((s, p) => s + p.amount, 0);
  const completedCount = payouts.filter((p) => p.bmoniStatus === "completed" || !p.bmoniStatus).length;
  const pendingCount = payouts.filter((p) => p.bmoniStatus === "pending").length;

  return (
    <div className="flex min-h-screen bg-cream font-sans">
      <DashboardSidebar />

      <main className="flex-1 p-6 max-w-5xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Payouts &amp; Offramps</h1>
            <p className="text-sm text-muted">History of funds disbursed to Nigerian bank accounts via BMONI rails.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab("all")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                tab === "all" ? "bg-ink text-cream" : "bg-surface border border-line text-muted hover:text-ink"
              )}
            >
              All Payouts
            </button>
            <button
              onClick={() => setTab("completion")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                tab === "completion" ? "bg-ink text-cream" : "bg-surface border border-line text-muted hover:text-ink"
              )}
            >
              Target Payouts
            </button>
            <button
              onClick={() => setTab("refunds")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                tab === "refunds" ? "bg-ink text-cream" : "bg-surface border border-line text-muted hover:text-ink"
              )}
            >
              Emergency Refunds
            </button>
          </div>
        </div>

        {/* Stats card */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-card border border-line bg-surface p-5">
            <div className="rounded-xl bg-brand-50 p-2.5 text-brand-600 w-fit mb-3">
              <Landmark className="h-5 w-5" />
            </div>
            <p className="text-xs text-muted font-medium">Total Payouts Settled</p>
            <p className="font-display font-bold text-2xl text-ink tabular mt-1">{formatNaira(totalPaidOut)}</p>
          </div>

          <div className="rounded-card border border-line bg-surface p-5">
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 w-fit mb-3">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <p className="text-xs text-muted font-medium">Completed Offramps</p>
            <p className="font-display font-bold text-2xl text-ink tabular mt-1">{completedCount}</p>
          </div>

          <div className="rounded-card border border-line bg-surface p-5">
            <div className="rounded-xl bg-coral-50 p-2.5 text-coral-600 w-fit mb-3">
              <Clock className="h-5 w-5" />
            </div>
            <p className="text-xs text-muted font-medium">Pending Approvals</p>
            <p className="font-display font-bold text-2xl text-ink tabular mt-1">{pendingCount}</p>
          </div>
        </div>

        {/* Payouts list or empty state */}
        {filtered.length === 0 ? (
          <div className="rounded-card border-2 border-dashed border-line bg-surface/70 p-8 sm:p-12 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl mb-3 shadow-sm">
              🏦
            </div>
            <h3 className="font-display text-lg font-bold text-ink">No payouts or offramps yet</h3>
            <p className="mt-1 text-sm text-muted max-w-md mx-auto leading-relaxed">
              When a goal reaches 100% of its target or an approved emergency refund executes, BMONI will
              automatically disburse the funds directly to your verified Nigerian bank account.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-full bg-ink text-cream px-5 py-2.5 text-xs font-semibold hover:bg-ink-hover transition-colors"
              >
                Go to Dashboard <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-card border border-line bg-surface overflow-hidden">
            <div className="p-4 border-b border-line bg-surface-2 flex items-center justify-between">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Disbursement Record</p>
              <span className="text-xs text-brand-600 font-medium">BMONI Instant NGN Rail</span>
            </div>

            <ul className="divide-y divide-line">
              {filtered.map((p) => {
                const isRefund = p.type === "emergency_refund";
                return (
                  <li key={p.id} className="p-4 hover:bg-surface-2/50 transition-colors flex items-center gap-4">
                    <Avatar name={p.recipientName} color="#8cc63f" size="md" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-ink text-sm truncate">{p.recipientName}</p>
                        <span
                          className={cn(
                            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0",
                            isRefund
                              ? "bg-coral-50 text-coral-600 border border-coral-200"
                              : "bg-brand-50 text-brand-700 border border-brand-200"
                          )}
                        >
                          {isRefund ? "Proportional Refund" : "Goal Target Payout"}
                        </span>
                      </div>

                      <p className="text-xs text-muted mt-0.5 truncate">
                        Goal: <strong>{p.goalTitle}</strong> · Destination: {p.bankName} ({p.bankAccountNumber})
                      </p>

                      <p className="text-[11px] text-faint mt-1">
                        {formatDate(p.createdAt)} · Proposal ID:{" "}
                        <span className="font-mono">{p.bmoniProposalId || "BM_PROP_AUTOPAY"}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-display font-bold text-base text-ink tabular">{formatNaira(p.amount)}</p>
                      <span
                        className={cn(
                          "text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full inline-block mt-1",
                          p.bmoniStatus === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-brand-100 text-brand-700"
                        )}
                      >
                        {p.bmoniStatus ?? "completed"}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
