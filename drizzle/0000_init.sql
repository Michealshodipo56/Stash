-- Stash schema for Neon Postgres
-- Matches lib/db/schema.ts / lib/types.ts

CREATE TYPE goal_type AS ENUM ('individual', 'group');
CREATE TYPE frequency AS ENUM ('daily', 'weekly', 'monthly', 'yearly');
CREATE TYPE goal_status AS ENUM ('active', 'paused', 'completed', 'withdrawn', 'cancelled');
CREATE TYPE member_role AS ENUM ('admin', 'member');
CREATE TYPE withdrawal_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE kyc_status AS ENUM ('none', 'pending', 'active');
CREATE TYPE payout_type AS ENUM ('completion_payout', 'emergency_refund');

CREATE TABLE users (
  id text PRIMARY KEY,
  name text NOT NULL,
  phone text,
  email text,
  password_hash text,
  bmoni_user_id text,
  bmoni_error text,
  smart_wallet_id text,
  wallet_address text,
  kyc_status kyc_status NOT NULL DEFAULT 'none',
  bank_account_number text,
  bank_code text,
  bank_name text,
  avatar_color text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
  id text PRIMARY KEY,
  token text NOT NULL UNIQUE,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

CREATE TABLE goals (
  id text PRIMARY KEY,
  title text NOT NULL,
  type goal_type NOT NULL,
  target_amount numeric(14, 2) NOT NULL,
  deadline timestamptz NOT NULL,
  frequency frequency NOT NULL,
  installment_amount numeric(14, 2) NOT NULL,
  owner_id text NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  virtual_account_number text,
  virtual_account_bank text,
  status goal_status NOT NULL DEFAULT 'active',
  emoji text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE goal_members (
  id text PRIMARY KEY,
  goal_id text NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role member_role NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX goal_members_goal_user_idx ON goal_members (goal_id, user_id);

CREATE TABLE contributions (
  id text PRIMARY KEY,
  goal_id text NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  contributor_name text NOT NULL,
  contributor_user_id text REFERENCES users(id) ON DELETE SET NULL,
  amount numeric(14, 2) NOT NULL,
  bmoni_reference text,
  received_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE withdrawal_requests (
  id text PRIMARY KEY,
  goal_id text NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  requested_by text NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  reason text,
  status withdrawal_status NOT NULL DEFAULT 'pending',
  quorum_required integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE TABLE withdrawal_votes (
  id text PRIMARY KEY,
  request_id text NOT NULL REFERENCES withdrawal_requests(id) ON DELETE CASCADE,
  voter_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote boolean NOT NULL,
  voted_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX withdrawal_votes_request_voter_idx ON withdrawal_votes (request_id, voter_id);

CREATE TABLE payouts (
  id text PRIMARY KEY,
  goal_id text NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  recipient_user_id text NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  amount numeric(14, 2) NOT NULL,
  type payout_type NOT NULL,
  bmoni_proposal_id text,
  bmoni_status text,
  created_at timestamptz NOT NULL DEFAULT now()
);
