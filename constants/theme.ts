import { Platform } from 'react-native';

// RUSH brand color - premium electric blue accent
const accentColor = '#00BFFF'; // Premium electric blue
const tintColorLight = accentColor;
const tintColorDark = accentColor;

export const Colors = {
  light: {
    // High contrast light theme with vibrant accent
    text: '#11181C',
    background: '#FFFFFF',
    tint: tintColorLight,
    tintHover: '#33CCFF',
    tintPressed: '#0099CC',
    tintDisabled: '#00C0FF40',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    card: '#F0F0F0',
    border: '#E5E7EB',
    divider: '#E5E7EB80',
    overlay: '#00000066',
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    accent: '#8B5CF6',
    gradients: {
      primary: ['#00C0FF', '#0080FF'],
      accent: ['#8B5CF6', '#6366F1'],
      rush: ['#00C0FF', '#00E5FF'],
    },
  },
  dark: {
    // Premium sportsbook dark theme
    background: '#0B1118',
    text: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.5)',
    tint: tintColorDark,
    tintHover: '#33CCFF',
    tintPressed: '#0099CC',
    tintDisabled: '#00BFFF40',
    card: '#121A23',
    cardElevated: '#1A2530',
    border: 'rgba(255,255,255,0.06)',
    divider: 'rgba(255,255,255,0.06)',
    overlay: '#0B111899',
    icon: 'rgba(255,255,255,0.5)',
    tabIconDefault: 'rgba(255,255,255,0.5)',
    tabIconSelected: tintColorDark,
    success: '#10B981',
    successBg: '#10B98120',
    danger: '#D95151', // Updated negative/alert color
    dangerBg: '#D9515120',
    warning: '#F59E0B',
    warningBg: '#F59E0B20',
    accent: '#8B5CF6',
    accentBg: '#8B5CF620',
    gradients: {
      primary: ['#00BFFF', '#0099CC'],
      accent: ['#8B5CF6', '#6366F1'],
      rush: ['#00BFFF', '#00E5FF'],
      background: ['#0B1118', '#121A23'],
    },
  },
};

// Google Fonts: Inter, Bebas Neue, Barlow Condensed
// Add these to your app.json or index.html:
// <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Bebas+Neue&family=Barlow+Condensed:wght@400;500;600;700&display=swap" rel="stylesheet">

export const Fonts = {
  // Inter for functional text, numbers, metadata, and body copy
  regular: Platform.select({
    default: 'Inter',
    web: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  }),
  medium: Platform.select({
    default: 'Inter_500Medium',
    web: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  }),
  bold: Platform.select({
    default: 'Inter_700Bold',
    web: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  }),

  // Bebas Neue for headlines, section headers, market labels, buttons, and app branding
  display: Platform.select({
    default: 'BebasNeue_400Regular',
    web: "'Bebas Neue', 'Impact', 'Arial Black', sans-serif",
  }),

  // Barlow Condensed SemiBold for sport categories, tabs, and scoreboard-like elements
  condensed: Platform.select({
    default: 'BarlowCondensed_600SemiBold',
    web: "'Barlow Condensed SemiBold', 'Arial Narrow', sans-serif",
  }),

  // System fallback
  system: Platform.select({
    ios: "System",
    android: "Roboto",
    default: "system-ui",
  }),

  // Monospace
  mono: Platform.select({
    ios: "Courier",
    android: "monospace",
    default: "monospace",
  }),
};


export const FontWeights = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  heavy: '800',
  black: '900',
} as const;

export const FontSizes = {
  xs: 12,   // Meta text (labels): Inter 400 12–14
  sm: 14,   // Meta text (labels): Inter 400 12–14
  base: 16,
  lg: 18,   // Team names: Inter 500 18–20
  xl: 20,   // Team names: Inter 500 18–20
  '2xl': 24, // Section headers: Barlow Condensed 18–22 (SemiBold)
  '3xl': 30, // Titles/Headers: Bebas Neue 28–36
  '4xl': 36, // Titles/Headers: Bebas Neue 28–36
  '5xl': 48,
} as const;

