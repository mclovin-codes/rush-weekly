# Buy-Back Credits API

## Overview

The buy-back system allows users to receive 1000 credits as a "second chance" when they've lost significantly from settled bets.

**Key Features:**
- Prevents exploitation by only counting settled bets (not pending)
- Requires 7-day cooldown between buy-backs
- Scoped to current pool/week

---

## Endpoints

### Check Eligibility

**GET** `/api/users/buy-back-eligibility`

Check if the current user can buy back credits without performing the action.

#### Response

```json
{
  "success": true,
  "eligible": true,
  "message": "You are eligible for buy-back credits!",
  "pl": -1250,
  "amount": 1000
}
```

#### Not Eligible - P/L Threshold

```json
{
  "success": true,
  "eligible": false,
  "reason": "pl_threshold",
  "message": "Buy-back not available. You must have a P/L of -1000 or worse.",
  "pl": -500,
  "threshold": -1000
}
```

#### Not Eligible - Cooldown

```json
{
  "success": true,
  "eligible": false,
  "reason": "cooldown",
  "message": "Buy-back available in 3 days",
  "daysRemaining": 3,
  "pl": -1250
}
```

#### Not Eligible - No Pool

```json
{
  "success": true,
  "eligible": false,
  "reason": "no_pool",
  "message": "No active pool found. Join a pool to use buy-back.",
  "pl": 0
}
```

---

### Buy Back Credits

**POST** `/api/users/buy-back-credits`

Grant 1000 credits to the user if they meet eligibility criteria.

#### Response

##### Success (200)

```json
{
  "success": true,
  "current_credits": 1000,
  "pl": -1250,
  "message": "Buy-back successful. 1000 credits added."
}
```

##### Error - P/L Not Low Enough (400)

```json
{
  "success": false,
  "error": "Buy-back not available. You must have a P/L of -1000 or worse.",
  "pl": -500
}
```

##### Error - Cooldown Active (400)

```json
{
  "success": false,
  "error": "Buy-back available in 3 days",
  "daysRemaining": 3,
  "pl": -1250
}
```

---

## Eligibility Rules

### P/L Calculation

```
P/L = SUM(payout WHERE status = 'won') - SUM(stake WHERE status IN ['won', 'lost', 'push'])
```

**Important:**
- Only settled bets count (status: `won`, `lost`, `push`)
- Pending bets are **excluded** from P/L
- Scoped to current active pool

### Requirements

| Requirement | Threshold |
|-------------|-----------|
| P/L | ≤ -1000 credits |
| Cooldown | 7 days since last buy-back |
| Pool Status | Must have an active pool membership |

---

## Example Usage

### React Hook

```typescript
import { useState, useEffect } from 'react'

interface BuyBackEligibility {
  eligible: boolean
  pl: number
  reason?: 'pl_threshold' | 'cooldown' | 'no_pool'
  message?: string
  daysRemaining?: number
  amount?: number
}

export function useBuyBack() {
  const [eligibility, setEligibility] = useState<BuyBackEligibility | null>(null)
  const [loading, setLoading] = useState(false)

  const checkEligibility = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/users/buy-back-eligibility')
      const data = await response.json()
      if (data.success) {
        setEligibility(data)
      }
    } catch (error) {
      console.error('Failed to check eligibility:', error)
    } finally {
      setLoading(false)
    }
  }

  const buyBack = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/users/buy-back-credits', {
        method: 'POST'
      })
      const data = await response.json()

      if (data.success) {
        // Success! Refresh eligibility
        await checkEligibility()
        return { success: true, credits: data.current_credits }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkEligibility()
  }, [])

  return { eligibility, buyBack, checkEligibility, loading }
}
```

### Component Example

```typescript
function BuyBackButton() {
  const { eligibility, buyBack, loading } = useBuyBack()

  const handleBuyBack = async () => {
    const result = await buyBack()
    if (result.success) {
      toast.success(`Buy-back successful! You now have ${result.credits} credits.`)
    } else {
      toast.error(result.error)
    }
  }

  if (!eligibility) return null

  if (!eligibility.eligible) {
    return (
      <div>
        <button disabled>{eligibility.message}</button>
        <p>Current P/L: {eligibility.pl}</p>
      </div>
    )
  }

  return (
    <button onClick={handleBuyBack} disabled={loading}>
      {loading ? 'Processing...' : 'Buy Back 1000 Credits'}
    </button>
  )
}
```

---

## Testing Scenarios

| Scenario | Expected Result |
|----------|----------------|
| User with P/L = -1500 | ✅ Eligible |
| User with P/L = -500 | ❌ Not eligible (threshold) |
| User with P/L = 0, pending bet worth 1000 | ❌ Not eligible (pending bets don't count) |
| User who bought back 2 days ago | ❌ Not eligible (cooldown) |
| User who bought back 8 days ago with P/L = -1500 | ✅ Eligible |
| User with no pool membership | ❌ Not eligible (no pool) |

---

## Migration Notes

### Database Changes

Added field to `users` collection:
```typescript
{
  name: 'last_buyback_date',
  type: 'date',
  label: 'Last Buy-Back Date'
}
```

### Old Logic (Removed)

```typescript
// ❌ OLD - Don't use this
if (current_credits === 0 && daysSince >= 7) {
  // Allow buy-back
}
```

### New Logic

```typescript
// ✅ NEW - Use this
if (pl <= -1000 && daysSince >= 7) {
  // Allow buy-back
}
```

---

**Last Updated:** January 6, 2026
