/**
 * Demo seed data — used when Supabase is not yet wired up.
 * All IDs are stable so linking between pages works correctly.
 */
import type {
  User,
  Goal,
  GoalMember,
  Contribution,
  WithdrawalRequest,
  WithdrawalVote,
  Payout,
} from "./types";

/* ── Users ─────────────────────────────────────────────────── */
export const USERS: User[] = [
  {
    id: "u-tolu",
    name: "Tolu Adeyemi",
    phone: "+2348100000001",
    email: "tolu@example.com",
    kycStatus: "active",
    bankAccountNumber: "0123456789",
    bankCode: "058",
    bankName: "GTBank",
    avatarColor: "#8cc63f",
    createdAt: "2026-08-20T10:00:00Z",
  },
  {
    id: "u-kemi",
    name: "Kemi Balogun",
    phone: "+2348100000002",
    email: "kemi@example.com",
    kycStatus: "active",
    bankAccountNumber: "9876543210",
    bankCode: "011",
    bankName: "First Bank",
    avatarColor: "#f3c449",
    createdAt: "2026-08-20T10:05:00Z",
  },
  {
    id: "u-jide",
    name: "Jide Okonkwo",
    phone: "+2348100000003",
    email: "jide@example.com",
    kycStatus: "active",
    bankAccountNumber: "1122334455",
    bankCode: "033",
    bankName: "UBA",
    avatarColor: "#ee6f57",
    createdAt: "2026-08-20T10:10:00Z",
  },
];

export const USERS_MAP = new Map(USERS.map((u) => [u.id, u]));

/* ── Goals ──────────────────────────────────────────────────── */
export const GOALS: Goal[] = [
  {
    id: "g-phone",
    title: "New Phone",
    type: "individual",
    targetAmount: 150_000,
    deadline: "2026-12-01",
    frequency: "monthly",
    installmentAmount: 25_000,
    ownerId: "u-tolu",
    virtualAccountNumber: "3040506070",
    virtualAccountBank: "Providus Bank",
    status: "active",
    emoji: "📱",
    createdAt: "2026-08-20T11:00:00Z",
  },
  {
    id: "g-projector",
    title: "Departmental Projector",
    type: "group",
    targetAmount: 200_000,
    deadline: "2026-09-06",
    frequency: "weekly",
    installmentAmount: 67_000,
    ownerId: "u-tolu",
    virtualAccountNumber: "3040506071",
    virtualAccountBank: "Providus Bank",
    status: "active",
    emoji: "🎥",
    createdAt: "2026-08-21T09:00:00Z",
  },
  {
    id: "g-leaving",
    title: "Leaving Dinner",
    type: "group",
    targetAmount: 80_000,
    deadline: "2026-09-20",
    frequency: "weekly",
    installmentAmount: 27_000,
    ownerId: "u-kemi",
    virtualAccountNumber: "3040506072",
    virtualAccountBank: "Providus Bank",
    status: "active",
    emoji: "🍽️",
    createdAt: "2026-08-22T14:00:00Z",
  },
];

/* ── Goal Members ────────────────────────────────────────────── */
export const GOAL_MEMBERS: GoalMember[] = [
  // Projector — Tolu (admin), Kemi, Jide
  { id: "gm-1", goalId: "g-projector", userId: "u-tolu", role: "admin", joinedAt: "2026-08-21T09:00:00Z" },
  { id: "gm-2", goalId: "g-projector", userId: "u-kemi", role: "member", joinedAt: "2026-08-21T10:00:00Z" },
  { id: "gm-3", goalId: "g-projector", userId: "u-jide", role: "member", joinedAt: "2026-08-21T11:00:00Z" },
  // Leaving Dinner — Kemi (admin), Tolu, Jide
  { id: "gm-4", goalId: "g-leaving", userId: "u-kemi", role: "admin", joinedAt: "2026-08-22T14:00:00Z" },
  { id: "gm-5", goalId: "g-leaving", userId: "u-tolu", role: "member", joinedAt: "2026-08-22T15:00:00Z" },
  { id: "gm-6", goalId: "g-leaving", userId: "u-jide", role: "member", joinedAt: "2026-08-22T16:00:00Z" },
];

