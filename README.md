# Architectural plan for the app backend (Beta)
# README — Weekly Pools Betting (Credits) App

*Explainer, data schema, algorithms, and backend stack suggestion — written for a developer building the app we discussed.*

---

## Overview (short)

This app is a **weekly competition** where each active player receives **1000 credits** at the start of each week (Monday 12:00am EST → next Monday 12:00am EST). Players use credits to place wagers on real sports match markets (moneyline, spread, totals). The app is **NOT** a real-money sportsbook inside the product UI — credits are units. Real payouts are settled after each week from the weekly pool or prize rules. Pools are automatically **shuffled** into smaller groups (default max 100 players per pool) at the start of each week when total active players > 100.

This README explains how the app works, the expected data schema (Postgres), the main algorithms (grouping, settlement, buy-back, gating), API surface, and a recommended backend stack.

---

# Table of contents

1. How the app works (user flow)
2. Entities / Data model (Postgres schema + indexes)
3. Core algorithms (step-by-step)
4. API endpoints & sample payloads
5. Backend architecture & recommended stack
6. Scaling, performance & operational notes
7. Security, compliance & UX considerations
8. TODO / future features

---

# 1) How the app works (user flow)

**Weekly cycle**

* Week window: **Mon 00:00 EST → next Mon 00:00 EST**.
* At the *start* of each week:

  * All users who have active access (subscription/week pass) are eligible.
  * If total active users > `POOL_MAX_SIZE` (100), the system **shuffles** and assigns each active user into pools of at most 100 players for that week. Each pool runs independently (leaderboard, payouts).
  * Every player gets **1000 credits** for that week.

**During the week**

* Users place wagers (stake in credits) on markets (moneyline, spread, totals) visible on the Home → Game list → Market page.
* Bets deduct credits immediately when placed; user balance updates.
* Betting is disabled for a game once the official game start time arrives (lock-in).
* Players can place multiple wagers across games.

**Buy-back**

* If user hits 0 credits, they can **buy-back** (pay real money) for another 1000 credits once per week until Friday cutoff (client rule). Billing handled by payment gateway.

**End of week / Settlement**

* After all relevant matches have finished and results are known, a **settlement job** runs:

  * Resolve all bets in the week for each pool.
  * Update user credit balances and compute final leaderboard positions.
  * Compute payouts (per pool rules) and enqueue real-money payouts to connected payment processor (if applicable).
* Reset state for next week (or keep historical records).

---

# 2) Data schema (Postgres) — core tables

Below are minimal, practical tables. Add typical `created_at`, `updated_at`. Use `BIGINT` for counters where scale requires.

**Note:** Partition `bets` and `picks` by `week_id` (or range) to ease settlement.

### `users`

* `id` UUID PRIMARY KEY
* `username` TEXT UNIQUE
* `email` TEXT UNIQUE
* `password_hash` TEXT
* `is_active` BOOLEAN (account active)
* `subscription_status` ENUM('active','inactive','trial')
* `created_at` TIMESTAMP
* `profile_meta` JSONB (avatar, country, etc.)
* Indexes: `username`, `email`

### `weeks`

* `id` SERIAL PRIMARY KEY (or `text` like '2025-W14')
* `start_at` TIMESTAMP
* `end_at` TIMESTAMP
* `status` ENUM('open','closed','grouped','settled')
* `total_active_players` INTEGER
* `created_at` TIMESTAMP
* Index: `start_at`

### `pools`

* `id` UUID PRIMARY KEY
* `week_id` INTEGER REFERENCES weeks(id)
* `name` TEXT (e.g., `W2025-14-A`)
* `max_size` INTEGER DEFAULT 100
* `status` ENUM('active','closed','settled')
* `total_units` BIGINT (sum of stakes placed in pool if you maintain)
* `created_at` TIMESTAMP
* Index: `(week_id)`

### `pool_members`

* `id` UUID PRIMARY KEY
* `pool_id` UUID REFERENCES pools(id)
* `user_id` UUID REFERENCES users(id)
* `starting_credits` INTEGER DEFAULT 1000
* `credits_balance` INTEGER
* `joined_at` TIMESTAMP
* Unique index: `(pool_id, user_id)`

### `games` (the sporting contests)

