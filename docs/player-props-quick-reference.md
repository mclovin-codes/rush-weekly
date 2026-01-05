# Player Props Quick Reference

## Quick League Support Check

```typescript
const SUPPORTED_LEAGUES = [
  'NFL',
  'NBA',
  'NCAAB',
  'NCAAF',
  'MLB',
  'NHL',
  'MLS',
  'UEFA_CHAMPIONS_LEAGUE'
]

// Check if league supports player props
const hasPlayerProps = (leagueID: string) =>
  SUPPORTED_LEAGUES.includes(leagueID)
```

## Data Structures by League

### NFL Example

```json
{
  "eventID": "NFL_20260115_KC@BUF",
  "leagueID": "NFL",
  "start_time": "2026-01-15T20:00:00Z",
  "player_props": [
    {
      "player_id": "PATRICK_MAHOMES_1_NFL",
      "player_name": "Patrick Mahomes",
      "props": [
        {
          "stat_type": "passing_yards",
          "display_name": "Passing Yards",
          "category": "passing",
          "line": 275.5,
          "over_payout": -110,
          "under_payout": -110
        },
        {
          "stat_type": "passing_touchdowns",
          "display_name": "Passing TDs",
          "category": "passing",
          "line": 2.5,
          "over_payout": 105,
          "under_payout": -125
        },
        {
          "stat_type": "firstTouchdown",
          "display_name": "Anytime TD",
          "category": "scoring",
          "yes_payout": 450,
          "no_payout": null
        }
      ]
    },
    {
      "player_id": "TRAVIS_KELCE_1_NFL",
      "player_name": "Travis Kelce",
      "props": [
        {
          "stat_type": "receiving_receptions",
          "display_name": "Receptions",
          "category": "receiving",
          "line": 5.5,
          "over_payout": -115,
          "under_payout": -105
        },
        {
          "stat_type": "receiving_yards",
          "display_name": "Receiving Yards",
          "category": "receiving",
          "line": 75.5,
          "over_payout": -110,
          "under_payout": -110
        }
      ]
    }
  ]
}
```

### NBA Example

```json
{
  "eventID": "NBA_20260115_LAL@GSW",
  "leagueID": "NBA",
  "start_time": "2026-01-15T22:00:00Z",
  "player_props": [
    {
      "player_id": "LEBRON_JAMES_1_NBA",
      "player_name": "LeBron James",
      "props": [
        {
          "stat_type": "points",
          "display_name": "Points",
          "category": "scoring",
          "line": 28.5,
          "over_payout": -110,
          "under_payout": -110
        },
        {
          "stat_type": "rebounds",
          "display_name": "Rebounds",
          "category": "rebounding",
          "line": 7.5,
          "over_payout": -105,
          "under_payout": -115
        },
        {
          "stat_type": "assists",
          "display_name": "Assists",
          "category": "playmaking",
          "line": 7.5,
          "over_payout": 100,
          "under_payout": -120
        },
        {
          "stat_type": "threePointersMade",
          "display_name": "3PT Made",
          "category": "shooting",
          "line": 2.5,
          "over_payout": 115,
          "under_payout": -135
        }
      ]
    }
  ]
}
```

### NHL Example

```json
{
  "eventID": "NHL_20260115_TOR@BOS",
  "leagueID": "NHL",
  "start_time": "2026-01-15T19:00:00Z",
  "player_props": [
    {
      "player_id": "AUSTON_MATTHEWS_1_NHL",
      "player_name": "Auston Matthews",
      "props": [
        {
          "stat_type": "points",
          "display_name": "Goals",
          "category": "scoring",
          "line": 0.5,
          "over_payout": 150,
          "under_payout": -180
        },
        {
          "stat_type": "assists",
          "display_name": "Assists",
          "category": "playmaking",
          "line": 0.5,
          "over_payout": 120,
          "under_payout": -140
        },
        {
          "stat_type": "goals+assists",
          "display_name": "Points",
          "category": "overall",
          "line": 1.5,
          "over_payout": 110,
          "under_payout": -130
        },
        {
          "stat_type": "shots_onGoal",
          "display_name": "Shots on Goal",
          "category": "shooting",
          "line": 3.5,
          "over_payout": -105,
          "under_payout": -115
        }
      ]
    }
  ]
}
```

### MLB Example

