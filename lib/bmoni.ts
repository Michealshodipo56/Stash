/**
 * Hybrid BMONI layer (doc/ARCHITECTURE.md).
 *
 * Per the agreed hackathon scope: onboarding + per-goal NGN virtual accounts are
 * "real-shaped" (and can be pointed at the sandbox later), while payouts/refunds
 * are SIMULATED so a live demo can't die on sandbox flakiness. The refund math
 * that decides the amounts is real (see lib/refund.ts).
 *
 * To go real, implement a fetch-based client against BMONI_BASE_URL and select it
 * here via env — the rest of the app only depends on the BmoniClient interface.
 */
import type { PayoutType } from "./types";

export interface VirtualAccount {
  number: string;
  bank: string;
}

export interface PayoutResult {
  proposalId: string;
  status: string;
}

export interface BmoniClient {
  /** POST /vba/ngn — a dedicated fundable account per goal. */
  issueVirtualAccount(goalRef: string): Promise<VirtualAccount>;
  /** Proposal + auto-sign + offramp, collapsed into one simulated call. */
  createPayout(input: {
    recipientUserId: string;
    amount: number;
    type: PayoutType;
  }): Promise<PayoutResult>;
}

const DEMO_BANK = "Providus Bank";

function nuban(): string {
  return "99" + Math.floor(10_000_000 + Math.random() * 89_999_999).toString();
}

function token(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

class MockBmoniClient implements BmoniClient {
  async issueVirtualAccount(): Promise<VirtualAccount> {
    return { number: nuban(), bank: DEMO_BANK };
  }

  async createPayout(): Promise<PayoutResult> {
    // In sandbox this would be a proposal → sign → offramp with polling; we
    // return a settled proposal so the "proof it worked" screen is instant.
    return { proposalId: token("prop"), status: "completed" };
  }
}

export const BMONI_MODE =
  process.env.BMONI_MODE === "real" ? "real" : "mock";

export const bmoni: BmoniClient = new MockBmoniClient();
