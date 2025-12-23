# GameCard Data Flow Documentation

## Overview
This document explains how the `GameCard` component fetches and displays data from the backend. The data flow involves multiple API calls and data relationships.

---

## Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         HOME SCREEN                              │
│                     (app/(app)/(tabs)/index.tsx)                │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   useGames() Hook       │
                    │  (hooks/useGames.ts)    │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │   gameService.getAll()   │
                    │   (services/games.ts)    │
                    └────────────┬─────────────┘
                                 │
        ┌────────────────────────▼─────────────────────────┐
        │  API Call: GET /api/games?depth=2                │
        │  Returns: Array of PopulatedGame objects         │
        └────────────────────────┬─────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │      GameCard           │
                    │ (components/GameCard)   │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  useGameOdds() Hook     │
                    │ (hooks/useGameOdds.ts)  │
                    └────────────┬────────────┘
                                 │
        ┌────────────────────────▼──────────────────────────────────┐
        │  API Call: GET /api/game-odds?where[game][equals]=        │
        │            {gameId}&where[isActive][equals]=true           │
        │  Returns: Array of GameOdds objects (filtered for active) │
        └────────────────────────────────────────────────────────────┘
```

---

## 1. Initial Games Fetch

### Location
`app/(app)/(tabs)/index.tsx:167-171`

### Code
```typescript
const { data: gamesData, isLoading: isLoadingGames, refetch: refetchGames } = useGames({
  leagueId: selectedLeague === 'all' ? undefined : selectedLeague,
  status: 'scheduled',
  limit: 50,
});
```

### Hook Implementation
`hooks/useGames.ts`
```typescript
export const useGames = (filters: GameFilters) => {
  return useQuery<PaginatedResponse<PopulatedGame>>({
    queryKey: ['games', filters],
    queryFn: () => gameService.getAll(filters),
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
  });
};
```

### Service Implementation
`services/games.ts:7-41`
```typescript
getAll: async (filters: GameFilters): Promise<PaginatedResponse<PopulatedGame>> => {
  const queryParams: Record<string, any> = {
    depth: 2, // IMPORTANT: Populates nested relationships
  };

  const where: Record<string, any> = {};

  if (filters.leagueId) {
    where.league = { equals: filters.leagueId };
  }

  if (filters.status) {
    where.status = { equals: filters.status };
  }

  queryParams.page = filters.page || 1;
  queryParams.limit = filters.limit || 10;
  queryParams.sort = '-startTime'; // Most recent first

  if (Object.keys(where).length > 0) {
    queryParams.where = where;
  }

  const queryString = qs.stringify(queryParams, { encode: false });
  return apiHelpers.get(`${API_ROUTES.GAMES.GET}?${queryString}`);
}
```

### API Endpoint
```
GET /api/games?depth=2&status=scheduled&limit=50&sort=-startTime
```

### Expected Response Structure
```typescript
{
  docs: PopulatedGame[], // Array of games
  totalDocs: number,
  limit: number,
  totalPages: number,
  page: number,
  pagingCounter: number,
  hasPrevPage: boolean,
  hasNextPage: boolean,
  prevPage: number | null,
  nextPage: number | null
}
```

### PopulatedGame Structure
```typescript
{
  id: string,
  externalId: string,
  startTime: string, // ISO 8601 date
  status: 'scheduled' | 'live' | 'finalized' | 'canceled',
  homeScore?: number,
  awayScore?: number,
  league: {              // ← Populated due to depth=2
    id: string,
    name: string,
    externalId: string,
    active: boolean,
    sport: {             // ← Populated due to depth=2
      id: string,
      name: string,
      externalId: string
    }
  },
  homeTeam: {            // ← Populated due to depth=2
    id: string,
    name: string,
    abbreviation: string,
    externalId: string,
    logoUrl?: string,
    league: string       // Just ID (depth limit)
  },
  awayTeam: {            // ← Populated due to depth=2
    id: string,
    name: string,
    abbreviation: string,
    externalId: string,
    logoUrl?: string,
    league: string       // Just ID (depth limit)
  },
  createdAt: string,
  updatedAt: string
}
```

---

## 2. Game Odds Fetch (Per Game)

### Location
`components/GameCard.tsx:15`

### Code
```typescript
const { data: odds } = useGameOdds(game.id);
```

### Hook Implementation
`hooks/useGameOdds.ts`
```typescript
export const useGameOdds = (gameId: string | undefined) => {
  return useQuery<GameOdds | null>({
    queryKey: ['game-odds', gameId],
    queryFn: async () => {
      if (!gameId) return null;
      return gameOddsService.getActiveOdds(gameId);
    },
    enabled: !!gameId,
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes (odds change frequently)
  });
};
```

### Service Implementation
`services/game-odds.ts`
```typescript
export const gameOddsService = {
  getByGameId: async (gameId: string): Promise<GameOdds[]> => {
    const response = await apiHelpers.get(API_ROUTES.GAME_ODDS.GET_BY_GAME(gameId));
    return response.docs;
  },

  getActiveOdds: async (gameId: string): Promise<GameOdds | null> => {
    const odds = await gameOddsService.getByGameId(gameId);
    return odds.find(o => o.isActive) || null; // ← Returns only active odds
  },
};
```

### API Endpoint
`constants/api-routes.ts:43`
```
GET /api/game-odds?where[game][equals]={gameId}&where[isActive][equals]=true
```

### Expected Response Structure
```typescript
{
  docs: GameOdds[] // Array of odds (should contain only active ones)
}
```

### GameOdds Structure
```typescript
{
  id: string,
  game: string, // Game ID (not populated)
  provider: string,
  moneyline?: {
    home?: number,  // e.g., -150
    away?: number   // e.g., +130
  },
  spread?: {
    home?: number,  // e.g., -110
    point?: number, // e.g., -3.5
    away?: number   // e.g., -110
  },
  total?: {
    overPayout?: number,  // e.g., -110
    underPayout?: number, // e.g., -110
    point?: number        // e.g., 47.5
  },
  isActive: boolean,
  createdAt: string,
  updatedAt: string
}
```

---

## 3. GameCard Display Logic

### Component: `components/GameCard.tsx`

### Key Data Extraction (lines 17-18)
```typescript
const homeTeam = typeof game.homeTeam === 'object' ? game.homeTeam : null;
const awayTeam = typeof game.awayTeam === 'object' ? game.awayTeam : null;
```

### Odds Extraction (lines 106-113)
```typescript
const homeOdds = odds?.moneyline?.home;
const awayOdds = odds?.moneyline?.away;
const spreadPoint = odds?.spread?.point;
const spreadHomeOdds = odds?.spread?.home;
const spreadAwayOdds = odds?.spread?.away;
const totalPoint = odds?.total?.point;
const overOdds = odds?.total?.overPayout;
const underOdds = odds?.total?.underPayout;
```

### Display Components

#### 1. Game Header (lines 125-139)
```typescript
<View style={styles.compactHeader}>
  <View style={styles.matchupInfo}>
    <Text>{awayTeam?.abbreviation || 'TBD'}</Text>
    <Text>@</Text>
    <Text>{homeTeam?.abbreviation || 'TBD'}</Text>
  </View>
  <View style={styles.gameTimeInfo}>
    <Text>{timeLabel}</Text> {/* Formatted from game.startTime */}
  </View>
