# Player Props UI Design Guide

## Design Principles

1. **Clarity First** - Make odds and lines immediately readable
2. **Visual Hierarchy** - Emphasize player name and primary stats
3. **Responsive Layout** - Adapt gracefully across all devices
4. **Accessibility** - Maintain WCAG 2.1 AA standards
5. **Performance** - Smooth interactions, fast loading

## Color Palette

### Odds Buttons

```css
/* Over/Positive bet */
--color-over: #10b981;      /* Green-500 */
--color-over-hover: #059669; /* Green-600 */
--color-over-light: #d1fae5; /* Green-100 */

/* Under/Negative bet */
--color-under: #ef4444;      /* Red-500 */
--color-under-hover: #dc2626; /* Red-600 */
--color-under-light: #fee2e2; /* Red-100 */

/* Yes/No bets */
--color-yes: #3b82f6;       /* Blue-500 */
--color-yes-hover: #2563eb;  /* Blue-600 */
--color-no: #6b7280;        /* Gray-500 */
--color-no-hover: #4b5563;   /* Gray-600 */

/* Unavailable */
--color-disabled: #9ca3af;   /* Gray-400 */
--color-disabled-bg: #f3f4f6; /* Gray-100 */
```

### Category Colors

```css
/* Football */
--category-passing: #3b82f6;   /* Blue */
--category-rushing: #10b981;   /* Green */
--category-receiving: #f59e0b; /* Amber */
--category-scoring: #ef4444;   /* Red */

/* Basketball */
--category-rebounding: #8b5cf6; /* Purple */
--category-playmaking: #06b6d4; /* Cyan */
--category-shooting: #f97316;   /* Orange */

/* Baseball */
--category-batting: #14b8a6;   /* Teal */
--category-pitching: #6366f1;  /* Indigo */

/* Hockey */
--category-overall: #ec4899;   /* Pink */
--category-defense: #64748b;   /* Slate */
--category-goaltending: #0891b2; /* Cyan-600 */
```

## Typography

```css
/* Player names */
.player-name {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-size: 1.125rem; /* 18px */
  font-weight: 600;
  line-height: 1.4;
  color: #111827; /* Gray-900 */
}

/* Stat display names */
.stat-name {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-size: 0.875rem; /* 14px */
  font-weight: 500;
  color: #374151; /* Gray-700 */
}

/* Lines/numbers */
.stat-line {
  font-family: 'JetBrains Mono', 'Monaco', monospace;
  font-size: 1rem; /* 16px */
  font-weight: 600;
  color: #111827; /* Gray-900 */
}

/* Odds */
.odds-value {
  font-family: 'JetBrains Mono', 'Monaco', monospace;
  font-size: 0.875rem; /* 14px */
  font-weight: 600;
}

/* Category tags */
.category-tag {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-size: 0.75rem; /* 12px */
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

## Component Designs

### Player Card - Desktop

```
┌─────────────────────────────────────────────────────────────┐
│ 👤 Patrick Mahomes                      QB • Kansas City    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🎯 PASSING                                                  │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Passing Yards                                   275.5 │   │
│ │ ┌──────────────────────┐  ┌──────────────────────┐   │   │
│ │ │  OVER      -110  ↑  │  │  UNDER     -110  ↓  │   │   │
│ │ └──────────────────────┘  └──────────────────────┘   │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Passing TDs                                       2.5 │   │
│ │ ┌──────────────────────┐  ┌──────────────────────┐   │   │
│ │ │  OVER      +105  ↑  │  │  UNDER     -125  ↓  │   │   │
│ │ └──────────────────────┘  └──────────────────────┘   │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ 🏈 SCORING                                                  │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Anytime TD                                            │   │
│ │ ┌──────────────────────┐  ┌──────────────────────┐   │   │
│ │ │  YES       +450  ✓  │  │  NO          -     ✗  │   │   │
│ │ └──────────────────────┘  └──────────────────────┘   │   │
│ └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### CSS Implementation

```css
/* Player Card Container */
.player-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  transition: all 0.2s ease;
}

.player-card:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  border-color: #d1d5db;
}

/* Player Header */
.player-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f3f4f6;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.player-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.player-meta {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

/* Category Section */
.category-section {
  margin-bottom: 1.5rem;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.category-icon {
  font-size: 1.25rem;
}

.category-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
}

/* Prop Row */
.prop-row {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  transition: background 0.15s ease;
}

.prop-row:hover {
  background: #f3f4f6;
}

.prop-row:last-child {
  margin-bottom: 0;
}

.prop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.prop-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.prop-line {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
}

/* Odds Buttons Container */
.odds-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

/* Bet Button Base */
.bet-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
  border: 2px solid transparent;
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
  overflow: hidden;
}

.bet-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bet-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.bet-button:hover:not(:disabled)::before {
  left: 100%;
}

/* Over Button */
.bet-button.over {
  background: #10b981;
  color: white;
}

.bet-button.over:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgb(16 185 129 / 0.3);
}

.bet-button.over:active {
  transform: translateY(0);
}

/* Under Button */
.bet-button.under {
  background: #ef4444;
  color: white;
}

.bet-button.under:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgb(239 68 68 / 0.3);
}

/* Yes Button */
.bet-button.yes {
  background: #3b82f6;
  color: white;
}

.bet-button.yes:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgb(59 130 246 / 0.3);
}

/* No Button */
.bet-button.no {
  background: #6b7280;
  color: white;
}

.bet-button.no:hover:not(:disabled) {
  background: #4b5563;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgb(107 114 128 / 0.3);
}

/* Button Label */
.bet-label {
  font-size: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.25rem;
  opacity: 0.9;
}

.bet-odds {
  font-size: 1rem;
  font-weight: 700;
}

/* Arrow indicators */
.bet-button.over::after,
.bet-button.under::after {
  content: '';
  display: inline-block;
  margin-left: 0.25rem;
}

.bet-button.over::after {
  content: '↑';
}

.bet-button.under::after {
  content: '↓';
}

.bet-button.yes::after {
  content: '✓';
  margin-left: 0.25rem;
}

.bet-button.no::after {
  content: '✗';
  margin-left: 0.25rem;
}
```