```json
{
  "eventID": "MLB_20260615_NYY@BOS",
  "leagueID": "MLB",
  "start_time": "2026-06-15T19:10:00Z",
  "player_props": [
    {
      "player_id": "AARON_JUDGE_1_MLB",
      "player_name": "Aaron Judge",
      "props": [
        {
          "stat_type": "batting_hits",
          "display_name": "Hits",
          "category": "batting",
          "line": 1.5,
          "over_payout": -115,
          "under_payout": -105
        },
        {
          "stat_type": "batting_homeruns",
          "display_name": "Home Runs",
          "category": "batting",
          "line": 0.5,
          "over_payout": 200,
          "under_payout": -250
        },
        {
          "stat_type": "batting_runsBattedIn",
          "display_name": "RBIs",
          "category": "batting",
          "line": 1.5,
          "over_payout": 100,
          "under_payout": -120
        },
        {
          "stat_type": "batting_totalBases",
          "display_name": "Total Bases",
          "category": "batting",
          "line": 2.5,
          "over_payout": -105,
          "under_payout": -115
        }
      ]
    },
    {
      "player_id": "GERRIT_COLE_1_MLB",
      "player_name": "Gerrit Cole",
      "props": [
        {
          "stat_type": "pitching_strikeouts",
          "display_name": "Strikeouts",
          "category": "pitching",
          "line": 6.5,
          "over_payout": -110,
          "under_payout": -110
        },
        {
          "stat_type": "pitching_hitsAllowed",
          "display_name": "Hits Allowed",
          "category": "pitching",
          "line": 4.5,
          "over_payout": -105,
          "under_payout": -115
        },
        {
          "stat_type": "pitching_earnedRuns",
          "display_name": "Earned Runs",
          "category": "pitching",
          "line": 2.5,
          "over_payout": 110,
          "under_payout": -130
        }
      ]
    }
  ]
}
```

### MLS / UEFA Champions League Example

```json
{
  "eventID": "MLS_20260615_LAG@LAFC",
  "leagueID": "MLS",
  "start_time": "2026-06-15T22:30:00Z",
  "player_props": [
    {
      "player_id": "CHICHARITO_1_MLS",
      "player_name": "Chicharito",
      "props": [
        {
          "stat_type": "points",
          "display_name": "Goals",
          "category": "scoring",
          "line": 0.5,
          "over_payout": 180,
          "under_payout": -220
        },
        {
          "stat_type": "firstToScore",
          "display_name": "First to Score",
          "category": "scoring",
          "yes_payout": 350,
          "no_payout": null
        },
        {
          "stat_type": "lastToScore",
          "display_name": "Last to Score",
          "category": "scoring",
          "yes_payout": 400,
          "no_payout": null
        }
      ]
    }
  ]
}
```

## Prop Type Detection

```typescript
interface Prop {
  stat_type: string
  display_name: string
  category: string
  // Over/Under props
  line?: number
  over_payout?: number | null
  under_payout?: number | null
  // Yes/No props
  yes_payout?: number | null
  no_payout?: number | null
}

function isOverUnderProp(prop: Prop): boolean {
  return prop.line !== undefined
}

function isYesNoProp(prop: Prop): boolean {
  return prop.yes_payout !== undefined || prop.no_payout !== undefined
}

function propHasOdds(prop: Prop): boolean {
  if (isOverUnderProp(prop)) {
    return prop.over_payout !== null || prop.under_payout !== null
  }
  if (isYesNoProp(prop)) {
    return prop.yes_payout !== null || prop.no_payout !== null
  }
  return false
}
```

## Common Utility Functions

```typescript
// Format American odds
function formatOdds(odds: number | null): string {
  if (odds === null) return '-'
  return odds > 0 ? `+${odds}` : String(odds)
}

// Calculate implied probability from American odds
function impliedProbability(odds: number): number {
  if (odds > 0) {
    return 100 / (odds + 100)
  } else {
    return Math.abs(odds) / (Math.abs(odds) + 100)
  }
}

// Group players by category
function groupByCategory(players: PlayerProp[]) {
  const grouped: Record<string, PlayerProp[]> = {}

  players.forEach(player => {
    player.props.forEach(prop => {
      if (!grouped[prop.category]) {
        grouped[prop.category] = []
      }
      if (!grouped[prop.category].some(p => p.player_id === player.player_id)) {
        grouped[prop.category].push(player)
      }
    })
  })

  return grouped
}

// Sort players by most props
function sortByPropCount(players: PlayerProp[]): PlayerProp[] {
  return [...players].sort((a, b) => b.props.length - a.props.length)
}

// Filter players with available odds
function filterWithOdds(players: PlayerProp[]): PlayerProp[] {
  return players
    .map(player => ({
      ...player,
      props: player.props.filter(propHasOdds)
    }))
    .filter(player => player.props.length > 0)
}
```

## Category Definitions

