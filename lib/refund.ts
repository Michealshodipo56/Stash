import type { Contribution, GoalMember, MemberShare, User } from "./types";

/**
 * Proportional emergency-refund math — the differentiator, and per the PRD this
 * MUST be real and correct.
 *
 * Each member's share is based on their ATTRIBUTED contributions:
 *     share = sum(their contributions) / sum(all attributed contributions)
 *
 * The entire refundable `pool` (the goal's current balance) is distributed by
 * those shares. Because money is whole naira, we allocate with the
 * largest-remainder method so the parts sum EXACTLY to the pool — no kobo
 * created or lost.
 *
 * Unattributed deposits (no known sender) don't earn a share of their own; per
 * doc/ARCHITECTURE.md §4.3 they're excluded from the split. In practice all demo
 * contributions are attributed, so each member simply gets back their fair share.
 */
export function computeRefunds(
  members: Pick<User, "id" | "name" | "avatarColor">[],
  contributions: Contribution[],
  pool: number,
): MemberShare[] {
  const contributedByUser = new Map<string, number>();
  for (const c of contributions) {
    if (!c.contributorUserId) continue; // unattributed → excluded from split
    contributedByUser.set(
      c.contributorUserId,
      (contributedByUser.get(c.contributorUserId) ?? 0) + c.amount,
    );
  }

  const rows = members.map((m) => ({
    userId: m.id,
    name: m.name,
    avatarColor: m.avatarColor,
    contributed: contributedByUser.get(m.id) ?? 0,
  }));

  const totalContributed = rows.reduce((s, r) => s + r.contributed, 0);
  const safePool = Math.max(0, Math.round(pool));

  if (totalContributed <= 0 || safePool <= 0) {
    return rows.map((r) => ({ ...r, sharePct: 0, refund: 0 }));
  }

  // Largest-remainder allocation of whole naira.
  const exact = rows.map((r) => (r.contributed / totalContributed) * safePool);
  const floors = exact.map((v) => Math.floor(v));
  let allocated = floors.reduce((s, v) => s + v, 0);
  let leftover = safePool - allocated;

  const order = exact
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);

  const refunds = [...floors];
  for (let k = 0; k < order.length && leftover > 0; k++) {
    refunds[order[k].i] += 1;
    leftover -= 1;
  }

  return rows.map((r, i) => ({
    userId: r.userId,
    name: r.name,
    avatarColor: r.avatarColor,
    contributed: r.contributed,
    sharePct: (r.contributed / totalContributed) * 100,
    refund: refunds[i],
  }));
}

/** Total attributed to a single user across a goal's contributions. */
export function contributedBy(
  userId: string,
  contributions: Contribution[],
): number {
  return contributions
    .filter((c) => c.contributorUserId === userId)
    .reduce((s, c) => s + c.amount, 0);
}

/** Members of a goal, resolved to users, for a refund breakdown. */
export function membersAsUsers(
  members: GoalMember[],
  users: Map<string, User>,
): Pick<User, "id" | "name" | "avatarColor">[] {
  return members
    .map((m) => users.get(m.userId))
    .filter((u): u is User => Boolean(u))
    .map((u) => ({ id: u.id, name: u.name, avatarColor: u.avatarColor }));
}
