import { bmoni } from "./bmoni";
import { installmentFor } from "./calculator";
import { evaluateQuorum, quorumRequired, type QuorumState } from "./quorum";
import { computeRefunds, membersAsUsers } from "./refund";
import { CURRENT_USER_ID, createSeedData, type StoreData } from "./seed";
import type {
  Contribution,
  Frequency,
  Goal,
  GoalMember,
  GoalStats,
  GoalType,
  MemberShare,
  Payout,
  Session,
  User,
  WithdrawalRequest,
  WithdrawalVote,
} from "./types";

/* ---------------------------------------------------------------------------
 * Persistent storage with disk synchronization.
 * Data survives dev HMR, page reloads, and server restarts.
 * ------------------------------------------------------------------------- */
function getFs() {
  if (typeof window !== "undefined") return null;
  try {
    // Dynamic runtime require prevents Turbopack from bundling fs into client components
    const req = eval("require");
    return {
      fs: req("fs"),
      path: req("path"),
    };
  } catch {
    return null;
  }
}

function loadStoreFromDisk(): StoreData | null {
  const nodeMods = getFs();
  if (!nodeMods) return null;
  try {
    const { fs, path } = nodeMods;
    const dataDir = path.join(process.cwd(), "data");
    const dataFile = path.join(dataDir, "store.json");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (fs.existsSync(dataFile)) {
      const raw = fs.readFileSync(dataFile, "utf-8");
      const parsed = JSON.parse(raw);
      if (!parsed.sessions) parsed.sessions = [];
      return parsed;
    }
  } catch (err) {
    console.error("Failed to load store from disk:", err);
  }
  return null;
}

export function saveToDisk(data: StoreData): void {
  const nodeMods = getFs();
  if (!nodeMods) return;
  try {
    const { fs, path } = nodeMods;
    const dataDir = path.join(process.cwd(), "data");
    const dataFile = path.join(dataDir, "store.json");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save store to disk:", err);
  }
}

const g = globalThis as unknown as { __stashDB?: StoreData };
function db(): StoreData {
  if (!g.__stashDB) {
    const fromDisk = loadStoreFromDisk();
    if (fromDisk) {
      g.__stashDB = fromDisk;
    } else {
      g.__stashDB = createSeedData();
      saveToDisk(g.__stashDB);
    }
  }
  return g.__stashDB;
}

let idSeq = 1000;
const genId = (p: string) => `${p}_${(++idSeq).toString(36)}${Date.now().toString(36).slice(-3)}`;

/* — identity — */
export function upsertUser(user: Partial<User> & { id: string; name: string }): User {
  const existing = db().users.find((u) => u.id === user.id);
  if (existing) {
    Object.assign(existing, user);
    saveToDisk(db());
    return existing;
  }
  const newUser: User = {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    passwordHash: user.passwordHash,
    bmoniUserId: user.bmoniUserId,
    bmoniError: user.bmoniError,
    smartWalletId: user.smartWalletId,
    walletAddress: user.walletAddress,
    kycStatus: user.kycStatus ?? (user.bmoniUserId ? "active" : "none"),
    bankAccountNumber: user.bankAccountNumber,
    bankCode: user.bankCode,
    bankName: user.bankName,
    avatarColor: user.avatarColor ?? "#8cc63f",
    createdAt: user.createdAt ?? new Date().toISOString(),
  };
  db().users.push(newUser);
  saveToDisk(db());
  return newUser;
}

export function getUserByEmailOrPhone(identifier: string): User | undefined {
  const norm = identifier.trim().toLowerCase();
  const digits = identifier.replace(/[^\d]/g, "");
  return db().users.find((u) => {
    if (u.email && u.email.toLowerCase() === norm) return true;
    if (u.phone) {
      if (u.phone === identifier.trim()) return true;
      if (digits && u.phone.replace(/[^\d]/g, "") === digits) return true;
    }
    return false;
  });
}

/* — sessions — */
export function saveSession(session: Session): void {
  const list = db().sessions;
  const existingIndex = list.findIndex((s) => s.token === session.token);
  if (existingIndex !== -1) {
    list[existingIndex] = session;
  } else {
    list.push(session);
  }
  saveToDisk(db());
}

export function getSession(token: string): Session | undefined {
  return db().sessions.find((s) => s.token === token);
}

