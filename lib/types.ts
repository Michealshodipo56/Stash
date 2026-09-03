/**
 * Domain types — mirror doc/DATABASE.md.
 *
 * BMONI remains the source of truth for money movement; these types model our
 * own app state (goals, membership, votes) plus a few derived view-models.
 */

export type GoalType = "individual" | "group";
export type Frequency = "daily" | "weekly" | "monthly";
export type GoalStatus = "active" | "completed" | "withdrawn" | "cancelled";
export type MemberRole = "admin" | "member";
export type WithdrawalStatus = "pending" | "approved" | "rejected";
export type KycStatus = "none" | "pending" | "active";
export type PayoutType = "completion_payout" | "emergency_refund";

export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  passwordHash?: string;
  /** BMONI identifiers (see doc/ARCHITECTURE.md §4.1). */
  bmoniUserId?: string;
  bmoniError?: string;
  smartWalletId?: string;
  walletAddress?: string;
  kycStatus: KycStatus;
  bankAccountNumber?: string;
  bankCode?: string;
  bankName?: string;
  avatarColor?: string;
  createdAt: string;
}

export interface Session {
  id: string;
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}


export interface Goal {
  id: string;
  title: string;
  type: GoalType;
  targetAmount: number;
  deadline: string; // ISO date
  frequency: Frequency;
  /** Computed at creation, stored for display consistency (DATABASE.md). */
  installmentAmount: number;
  ownerId: string; // individual owner OR group admin
  virtualAccountNumber?: string;
  virtualAccountBank?: string;
  status: GoalStatus;
  emoji?: string;
  createdAt: string;
}

export interface GoalMember {
  id: string;
  goalId: string;
  userId: string;
  role: MemberRole;
  joinedAt: string;
}

export interface Contribution {
  id: string;
  goalId: string;
  /** Matched from transfer narration, or "Unattributed". */
  contributorName: string;
  /** Set when the sender is a known member/owner (needed for refund math). */
  contributorUserId?: string;
  amount: number;
  bmoniReference?: string;
  receivedAt: string;
}

export interface WithdrawalRequest {
  id: string;
  goalId: string;
  requestedBy: string;
  reason?: string;
  status: WithdrawalStatus;
  quorumRequired: number;
  createdAt: string;
  resolvedAt?: string;
}

export interface WithdrawalVote {
  id: string;
  requestId: string;
  voterId: string;
  vote: boolean; // true = approve
  votedAt: string;
}

export interface Payout {
  id: string;
  goalId: string;
  recipientUserId: string;
  amount: number;
  type: PayoutType;
  bmoniProposalId?: string;
  bmoniStatus?: string;
  createdAt: string;
}

/* — Derived view-models (computed, not stored) — */

export interface MemberShare {
  userId: string;
  name: string;
  avatarColor?: string;
  contributed: number;
  /** 0–100 */
  sharePct: number;
  /** Naira this member would receive in a proportional refund. */
  refund: number;
}

export interface GoalStats {
  saved: number;
  progress: number; // 0–100
  contributorCount: number;
  daysLeft: number;
  remaining: number;
}
