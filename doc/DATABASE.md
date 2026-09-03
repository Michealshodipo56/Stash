# Database Schema

Postgres (Supabase). This is your own app's state — BMONI remains the source
of truth for actual money movement; these tables track goals, membership,
and votes.

---

## `users`
Only rows for people who've actually gone through BMONI onboarding (goal
owners, group admins, and members once they're due a payout).

| column              | type      | notes                                      |
|----------------------|-----------|---------------------------------------------|
| id                   | uuid pk   |                                             |
| name                 | text      |                                             |
| phone                | text      | E.164 format                               |
| email                | text      |                                             |
| bmoni_user_id        | text      | from `POST /v1/users`                      |
| smart_wallet_id      | text      | from smart wallet creation                 |
| wallet_address       | text      |                                             |
| owner_key_encrypted  | text      | encrypted signing key (server-side signing)|
| kyc_status           | text      | none / pending / active                    |
| bank_account_number  | text      | for eventual payout/refund                 |
| bank_code            | text      |                                             |
| created_at           | timestamp |                                             |

---

## `goals`

| column              | type      | notes                                          |
|----------------------|-----------|-------------------------------------------------|
| id                   | uuid pk   |                                                 |
| title                | text      | e.g. "New Phone", "Departmental Projector"      |
| type                 | text      | `individual` \| `group`                         |
| target_amount        | numeric   | ₦                                               |
| deadline             | date      |                                                 |
| frequency            | text      | `daily` \| `weekly` \| `monthly` (chosen by owner)|
| installment_amount   | numeric   | computed at creation, stored for display consistency |
| owner_id             | uuid fk   | → users.id — individual owner, or group admin  |
| virtual_account_number | text    | BMONI NGN virtual account for this goal         |
| status               | text      | `active` \| `completed` \| `withdrawn` \| `cancelled` |
| created_at           | timestamp |                                                 |

---

## `goal_members`
Only used for `type = group` goals. The admin is also a row here
(`role = admin`), so membership + admin identity is one table.

| column      | type      | notes                              |
|-------------|-----------|-------------------------------------|
| id          | uuid pk   |                                     |
| goal_id     | uuid fk   | → goals.id                          |
| user_id     | uuid fk   | → users.id                          |
| role        | text      | `admin` \| `member`                 |
| joined_at   | timestamp |                                     |

---

## `contributions`
Every inbound deposit toward a goal, attributed where possible.

| column          | type      | notes                                           |
|------------------|-----------|--------------------------------------------------|
| id               | uuid pk   |                                                  |
| goal_id          | uuid fk   | → goals.id                                       |
| contributor_name | text      | matched from transfer narration, or "Unattributed" |
| contributor_user_id | uuid fk (nullable) | set if the sender is a known member/owner |
| amount           | numeric   |                                                  |
| bmoni_reference  | text      | transaction id / reference from BMONI            |
| received_at      | timestamp |                                                  |

> Proportional refund math reads from this table: each member's share =
> sum(their contributions) / sum(all attributed contributions).

---

## `withdrawal_requests`
Emergency exit requests — group goals only. This table (and the next) is your
own app-level logic sitting in front of BMONI's proposal/approve flow.

| column          | type      | notes                                        |
|------------------|-----------|-------------------------------------------------|
| id               | uuid pk   |                                                 |
| goal_id          | uuid fk   | → goals.id                                      |
| requested_by     | uuid fk   | → users.id                                      |
| reason           | text      | optional free text                              |
| status           | text      | `pending` \| `approved` \| `rejected`           |
| quorum_required  | int       | e.g. majority of goal_members count             |
| created_at       | timestamp |                                                 |
| resolved_at      | timestamp | nullable                                       |

---

## `withdrawal_votes`

| column          | type      | notes                                    |
|------------------|-----------|---------------------------------------------|
| id               | uuid pk   |                                             |
| request_id       | uuid fk   | → withdrawal_requests.id                    |
| voter_id         | uuid fk   | → users.id                                  |
| vote             | boolean   | true = approve                              |
| voted_at         | timestamp |                                             |

Unique constraint on `(request_id, voter_id)` — one vote per member per
request.

---

## `payouts`
Log of actual money movement out of a goal (both normal completion payouts and
proportional refunds), for the demo's "proof it actually worked" screen.

| column          | type      | notes                                          |
|------------------|-----------|--------------------------------------------------|
| id               | uuid pk   |                                                  |
| goal_id          | uuid fk   | → goals.id                                       |
| recipient_user_id| uuid fk   | → users.id                                       |
| amount           | numeric   |                                                  |
| type             | text      | `completion_payout` \| `emergency_refund`        |
| bmoni_proposal_id| text      |                                                  |
| bmoni_status     | text      | mirrors BMONI proposal status                    |
| created_at       | timestamp |                                                  |

---

## Notes on design decisions

- **No separate "wallet" table** — a user's BMONI identifiers live directly on
  `users`, since each person has exactly one smart wallet in this scope
  (CNGN only, no multi-currency for the hackathon).
- **`goals.installment_amount` is stored, not recomputed on every read** — the
  calculator runs live in the UI when creating/editing a goal, but once set,
  the plan shouldn't silently shift if today's date changes; recompute only on
  explicit edit.
- **Contributors without accounts never get a `users` row** — only their name
  string in `contributions.contributor_name`. If they later need a refund
  (e.g. they were a full group member, not just a one-off well-wisher),
  they must already be a `goal_members` row with a real `users` account.
