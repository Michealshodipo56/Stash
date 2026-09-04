"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell, MobileNavButton } from "@/app/components/DashboardSidebar";
import { Avatar } from "@/app/components/Avatar";
import { useAuth } from "@/app/context/AuthContext";
import { formatNaira, formatDate } from "@/lib/utils";
import { ArrowUpRight, Search, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  kind: "contribution" | "payout" | "withdrawal";
  actorName: string;
  actorUserId?: string;
  goalId: string;
  goalTitle: string;
  amount: number;
  at: string;
  note?: string;
}

export default function ActivityPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "contributions" | "payouts">("all");
  const [search, setSearch] = useState("");
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function loadActivity() {
      try {
        const res = await fetch(`/api/goals?userId=${encodeURIComponent(user!.id)}`);
        const data = await res.json();
        if (data.success) {
          setActivities(data.activity || []);
        }
      } catch (err) {
        console.error("Failed to load activity:", err);
      } finally {
        setLoading(false);
      }
    }
    loadActivity();
  }, [user]);

  const filtered = activities.filter((act) => {
    if (filter === "contributions" && act.kind !== "contribution") return false;
    if (filter === "payouts" && act.kind !== "payout") return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        act.actorName.toLowerCase().includes(q) ||
        act.goalTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AppShell>
      <main className="flex-1 p-6 max-w-5xl">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <MobileNavButton className="mt-0.5" />
            <div>
              <h1 className="font-display text-2xl font-bold text-ink">Activity &amp; Audit Log</h1>
              <p className="text-sm text-muted">Complete transparent ledger of funds, votes, and events.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                filter === "all" ? "bg-ink text-cream" : "bg-surface border border-line text-muted hover:text-ink"
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilter("contributions")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                filter === "contributions" ? "bg-ink text-cream" : "bg-surface border border-line text-muted hover:text-ink"
              )}
            >
              Contributions
            </button>
            <button
              onClick={() => setFilter("payouts")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                filter === "payouts" ? "bg-ink text-cream" : "bg-surface border border-line text-muted hover:text-ink"
              )}
            >
              Payouts &amp; Refunds
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-faint" />
          <input
            type="text"
            placeholder="Search by name or goal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>

        {/* Audit feed or empty state */}
        {filtered.length === 0 ? (
          <div className="rounded-card border-2 border-dashed border-line bg-surface/70 p-8 sm:p-12 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-2xl mb-3 shadow-sm">
              📋
            </div>
            <h3 className="font-display text-lg font-bold text-ink">No activity recorded yet</h3>
            <p className="mt-1 text-sm text-muted max-w-sm mx-auto leading-relaxed">
              When contributions or payouts happen on your goals, every transaction will be logged here with complete transparency.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Link
                href="/goals/new"
                className="flex items-center gap-2 rounded-full bg-ink text-cream px-5 py-2.5 text-xs font-semibold hover:bg-ink-hover transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Start a Goal
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-card border border-line bg-surface overflow-hidden">
            <ul className="divide-y divide-line">
              {filtered.map((item) => (
                <li key={item.id} className="p-4 hover:bg-surface-2 transition-colors flex items-start gap-4">
                  <Avatar name={item.actorName} color="#8cc63f" size="md" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-ink truncate">
                        {item.actorName}{" "}
                        <span className="font-normal text-muted">
                          {item.kind === "contribution" ? "contributed" : item.kind === "payout" ? "received payout" : "requested withdrawal"}
                        </span>
                      </p>
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0",
                          item.kind === "contribution"
                            ? "bg-brand-50 text-brand-700 border border-brand-200"
                            : item.kind === "payout"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-coral-50 text-coral-700 border border-coral-200"
                        )}
                      >
                        {item.kind}
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-0.5">Goal: <strong>{item.goalTitle}</strong></p>
                    <p className="text-[11px] text-faint mt-1">{formatDate(item.at)}</p>
                  </div>

                  {item.amount && (
                    <p className="font-display font-bold text-sm text-ink tabular shrink-0">
                      {item.kind === "contribution" ? "+" : "-"}{formatNaira(item.amount)}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </AppShell>
  );
}
