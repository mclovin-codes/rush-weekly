# Bet Placement API Documentation

## Overview

This document describes the new bet placement API endpoint that provides better error handling and clearer error messages for the frontend.

**Why this endpoint?**
- Returns specific, user-friendly error messages
- Prevents duplicate bets on the same game
- Provides clear validation feedback
- Better error handling than the generic Payload API

---

## Endpoint

### Place a Bet

**POST** `/api/bets/place`

Creates a new bet with comprehensive validation and clear error messages.

---

## Request

### Headers

```http
Content-Type: application/json
```

### Request Body

```typescript
{
  user: string          // User ID (UUID)
  pool: string          // Pool ID (UUID)
  game: string          // Game ID (UUID)
  betType: 'moneyline' | 'spread' | 'total'
  selection: 'home' | 'away' | 'over' | 'under'
  stake: number         // Amount to bet (minimum: 1)
  oddsAtPlacement: number    // Odds locked at placement (e.g., -110)
  lineAtPlacement?: number   // Line locked at placement (e.g., -3.5 or 47.5) - Optional
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user` | string | ✅ | The ID of the user placing the bet |
| `pool` | string | ✅ | The ID of the current active pool |
| `game` | string | ✅ | The ID of the game to bet on |
| `betType` | string | ✅ | Type of bet: `moneyline`, `spread`, or `total` |
| `selection` | string | ✅ | What you're betting on: `home`, `away`, `over`, or `under` |
| `stake` | number | ✅ | Amount of credits to wager (must be ≥ 1) |
| `oddsAtPlacement` | number | ✅ | The odds at the time of placement (e.g., -110, +150) |
| `lineAtPlacement` | number | ❌ | The point spread or total line (e.g., -3.5, 47.5). Required for spread and total bets |

### Example Request

```javascript
const response = await fetch('/api/bets/place', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    user: '123e4567-e89b-12d3-a456-426614174000',
    pool: '123e4567-e89b-12d3-a456-426614174001',
    game: '123e4567-e89b-12d3-a456-426614174002',
    betType: 'spread',
    selection: 'home',
    stake: 100,
    oddsAtPlacement: -110,
    lineAtPlacement: -3.5
  })
})

const data = await response.json()
```

---

## Response

### Success Response (201 Created)

```json
{
  "success": true,
  "bet": {
    "id": "123e4567-e89b-12d3-a456-426614174003",
    "user": "123e4567-e89b-12d3-a456-426614174000",
    "pool": "123e4567-e89b-12d3-a456-426614174001",
    "game": "123e4567-e89b-12d3-a456-426614174002",
    "betType": "spread",
    "selection": "home",
    "stake": 100,
    "oddsAtPlacement": -110,
    "lineAtPlacement": -3.5,
    "status": "pending",
    "payout": 0,
    "createdAt": "2024-12-22T10:30:00.000Z",
    "updatedAt": "2024-12-22T10:30:00.000Z"
  }
}
```

### Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

#### Possible Error Messages

| HTTP Status | Error Message | Cause |
|-------------|---------------|-------|
| 400 | `"Missing required fields"` | One or more required fields are missing from the request |
| 400 | `"Insufficient credits. Available: X, Required: Y"` | User doesn't have enough credits to place the bet |
| 400 | `"Cannot place bet on a game that has already started"` | The game's start time has passed |
| 400 | `"You have already placed a bet on this game"` | User has already bet on this game (duplicate bet prevention) |
| 400 | `"No active odds found for this game"` | The game doesn't have active odds available |
| 404 | `"User not found"` | The provided user ID doesn't exist |
| 404 | `"Game not found"` | The provided game ID doesn't exist |
| 500 | `"Failed to place bet"` | Server error occurred while processing the bet |

---

## Validation Rules

The endpoint validates the following before creating a bet:

1. ✅ **Required Fields**: All required fields must be present
2. ✅ **User Exists**: User must exist in the database
3. ✅ **Sufficient Credits**: User must have enough credits (`current_credits >= stake`)
4. ✅ **Game Exists**: Game must exist in the database
5. ✅ **Game Not Started**: Game start time must be in the future
6. ✅ **No Duplicate Bets**: User cannot already have a bet on this game
7. ✅ **Active Odds**: Game must have active odds available

---

## Frontend Implementation Examples

### React/TypeScript Example

```typescript
interface PlaceBetRequest {
  user: string
  pool: string
  game: string
  betType: 'moneyline' | 'spread' | 'total'
  selection: 'home' | 'away' | 'over' | 'under'
  stake: number
  oddsAtPlacement: number
  lineAtPlacement?: number
}

interface PlaceBetResponse {
  success: boolean
  bet?: {
    id: string
    user: string
    pool: string
    game: string
    betType: string
    selection: string
    stake: number
    oddsAtPlacement: number
    lineAtPlacement?: number
    status: string
    payout: number
    createdAt: string
    updatedAt: string
  }
  error?: string
}

async function placeBet(betData: PlaceBetRequest): Promise<PlaceBetResponse> {
  const response = await fetch('/api/bets/place', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(betData),
  })

  const data: PlaceBetResponse = await response.json()
  return data
}

// Usage in a component
const handlePlaceBet = async () => {
  try {
    const result = await placeBet({
      user: currentUser.id,
      pool: activePool.id,
      game: selectedGame.id,
      betType: 'spread',
      selection: 'home',
      stake: 100,
      oddsAtPlacement: -110,
      lineAtPlacement: -3.5,
    })

    if (result.success) {
      toast.success('Bet placed successfully!')
      // Update UI, refresh user credits, etc.
    } else {
      // Show the specific error message to the user
      toast.error(result.error)
    }
  } catch (error) {
    toast.error('Failed to place bet. Please try again.')
  }
}
```