export function deleteSession(token: string): void {
  const list = db().sessions;
  const idx = list.findIndex((s) => s.token === token);
  if (idx !== -1) {
    list.splice(idx, 1);
    saveToDisk(db());
  }
}


export function currentUser(): User {
  return (
    getUser(CURRENT_USER_ID) ||
    db().users[0] || {
      id: "u_default",
      name: "Aidex User",
      kycStatus: "active",
      avatarColor: "#8cc63f",
      createdAt: new Date().toISOString(),
    }
  );
}
export function getUser(id: string): User | undefined {
  return db().users.find((u) => u.id === id);
}
export function usersMap(): Map<string, User> {
  return new Map(db().users.map((u) => [u.id, u]));
}
export function allUsers(): User[] {
  return db().users;
}

/* — goals — */
export function getGoal(id: string): Goal | undefined {
  return db().goals.find((x) => x.id === id);
}

export function listGoalsForUser(userId: string): Goal[] {
  const memberGoalIds = new Set(
    db().members.filter((m) => m.userId === userId).map((m) => m.goalId),
  );
  return db()
    .goals.filter((x) => x.ownerId === userId || memberGoalIds.has(x.id))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function goalContributions(goalId: string): Contribution[] {
  return db()
    .contributions.filter((x) => x.goalId === goalId)
    .sort((a, b) => (a.receivedAt < b.receivedAt ? 1 : -1));
}

export function goalSaved(goalId: string): number {
  return db()
    .contributions.filter((x) => x.goalId === goalId)
    .reduce((s, x) => s + x.amount, 0);
}

export function goalMembers(goalId: string): GoalMember[] {
  return db().members.filter((m) => m.goalId === goalId);
}

export function memberUsers(goalId: string): User[] {
  const map = usersMap();
  return goalMembers(goalId)
    .map((m) => map.get(m.userId))
    .filter((u): u is User => Boolean(u));
}

export function contributorCount(goalId: string): number {
  const names = new Set(
    db()
      .contributions.filter((x) => x.goalId === goalId)
      .map((x) => x.contributorUserId ?? x.contributorName),
  );
  return names.size;
}

export function contributedBy(goalId: string, userId: string): number {
  return db()
    .contributions.filter((x) => x.goalId === goalId && x.contributorUserId === userId)
    .reduce((s, x) => s + x.amount, 0);
}

export function goalStats(goalId: string): GoalStats {
  const goal = getGoal(goalId)!;
  const saved = goalSaved(goalId);
  const remaining = Math.max(0, goal.targetAmount - saved);
  const progress = Math.min(100, Math.round((saved / goal.targetAmount) * 100));
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86_400_000),
  );
  return { saved, progress, contributorCount: contributorCount(goalId), daysLeft, remaining };
}

/* — withdrawals / quorum / refunds — */
export function activeWithdrawal(goalId: string): WithdrawalRequest | undefined {
  return db().withdrawalRequests.find(
    (r) => r.goalId === goalId && r.status === "pending",
  );
}
export function latestWithdrawal(goalId: string): WithdrawalRequest | undefined {
  return db()
    .withdrawalRequests.filter((r) => r.goalId === goalId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];
}
export function votesFor(requestId: string): WithdrawalVote[] {
  return db().withdrawalVotes.filter((v) => v.requestId === requestId);
}
export function quorumFor(goalId: string): QuorumState | undefined {
  const req = latestWithdrawal(goalId);
  if (!req) return undefined;
  return evaluateQuorum(goalMembers(goalId), votesFor(req.id));
}

/** Proportional refund breakdown against the goal's current balance. */
export function refundBreakdown(goalId: string): MemberShare[] {
  const users = usersMap();
  const memberList = membersAsUsers(goalMembers(goalId), users);
  return computeRefunds(memberList, goalContributions(goalId), goalSaved(goalId));
}

export function hasVoted(requestId: string, userId: string): WithdrawalVote | undefined {
  return db().withdrawalVotes.find((v) => v.requestId === requestId && v.voterId === userId);
}

/* — payouts — */
export function payoutsForGoal(goalId: string): Payout[] {
  return db().payouts.filter((p) => p.goalId === goalId);
}
export function payoutsForUser(userId: string): Payout[] {
  return db().payouts.filter((p) => p.recipientUserId === userId);
}