### Mobile Card Design

```css
/* Mobile optimizations */
@media (max-width: 768px) {
  .player-card {
    padding: 1rem;
    border-radius: 8px;
  }

  .player-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .prop-row {
    padding: 0.75rem;
  }

  .odds-buttons {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .bet-button {
    padding: 1rem;
    flex-direction: row;
    justify-content: space-between;
  }

  .bet-odds {
    font-size: 1.125rem;
  }
}
```

## Filter Bar Design

```css
.filter-bar {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  overflow-x: auto;
  scrollbar-width: none;
}

.filter-bar::-webkit-scrollbar {
  display: none;
}

.filter-chip {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.filter-chip:hover {
  background: #e5e7eb;
  border-color: #d1d5db;
}

.filter-chip.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.filter-chip-count {
  display: inline-block;
  margin-left: 0.5rem;
  padding: 0.125rem 0.375rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  font-size: 0.75rem;
}
```

## Search Bar

```css
.search-bar {
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.15s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
}

.search-clear {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.25rem;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.search-input:not(:placeholder-shown) + .search-clear {
  opacity: 1;
}

.search-clear:hover {
  color: #374151;
}
```

## Loading States

```css
/* Skeleton Player Card */
.skeleton-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
}

.skeleton-element {
  background: linear-gradient(
    90deg,
    #f3f4f6 0%,
    #e5e7eb 50%,
    #f3f4f6 100%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 4px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-bottom: 1rem;
}

.skeleton-name {
  height: 1.5rem;
  width: 60%;
  margin-bottom: 0.5rem;
}

.skeleton-meta {
  height: 1rem;
  width: 40%;
  margin-bottom: 1.5rem;
}

.skeleton-prop {
  height: 4rem;
  margin-bottom: 0.75rem;
}
```

## Empty States

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.empty-description {
  font-size: 0.875rem;
  color: #6b7280;
  max-width: 400px;
}
```

## Animations

```css
/* Card entrance animation */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.player-card {
  animation: fadeInUp 0.3s ease-out;
}

/* Stagger animation for multiple cards */
.player-card:nth-child(1) { animation-delay: 0.05s; }
.player-card:nth-child(2) { animation-delay: 0.10s; }
.player-card:nth-child(3) { animation-delay: 0.15s; }
.player-card:nth-child(4) { animation-delay: 0.20s; }
.player-card:nth-child(5) { animation-delay: 0.25s; }

/* Button press animation */
@keyframes buttonPress {
  0% { transform: scale(1); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

.bet-button:active:not(:disabled) {
  animation: buttonPress 0.15s ease;
}

/* Loading spinner */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
```

## Dark Mode Support

```css
@media (prefers-color-scheme: dark) {
  .player-card {
    background: #1f2937;
    border-color: #374151;
  }

  .player-name {
    color: #f9fafb;
  }

  .prop-name {
    color: #e5e7eb;
  }

  .prop-row {
    background: #111827;
    border-color: #374151;
  }

  .prop-row:hover {
    background: #1f2937;
  }

  .search-input {
    background: #1f2937;
    border-color: #374151;
    color: #f9fafb;
  }

  .filter-chip {
    background: #374151;
    border-color: #4b5563;
    color: #e5e7eb;
  }

  .filter-chip:hover {
    background: #4b5563;
  }
}
```

## Accessibility Enhancements

```css
/* Focus styles */
.bet-button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.filter-chip:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .bet-button {
    border-width: 3px;
  }

  .prop-row {
    border-width: 2px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .player-card {
    animation: none;
  }

  .bet-button {
    transition: none;
  }

  .skeleton-element {
    animation: none;
  }
}
```

## Grid Layouts

```css
/* Desktop Grid */
.player-props-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

/* Tablet Grid */
@media (max-width: 1024px) {
  .player-props-grid {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1rem;
    padding: 1rem;
  }
}

/* Mobile Grid */
@media (max-width: 768px) {
  .player-props-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }
}
```

## Print Styles

```css
@media print {
  .player-card {
    page-break-inside: avoid;
    box-shadow: none;
    border: 1px solid #000;
  }

  .bet-button {
    border: 1px solid #000;
    color: #000 !important;
    background: white !important;
  }

  .filter-bar,
  .search-bar {
    display: none;
  }
}
```

## Icon System

Use these icons for consistency:

```tsx
const propIcons = {
  passing_yards: '🎯',
  passing_touchdowns: '🏈',
  receiving_yards: '🙌',
  receiving_receptions: '👐',
  rushing_yards: '🏃',
  touchdowns: '🔥',
  points: '⭐',
  rebounds: '🏀',
  assists: '🤝',
  threePointersMade: '🎯',
  batting_hits: '⚾',
  batting_homeruns: '💥',
  pitching_strikeouts: '🥎',
  goals: '⚽',
  shots_onGoal: '🎯',
  blocks: '🛡️',
}
```

## Related Documentation

- [UI Implementation Guide](./player-props-ui-guide.md)
- [Quick Reference](./player-props-quick-reference.md)
- [Backend API](../src/app/api/events/show-more/[eventId]/route.ts)
