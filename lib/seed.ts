import type {
  Contribution,
  Goal,
  GoalMember,
  Payout,
  Session,
  User,
  WithdrawalRequest,
  WithdrawalVote,
} from "./types";
import { quorumRequired } from "./quorum";

/* — relative-time helpers so the seed always looks "live" whenever the demo runs — */
const now = () => Date.now();
const iso = (ms: number) => new Date(ms).toISOString();
const HOUR = 3600_000;
const DAY = 24 * HOUR;
const hoursAgo = (h: number) => iso(now() - h * HOUR);
const daysAgo = (d: number) => iso(now() - d * DAY);
const daysFromNow = (d: number) => iso(now() + d * DAY);

/** Default demo user ID fallback if needed */
export const CURRENT_USER_ID = "u_default";

export interface StoreData {
  users: User[];
  sessions: Session[];
  goals: Goal[];
  members: GoalMember[];
  contributions: Contribution[];
  withdrawalRequests: WithdrawalRequest[];
  withdrawalVotes: WithdrawalVote[];
  payouts: Payout[];
  streak: { days: number; week: boolean[] };
}

export function createSeedData(): StoreData {
  return {
    users: [],
    sessions: [],
    goals: [],
    members: [],
    contributions: [],
    withdrawalRequests: [],
    withdrawalVotes: [],
    payouts: [],
    streak: { days: 0, week: [false, false, false, false, false, false, false] },
  };
}