### Error Handling Example

```typescript
const handleBetPlacement = async (betData: PlaceBetRequest) => {
  const response = await placeBet(betData)

  if (!response.success) {
    // Handle specific errors
    switch (response.error) {
      case 'You have already placed a bet on this game':
        showNotification({
          title: 'Duplicate Bet',
          message: 'You can only place one bet per game.',
          type: 'warning'
        })
        break

      case response.error?.startsWith('Insufficient credits'):
        showNotification({
          title: 'Insufficient Credits',
          message: response.error,
          type: 'error',
          action: {
            label: 'Add Credits',
            onClick: () => navigate('/purchase-credits')
          }
        })
        break

      case 'Cannot place bet on a game that has already started':
        showNotification({
          title: 'Game Started',
          message: 'This game has already started. You cannot place bets on it.',
          type: 'warning'
        })
        break

      default:
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to place bet',
          type: 'error'
        })
    }
    return null
  }

  // Success - return the bet
  return response.bet
}
```

### With React Hook

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(betData),
      })

      const data: PlaceBetResponse = await response.json()

      if (!data.success) {
        setError(data.error || 'Failed to place bet')
        return null
      }

      return data.bet
    } catch (err) {
      setError('Network error. Please try again.')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { placeBet, loading, error }
}

// Usage in component
function BetSlip({ game, user, pool }) {
  const { placeBet, loading, error } = usePlaceBet()

  const handleSubmit = async () => {
    const bet = await placeBet({
      user: user.id,
      pool: pool.id,
      game: game.id,
      betType: 'moneyline',
      selection: 'home',
      stake: 50,
      oddsAtPlacement: -150,
    })

    if (bet) {
      // Success! Update UI
      console.log('Bet placed:', bet)
    } else if (error) {
      // Show error to user
      alert(error)
    }
  }

  return (
    <button onClick={handleSubmit} disabled={loading}>
      {loading ? 'Placing bet...' : 'Place Bet'}
    </button>
  )
}
```

---

## Migration Guide

### Before (Direct Payload API - ❌ Don't use this)

```javascript
// Old way - returns generic errors
const response = await fetch('/api/bets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user: userId,
    pool: poolId,
    game: gameId,
    betType: 'spread',
    selection: 'home',
    stake: 100,
    oddsAtPlacement: -110,
    lineAtPlacement: -3.5,
    status: 'pending',
    payout: 0
  })
})

// Generic error response:
// { "errors": [{ "message": "Something went wrong." }] }
```

### After (New Endpoint - ✅ Use this)

```javascript
// New way - returns specific errors
const response = await fetch('/api/bets/place', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user: userId,
    pool: poolId,
    game: gameId,
    betType: 'spread',
    selection: 'home',
    stake: 100,
    oddsAtPlacement: -110,
    lineAtPlacement: -3.5
  })
})

const data = await response.json()

if (!data.success) {
  // Clear error message:
  // { "success": false, "error": "You have already placed a bet on this game" }
  console.log(data.error)
}
```

### Key Changes

1. **Endpoint URL**: `/api/bets` → `/api/bets/place`
2. **Remove fields**: Don't send `status` or `payout` (automatically set)
3. **Response structure**: Check `success` field instead of `errors` array
4. **Error messages**: Use `error` field for user-friendly messages

---

## Testing

### Test Cases

```javascript
// Test 1: Successful bet placement
await placeBet({
  user: validUserId,
  pool: activePoolId,
  game: upcomingGameId,
  betType: 'moneyline',
  selection: 'home',
  stake: 50,
  oddsAtPlacement: -150
})
// Expected: { success: true, bet: {...} }

// Test 2: Duplicate bet (should fail)
await placeBet({ /* same game as above */ })
// Expected: { success: false, error: "You have already placed a bet on this game" }

// Test 3: Insufficient credits
await placeBet({
  user: userWithLowCredits,
  stake: 1000,
  // ...other fields
})
// Expected: { success: false, error: "Insufficient credits. Available: X, Required: 1000" }

// Test 4: Game already started
await placeBet({
  game: startedGameId,
  // ...other fields
})
// Expected: { success: false, error: "Cannot place bet on a game that has already started" }
```

---

## Additional Notes

1. **Credits are automatically deducted** when the bet is successfully created (handled by the backend hook)
2. **The bet status** is automatically set to `"pending"`
3. **The payout** is automatically set to `0` initially
4. **Duplicate prevention** checks if the user has ANY bet on the game (regardless of bet type)
5. **Game timing** is validated server-side to prevent clock manipulation

---

## Support

If you encounter issues:
1. Check the error message in the response
2. Verify all required fields are provided
3. Ensure user has sufficient credits
4. Confirm the game hasn't started yet
5. Check if user already has a bet on this game

For backend errors (status 500), check the server logs for detailed error information.

---

**API Version:** 1.0
**Last Updated:** December 22, 2024
**Endpoint:** `/api/bets/place`
