# Updated Implementation Summary - Simplified Market API

## Overview

The `/api/market/games` endpoint has been updated to return data in a **simplified, flat structure** that's easier to consume and matches your specified format.

---

## What Changed

### 1. Simplified Response Structure

**Old Format (Complex, Nested):**
```json
{
  "docs": [{
    "id": "...",
    "homeTeam": { "name": "...", "abbreviation": "..." },
    "awayTeam": { "name": "...", "abbreviation": "..." },
    "odds": {
      "moneyline": { "home": -290, "away": 235 },
      "spread": { "point": 6.5, "home": -105, "away": -105 },
      "total": { "line": 50.5, "overPayout": -115, "underPayout": -115 }
    }
  }],
  "totalDocs": 50,
  "page": 1
}
```

**New Format (Simple, Flat):**
```json
[
  {
    "eventID": "nfl-2024-w17-dal-was",
    "leagueID": "NFL",
    "start_time": "2025-12-25T21:00:00Z",
    "away_team": {
      "name": "Dallas Cowboys",
      "abbreviation": "DAL",
      "moneyline": -290
    },
    "home_team": {
      "name": "Washington Commanders",
      "abbreviation": "WAS",
      "moneyline": 235
    },
    "markets": {
      "spread": {
        "point": 6.5,
        "payout": -105,
        "target_team": "DAL"
      },
      "total": {
        "line": 50.5,
        "over_payout": -115,
        "under_payout": -115
      }
    }
  }
]
```

### 2. Proper Odds Extraction

Now using the correct SportsGameOdds oddID format:

- **Moneyline**: `points-home-game-ml-home`, `points-away-game-ml-away`
- **Spread**: `points-home-game-sp-home`, `points-away-game-sp-away`
- **Total**: `points-all-game-ou-over`, `points-all-game-ou-under`

### 3. Support for ALL Leagues

You can now fetch games from all active leagues:

```bash
GET /api/market/games?leagueID=ALL
```

This will fetch and combine games from all active leagues in your database.

---

## API Examples

### Fetch NBA Games
```bash
curl "http://localhost:3000/api/market/games?leagueID=NBA&status=scheduled"
```

### Fetch ALL Leagues
```bash
curl "http://localhost:3000/api/market/games?leagueID=ALL&limit=100"
```

### Fetch Live Games
```bash
curl "http://localhost:3000/api/market/games?leagueID=NFL&status=live"
```

---

## Key Features

### 1. Moneylines on Team Objects
```json
"away_team": {
  "moneyline": -290  // ← Directly on the team!
}
```

No need to look up moneyline separately.

### 2. Spread with Target Team
```json
"spread": {
  "point": 6.5,
  "payout": -105,
  "target_team": "DAL"  // ← Clear which team the spread applies to
}
```

### 3. Cleaner Total Structure
```json
"total": {
  "line": 50.5,
  "over_payout": -115,
  "under_payout": -115
}
```

### 4. Null Markets When Not Available
```json
"markets": {
  "spread": null,  // ← Not available
  "total": {
    "line": 50.5,
    "over_payout": -115,
    "under_payout": -115
  }
}
```

---

## Bet Placement Updated

The `/api/bets/place` endpoint now correctly extracts odds using the oddID format:

### Request
```json
{
  "user": "user_id",
  "pool": "pool_id",
  "eventID": "nfl-2024-w17-dal-was",
  "leagueID": "NFL",
  "betType": "spread",
  "selection": "home",
  "stake": 10
}
```

### Response
```json
{
  "success": true,
  "bet": {
    "id": "bet_123",
    "game": "game_456",
    "oddsAtPlacement": -105,
    "lineAtPlacement": 6.5,
    "stake": 10,
    "status": "pending"
  },
  "message": "Bet placed successfully"
}
```

---

## Frontend Integration

### Display Team Cards with Moneylines

```jsx
const GameCard = ({ game }) => {
  const formatOdds = (odds) => {
    if (!odds) return '--';
    return odds > 0 ? `+${odds}` : odds;
  };

  return (
    <View>
      {/* Away Team */}
      <View>
        <Text>{game.away_team.abbreviation}</Text>
        <Text>{game.away_team.name}</Text>
        <Text>{formatOdds(game.away_team.moneyline)}</Text>
      </View>

      {/* Home Team */}
      <View>
        <Text>{game.home_team.abbreviation}</Text>
        <Text>{game.home_team.name}</Text>
        <Text>{formatOdds(game.home_team.moneyline)}</Text>
      </View>

      {/* Spread */}
      {game.markets.spread && (
        <View>
          <Text>SPREAD</Text>
          <Text>{game.markets.spread.target_team}</Text>
          <Text>{game.markets.spread.point > 0 ? '+' : ''}{game.markets.spread.point}</Text>
          <Text>{formatOdds(game.markets.spread.payout)}</Text>
        </View>
      )}

      {/* Total */}
      {game.markets.total && (
        <View>
          <Text>TOTAL</Text>
          <Text>O/U {game.markets.total.line}</Text>
          <Text>O: {formatOdds(game.markets.total.over_payout)}</Text>
          <Text>U: {formatOdds(game.markets.total.under_payout)}</Text>
        </View>
      )}
    </View>
  );
};
```