/* — dashboard aggregates — */
export function dashboardSummary(userId: string) {
  const goals = listGoalsForUser(userId);
  let totalSaved = 0;
  for (const goal of goals) {
    totalSaved +=
      goal.type === "individual" && goal.ownerId === userId
        ? goalSaved(goal.id)
        : contributedBy(goal.id, userId);
  }

  const cutoff = Date.now() - 30 * 86_400_000;
  const thisMonth = db()
    .contributions.filter(
      (x) => x.contributorUserId === userId && new Date(x.receivedAt).getTime() >= cutoff,
    )
    .reduce((s, x) => s + x.amount, 0);

  const groupGoalIds = goals.filter((x) => x.type === "group").map((x) => x.id);
  const groupContribs = db().contributions.filter((x) => groupGoalIds.includes(x.goalId));
  const groupContributions = groupContribs.reduce((s, x) => s + x.amount, 0);
  const groupContributors = new Set(
    groupContribs.map((x) => x.contributorUserId ?? x.contributorName),
  ).size;

  const payoutsReceived = payoutsForUser(userId).reduce((s, p) => s + p.amount, 0);

  return {
    totalSaved,
    goalCount: goals.length,
    thisMonth,
    thisMonthDeltaPct: thisMonth > 0 ? 100 : 0,
    groupContributions,
    groupContributors,
    payoutsReceived,
  };
}

/** Simple on-track heuristic: are you ahead of the straight-line pace? */
export function onTrackSummary(userId: string) {
  const goals = listGoalsForUser(userId).filter((x) => x.status === "active");
  let onTrack = 0;
  for (const goal of goals) {
    const created = new Date(goal.createdAt).getTime();
    const due = new Date(goal.deadline).getTime();
    const elapsed = (Date.now() - created) / Math.max(1, due - created);
    const progress = goalSaved(goal.id) / goal.targetAmount;
    if (progress >= Math.min(1, elapsed) * 0.9) onTrack++;
  }
  return { onTrack, total: goals.length };
}

export interface ActivityItem {
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

export function recentActivity(userId: string, limit = 8): ActivityItem[] {
  const goalIds = new Set(listGoalsForUser(userId).map((x) => x.id));
  const titleOf = (id: string) => getGoal(id)?.title ?? "Goal";
  const items: ActivityItem[] = [];

  for (const x of db().contributions) {
    if (!goalIds.has(x.goalId)) continue;
    items.push({
      id: x.id,
      kind: "contribution",
      actorName: x.contributorUserId === userId ? `${x.contributorName.split(" ")[0]} (you)` : x.contributorName,
      actorUserId: x.contributorUserId,
      goalId: x.goalId,
      goalTitle: titleOf(x.goalId),
      amount: x.amount,
      at: x.receivedAt,
    });
  }
  for (const p of db().payouts) {
    if (!goalIds.has(p.goalId)) continue;
    items.push({
      id: p.id,
      kind: "payout",
      actorName: p.type === "emergency_refund" ? "Refund" : "Payout",
      goalId: p.goalId,
      goalTitle: titleOf(p.goalId),
      amount: p.amount,
      at: p.createdAt,
      note: p.bmoniStatus,
    });
  }

  return items.sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, limit);
}

export function getStreak(userId?: string) {
  if (userId) {
    const userContribs = db().contributions.filter((c) => c.contributorUserId === userId);
    if (userContribs.length === 0) {
      return { days: 0, week: [false, false, false, false, false, false, false] };
    }
  }
  return db().streak;
}

/* ===========================================================================
 * MUTATORS — called only from server actions (lib/actions.ts).
 * ========================================================================= */

