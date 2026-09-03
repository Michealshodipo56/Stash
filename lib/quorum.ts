import type { GoalMember, WithdrawalVote } from "./types";

/**
 * App-level quorum governance that sits IN FRONT OF BMONI's proposal/approve
 * flow (doc/ARCHITECTURE.md §4.5). This is our product logic — not a BMONI
 * feature — which is the correct framing for the pitch.
 *
 * Rule (from the PRD): a simple majority of members must approve, AND the admin
 * must be among the approvers. Only then do we create the actual BMONI payout
 * proposals. If quorum isn't reached, nothing is ever sent to BMONI.
 */
export function quorumRequired(memberCount: number): number {
  return Math.floor(memberCount / 2) + 1;
}

export interface QuorumState {
  approvals: number;
  rejections: number;
  required: number;
  memberCount: number;
  adminApproved: boolean;
  /** Members who haven't voted yet. */
  pending: number;
  /** True once quorum + admin approval are both satisfied. */
  met: boolean;
}

export function evaluateQuorum(
  members: GoalMember[],
  votes: WithdrawalVote[],
): QuorumState {
  const adminIds = new Set(
    members.filter((m) => m.role === "admin").map((m) => m.userId),
  );

  const latestByVoter = new Map<string, boolean>();
  for (const v of votes) {
    latestByVoter.set(v.voterId, v.vote);
  }

  let approvals = 0;
  let rejections = 0;
  let adminApproved = false;
  for (const [voterId, vote] of latestByVoter) {
    if (vote) {
      approvals++;
      if (adminIds.has(voterId)) adminApproved = true;
    } else {
      rejections++;
    }
  }

  const memberCount = members.length;
  const required = quorumRequired(memberCount);

  return {
    approvals,
    rejections,
    required,
    memberCount,
    adminApproved,
    pending: Math.max(0, memberCount - latestByVoter.size),
    met: approvals >= required && adminApproved,
  };
}
