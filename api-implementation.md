# Fantasy Pool API Documentation

> Complete API reference for the Fantasy Pool application built with Payload CMS

## Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
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

## Base URL

```
https://your-domain.com/api
```

## Authentication

Authentication is handled through Payload CMS's built-in auth system on the `users` collection.

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

Manage user accounts and credits.

### Get all users

```http
GET /api/users
```

### Get user by ID

```http
GET /api/users/:id
```

### Create user

```http
POST /api/users
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123",
  "credits": 100
}
```

**Required Fields:**
- `username` (string, unique)
- `email` (string) - Required by Payload auth
- `password` (string) - Required by Payload auth

**Optional Fields:**
- `credits` (number, default: 100, min: 0)

### Update user

```http
PATCH /api/users/:id
```

**Example: Add credits**
```json
{
  "credits": 150
}
```

### Delete user

```http
DELETE /api/users/:id
```

---

## Pools

Manage weekly betting pools.

### Get all pools

```http
GET /api/pools
```

### Get pool by ID

```http
GET /api/pools/:id
```

### Create pool

```http
POST /api/pools
```

**Request Body:**
```json
{
  "weekStart": "2024-09-01",
  "weekEnd": "2024-09-07",
  "isActive": true
}
```

**Required Fields:**
- `weekStart` (date) - Start date of the pool week
- `weekEnd` (date) - End date of the pool week

**Optional Fields:**
- `isActive` (boolean, default: true)

### Update pool

```http
PATCH /api/pools/:id
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

### Get membership by ID

```http
GET /api/pool-memberships/:id
```

### Create membership

```http
POST /api/pool-memberships
```

**Request Body:**
```json
{
  "pool": "pool_id",
  "user": "user_id",
  "score": 0
}
```

**Required Fields:**
- `pool` (relationship)
- `user` (relationship)

**Optional Fields:**
- `score` (number, default: 0)

### Update membership

```http
PATCH /api/pool-memberships/:id
```

**Example: Update score**
```json
{
  "score": 150
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

**Note:** The Bets collection includes hooks for validation:
- Checks if user has enough credits (on create)
- Verifies game hasn't started (on create)
- Confirms odds are still active (on create)

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
GET /api/bets?where[user][equals]=user_id&where[status][equals]=pending&where[pool.isActive][equals]=true&depth=1
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
  "weekStart": "2024-09-08",
  "weekEnd": "2024-09-14",
  "isActive": true
}
```

#### 7. User joins pool
```http
POST /api/pool-memberships
{
  "pool": "pool_id",
  "user": "user_id",
  "score": 0
}
```

#### 8. User places a bet
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

#### 9. Finalize game
```http
PATCH /api/games/:game_id
{
  "status": "finalized",
  "homeScore": 31,
  "awayScore": 24
}
```

#### 10. Settle bet
```http
PATCH /api/bets/:bet_id
{
  "status": "won",
  "payout": 19.09
}
```

---

## Notes

- All timestamps are in ISO 8601 format
- All IDs are UUIDs generated by Payload CMS
- Relationship fields accept either the related document's ID or the full document object
- The `externalId` fields are used for syncing with external sports data APIs
- Credits system prevents negative balances (min: 0)
- Bet validation hooks ensure data integrity (commented out in code, implement as needed)

---

**Version:** 1.0  
**Last Updated:** December 2024  
**Payload CMS Version:** 3.x