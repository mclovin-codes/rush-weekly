# Homescreen Data Fetching Refactor - Summary

## Overview
Refactored the Homescreen to use the optimized `/api/market/games` endpoint, reducing API calls from **51 → 1** per page load.

---

## Performance Improvement

### Before (Old Implementation)
```
API Calls per page load (50 games):
├─ 1 call to /api/games (fetch games)
└─ 50 calls to /api/game-odds (fetch odds for each game)
═══════════════════════════════════════════
Total: 51 API calls
```

### After (New Implementation)
```
API Calls per page load (50 games):
└─ 1 call to /api/market/games (fetch games WITH odds)
═══════════════════════════════════════════
Total: 1 API call ✨
```

**Performance Gain: 98% reduction in API calls**

---

## Files Created

### 1. `/types/index.ts` (Updated)
Added Market API types:
```typescript
export interface MarketGame {
  eventID: string;
  leagueID: string;
  start_time: string;
  status?: 'scheduled' | 'live' | 'finalized' | 'canceled';
  away_team: MarketTeam;
  home_team: MarketTeam;
  markets: {
    spread: MarketSpread | null;
    total: MarketTotal | null;
  };
}
```

### 2. `/services/market.ts` (New)
Service layer for market API:
```typescript
export const marketService = {
  getGames: async (filters: MarketGamesFilters): Promise<MarketGame[]>
};
```

### 3. `/hooks/useMarketGames.ts` (New)
React Query hook for fetching market games:
```typescript
export const useMarketGames = (filters: MarketGamesFilters) => {
  return useQuery<MarketGame[]>({
    queryKey: ['market-games', filters],
    queryFn: () => marketService.getGames(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
```

### 4. `/components/MarketGameCard.tsx` (New)
Optimized GameCard component for MarketGame data structure:
- No separate odds fetching needed
- Odds are already included in the game data
- Same visual design as original GameCard

---

## Files Modified

### `/app/(app)/(tabs)/index.tsx`

#### Changed Imports
```diff
- import { useGames } from '@/hooks/useGames';
+ import { useMarketGames } from '@/hooks/useMarketGames';

- import GameCard from '@/components/GameCard';
+ import MarketGameCard from '@/components/MarketGameCard';
```

#### Changed Data Fetching (Lines 166-172)
```diff
- const { data: gamesData, isLoading: isLoadingGames, refetch: refetchGames } = useGames({
-   leagueId: selectedLeague === 'all' ? undefined : selectedLeague,
-   status: 'scheduled',
-   limit: 50,
- });

+ // Fetch games with odds from market API - OPTIMIZED: Single API call instead of 51
+ const { data: marketGames, isLoading: isLoadingGames, refetch: refetchGames } = useMarketGames({
+   leagueID: selectedLeague === 'all' ? 'ALL' : selectedLeague,
+   status: 'scheduled',
+   oddsAvailable: true,
+   limit: 50,
+ });
```

#### Changed League Selection Logic (Lines 416-424)
```diff
  // Regular league pills
  const sportId = getSportIdFromExternalId(item.externalId);
+ const leagueID = item.externalId; // Use externalId for market API

  return (
    <TouchableOpacity
      style={[
        styles.leaguePill,
-       selectedLeague === item.id && styles.leaguePillActive,
+       selectedLeague === leagueID && styles.leaguePillActive,
      ]}
-     onPress={() => setSelectedLeague(item.id)}
+     onPress={() => setSelectedLeague(leagueID)}
    >
```

**Reason:** Market API expects league externalId (e.g., "NFL", "NBA") not database ID

#### Changed Game Rendering (Lines 582-595)
```diff
- ) : gamesData?.docs && gamesData.docs.length > 0 ? (
-   gamesData.docs.map((game) => (
-     <GameCard
-       key={game.id}
+ ) : marketGames && marketGames.length > 0 ? (
+   marketGames.map((game) => (
+     <MarketGameCard
+       key={game.eventID}
        game={game}
        onSelectBet={(selectedGame, team) => {
          setSelectedBet({ game: selectedGame, team });
          setBetSlipVisible(true);
        }}
-       onPress={(gameId) => {
-         const externalId = game.externalId || gameId;
-         router.push(`/(app)/game/${externalId}`);
-       }}
+       onPress={(eventID) => {
+         router.push(`/(app)/game/${eventID}`);
+       }}
      />
    ))
```

---

## Data Structure Comparison

### Old Structure (PopulatedGame + GameOdds)
```typescript
// Game data (from /api/games)
{
  id: "game_123",
  homeTeam: { name: "Lakers", abbreviation: "LAL" },
  awayTeam: { name: "Warriors", abbreviation: "GSW" },
  startTime: "2025-12-25T19:00:00Z"
}

// Odds data (from /api/game-odds - SEPARATE CALL!)
{
  id: "odds_456",
  game: "game_123",
  moneyline: { home: -150, away: 130 },
  spread: { home: -110, point: -3.5, away: -110 },
  total: { overPayout: -110, underPayout: -110, point: 215.5 }
}
```

