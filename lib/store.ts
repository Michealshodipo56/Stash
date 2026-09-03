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
  User,
  WithdrawalRequest,
  WithdrawalVote,
} from "./types";

/* ---------------------------------------------------------------------------
 * In-memory singleton. Persisted on globalThis so it survives dev HMR and is
 * shared across requests within a running server (perfect for a single live
 * demo session). Pages that read it are `export const dynamic = "force-dynamic"`.
 * ------------------------------------------------------------------------- */
const g = globalThis as unknown as { __stashDB?: StoreData };
function db(): StoreData {
  if (!g.__stashDB) g.__stashDB = createSeedData();
  return g.__stashDB;
}

let idSeq = 1000;
const genId = (p: string) => `${p}_${(++idSeq).toString(36)}${Date.now().toString(36).slice(-3)}`;

/* — identity — */
export function currentUser(): User {
  return getUser(CURRENT_USER_ID)!;
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
    thisMonthDeltaPct: 18, // demo flourish — no historical series to diff against
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

export function getStreak() {
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
}): Promise<Goal> {
  const ownerId = input.ownerId ?? CURRENT_USER_ID;
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
    bmoniReference: input.bmoniReference ?? `TRX${Math.floor(Math.random() * 1e9)}`,
    receivedAt: new Date().toISOString(),
  };
  db().contributions.push(contribution);
  await maybeCompleteGoal(input.goalId);
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
  return created;
}

/** Reset to seed — handy to re-run the demo from a clean slate. */
export function resetDemo(): void {
  g.__stashDB = createSeedData();
}