export function createDemoSeedData(): StoreData {
  const users: User[] = [
    {
      id: "u_tolu",
      name: "Tolu Adeyemi",
      phone: "+2348012345678",
      email: "tolu@example.com",
      bmoniUserId: "bmoni_tolu",
      smartWalletId: "wallet_tolu",
      walletAddress: "0x9Af3…21bC",
      kycStatus: "active",
      bankAccountNumber: "0123456789",
      bankCode: "058",
      bankName: "GTBank",
      avatarColor: "#8cc63f",
      createdAt: daysAgo(60),
    },
    mk("u_amaka", "Amaka Obi", "#ee6f57"),
    mk("u_bayo", "Bayo Ade", "#f3c449"),
    mk("u_chinedu", "Chinedu Eze", "#4a59a0"),
    mk("u_ngozi", "Ngozi Ali", "#6fa62f"),
    mk("u_emeka", "Emeka Nwosu", "#c77dff"),
    mk("u_kemi", "Kemi Sanni", "#38b6a6"),
    mk("u_jide", "Jide Cole", "#e8956b"),
  ];

  const goals: Goal[] = [
    {
      id: "g_macbook",
      title: "MacBook Air",
      type: "individual",
      targetAmount: 480_000,
      deadline: daysFromNow(19),
      frequency: "daily",
      installmentAmount: 7_077,
      ownerId: "u_tolu",
      virtualAccountNumber: "9906123456",
      virtualAccountBank: "Providus Bank",
      status: "active",
      emoji: "💻",
      createdAt: daysAgo(35),
    },
    {
      id: "g_projector",
      title: "Department Projector",
      type: "group",
      targetAmount: 300_000,
      deadline: daysFromNow(41),
      frequency: "weekly",
      installmentAmount: 12_500,
      ownerId: "u_tolu",
      virtualAccountNumber: "9906222333",
      virtualAccountBank: "Providus Bank",
      status: "active",
      emoji: "📽️",
      createdAt: daysAgo(28),
    },
    {
      id: "g_detty",
      title: "Detty December Trip",
      type: "group",
      targetAmount: 360_000,
      deadline: daysFromNow(64),
      frequency: "monthly",
      installmentAmount: 45_000,
      ownerId: "u_tolu",
      virtualAccountNumber: "9906444555",
      virtualAccountBank: "Providus Bank",
      status: "active",
      emoji: "🏝️",
      createdAt: daysAgo(21),
    },
    {
      id: "g_school",
      title: "School Fees",
      type: "individual",
      targetAmount: 150_000,
      deadline: daysFromNow(32),
      frequency: "weekly",
      installmentAmount: 4_840,
      ownerId: "u_tolu",
      virtualAccountNumber: "9906666777",
      virtualAccountBank: "Providus Bank",
      status: "active",
      emoji: "🎓",
      createdAt: daysAgo(24),
    },
  ];

  const members: GoalMember[] = [
    // Department Projector — 8 contributors
    gm("g_projector", "u_tolu", "admin", 28),
    gm("g_projector", "u_amaka", "member", 26),
    gm("g_projector", "u_bayo", "member", 25),
    gm("g_projector", "u_chinedu", "member", 24),
    gm("g_projector", "u_ngozi", "member", 22),
    gm("g_projector", "u_emeka", "member", 20),
    gm("g_projector", "u_kemi", "member", 18),
    gm("g_projector", "u_jide", "member", 16),
    // Detty December Trip — 6 members
    gm("g_detty", "u_tolu", "admin", 21),
    gm("g_detty", "u_amaka", "member", 20),
    gm("g_detty", "u_bayo", "member", 19),
    gm("g_detty", "u_chinedu", "member", 18),
    gm("g_detty", "u_ngozi", "member", 17),
    gm("g_detty", "u_emeka", "member", 16),
  ];

  const contributions: Contribution[] = [
    // MacBook Air (solo, but a friend chipped in via the link) → 345,600
    c("g_macbook", "Tolu Adeyemi", "u_tolu", 150_000, daysAgo(30)),
    c("g_macbook", "Tolu Adeyemi", "u_tolu", 100_000, daysAgo(18)),
    c("g_macbook", "Tolu Adeyemi", "u_tolu", 88_600, daysAgo(7)),
    c("g_macbook", "Bayo Ade", "u_bayo", 7_000, hoursAgo(22)),
    // Department Projector → 180,000 across 8 contributors
    c("g_projector", "Amaka Obi", "u_amaka", 20_000, daysAgo(5)),
    c("g_projector", "Amaka Obi", "u_amaka", 10_000, hoursAgo(2)),
    c("g_projector", "Tolu Adeyemi", "u_tolu", 17_500, daysAgo(4)),
    c("g_projector", "Tolu Adeyemi", "u_tolu", 5_000, hoursAgo(5)),
    c("g_projector", "Bayo Ade", "u_bayo", 25_000, daysAgo(6)),
    c("g_projector", "Chinedu Eze", "u_chinedu", 20_000, daysAgo(7)),
    c("g_projector", "Ngozi Ali", "u_ngozi", 25_000, daysAgo(3)),
    c("g_projector", "Emeka Nwosu", "u_emeka", 20_000, daysAgo(8)),
    c("g_projector", "Kemi Sanni", "u_kemi", 20_000, daysAgo(9)),
    c("g_projector", "Jide Cole", "u_jide", 17_500, daysAgo(10)),
    // Detty December Trip → 145,000 across 6 members (the emergency-refund pool)
    c("g_detty", "Amaka Obi", "u_amaka", 35_000, daysAgo(15)),
    c("g_detty", "Tolu Adeyemi", "u_tolu", 30_000, daysAgo(14)),
    c("g_detty", "Bayo Ade", "u_bayo", 25_000, daysAgo(13)),
    c("g_detty", "Chinedu Eze", "u_chinedu", 20_000, daysAgo(12)),
    c("g_detty", "Ngozi Ali", "u_ngozi", 20_000, daysAgo(11)),
    c("g_detty", "Emeka Nwosu", "u_emeka", 15_000, daysAgo(9)),
    // School Fees (solo) → 96,800
    c("g_school", "Tolu Adeyemi", "u_tolu", 50_000, daysAgo(20)),
    c("g_school", "Tolu Adeyemi", "u_tolu", 46_800, daysAgo(6)),
  ];

  // Emergency withdrawal on Detty December — seeded ONE vote below quorum so the
  // admin (our demo user) can cast the deciding vote live and unlock refunds.
  const wr: WithdrawalRequest = {
    id: "wr_detty",
    goalId: "g_detty",
    requestedBy: "u_amaka",
    reason: "The trip fell through — let's get everyone's money back fairly.",
    status: "pending",
    quorumRequired: quorumRequired(6), // = 4
    createdAt: daysAgo(1),
  };

  const withdrawalVotes: WithdrawalVote[] = [
    v("wr_detty", "u_amaka", true, daysAgo(1)), // requester auto-approves
    v("wr_detty", "u_bayo", true, hoursAgo(20)),
    v("wr_detty", "u_chinedu", true, hoursAgo(9)),
    // u_tolu (admin), u_ngozi, u_emeka have NOT voted → 3/6, below quorum of 4
  ];

  return {
    users,
    sessions: [],
    goals,
    members,
    contributions,
    withdrawalRequests: [wr],
    withdrawalVotes,
    payouts: [],
    streak: { days: 12, week: [true, true, true, true, true, true, false] },
  };
}

/* — tiny record builders — */
let seq = 0;
const nid = (p: string) => `${p}_${(++seq).toString(36)}`;

function mk(id: string, name: string, color: string): User {
  return {
    id,
    name,
    kycStatus: "none",
    avatarColor: color,
    createdAt: daysAgo(40),
  };
}

function gm(
  goalId: string,
  userId: string,
  role: "admin" | "member",
  daysJoinedAgo: number,
): GoalMember {
  return { id: nid("gm"), goalId, userId, role, joinedAt: daysAgo(daysJoinedAgo) };
}

function c(
  goalId: string,
  contributorName: string,
  contributorUserId: string | undefined,
  amount: number,
  receivedAt: string,
): Contribution {
  return {
    id: nid("c"),
    goalId,
    contributorName,
    contributorUserId,
    amount,
    bmoniReference: `TRX_${Date.now().toString(36)}_${(++seq).toString(36)}`,
    receivedAt,
  };
}

function v(
  requestId: string,
  voterId: string,
  vote: boolean,
  votedAt: string,
): WithdrawalVote {
  return { id: nid("v"), requestId, voterId, vote, votedAt };
}