* `id` UUID PRIMARY KEY
* `external_id` TEXT (from sports feed)
* `home_team` TEXT
* `away_team` TEXT
* `start_time` TIMESTAMP
* `league` TEXT
* `status` ENUM('scheduled','in_progress','finished','cancelled')
* `result` JSONB (final score etc.)
* Index: `(start_time)`

### `markets` (for a single game: ML/spread/total)

* `id` UUID PRIMARY KEY
* `game_id` UUID REFERENCES games(id)
* `market_type` ENUM('moneyline','spread','total','prop')
* `market_meta` JSONB (e.g., spread value, total line)
* `status` ENUM('open','closed','settled')
* `created_at` TIMESTAMP

### `odds` (market outcomes & odds)

* `id` UUID PRIMARY KEY
* `market_id` UUID REFERENCES markets(id)
* `outcome_id` TEXT (e.g., 'home','away','over','under')
* `american` INTEGER (e.g., +120, -140)
* `decimal` NUMERIC (1.8) — derived from american for calculations
* `created_at` TIMESTAMP
* Index: `(market_id, outcome_id)`

### `bets`

* `id` BIGSERIAL PRIMARY KEY
* `user_id` UUID REFERENCES users(id)
* `pool_id` UUID REFERENCES pools(id)
* `week_id` INTEGER REFERENCES weeks(id)
* `market_id` UUID REFERENCES markets(id)
* `odds_id` UUID REFERENCES odds(id)
* `outcome` TEXT
* `stake` INTEGER (credits staked)
* `payout` INTEGER (computed on settlement)
* `status` ENUM('placed','void','won','lost','settled')
* `placed_at` TIMESTAMP
* `settled_at` TIMESTAMP
* Partition by `week_id` (recommended)
* Indexes: `(user_id, week_id)`, `(pool_id, status)`, `(market_id)`

### `payments` (subscriptions, buy-backs, payouts)

* `id` UUID PRIMARY KEY
* `user_id` UUID
* `type` ENUM('weekly_pass','buy_back','payout')
* `amount_cents` INTEGER (money handled via gateway)
* `currency` TEXT
* `status` ENUM('pending','paid','failed','refunded')
* `provider_reference` TEXT
* `created_at` TIMESTAMP
* Index: `(user_id)`

### `leaderboard_snapshots` (optional)

* `id` UUID
* `week_id` INTEGER
* `pool_id` UUID
* `rank` INTEGER
* `user_id` UUID
* `final_credits` INTEGER
* `prize` INTEGER
* Index: `(week_id, pool_id)`

---

# Example SQL snippets

**Create bets partitioning by week (simplified)**

```sql
CREATE TABLE bets (
  id BIGSERIAL PRIMARY KEY,
  week_id INT NOT NULL,
  user_id UUID NOT NULL,
  pool_id UUID,
  market_id UUID,
  stake INT,
  status TEXT,
  placed_at TIMESTAMP DEFAULT now()
) PARTITION BY LIST (week_id);

-- Then create partitions for each new week, e.g.
CREATE TABLE bets_w2025_14 PARTITION OF bets FOR VALUES IN (202514);
```

(Or use range partitions.)

---

# 3) Core algorithms (step-by-step)

### A. Weekly grouping (runs at *Mon 00:00 EST*)

1. Query all `users` who are `subscription_status='active'` or bought a week pass and are allowed.
2. Shuffle the list with a cryptographically good RNG (or seeded PRNG if you want reproducible groups).
3. Partition into arrays of size `POOL_MAX_SIZE` (100). Last pool may be smaller.
4. Create `pools` rows (one per group) for the new `week_id`.
5. Insert `pool_members` rows for each assignment with `starting_credits = 1000`.
6. Mark `weeks.status = 'grouped'`.

**Python pseudocode**

```python
import random
def randomize_pools(user_ids, pool_size=100):
    shuffled = user_ids[:]
    random.shuffle(shuffled)
    pools = [shuffled[i:i+pool_size] for i in range(0, len(shuffled), pool_size)]
    return pools
```

**Important:** run inside a transaction or use optimistic locking to avoid race conditions. Use `SELECT ... FOR UPDATE` when reading eligible users if race risk exists.

---

### B. Placing a bet (API flow)

1. Client POST `/bets` with `{ user_id, market_id, outcome, stake }`.
2. Backend checks:

   * User is active for current week and part of a `pool`.
   * Market is `open` and `start_time` > now.
   * User has `credits_balance >= stake`.
