# Player Props UI Documentation

## Overview

This document provides guidance for displaying player props data from the `/api/events/show-more/[eventId]` endpoint in the user interface.

## API Endpoint

```
GET /api/events/show-more/[eventId]
```

### Response Structure

```typescript
{
  eventID: string
  leagueID: string
  start_time: string // ISO 8601 date-time
  away_team: {
    name: string
    abbreviation: string
    moneyline: number | null // American odds format (e.g., -110, +150)
  }
  home_team: {
    name: string
    abbreviation: string
    moneyline: number | null
  }
  markets: {
    spread: {
      home: {
        point: number | null
        payout: number | null // American odds
        target_team: string
      }
      away: {
        point: number | null
        payout: number | null
        target_team: string
      }
    }
    total: {
      line: number | null
      over_payout: number | null
      under_payout: number | null
    }
  }
  player_props: Array<PlayerProp> | null
}
```

### Player Props Structure

```typescript
interface PlayerProp {
  player_id: string
  player_name: string
  props: Array<{
    stat_type: string
    display_name: string
    category: string

    // For Over/Under props (betTypeID: 'ou')
    line?: number
    over_payout?: number | null
    under_payout?: number | null

    // For Yes/No props (betTypeID: 'yn')
    yes_payout?: number | null
    no_payout?: number | null
  }>
}
```

## League-Specific Player Props

### NFL / NCAAF (Football)

**Categories:** `passing`, `receiving`, `rushing`, `scoring`

| Display Name   | Stat Type            | Bet Type    | Example Line |
|----------------|----------------------|-------------|--------------|
| Passing Yards  | passing_yards        | Over/Under  | 275.5        |
| Passing TDs    | passing_touchdowns   | Over/Under  | 2.5          |
| Receptions     | receiving_receptions | Over/Under  | 5.5          |
| Receiving Yards| receiving_yards      | Over/Under  | 75.5         |
| Rush Yards     | rushing_yards        | Over/Under  | 85.5         |
| Anytime TD     | firstTouchdown       | Yes/No      | -            |
| Total TDs      | touchdowns           | Over/Under  | 0.5          |

**UI Grouping Recommendation:**
- Group by player position (QB, RB, WR, TE)
- Primary props: Passing Yards, Receiving Yards, Rush Yards
- Secondary props: TDs, Receptions

---

### NBA / NCAAB (Basketball)

**Categories:** `scoring`, `rebounding`, `playmaking`, `shooting`

| Display Name | Stat Type        | Bet Type    | Example Line |
|--------------|------------------|-------------|--------------|
| Points       | points           | Over/Under  | 28.5         |
| Rebounds     | rebounds         | Over/Under  | 10.5         |
| Assists      | assists          | Over/Under  | 7.5          |
| 3PT Made     | threePointersMade| Over/Under  | 2.5          |

**UI Grouping Recommendation:**
- Group by player
- Display primary stats (Points, Rebounds, Assists) prominently
- Show 3PT Made for guards and forwards

---

### NHL (Hockey)

**Categories:** `scoring`, `playmaking`, `overall`, `shooting`, `defense`

| Display Name    | Stat Type      | Bet Type    | Example Line | Notes                    |
|-----------------|----------------|-------------|--------------|--------------------------|
| Goals           | points         | Over/Under  | 0.5          | API uses "points" for goals |
| Assists         | assists        | Over/Under  | 0.5          |                          |
| Points          | goals+assists  | Over/Under  | 1.5          | Goals + Assists combined |
| Shots on Goal   | shots_onGoal   | Over/Under  | 3.5          |                          |
| Blocked Shots   | blocks         | Over/Under  | 2.5          |                          |

**UI Grouping Recommendation:**
- Group by player position (Forwards, Defensemen)
- Primary props: Goals, Points (Goals+Assists)
- Show Blocked Shots for defensemen

---

### MLB (Baseball)

**Categories:** `batting`, `pitching`

#### Batting Props