/* ── Contributions ───────────────────────────────────────────── */
export const CONTRIBUTIONS: Contribution[] = [
  // Phone (individual)
  { id: "c-1", goalId: "g-phone", contributorName: "Tolu Adeyemi", contributorUserId: "u-tolu", amount: 25_000, receivedAt: "2026-08-25T09:00:00Z" },
  { id: "c-2", goalId: "g-phone", contributorName: "Tolu Adeyemi", contributorUserId: "u-tolu", amount: 25_000, receivedAt: "2026-09-01T09:00:00Z" },
  { id: "c-3", goalId: "g-phone", contributorName: "Tolu Adeyemi", contributorUserId: "u-tolu", amount: 10_000, receivedAt: "2026-09-03T09:00:00Z" },
  // Projector (group)
  { id: "c-4", goalId: "g-projector", contributorName: "Tolu Adeyemi", contributorUserId: "u-tolu", amount: 80_000, receivedAt: "2026-08-28T10:00:00Z" },
  { id: "c-5", goalId: "g-projector", contributorName: "Kemi Balogun", contributorUserId: "u-kemi", amount: 70_000, receivedAt: "2026-08-28T11:00:00Z" },
  { id: "c-6", goalId: "g-projector", contributorName: "Jide Okonkwo", contributorUserId: "u-jide", amount: 30_000, receivedAt: "2026-08-29T12:00:00Z" },
  // Leaving Dinner (group — quorum scenario)
  { id: "c-7", goalId: "g-leaving", contributorName: "Kemi Balogun", contributorUserId: "u-kemi", amount: 15_000, receivedAt: "2026-08-23T10:00:00Z" },
  { id: "c-8", goalId: "g-leaving", contributorName: "Tolu Adeyemi", contributorUserId: "u-tolu", amount: 20_000, receivedAt: "2026-08-24T10:00:00Z" },
  { id: "c-9", goalId: "g-leaving", contributorName: "Jide Okonkwo", contributorUserId: "u-jide", amount: 12_000, receivedAt: "2026-08-25T10:00:00Z" },
];

/* ── Withdrawal requests (Leaving Dinner — quorum in progress) ─ */
export const WITHDRAWAL_REQUESTS: WithdrawalRequest[] = [
  {
    id: "wr-1",
    goalId: "g-leaving",
    requestedBy: "u-jide",
    reason: "Plans have changed — venue fell through and we can't reschedule before the deadline.",
    status: "pending",
    quorumRequired: 2,
    createdAt: "2026-09-02T14:00:00Z",
  },
];

export const WITHDRAWAL_VOTES: WithdrawalVote[] = [
  // Only Jide voted so far — quorum not yet met (need 2 + admin)
  { id: "wv-1", requestId: "wr-1", voterId: "u-jide", vote: true, votedAt: "2026-09-02T14:05:00Z" },
];

/* ── Payouts ─────────────────────────────────────────────────── */
export const PAYOUTS: Payout[] = [];

/* ── Helpers ─────────────────────────────────────────────────── */
export function getGoal(id: string) {
  return GOALS.find((g) => g.id === id) ?? null;
}

export function getGoalMembers(goalId: string) {
  return GOAL_MEMBERS.filter((m) => m.goalId === goalId);
}

export function getContributions(goalId: string) {
  return CONTRIBUTIONS.filter((c) => c.goalId === goalId);
}

export function getTotalSaved(goalId: string) {
  return getContributions(goalId).reduce((s, c) => s + c.amount, 0);
}

export function getWithdrawalRequest(goalId: string) {
  return WITHDRAWAL_REQUESTS.find((r) => r.goalId === goalId) ?? null;
}

export function getWithdrawalVotes(requestId: string) {
  return WITHDRAWAL_VOTES.filter((v) => v.requestId === requestId);
}
