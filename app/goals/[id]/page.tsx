"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, Copy, Check, Users,
  ThumbsUp, ThumbsDown, AlertTriangle, Trophy, Clock, Send, X, ShieldCheck
} from "lucide-react";
import { Logo } from "@/app/components/Logo";
import { ProgressBar } from "@/app/components/ProgressBar";
import { Avatar } from "@/app/components/Avatar";
import {
  getGoal, goalMembers, goalContributions, activeWithdrawal,
  votesFor, quorumFor, refundBreakdown, getUser, usersMap,
} from "@/lib/store";
import { formatNaira, formatDate, pct, daysLeft } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function GoalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  // Sync state with lib/store.ts
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const goal = getGoal(id);
  if (!goal) notFound();

  const members = goalMembers(id);
  const contributions = goalContributions(id);
  const saved = contributions.reduce((s, c) => s + c.amount, 0);
  const progress = pct(saved, goal.targetAmount);
  const days = daysLeft(goal.deadline);
  const isGroup = goal.type === "group";
  const owner = getUser(goal.ownerId);

  const withdrawalReq = activeWithdrawal(id);
  const votes = withdrawalReq ? votesFor(withdrawalReq.id) : [];
  const quorum = isGroup ? quorumFor(id) : undefined;
  const refunds = isGroup ? refundBreakdown(id) : [];

  // Modals
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Form states
  const [depositAmount, setDepositAmount] = useState("10000");
  const [contributorUser, setContributorUser] = useState("u_tolu");
  const [contributorName, setContributorName] = useState("Tolu Adeyemi");
  const [withdrawReason, setWithdrawReason] = useState("Plans changed — venue fell through.");
  const [loading, setLoading] = useState(false);

  // Handle simulated bank deposit
  async function handleDeposit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalId: id,
          contributorName,
          contributorUserId: contributorUser,
          amount: Number(depositAmount),
        }),
      });
      await res.json();
      refresh();
      setShowDepositModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Handle emergency withdrawal proposal
  async function handleRequestWithdrawal(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "propose",
          goalId: id,
          requestedBy: "u_tolu",
          reason: withdrawReason,
        }),
      });
      await res.json();
      refresh();
      setShowWithdrawModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Handle voting
  async function handleVote(approve: boolean, voterId: string = "u_tolu") {
    if (!withdrawalReq) return;
    try {
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "vote",
          requestId: withdrawalReq.id,
          voterId,
          vote: approve,
        }),
      });
      await res.json();
      refresh();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen bg-cream font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-cream/80 backdrop-blur-sm border-b border-line">
        <div className="mx-auto max-w-xl px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-muted hover:text-ink transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <Logo className="text-xl" />
          <div className="w-20" />
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-8 space-y-5">
        {/* Hero card */}
        <div className="rounded-card bg-ink text-cream p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl">{goal.emoji ?? "🎯"}</span>
                {isGroup && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium">
                    <Users className="h-3 w-3" /> Group
                  </span>
                )}
                {goal.status === "withdrawn" && (
                  <span className="rounded-full bg-coral-500/30 border border-coral-400/40 text-coral-300 text-xs px-2 py-0.5 font-bold">
                    Emergency Withdrawn
                  </span>
                )}
              </div>
              <h1 className="font-display text-2xl font-bold leading-tight">{goal.title}</h1>
              <p className="text-cream/60 text-sm mt-0.5">
                Deadline {formatDate(goal.deadline)} · {days} day{days !== 1 ? "s" : ""} left
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-display font-bold text-3xl tabular">{progress}%</p>
              <p className="text-cream/50 text-xs">complete</p>
            </div>
          </div>

          <ProgressBar
            value={progress}
            color={goal.status === "withdrawn" ? "coral" : progress >= 100 ? "brand" : isGroup ? "amber" : "brand"}
            className="mb-4 h-3"
            showPulse={progress >= 100}
          />

          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-display font-bold tabular">{formatNaira(saved)}</p>
              <p className="text-cream/50 text-xs">saved of {formatNaira(goal.targetAmount)}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold tabular">{formatNaira(Math.max(0, goal.targetAmount - saved))}</p>
              <p className="text-cream/50 text-xs">remaining</p>
            </div>
          </div>

          {progress >= 100 && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-brand-500/20 border border-brand-400/30 px-4 py-3">
              <Trophy className="h-5 w-5 text-brand-400 shrink-0" />
              <p className="text-sm font-semibold text-brand-300">
                🎉 Target reached! Instant offramp payout initiated to {owner?.bankName ?? "account"}.
              </p>
            </div>
          )}
        </div>

        {/* Virtual account tile + Deposit Simulator */}
        {goal.virtualAccountNumber && goal.status === "active" && (
          <VirtualAccountTile
            accountNumber={goal.virtualAccountNumber}
            bank={goal.virtualAccountBank ?? "Providus Bank"}
            goalTitle={goal.title}
            onOpenDeposit={() => setShowDepositModal(true)}
          />
        )}

        {/* Emergency withdrawal / quorum governance */}
        {withdrawalReq && quorum ? (
          <QuorumGovernanceCard
            request={withdrawalReq}
            quorum={quorum}
            refunds={refunds}
            pool={saved}
            onVote={handleVote}
          />
        ) : isGroup && goal.status === "active" && (
          <div className="rounded-tile border border-line bg-surface p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-ink">Emergency Withdrawal Governance</p>
              <p className="text-xs text-muted">Need to cancel or pivot? Requires majority group quorum.</p>
            </div>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="rounded-lg border border-coral-300 bg-coral-50 text-coral-600 px-3 py-1.5 text-xs font-semibold hover:bg-coral-100 transition-colors"
            >
              Request Withdrawal
            </button>
          </div>
        )}

        {/* Group members */}
        {isGroup && members.length > 0 && (
          <MembersList members={members} contributions={contributions} saved={saved} />
        )}

        {/* Contributions list */}
        <ContributionsList contributions={contributions} />

        {/* Installment schedule */}
        <div className="rounded-tile bg-surface border border-line p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Clock className="h-4 w-4 shrink-0" />
            <span>Savings plan</span>
          </div>
          <p className="text-sm font-semibold text-ink tabular">
            {formatNaira(goal.installmentAmount)} / {goal.frequency}
          </p>
        </div>
      </main>

      {/* ── Simulate Deposit Modal ───────────────────────── */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-line rounded-2xl max-w-md w-full p-6 space-y-4 shadow-card">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="font-display font-bold text-lg text-ink">Simulate Bank Transfer</h3>
              <button onClick={() => setShowDepositModal(false)} className="text-muted hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Transfer Amount (₦)</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full rounded-xl border border-line bg-surface p-3 text-sm font-bold font-mono text-ink focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Select Contributor</label>
                <select
                  value={contributorUser}
                  onChange={(e) => {
                    setContributorUser(e.target.value);
                    const userObj = getUser(e.target.value);
                    if (userObj) setContributorName(userObj.name);
                  }}
                  className="w-full rounded-xl border border-line bg-surface p-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400"
                >
                  <option value="u_tolu">Tolu Adeyemi (you)</option>
                  <option value="u_amaka">Amaka Obi</option>
                  <option value="u_bayo">Bayo Ade</option>
                  <option value="u_chinedu">Chinedu Eze</option>
                  <option value="u_ngozi">Ngozi Ali</option>
                  <option value="u_kemi">Kemi Sanni</option>
                  <option value="u_custom">External Guest Contributor</option>
                </select>
              </div>

              {contributorUser === "u_custom" && (
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Sender Name</label>
                  <input
                    type="text"
                    value={contributorName}
                    onChange={(e) => setContributorName(e.target.value)}
                    className="w-full rounded-xl border border-line bg-surface p-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="flex-1 rounded-full border border-line py-2.5 text-xs font-semibold text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !depositAmount}
                  className="flex-1 rounded-full bg-brand-500 py-2.5 text-xs font-semibold text-ink hover:bg-brand-400 disabled:opacity-40"
                >
                  {loading ? "Processing..." : "Send Simulated Transfer 💸"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Request Withdrawal Modal ──────────────────────── */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-line rounded-2xl max-w-md w-full p-6 space-y-4 shadow-card">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="font-display font-bold text-lg text-ink">Request Emergency Withdrawal</h3>
              <button onClick={() => setShowWithdrawModal(false)} className="text-muted hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRequestWithdrawal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Reason for Withdrawal</label>
                <textarea
                  value={withdrawReason}
                  onChange={(e) => setWithdrawReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-line bg-surface p-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 rounded-full border border-line py-2.5 text-xs font-semibold text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !withdrawReason.trim()}
                  className="flex-1 rounded-full bg-coral-500 text-white py-2.5 text-xs font-semibold hover:bg-coral-600 disabled:opacity-40"
                >
                  {loading ? "Submitting..." : "Submit Proposal 🚨"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Virtual Account tile ──────────────────────────────────── */
function VirtualAccountTile({
  accountNumber, bank, goalTitle, onOpenDeposit,
}: {
  accountNumber: string; bank: string; goalTitle: string; onOpenDeposit: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-tile bg-surface border border-line p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider">Fund this goal</p>
        <button
          onClick={onOpenDeposit}
          className="flex items-center gap-1 text-xs font-semibold text-brand-600 bg-brand-50 border border-brand-200 rounded-lg px-2.5 py-1 hover:bg-brand-100 transition-colors"
        >
          <Send className="h-3 w-3" /> Simulate Bank Deposit
        </button>
      </div>

      <p className="text-xs text-faint mb-3 leading-relaxed">
        Transfer to this dedicated account — no app required. Use <strong className="text-ink">{goalTitle}</strong> as your payment reference so we can attribute your contribution.
      </p>

      <div className="flex items-center gap-3 rounded-xl bg-surface-2 border border-line px-4 py-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-faint mb-0.5">{bank}</p>
          <p className="font-display font-bold text-ink text-xl tabular tracking-wider">{accountNumber}</p>
        </div>
        <button
          id="copy-account-btn"
          onClick={copy}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all",
            copied ? "bg-brand-100 text-brand-700" : "bg-ink text-cream hover:bg-ink-hover"
          )}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}

/* ── Members List ─────────────────────────────────────────── */
function MembersList({
  members, contributions, saved,
}: {
  members: ReturnType<typeof goalMembers>;
  contributions: ReturnType<typeof goalContributions>;
  saved: number;
}) {
  const users = usersMap();
  const memberContrib = new Map<string, number>();
  for (const c of contributions) {
    if (c.contributorUserId) {
      memberContrib.set(c.contributorUserId, (memberContrib.get(c.contributorUserId) ?? 0) + c.amount);
    }
  }

  return (
    <div className="rounded-tile bg-surface border border-line p-5">
      <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
        Members · {members.length}
      </p>
      <ul className="space-y-3">
        {members.map((m) => {
          const user = users.get(m.userId);
          if (!user) return null;
          const contrib = memberContrib.get(user.id) ?? 0;
          const share = saved > 0 ? (contrib / saved) * 100 : 0;
          return (
            <li key={m.id} className="flex items-center gap-3">
              <Avatar name={user.name} color={user.avatarColor} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-ink truncate">{user.name}</p>
                  {m.role === "admin" && (
                    <span className="rounded-full bg-ink text-cream text-[10px] font-bold px-1.5 py-0.5">
                      Admin
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 rounded-full bg-line overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${Math.min(100, share)}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted tabular shrink-0">{share.toFixed(0)}%</span>
                </div>
              </div>
              <p className="text-sm font-semibold tabular text-ink shrink-0">{formatNaira(contrib)}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ── Contributions List ────────────────────────────────────── */
function ContributionsList({ contributions }: { contributions: ReturnType<typeof goalContributions> }) {
  const users = usersMap();
  return (
    <div className="rounded-tile bg-surface border border-line p-5">
      <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
        Contributions · {contributions.length}
      </p>
      {contributions.length === 0 ? (
        <p className="text-sm text-faint text-center py-4">No contributions yet.</p>
      ) : (
        <ul className="space-y-3">
          {contributions.map((c) => {
            const user = c.contributorUserId ? users.get(c.contributorUserId) : null;
            return (
              <li key={c.id} className="flex items-center gap-3">
                <Avatar name={c.contributorName} color={user?.avatarColor ?? "#9a9b8f"} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{c.contributorName}</p>
                  <p className="text-xs text-faint">{formatDate(c.receivedAt)}</p>
                </div>
                <p className="text-sm font-semibold tabular text-ink shrink-0">
                  +{formatNaira(c.amount)}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ── Quorum Governance Card ───────────────────────────────── */
function QuorumGovernanceCard({
  request, quorum, refunds, pool, onVote,
}: {
  request: NonNullable<ReturnType<typeof activeWithdrawal>>;
  quorum: NonNullable<ReturnType<typeof quorumFor>>;
  refunds: ReturnType<typeof refundBreakdown>;
  pool: number;
  onVote: (approve: boolean, voterId: string) => void;
}) {
  const requester = getUser(request.requestedBy);

  return (
    <div className="rounded-tile border-2 border-coral-300 bg-coral-100/40 p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-coral-100 p-2 shrink-0">
          <AlertTriangle className="h-5 w-5 text-coral-500" />
        </div>
        <div>
          <p className="font-display font-semibold text-ink">Emergency Withdrawal Requested</p>
          <p className="text-xs text-muted mt-0.5">
            Requested by <strong>{requester?.name ?? "a member"}</strong> · {formatDate(request.createdAt)}
          </p>
          {request.reason && (
            <p className="text-sm text-muted mt-1.5 italic leading-snug">"{request.reason}"</p>
          )}
        </div>
      </div>

      {/* Quorum Progress */}
      <div className="rounded-xl bg-surface border border-line p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider">Quorum Progress</p>
          <p className={cn(
            "text-xs font-bold",
            quorum.met ? "text-brand-600" : "text-coral-500"
          )}>
            {quorum.met ? "✓ Quorum reached · Refunds dispatched!" : `${quorum.approvals} / ${quorum.required} needed`}
          </p>
        </div>

        <div className="flex gap-1 mb-3">
          {Array.from({ length: quorum.memberCount }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 h-2.5 rounded-full transition-colors",
                i < quorum.approvals ? "bg-brand-500" : "bg-line"
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1">
            <ThumbsUp className="h-3.5 w-3.5 text-brand-500" />
            {quorum.approvals} approved
          </span>
          <span className="flex items-center gap-1">
            <ThumbsDown className="h-3.5 w-3.5 text-coral-400" />
            {quorum.rejections} rejected
          </span>
          <span className="ml-auto">
            {quorum.pending} pending
          </span>
        </div>
      </div>

      {/* Vote controls if quorum not met yet */}
      {!quorum.met && (
        <div className="bg-surface border border-line rounded-xl p-3 space-y-2">
          <p className="text-xs text-muted font-medium">Cast live vote as Admin (Tolu Adeyemi):</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="vote-approve-btn"
              type="button"
              onClick={() => onVote(true, "u_tolu")}
              className="flex items-center justify-center gap-2 rounded-xl bg-brand-500 text-ink py-2.5 text-xs font-semibold hover:bg-brand-400 transition-colors"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              Approve (Triggers Quorum 🎉)
            </button>
            <button
              id="vote-reject-btn"
              type="button"
              onClick={() => onVote(false, "u_tolu")}
              className="flex items-center justify-center gap-2 rounded-xl border border-coral-300 bg-coral-50 text-coral-600 py-2.5 text-xs font-semibold hover:bg-coral-100 transition-colors"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
              Reject
            </button>
          </div>
        </div>
      )}

      {/* Refund breakdown */}
      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
          Proportional Refund Breakdown · Pool = {formatNaira(pool)}
        </p>
        <ul className="space-y-2">
          {refunds.map((r) => (
            <li key={r.userId} className="flex items-center gap-3">
              <Avatar name={r.name} color={r.avatarColor} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink">{r.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex-1 h-1 rounded-full bg-line overflow-hidden">
                    <div
                      className="h-full rounded-full bg-coral-400 transition-all duration-500"
                      style={{ width: `${r.sharePct}%` }}
                    />
                  </div>
                  <span className="text-xs text-faint tabular shrink-0">{r.sharePct.toFixed(0)}%</span>
                </div>
              </div>
              <p className="text-sm font-bold tabular text-coral-600 shrink-0">
                {formatNaira(r.refund)}
              </p>
            </li>
          ))}
        </ul>
        <p className="text-xs text-faint mt-2">
          Sum = {formatNaira(refunds.reduce((s, r) => s + r.refund, 0))} — exact match.
        </p>
      </div>
    </div>
  );
}