| Display Name | Stat Type             | Bet Type    | Example Line |
|--------------|-----------------------|-------------|--------------|
| Hits         | batting_hits          | Over/Under  | 1.5          |
| Home Runs    | batting_homeruns      | Over/Under  | 0.5          |
| RBIs         | batting_runsBattedIn  | Over/Under  | 1.5          |
| Total Bases  | batting_totalBases    | Over/Under  | 2.5          |

#### Pitching Props

| Display Name    | Stat Type               | Bet Type    | Example Line |
|-----------------|-------------------------|-------------|--------------|
| Strikeouts      | pitching_strikeouts     | Over/Under  | 6.5          |
| Hits Allowed    | pitching_hitsAllowed    | Over/Under  | 4.5          |
| Earned Runs     | pitching_earnedRuns     | Over/Under  | 2.5          |

**UI Grouping Recommendation:**
- Separate tabs/sections for Batters vs Pitchers
- For batters: Show lineup order
- For pitchers: Show starting pitcher separately from bullpen

---

### MLS / UEFA Champions League (Soccer)

**Categories:** `scoring`

| Display Name    | Stat Type     | Bet Type    | Example Line | Notes                 |
|-----------------|---------------|-------------|-------------|-----------------------|
| Goals           | points        | Over/Under  | 0.5         | API uses "points" for goals |
| First to Score  | firstToScore  | Yes/No      | -           | Anytime goal scorer   |
| Last to Score   | lastToScore   | Yes/No      | -           |                       |

**UI Grouping Recommendation:**
- Group by team
- Show starting XI separately from substitutes
- Highlight forwards and attacking midfielders

---

## UI Display Patterns

### 1. Player Card Layout

```
┌─────────────────────────────────────┐
│  👤 Player Name                     │
│  Position • Team                    │
├─────────────────────────────────────┤
│  📊 PASSING                         │
│  ┌───────────────────────────────┐  │
│  │ Passing Yards    275.5        │  │
│  │ OVER -110    |    UNDER -110  │  │
│  └───────────────────────────────┘  │
│                                     │
│  🏃 RUSHING                         │
│  ┌───────────────────────────────┐  │
│  │ Rush Yards       85.5         │  │
│  │ OVER +100    |    UNDER -120  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### 2. Compact List View

```
Player Name          Stat               Line    Over     Under
─────────────────────────────────────────────────────────────
P. Mahomes          Passing Yards      275.5   -110     -110
                    Passing TDs         2.5    +105     -125
                    Anytime TD          -       +450      -

T. Kelce            Receptions          5.5    -115     -105
                    Receiving Yards    75.5    -110     -110
```

### 3. Tabbed Interface

```
┌─ All Players ─┬─ Quarterbacks ─┬─ Running Backs ─┬─ Receivers ─┐
│                                                                  │
│  [Player cards filtered by tab]                                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Display Best Practices

### Odds Formatting

American odds should be displayed with proper formatting:

```typescript
function formatOdds(odds: number | null): string {
  if (odds === null) return '-'
  if (odds > 0) return `+${odds}`
  return `${odds}`
}

// Examples:
// -110 → "-110"
// 150  → "+150"
// null → "-"
```

### Line Formatting

Format lines based on the stat type:

```typescript
function formatLine(line: number | null, statType: string): string {
  if (line === null) return '-'

  // Whole numbers for certain stats
  if (statType.includes('touchdowns') ||
      statType.includes('receptions') ||
      statType.includes('homeruns')) {
    return line.toString()
  }

  // One decimal place for most stats
  return line.toFixed(1)
}

// Examples:
// 275.5 → "275.5" (yards)
// 2.5   → "2.5" (TDs)
// 0.5   → "0.5" (goals)
```

### Category Icons

Use icons to represent different stat categories:

```typescript
const categoryIcons = {
  passing: '🎯',
  rushing: '🏃',
  receiving: '🙌',
  scoring: '🏈',
  rebounding: '🏀',
  playmaking: '🤝',
  shooting: '🎯',
  batting: '⚾',
  pitching: '🥎',
  goaltending: '🥅',
  defense: '🛡️',
  overall: '📊'
}
```

### Unavailable Props

When `player_props` is `null` (league not supported):

