# React Native Sports Betting App UI Prompt

Create a complete React Native mobile app UI for a weekly sports betting competition platform with the following specifications:

## 🎯 App Overview
This is a **weekly fantasy sports betting competition app** (NOT real money gambling). Users compete in small randomized pools using virtual credits. Think FanDuel's UI aesthetic but for a weekly competition format.

## 📱 Core Navigation Structure
Create a bottom tab navigator with 4 main sections:

### 1. HOME TAB 🏠
**Purpose:** Browse and select games to bet on

**Layout:**
- **Header Section:**
  - App logo/branding
  - Current week indicator: "Week 14 Competition"
  - User's current credits display: "980 units" (large, prominent, green/red based on +/-)
  - Countdown timer: "Ends in 2d 14h 23m"

- **Filter Tabs:** (Horizontal scrollable)
  - [All] [Live Now] [Today] [Tomorrow] [Soccer] [Basketball] [Football]

- **Game Cards:** (Scrollable list)
  Each card shows:
  ```
  ┌─────────────────────────────────────┐
  │ 🏈 NFL                    Sun 1:00 PM│
  │                                       │
  │ Buffalo Bills  @  Miami Dolphins      │
  │                                       │
  │ MONEYLINE                             │
  │ Bills +120        Dolphins -140       │
  │                                       │
  │ [View All Markets →]                  │
  └─────────────────────────────────────┘
  ```
  
