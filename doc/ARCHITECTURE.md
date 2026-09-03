# Architecture

## 1. Stack

- **Frontend + backend:** Next.js (App Router), TypeScript, Tailwind — your
  existing stack, no context-switching cost.
- **Database:** Postgres (use Supabase — you already know it, and it gives you
  auth + DB in one place for free during the hackathon).
- **BMONI integration:** server-side only, via Next.js API routes / route
  handlers. The BMONI API key and any signing keys **never** reach the
  browser.
- **Signing:** BMONI's design assumes on-device signing (Flutter + Secure
  Enclave/Keystore). Since this is a web app with no secure enclave, the
  hackathon-scope decision is: **generate one owner key per user server-side
  with `ethers.js`, store it encrypted at rest, and sign server-side when a
  proposal needs it.** State this explicitly in your pitch as a deliberate,
  documented simplification for the 2-day scope — not something you're hiding.
  In a real product, you'd push signing to a client-side flow (WebAuthn-backed
  key, or a proper wallet-connect style flow).

## 2. High-level flow

```
Browser (Next.js UI)
   │  goal CRUD, contributions view, calculator (pure client math)
   ▼
Next.js API routes (server)
   │  owns: BMONI API key, owner signing keys (encrypted), quorum logic
   ▼
BMONI Embedded REST API  (https://embedded-dev.bmoni.com in sandbox)
   │  users, smart wallets, KYC, NGN virtual accounts, proposals, withdrawals
   ▼
Postgres (via Supabase)
   stores: users, goals, members, contributions, withdrawal requests/votes
   (BMONI is the source of truth for money movement; Postgres is the source
   of truth for goal/group/vote state)
```

## 3. Who actually gets a BMONI account

To keep KYC overhead low for the demo, **only these need a real BMONI user +
smart wallet + Nigeria KYC**:
- Individual goal owners (they receive the eventual payout).
- Group admins (they receive the eventual payout, and are a required signer
  on emergency withdrawals).
- Group members who might receive a **proportional refund** payout (so, all
  group members, in practice — but their KYC can be deferred until the first
  time they'd actually receive money, not at group-join time).

**Contributors who only ever send money in** never need a BMONI account — they
just transfer to the goal's NGN virtual account number. This is the biggest
scope-reduction decision in the whole build: it means most people who touch
the app never go through KYC at all.

## 4. Core BMONI call sequence, mapped to features

### 4.1 Onboarding a goal owner / group admin (once per person)
1. `POST /v1/users` → get `bmoniUserId`
2. `PATCH /v1/users/{userId}/kyc` → submit personal info (name, DOB, address)
3. `POST /v1/users/{userId}/smart-wallets/owner-proof-challenges` (currency:
   CNGN) → sign challenge server-side with `wallet.signMessage()`
   (EIP-191-prefixed)
4. `POST /v1/users/{userId}/smart-wallets/create-managed` → get
   `smartWalletId` + wallet address
5. `POST /v1/users/{userId}/onboarding/start-nigeria` (BVN, wallet address) →
   Nigeria KYC path (no selfie required — fastest path)
6. Upload the 3 required KYC documents (identification, proof-of-address,
   biometric)
7. Poll `GET /v1/users/{userId}/onboarding/status` until NGN rail is active

### 4.2 Creating a goal → issuing a fundable account
8. `POST /vba/ngn` (or `GET /vba/ngn` per docs) scoped to the owner/admin's
   wallet → get a dedicated NGN virtual account number for that goal. Store
   this against the goal record, not the user — a user can have multiple
   goals, each with its own virtual account, so contributions are never mixed
   up.

### 4.3 Tracking contributions
- Poll the wallet balance (`GET /smart-wallets/account/balances`) and/or the
  virtual account's transaction feed periodically.
- Match each inbound transfer to a contributor where possible (by sender
  name/reference passed in the bank transfer narration — ask contributors to
  put their name in the transfer note). Unmatched deposits are logged as
  "unattributed" and excluded from proportional-refund math, or attributed
  fully to the admin — decide and state this assumption in the demo.

### 4.4 Goal completion → payout
9. `POST /v1/users/{userId}/smart-wallets/{walletId}/proposals` (type
   TRANSFER or an offramp order, depending on which endpoint the sandbox
   exposes for Nigeria payout) → propose the payout to the owner/admin's bank
   account.
10. For an individual goal, auto-approve + auto-sign immediately (no quorum
    needed — it's their own money).
11. `offramp/nigeria` (or the relevant withdrawal endpoint) → funds land in
    the real bank account.

### 4.5 Emergency withdrawal (group goals) — the quorum layer
This is **your own logic sitting in front of** BMONI's proposal/approve flow,
not a BMONI feature by itself:
- A member requests withdrawal → row created in your own `withdrawal_requests`
  table (not a BMONI call yet).
- Other members vote (your own `withdrawal_votes` table).
- Once your app-level quorum threshold is met → **then** you create the actual
  BMONI transfer proposal(s) — likely one payout per member, each for their
  proportional share — and auto-sign each since your app already confirmed
  authorization via the vote.
- If quorum isn't met, nothing is ever sent to BMONI — funds stay put.

This means the "quorum" the judges see is your product's governance logic,
demonstrated using BMONI's wallet as the thing being protected — which is the
correct framing for your pitch ("we built decision-making on top of their
payment rail," not "we used their multisig feature").

## 5. Environment / sandbox

```
BASE_URL=https://embedded-dev.bmoni.com
API_KEY=<sandbox key from docs>
```
Use the **Bunch Dillon** sandbox persona (or request your own test personas)
for any KYC/BVN flows during development — real BVNs won't resolve in
sandbox.