```tsx
{!data.player_props && (
  <div className="empty-state">
    <p>Player props are not available for this league yet.</p>
  </div>
)}
```

When a player has no available props:

```tsx
{data.player_props?.length === 0 && (
  <div className="empty-state">
    <p>No player props available for this game.</p>
    <small>Props usually become available 12-24 hours before game time.</small>
  </div>
)}
```

## Filtering & Sorting

### Recommended Filters

1. **By Position** (NFL/NCAAF)
   - QB, RB, WR, TE, K, DEF

2. **By Team**
   - Home team players
   - Away team players

3. **By Stat Category**
   - Passing, Rushing, Receiving
   - Scoring, Rebounding, Assists
   - Batting, Pitching

4. **By Availability**
   - Only show players with available odds
   - Show all players

### Recommended Sort Options

1. **Alphabetical** (Player name A-Z)
2. **Team** (Home first, then away)
3. **Position** (Sport-specific position order)
4. **Most Props** (Players with most available props first)

## Search Functionality

Implement player search with these considerations:

```typescript
function searchPlayers(players: PlayerProp[], query: string) {
  const lowerQuery = query.toLowerCase()

  return players.filter(player =>
    player.player_name.toLowerCase().includes(lowerQuery) ||
    player.props.some(prop =>
      prop.display_name.toLowerCase().includes(lowerQuery)
    )
  )
}

// Examples:
// "mahomes" → matches Patrick Mahomes
// "rushing" → matches all players with rushing props
```

## Responsive Design

### Mobile View (< 768px)

- Stack player cards vertically
- One prop per row
- Compact odds display
- Swipeable categories

```
┌─────────────────────────┐
│ Player Name             │
│ Team • Position         │
├─────────────────────────┤
│ Passing Yards    275.5  │
│ OVER -110 | UNDER -110  │
├─────────────────────────┤
│ Passing TDs       2.5   │
│ OVER +105 | UNDER -125  │
└─────────────────────────┘
```

### Tablet View (768px - 1024px)

- 2-column grid
- Condensed player cards
- Category badges

### Desktop View (> 1024px)

- 3-4 column grid
- Expanded player cards
- Side-by-side prop comparison
- Advanced filtering sidebar

## Accessibility

### ARIA Labels

```tsx
<button
  aria-label={`Bet over ${line} on ${playerName} ${statName}`}
  onClick={handleBetClick}
>
  OVER {formatOdds(overPayout)}
</button>
```

### Keyboard Navigation

- Tab through player cards
- Arrow keys to navigate between props
- Enter to select bet
- Escape to close modals

### Screen Reader Support

```tsx
<div role="region" aria-label="Player props">
  <div role="list">
    {players.map(player => (
      <div
        key={player.player_id}
        role="listitem"
        aria-label={`${player.player_name} props`}
      >
        {/* Player card content */}
      </div>
    ))}
  </div>
</div>
```

## Loading States

### Skeleton Loading

```tsx
{isLoading && (
  <div className="skeleton-player-card">
    <div className="skeleton-avatar" />
    <div className="skeleton-name" />
    <div className="skeleton-prop" />
    <div className="skeleton-prop" />
    <div className="skeleton-prop" />
  </div>
)}
```

### Progressive Loading

1. Load game info first (teams, score)
2. Load main markets (spread, total)
3. Load player props (can take longer)

## Error Handling

### API Errors

```tsx
{error && (
  <div className="error-state">
    <h3>Unable to load player props</h3>
    <p>{error.message}</p>
    <button onClick={retry}>Try Again</button>
  </div>
)}
```

### Missing Data

```tsx
{prop.over_payout === null && prop.under_payout === null && (
  <span className="unavailable">Unavailable</span>
)}
```

## Example Implementation

### React Component

