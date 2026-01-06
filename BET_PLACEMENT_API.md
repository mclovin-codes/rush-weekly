# Bet Placement API

## Endpoint

**POST** `/api/bets/place`

Places game bets (moneyline, spread, total) or player prop bets with real-time odds validation.

---

## Request Body

### Game Bets

```typescript
{
  user: string                                    // User ID
  pool: string                                    // Pool ID
  eventID: string                                 // Event ID from SportsGameOdds API
  leagueID: string                                // League ID (e.g., "NFL", "NBA")
  betType: 'moneyline' | 'spread' | 'total'
  selection: 'home' | 'away' | 'over' | 'under'
  stake: number                                   // Credits to wager (≥ 1)
}
```

### Player Props

```typescript
{
  user: string                                    // User ID
  pool: string                                    // Pool ID
  eventID: string                                 // Event ID from SportsGameOdds API
  leagueID: string                                // League ID (e.g., "NFL", "NBA")
  betType: 'player_prop'
  selection: 'over' | 'under' | 'yes' | 'no'
  stake: number                                   // Credits to wager (≥ 1)

  // Player prop specific fields
  playerId: string                                // Player ID (e.g., "PATRICK_MAHOMES_1_NFL")
  playerName: string                              // Player display name
  statType: string                                // Stat ID (e.g., "passing_yards", "points")
  displayName: string                             // Human-readable stat (e.g., "Passing Yards")
  category: string                                // Stat category (e.g., "passing", "scoring")
}
```

---

## Examples

### Moneyline Bet

```javascript
await fetch('/api/bets/place', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user: 'user-id',
    pool: 'pool-id',
    eventID: 'R2s1aC1rnosCvMM50qWu',
    leagueID: 'NFL',
    betType: 'moneyline',
    selection: 'home',
    stake: 100
  })
})
```

### Spread Bet

```javascript
await fetch('/api/bets/place', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user: 'user-id',
    pool: 'pool-id',
    eventID: 'R2s1aC1rnosCvMM50qWu',
    leagueID: 'NFL',
    betType: 'spread',
    selection: 'away',
    stake: 50
  })
})
```

### Player Prop Bet

```javascript
await fetch('/api/bets/place', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user: 'user-id',
    pool: 'pool-id',
    eventID: 'R2s1aC1rnosCvMM50qWu',
    leagueID: 'NFL',
    betType: 'player_prop',
    selection: 'over',
    stake: 75,
    playerId: 'PATRICK_MAHOMES_1_NFL',
    playerName: 'Patrick Mahomes',
    statType: 'passing_yards',
    displayName: 'Passing Yards',
    category: 'passing'
  })
})
```

---

## Response

### Success (201)

```json
{
  "success": true,
  "bet": {
    "id": "bet-id",
    "user": "user-id",
    "pool": "pool-id",
    "game": "game-id",
    "betType": "player_prop",
    "selection": "over",
    "stake": 75,
    "oddsAtPlacement": -110,
    "lineAtPlacement": 275.5,
    "status": "pending",
    "payout": 0,
    "playerPropData": {
      "playerId": "PATRICK_MAHOMES_1_NFL",
      "playerName": "Patrick Mahomes",
      "statType": "passing_yards",
      "displayName": "Passing Yards",
      "category": "passing"
    }
  },
  "message": "Bet placed successfully"
}
```

### Error (400/404/500)

```json
{
  "success": false,
  "error": "Insufficient credits. Available: 50, Required: 100"
}
```

---

## Validation

The API validates and returns specific errors for:

| Check | Error Message |
|-------|---------------|
| Missing fields | `"Missing required fields: user, pool, eventID..."` |
| Insufficient credits | `"Insufficient credits. Available: X, Required: Y"` |
| Game not found | `"Event {eventID} not found in API"` |
| Game started | `"Cannot place bet on a game that has already started"` |
| Odds unavailable | `"Moneyline odds not available for home team"` |
| Duplicate bet (game bets) | Prevented by collection hook (1 game bet per game) |
| Duplicate bet (player props) | Prevented by collection hook (10 player props per game, no duplicates) |

---

## How It Works

1. **Validates** user credits and required fields
2. **Fetches** latest odds from SportsGameOdds API by eventID
3. **Checks** game hasn't started
4. **Extracts** odds using oddID format:
   - Game bets: `points-{home|away}-game-{ml|sp}-{home|away}`
   - Totals: `points-all-game-ou-{over|under}`
   - Player props: `{statType}-{playerId}-game-{ou|yn}-{selection}`
5. **Upserts** game record if it doesn't exist
6. **Creates** bet with snapshot of odds and line at placement
7. **Deducts** credits via collection hook

---

## TypeScript Types

```typescript
type GameBet = {
  user: string
  pool: string
  eventID: string
  leagueID: string
  betType: 'moneyline' | 'spread' | 'total'
  selection: 'home' | 'away' | 'over' | 'under'
  stake: number
}

type PlayerPropBet = {
  user: string
  pool: string
  eventID: string
  leagueID: string
  betType: 'player_prop'
  selection: 'over' | 'under' | 'yes' | 'no'
  stake: number
  playerId: string
  playerName: string
  statType: string
  displayName: string
  category: string
}

type PlaceBetRequest = GameBet | PlayerPropBet

type PlaceBetResponse = {
  success: boolean
  bet?: {
    id: string
    betType: string
    selection: string
    stake: number
    oddsAtPlacement: number
    lineAtPlacement: number | null
    status: 'pending'
    payout: 0
    playerPropData?: {
      playerId: string
      playerName: string
      statType: string
      displayName: string
      category: string
    }
  }
  error?: string
  message?: string
}
```

---

## React Hook Example

```typescript
import { useState } from 'react'

export function usePlaceBet() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const placeBet = async (betData: PlaceBetRequest) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/bets/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(betData)
      })

      const data: PlaceBetResponse = await response.json()

      if (!data.success) {
        setError(data.error || 'Failed to place bet')
        return null
      }

      return data.bet
    } catch {
      setError('Network error')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { placeBet, loading, error }
}
```

---

**Last Updated:** January 6, 2026
