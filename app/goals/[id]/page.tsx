"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Copy,
  Check,
  Users,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Trophy,
  Clock,
  Send,
  X,
  UserMinus,
  Sparkles,
  Share2,
  TrendingUp,
} from "lucide-react";
import { Logo } from "@/app/components/Logo";
import { ProgressBar } from "@/app/components/ProgressBar";
import { Avatar } from "@/app/components/Avatar";
import {
  getGoal,
  goalMembers,
  goalContributions,
  activeWithdrawal,
  votesFor,
  quorumFor,
  refundBreakdown,
  getUser,
  usersMap,
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

  // Flow 5a Adjustment state
  const [adjustmentNotice, setAdjustmentNotice] = useState<{
    memberName: string;
    refundedAmount: number;
    newInstallment: number;
  } | null>(null);

  // Completion Celebration State
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  useEffect(() => {
    if (progress >= 100 && !hasCelebrated) {
      setShowCelebration(true);
      setHasCelebrated(true);
    }
  }, [progress, hasCelebrated]);

  // Modals
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string } | null>(null);

  // Form states
  const [depositAmount, setDepositAmount] = useState("15000");
  const [contributorUser, setContributorUser] = useState("u_tolu");
  const [contributorName, setContributorName] = useState("Tolu Adeyemi");
  const [withdrawReason, setWithdrawReason] = useState("Goal no longer needed — item acquired through another channel.");
  const [loading, setLoading] = useState(false);

  // Flow 5a: Admin Remove Member
  async function handleRemoveMember(memberUserId: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/members/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalId: id,
          memberUserId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAdjustmentNotice({
          memberName: data.memberName,
          refundedAmount: data.refundedAmount,
          newInstallment: data.newInstallment,
        });
        refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setMemberToRemove(null);
    }
  }

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

  // Handle Flow 5b cancellation proposal
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
    <div className="min-h-screen bg-[#FBF9F4] text-[#17170F] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#FBF9F4]/90 backdrop-blur-sm border-b border-[#E9E8E0]">
        <div className="mx-auto max-w-xl px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-[#595B52] hover:text-[#17170F] transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <Logo className="text-xl" />
          <div className="w-20" />
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-8 space-y-5">
        {/* Animated Flow 5a Adjustment Banner */}
        <AnimatePresence>
          {adjustmentNotice && (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16 }}
              className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 relative shadow-sm"
            >
              <button
                onClick={() => setAdjustmentNotice(null)}
                className="absolute top-3 right-3 text-amber-700 hover:text-amber-900"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-200 text-amber-900 shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-display font-bold text-sm text-amber-900">
                    Member Removed &amp; Installments Recalculated (Flow 5a)
                  </p>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    <strong>{adjustmentNotice.memberName}</strong> was removed by Admin and refunded{" "}
                    <strong>{formatNaira(adjustmentNotice.refundedAmount)}</strong> to their bank account.
                  </p>
                  <p className="text-xs text-amber-900 font-semibold mt-2">
                    Remaining members&apos; installment adjusted to:{" "}
                    <span className="text-sm font-bold underline">
                      {formatNaira(adjustmentNotice.newInstallment)} / {goal.frequency}
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero card */}
        <div className="rounded-2xl bg-[#17170F] text-cream p-6 shadow-md">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl">{goal.emoji ?? "🎯"}</span>
                {isGroup && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold">
                    <Users className="h-3 w-3" /> Group Goal
                  </span>
                )}
                {goal.status === "withdrawn" && (
                  <span className="rounded-full bg-coral-500/30 border border-coral-400/40 text-coral-300 text-xs px-2.5 py-0.5 font-bold">
                    Emergency Withdrawn
                  </span>
                )}
                {goal.status === "completed" && (
                  <span className="rounded-full bg-brand-500 text-[#17170F] text-xs px-2.5 py-0.5 font-bold">
                    Target Met ✓
                  </span>
                )}
              </div>
              <h1 className="font-display text-2xl font-bold leading-tight">{goal.title}</h1>
              <p className="text-cream/60 text-xs mt-0.5">
                Target Deadline: {formatDate(goal.deadline)} · {days} day{days !== 1 ? "s" : ""} remaining
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-display font-bold text-3xl tabular">{progress}%</p>
              <p className="text-cream/50 text-[10px] uppercase font-bold tracking-wider">funded</p>
            </div>
          </div>

          <ProgressBar
            value={progress}
            color={goal.status === "withdrawn" ? "coral" : progress >= 100 ? "brand" : isGroup ? "amber" : "brand"}
            className="mb-4 h-3 rounded-full"
            showPulse={progress >= 100}
          />

          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-display font-bold tabular">{formatNaira(saved)}</p>
              <p className="text-cream/50 text-xs">saved of {formatNaira(goal.targetAmount)}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold tabular text-sm">{formatNaira(Math.max(0, goal.targetAmount - saved))}</p>
              <p className="text-cream/50 text-xs">remaining</p>
            </div>
          </div>

          {progress >= 100 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 flex items-center gap-3 rounded-xl bg-brand-500/20 border border-brand-400/40 p-3.5"
            >
              <Trophy className="h-6 w-6 text-brand-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-brand-300">
                  🎉 Goal Completed! Instant Settlement
                </p>
                <p className="text-[11px] text-cream/70 mt-0.5">
                  Full amount ({formatNaira(saved)}) offramped to {isGroup ? "Admin's" : "Owner's"} linked bank account ({owner?.bankName ?? "GTBank"}).
                </p>
              </div>
            </motion.div>
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

        {/* Emergency withdrawal / quorum governance (Flow 5b) */}
        {withdrawalReq && quorum ? (
          <QuorumGovernanceCard
            request={withdrawalReq}
            quorum={quorum}
            refunds={refunds}
            pool={saved}
            onVote={handleVote}
          />
        ) : isGroup && goal.status === "active" && (
          <div className="rounded-2xl border border-[#E9E8E0] bg-white p-4 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-xs font-bold text-[#17170F]">Group Cancellation Vote (Flow 5b)</p>
              <p className="text-xs text-[#595B52]">Propose ending goal and refunding all members proportionally.</p>
            </div>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="rounded-xl border border-coral-300 bg-coral-50 text-coral-600 px-3.5 py-2 text-xs font-bold hover:bg-coral-100 transition-colors"
            >
              Propose Cancellation
            </button>
          </div>
        )}

        {/* Group members list with Flow 5a Admin Removal */}
        {isGroup && members.length > 0 && (
          <MembersList
            members={members}
            contributions={contributions}
            saved={saved}
            isAdmin={true}
            onRemoveMember={(m) => setMemberToRemove(m)}
          />
        )}

        {/* Contributions list */}
        <ContributionsList contributions={contributions} />

        {/* Installment schedule */}
        <div className="rounded-2xl bg-white border border-[#E9E8E0] p-4 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2 text-sm text-[#595B52]">
            <Clock className="h-4 w-4 shrink-0" />
            <span className="font-medium">Calculated Installment Plan</span>
          </div>
          <p className="text-sm font-bold text-[#17170F] tabular">
            {formatNaira(goal.installmentAmount)} / {goal.frequency}
          </p>
        </div>
      </main>

      {/* ── Goal Completed Celebration Modal ──────────────── */}
      <AnimatePresence>
        {showCelebration && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl border border-brand-200"
            >
              <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center mx-auto text-3xl animate-bounce">
                🏆
              </div>
              <h2 className="font-display text-2xl font-extrabold text-[#17170F]">
                Goal Target Reached!
              </h2>
              <p className="text-xs text-[#595B52] leading-relaxed">
                Congratulations! You&apos;ve successfully saved{" "}
                <strong className="text-[#17170F]">{formatNaira(saved)}</strong> for{" "}
                <strong className="text-[#17170F]">{goal.title}</strong>.
              </p>
              <div className="rounded-xl bg-brand-50 border border-brand-200 p-3 text-xs text-left">
                <p className="text-[10px] text-brand-700 font-bold uppercase">Automated Offramp</p>
                <p className="font-semibold text-brand-900 mt-0.5">
                  Dispatched to {isGroup ? "Admin's" : "Owner's"} bank account via BMONI rail.
                </p>
              </div>
              <button
                onClick={() => setShowCelebration(false)}
                className="w-full py-3 rounded-full bg-[#17170F] text-white text-xs font-bold hover:bg-black transition"
              >
                View Goal Summary
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Confirm Flow 5a Member Removal Modal ──────────── */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E9E8E0] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-display font-bold text-base text-[#17170F]">
                Remove Member (Flow 5a)
              </h3>
              <button onClick={() => setMemberToRemove(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-[#595B52] leading-relaxed">
              Are you sure you want to remove <strong className="text-[#17170F]">{memberToRemove.name}</strong> from this goal?
            </p>

            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 space-y-1">
              <p className="font-bold">Automated Flow 5a Rules:</p>
              <p>• {memberToRemove.name} will be <strong>instantly refunded</strong> their tracked contributions to their bank account.</p>
              <p>• The remaining target is recalculated and remaining members&apos; installments are automatically adjusted upward.</p>
              <p>• No group vote is required (Admin action).</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMemberToRemove(null)}
                className="flex-1 rounded-full border border-gray-200 py-2.5 text-xs font-bold text-[#17170F]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleRemoveMember(memberToRemove.id)}
                className="flex-1 rounded-full bg-coral-500 text-white py-2.5 text-xs font-bold hover:bg-coral-600 disabled:opacity-50"
              >
                {loading ? "Processing Refund..." : "Confirm & Refund"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Simulate Deposit Modal ───────────────────────── */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E9E8E0] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-display font-bold text-base text-[#17170F]">Simulate Bank Deposit</h3>
              <button onClick={() => setShowDepositModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#17170F] mb-1">Transfer Amount (₦)</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full rounded-xl border border-[#D5D4CA] bg-white p-3 text-sm font-bold font-mono text-[#17170F] focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17170F] mb-1">Select Contributor</label>
                <select
                  value={contributorUser}
                  onChange={(e) => {
                    setContributorUser(e.target.value);
                    const userObj = getUser(e.target.value);
                    if (userObj) setContributorName(userObj.name);
                  }}
                  className="w-full rounded-xl border border-[#D5D4CA] bg-white p-3 text-xs font-medium text-[#17170F] focus:outline-none focus:ring-2 focus:ring-brand-400"
                >
                  <option value="u_tolu">Tolu Adeyemi (you)</option>
                  <option value="u_amaka">Amaka Obi</option>
                  <option value="u_bayo">Bayo Ade</option>
                  <option value="u_chinedu">Chinedu Eze</option>
                  <option value="u_ngozi">Ngozi Ali</option>
                  <option value="u_kemi">Kemi Sanni</option>
                  <option value="u_custom">External Contributor (No Account Required)</option>
                </select>
              </div>

              {contributorUser === "u_custom" && (
                <div>
                  <label className="block text-xs font-bold text-[#17170F] mb-1">Sender Name</label>
                  <input
                    type="text"
                    value={contributorName}
                    onChange={(e) => setContributorName(e.target.value)}
                    className="w-full rounded-xl border border-[#D5D4CA] bg-white p-3 text-xs text-[#17170F] focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="flex-1 rounded-full border border-gray-200 py-2.5 text-xs font-semibold text-[#17170F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !depositAmount}
                  className="flex-1 rounded-full bg-brand-500 py-2.5 text-xs font-bold text-[#17170F] hover:bg-brand-400 disabled:opacity-40"
                >
                  {loading ? "Processing..." : "Send Simulated Transfer 💸"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Flow 5b Cancellation Proposal Modal ──────────── */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E9E8E0] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-display font-bold text-base text-[#17170F]">Propose Group Cancellation</h3>
              <button onClick={() => setShowWithdrawModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRequestWithdrawal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#17170F] mb-1">Reason for Cancellation</label>
                <textarea
                  value={withdrawReason}
                  onChange={(e) => setWithdrawReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-[#D5D4CA] bg-white p-3 text-xs text-[#17170F] focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>

              <p className="text-[11px] text-gray-500">
                All group members will be invited to vote. If a majority quorum approves, all pooled funds will be refunded proportionally.
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 rounded-full border border-gray-200 py-2.5 text-xs font-semibold text-[#17170F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !withdrawReason.trim()}
                  className="flex-1 rounded-full bg-coral-500 text-white py-2.5 text-xs font-bold hover:bg-coral-600 disabled:opacity-40"
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
    <div className="rounded-2xl bg-white border border-[#E9E8E0] p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-[#595B52] uppercase tracking-wider">Fund this goal</p>
        <button
          onClick={onOpenDeposit}
          className="flex items-center gap-1 text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 rounded-lg px-2.5 py-1 hover:bg-brand-100 transition-colors"
        >
          <Send className="h-3 w-3" /> Simulate Bank Deposit
        </button>
      </div>

      <p className="text-xs text-[#595B52] mb-3 leading-relaxed">
        Transfer to this dedicated account — no account needed to contribute. Use <strong className="text-[#17170F]">{goalTitle}</strong> as your transfer narration.
      </p>

      <div className="flex items-center gap-3 rounded-xl bg-[#F8F7F2] border border-[#E9E8E0] px-4 py-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 mb-0.5">{bank}</p>
          <p className="font-display font-bold text-[#17170F] text-xl tabular tracking-wider">{accountNumber}</p>
        </div>
        <button
          id="copy-account-btn"
          onClick={copy}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all",
            copied ? "bg-brand-100 text-brand-800" : "bg-[#17170F] text-white hover:bg-black"
          )}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}

/* ── Members List with Flow 5a Admin Removal ───────────────── */
function MembersList({
  members, contributions, saved, isAdmin, onRemoveMember,
}: {
  members: ReturnType<typeof goalMembers>;
  contributions: ReturnType<typeof goalContributions>;
  saved: number;
  isAdmin: boolean;
  onRemoveMember: (member: { id: string; name: string }) => void;
}) {
  const users = usersMap();
  const memberContrib = new Map<string, number>();
  for (const c of contributions) {
    if (c.contributorUserId) {
      memberContrib.set(c.contributorUserId, (memberContrib.get(c.contributorUserId) ?? 0) + c.amount);
    }
  }

  return (
    <div className="rounded-2xl bg-white border border-[#E9E8E0] p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-[#595B52] uppercase tracking-wider">
          Group Members · {members.length}
        </p>
        <span className="text-[11px] text-gray-400">All save on same schedule</span>
      </div>

      <ul className="space-y-3">
        {members.map((m) => {
          const user = users.get(m.userId);
          if (!user) return null;
          const contrib = memberContrib.get(user.id) ?? 0;
          const share = saved > 0 ? (contrib / saved) * 100 : 0;
          const isMemberAdmin = m.role === "admin";

          return (
            <li key={m.id} className="flex items-center gap-3 py-1">
              <Avatar name={user.name} color={user.avatarColor} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-[#17170F] truncate">{user.name}</p>
                  {isMemberAdmin && (
                    <span className="rounded-full bg-[#17170F] text-white text-[9px] font-bold px-1.5 py-0.5">
                      Admin (Payout Recipient)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${Math.min(100, share)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 tabular shrink-0">{share.toFixed(0)}%</span>
                </div>
              </div>

              <div className="text-right shrink-0 flex items-center gap-3">
                <p className="text-xs font-bold tabular text-[#17170F]">{formatNaira(contrib)}</p>
                {/* Flow 5a Admin Action Button */}
                {isAdmin && !isMemberAdmin && (
                  <button
                    type="button"
                    onClick={() => onRemoveMember({ id: user.id, name: user.name })}
                    title="Remove member & auto-refund"
                    className="p-1 rounded-lg text-gray-400 hover:text-coral-600 hover:bg-coral-50 transition"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                )}
              </div>
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
    <div className="rounded-2xl bg-white border border-[#E9E8E0] p-5 shadow-2xs">
      <p className="text-xs font-bold text-[#595B52] uppercase tracking-wider mb-4">
        Live Activity Feed · {contributions.length}
      </p>
      {contributions.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">No deposits received yet.</p>
      ) : (
        <ul className="space-y-3">
          {contributions.map((c) => {
            const user = c.contributorUserId ? users.get(c.contributorUserId) : null;
            return (
              <li key={c.id} className="flex items-center gap-3">
                <Avatar name={c.contributorName} color={user?.avatarColor ?? "#9a9b8f"} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#17170F] truncate">{c.contributorName}</p>
                  <p className="text-[10px] text-gray-400">{formatDate(c.receivedAt)}</p>
                </div>
                <p className="text-xs font-bold tabular text-[#6fa62f] shrink-0">
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

/* ── Quorum Governance Card (Flow 5b) ──────────────────────── */
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
    <div className="rounded-2xl border-2 border-coral-300 bg-coral-50/50 p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-coral-100 p-2 shrink-0">
          <AlertTriangle className="h-5 w-5 text-coral-500" />
        </div>
        <div>
          <p className="font-display font-bold text-sm text-[#17170F]">Group Cancellation Vote (Flow 5b)</p>
          <p className="text-xs text-[#595B52] mt-0.5">
            Proposed by <strong>{requester?.name ?? "a member"}</strong> · {formatDate(request.createdAt)}
          </p>
          {request.reason && (
            <p className="text-xs text-gray-600 mt-1.5 italic leading-snug">"{request.reason}"</p>
          )}
        </div>
      </div>

      {/* Quorum Progress: Live Voting Count */}
      <div className="rounded-xl bg-white border border-[#E9E8E0] p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-[#595B52] uppercase tracking-wider">Quorum Status</p>
          <p className={cn(
            "text-xs font-extrabold",
            quorum.met ? "text-brand-600" : "text-coral-500"
          )}>
            {quorum.met ? "✓ Quorum Reached · Proportional Refunds Dispatched" : `${quorum.approvals} of ${quorum.required} agreed`}
          </p>
        </div>

        <div className="flex gap-1.5 mb-3">
          {Array.from({ length: quorum.memberCount }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 h-2.5 rounded-full transition-colors",
                i < quorum.approvals ? "bg-brand-500" : "bg-gray-200"
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-4 text-xs text-[#595B52]">
          <span className="flex items-center gap-1 font-semibold">
            <ThumbsUp className="h-3.5 w-3.5 text-brand-500" />
            {quorum.approvals} approved
          </span>
          <span className="flex items-center gap-1">
            <ThumbsDown className="h-3.5 w-3.5 text-coral-400" />
            {quorum.rejections} rejected
          </span>
          <span className="ml-auto text-gray-400 text-[11px]">
            {quorum.pending} pending
          </span>
        </div>
      </div>

      {/* Vote controls if quorum not met yet */}
      {!quorum.met && (
        <div className="bg-white border border-[#E9E8E0] rounded-xl p-3.5 space-y-2">
          <p className="text-xs text-gray-600 font-semibold">Cast live vote as Admin (Tolu Adeyemi):</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="vote-approve-btn"
              type="button"
              onClick={() => onVote(true, "u_tolu")}
              className="flex items-center justify-center gap-2 rounded-xl bg-brand-500 text-[#17170F] py-2.5 text-xs font-bold hover:bg-brand-400 transition-colors"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              Approve (Triggers Quorum 🎉)
            </button>
            <button
              id="vote-reject-btn"
              type="button"
              onClick={() => onVote(false, "u_tolu")}
              className="flex items-center justify-center gap-2 rounded-xl border border-coral-300 bg-coral-50 text-coral-600 py-2.5 text-xs font-bold hover:bg-coral-100 transition-colors"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
              Reject
            </button>
          </div>
        </div>
      )}

      {/* Refund breakdown (Revealed ONLY after quorum is reached!) */}
      {quorum.met ? (
        <div className="pt-2">
          <p className="text-xs font-bold text-[#595B52] uppercase tracking-wider mb-3">
            Proportional Refund Breakdown · Pool = {formatNaira(pool)}
          </p>
          <ul className="space-y-2 bg-white rounded-xl p-3.5 border border-[#E9E8E0]">
            {refunds.map((r) => (
              <li key={r.userId} className="flex items-center gap-3 py-1">
                <Avatar name={r.name} color={r.avatarColor} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#17170F]">{r.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-coral-400"
                        style={{ width: `${r.sharePct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 tabular shrink-0">{r.sharePct.toFixed(0)}%</span>
                  </div>
                </div>
                <p className="text-xs font-bold tabular text-coral-600 shrink-0">
                  {formatNaira(r.refund)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-[11px] text-gray-500 italic">
          🔒 Funds remain safely locked. Proportional refund breakdown will be calculated and disbursed once majority quorum is reached.
        </p>
      )}
    </div>
  );
}