// Typography scale for easy reference
export const Typography = {
  // Titles/Headers: Bebas Neue 28–36
  title: {
    large: { fontSize: FontSizes['4xl'], fontFamily: Fonts.display },
    medium: { fontSize: FontSizes['3xl'], fontFamily: Fonts.display },
    small: { fontSize: FontSizes['2xl'], fontFamily: Fonts.display },
  },

  // Section headers: Barlow Condensed 18–22 (SemiBold)
  sectionHeader: {
    large: { fontSize: FontSizes.xl, fontFamily: Fonts.condensed, textTransform: 'uppercase' as const },
    medium: { fontSize: FontSizes.lg, fontFamily: Fonts.condensed, textTransform: 'uppercase' as const },
    small: { fontSize: FontSizes.base, fontFamily: Fonts.condensed, textTransform: 'uppercase' as const },
  },

  // Team names: Inter 500 18–20
  teamName: {
    large: { fontSize: FontSizes.xl, fontFamily: Fonts.medium },
    medium: { fontSize: FontSizes.lg, fontFamily: Fonts.medium },
    small: { fontSize: FontSizes.base, fontFamily: Fonts.medium },
  },

  // Odds pill buttons: Bebas Neue 18–20 uppercase
  oddsPill: {
    large: { fontSize: FontSizes.xl, fontFamily: Fonts.display, textTransform: 'uppercase' as const },
    medium: { fontSize: FontSizes.lg, fontFamily: Fonts.display, textTransform: 'uppercase' as const },
    small: { fontSize: FontSizes.base, fontFamily: Fonts.display, textTransform: 'uppercase' as const },
  },

  // Meta text (labels): Inter 400 12–14
  meta: {
    large: { fontSize: FontSizes.sm, fontFamily: Fonts.regular },
    medium: { fontSize: FontSizes.xs, fontFamily: Fonts.regular },
    small: { fontSize: FontSizes.xs, fontFamily: Fonts.regular },
  },

  // Body text
  body: {
    large: { fontSize: FontSizes.lg, fontFamily: Fonts.regular },
    medium: { fontSize: FontSizes.base, fontFamily: Fonts.regular },
    small: { fontSize: FontSizes.sm, fontFamily: Fonts.regular },
  },

  // Emphasis text
  emphasis: {
    large: { fontSize: FontSizes.xl, fontFamily: Fonts.bold },
    medium: { fontSize: FontSizes.base, fontFamily: Fonts.bold },
    small: { fontSize: FontSizes.sm, fontFamily: Fonts.bold },
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,   // Card padding horizontal
  lg: 24,   // Section spacing blocks: 24–32px
  xl: 32,   // Section spacing blocks: 24–32px
  '2xl': 48,
  '3xl': 64,
} as const;

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,   // Elevated cards with rounded corners: 16–20px
  '2xl': 20, // Elevated cards with rounded corners: 16–20px
  '3xl': 24,
  full: 9999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  // Special RUSH glow effect for the accent color
  glow: {
    shadowColor: accentColor,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  // Subtle shadows for elevated cards
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  // Glow effect for odds pills and active states
  pillGlow: {
    shadowColor: accentColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
} as const;

// Animation durations in milliseconds
export const Animation = {
  fast: 150,
  normal: 250,
  slow: 350,
} as const;

// Type exports for TypeScript support
export type ColorScheme = keyof typeof Colors;
export type ColorName = keyof typeof Colors.dark;
export type FontFamily = keyof typeof Fonts;
export type FontWeight = keyof typeof FontWeights;
export type FontSize = keyof typeof FontSizes;
export type SpacingSize = keyof typeof Spacing;
export type BorderRadiusSize = keyof typeof BorderRadius;
export type ShadowSize = keyof typeof Shadows;