</View>
```

#### 2. Spread Display (lines 145-159)
```typescript
<TouchableOpacity style={styles.betCell}>
  <Text>SPREAD</Text>
  <Text>{spreadPoint > 0 ? `+${spreadPoint}` : spreadPoint}</Text>
  <Text>{formatOdds(spreadHomeOdds || spreadAwayOdds)}</Text>
</TouchableOpacity>
```

#### 3. Total Display (lines 161-173)
```typescript
<TouchableOpacity style={styles.betCell}>
  <Text>TOTAL</Text>
  <Text>O/U {totalPoint}</Text>
  <Text>{formatOdds(overOdds || underOdds)}</Text>
</TouchableOpacity>
```

#### 4. Moneyline Display (lines 177-209)
```typescript
{/* Away Team */}
<TouchableOpacity onPress={() => onSelectBet(game, 'away')}>
  <Text>AWAY</Text>
  <Text>{awayTeam?.name || 'TBD'}</Text>
  <Text>{formatOdds(awayOdds)}</Text>
</TouchableOpacity>

{/* Home Team */}
<TouchableOpacity onPress={() => onSelectBet(game, 'home')}>
  <Text>HOME</Text>
  <Text>{homeTeam?.name || 'TBD'}</Text>
  <Text>{formatOdds(homeOdds)}</Text>
</TouchableOpacity>
```

---

## 4. Data Requirements Summary

### For Backend Team

#### Games Endpoint Requirements
**Endpoint:** `GET /api/games`

**Query Parameters:**
- `depth=2` - **CRITICAL**: Must populate `league`, `league.sport`, `homeTeam`, `awayTeam`
- `status=scheduled` - Filter for upcoming games
- `limit={number}` - Number of games to return
- `sort=-startTime` - Sort by start time descending

**Must Return:**
1. ✅ Fully populated game objects with nested relationships
2. ✅ `homeTeam` and `awayTeam` must be full objects (not just IDs)
3. ✅ `league` must be populated with `sport` nested inside
4. ✅ All team fields: `name`, `abbreviation`, `externalId`, `logoUrl`
5. ✅ Valid ISO 8601 dates for `startTime`

#### Game Odds Endpoint Requirements
**Endpoint:** `GET /api/game-odds`

**Query Parameters:**
- `where[game][equals]={gameId}` - Filter by game ID
- `where[isActive][equals]=true` - Only active odds

**Must Return:**
1. ✅ Only one active odds record per game
2. ✅ Complete `moneyline`, `spread`, and `total` objects
3. ✅ All odds values as numbers (not strings)
4. ✅ Spread and total `point` values as numbers

---

## 5. Common Issues to Check

### Issue 1: Teams Not Displaying
**Symptom:** GameCard shows "TBD" for team names

**Root Cause:** `depth=2` not working or teams not populated

**Check:**
```bash
# Verify response structure
GET /api/games?depth=2&limit=1

