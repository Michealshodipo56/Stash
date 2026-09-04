"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell, MobileNavButton } from "@/app/components/DashboardSidebar";
import { Avatar } from "@/app/components/Avatar";
import { useAuth } from "@/app/context/AuthContext";
import { formatNaira, formatDate } from "@/lib/utils";
import { CreditCard, ShieldCheck, Download, Plus, ArrowRight } from "lucide-react";
import type { Goal } from "@/lib/types";

interface ContributionItem {
  id: string;
  goalId: string;
  goalTitle: string;
  contributorName: string;
  contributorUserId?: string;
  amount: number;
  bmoniReference: string;
  receivedAt: string;
}

export default function ContributionsPage() {
  const { user } = useAuth();
  const [selectedGoal, setSelectedGoal] = useState<string>("all");
  const [contributions, setContributions] = useState<ContributionItem[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function loadContributions() {
      try {
        const res = await fetch(`/api/contributions?userId=${encodeURIComponent(user!.id)}`);
        const data = await res.json();
        if (data.success) {
          setContributions(data.contributions || []);
          setGoals(data.goals || []);
        }
      } catch (err) {
        console.error("Failed to load contributions:", err);
      } finally {
        setLoading(false);
      }
    }
    loadContributions();
  }, [user]);

  const filtered = contributions.filter(
    (c) => selectedGoal === "all" || c.goalId === selectedGoal
  );

  const totalFiltered = filtered.reduce((s, c) => s + c.amount, 0);

  function exportCSV() {
    if (filtered.length === 0) return;
    const headers = ["Contributor", "Goal", "Reference", "Date", "Amount"];
    const rows = filtered.map((c) => [
      `"${c.contributorName}"`,
      `"${c.goalTitle}"`,
      `"${c.bmoniReference}"`,
      `"${c.receivedAt}"`,
      c.amount,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `aidex_contributions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <AppShell>
      <main className="flex-1 p-6 max-w-5xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <MobileNavButton className="mt-0.5" />
            <div>
              <h1 className="font-display text-2xl font-bold text-ink">Contributions</h1>
              <p className="text-sm text-muted">All inbound virtual bank transfers across your goals.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedGoal}
              onChange={(e) => setSelectedGoal(e.target.value)}
              className="rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              <option value="all">All Goals ({goals.length})</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>

            <button
              onClick={exportCSV}
              disabled={filtered.length === 0}
              className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink hover:bg-surface-2 disabled:opacity-40 transition-colors"
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

        {/* Contributions table or empty state */}
        {filtered.length === 0 ? (
          <div className="rounded-card border-2 border-dashed border-line bg-surface/70 p-8 sm:p-12 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-2xl mb-3 shadow-sm">
              💳
            </div>
            <h3 className="font-display text-lg font-bold text-ink">No contributions recorded yet</h3>
            <p className="mt-1 text-sm text-muted max-w-sm mx-auto leading-relaxed">
              When you deposit money into your goal or friends fund via your link, transactions will appear here instantly.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Link
                href="/goals/new"
                className="flex items-center gap-2 rounded-full bg-ink text-cream px-5 py-2.5 text-xs font-semibold hover:bg-ink-hover transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Create a Goal
              </Link>
            </div>
          </div>
        ) : (
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
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-surface-2/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={c.contributorName} color="#8cc63f" size="sm" />
                          <div>
                            <p className="font-semibold text-ink">{c.contributorName}</p>
                            {c.contributorUserId && (
                              <span className="text-[10px] text-brand-600 font-medium">Member</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-medium text-ink">
                        <Link href={`/goals/${c.goalId}`} className="hover:underline flex items-center gap-1">
                          {c.goalTitle}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-xs font-mono text-faint">
                        {c.bmoniReference ?? `TRX${c.id.slice(0, 8)}`}
                      </td>
                      <td className="px-5 py-4 text-xs text-muted">
                        {formatDate(c.receivedAt)}
                      </td>
                      <td className="px-5 py-4 text-right font-display font-bold text-ink tabular">
                        +{formatNaira(c.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </AppShell>
  );
}
