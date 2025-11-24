import { Platform } from 'react-native';

// RUSH brand color - electric blue accent
const accentColor = '#00C0FF';
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
    // Deep navy background for sleek, premium feel
    background: '#050E1A',
    text: '#FFFFFF',
    textSecondary: '#94A3B8',
    tint: tintColorDark,
    tintHover: '#33CCFF',
    tintPressed: '#0099CC',
    tintDisabled: '#00C0FF40',
    card: '#101C2C',
    cardElevated: '#1A2738',
    border: '#1E293B',
    divider: '#1E293B80',
    overlay: '#050E1A99',
    icon: '#94A3B8',
    tabIconDefault: '#94A3B8',
    tabIconSelected: tintColorDark,
    success: '#10B981',
    successBg: '#10B98120',
    danger: '#EF4444',
    dangerBg: '#EF444420',
    warning: '#F59E0B',
    warningBg: '#F59E0B20',
    accent: '#8B5CF6',
    accentBg: '#8B5CF620',
    gradients: {
      primary: ['#00C0FF', '#0080FF'],
      accent: ['#8B5CF6', '#6366F1'],
      rush: ['#00C0FF', '#00E5FF'],
      background: ['#050E1A', '#0A1628'],
    },
  },
};

// Google Fonts: Inter, Bebas Neue, Barlow Condensed
// Add these to your app.json or index.html:
// <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Bebas+Neue&family=Barlow+Condensed:wght@400;500;600;700&display=swap" rel="stylesheet">

export const Fonts = Platform.select({
  ios: {
    /** Primary UI font - clean, modern, optimized for screens */
    primary: 'Inter',
    /** Display font - bold, impactful for large text and numbers */
    display: 'Bebas Neue',
    /** Condensed font - for tags, labels, and dense information */
    condensed: 'Barlow Condensed',
    /** System fallbacks */
    sans: 'system-ui',
    mono: 'ui-monospace',
  },
  android: {
    primary: 'Inter',
    display: 'Bebas Neue',
    condensed: 'Barlow Condensed',
    sans: 'Roboto',
    mono: 'monospace',
  },
  default: {
    primary: 'Inter',
    display: 'Bebas Neue',
    condensed: 'Barlow Condensed',
    sans: 'system-ui',
    mono: 'monospace',
  },
  web: {
    primary: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    display: "'Bebas Neue', 'Impact', 'Arial Black', sans-serif",
    condensed: "'Barlow Condensed', 'Arial Narrow', sans-serif",
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

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
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
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