```typescript
type Category =
  // Football
  | 'passing'
  | 'rushing'
  | 'receiving'
  | 'scoring'
  // Basketball
  | 'rebounding'
  | 'playmaking'
  | 'shooting'
  // Baseball
  | 'batting'
  | 'pitching'
  // Hockey
  | 'overall'
  | 'defense'
  // General
  | 'goaltending'

const categoryLabels: Record<Category, string> = {
  passing: 'Passing',
  rushing: 'Rushing',
  receiving: 'Receiving',
  scoring: 'Scoring',
  rebounding: 'Rebounding',
  playmaking: 'Playmaking',
  shooting: 'Shooting',
  batting: 'Batting',
  pitching: 'Pitching',
  overall: 'Overall',
  defense: 'Defense',
  goaltending: 'Goaltending',
}
```

## League-Specific Categories

```typescript
const categoriesByLeague: Record<string, Category[]> = {
  NFL: ['passing', 'rushing', 'receiving', 'scoring'],
  NCAAF: ['passing', 'rushing', 'receiving', 'scoring'],
  NBA: ['scoring', 'rebounding', 'playmaking', 'shooting'],
  NCAAB: ['scoring', 'rebounding', 'playmaking', 'shooting'],
  MLB: ['batting', 'pitching'],
  NHL: ['scoring', 'playmaking', 'overall', 'shooting', 'defense'],
  MLS: ['scoring'],
  UEFA_CHAMPIONS_LEAGUE: ['scoring'],
}

function getCategoriesForLeague(leagueID: string): Category[] {
  return categoriesByLeague[leagueID] || []
}
```

## Error States

```typescript
// No player props available for league
{
  "eventID": "EPL_20260115_MUN@LIV",
  "leagueID": "EPL",  // Not supported
  "player_props": null  // Will be null for unsupported leagues
}

// Game with no available props (supported league but no data)
{
  "eventID": "NBA_20260115_LAL@GSW",
  "leagueID": "NBA",
  "player_props": []  // Empty array means supported but no props yet
}

// Player with missing odds
{
  "player_id": "PLAYER_1_NBA",
  "player_name": "Example Player",
  "props": [
    {
      "stat_type": "points",
      "display_name": "Points",
      "category": "scoring",
      "line": 20.5,
      "over_payout": null,  // No odds available
      "under_payout": null
    }
  ]
}
```

## TypeScript Interfaces

```typescript
export interface EventShowMoreResponse {
  eventID: string
  leagueID: string
  start_time: string
  away_team: Team
  home_team: Team
  markets: Markets
  player_props: PlayerProp[] | null
}

export interface Team {
  name: string
  abbreviation: string
  moneyline: number | null
}

export interface Markets {
  spread: {
    home: SpreadOption
    away: SpreadOption
  }
  total: TotalOption
}

export interface SpreadOption {
  point: number | null
  payout: number | null
  target_team: string
}

export interface TotalOption {
  line: number | null
  over_payout: number | null
  under_payout: number | null
}

export interface PlayerProp {
  player_id: string
  player_name: string
  props: Prop[]
}

export interface Prop {
  stat_type: string
  display_name: string
  category: string
  // Over/Under specific
  line?: number
  over_payout?: number | null
  under_payout?: number | null
  // Yes/No specific
  yes_payout?: number | null
  no_payout?: number | null
}

export type PropType = 'over-under' | 'yes-no'

export function getPropType(prop: Prop): PropType {
  return prop.line !== undefined ? 'over-under' : 'yes-no'
}
```

## Testing Utilities

```typescript
// Mock data generators for testing
export function mockPlayerProp(overrides?: Partial<PlayerProp>): PlayerProp {
  return {
    player_id: 'MOCK_PLAYER_1_NFL',
    player_name: 'Mock Player',
    props: [
      {
        stat_type: 'passing_yards',
        display_name: 'Passing Yards',
        category: 'passing',
        line: 250.5,
        over_payout: -110,
        under_payout: -110,
      },
    ],
    ...overrides,
  }
}

export function mockOverUnderProp(
  statType: string,
  displayName: string,
  line: number
): Prop {
  return {
    stat_type: statType,
    display_name: displayName,
    category: 'scoring',
    line,
    over_payout: -110,
    under_payout: -110,
  }
}

export function mockYesNoProp(
  statType: string,
  displayName: string
): Prop {
  return {
    stat_type: statType,
    display_name: displayName,
    category: 'scoring',
    yes_payout: 150,
    no_payout: null,
  }
}
```

## Performance Tips

```typescript
// Use memo for expensive calculations
const sortedPlayers = useMemo(() => {
  return sortByPropCount(players)
}, [players])

// Debounce search input
import { debounce } from 'lodash'

const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    setSearchResults(searchPlayers(players, query))
  }, 300),
  [players]
)

// Virtualize long lists
import { useVirtualizer } from '@tanstack/react-virtual'

const virtualizer = useVirtualizer({
  count: players.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 200,
})
```

## Related Files

- Main UI Documentation: `/docs/player-props-ui-guide.md`
- Backend Implementation: `/src/app/api/events/show-more/[eventId]/route.ts`
- API Documentation: `CLAUDE.md`
