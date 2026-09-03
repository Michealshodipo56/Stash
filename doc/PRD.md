# PRD — [Working Title] Savings Goal Platform
**Hackathon:** Learn2Earn × BMONI Embedded
**Deadline:** Exhibition, Friday 4th September 2026

---

## 1. Problem

Nigerian students (and informal groups) regularly need to save toward a specific
item or event with a real deadline — a laptop, a projector for the department,
a leaving dinner, phone repair, school fees. Two things go wrong today:

1. **No structure.** People "try to save" without a plan, and money gets
   absorbed into daily spending before the deadline.
2. **No trust in group money.** When several people pool funds for something —
   a department buying equipment, roommates splitting a bill — one person ends
   up holding everyone's contribution with no transparency and no shared
   control over how or when it's paid out or refunded.

Existing savings apps (PiggyVest, Cowrywise) solve #1 for individuals but don't
solve #2 well — there's no real shared/group governance model, and every
contributor typically needs their own account.

## 2. Solution, one line

A goal-first savings planner: set what you want, its price, and your deadline;
the app calculates what you need to save daily/weekly/monthly; solo or as a
group. Group goals pay out to the admin who created them; if a group goal is
abandoned early, remaining funds are refunded proportionally by group
agreement, not unilaterally.

BMONI's embedded wallet + Nigerian rail is the settlement layer underneath —
users don't see "wallets," they see "my goal."

## 3. Users

- **Goal owner (individual)** — sets a personal goal, saves toward it solo,
  optionally invites others to chip in without those people needing an account.
- **Group admin** — creates a group goal, is the sole payout recipient when the
  goal is met, participates in emergency-withdrawal approval.
- **Group member** — joins a group goal, contributes on a schedule, can vote on
  an emergency withdrawal.
- **Contributor (no account)** — a friend/family member who tops up someone
  else's goal via a shared payment link/virtual account. Never touches BMONI
  KYC or a wallet directly.

## 4. Core features (MVP — build these first, in order)

### 4.1 Create a goal
- Fields: item name, target amount (₦), deadline date, type (individual /
  group).
- **Savings calculator** (pure frontend math, no API dependency): given target,
  deadline, and chosen frequency (daily / weekly / monthly), show the required
  installment. Recompute live as the user changes any field.

### 4.2 Fund a goal
- Goal gets its own BMONI NGN virtual account number.
- Owner/members fund it themselves, or share the account number / a link with
  anyone — no signup required on the contributor's side.
- Every inbound deposit is recorded against the contributor who sent it (by
  matching sender name/reference where available, else "unattributed" —
  needed for proportional refunds).

### 4.3 Group goals
- Admin creates the group, sets the same fields as an individual goal, invites
  members (by phone number/email — simple invite link is fine for a demo).
- Members join and start contributing on the same schedule.
- Progress bar shows total raised vs. target, and (for members) each
  contributor's share.

### 4.4 Goal completion → payout
- When target is reached (or deadline hits with target met), funds move
  automatically:
  - Individual goal → owner's linked Nigerian bank account.
  - Group goal → **admin's** linked bank account (admin is defined as the
    single payee — stated explicitly by the user as the design).

### 4.5 Emergency withdrawal (group goals only) — the differentiator
- Any member can request an early exit / cancellation before the deadline.
- Requires **quorum approval** from the group (e.g. majority of members,
  admin's vote required) before funds move.
- On approval: remaining pooled funds are refunded **proportionally** to each
  member based on their tracked contributions, paid out to each member's bank
  account.
- If quorum isn't reached, funds stay locked and the goal continues normally.

### 4.6 Multiple concurrent goals
- A user can have several goals running at once (e.g. "New Phone", "School
  Fees", "Netflix subscription"), solo and group, listed on one dashboard.

## 5. Explicitly out of scope for the hackathon (say this out loud in the pitch)

- Full social graph / in-app friend system — replaced by a shareable link.
- Push notifications — replaced by in-app status only.
- Swaps / multi-currency — everything is NGN/CNGN for the demo.
- Flutter mobile app — web app only (Next.js), calling BMONI's REST API
  server-side.
- Real bank-grade dispute resolution on emergency withdrawal — quorum vote is
  the full mechanism, no arbiter/appeal layer.
- Full webhook-driven real-time updates — polling BMONI's status endpoints is
  fine for a live demo.

## 6. Demo script (this is what actually needs to work, flawlessly, live)

1. Create an individual goal ("New Phone, ₦150,000, by Dec 1") → show the
   calculator switching between daily/weekly/monthly.
2. Fund it (simulate a deposit hitting the virtual account) → progress bar
   updates.
3. Create a group goal ("Departmental Projector, ₦200,000, by Friday") as
   admin, add 2 "members" (can be pre-seeded demo users).
4. Show contributions coming in from different members, tracked individually.
5. Hit target → show automatic payout triggering to admin's bank account.
6. **The differentiator moment:** start a second group goal, have a member
   request an emergency withdrawal, show the quorum vote in progress (not
   enough approvals yet → funds stay locked), then get enough approvals →
   show the proportional refund breakdown per member.

## 7. Success criteria for the hackathon

- Steps 1–5 of the demo script run live, with no manual database edits.
- Step 6 can be partially mocked (e.g. pre-seeded vote state) if time is short
  — but the proportional refund math must be real and correct.
- You can answer "how is this different from PiggyVest?" in one sentence
  without hesitating.
