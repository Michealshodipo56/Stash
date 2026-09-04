"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
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
  TrendingUp,
  Bell,
  ChevronDown,
  Plus,
  Share2,
  Settings,
  Edit3,
  PauseCircle,
  PlayCircle,
  Trash2,
  Lightbulb,
  ShieldCheck,
  MessageSquare,
  CheckCircle2,
  HelpCircle,
  UserPlus,
  Package,
} from "lucide-react";
import { Logo } from "@/app/components/Logo";
import { Avatar } from "@/app/components/Avatar";
import { useAuth } from "@/app/context/AuthContext";
import { getUser, usersMap } from "@/lib/store";
import { formatNaira, formatDate, pct, daysLeft, cn } from "@/lib/utils";
import { Frequency } from "@/lib/types";

export default function GoalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [tick, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const [goalData, setGoalData] = useState<{
    goal: any;
    contributions: any[];
    members: any[];
    owner: any;
    withdrawalReq: any;
    votes: any[];
    quorum: any;
    refunds: any[];
  } | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  // Modals & Notices
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showTip, setShowTip] = useState(true);
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Form & Action states
  const [depositAmount, setDepositAmount] = useState("15000");
  const [contributorUser, setContributorUser] = useState(user?.id || "");
  const [contributorName, setContributorName] = useState(user?.name || "Member");
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberContact, setNewMemberContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states for Plan & Edit
  const [editTitle, setEditTitle] = useState("");
  const [editTarget, setEditTarget] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [editFrequency, setEditFrequency] = useState<Frequency>("daily");

  const [adjustmentNotice, setAdjustmentNotice] = useState<{
    memberName: string;
    refundedAmount: number;
    newInstallment: number;
  } | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadGoal() {
      setDataLoading(true);
      try {
        const res = await fetch(`/api/goals/${id}`);
        const data = await res.json();
        if (isMounted) {
          if (data.success && data.goal) {
            setGoalData(data);
            setNotFoundState(false);
            setEditTitle(data.goal.title || "");
            setEditTarget(String(data.goal.targetAmount || ""));
            setEditDeadline(data.goal.deadline || "");
            setEditFrequency(data.goal.frequency || "daily");
          } else {
            setNotFoundState(true);
          }
        }
      } catch (err) {
        console.error("Failed to load goal:", err);
        if (isMounted) setNotFoundState(true);
      } finally {
        if (isMounted) setDataLoading(false);
      }
    }
    loadGoal();
    return () => {
      isMounted = false;
    };
  }, [id, tick]);

  useEffect(() => {
    if (user?.id && !contributorUser) {
      setContributorUser(user.id);
      setContributorName(user.name);
    }
  }, [user, contributorUser]);

  function triggerToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-[#FBF9F4] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-4 border-[#5FA618] border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-medium text-[#595B52]">Loading goal details...</p>
        </div>
      </div>
    );
  }

  if (notFoundState || !goalData?.goal) {
    return notFound();
  }

  const goal = goalData.goal;
  const members = goalData.members || [];
  const contributions = goalData.contributions || [];
  const saved = contributions.reduce((acc: number, c: any) => acc + c.amount, 0);
  const progress = pct(saved, goal.targetAmount);
  const days = daysLeft(goal.deadline);
  const isGroup = goal.type === "group";
  const owner = goalData.owner;
  const isPaused = goal.status === "paused";
  const isClosed = goal.status === "completed" || goal.status === "closed" || goal.status === "withdrawn";

  const accountNumber = goal.virtualAccountNumber || goal.virtualAccount?.accountNumber || "9910004677";
  const bankName = goal.virtualAccountBank || goal.virtualAccount?.bankName || "Providus Bank";

  // Actions
  async function handleDeposit(e: React.FormEvent) {
    e.preventDefault();
    if (!depositAmount || Number(depositAmount) <= 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalId: id,
          contributorName,
          contributorUserId: contributorUser === "u_custom" ? undefined : contributorUser,
          amount: Number(depositAmount),
        }),
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(`Successfully deposited ₦${Number(depositAmount).toLocaleString()}!`);
        refresh();
        setShowDepositModal(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateGoal(updates: Partial<any>) {
    setLoading(true);
    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(data.message || "Goal updated!");
        refresh();
        setShowChangePlanModal(false);
        setShowEditModal(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleTogglePause() {
    await handleUpdateGoal({ status: isPaused ? "active" : "paused" });
  }

  async function handleCloseGoal() {
    setLoading(true);
    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        triggerToast("Goal successfully closed & funds processed!");
        setShowCloseModal(false);
        refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/members/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalId: id,
          name: newMemberName.trim(),
          emailOrPhone: newMemberContact.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(`${data.user?.name || newMemberName} added to goal!`);
        setNewMemberName("");
        setNewMemberContact("");
        setShowAddMemberModal(false);
        refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleCopyAccount() {
    navigator.clipboard.writeText(accountNumber);
    setCopiedAccount(true);
    triggerToast("Account number copied!");
    setTimeout(() => setCopiedAccount(false), 2000);
  }

  // Calculate frequency limit for change plan modal
  const maxFreq: Frequency = days < 7 ? "daily" : days < 30 ? "weekly" : days < 365 ? "monthly" : "yearly";

  return (
    <div className="min-h-screen bg-[#FBF9F4] text-[#17170F] font-sans">
      {/* Toast notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-[#17170F] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-[#8CC63F]" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E9E8E0]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Logo className="text-xl" />
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#595B52]">
              <Link href="/dashboard" className="hover:text-[#17170F] transition">Dashboard</Link>
              <Link href="/goals" className="text-[#17170F] font-bold border-b-2 border-[#5FA618] pb-0.5">My Goals</Link>
              <Link href="/transactions" className="hover:text-[#17170F] transition">Transactions</Link>
              <Link href="/learn" className="hover:text-[#17170F] transition">Learn</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-gray-100 text-gray-600 transition">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#5FA618]" />
            </button>
            <div className="flex items-center gap-2 cursor-pointer pl-2 border-l border-gray-200">
              <Avatar name={user?.name || "Tolu Adeyemi"} color={user?.avatarColor || "#5FA618"} size="sm" />
              <span className="text-xs font-bold text-[#17170F] hidden sm:inline">{user?.name || "Tolu Adeyemi"}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (Main Content) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* HERO CARD */}
            <div className="bg-white rounded-3xl border border-[#E9E8E0] p-6 shadow-sm relative space-y-6">
              {/* Header Info Row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Thumbnail Image Box */}
                  <div className="w-16 h-16 rounded-2xl bg-[#F3F8EC] border border-[#E2EED3] flex items-center justify-center shrink-0">
                    <Package className="w-8 h-8 text-[#5FA618]" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-[#595B52]">
                        {isGroup ? <Users className="w-3 h-3 text-[#5FA618]" /> : null}
                        {isGroup ? "Group goal" : "👤 Personal goal"}
                      </span>
                      {isPaused && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          Paused
                        </span>
                      )}
                      {isClosed && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gray-200 text-gray-800">
                          Closed
                        </span>
                      )}
                    </div>
                    <h1 className="text-xl md:text-2xl font-extrabold text-[#17170F] leading-tight">
                      {goal.title}
                    </h1>
                    <p className="text-xs text-[#73756C]">
                      Target Deadline: {formatDate(goal.deadline)} • <strong className="text-[#17170F]">{days} days remaining</strong>
                    </p>
                  </div>
                </div>

                {/* Manage goal dropdown button */}
                <button
                  onClick={() => setShowEditModal(true)}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#E9E8E0] hover:bg-gray-50 text-[#17170F] transition shrink-0"
                >
                  <Settings className="w-3.5 h-3.5 text-gray-500" />
                  Manage goal
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>

              {/* Progress & Saved Stats */}
              <div className="space-y-3 pt-2">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl md:text-3xl font-extrabold text-[#17170F]">
                      {formatNaira(saved)}
                    </span>
                    <span className="text-xs text-[#73756C] ml-2">
                      saved of <strong className="text-[#17170F]">{formatNaira(goal.targetAmount)}</strong>
                    </span>
                  </div>

                  {/* Circular Percentage Badge */}
                  <div className="w-12 h-12 rounded-full bg-[#F3F8EC] border-2 border-[#5FA618] flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-black text-[#17170F]">{progress}%</span>
                    <span className="text-[8px] font-semibold text-[#5FA618]">Funded</span>
                  </div>
                </div>

                {/* Linear Green Progress Bar */}
                <div className="relative w-full h-3 rounded-full bg-[#EAE8E0] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, progress)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full bg-[#5FA618]"
                  />
                </div>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-[#F7FAEE] border border-[#E5EED8] rounded-2xl p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-base shrink-0 shadow-2xs">
                    🗓️
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-[#17170F]">{days} days left</p>
                    <p className="text-[10px] text-[#73756C]">to reach your goal</p>
                  </div>
                </div>

                <div className="bg-[#F7FAEE] border border-[#E5EED8] rounded-2xl p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-base shrink-0 shadow-2xs">
                    🎯
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-extrabold text-[#17170F]">
                        {formatNaira(goal.installmentAmount)} / {goal.frequency}
                      </p>
                      <HelpCircle className="w-3 h-3 text-gray-400" />
                    </div>
                    <p className="text-[10px] text-[#73756C] capitalize">{goal.frequency} target</p>
                  </div>
                </div>

                <div className="bg-[#F7FAEE] border border-[#E5EED8] rounded-2xl p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-base shrink-0 shadow-2xs">
                    👥
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-[#17170F]">
                      {isGroup ? `${members.length} contributors` : "Solo goal"}
                    </p>
                    <p className="text-[10px] text-[#73756C]">
                      {isGroup ? "Group stash" : "No contributors yet"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  disabled={isClosed}
                  onClick={() => setShowDepositModal(true)}
                  className="flex-1 py-3 px-4 rounded-2xl bg-[#5FA618] text-white font-bold text-xs hover:bg-[#529113] active:scale-[0.99] transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  Add money
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex-1 py-3 px-4 rounded-2xl border border-[#DCDBCF] bg-white text-[#17170F] font-bold text-xs hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4 text-gray-600" />
                  Share goal
                </button>
              </div>
            </div>

            {/* YOUR PROGRESS CARD */}
            <div className="bg-white rounded-3xl border border-[#E9E8E0] p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-[#17170F]">Your progress</h2>

              <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-[#FAF9F5] border border-[#EAE8E0] rounded-2xl p-5">
                {/* Donut Progress Meter */}
                <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#E5E3D8]"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#5FA618]"
                      strokeDasharray={`${progress}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-lg font-black text-[#17170F]">{progress}%</span>
                    <span className="text-[10px] text-[#73756C] font-semibold">Complete</span>
                  </div>
                </div>

                {/* Progress Details & Checkbox List */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#17170F]">
                      {progress === 0 ? "You're just getting started!" : progress >= 100 ? "🎉 Goal Complete!" : "Keep up the momentum!"}
                    </h3>
                    <p className="text-xs text-[#73756C] mt-0.5 leading-relaxed">
                      Start with a small deposit today and stay consistent. Small steps lead to big wins.
                    </p>
                  </div>

                  <div className="bg-[#F3F8EC] border border-[#E2EED3] rounded-xl p-3 space-y-1.5">
                    <p className="text-[11px] font-bold text-[#3B6A0E]">When you stay on plan:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[11px] font-semibold text-[#17170F]">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#5FA618] shrink-0" />
                        Build discipline
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#5FA618] shrink-0" />
                        Reach target faster
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#5FA618] shrink-0" />
                        Stay financially secure
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* GROUP MEMBERS SECTION */}
            <div className="bg-white rounded-3xl border border-[#E9E8E0] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#17170F] flex items-center gap-2">
                    Group members
                    <span className="text-xs font-semibold text-[#73756C] bg-gray-100 px-2 py-0.5 rounded-full">
                      {members.length > 0 ? members.length : 1}
                    </span>
                  </h2>
                  <p className="text-xs text-[#73756C] mt-0.5">
                    {isGroup
                      ? "Members contributing to this shared goal"
                      : "Add members to invite friends & split installment targets"}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#5FA618] text-white px-3 py-2 rounded-xl hover:bg-[#4E8B13] transition shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Add member
                </button>
              </div>

              {/* Members List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {members.length > 0 ? (
                  members.map((m: any) => {
                    const memberUser = usersMap[m.userId] || {
                      name: m.name || "Goal Member",
                      avatarColor: "#5FA618",
                    };
                    const isOwnerMember = m.userId === goal.ownerId || m.role === "admin";
                    return (
                      <div
                        key={m.id || m.userId}
                        className="flex items-center justify-between p-3 rounded-2xl bg-[#FBF9F4] border border-[#E9E8E0]"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={memberUser.name}
                            color={memberUser.avatarColor || "#5FA618"}
                            size="md"
                          />
                          <div>
                            <p className="text-xs font-bold text-[#17170F] flex items-center gap-1.5">
                              {memberUser.name}
                              {isOwnerMember && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E2EED3] text-[#3B6A0E]">
                                  Admin
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-[#73756C]">
                              {isGroup ? `₦${Number(goal.installmentAmount).toLocaleString()} / ${goal.frequency}` : "Active contributor"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FBF9F4] border border-[#E9E8E0] col-span-full">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={owner?.name || user?.name || "Tolu Adeyemi"}
                        color={owner?.avatarColor || user?.avatarColor || "#5FA618"}
                        size="md"
                      />
                      <div>
                        <p className="text-xs font-bold text-[#17170F] flex items-center gap-1.5">
                          {owner?.name || user?.name || "Tolu Adeyemi"}
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E2EED3] text-[#3B6A0E]">
                            Owner & Admin
                          </span>
                        </p>
                        <p className="text-[11px] text-[#73756C]">
                          ₦{Number(goal.installmentAmount).toLocaleString()} / {goal.frequency}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* LIVE ACTIVITY FEED */}
            <div className="bg-white rounded-3xl border border-[#E9E8E0] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#17170F] flex items-center gap-2">
                  Live activity feed
                  <span className="text-xs font-semibold text-[#73756C] bg-gray-100 px-2 py-0.5 rounded-full">
                    {contributions.length}
                  </span>
                </h2>
                {contributions.length > 0 && (
                  <button className="text-xs font-bold text-[#5FA618] hover:underline">
                    View all →
                  </button>
                )}
              </div>

              {contributions.length === 0 ? (
                <div className="text-center py-8 space-y-2 border border-dashed border-[#E0DFD5] rounded-2xl bg-[#FAF9F5]">
                  <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-[#17170F]">No deposits received yet.</p>
                  <p className="text-[11px] text-[#73756C]">Your contributions and activity will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {contributions.map((c: any) => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF9F5] border border-[#EAE8E0]">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.contributorName} color="#5FA618" size="sm" />
                        <div>
                          <p className="text-xs font-bold text-[#17170F]">{c.contributorName}</p>
                          <p className="text-[10px] text-[#73756C]">{formatDate(c.receivedAt)}</p>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-[#5FA618]">
                        +{formatNaira(c.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column (Sidebar Cards) */}
          <div className="space-y-6">
            
            {/* FUND THIS GOAL CARD */}
            <div className="bg-white rounded-3xl border border-[#E9E8E0] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#17170F]">Fund this goal</h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#3B6A0E] bg-[#F3F8EC] px-2.5 py-1 rounded-full border border-[#E2EED3]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#5FA618]" />
                  Secure &amp; easy
                </span>
              </div>

              <p className="text-xs text-[#73756C] leading-relaxed">
                Transfer money to this dedicated account — no account needed to contribute.
              </p>

              {/* Bank Account Details Tile */}
              <div className="bg-[#F8FAF4] border border-[#E5EED8] rounded-2xl p-4 space-y-2">
                <p className="text-[11px] font-semibold text-[#73756C]">{bankName}</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xl md:text-2xl font-black text-[#17170F] tracking-wider font-mono">
                    {accountNumber}
                  </span>
                  <button
                    onClick={handleCopyAccount}
                    className="px-3 py-1.5 rounded-xl bg-[#17170F] text-white text-xs font-bold flex items-center gap-1 hover:bg-black transition active:scale-95 shrink-0"
                  >
                    {copiedAccount ? <Check className="w-3.5 h-3.5 text-[#5FA618]" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedAccount ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-[#73756C]">
                Use <strong className="text-[#17170F]">{goal.title}</strong> as your transfer narration.
              </p>

              {/* Simulate Bank Deposit Action Button */}
              <button
                disabled={isClosed}
                onClick={() => setShowDepositModal(true)}
                className="w-full py-3 px-4 rounded-2xl bg-[#F3F8EC] border border-[#E2EED3] text-[#3B6A0E] font-bold text-xs hover:bg-[#EAF4DB] transition flex items-center justify-between group disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-[#5FA618]" />
                  Simulate Bank Deposit
                </span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>

            {/* QUICK ACTIONS CARD */}
            <div className="bg-white rounded-3xl border border-[#E9E8E0] p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-[#17170F]">Quick actions</h2>

              <div className="space-y-2.5">
                {/* Change plan */}
                <button
                  disabled={isClosed}
                  onClick={() => setShowChangePlanModal(true)}
                  className="w-full p-3.5 rounded-2xl border border-[#EAE8E0] hover:border-[#5FA618] hover:bg-[#FAF9F5] transition text-left flex items-center justify-between group disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#F3F8EC] text-[#5FA618] flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#17170F]">Change plan</p>
                      <p className="text-[10px] text-[#73756C]">Adjust daily, weekly or monthly target</p>
                    </div>
                  </div>
                  <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
                </button>

                {/* Edit goal details */}
                <button
                  disabled={isClosed}
                  onClick={() => setShowEditModal(true)}
                  className="w-full p-3.5 rounded-2xl border border-[#EAE8E0] hover:border-[#5FA618] hover:bg-[#FAF9F5] transition text-left flex items-center justify-between group disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#F3F8EC] text-[#5FA618] flex items-center justify-center">
                      <Edit3 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#17170F]">Edit goal details</p>
                      <p className="text-[10px] text-[#73756C]">Update name, target or deadline</p>
                    </div>
                  </div>
                  <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
                </button>

                {/* Pause goal */}
                <button
                  disabled={isClosed}
                  onClick={handleTogglePause}
                  className="w-full p-3.5 rounded-2xl border border-[#EAE8E0] hover:border-amber-400 hover:bg-amber-50/50 transition text-left flex items-center justify-between group disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      {isPaused ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#17170F]">
                        {isPaused ? "Resume goal" : "Pause goal"}
                      </p>
                      <p className="text-[10px] text-[#73756C]">
                        {isPaused ? "Re-enable deposits & notifications" : "Take a break without losing progress"}
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
                </button>

                {/* Close goal */}
                <button
                  disabled={isClosed}
                  onClick={() => setShowCloseModal(true)}
                  className="w-full p-3.5 rounded-2xl border border-red-200 bg-red-50/30 hover:bg-red-50 hover:border-red-300 transition text-left flex items-center justify-between group disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-red-600">Close goal</p>
                      <p className="text-[10px] text-red-500">Withdraw and end this goal</p>
                    </div>
                  </div>
                  <span className="text-red-400 group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>

            {/* SAVINGS TIP CARD */}
            {showTip && (
              <div className="bg-[#F7FAEE] border border-[#E5EED8] rounded-3xl p-4 relative space-y-2">
                <button
                  onClick={() => setShowTip(false)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xs"
                >
                  ✕
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#5FA618] text-white flex items-center justify-center shrink-0">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-[#17170F]">Savings tip</h3>
                </div>
                <p className="text-xs text-[#595B52] leading-relaxed">
                  Automate small, regular deposits. Consistency beats big, one-time payments.
                </p>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* ── MODAL 1: SIMULATE DEPOSIT ────────────────────── */}
      <AnimatePresence>
        {showDepositModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-[#E9E8E0]"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-extrabold text-[#17170F]">Simulate Bank Deposit</h3>
                <button onClick={() => setShowDepositModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleDeposit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#17170F] mb-1">Transfer Amount (₦)</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full rounded-xl border border-[#D5D4CA] bg-white p-3 text-sm font-bold font-mono text-[#17170F] focus:outline-none focus:ring-2 focus:ring-[#5FA618]"
                    placeholder="15000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17170F] mb-1">Select Contributor</label>
                  <select
                    value={contributorUser}
                    onChange={(e) => {
                      setContributorUser(e.target.value);
                      if (e.target.value === user?.id) {
                        setContributorName(user.name);
                      }
                    }}
                    className="w-full rounded-xl border border-[#D5D4CA] bg-white p-3 text-xs font-medium text-[#17170F] focus:outline-none focus:ring-2 focus:ring-[#5FA618]"
                  >
                    <option value={user?.id || "u_creator"}>{user?.name || "Tolu Adeyemi"} (You)</option>
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
                      className="w-full rounded-xl border border-[#D5D4CA] bg-white p-3 text-xs text-[#17170F] focus:outline-none focus:ring-2 focus:ring-[#5FA618]"
                      placeholder="Enter contributor name"
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDepositModal(false)}
                    className="flex-1 rounded-2xl border border-gray-200 py-3 text-xs font-bold text-[#17170F]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !depositAmount}
                    className="flex-1 rounded-2xl bg-[#5FA618] py-3 text-xs font-bold text-white hover:bg-[#529113] disabled:opacity-50"
                  >
                    {loading ? "Processing..." : "Confirm Deposit 💸"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 2: CHANGE PLAN ─────────────────────────── */}
      <AnimatePresence>
        {showChangePlanModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-[#E9E8E0]"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-extrabold text-[#17170F]">Change Savings Plan</h3>
                <button onClick={() => setShowChangePlanModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#17170F] mb-1.5">Select Frequency</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["daily", "weekly", "monthly", "yearly"] as Frequency[]).map((f) => {
                      const isDisabled =
                        (f === "yearly" && (maxFreq === "daily" || maxFreq === "weekly" || maxFreq === "monthly")) ||
                        (f === "monthly" && (maxFreq === "daily" || maxFreq === "weekly")) ||
                        (f === "weekly" && maxFreq === "daily");
                      return (
                        <button
                          key={f}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => setEditFrequency(f)}
                          className={cn(
                            "py-2.5 px-3 rounded-xl border text-xs font-bold capitalize transition",
                            editFrequency === f
                              ? "bg-[#5FA618] text-white border-[#5FA618]"
                              : isDisabled
                              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                              : "bg-white text-[#17170F] border-gray-200 hover:bg-gray-50"
                          )}
                        >
                          {f}
                        </button>
                      );
                    })}
                  </div>
                  {maxFreq !== "yearly" && (
                    <p className="text-[10px] text-amber-700 mt-2">
                      ⚠️ Options restricted based on deadline duration ({days} days left).
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowChangePlanModal(false)}
                    className="flex-1 rounded-2xl border border-gray-200 py-3 text-xs font-bold text-[#17170F]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleUpdateGoal({ frequency: editFrequency })}
                    className="flex-1 rounded-2xl bg-[#5FA618] py-3 text-xs font-bold text-white hover:bg-[#529113] disabled:opacity-50"
                  >
                    {loading ? "Updating..." : "Save Plan"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 3: EDIT GOAL DETAILS ───────────────────── */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-[#E9E8E0]"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-extrabold text-[#17170F]">Edit Goal Details</h3>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#17170F] mb-1">Goal Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded-xl border border-[#D5D4CA] bg-white p-3 text-xs font-bold text-[#17170F] focus:outline-none focus:ring-2 focus:ring-[#5FA618]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17170F] mb-1">Target Amount (₦)</label>
                  <input
                    type="number"
                    value={editTarget}
                    onChange={(e) => setEditTarget(e.target.value)}
                    className="w-full rounded-xl border border-[#D5D4CA] bg-white p-3 text-xs font-bold font-mono text-[#17170F] focus:outline-none focus:ring-2 focus:ring-[#5FA618]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17170F] mb-1">Target Deadline</label>
                  <input
                    type="date"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    className="w-full rounded-xl border border-[#D5D4CA] bg-white p-3 text-xs font-bold text-[#17170F] focus:outline-none focus:ring-2 focus:ring-[#5FA618]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 rounded-2xl border border-gray-200 py-3 text-xs font-bold text-[#17170F]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={loading || !editTitle.trim()}
                    onClick={() =>
                      handleUpdateGoal({
                        title: editTitle,
                        targetAmount: Number(editTarget),
                        deadline: editDeadline,
                      })
                    }
                    className="flex-1 rounded-2xl bg-[#5FA618] py-3 text-xs font-bold text-white hover:bg-[#529113] disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Update Details"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 4: CLOSE GOAL ──────────────────────────── */}
      <AnimatePresence>
        {showCloseModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-red-200 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto text-xl">
                ⚠️
              </div>
              <h3 className="text-lg font-extrabold text-[#17170F]">Close Goal &amp; Withdraw Funds?</h3>
              <p className="text-xs text-[#595B52] leading-relaxed">
                Closing this goal will immediately process your total accumulated balance of{" "}
                <strong className="text-[#17170F]">{formatNaira(saved)}</strong> back to your linked payout bank account.
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCloseModal(false)}
                  className="flex-1 rounded-2xl border border-gray-200 py-3 text-xs font-bold text-[#17170F]"
                >
                  Keep Goal Active
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleCloseGoal}
                  className="flex-1 rounded-2xl bg-red-600 py-3 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? "Closing..." : "Close & Withdraw 💸"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 5: SHARE GOAL ─────────────────────────── */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-[#E9E8E0]"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-extrabold text-[#17170F]">Share Goal Account</h3>
                <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-[#73756C]">
                Anyone can send deposits directly to your dedicated virtual account using any mobile banking app in Nigeria!
              </p>

              <div className="bg-[#F8FAF4] border border-[#E5EED8] rounded-2xl p-4 space-y-1 text-center">
                <p className="text-xs text-[#73756C]">{bankName}</p>
                <p className="text-2xl font-black text-[#17170F] font-mono tracking-wider">{accountNumber}</p>
                <p className="text-[11px] font-semibold text-[#5FA618]">Narration: {goal.title}</p>
              </div>

              <button
                onClick={handleCopyAccount}
                className="w-full py-3 rounded-2xl bg-[#17170F] text-white text-xs font-bold hover:bg-black transition flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Account Details
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 6: ADD MEMBER ─────────────────────────── */}
      <AnimatePresence>
        {showAddMemberModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-[#E9E8E0]"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-extrabold text-[#17170F] flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#5FA618]" />
                  Add Member to Goal
                </h3>
                <button onClick={() => setShowAddMemberModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-[#73756C]">
                Invite a friend or partner to save towards this target. If this is a personal goal, adding a member automatically converts it into a shared Group Goal.
              </p>

              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#17170F] mb-1">
                    Member Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amaka Okafor"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#17170F] focus:outline-none focus:border-[#5FA618]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17170F] mb-1">
                    Email or Phone (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. amaka@example.com or 08012345678"
                    value={newMemberContact}
                    onChange={(e) => setNewMemberContact(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#17170F] focus:outline-none focus:border-[#5FA618]"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddMemberModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-[#17170F] hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-[#5FA618] text-white text-xs font-bold hover:bg-[#4E8B13] transition disabled:opacity-50"
                  >
                    {loading ? "Adding..." : "Add Member"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
