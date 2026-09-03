"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/app/components/DashboardSidebar";
import { Avatar } from "@/app/components/Avatar";
import { PAYOUTS, GOALS, USERS_MAP } from "@/lib/mock-data";
import { formatNaira, formatDate } from "@/lib/utils";
import { Landmark, ArrowUpRight, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PayoutsPage() {
  const [tab, setTab] = useState<"all" | "completion" | "refunds">("all");

  const filtered = PAYOUTS.filter((p) => {
    if (tab === "completion") return p.type === "completion_payout";
    if (tab === "refunds") return p.type === "emergency_refund";
    return true;
  });

  const totalPaidOut = PAYOUTS.reduce((s, p) => s + p.amount, 0);

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
                tab === "all" ? "bg-ink text-cream" : "bg-surface border border-line text-muted"
              )}
            >
              All Payouts
            </button>
            <button
              onClick={() => setTab("completion")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                tab === "completion" ? "bg-ink text-cream" : "bg-surface border border-line text-muted"
              )}
            >
              Target Payouts
            </button>
            <button
              onClick={() => setTab("refunds")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                tab === "refunds" ? "bg-ink text-cream" : "bg-surface border border-line text-muted"
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
            <p className="font-display font-bold text-2xl text-ink tabular mt-1">
              {PAYOUTS.filter((p) => p.bmoniStatus === "completed").length}
            </p>
          </div>

          <div className="rounded-card border border-line bg-surface p-5">
            <div className="rounded-xl bg-coral-50 p-2.5 text-coral-600 w-fit mb-3">
              <Clock className="h-5 w-5" />
            </div>
            <p className="text-xs text-muted font-medium">Pending Approvals</p>
            <p className="font-display font-bold text-2xl text-ink tabular mt-1">
              {PAYOUTS.filter((p) => p.bmoniStatus === "pending").length}
            </p>
          </div>
        </div>

        {/* Payouts list */}
        <div className="rounded-card border border-line bg-surface overflow-hidden">
          <div className="p-4 border-b border-line bg-surface-2 flex items-center justify-between">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Disbursement Record</p>
            <span className="text-xs text-brand-600 font-medium">BMONI Instant NGN Rail</span>
          </div>

          <ul className="divide-y divide-line">
            {filtered.map((p) => {
              const goal = GOALS.find((g) => g.id === p.goalId);
              const recipient = USERS_MAP.get(p.recipientUserId);
              const isRefund = p.type === "emergency_refund";
              return (
                <li key={p.id} className="p-4 hover:bg-surface-2/50 transition-colors flex items-center gap-4">
                  <Avatar name={recipient?.name ?? "Recipient"} color={recipient?.avatarColor} size="md" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-ink text-sm truncate">{recipient?.name}</p>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0",
                        isRefund ? "bg-coral-50 text-coral-600 border border-coral-200" : "bg-brand-50 text-brand-700 border border-brand-200"
                      )}>
                        {isRefund ? "Proportional Refund" : "Goal Target Payout"}
                      </span>
                    </div>

                    <p className="text-xs text-muted mt-0.5 truncate">
                      Goal: <strong>{goal?.title}</strong> · Destination: {recipient?.bankName ?? "GTBank"} ({recipient?.bankAccountNumber ?? "0123456789"})
                    </p>

                    <p className="text-[11px] text-faint mt-1">
                      {formatDate(p.createdAt)} · Proposal ID: <span className="font-mono">{p.bmoniProposalId}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-display font-bold text-base text-ink tabular">
                      {formatNaira(p.amount)}
                    </p>
                    <span className={cn(
                      "text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full inline-block mt-1",
                      p.bmoniStatus === "completed" ? "bg-brand-100 text-brand-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {p.bmoniStatus ?? "completed"}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </main>
    </div>
  );
}