- **Design Details:**
  - Dark background (#0F172A or similar)
  - Cards with subtle borders/shadows
  - Team logos/icons
  - Live games have pulsing red dot
  - Odds displayed as blue pill buttons
  - Match time in subdued gray text

- **Interaction:**
  - Tap card → Opens full betting market view
  - Tap odds button → Opens bet slip immediately

### 2. LEADERBOARD TAB 🏆
**Purpose:** Show rankings within user's weekly pool

**Header Section:**
- Pool name: "Pool C - Week 14"
- Total players: "97 active players"
- Prize pool indicator: "Top 10 win prizes"
- User's current rank highlighted: "You're #23"

**Leaderboard List:**
```
┌─────────────────────────────────────┐
│ #1  🥇 SportsMaster                 │
│     1,450 units  (+450) ↗           │
│     Potential: $1,000               │
├─────────────────────────────────────┤
│ #2  🥈 BetKing                      │
│     1,380 units  (+380) ↗           │
│     Potential: $600                 │
├─────────────────────────────────────┤
│ #23 ⭐ YOU                          │
│     980 units  (-20) ↘              │
│     Potential: $0                   │
└─────────────────────────────────────┘
```

**Design Details:**
- Medal icons for top 3
- User's row highlighted with accent color
- Green arrows ↗ for positive change
- Red arrows ↘ for negative change
- Gradient background for top positions
- Prize amounts only shown for winning positions

**Additional Features:**
- Pull to refresh
- Tap user → View their profile (username, stats only)
- "View Full Rankings" button to see all 100 players

### 3. PROFILE TAB 👤
**Purpose:** Personal stats, friends, and social features

**Sections:**

**A. Header Card:**
```
┌─────────────────────────────────────┐
│        [Profile Picture]             │
│         @username                    │
│                                      │
│  Current Pool: Pool C                │
│  Rank: #23 of 97                    │
│                                      │
│  ╔═══════════════════════════════╗  │
│  ║   980 UNITS                   ║  │
│  ║   -20 this week               ║  │
│  ╚═══════════════════════════════╝  │
└─────────────────────────────────────┘
```

**B. Weekly Stats Section:**
- Bets Placed: 12
- Win Rate: 58%
- Biggest Win: +120 units
- Current Streak: 2W

**C. Friends Section:**
```
┌─────────────────────────────────────┐
│ Friends (23)              [+ Add]    │
├─────────────────────────────────────┤
│ SportsMaster      1,450 units  ↗    │
│ BetKing           1,380 units  ↗    │
│ UserName3           920 units  ↘    │
│                                      │
│ [View All Friends →]                 │
└─────────────────────────────────────┘
```

**D. Historic Stats Section:**
- All-Time Record
- Best Weekly Finish
- Total Competitions Entered
- Total Winnings

**Design Details:**
- Card-based layout with spacing
- Stats displayed in 2x2 grid
- Friend entries show mini leaderboard format
- Toggle for profile privacy

### 4. ACCOUNT TAB ⚙️
**Purpose:** Payments, settings, and app management

**Sections:**

**A. Subscription Status Card:**
```
┌─────────────────────────────────────┐
│ 🎟️ ACTIVE SUBSCRIPTION              │
│                                      │
│ Weekly Pass                          │
│ Renews: Monday, Nov 30              │
│                                      │
│ [Manage Subscription]               │
└─────────────────────────────────────┘
```

**B. Payment Section:**
- Payment Method on File
- Purchase History
- Buy-Back Credits option (if applicable)

**C. Settings List:**
- Notifications (toggle switches)
  - New week started
  - Game results
  - Rank changes
  - Friend activity
- App Preferences
  - Default stake amount
  - Odds format (American/Decimal)
  - Theme (Dark/Light)
- Privacy Settings
  - Profile visibility
  - Friend requests

**D. Support & Legal:**
- How to Play / Tutorial
- Rules & Guidelines
- Support / Contact
- Terms of Service
- Responsible Gaming

**E. Danger Zone:**
- Cancel Subscription
- Delete Account

---

## 🎨 Global Design System

### Color Palette (Dark Theme Default):
- **Background:** #0F172A (dark blue-gray)
- **Cards:** #1E293B (lighter blue-gray)
- **Primary Action:** #3B82F6 (bright blue)
- **Success/Positive:** #10B981 (green)
- **Danger/Negative:** #EF4444 (red)
- **Text Primary:** #F1F5F9 (off-white)
- **Text Secondary:** #94A3B8 (muted gray)
- **Accent:** #8B5CF6 (purple for highlights)

### Typography:
- **Headers:** Bold, 20-24px
- **Body:** Regular, 14-16px
- **Captions:** Light, 12-14px
- **Numbers/Units:** Medium/Semibold, 16-20px

### Components to Include:

**Bet Slip (Modal/Bottom Sheet):**
```
┌─────────────────────────────────────┐
│ ✕                           BET SLIP│
├─────────────────────────────────────┤
│ Bills ML @ +120                     │
│ Buffalo Bills vs Miami Dolphins     │
│                                      │
│ STAKE                                │
│ ┌─────────────────────────────────┐ │
│ │  [  100  ] units                │ │
│ └─────────────────────────────────┘ │
│                                      │
│ Quick Stakes:                        │
│ [50] [100] [200] [MAX]              │
│                                      │
│ POTENTIAL RETURN                     │
│ 220 units (+120 profit)             │
│                                      │
│ Remaining: 880 units                │
│                                      │
│ [ PLACE BET ]                       │
└─────────────────────────────────────┘
```

**Game Detail View (Full Screen):**
- Game header with teams, time, sport
- Tabs: [Moneyline] [Spread] [Totals] [Props]
- Market options displayed as tappable rows
- Each row shows odds as blue buttons
- Tap odds → opens bet slip

**Empty States:**
- No games today: "Check back soon!"
- No friends: "Add friends to compare stats"
- No active bets: "Place your first bet to get started"

**Loading States:**
- Skeleton screens for game cards
- Shimmer effect on loading content

**Notifications/Toasts:**
- Success: "Bet placed! Bills ML +120"
- Error: "Insufficient units"
- Info: "New week starts in 2 hours"

---

## 🔧 Critical Technical Requirements

### Must-Have Interactions:
1. Pull-to-refresh on Home and Leaderboard
2. Smooth bottom sheet animations for bet slip
3. Real-time credit updates after bet placement
4. Haptic feedback on bet placement
5. Swipeable tabs where applicable

### Status Indicators:
- **Live games:** Red pulsing dot
- **Locked bets:** Gray with lock icon
- **Pending results:** Yellow with clock icon
- **Won bets:** Green checkmark
- **Lost bets:** Red X

### Edge Cases to Handle:
- User with 0 credits (show "Buy-Back" CTA)
- User not subscribed (gate with paywall)
- New week starting (show countdown + registration)
- Pool assignment pending (show "Waiting for Monday" state)

---

## 📝 Additional Screens Needed

### Onboarding Flow:
1. Welcome screen with app value prop
2. "How it works" tutorial (3-4 slides)
3. Account creation
4. Payment setup
5. "You're ready for Monday!" confirmation

### Weekly Reset Screen:
```
┌─────────────────────────────────────┐
│         🎉 NEW WEEK!                │
│                                      │
│  You've been assigned to:            │
│         POOL C                       │
│                                      │
│  97 competitors                      │
│  1,000 units to start               │
│                                      │
│  Competition ends:                   │
│  Monday, Dec 2 at 12:00am EST       │
│                                      │
│  [ LET'S GO! ]                      │
└─────────────────────────────────────┘
```

### Buy-Back Screen (if user hits 0):
- Dramatic "Out of Credits!" message
- Buy-back option ($5 for 1,000 units)
- Only available until Friday
- Countdown: "Buy-back closes in X hours"

---

## 🎯 Key UX Principles

1. **Credits always visible:** Show units prominently in header
2. **One-tap betting:** Minimize steps from seeing odds to placing bet
3. **Social proof:** Show friends' activity, pool rankings constantly
4. **Urgency:** Use countdowns, "ends soon" messaging
5. **Gamification:** Use streaks, badges, achievements
6. **No gambling language:** Use "units" not "$", "compete" not "gamble"
7. **Fair play:** Lock bets when games start, show all picks are final

---

## 🚀 Bonus Features (If Time Permits)

- **Activity Feed:** See friends' recent bets (with privacy controls)
- **Push Notifications:** Game results, rank changes
- **Achievements:** Badges for streaks, big wins, participation
- **Bet History:** Scrollable list of all past wagers with results
- **Weekly Recap:** Automated summary of week's performance

---

**Output the complete React Native code with:**
- Proper navigation setup (React Navigation)
- All 4 main tabs fully built
- Reusable components (GameCard, BetSlip, LeaderboardRow, etc.)
- Mock data for demonstration
- Proper TypeScript types
- Clean, production-ready code structure

Make it look modern, professional, and addictive. Think FanDuel meets fantasy football meets social competition. Dark theme, smooth animations, and a premium feel. 

**REMEMBER:** This is a weekly pool competition app, NOT real gambling. Users bet virtual credits, compete in small randomized pools of ~100 players, and everything resets Monday 12:00am EST.