```tsx
import { useState, useEffect } from 'react'

interface PlayerPropsViewProps {
  eventId: string
}

export function PlayerPropsView({ eventId }: PlayerPropsViewProps) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch(`/api/events/show-more/${eventId}`)
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [eventId])

  if (loading) return <LoadingSkeleton />
  if (!data) return <ErrorState />
  if (!data.player_props) return <UnsupportedLeague />

  return (
    <div className="player-props-container">
      <header>
        <h2>Player Props</h2>
        <FilterBar
          filter={filter}
          onChange={setFilter}
          league={data.leagueID}
        />
      </header>

      <div className="player-props-grid">
        {data.player_props.map(player => (
          <PlayerCard
            key={player.player_id}
            player={player}
            league={data.leagueID}
          />
        ))}
      </div>
    </div>
  )
}

function PlayerCard({ player, league }) {
  return (
    <div className="player-card">
      <div className="player-header">
        <h3>{player.player_name}</h3>
      </div>

      <div className="player-props">
        {player.props.map((prop, idx) => (
          <PropRow key={idx} prop={prop} />
        ))}
      </div>
    </div>
  )
}

function PropRow({ prop }) {
  const hasOverUnder = prop.line !== undefined
  const hasYesNo = prop.yes_payout !== undefined || prop.no_payout !== undefined

  return (
    <div className="prop-row">
      <div className="prop-header">
        <span className="prop-name">{prop.display_name}</span>
        <span className="prop-category">{prop.category}</span>
      </div>

      {hasOverUnder && (
        <div className="prop-odds">
          <span className="line">{prop.line}</span>
          <button className="bet-button over">
            OVER {formatOdds(prop.over_payout)}
          </button>
          <button className="bet-button under">
            UNDER {formatOdds(prop.under_payout)}
          </button>
        </div>
      )}

      {hasYesNo && (
        <div className="prop-odds">
          <button className="bet-button yes">
            YES {formatOdds(prop.yes_payout)}
          </button>
          <button className="bet-button no">
            NO {formatOdds(prop.no_payout)}
          </button>
        </div>
      )}
    </div>
  )
}

function formatOdds(odds: number | null): string {
  if (odds === null) return '-'
  return odds > 0 ? `+${odds}` : `${odds}`
}
```

## Performance Optimization

### Virtualization

For games with many players (50+), use virtual scrolling:

```tsx
import { FixedSizeList } from 'react-window'

<FixedSizeList
  height={600}
  itemCount={players.length}
  itemSize={200}
>
  {({ index, style }) => (
    <div style={style}>
      <PlayerCard player={players[index]} />
    </div>
  )}
</FixedSizeList>
```

### Memoization

```tsx
import { useMemo } from 'react'

const filteredPlayers = useMemo(() => {
  return filterPlayers(players, activeFilter)
}, [players, activeFilter])
```

### Code Splitting

```tsx
import { lazy, Suspense } from 'react'

const PlayerPropsView = lazy(() => import('./PlayerPropsView'))

<Suspense fallback={<LoadingSkeleton />}>
  <PlayerPropsView eventId={eventId} />
</Suspense>
```

## Testing Considerations

### Test Cases

1. **League without player props** → Shows "not available" message
2. **Game with no available props** → Shows "check back later" message
3. **Player with null odds** → Shows "-" or "Unavailable"
4. **Over/Under props** → Displays line and both sides
5. **Yes/No props** → Displays both options
6. **Search functionality** → Filters players correctly
7. **Responsive layouts** → Adapts to screen size

### Sample Test Data

```typescript
const mockPlayerProp = {
  player_id: 'PATRICK_MAHOMES_1_NFL',
  player_name: 'Patrick Mahomes',
  props: [
    {
      stat_type: 'passing_yards',
      display_name: 'Passing Yards',
      category: 'passing',
      line: 275.5,
      over_payout: -110,
      under_payout: -110
    },
    {
      stat_type: 'firstTouchdown',
      display_name: 'Anytime TD',
      category: 'scoring',
      yes_payout: 450,
      no_payout: null
    }
  ]
}
```

## Related Documentation

- [SportsGameOdds API Documentation](https://sportsgameodds.com/docs)
- [Backend Route Implementation](/src/app/api/events/show-more/[eventId]/route.ts)
- [Player Props Whitelists](/docs/player-props-whitelists.md)

## Support

For questions or issues with player props display:
- Check the API response structure matches this documentation
- Verify the league is supported (check `player_props` is not null)
- Ensure proper error handling for missing odds data
