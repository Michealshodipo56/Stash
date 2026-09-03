"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/app/components/DashboardSidebar";
import { Avatar } from "@/app/components/Avatar";
import { CONTRIBUTIONS, GOALS, USERS_MAP } from "@/lib/mock-data";
import { formatNaira, formatDate } from "@/lib/utils";
import { CreditCard, CheckCircle2, ShieldCheck, Download } from "lucide-react";

export default function ContributionsPage() {
  const [selectedGoal, setSelectedGoal] = useState<string>("all");

  const filtered = CONTRIBUTIONS.filter(
    (c) => selectedGoal === "all" || c.goalId === selectedGoal
  );

  const totalFiltered = filtered.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="flex min-h-screen bg-cream font-sans">
      <DashboardSidebar />

      <main className="flex-1 p-6 max-w-5xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Contributions</h1>
            <p className="text-sm text-muted">All inbound virtual bank transfers across your goals.</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedGoal}
              onChange={(e) => setSelectedGoal(e.target.value)}
              className="rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              <option value="all">All Goals ({GOALS.length})</option>
              {GOALS.map((g) => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>

            <button
              onClick={() => alert("Downloading CSV statement...")}
              className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink hover:bg-surface-2 transition-colors"
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
          </div>
        </div>

        {/* Summary Card */}
        <div className="rounded-card border border-line bg-surface p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-brand-50 p-3 text-brand-600">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted">Filtered total</p>
              <p className="font-display font-bold text-2xl text-ink tabular">{formatNaira(totalFiltered)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted font-medium">{filtered.length} transfer(s)</p>
            <p className="text-xs text-brand-600 font-semibold flex items-center gap-1 mt-0.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Attributed via NGN Virtual Accounts
            </p>
          </div>
        </div>

        {/* Contributions table */}
        <div className="rounded-card border border-line bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-surface-2 text-xs font-semibold text-muted uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Contributor</th>
                  <th className="px-5 py-3">Goal</th>
                  <th className="px-5 py-3">Reference / BMONI Tx</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((c) => {
                  const goal = GOALS.find((g) => g.id === c.goalId);
                  const user = c.contributorUserId ? USERS_MAP.get(c.contributorUserId) : null;
                  return (
                    <tr key={c.id} className="hover:bg-surface-2/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={c.contributorName} color={user?.avatarColor} size="sm" />
                          <div>
                            <p className="font-semibold text-ink">{c.contributorName}</p>
                            {user && <span className="text-[10px] text-brand-600 font-medium">Member</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-medium text-ink">
                        {goal?.title ?? "Goal"}
                      </td>
                      <td className="px-5 py-4 text-xs font-mono text-faint">
                        {c.bmoniReference ?? `bm_tx_${c.id.slice(0, 6)}`}
                      </td>
                      <td className="px-5 py-4 text-xs text-muted">
                        {formatDate(c.receivedAt)}
                      </td>
                      <td className="px-5 py-4 text-right font-display font-bold text-ink tabular">
                        +{formatNaira(c.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