export async function createGoal(input: {
  title: string;
  type: GoalType;
  targetAmount: number;
  deadline: string;
  frequency: Frequency;
  emoji?: string;
  ownerId?: string;
  ownerName?: string;
}): Promise<Goal> {
  const ownerId = input.ownerId ?? CURRENT_USER_ID;
  if (ownerId && !getUser(ownerId)) {
    upsertUser({
      id: ownerId,
      name: input.ownerName || "Goal Owner",
      kycStatus: "active",
    });
  }
  const va = await bmoni.issueVirtualAccount(input.title);
  const goal: Goal = {
    id: genId("g"),
    title: input.title,
    type: input.type,
    targetAmount: input.targetAmount,
    deadline: input.deadline,
    frequency: input.frequency,
    installmentAmount: installmentFor({
      target: input.targetAmount,
      deadline: input.deadline,
      frequency: input.frequency,
    }),
    ownerId,
    virtualAccountNumber: va.number,
    virtualAccountBank: va.bank,
    status: "active",
    emoji: input.emoji,
    createdAt: new Date().toISOString(),
  };
  db().goals.push(goal);
  if (input.type === "group") {
    db().members.push({
      id: genId("gm"),
      goalId: goal.id,
      userId: ownerId,
      role: "admin",
      joinedAt: goal.createdAt,
    });
  }
  saveToDisk(db());
  return goal;
}

export async function addContribution(input: {
  goalId: string;
  contributorName: string;
  contributorUserId?: string;
  amount: number;
  bmoniReference?: string;
}): Promise<Contribution> {
  const contribution: Contribution = {
    id: genId("c"),
    goalId: input.goalId,
    contributorName: input.contributorName,
    contributorUserId: input.contributorUserId,
    amount: input.amount,
    bmoniReference: input.bmoniReference ?? `TRX_${Date.now().toString(36)}_${(++idSeq).toString(36)}`,
    receivedAt: new Date().toISOString(),
  };
  db().contributions.push(contribution);
  await maybeCompleteGoal(input.goalId);
  saveToDisk(db());
  return contribution;
}

/** Auto-payout on completion (doc/PRD §4.4): individual → owner, group → admin. */
async function maybeCompleteGoal(goalId: string): Promise<void> {
  const goal = getGoal(goalId);
  if (!goal || goal.status !== "active") return;
  if (goalSaved(goalId) < goal.targetAmount) return;

  goal.status = "completed";
  const recipientId = goal.ownerId; // group admin is the owner row
  const result = await bmoni.createPayout({
    recipientUserId: recipientId,
    amount: goalSaved(goalId),
    type: "completion_payout",
  });
  db().payouts.push({
    id: genId("p"),
    goalId,
    recipientUserId: recipientId,
    amount: goalSaved(goalId),
    type: "completion_payout",
    bmoniProposalId: result.proposalId,
    bmoniStatus: result.status,
    createdAt: new Date().toISOString(),
  });
}

export function addMember(goalId: string, userId: string): void {
  if (db().members.some((m) => m.goalId === goalId && m.userId === userId)) return;
  db().members.push({
    id: genId("gm"),
    goalId,
    userId,
    role: "member",
    joinedAt: new Date().toISOString(),
  });
}

/**
 * Flow 5a: Single member leaves (Admin decision, no vote).
 * 1. Member's tracked contributions are immediately refunded to their bank account.
 * 2. Member is removed from the goal.
 * 3. Remaining target shortfall is recalculated and remaining members' installment is adjusted upward.
 */
export async function removeMemberAndAdjust(
  goalId: string,
  memberUserId: string,
): Promise<{ refundedAmount: number; newInstallment: number; memberName: string }> {
  const goal = getGoal(goalId);
  if (!goal) throw new Error("Goal not found");

  const memberIndex = db().members.findIndex(
    (m) => m.goalId === goalId && m.userId === memberUserId,
  );
  if (memberIndex === -1) throw new Error("Member not in goal");

  const user = getUser(memberUserId);
  const memberName = user?.name ?? "Member";

  // Calculate this member's total tracked contributions
  const refundedAmount = contributedBy(goalId, memberUserId);

  // If they contributed, execute an instant BMONI refund to their bank account
  if (refundedAmount > 0) {
    const result = await bmoni.createPayout({
      recipientUserId: memberUserId,
      amount: refundedAmount,
      type: "emergency_refund",
    });

    db().payouts.push({
      id: genId("p"),
      goalId,
      recipientUserId: memberUserId,
      amount: refundedAmount,
      type: "emergency_refund",
      bmoniProposalId: result.proposalId,
      bmoniStatus: result.status,
      createdAt: new Date().toISOString(),
    });

    // Remove their contribution records from the pool
    db().contributions = db().contributions.filter(
      (c) => !(c.goalId === goalId && c.contributorUserId === memberUserId),
    );
  }

  // Remove the member from the group
  db().members.splice(memberIndex, 1);

  // Recalculate remaining pool and installment for remaining members
  const currentSaved = goalSaved(goalId);
  const remainingMembers = goalMembers(goalId);
  const memberCount = Math.max(1, remainingMembers.length);

  // Calculate new per-member installment
  const newTotalInstallment = installmentFor({
    target: goal.targetAmount,
    deadline: goal.deadline,
    frequency: goal.frequency,
    saved: currentSaved,
  });

  const newPerMemberInstallment = Math.ceil(newTotalInstallment / memberCount);
  goal.installmentAmount = newPerMemberInstallment;
  saveToDisk(db());

  return {
    refundedAmount,
    newInstallment: newPerMemberInstallment,
    memberName,
  };
}

