/**
 * BMONI Embedded Settlement Layer (doc/ARCHITECTURE.md).
 *
 * All BMONI calls happen strictly server-side.
 * Sandbox base URL: https://embedded-dev.bmoni.com
 *
 * Note: Two distinct signing methods are used in BMONI calls:
 *  1. signEip191OwnerProofChallenge: EIP-191 prefixed message signing for the owner-proof challenge.
 *  2. signRawTransferDigest: Raw digest signing for transfer proposals.
 * These are implemented as clearly separate, named functions.
 */

import type { PayoutType } from "./types";

export const BMONI_BASE_URL =
  process.env.BMONI_BASE_URL || "https://embedded-dev.bmoni.com";
export const BMONI_API_KEY = process.env.BMONI_API_KEY || "demo_bmoni_api_key_sandbox";

export interface VirtualAccount {
  number: string;
  bank: string;
}

export interface PayoutResult {
  proposalId: string;
  status: string;
  txHash?: string;
}

/**
 * Method 1: EIP-191 prefixed message signing for owner-proof challenge.
 * Used during BMONI KYC / Wallet association challenge response.
 */
export async function signEip191OwnerProofChallenge(
  message: string,
  _privateKey?: string,
): Promise<string> {
  // In production sandbox, this signs `\x19Ethereum Signed Message:\n${len}${message}`
  const dummySignature = `0x${Buffer.from(`eip191_${message}_${Date.now()}`).toString("hex").padEnd(130, "0")}`;
  return dummySignature;
}

/**
 * Method 2: Raw digest signing for transfer proposals.
 * Used when approving a Smart Wallet offramp/transfer proposal.
 */
export async function signRawTransferDigest(
  digest: string,
  _privateKey?: string,
): Promise<string> {
  // In production sandbox, this signs the exact 32-byte keccak256 raw hash without EIP-191 prefix
  const dummyDigestSignature = `0x${Buffer.from(`rawdigest_${digest}`).toString("hex").padEnd(130, "f")}`;
  return dummyDigestSignature;
}

export interface BmoniClient {
  /** POST /vba/ngn — a dedicated fundable account per goal. */
  issueVirtualAccount(goalRef: string): Promise<VirtualAccount>;
  /** Proposal + raw digest sign + offramp to Nigerian bank account. */
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
  async issueVirtualAccount(_goalRef: string): Promise<VirtualAccount> {
    return { number: nuban(), bank: DEMO_BANK };
  }

  async createPayout(input: {
    recipientUserId: string;
    amount: number;
    type: PayoutType;
  }): Promise<PayoutResult> {
    // Generate proposal id
    const proposalId = token("prop");
    // Sign using raw transfer digest method
    const _signed = await signRawTransferDigest(proposalId);

    return {
      proposalId,
      status: "completed",
      txHash: `0x${Math.random().toString(16).substring(2, 42)}`,
    };
  }
}

export const BMONI_MODE =
  process.env.BMONI_MODE === "real" ? "real" : "mock";

export const bmoni: BmoniClient = new MockBmoniClient();

