# Parlay API Documentation


## Place Parlay Bet

`POST /api/bets/parlay`

### Request Body

```typescript
{
  user: string,           // User ID
  pool: string,           // Pool ID
  stake: number,          // Total wager amount
  legs: ParlayLeg[]       // 2-15 legs (min 2 required)
}
```

### ParlayLeg

```typescript
{
  eventID: string,        // Event ID from SportsGameOdds API
  leagueID: string,       // League ID (e.g., "NBA", "NFL")
  betType: BetType,       // "moneyline" | "spread" | "total" | "player_prop"
  selection: Selection,   // "home" | "away" | "over" | "under" | "yes" | "no"

  // Required for player_prop only:
  playerId?: string,
  playerName?: string,
  statType?: string,
  displayName?: string
}
```

### Rules

| Rule | Description |
|------|-------------|
| Min legs | 2 |
| Same game | Not allowed (correlated bets) |
| Max legs | 15 (configurable) |
| Credit check | Validates user has sufficient credits |

### Response

**Success (201)**

```json
{
  "success": true,
  "bet": { /* Bet object */ },
  "parlayInfo": {
    "legCount": 3,
    "combinedAmericanOdds": +596,
    "combinedDecimalOdds": 6.96,
    "impliedProbability": 14.4,
    "potentialPayout": 69.60,
    "potentialProfit": 59.60,
    "legs": [/* validated legs with locked odds */]
  },
  "message": "Parlay bet placed successfully"
}
```

**Error (400/404/500)**

```json
{
  "success": false,
  "error": "Error message"
}
```

### Example

```bash
curl -X POST /api/bets/parlay \
  -H "Content-Type: application/json" \
  -d '{
    "user": "user-123",
    "pool": "pool-456",
    "stake": 50,
    "legs": [
      {
        "eventID": "R2s1aC1rnosCvMM50qWu",
        "leagueID": "NBA",
        "betType": "moneyline",
        "selection": "home"
      },
      {
        "eventID": "K8m9bD2xwerTqNN61pVx",
        "leagueID": "NBA",
        "betType": "spread",
        "selection": "away"
      }
    ]
  }'
```

### Settlement Rules

| Outcome | Payout |
|---------|--------|
| All legs win | Stake × combined odds |
| Any leg loses | 0 |
| Some legs push | Recalculate odds without pushed legs |
| All legs push | Stake returned |
