# [Project Name — TBD] 🎯

A goal-based savings platform, not a wallet app. Set the thing you want, its
price, and your deadline — the app tells you how much to save daily, weekly,
or monthly to get there. Save solo, or pool money with a group toward one
shared goal, with fair, quorum-approved emergency exits if plans change.

Built for the **Learn2Earn × BMONI Embedded Hackathon** — exhibition Friday,
4th September 2026.

---

## The problem

Saving toward a specific goal — a laptop, a projector for the department, a
leaving dinner — usually fails one of two ways: there's no real plan, so
money gets absorbed into daily spending; or it's a group effort, and one
person ends up holding everyone's contribution with no transparency or shared
control over how it's paid out or refunded.

## What this does

- **Set a goal** — item, target amount (₦), deadline. A live calculator shows
  the daily/weekly/monthly amount needed.
- **Save solo or as a group** — group goals let members join and contribute
  on the same schedule; anyone can share a payment link so friends/family can
  top it up without needing an account of their own.
- **Automatic payout on completion** — individual goals pay out to the owner;
  group goals pay out to the admin who created the group.
- **Emergency withdrawal, done fairly** — if a group goal needs to be
  cancelled early, remaining funds are only released once a quorum of members
  approve, then refunded proportionally to each contributor's share — never a
  unilateral decision.

BMONI Embedded is the settlement layer underneath: self-custodied wallets,
Nigerian KYC/BVN, CNGN wallets, and NGN virtual accounts power every deposit
and payout — but the user never sees "wallet," they see their goal.

## Tech stack

- **Frontend + backend:** Next.js (App Router), TypeScript, Tailwind
- **Database:** Postgres via Supabase
- **Payments/wallets:** [BMONI Embedded API](https://bkey.mintlify.app) (sandbox)
- **Signing:** server-side, via `ethers.js` (see [`ARCHITECTURE.md`](./ARCHITECTURE.md)
  for why, given this is a web app rather than the Flutter/secure-enclave
  setup BMONI's SDK assumes)

## Project docs

- [`PRD.md`](./PRD.md) — problem, users, MVP feature scope, what's explicitly
  cut for the hackathon, and the live demo script
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — system design and the full BMONI
  API call sequence mapped to each feature
- [`DATABASE.md`](./DATABASE.md) — schema for goals, members, contributions,
  votes, and payouts

## Getting started

```bash
git clone <repo-url>
cd <repo-name>
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

BMONI_BASE_URL=https://embedded-dev.bmoni.com
BMONI_API_KEY=

OWNER_KEY_ENCRYPTION_SECRET=
```

Run the dev server:

```bash
npm run dev
```

## Build order (given the 2-day window)

1. Goal creation UI + savings calculator (no BMONI dependency — get this
   solid and good-looking first)
2. BMONI onboarding: user → smart wallet → Nigeria KYC/BVN
3. NGN virtual account per goal + contribution tracking
4. Completion payout flow
5. Group goals: membership + per-member contribution attribution
6. Emergency withdrawal: quorum voting + proportional refund

## Status

🚧 In active development for the hackathon exhibition.

## License

Hackathon submission — Learn2Earn / BMONI Embedded, September 2026.