# Should return:
{
  "docs": [{
    "homeTeam": {        // ← Should be OBJECT, not string
      "name": "Lakers",
      "abbreviation": "LAL"
    }
  }]
}
```

### Issue 2: Odds Not Displaying
**Symptom:** All betting options show "--"

**Root Cause:**
- No active odds for the game
- `isActive` flag not set correctly
- Odds values are `null` or `undefined`

**Check:**
```bash
# Verify odds exist and are active
GET /api/game-odds?where[game][equals]={gameId}&where[isActive][equals]=true

# Should return:
{
  "docs": [{
    "isActive": true,    // ← Must be true
    "moneyline": {
      "home": -150,      // ← Must be numbers, not null
      "away": 130
    }
  }]
}
```

### Issue 3: Multiple Active Odds
**Symptom:** Odds display is inconsistent or changes randomly

**Root Cause:** Multiple odds records have `isActive: true` for same game

**Fix:** Backend should ensure only ONE odds record per game has `isActive: true`

### Issue 4: Date/Time Display Issues
**Symptom:** Game times show incorrectly or "Invalid Date"

**Root Cause:** `startTime` not in valid ISO 8601 format

**Expected Format:**
```
"2025-12-23T19:00:00.000Z"  ✅ Correct
"2025-12-23 19:00:00"       ❌ Wrong
```

---

## 6. Performance Considerations

### Caching Strategy
- **Games:** Cached for 2 minutes (`staleTime: 1000 * 60 * 2`)
- **Odds:** Cached for 2 minutes (odds change frequently)
- **Query Keys:** Include all filter parameters for proper cache invalidation

### API Calls Per Page Load
If showing 50 games:
- **1 call** to fetch games (with depth=2)
- **50 calls** to fetch odds (one per game)

**Total: 51 API calls**

### Optimization Suggestions for Backend
1. Consider adding a `includeOdds=true` parameter to games endpoint
2. Return odds data nested in game response to reduce calls from 51 → 1
3. Implement server-side caching for frequently requested data
4. Add proper database indexes on:
   - `games.status`
   - `games.startTime`
   - `game-odds.game`
   - `game-odds.isActive`

---

## 7. Example Request/Response Flow

### Step 1: Fetch Games
```bash
GET /api/games?depth=2&status=scheduled&limit=2&sort=-startTime
```

**Response:**
```json
{
  "docs": [
    {
      "id": "game_123",
      "externalId": "espn_12345",
      "startTime": "2025-12-25T19:00:00.000Z",
      "status": "scheduled",
      "league": {
        "id": "league_nba",
        "name": "NBA",
        "sport": {
          "id": "sport_basketball",
          "name": "Basketball"
        }
      },
      "homeTeam": {
        "id": "team_lakers",
        "name": "Los Angeles Lakers",
        "abbreviation": "LAL"
      },
      "awayTeam": {
        "id": "team_warriors",
        "name": "Golden State Warriors",
        "abbreviation": "GSW"
      }
    }
  ],
  "totalDocs": 45,
  "page": 1,
  "limit": 2
}
```

### Step 2: Fetch Odds for Each Game
```bash
GET /api/game-odds?where[game][equals]=game_123&where[isActive][equals]=true
```

**Response:**
```json
{
  "docs": [
    {
      "id": "odds_789",
      "game": "game_123",
      "provider": "DraftKings",
      "isActive": true,
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
        "point": 215.5
      }
    }
  ]
}
```

---

## 8. Testing Checklist for Backend

- [ ] Games endpoint returns populated teams with `depth=2`
- [ ] Games endpoint returns populated league with nested sport
- [ ] Only scheduled games are returned when `status=scheduled`
- [ ] Games are sorted by `startTime` descending
- [ ] Odds endpoint filters by `game` ID correctly
- [ ] Odds endpoint filters by `isActive=true` correctly
- [ ] Only ONE active odds record exists per game
- [ ] All odds values are numbers (not null/undefined)
- [ ] Dates are in ISO 8601 format
- [ ] Pagination works correctly for both endpoints
- [ ] Team abbreviations are 3-4 characters max
- [ ] All required fields are present in responses

---

## Contact
If you need clarification on any data requirements or see unexpected behavior, please provide:
1. The API endpoint being called
2. The query parameters
3. The full response body
4. Screenshot of what's displaying in the app
