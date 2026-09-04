"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import {
  CreditCard, TrendingUp, Users, Landmark, Bell, Plus, ArrowRight,
  ArrowUpRight, Flame, Loader2,
} from "lucide-react";
import { ProgressBar } from "@/app/components/ProgressBar";
import { Avatar } from "@/app/components/Avatar";
import { AppShell, MobileNavButton } from "@/app/components/DashboardSidebar";
import {
  listGoalsForUser, dashboardSummary, goalSaved,
  activeWithdrawal, recentActivity, getStreak, usersMap,
} from "@/lib/store";
import { formatNaira, pct, daysLeft, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Goal } from "@/lib/types";
import { useAuth } from "@/app/context/AuthContext";

function getGoalTag(goal: Goal) {
  const pending = activeWithdrawal(goal.id);
  if (pending) return { label: "GROUP ACTION", color: "coral" };
  if (goal.type === "group") return { label: "GROUP GOAL", color: "amber" };
  return { label: "SOLO GOAL", color: "brand" };
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [dashboardData, setDashboardData] = useState<{
    goals: Goal[];
    summary: {
      totalSaved: number;
      goalCount: number;
      thisMonth: number;
      thisMonthDeltaPct: number;
      groupContributions: number;
      groupContributors: number;
      payoutsReceived: number;
    };
    activity: any[];
    streak: { days: number; week: boolean[] };
  } | null>(null);
  const [contributionNoticeCount, setContributionNoticeCount] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/dashboard");
      return;
    }
    if (!user) return;

    async function loadData() {
      try {
        const [goalsRes, contribRes] = await Promise.all([
          fetch(`/api/goals?userId=${encodeURIComponent(user!.id)}`),
          fetch(`/api/contributions?userId=${encodeURIComponent(user!.id)}`),
        ]);
        const json = await goalsRes.json();
        if (json.success) {
          setDashboardData(json);
        }
        const contribJson = await contribRes.json();
        if (contribJson.success) {
          setContributionNoticeCount((contribJson.contributions || []).length);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setDataLoading(false);
      }
    }
    loadData();
  }, [user, authLoading, router]);

  const userId = user?.id || "";
  const goals = dashboardData ? dashboardData.goals : (userId ? listGoalsForUser(userId) : []);
  const summary = dashboardData ? dashboardData.summary : (userId ? dashboardSummary(userId) : {
    totalSaved: 0,
    goalCount: 0,
    thisMonth: 0,
    thisMonthDeltaPct: 0,
    groupContributions: 0,
    groupContributors: 0,
    payoutsReceived: 0,
  });
  const activity = dashboardData ? dashboardData.activity : (userId ? recentActivity(userId, 5) : []);
  const streak = dashboardData ? dashboardData.streak : (userId ? getStreak(userId) : { days: 0, week: [false, false, false, false, false, false, false] });

  const STATS = [
    { icon: <CreditCard className="h-5 w-5 text-brand-500" />, bg: "bg-brand-50", label: "Total saved", value: formatNaira(summary.totalSaved), sub: `Across ${summary.goalCount} goals` },
    { icon: <TrendingUp className="h-5 w-5 text-amber-500" />, bg: "bg-amber-100", label: "This month", value: formatNaira(summary.thisMonth), sub: summary.thisMonth > 0 ? "Saved this month" : "No deposits this month" },
    { icon: <Users className="h-5 w-5 text-indigo-500" />, bg: "bg-indigo-100", label: "Group contributions", value: formatNaira(summary.groupContributions), sub: `From ${summary.groupContributors} contributors` },
    { icon: <Landmark className="h-5 w-5 text-faint" />, bg: "bg-surface-2", label: "Payouts received", value: formatNaira(summary.payoutsReceived), sub: "Offramped to bank" },
  ];

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin mx-auto" />
          <p className="text-sm font-medium text-muted">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      {/* ── Main content ─────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-cream/90 backdrop-blur-md border-b border-line px-4 sm:px-6 py-3 flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <MobileNavButton className="mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm text-muted">Welcome back, {user.name} 👋</p>
              <h1 className="font-display text-2xl font-bold text-ink leading-tight">
                Here&apos;s your progress
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  style={{ transformOrigin: "left" }}
                  className="block h-0.5 bg-brand-400 mt-1 rounded-full w-32"
                />
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/contributions"
              id="notification-btn"
              aria-label={
                contributionNoticeCount > 0
                  ? `${contributionNoticeCount} contribution notifications`
                  : "View contributions"
              }
              className="relative rounded-full border border-line bg-surface p-2.5 hover:bg-surface-2 transition-colors"
            >
              <Bell className="h-4 w-4 text-muted" />
              {contributionNoticeCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-coral-400 text-white text-[9px] font-bold flex items-center justify-center">
                  {contributionNoticeCount > 9 ? "9+" : contributionNoticeCount}
                </span>
              )}
            </Link>
            <Link
              href="/goals/new"
              id="dashboard-new-goal-btn"
              className="flex items-center gap-1.5 rounded-full bg-ink text-cream px-4 py-2.5 text-sm font-semibold hover:bg-ink-hover transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Start a goal
            </Link>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {/* KYC Alert if not verified */}
          {!user.isKycVerified && (
            <div className="rounded-2xl border-2 border-brand-300 bg-brand-50/80 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-ink">Action Required: Complete Tier-1 KYC</p>
                <p className="text-[11px] text-muted">Link your BVN/NIN and payout bank account to enable goal creation and automated settlements.</p>
              </div>
              <Link
                href="/onboarding"
                className="rounded-full bg-ink text-cream px-4 py-2 text-xs font-semibold hover:bg-ink-hover shrink-0 transition-colors"
              >
                Complete Verification 🚀
              </Link>
            </div>
          )}

          {/* Stats grid */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3"
          >
            {STATS.map(({ icon, bg, label, value, sub }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="rounded-xl border border-line bg-surface p-4"
              >
                <div className={cn("inline-flex rounded-xl p-2 mb-3", bg)}>{icon}</div>
                <p className="text-xs text-muted font-medium">{label}</p>
                <p className="font-display font-bold text-xl text-ink tabular mt-0.5">{value}</p>
                <p className="text-xs text-faint mt-0.5">{sub}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Goals */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-ink text-lg">Your goals ({goals.length})</h2>
              <Link href="/goals/new" className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                <Plus className="h-3.5 w-3.5" /> Start new goal
              </Link>
            </div>

            {goals.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-line bg-surface/70 p-8 sm:p-12 text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-3xl mb-4 shadow-sm">
                  🎯
                </div>
                <h3 className="font-display text-xl font-bold text-ink">No savings goals created yet</h3>
                <p className="mt-2 text-sm text-muted max-w-md mx-auto leading-relaxed">
                  Start your first individual or group goal to begin saving toward what matters.
                  We&apos;ll generate a dedicated Providus NGN Virtual Account with automated settlement rails.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/goals/new"
                    className="flex items-center gap-2 rounded-full bg-ink text-cream px-6 py-3 text-sm font-semibold hover:bg-ink-hover transition-colors shadow-sm"
                  >
                    <Plus className="h-4 w-4" /> Start Your First Goal
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {goals.map((goal: Goal, i: number) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.1 + i * 0.08 }}
                  >
                    <GoalCard goal={goal} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom row */}
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* Recent activity */}
            <div className="xl:col-span-1 rounded-xl border border-line bg-surface p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-ink">Recent activity</h3>
                <Link href="/activity" className="flex items-center gap-1 text-xs font-medium text-brand-600">
                  See all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              {activity.length === 0 ? (
                <div className="py-8 text-center text-muted">
                  <p className="text-xs font-medium">No recent activity yet</p>
                  <p className="text-[11px] text-faint mt-1">Deposits, votes, and payouts will appear here in real-time.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {activity.map((item: any) => (
                    <li key={item.id} className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                        item.kind === "contribution" ? "bg-brand-100 text-brand-600" :
                        item.kind === "payout" ? "bg-amber-100 text-amber-500" :
                        "bg-coral-100 text-coral-500"
                      )}>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-ink truncate">
                          {item.actorName} <span className="font-normal text-muted">{item.kind}</span>
                        </p>
                        <p className="text-[11px] text-faint truncate">{item.goalTitle}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold tabular text-ink">
                          {item.kind === "contribution" ? "+" : "-"}{formatNaira(item.amount)}
                        </p>
                        <p className="text-[11px] text-faint">{formatDate(item.at)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* On track */}
            <div className="rounded-xl border border-line bg-surface p-5 flex flex-col justify-between">
              <h3 className="font-display font-semibold text-ink mb-4">Stay on track</h3>
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="30" fill="none" stroke="#e9e8e0" strokeWidth="8" />
                    <motion.circle
                      cx="40" cy="40" r="30" fill="none"
                      stroke="#8cc63f" strokeWidth="8"
                      strokeDasharray="188.5"
                      initial={{ strokeDashoffset: 188.5 }}
                      animate={{ strokeDashoffset: goals.length > 0 ? 188.5 * (1 - 0.75) : 188.5 }}
                      transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="font-display font-bold text-xl text-ink leading-none">{goals.length}</p>
                      <p className="text-[10px] text-faint">active</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{goals.length} active goals</p>
                  <p className="text-xs text-muted mt-1">
                    {goals.length > 0 ? "You're building momentum! 💚" : "Start a goal to begin saving."}
                  </p>
                  <Link href={goals.length > 0 ? "/contributions" : "/goals/new"} className="mt-3 inline-block text-xs font-semibold text-brand-600 border border-brand-200 rounded-lg px-3 py-1.5 hover:bg-brand-50 transition-colors">
                    {goals.length > 0 ? "View Contributions" : "Create a Goal"}
                  </Link>
                </div>
              </div>
            </div>

            {/* Savings streak */}
            <div className="rounded-xl border border-line bg-surface p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-ink">Savings streak</h3>
                <Flame className="h-5 w-5 text-coral-400" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-full bg-coral-100 p-2">
                  <Flame className="h-6 w-6 text-coral-400" />
                </div>
                <div>
                  <p className="font-display font-bold text-2xl text-ink">{streak.days} days</p>
                  <p className="text-xs text-muted">Keep it up! Consistency is the secret.</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {["M","T","W","T","F","S","S"].map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-[10px] transition-colors",
                      streak.week[i] ? "bg-brand-500 text-ink font-bold" : "bg-line-soft text-faint"
                    )}>
                      {streak.week[i] ? "✓" : ""}
                    </div>
                    <span className="text-[10px] text-faint">{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dark CTA banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl bg-ink text-cream p-6 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">🎯</div>
              <div>
                <p className="font-display font-bold text-lg">Big goals. Small steps.</p>
                <p className="text-cream/50 text-sm">We&apos;re building things <span className="text-brand-400 italic font-semibold">worth it.</span></p>
              </div>
            </div>
            <Link
              href="/goals/new"
              id="dashboard-cta-btn"
              className="flex items-center gap-2 rounded-full bg-brand-500 text-ink px-5 py-2.5 text-sm font-bold hover:bg-brand-400 transition-colors shrink-0"
            >
              Start a new goal <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </main>
      </div>
    </AppShell>
  );
}

/* ── Goal card ─────────────────────────────────────────────── */
function GoalCard({ goal }: { goal: Goal }) {
  const saved = goalSaved(goal.id);
  const progress = pct(saved, goal.targetAmount);
  const days = daysLeft(goal.deadline);
  const { label: tagLabel, color: tagColor } = getGoalTag(goal);
  const pending = activeWithdrawal(goal.id);

  return (
    <Link
      href={`/goals/${goal.id}`}
      id={`dashboard-goal-${goal.id}`}
      className="group block rounded-xl border border-line bg-surface p-4 hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 h-full"
    >
      {/* Tag + menu */}
      <div className="flex items-center justify-between mb-3">
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
          tagColor === "brand" ? "bg-brand-50 text-brand-600" :
          tagColor === "amber" ? "bg-amber-100 text-amber-600" :
          "bg-coral-100 text-coral-600"
        )}>
          {tagLabel}
        </span>
        <span className="text-muted text-base leading-none">···</span>
      </div>

      {/* Title */}
      <h3 className="font-display font-bold text-ink text-base leading-snug mb-3 flex items-center gap-2">
        <span>{goal.emoji ?? "🎯"}</span>
        <span className="truncate">{goal.title}</span>
      </h3>

      {/* Amount */}
      <p className="text-xs text-muted mb-1 tabular">
        <span className="text-ink font-semibold">{formatNaira(saved)}</span> / {formatNaira(goal.targetAmount)}
      </p>

      {/* Progress */}
      <ProgressBar
        value={progress}
        color={tagColor === "coral" ? "coral" : tagColor === "amber" ? "amber" : "brand"}
        className="mb-1"
      />
      <p className="text-[11px] text-faint text-right mb-3">{progress}%</p>

      {/* Meta */}
      {goal.type === "group" && !pending ? (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">
            {formatNaira(goal.installmentAmount)} / {goal.frequency}
          </span>
          <span className="text-xs text-faint">{days} days left</span>
        </div>
      ) : pending ? (
        <div className="flex items-center justify-between">
          <span className="text-xs text-coral-600 font-semibold">Vote Pending</span>
          <span className="text-xs text-coral-500 font-semibold flex items-center gap-1">
            Review &amp; vote <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-between text-xs text-muted">
          <span className="tabular font-medium">{formatNaira(goal.installmentAmount)}/{goal.frequency === "daily" ? "day" : goal.frequency === "weekly" ? "wk" : "mo"}</span>
          <span>{days} days left</span>
        </div>
      )}

      {/* View link */}
      <p className="text-xs text-brand-600 font-semibold mt-3 flex items-center gap-1 group-hover:gap-2 transition-all">
        {pending ? "Review & vote" : "View goal"} <ArrowRight className="h-3 w-3" />
      </p>
    </Link>
  );
}
