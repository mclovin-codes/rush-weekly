# Fantasy Pool API Documentation

> Complete API reference for the Fantasy Pool application built with Payload CMS

**Current Version:** 1.2 (Updated January 2026)

---

## ⚠️ Breaking Changes in v1.2

### Pools Collection Field Names Updated

The following fields in the `pools` collection have been renamed to use snake_case:

| Old Field Name | New Field Name | Type |
|----------------|----------------|------|
| `weekStart` | `week_start` | date |
| `weekEnd` | `week_end` | date |
| `isActive` | `is_active` | boolean |
| `starting_credits` | `starting_credits` | number (unchanged) |

**Migration Checklist for Frontend:**
- [ ] Update TypeScript interfaces/types for Pool model
- [ ] Update all API calls that create/update pools
- [ ] Update query filters using `isActive` → `is_active`
- [ ] Update any form inputs or UI components displaying pool data
- [ ] Test pool listing, creation, and filtering functionality

**Example Updates:**

```typescript
// ❌ OLD - Will cause errors
const activePool = await fetch('/api/pools?where[isActive][equals]=true')
const pool = { weekStart: '2024-01-01', weekEnd: '2024-01-07', isActive: true }

// ✅ NEW - Correct
const activePool = await fetch('/api/pools?where[is_active][equals]=true')
const pool = { week_start: '2024-01-01', week_end: '2024-01-07', is_active: true }
```

---

## Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Virtual Economy & Gateway](#virtual-economy--gateway)
- [Sports](#sports)
- [Leagues](#leagues)
- [Teams](#teams)
- [Games](#games)
- [Game Odds](#game-odds)
- [Users](#users)
- [Pools](#pools)
- [Pool Memberships](#pool-memberships)
- [Bets](#bets)
- [Query Parameters](#query-parameters)
- [Response Format](#response-format)

---

## Overview

This API provides endpoints for managing a fantasy sports pool platform with support for multiple sports, leagues, teams, games, betting odds, and user pool participation.

**Key Features:**
- Weekly pool-based competition system
- Virtual credit economy with subscription gateway
- Real-time odds tracking from external APIs
- Support for Moneyline, Spread, and Total (Over/Under) bets

## Base URL

```
https://your-domain.com/api
```

## Authentication

Authentication is handled through Better Auth plugin integrated with PayloadCMS.

**Auth Endpoints:**
- `POST /api/auth/sign-up/email` - Register new user
- `POST /api/auth/sign-in/email` - Login
- `POST /api/auth/sign-out` - Logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/verify-email` - Verify email address

---

## Virtual Economy & Gateway

The platform operates a **subscription-based virtual credit system** where users compete for weekly rankings using virtual credits.

### Key Concepts

**1. Membership Gateway**
- Users must have an active paid membership (`is_paid_member = true`) to participate in weekly pools
- Subscription status is checked via `subscription_end_date` field
- Only active members are included in the weekly pool shuffle

**2. Weekly Credit Allocation**
- Each pool week, active members receive a fresh allocation of credits (default: 1000)
- Credits are tracked via `current_credits` field on the user
- Credits reset at the beginning of each new pool week

**3. Credit Management**
- Users start with 0 credits until assigned to a pool
- Credits are deducted when placing bets
- Winning bets add payout to `current_credits`
- If credits reach zero mid-week, users must purchase additional credits to continue

**4. Weekly Lifecycle**
- **Sunday Night (23:59 UTC):** Pools lock, final settlement runs, leaderboards finalized
- **Monday Morning (00:01 UTC):** Active members shuffled into new pools, credits reset to starting amount

### Implementation Notes for Frontend

```typescript
// Check if user can access betting features
const canParticipate = user.is_paid_member &&
  new Date(user.subscription_end_date) > new Date()

// Check if user needs to purchase credits
const needsCredits = user.current_credits === 0

// Display user's current balance
<Text>Balance: {user.current_credits} credits</Text>
```

---

## Sports

Manage sports categories (e.g., NFL, NBA, MLB).

### Get all sports

```http
GET /api/sports
```

**Response:**
```json
{
  "docs": [
    {
      "id": "sport_id",
      "externalId": "nfl",
      "name": "NFL",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "totalDocs": 1,
  "limit": 10,
  "page": 1
}
```

### Get sport by ID

```http
GET /api/sports/:id
```

### Create sport

```http
POST /api/sports
```

**Request Body:**
```json
{
  "externalId": "nfl",
  "name": "NFL"
}
```

**Required Fields:**
- `externalId` (string, unique) - External API identifier
- `name` (string) - Display name

### Update sport

```http
PATCH /api/sports/:id
```

**Request Body:**
```json
{
  "name": "National Football League"
}
```

### Delete sport

```http
DELETE /api/sports/:id
```

---

## Leagues

Manage leagues within sports (e.g., NFL Regular Season, NBA Playoffs).

### Get all leagues

```http
GET /api/leagues
```

### Get league by ID

```http
GET /api/leagues/:id
```

### Create league

```http
POST /api/leagues
```

**Request Body:**
```json
{
  "externalId": "nfl-2024",
  "sport": "sport_id",
  "name": "NFL 2024 Season",
  "active": true
}
```

**Required Fields:**
- `externalId` (string, unique)
- `sport` (relationship) - ID of the sport
- `name` (string)

**Optional Fields:**
- `active` (boolean, default: true)

### Update league

```http
PATCH /api/leagues/:id
```

### Delete league

```http
DELETE /api/leagues/:id
```

---

## Teams

Manage teams within leagues.

### Get all teams

```http
GET /api/teams
```

### Get team by ID

```http
GET /api/teams/:id
```

### Create team

```http
POST /api/teams
```

**Request Body:**
```json
{
  "externalId": "buf",
  "league": "league_id",
  "name": "Buffalo Bills",
  "abbreviation": "BUF",
  "logoUrl": "https://example.com/logos/buf.png"
}
```

**Required Fields:**
- `externalId` (string, unique)
- `league` (relationship) - ID of the league
- `name` (string)

**Optional Fields:**
- `abbreviation` (string)
- `logoUrl` (string)

### Update team

```http
PATCH /api/teams/:id
```

### Delete team

```http
DELETE /api/teams/:id
```

---

## Games

Manage scheduled and completed games.

### Get all games

```http
GET /api/games
```

### Get game by ID

```http
GET /api/games/:id
```

### Create game

```http
POST /api/games
```

**Request Body:**
```json
{
  "externalId": "nfl-2024-w1-buf-mia",
  "league": "league_id",
  "homeTeam": "team_id",
  "awayTeam": "team_id",
  "startTime": "2024-09-08T13:00:00Z",
  "status": "scheduled",
  "homeScore": null,
  "awayScore": null
}
```

**Required Fields:**
- `externalId` (string, unique)
- `league` (relationship)
- `homeTeam` (relationship)
- `awayTeam` (relationship)
- `startTime` (date/time)
- `status` (select)

**Status Options:**
- `scheduled` - Game not yet started
- `live` - Game in progress
- `finalized` - Game completed
- `canceled` - Game canceled

**Score Fields (visible when status = finalized):**
- `homeScore` (number)
- `awayScore` (number)

### Update game

```http
PATCH /api/games/:id
```

**Example: Finalize game**
```json
{
  "status": "finalized",
  "homeScore": 31,
  "awayScore": 24
}
```

### Delete game

```http
DELETE /api/games/:id
```

---

## Game Odds

Manage betting odds for games.

### Get all game odds

```http
GET /api/game-odds
```

### Get odds by ID

```http
GET /api/game-odds/:id
```

### Create game odds

```http
POST /api/game-odds
```

**Request Body:**
```json
{
  "game": "game_id",
  "provider": "primary",
  "moneyline": {
    "home": -150,
    "away": 130
  },
  "spread": {
    "home": -110,
    "point": -3.5,
    "away": -110
  },
  "total": {
    "overPayout": -110,
    "underPayout": -110,
    "point": 47.5
  },
  "isActive": true
}
```

**Required Fields:**
- `game` (relationship)

**Optional Fields:**
- `provider` (string, default: "primary")
- `moneyline` (group)
  - `home` (number) - Home team moneyline (e.g., -150)
  - `away` (number) - Away team moneyline (e.g., 130)
- `spread` (group)
  - `home` (number) - Home payout (e.g., -110)
  - `point` (number) - Point handicap (e.g., -3.5)
  - `away` (number) - Away payout (e.g., -110)
- `total` (group)
  - `overPayout` (number) - Over payout (e.g., -110)
  - `underPayout` (number) - Under payout (e.g., -110)
  - `point` (number) - Total line (e.g., 47.5)
- `isActive` (boolean, default: true)

### Update game odds

```http
PATCH /api/game-odds/:id
```

**Example: Update spread**
```json
{
  "spread": {
    "home": -110,
    "point": -4.5,
    "away": -110
  }
}
```

### Delete game odds

```http
DELETE /api/game-odds/:id
```

---

## Users

Manage user accounts, credits, and subscription status.

### Get all users

```http
GET /api/users
```

**Response:**
```json
{
  "docs": [
    {
      "id": "user_id",
      "username": "john",
      "email": "john@example.com",
      "current_credits": 850,
      "is_paid_member": true,
      "subscription_end_date": "2025-01-15T00:00:00.000Z",
      "createdAt": "2024-12-01T00:00:00.000Z",
      "updatedAt": "2024-12-12T00:00:00.000Z"
    }
  ],
  "totalDocs": 1,
  "limit": 10,
  "page": 1
}
```

### Get user by ID

```http
GET /api/users/:id
```

### Get current user

```http
GET /api/users/me
```

Returns the authenticated user's data.

### Create user

Users are typically created through the auth signup flow, but can also be created directly:

```http
POST /api/users
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123",
  "current_credits": 0,
  "is_paid_member": false,
  "subscription_end_date": null
}
```

**Required Fields:**
- `email` (string) - Required by Better Auth
- `password` (string) - Required by Better Auth

**Optional Fields:**
- `username` (string, unique) - Auto-generated from email if not provided
- `current_credits` (number, default: 0, min: 0) - Virtual currency balance
- `is_paid_member` (boolean, default: false) - Active subscription status
- `subscription_end_date` (date) - When subscription expires

### Update user

```http
PATCH /api/users/:id
```

**Example: Update credits after bet payout**
```json
{
  "current_credits": 950
}
```

**Example: Activate membership**
```json
{
  "is_paid_member": true,
  "subscription_end_date": "2025-01-15T23:59:59.000Z"
}
```

### Purchase Credits (Custom Endpoint)

```http
POST /api/users/:id/purchase-credits
```

**Request Body:**
```json
{
  "amount": 500,
  "paymentToken": "payment_token_from_provider"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "current_credits": 1500,
    "is_paid_member": true,
    "subscription_end_date": "2025-01-20T00:00:00.000Z"
  }
}
```

**Notes:**
- This endpoint handles both credit purchases and membership activation
- Payment processing should be integrated with your payment provider
- Updates both `current_credits` and subscription status

### Delete user

```http
DELETE /api/users/:id
```

---

## Pools

Manage weekly betting pools.

> **⚠️ IMPORTANT SCHEMA UPDATE (January 2026):**
> Pool field names have been updated to use snake_case for database consistency:
> - `weekStart` → `week_start`
> - `weekEnd` → `week_end`
> - `isActive` → `is_active`
> - `starting_credits` (unchanged)
>
> **Frontend developers:** Update all API calls and type definitions to use the new field names.

### Get all pools

```http
GET /api/pools
```

**Response:**
```json
{
  "docs": [
    {
      "id": "pool_id",
      "week_start": "2024-12-09",
      "week_end": "2024-12-15",
      "starting_credits": 1000,
      "is_active": true,
      "createdAt": "2024-12-09T00:01:00.000Z",
      "updatedAt": "2024-12-09T00:01:00.000Z"
    }
  ],
  "totalDocs": 1,
  "limit": 10,
  "page": 1
}
```

### Get pool by ID

```http
GET /api/pools/:id
```

### Get active pool

```http
GET /api/pools?where[is_active][equals]=true&limit=1
```

Returns the current active pool for the week.

### Create pool

```http
POST /api/pools
```

**Request Body:**
```json
{
  "week_start": "2024-12-09",
  "week_end": "2024-12-15",
  "starting_credits": 1000,
  "is_active": true
}
```

**Required Fields:**
- `week_start` (date) - Start date of the pool week
- `week_end` (date) - End date of the pool week
- `starting_credits` (number, default: 1000) - Initial credit amount for all members

**Optional Fields:**
- `is_active` (boolean, default: true) - Whether this pool is currently active

**Notes:**
- `starting_credits` determines how many credits each member receives at the beginning of this pool week
- Typically only one pool should be active at a time
- Pools are usually created automatically by the weekly shuffle algorithm

### Update pool

```http
PATCH /api/pools/:id
```

**Example: Deactivate pool**
```json
{
  "is_active": false
}
```

### Delete pool

```http
DELETE /api/pools/:id
```

---

## Pool Memberships

Manage user participation in pools.

### Get all memberships

```http
GET /api/pool-memberships
```

**Response:**
```json
{
  "docs": [
    {
      "id": "membership_id",
      "pool": "pool_id",
      "user": "user_id",
      "score": 250,
      "initial_credits_at_start": 1000,
      "createdAt": "2024-12-09T00:01:00.000Z",
      "updatedAt": "2024-12-12T16:30:00.000Z"
    }
  ],
  "totalDocs": 1,
  "limit": 10,
  "page": 1
}
```

### Get membership by ID

```http
GET /api/pool-memberships/:id
```

### Get user's current pool membership

```http
GET /api/pool-memberships?where[user][equals]=:user_id&where[pool.is_active][equals]=true&depth=1
```

Returns the user's membership in the currently active pool.

### Get pool leaderboard

```http
GET /api/pool-memberships?where[pool][equals]=:pool_id&sort=-score&depth=1
```

Returns all memberships for a pool, sorted by score (highest first).

### Create membership

```http
POST /api/pool-memberships
```

**Request Body:**
```json
{
  "pool": "pool_id",
  "user": "user_id",
  "score": 0,
  "initial_credits_at_start": 1000
}
```

**Required Fields:**
- `pool` (relationship) - The pool this membership belongs to
- `user` (relationship) - The user participating in the pool
- `initial_credits_at_start` (number) - Credits assigned to user at the beginning of this pool week

**Optional Fields:**
- `score` (number, default: 0) - Weekly performance score (typically based on credit balance)

**Notes:**
- Memberships are typically created automatically during the weekly shuffle
- `initial_credits_at_start` should match the pool's `starting_credits` value
- The score is calculated based on the user's credit balance at the end of the week

### Update membership

```http
PATCH /api/pool-memberships/:id
```

**Example: Update score**
```json
{
  "score": 1250
}
```

**Example: Record final standings**
```json
{
  "score": 1450
}
```

### Delete membership

```http
DELETE /api/pool-memberships/:id
```

---

## Bets

Manage user bets on games.

### Get all bets

```http
GET /api/bets
```

### Get bet by ID

```http
GET /api/bets/:id
```

### Create bet

```http
POST /api/bets
```

**Request Body:**
```json
{
  "user": "user_id",
  "pool": "pool_id",
  "game": "game_id",
  "betType": "spread",
  "selection": "home",
  "stake": 10,
  "oddsAtPlacement": -110,
  "lineAtPlacement": -3.5,
  "status": "pending",
  "payout": 0
}
```

**Required Fields:**
- `user` (relationship)
- `pool` (relationship)
- `game` (relationship)
- `betType` (select): `moneyline`, `spread`, `total`
- `selection` (select): `home`, `away`, `over`, `under`
- `stake` (number, min: 1)
- `oddsAtPlacement` (number) - Odds locked at bet placement (e.g., -110)
- `status` (select, default: "pending")

**Optional Fields:**
- `lineAtPlacement` (number) - Line locked at bet placement (e.g., -3.5 or 47.5)
- `payout` (number, default: 0)

**Status Options:**
- `pending` - Bet placed, game not finalized
- `won` - Bet won
- `lost` - Bet lost
- `push` - Bet tied (stake returned)

**Bet Type and Selection Combinations:**
- **Moneyline**: `home` or `away`
- **Spread**: `home` or `away`
- **Total**: `over` or `under`

### Update bet

```http
PATCH /api/bets/:id
```

**Example: Finalize bet**
```json
{
  "status": "won",
  "payout": 19.09
}
```

### Delete bet

```http
DELETE /api/bets/:id
```

**Important Validation Rules:**
- User must have `is_paid_member = true` to place bets
- User must have sufficient `current_credits` >= `stake`
- Game must not have started yet (`status = 'scheduled'`)
- Odds must be active (`isActive = true`)
- When bet is placed, `stake` is deducted from `user.current_credits`
- When bet is settled, `payout` is added to `user.current_credits`

---

## Query Parameters

All GET endpoints support Payload CMS query parameters for filtering, sorting, and pagination.

### Pagination

```http
GET /api/games?limit=20&page=2
```

- `limit` (number) - Results per page (default: 10)
- `page` (number) - Page number (default: 1)

### Sorting

```http
GET /api/games?sort=-startTime
```

- `sort` (string) - Field to sort by
- Prefix with `-` for descending order
- Examples: `sort=name`, `sort=-createdAt`

### Filtering

```http
GET /api/games?where[status][equals]=live
```

**Operators:**
- `equals` - Exact match
- `not_equals` - Not equal
- `greater_than` - Greater than
- `greater_than_equal` - Greater than or equal
- `less_than` - Less than
- `less_than_equal` - Less than or equal
- `like` - Contains (case-insensitive)
- `in` - In array
- `not_in` - Not in array
- `exists` - Field exists (true/false)

**Examples:**
```http
# Games that are live
GET /api/games?where[status][equals]=live

# Bets for a specific user
GET /api/bets?where[user][equals]=user_id

# Games starting after a date
GET /api/games?where[startTime][greater_than]=2024-01-01T00:00:00Z

# Active leagues
GET /api/leagues?where[active][equals]=true
```

### Relationship Population

```http
GET /api/bets?depth=2
```

- `depth` (number) - How many levels deep to populate relationships
- `depth=0` - No population (IDs only)
- `depth=1` - Populate first level
- `depth=2` - Populate nested relationships

**Example with depth:**
```http
# Get bets with full game, team, and user details
GET /api/bets?depth=3
```

### Complex Queries

Combine multiple parameters:

```http
GET /api/games?where[status][equals]=live&where[league][equals]=league_id&depth=2&sort=-startTime&limit=10
```

```http
# Get all pending bets for a user in an active pool
GET /api/bets?where[user][equals]=user_id&where[status][equals]=pending&where[pool.is_active][equals]=true&depth=1
```

---

## Response Format

### Success Response

```json
{
  "docs": [
    {
      "id": "document_id",
      "field1": "value1",
      "field2": "value2",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "totalDocs": 100,
  "limit": 10,
  "totalPages": 10,
  "page": 1,
  "pagingCounter": 1,
  "hasPrevPage": false,
  "hasNextPage": true,
  "prevPage": null,
  "nextPage": 2
}
```

### Single Document Response

```json
{
  "id": "document_id",
  "field1": "value1",
  "field2": "value2",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Error Response

```json
{
  "errors": [
    {
      "message": "Error description",
      "field": "fieldName"
    }
  ]
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## Examples

### Create a complete betting workflow

#### 1. Create a sport
```http
POST /api/sports
{
  "externalId": "nfl",
  "name": "NFL"
}
```

#### 2. Create a league
```http
POST /api/leagues
{
  "externalId": "nfl-2024",
  "sport": "sport_id",
  "name": "NFL 2024 Season",
  "active": true
}
```

#### 3. Create teams
```http
POST /api/teams
{
  "externalId": "buf",
  "league": "league_id",
  "name": "Buffalo Bills",
  "abbreviation": "BUF"
}
```

#### 4. Create a game
```http
POST /api/games
{
  "externalId": "nfl-2024-w1-buf-mia",
  "league": "league_id",
  "homeTeam": "bills_id",
  "awayTeam": "dolphins_id",
  "startTime": "2024-09-08T13:00:00Z",
  "status": "scheduled"
}
```

#### 5. Add game odds
```http
POST /api/game-odds
{
  "game": "game_id",
  "spread": {
    "home": -110,
    "point": -3.5,
    "away": -110
  }
}
```

#### 6. Create a pool
```http
POST /api/pools
{
  "week_start": "2024-09-08",
  "week_end": "2024-09-14",
  "starting_credits": 1000,
  "is_active": true
}
```

#### 7. Activate user membership
```http
PATCH /api/users/:user_id
{
  "is_paid_member": true,
  "subscription_end_date": "2024-09-30T23:59:59.000Z",
  "current_credits": 1000
}
```

#### 8. User joins pool
```http
POST /api/pool-memberships
{
  "pool": "pool_id",
  "user": "user_id",
  "score": 0,
  "initial_credits_at_start": 1000
}
```

#### 9. User places a bet
```http
POST /api/bets
{
  "user": "user_id",
  "pool": "pool_id",
  "game": "game_id",
  "betType": "spread",
  "selection": "home",
  "stake": 10,
  "oddsAtPlacement": -110,
  "lineAtPlacement": -3.5,
  "status": "pending"
}
```

#### 10. Finalize game
```http
PATCH /api/games/:game_id
{
  "status": "finalized",
  "homeScore": 31,
  "awayScore": 24
}
```

#### 11. Settle bet and update user credits
```http
PATCH /api/bets/:bet_id
{
  "status": "won",
  "payout": 19.09
}
```

```http
PATCH /api/users/:user_id
{
  "current_credits": 1009.09
}
```

#### 12. Update pool membership score
```http
PATCH /api/pool-memberships/:membership_id
{
  "score": 1009.09
}
```

---

## Notes

### General
- All timestamps are in ISO 8601 format
- All IDs are UUIDs generated by PayloadCMS
- Relationship fields accept either the related document's ID or the full document object
- The `externalId` fields are used for syncing with external sports data APIs

### Virtual Economy
- **Gateway Requirement:** Users must have `is_paid_member = true` to access betting features
- **Credit System:** Users start with 0 credits until assigned to a pool
- **Weekly Reset:** Credits are reset to pool's `starting_credits` value at the beginning of each week
- **Credit Balance:** Prevents negative balances (min: 0)
- **Subscription:** Users can purchase credits and activate membership via the purchase endpoint

### Betting Rules
- Stakes are deducted from `current_credits` when bet is placed
- Payouts are added to `current_credits` when bet is settled
- Users cannot bet if `current_credits < stake`
- Bet validation hooks ensure data integrity

### Weekly Lifecycle
- **Sunday 23:59 UTC:** Pools lock, bets settled, leaderboards finalized
- **Monday 00:01 UTC:** New pools created, active members shuffled, credits allocated

---

## Changelog

### Version 1.2 (January 2026)
- **Breaking Change:** Updated Pools collection field names to snake_case:
  - `weekStart` → `week_start`
  - `weekEnd` → `week_end`
  - `isActive` → `is_active`
- Fixed settlement service to properly handle populated relationship objects
- Added automatic `initial_credits_at_start` initialization for pool memberships
- Improved score calculation in settlement process

### Version 1.1 (December 2024)
- Initial API documentation
- Virtual economy and subscription gateway system
- Complete betting workflow

---

**Current Version:** 1.2
**Last Updated:** January 2026
**Payload CMS Version:** 3.x
**Auth System:** Better Auth Plugin