3. Deduct stake from `pool_members.credits_balance` (atomic DB update).
4. Insert `bets` row.
5. Return bet confirmation.

**SQL atomic update example**

```sql
UPDATE pool_members
SET credits_balance = credits_balance - $stake
WHERE user_id = $user_id AND pool_id = $pool_id AND credits_balance >= $stake
RETURNING credits_balance;
```

If zero rows returned → reject (insufficient credits).

---

### C. Settling bets (batch job after games finish)

1. When a game finishes, mark `games.status = finished` and write results.
2. For each unsettled `market` of that game, compute outcome and find all bets for that market.
3. Process bets in **batches** (e.g., 50k–200k rows per batch):

   * For each bet:

     * If bet outcome matches result → compute payout: `profit = stake * (decimal_odds - 1)`. Payout returned = `stake + profit`.
     * Update `bets.status` and `bets.payout`.
     * Credit the `pool_members.credits_balance` accordingly (atomic updates), or accumulate deltas and apply as batch updates.
4. After all markets resolved for the week, compute `leaderboard` per pool by ordering `credits_balance` descending.
5. Compute prize allocation and enqueue payouts.

**Batch processing tips**

* Use a worker queue (BullMQ / Celery) to pull work and process in parallel.
* Use `FOR UPDATE SKIP LOCKED` to have multiple workers process partitions concurrently.

---

### D. Prize distribution (example logic)

* At week end, for each pool, sort by `final_credits`.
* Distribute prize pot (if you collect entry fees) or allocate fixed prizes to top N positions.
* Make `payments` records and call payment provider API to send payouts (outside the app UI — admin/processing job).

(Exact payout split must be defined by business rules; the README leaves this as configurable.)

---

### E. Buy-back logic

* If user `credits_balance == 0` and `now <= week_start + buyback_deadline (Friday 23:59)`, display UI to purchase buy-back.
* On successful payment `payments.status = 'paid'`, insert/update `pool_members.credits_balance += buyback_amount` (e.g., 1000 credits).
* Lock buy-back purchases to once per user per week if needed.

---

# 4) API endpoints (samples)

### Authentication

* `POST /auth/login` — body `{email,password}`
* `POST /auth/signup`

### Users / Account

* `GET /me` — returns user + current pool membership + current credits
* `GET /me/pool` — returns assigned pool and pool members (after grouping)

### Games & Markets

* `GET /games?date=YYYY-MM-DD` — list games
* `GET /games/:id/markets` — markets & odds

### Bets

* `POST /bets` — place bet `{market_id, outcome_id, stake}` -> returns bet confirmation
* `GET /bets?week=2025-W14` — user bet history
* `GET /bets/:id` — bet detail

### Pool / Leaderboard

* `GET /weeks/:id/pools/:pool_id/leaderboard` — returns ranks for pool
* `GET /weeks/:id/pools/:pool_id/members` — pool members list

### Payments

* `POST /payments/checkout` — create checkout session for weekly pass / buyback
* `GET /payments/:id` — payment status

### Admin

* `POST /admin/weeks/:id/group` — trigger grouping (unsafe for prod, but useful)
* `POST /admin/weeks/:id/settle` — trigger settlement for the week (job kick)

---

# 5) Backend architecture & suggested stack

You already use Next.js and Postgres — recommended architecture that fits your background and scaling needs:

### Frontend

* **React Native (Expo)** for mobile app
* **Next.js** for admin dashboard / web UI / marketing
* UI library: Tailwind or shadcn/ui (consistent with previous notes)

### API / Backend

* **Primary language**: **Node.js** (TypeScript)

  * Framework options:

    * **NestJS** — structured, dependency-injection, great for large systems
    * **Fastify** — extremely fast, low overhead
  * Alternative: **Python + FastAPI** if you prefer Python for workers (you mentioned FastAPI earlier).
* **ORM**: Prisma or Drizzle (you have Drizzle experience). Both work with Postgres.
* **Background workers**: Node worker using **BullMQ** (Redis) or Python **Celery** if Python workers.
* **Queue broker**: **Redis** (BullMQ) or RabbitMQ (if you want stronger durability). BullMQ + Redis is straightforward for job scheduling.
* **Cache**: **Redis** — cache leaderboards, pool counts, and serve read-heavy data.
* **Database**: **PostgreSQL**, hosted on Render/Cloud SQL/Azure DB.
* **Storage**: S3-compatible for media (avatars).
* **Payments**: Stripe (for buybacks and subscription / weekly pass). Use Stripe Checkout for hosted flow.
* **Notifications**: Firebase Cloud Messaging for mobile push, plus in-app banner service.
* **Deployment**: Vercel for Next.js, Render or Railway for backend, managed Postgres, Redis.

