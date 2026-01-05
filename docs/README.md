# Player Props Feature Documentation

Complete documentation for the Player Props feature in the Fantasy Pool application.

## 📚 Documentation Overview

This documentation suite covers the complete implementation of player props across all supported leagues.

### Available Guides

1. **[UI Implementation Guide](./player-props-ui-guide.md)** - Comprehensive guide for frontend developers
   - API endpoint usage
   - Response structures
   - Display patterns and best practices
   - Responsive design
   - Accessibility
   - Error handling

2. **[Quick Reference](./player-props-quick-reference.md)** - Fast lookup for developers
   - League-specific data structures
   - TypeScript interfaces
   - Utility functions
   - Testing helpers

3. **[Design Guide](./player-props-design-guide.md)** - Visual design specifications
   - Color palette
   - Typography
   - Component designs
   - CSS implementations
   - Animations
   - Dark mode support

## 🎯 Feature Overview

The Player Props feature provides real-time betting odds for individual player performance across multiple sports leagues.

### Supported Leagues

| League | Sport | Props Available |
|--------|-------|-----------------|
| **NFL** | Football | Passing Yards, Passing TDs, Receptions, Receiving Yards, Rush Yards, Anytime TD, Total TDs |
| **NBA** | Basketball | Points, Rebounds, Assists, 3PT Made |
| **NCAAF** | College Football | Same as NFL |
| **NCAAB** | College Basketball | Same as NBA |
| **MLB** | Baseball | Hits, Home Runs, RBIs, Total Bases, Strikeouts, Hits Allowed, Earned Runs |
| **NHL** | Hockey | Goals, Assists, Points (Goals+Assists), Shots on Goal, Blocked Shots |
| **MLS** | Soccer | Goals, First to Score, Last to Score |
| **UEFA Champions League** | Soccer | Same as MLS |

## 🔌 API Endpoint

```
GET /api/events/show-more/[eventId]
```

### Quick Example

```typescript
const response = await fetch('/api/events/show-more/NFL_20260115_KC@BUF')
const data = await response.json()

console.log(data.player_props)
// Returns array of player props or null if league not supported
```

## 🏗️ Data Structure

```typescript
{
  player_props: [
    {
      player_id: "PATRICK_MAHOMES_1_NFL",
      player_name: "Patrick Mahomes",
      props: [
        {
          stat_type: "passing_yards",
          display_name: "Passing Yards",
          category: "passing",
          line: 275.5,
          over_payout: -110,
          under_payout: -110
        }
      ]
    }
  ]
}
```

## 🎨 UI Components

### Recommended Component Structure

```
PlayerPropsView/
├── PlayerPropsContainer.tsx    # Main container
├── FilterBar.tsx               # League-specific filtering
├── SearchBar.tsx               # Player search
├── PlayerCard.tsx              # Individual player display
├── PropRow.tsx                 # Stat display with odds
└── EmptyState.tsx              # No data messaging
```

### Key Features to Implement

- ✅ Player search
- ✅ Category filtering
- ✅ Team filtering
- ✅ Position filtering (sport-specific)
- ✅ Responsive layout
- ✅ Loading states
- ✅ Error handling
- ✅ Dark mode support
- ✅ Accessibility (WCAG 2.1 AA)

## 🚀 Quick Start for Developers

### 1. Fetch Player Props

```typescript
import { useEffect, useState } from 'react'

function usePlayerProps(eventId: string) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`/api/events/show-more/${eventId}`)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [eventId])

  return { data, loading, error }
}
```

### 2. Display Player Props

```tsx
function PlayerPropsView({ eventId }) {
  const { data, loading, error } = usePlayerProps(eventId)

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorMessage error={error} />
  if (!data?.player_props) return <UnsupportedLeague />

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.player_props.map(player => (
        <PlayerCard key={player.player_id} player={player} />
      ))}
    </div>
  )
}
```

### 3. Format Odds

```typescript
function formatOdds(odds: number | null): string {
  if (odds === null) return '-'
  return odds > 0 ? `+${odds}` : String(odds)
}
```

## 📊 League-Specific Considerations

### Football (NFL/NCAAF)

- Group by position: QB, RB, WR, TE
- Show lineup starters first
- Highlight red zone threats for TDs

### Basketball (NBA/NCAAB)

- Group by position: PG, SG, SF, PF, C
- Show starting 5 first
- Emphasize primary scorers

### Baseball (MLB)

- Separate batters and pitchers
- Show starting lineup order for batters
- Highlight starting pitcher

### Hockey (NHL)

- Group by forwards and defensemen
- Note: "Goals" uses `points` statID
- Note: "Points" means goals+assists

### Soccer (MLS/UEFA)

- Group by team
- Show starting XI first
- Limited props compared to other sports

## 🧪 Testing

### Test Cases to Cover

1. **League Support**
   - ✅ Supported league returns player props
   - ✅ Unsupported league returns null
   - ✅ Empty props array for supported league with no data

2. **Prop Types**
   - ✅ Over/Under props display line and both payouts
   - ✅ Yes/No props display both options
   - ✅ Null odds show unavailable state

3. **User Interactions**
   - ✅ Search filters players
   - ✅ Category filters work
   - ✅ Bet buttons are clickable
   - ✅ Keyboard navigation works

