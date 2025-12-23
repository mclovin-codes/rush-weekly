# Leaderboard API - Frontend Guide

## Endpoint

```
GET /api/custom/leaderboard/:poolId
```

## Request

### URL Parameters
- `poolId` (required) - The pool ID

### Query Parameters
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 100) - Results per page

### Example
```javascript
// Basic request
fetch('/api/custom/leaderboard/673c5e8b9f8e4a0012345678')

// With pagination
fetch('/api/custom/leaderboard/673c5e8b9f8e4a0012345678?page=1&limit=50')
```

## Response

### Success (200)
```typescript
{
  docs: Array<{
    rank: number                 // Position (1 = first place)
    user: {                      // Full user object
      id: string
      username: string
      email: string
      current_credits: number
      createdAt: string
      updatedAt: string
    }
    score: number                // Net profit/loss (current_credits - initial_credits)
    totalBets: number           // Total bets placed
    wonBets: number             // Number of wins
    lostBets: number            // Number of losses
  }>
  totalDocs: number             // Total entries
  page: number                  // Current page
  limit: number                 // Results per page
  totalPages: number            // Total pages
  hasNextPage: boolean          // Has more pages
  hasPrevPage: boolean          // Has previous pages
  nextPage: number | null       // Next page number
  prevPage: number | null       // Previous page number
  pagingCounter: number         // Starting entry number
}
```

### Example Response
```json
{
  "docs": [
    {
      "rank": 1,
      "user": {
        "id": "user_123",
        "username": "john_doe",
        "email": "john@example.com",
        "current_credits": 1250,
        "createdAt": "2024-11-19T10:00:00.000Z",
        "updatedAt": "2024-11-20T15:30:00.000Z"
      },
      "score": 250,
      "totalBets": 15,
      "wonBets": 10,
      "lostBets": 4
    },
    {
      "rank": 2,
      "user": {
        "id": "user_456",
        "username": "jane_smith",
        "email": "jane@example.com",
        "current_credits": 900,
        "createdAt": "2024-11-19T11:00:00.000Z",
        "updatedAt": "2024-11-20T14:20:00.000Z"
      },
      "score": -100,
      "totalBets": 12,
      "wonBets": 4,
      "lostBets": 7
    }
  ],
  "totalDocs": 2,
  "page": 1,
  "limit": 100,
  "totalPages": 1,
  "hasNextPage": false,
  "hasPrevPage": false,
  "nextPage": null,
  "prevPage": null,
  "pagingCounter": 1
}
```

## Score Calculation

**Score = Current Credits - Initial Credits**

Examples:
- Started with 1000, now have 1250 → Score: **+250** (profit)
- Started with 1000, now have 750 → Score: **-250** (loss)
- Started with 1000, now have 1000 → Score: **0** (break even)

## Frontend Implementation

### React/Next.js Example

```typescript
interface LeaderboardEntry {
  rank: number
  user: {
    id: string
    username: string
    email: string
    current_credits: number
    createdAt: string
    updatedAt: string
  }
  score: number
  totalBets: number
  wonBets: number
  lostBets: number
}

interface LeaderboardResponse {
  docs: LeaderboardEntry[]
  totalDocs: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
  nextPage: number | null
  prevPage: number | null
}


