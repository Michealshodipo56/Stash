import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const goalTypeEnum = pgEnum("goal_type", ["individual", "group"]);
export const frequencyEnum = pgEnum("frequency", [
  "daily",
  "weekly",
  "monthly",
  "yearly",
]);
export const goalStatusEnum = pgEnum("goal_status", [
  "active",
  "paused",
  "completed",
  "withdrawn",
  "cancelled",
]);
export const memberRoleEnum = pgEnum("member_role", ["admin", "member"]);
export const withdrawalStatusEnum = pgEnum("withdrawal_status", [
  "pending",
  "approved",
  "rejected",
]);
export const kycStatusEnum = pgEnum("kyc_status", ["none", "pending", "active"]);
export const payoutTypeEnum = pgEnum("payout_type", [
  "completion_payout",
  "emergency_refund",
]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  passwordHash: text("password_hash"),
  bmoniUserId: text("bmoni_user_id"),
  bmoniError: text("bmoni_error"),
  smartWalletId: text("smart_wallet_id"),
  walletAddress: text("wallet_address"),
  kycStatus: kycStatusEnum("kyc_status").notNull().default("none"),
  bankAccountNumber: text("bank_account_number"),
  bankCode: text("bank_code"),
  bankName: text("bank_name"),
  avatarColor: text("avatar_color"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  token: text("token").notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" }).notNull(),
});

export const goals = pgTable("goals", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  type: goalTypeEnum("type").notNull(),
  targetAmount: numeric("target_amount", { precision: 14, scale: 2 }).notNull(),
  deadline: timestamp("deadline", { withTimezone: true, mode: "string" }).notNull(),
  frequency: frequencyEnum("frequency").notNull(),
  installmentAmount: numeric("installment_amount", {
    precision: 14,
    scale: 2,
  }).notNull(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  virtualAccountNumber: text("virtual_account_number"),
  virtualAccountBank: text("virtual_account_bank"),
  status: goalStatusEnum("status").notNull().default("active"),
  emoji: text("emoji"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
});

export const goalMembers = pgTable(
  "goal_members",
  {
    id: text("id").primaryKey(),
    goalId: text("goal_id")
      .notNull()
      .references(() => goals.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: memberRoleEnum("role").notNull().default("member"),
    joinedAt: timestamp("joined_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("goal_members_goal_user_idx").on(table.goalId, table.userId)]
);

export const contributions = pgTable("contributions", {
  id: text("id").primaryKey(),
  goalId: text("goal_id")
    .notNull()
    .references(() => goals.id, { onDelete: "cascade" }),
  contributorName: text("contributor_name").notNull(),
  contributorUserId: text("contributor_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  bmoniReference: text("bmoni_reference"),
  receivedAt: timestamp("received_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
});

export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: text("id").primaryKey(),
  goalId: text("goal_id")
    .notNull()
    .references(() => goals.id, { onDelete: "cascade" }),
  requestedBy: text("requested_by")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  reason: text("reason"),
  status: withdrawalStatusEnum("status").notNull().default("pending"),
  quorumRequired: integer("quorum_required").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true, mode: "string" }),
});

export const withdrawalVotes = pgTable(
  "withdrawal_votes",
  {
    id: text("id").primaryKey(),
    requestId: text("request_id")
      .notNull()
      .references(() => withdrawalRequests.id, { onDelete: "cascade" }),
    voterId: text("voter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    vote: boolean("vote").notNull(),
    votedAt: timestamp("voted_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("withdrawal_votes_request_voter_idx").on(table.requestId, table.voterId),
  ]
);

export const payouts = pgTable("payouts", {
  id: text("id").primaryKey(),
  goalId: text("goal_id")
    .notNull()
    .references(() => goals.id, { onDelete: "cascade" }),
  recipientUserId: text("recipient_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  type: payoutTypeEnum("type").notNull(),
  bmoniProposalId: text("bmoni_proposal_id"),
  bmoniStatus: text("bmoni_status"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
});
