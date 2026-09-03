"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/app/components/DashboardSidebar";
import { Avatar } from "@/app/components/Avatar";
import { CONTRIBUTIONS, GOALS, USERS_MAP, WITHDRAWAL_REQUESTS, WITHDRAWAL_VOTES } from "@/lib/mock-data";
import { formatNaira, formatDate } from "@/lib/utils";
import { ArrowUpRight, AlertTriangle, CheckCircle, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

// Unified activity event type
interface ActivityItem {
  id: string;
  type: "contribution" | "withdrawal_requested" | "vote" | "goal_created";
  title: string;
  subtitle: string;
  user: string;
  userColor?: string;
  amount?: number;
  date: string;
  badge: "brand" | "amber" | "coral" | "neutral";
}

export default function ActivityPage() {
  const [filter, setFilter] = useState<"all" | "contributions" | "governance">("all");
  const [search, setSearch] = useState("");

  // Build activity feed from mock data
  const activities: ActivityItem[] = [];

  // Contributions
  for (const c of CONTRIBUTIONS) {
    const goal = GOALS.find((g) => g.id === c.goalId);
    const user = c.contributorUserId ? USERS_MAP.get(c.contributorUserId) : null;
    activities.push({
      id: `c-${c.id}`,
      type: "contribution",
      title: `${c.contributorName} paid ${formatNaira(c.amount)}`,
      subtitle: `Goal: ${goal?.title ?? "Savings Goal"}`,
      user: c.contributorName,
      userColor: user?.avatarColor,
      amount: c.amount,
      date: c.receivedAt,
      badge: "brand",
    });
  }

  // Withdrawal Requests
  for (const req of WITHDRAWAL_REQUESTS) {
    const goal = GOALS.find((g) => g.id === req.goalId);
    const user = USERS_MAP.get(req.requestedBy);
    activities.push({
      id: `w-${req.id}`,
      type: "withdrawal_requested",
      title: `${user?.name ?? "Member"} requested emergency refund`,
      subtitle: `Goal: ${goal?.title ?? "Group Goal"} · Reason: "${req.reason ?? "Change of plan"}"`,
      user: user?.name ?? "Member",
      userColor: user?.avatarColor,
      date: req.createdAt,
      badge: "coral",
    });
  }

  // Votes
  for (const v of WITHDRAWAL_VOTES) {
    const user = USERS_MAP.get(v.voterId);
    activities.push({
      id: `v-${v.id}`,
      type: "vote",
      title: `${user?.name ?? "Member"} voted ${v.vote ? "APPROVE ✓" : "REJECT ✗"}`,
      subtitle: `Emergency withdrawal proposal vote`,
      user: user?.name ?? "Member",
      userColor: user?.avatarColor,
      date: v.votedAt,
      badge: v.vote ? "brand" : "coral",
    });
  }

  // Sort by date descending
  activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filtered = activities.filter((act) => {
    if (filter === "contributions" && act.type !== "contribution") return false;
    if (filter === "governance" && act.type === "contribution") return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        act.title.toLowerCase().includes(q) ||
        act.subtitle.toLowerCase().includes(q) ||
        act.user.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex min-h-screen bg-cream font-sans">
      <DashboardSidebar />

      <main className="flex-1 p-6 max-w-5xl">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Activity &amp; Audit Log</h1>
            <p className="text-sm text-muted">Complete transparent ledger of funds, votes, and events.</p>
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
              onClick={() => setFilter("governance")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                filter === "governance" ? "bg-ink text-cream" : "bg-surface border border-line text-muted hover:text-ink"
              )}
            >
              Governance &amp; Votes
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-faint" />
          <input
            type="text"
            placeholder="Search by name, goal, or event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>

        {/* Audit feed */}
        <div className="rounded-card border border-line bg-surface overflow-hidden">
          <ul className="divide-y divide-line">
            {filtered.map((item) => (
              <li key={item.id} className="p-4 hover:bg-surface-2 transition-colors flex items-start gap-4">
                <Avatar name={item.user} color={item.userColor} size="md" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-ink truncate">{item.title}</p>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0",
                      item.badge === "brand" ? "bg-brand-50 text-brand-700 border border-brand-200" :
                      item.badge === "coral" ? "bg-coral-50 text-coral-700 border border-coral-200" :
                      "bg-amber-50 text-amber-700 border border-amber-200"
                    )}>
                      {item.type.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">{item.subtitle}</p>
                  <p className="text-[11px] text-faint mt-1">{formatDate(item.date)}</p>
                </div>

                {item.amount && (
                  <p className="font-display font-bold text-sm text-ink tabular shrink-0">
                    +{formatNaira(item.amount)}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