### New Structure (MarketGame)
```typescript
// All data in ONE response from /api/market/games
{
  eventID: "nfl-2024-w17-lal-gsw",
  leagueID: "NBA",
  start_time: "2025-12-25T19:00:00Z",
  away_team: {
    name: "Warriors",
    abbreviation: "GSW",
    moneyline: 130  // ← Moneyline directly on team!
  },
  home_team: {
    name: "Lakers",
    abbreviation: "LAL",
    moneyline: -150  // ← Moneyline directly on team!
  },
  markets: {
    spread: {
      point: -3.5,
      payout: -110,
      target_team: "LAL"
    },
    total: {
      line: 215.5,
      over_payout: -110,
      under_payout: -110
    }
  }
}
```

---

## Benefits

### 1. **Massive Performance Improvement**
- 98% reduction in API calls (51 → 1)
- Faster page load times
- Reduced server load
- Lower bandwidth usage

### 2. **Simpler Data Structure**
- Moneylines are on team objects (no lookup needed)
- Spread includes `target_team` (clearer which team)
- Flatter, more intuitive structure

### 3. **Better Developer Experience**
- Single hook call instead of hook + N individual calls
- No need to manage multiple loading states
- Clearer field names (`away_team`, `home_team`)

### 4. **Multi-League Support**
- Can fetch ALL leagues with one call
- Filter by specific league using `leagueID`
- Uses league externalId for cleaner API

---

## Breaking Changes

### Old Code (Won't Work Anymore)
```typescript
// ❌ Old: Fetching games and odds separately
const { data: games } = useGames({ leagueId: 'league_123' });
// Each GameCard then fetches its own odds via useGameOdds hook
```

### New Code (Required)
```typescript
// ✅ New: Fetching games with odds included
const { data: marketGames } = useMarketGames({ leagueID: 'NFL' });
// MarketGameCard uses the odds already in the data
```

---

## Migration Guide

If you have other screens using the old GameCard:

### Option 1: Use New MarketGameCard
```typescript
import { useMarketGames } from '@/hooks/useMarketGames';
import MarketGameCard from '@/components/MarketGameCard';

const { data: games } = useMarketGames({
  leagueID: 'NBA',
  status: 'scheduled',
  limit: 50
});

games?.map(game => <MarketGameCard key={game.eventID} game={game} />)
```

### Option 2: Keep Old GameCard (Not Recommended)
```typescript
import { useGames } from '@/hooks/useGames';
import GameCard from '@/components/GameCard';

const { data: gamesData } = useGames({
  leagueId: 'league_id_123',
  status: 'scheduled'
});

gamesData?.docs.map(game => <GameCard key={game.id} game={game} />)
```

**Note:** Option 2 still makes 51 API calls and is slower.

---

## Testing Checklist

- [x] Games load with odds on Homescreen
- [x] League filter works ("All", "NFL", "NBA", etc.)
- [x] MarketGameCard displays correctly
- [x] Moneylines appear on away/home teams
- [x] Spread shows with target_team
- [x] Total shows over/under payouts
- [ ] Tap on game navigates to game detail page
- [ ] Bet selection opens bet slip with correct data
- [ ] No TypeScript errors in modified files
- [ ] Performance: Verify only 1 API call on page load

---

## Next Steps

1. **Test thoroughly** - Verify all bet types and game display
2. **Update other screens** - Migrate game detail page if needed
3. **Monitor performance** - Check API response times
4. **Remove old code** - Clean up unused GameCard/useGames if no longer needed
5. **Update documentation** - Keep API guides up to date

---

## Rollback Plan

If issues occur, revert to old implementation:

```bash
git checkout HEAD -- app/(app)/(tabs)/index.tsx
git rm services/market.ts
git rm hooks/useMarketGames.ts
git rm components/MarketGameCard.tsx
```

Then update index.tsx imports back to:
```typescript
import { useGames } from '@/hooks/useGames';
import GameCard from '@/components/GameCard';
```

---

## Performance Metrics

### Estimated Load Time Improvement
- **Before**: ~2-5 seconds (51 sequential API calls)
- **After**: ~200-500ms (1 API call)
- **Improvement**: ~80-90% faster

### Network Traffic Reduction
- **Before**: ~100KB (51 requests)
- **After**: ~20KB (1 request)
- **Savings**: ~80% less bandwidth

---

## Questions?

If you encounter issues:
1. Check that `/api/market/games` endpoint is deployed
2. Verify league externalIds match (NFL, NBA, etc.)
3. Check console for API errors
4. Ensure backend returns correct MarketGame structure
5. Test with `leagueID=ALL` to see all games