### Why this stack?

* Postgres gives strong relational semantics and partitioning.
* Node.js + TypeScript fits React Native / Next.js developer workflow.
* BullMQ + Redis offers reliable delayed jobs and concurrency control for settlement.
* Prisma/Drizzle simplify schema migrations and type-safe queries.

---

# 6) Scaling & operational notes

### Database scaling

* Partition `bets` table by `week_id`.
* Index `(week_id, user_id)` and `(pool_id, status)`.
* Use connection pooling (PgBouncer) for high concurrency.
* Use read-replicas for read-heavy endpoints (leaderboard).

### Worker scaling

* Settlement should run in **parallel** with batch ranges (e.g., process bets where `id BETWEEN x AND y`).
* Use `FOR UPDATE SKIP LOCKED` to avoid contention across workers.

### Caching

* Cache frequently read but infrequently changing items (game listings, market odds) in Redis.
* Leaderboard: cache top N frequently; rebuild on settlement or in small intervals.

### Monitoring & logging

* Sentry for crashes.
* Prometheus/Grafana for metrics.
* Structured logs for jobs and payment flows.

---

# 7) Security, compliance & UX notes

### Legal / compliance

* The product must **not** advertise real gambling inside the app UI. Always use "credits", "units", or "points". Do not use `$` or "bet real money" wording.
* Document that the system is a prize competition and ensure local gambling laws are considered (especially where real payouts are used).
* KYC may be required for payout amounts beyond local thresholds — plan for KYC.

### Anti-abuse

* Rate-limit endpoints.
* Use device fingerprinting and CAPTCHAs on suspicious accounts.
* Transactional integrity: always use DB transactions for balance updates + bet insertion.

### UX

* Show clear countdown to next cycle.
* Pre-week registration screen: show "You are registered for next week. Pool assignment happens Monday 00:00 EST."
* Show clear stake input and potential payout preview in units.
* Display "locked" markets when game start is near.

---

# 8) Example sequences: grouping & placing bet (end-to-end)

### User joins Friday

1. User pays weekly pass via Stripe — `payments` created and set to `paid`.
2. Mark user `subscription_status='active'` for the next week.
3. Monday 00:00 — grouping job runs: user assigned to `pool_A` for `week_id`.
4. User logs in Monday → `GET /me` returns `pool_id`, `credits_balance=1000`.
5. User navigates to a game and `POST /bets` with `stake=50`. Backend:

   * checks `credits_balance >= 50`
   * atomically deducts 50
   * inserts bet
6. Game finishes — settlement job credit user with payout if winning.

---

# 9) Example: compute payout from American odds

**Convert American to decimal:**

* If american >= 0: `decimal = 1 + (american / 100)`

  * +120 → 1 + 120/100 = 2.2
* If american < 0: `decimal = 1 + (100 / abs(american))`

  * -140 → 1 + 100/140 ≈ 1.7142857

**Payout = stake * decimal**
**Profit = stake * (decimal - 1)**

---

# 10) Dev checklist (first MVP)

* [ ] Schema migration and basic tables (users, weeks, pools, pool_members, games, markets, odds, bets, payments)
* [ ] Auth + subscription flow (Stripe integration)
* [ ] Weekly grouping cron job (triggerable via admin endpoint)
* [ ] Game listing + markets UI (Next.js + RN)
* [ ] Place bet endpoint with atomic balance deduction
* [ ] Simple settlement worker: resolve one market and update bets
* [ ] Leaderboard per pool + frontend display
* [ ] Buy-back flow
* [ ] Monitoring & error alerts

---

# 11) Appendix — sample API request: place a bet

**Request**

```
POST /api/bets
Authorization: Bearer <token>
Content-Type: application/json

{
  "market_id": "uuid-market-1",
  "odds_id": "uuid-odds-1",
  "outcome": "home",
  "stake": 50
}
```

**Response**

```json
{
  "bet_id": 12345,
  "status": "placed",
  "remaining_credits": 950,
  "potential_payout": 110
}
```