4. **Responsive Design**
   - ✅ Mobile layout stacks vertically
   - ✅ Tablet shows 2 columns
   - ✅ Desktop shows 3+ columns

5. **Accessibility**
   - ✅ Proper ARIA labels
   - ✅ Keyboard navigation
   - ✅ Screen reader support
   - ✅ Focus indicators

## 🔧 Backend Implementation

The backend route is located at:
```
/src/app/api/events/show-more/[eventId]/route.ts
```

### League Whitelists

Each league has a whitelist of supported player props:
- `NFL_PLAYER_PROPS_WHITELIST`
- `NBA_PLAYER_PROPS_WHITELIST`
- `NCAAB_PLAYER_PROPS_WHITELIST`
- `NCAAF_PLAYER_PROPS_WHITELIST`
- `MLB_PLAYER_PROPS_WHITELIST`
- `NHL_PLAYER_PROPS_WHITELIST`
- `MLS_PLAYER_PROPS_WHITELIST`
- `UEFA_CHAMPIONS_LEAGUE_PLAYER_PROPS_WHITELIST`

### Adding New Props

To add a new prop to a league:

```typescript
const NFL_PLAYER_PROPS_WHITELIST = [
  // ... existing props
  {
    displayName: 'New Stat Name',
    statID: 'api_stat_id',      // From SportsGameOdds API
    betTypeID: 'ou',             // 'ou' or 'yn'
    category: 'category_name'    // For UI grouping
  }
]
```

## 📈 Performance Optimization

### Recommendations

1. **Virtualization** - For games with 50+ players, use virtual scrolling
2. **Memoization** - Cache filtered/sorted results
3. **Code Splitting** - Lazy load player props component
4. **Image Optimization** - Use Next.js Image for player avatars
5. **API Caching** - Cache responses for 30-60 seconds

### Example: Virtual Scrolling

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

## 🎯 Common Pitfalls

### 1. NHL Terminology Confusion

❌ Wrong:
```typescript
// "points" in hockey API means goals, not points!
<div>Goals: {prop.statID === 'goals'}</div>
```

✅ Correct:
```typescript
// Individual goals use "points" statID
<div>Goals: {prop.statID === 'points'}</div>
// Goals+Assists use "goals+assists" statID
<div>Points: {prop.statID === 'goals+assists'}</div>
```

### 2. Soccer Goals

❌ Wrong:
```typescript
// Soccer goals don't use "goals" statID
<div>Goals: {prop.statID === 'goals'}</div>
```

✅ Correct:
```typescript
// Soccer uses "points" for goals
<div>Goals: {prop.statID === 'points'}</div>
```

### 3. Null Checks

❌ Wrong:
```typescript
// This will crash if player_props is null
{data.player_props.map(player => ...)}
```

✅ Correct:
```typescript
// Always check for null first
{data.player_props?.map(player => ...) ?? <NoPropsAvailable />}
```

### 4. Odds Formatting

❌ Wrong:
```typescript
// Missing the + sign for positive odds
<span>{odds}</span>
```

✅ Correct:
```typescript
// Format with + for positive odds
<span>{odds > 0 ? `+${odds}` : odds}</span>
```

## 🔐 Security Considerations

- ✅ API key stored in environment variables
- ✅ No sensitive data exposed to client
- ✅ Rate limiting on backend
- ✅ Input validation for eventId

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari 14+
- Chrome Mobile 90+

## 🆘 Troubleshooting

### Player Props Not Showing

1. Check if league is supported
   ```typescript
   if (data.player_props === null) {
     console.log('League not supported')
   }
   ```

2. Check if game has props available
   ```typescript
   if (data.player_props?.length === 0) {
     console.log('No props available yet - check back closer to game time')
   }
   ```

3. Verify API response
   ```bash
   curl http://localhost:3000/api/events/show-more/[eventId]
   ```

### Odds Not Displaying

1. Check for null values
   ```typescript
   if (prop.over_payout === null) {
     console.log('Over odds not available')
   }
   ```

2. Verify bet type
   ```typescript
   const isOverUnder = 'line' in prop
   const isYesNo = 'yes_payout' in prop
   ```

## 📞 Support

For questions or issues:

1. Check this documentation
2. Review [SportsGameOdds API Docs](https://sportsgameodds.com/docs)
3. Check backend implementation in route.ts
4. Contact the development team

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Basic player props for all supported leagues
- ✅ Over/Under and Yes/No bet types
- ✅ API integration

### Phase 2 (Future)
- ⬜ Live odds updates via WebSocket
- ⬜ Player comparison tool
- ⬜ Parlay builder
- ⬜ Historical performance data
- ⬜ Prop correlations

### Phase 3 (Future)
- ⬜ AI-powered prop recommendations
- ⬜ Custom prop alerts
- ⬜ Social sharing
- ⬜ Advanced analytics

## 📝 Contributing

When adding or modifying player props:

1. Update the appropriate whitelist in `route.ts`
2. Verify statID against SportsGameOdds API
3. Update documentation
4. Add tests
5. Test across all screen sizes

## 📄 License

Internal documentation for Fantasy Pool application.

---

**Last Updated:** January 5, 2026

**Version:** 1.0.0

**Maintainers:** Fantasy Pool Development Team
