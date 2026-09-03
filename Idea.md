Project: Stack (working name) — final summary for handoff

What it is: A goal-based savings platform for individuals and groups. Organized around a specific item the user wants, not an account balance.

Core flow: User states an item, target amount, and deadline (manually or by describing it to an AI, which looks up real price/purchase options either way) → app calculates the daily/weekly/monthly installment → user funds it themselves or shares a link/virtual account so others can top it up without an account → on hitting target, funds pay out to the goal owner's (or group admin's) Nigerian bank account.

Two modes:

Individual — solo saving.
Group — admin creates it, is the sole payout recipient on completion, and can close the goal.

Group exit rules (the differentiator):

One member leaves: admin removes them → that member is refunded their own contributions → the remaining target is recalculated and redistributed across remaining members.
Whole goal cancelled: requires a group vote (quorum) → remaining pooled funds refund proportionally to every contributor.

Tech stack: Next.js + TypeScript, Supabase/Postgres, BMONI Embedded API (wallets, KYC/BVN, CNGN, NGN virtual accounts) as the settlement layer.

Out of scope: social/friend graph, push notifications, multi-currency, mobile app, direct-to-vendor payment.

Context: Learn2Earn × BMONI hackathon, exhibition Friday 4th September 2026.