/** Admin manual close of a goal */
export async function closeGoal(goalId: string): Promise<void> {
  const goal = getGoal(goalId);
  if (!goal) return;
  goal.status = "completed";
  saveToDisk(db());
}

export function createWithdrawal(input: {
  goalId: string;
  requestedBy: string;
  reason?: string;
}): WithdrawalRequest {
  const memberCount = goalMembers(input.goalId).length;
  const req: WithdrawalRequest = {
    id: genId("wr"),
    goalId: input.goalId,
    requestedBy: input.requestedBy,
    reason: input.reason,
    status: "pending",
    quorumRequired: quorumRequired(memberCount),
    createdAt: new Date().toISOString(),
  };
  db().withdrawalRequests.push(req);
  // Requester implicitly approves.
  db().withdrawalVotes.push({
    id: genId("v"),
    requestId: req.id,
    voterId: input.requestedBy,
    vote: true,
    votedAt: req.createdAt,
  });
  saveToDisk(db());
  return req;
}

/**
 * Cast (or change) a vote. If this pushes the request over quorum + admin
 * approval, execute the proportional refunds immediately.
 */
export async function castVote(input: {
  requestId: string;
  voterId: string;
  vote: boolean;
}): Promise<{ quorum: QuorumState; executed: boolean }> {
  const req = db().withdrawalRequests.find((r) => r.id === input.requestId);
  if (!req) throw new Error("Withdrawal request not found");

  const existing = db().withdrawalVotes.find(
    (v) => v.requestId === input.requestId && v.voterId === input.voterId,
  );
  if (existing) {
    existing.vote = input.vote;
    existing.votedAt = new Date().toISOString();
  } else {
    db().withdrawalVotes.push({
      id: genId("v"),
      requestId: input.requestId,
      voterId: input.voterId,
      vote: input.vote,
      votedAt: new Date().toISOString(),
    });
  }

  const quorum = evaluateQuorum(goalMembers(req.goalId), votesFor(req.id));
  let executed = false;
  if (req.status === "pending" && quorum.met) {
    await executeRefunds(req.goalId);
    executed = true;
  }
  saveToDisk(db());
  return { quorum, executed };
}

/** Fan out one simulated BMONI payout per member for their proportional share. */
export async function executeRefunds(goalId: string): Promise<Payout[]> {
  const goal = getGoal(goalId);
  const req = activeWithdrawal(goalId);
  if (!goal || !req) return [];

  const breakdown = refundBreakdown(goalId).filter((r) => r.refund > 0);
  const created: Payout[] = [];
  for (const share of breakdown) {
    const result = await bmoni.createPayout({
      recipientUserId: share.userId,
      amount: share.refund,
      type: "emergency_refund",
    });
    const payout: Payout = {
      id: genId("p"),
      goalId,
      recipientUserId: share.userId,
      amount: share.refund,
      type: "emergency_refund",
      bmoniProposalId: result.proposalId,
      bmoniStatus: result.status,
      createdAt: new Date().toISOString(),
    };
    db().payouts.push(payout);
    created.push(payout);
  }

  req.status = "approved";
  req.resolvedAt = new Date().toISOString();
  goal.status = "withdrawn";
  saveToDisk(db());
  return created;
}

/** Reset to demo seed — handy to re-run the demo from sample state. */
export function resetDemo(): void {
  const { createDemoSeedData } = require("./seed");
  const data = createDemoSeedData();
  g.__stashDB = data;
  saveToDisk(data);
}