### Place a Bet

```javascript
const placeBet = async (game, betType, selection, stake) => {
  const response = await fetch('/api/bets/place', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user: userId,
      pool: poolId,
      eventID: game.eventID,
      leagueID: game.leagueID,
      betType,
      selection,
      stake,
    }),
  });

  return response.json();
};

// Examples
placeBet(game, 'moneyline', 'home', 10);   // Bet on home team to win
placeBet(game, 'spread', 'away', 25);       // Bet on away team spread
placeBet(game, 'total', 'over', 15);        // Bet on over total
```

---

## Query Parameters

| Parameter | Type | Default | Options | Description |
|-----------|------|---------|---------|-------------|
| `leagueID` | string | First active | `"NFL"`, `"NBA"`, `"ALL"` | League to fetch or ALL for all leagues |
| `status` | string | All | `"scheduled"`, `"live"`, `"finalized"` | Filter by game status |
| `oddsAvailable` | boolean | `true` | `true`, `false` | Only games with odds |
| `limit` | number | `50` | Any number | Max games to return |

---

## Complete Flow Example

### 1. Fetch Games
```bash
GET /api/market/games?leagueID=NFL&status=scheduled&limit=10
```

**Response:**
```json
[
  {
    "eventID": "nfl-2024-w17-dal-was",
    "leagueID": "NFL",
    "start_time": "2025-12-25T21:00:00Z",
    "away_team": {
      "name": "Dallas Cowboys",
      "abbreviation": "DAL",
      "moneyline": -290
    },
    "home_team": {
      "name": "Washington Commanders",
      "abbreviation": "WAS",
      "moneyline": 235
    },
    "markets": {
      "spread": {
        "point": 6.5,
        "payout": -105,
        "target_team": "DAL"
      },
      "total": {
        "line": 50.5,
        "over_payout": -115,
        "under_payout": -115
      }
    }
  }
]
```

### 2. Place Bet on Dallas -6.5
```bash
POST /api/bets/place
{
  "user": "user_123",
  "pool": "pool_456",
  "eventID": "nfl-2024-w17-dal-was",
  "leagueID": "NFL",
  "betType": "spread",
  "selection": "away",
  "stake": 10
}
```

**What Happens:**
1. Backend fetches latest odds from API
2. Finds Dallas spread: `-6.5` at `-105`
3. Creates/updates game in database
4. Creates bet with snapshot: `oddsAtPlacement: -105`, `lineAtPlacement: -6.5`
5. Deducts 10 credits from user

### 3. Settlement (Runs Automatically)
```bash
# Settlement worker runs every 15 minutes
pnpm run settle:bets
```

**What Happens:**
1. Finds scheduled games with `startTime < NOW()`
2. Fetches final scores from API
3. Dallas wins 28-21 (covers -6.5 spread)
4. Bet is graded as `won`
5. Payout calculated: `10 * 1.952 = 19.52`
6. User credits updated: `credits + 19.52`

---

## Benefits

### 1. Simpler Frontend Code
- No nested lookups for moneylines
- Clear spread target team
- Flatter, more intuitive structure

### 2. Correct Odds Extraction
- Uses proper oddID format from SportsGameOdds
- Correctly maps home/away for each bet type
- Handles missing markets gracefully

### 3. Multi-League Support
- Fetch all leagues with one request
- Combine NFL, NBA, MLB, etc.
- Filter and sort across leagues

### 4. Better Developer Experience
- Clear field names (`away_team`, `home_team`)
- Explicit market structure
- Null when not available (no undefined)

---

## Testing Checklist

- [ ] Fetch NBA games: `/api/market/games?leagueID=NBA`
- [ ] Fetch ALL leagues: `/api/market/games?leagueID=ALL`
- [ ] Verify moneylines appear on teams
- [ ] Verify spread includes `target_team`
- [ ] Verify totals have `over_payout` and `under_payout`
- [ ] Test bet placement with new format
- [ ] Verify game/teams are created in database
- [ ] Test settlement with real or test data

---

## Documentation

- **API Guide**: `MARKET_API_GUIDE.md` - Complete API reference
- **Implementation**: This file - Summary of changes
- **Architecture**: `SNAPSHOT_ARCHITECTURE_SUMMARY.md` - Overall system design

---

## Next Steps

1. **Update Frontend**:
   - Change API call to `/api/market/games`
   - Update data parsing for new structure
   - Remove old odds fetching logic

2. **Test Thoroughly**:
   - Verify all bet types work
   - Check edge cases (missing odds, etc.)
   - Test with real API data

3. **Monitor**:
   - API response times
   - Odds accuracy
   - Settlement success rate

---

## Support

If you encounter issues:

1. **Check Leagues**: `pnpm run seed:leagues`
2. **Verify API Key**: Check `.env` has `SPORTS_API_KEY`
3. **Test Single League**: Start with `?leagueID=NFL`
4. **Check Logs**: Look for odds extraction errors
5. **Verify Response**: Match against examples in `MARKET_API_GUIDE.md`
