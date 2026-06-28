import { createContext, useContext } from 'react';
import { StyleSheet, type TextStyle } from 'react-native';

/**
 * Theme tokens. `theme` prop (partial) overrides these; `colorScheme` picks the
 * light/dark base. Components read the resolved theme via `useTheme()`.
 */
export interface DropdownColors {
  surface: string;
  text: string;
  textMuted: string;
  placeholder: string;
  /** placeholderTextColor for TextInputs */
  inputPlaceholder: string;
  border: string;
  divider: string;
  chipBg: string;
  onChip: string;
  accent: string;
  error: string;
  overlay: string;
  triggerPressed: string;
  rowSelected: string;
  rowPressed: string;
  ripple: string;
  shadow: string;
}

/**
 * Font families per weight. All optional — when unset the system font is used.
 * Set a single `regular` for a variable font, or all three for static fonts
 * (e.g. 'Inter-Regular' / 'Inter-Medium' / 'Inter-Bold').
 */
export interface DropdownFonts {
  regular?: string;
  medium?: string;
  bold?: string;
}

export interface DropdownTheme {
  colors: DropdownColors;
  radii: { sm: number; md: number };
  spacing: { xs: number; sm: number; md: number; lg: number };
  fontSizes: { xs: number; sm: number; chip: number; body: number; input: number };
  /** Font families per weight (system font when unset). */
  fonts: DropdownFonts;
  /** Control sizes (heights). Scaled up on tablets/iPad. */
  sizes: { control: number; row: number; input: number };
  /** Right-to-left layout (mirror rows, right-align text). */
  rtl: boolean;
}

/** Text-align + writing direction for the current theme direction. */
export function textDir(t: DropdownTheme): {
  textAlign: TextStyle['textAlign'];
  writingDirection: TextStyle['writingDirection'];
} {
  return t.rtl
    ? { textAlign: 'right', writingDirection: 'rtl' }
    : { textAlign: 'left', writingDirection: 'ltr' };
}

/** flexDirection for a horizontal row honoring RTL. */
export function rowDir(t: DropdownTheme): 'row' | 'row-reverse' {
  return t.rtl ? 'row-reverse' : 'row';
}

type FontRole = keyof DropdownFonts;

export const hairline = StyleSheet.hairlineWidth;

const baseRadii = { sm: 6, md: 8 };
const baseSpacing = { xs: 4, sm: 6, md: 12, lg: 16 };
const baseFontSizes = { xs: 11, sm: 12, chip: 13, body: 14, input: 15 };
const baseFonts: DropdownFonts = {};
const baseSizes = { control: 44, row: 44, input: 40 };

const DEFAULT_WEIGHTS: Record<FontRole, TextStyle['fontWeight']> = {
  regular: '400',
  medium: '600',
  bold: '700',
};

/**
 * Resolve text-style font props for a role.
 *
 * - When a custom `fonts.<role>` family is set, returns ONLY `fontFamily` (no
 *   `fontWeight`). iOS ignores `fontWeight` on a custom family — the weight is
 *   baked into the font file — so set the right per-weight family instead
 *   (e.g. 'Inter-Bold'). Falls back to `fonts.regular`.
 * - When no custom family is set, returns the default `fontWeight` so the
 *   system font renders the intended weight.
 */
export function fontFor(
  t: DropdownTheme,
  role: FontRole = 'regular',
): { fontFamily?: string; fontWeight?: TextStyle['fontWeight'] } {
  const family = t.fonts[role] ?? t.fonts.regular;
  return family ? { fontFamily: family } : { fontWeight: DEFAULT_WEIGHTS[role] };
}

export const lightTheme: DropdownTheme = {
  colors: {
    surface: '#fff',
    text: '#111',
    textMuted: '#666',
    placeholder: '#888',
    inputPlaceholder: '#9A9A9A',
    border: '#D0D0D0',
    divider: '#E5E5E5',
    chipBg: '#7C3AED',
    onChip: '#fff',
    accent: '#007AFF',
    error: '#D7263D',
    overlay: 'rgba(0,0,0,0.2)',
    triggerPressed: '#fafafa',
    rowSelected: 'rgba(0, 122, 255, 0.08)',
    rowPressed: 'rgba(0,0,0,0.04)',
    ripple: 'rgba(0,0,0,0.08)',
    shadow: '#000',
  },
  radii: baseRadii,
  spacing: baseSpacing,
  fontSizes: baseFontSizes,
  fonts: baseFonts,
  sizes: baseSizes,
  rtl: false,
};

export const darkTheme: DropdownTheme = {
  colors: {
    surface: '#1C1C1E',
    text: '#F2F2F7',
    textMuted: '#AEAEB2',
    placeholder: '#8E8E93',
    inputPlaceholder: '#8E8E93',
    border: '#3A3A3C',
    divider: '#3A3A3C',
    chipBg: '#7C3AED',
    onChip: '#fff',
    accent: '#0A84FF',
    error: '#FF6B6B',
    overlay: 'rgba(0,0,0,0.5)',
    triggerPressed: '#2C2C2E',
    rowSelected: 'rgba(10, 132, 255, 0.18)',
    rowPressed: 'rgba(255,255,255,0.06)',
    ripple: 'rgba(255,255,255,0.10)',
    shadow: '#000',
  },
  radii: baseRadii,
  spacing: baseSpacing,
  fontSizes: baseFontSizes,
  fonts: baseFonts,
  sizes: baseSizes,
  rtl: false,
};

/**
 * Scale factor for the device. Tablets / iPad (shortest side >= 600dp) get a
 * larger UI so the control is comfortable on big screens.
 */
export function deviceScale(shortestSide: number): number {
  return shortestSide >= 600 ? 1.2 : 1;
}

/** Scale font sizes, spacing, radii and control sizes by `factor`. */
export function scaleTheme(t: DropdownTheme, factor: number): DropdownTheme {
  if (factor === 1) return t;
  const s = (n: number) => Math.round(n * factor);
  return {
    colors: t.colors,
    radii: { sm: s(t.radii.sm), md: s(t.radii.md) },
    spacing: {
      xs: s(t.spacing.xs),
      sm: s(t.spacing.sm),
      md: s(t.spacing.md),
      lg: s(t.spacing.lg),
    },
    fontSizes: {
      xs: s(t.fontSizes.xs),
      sm: s(t.fontSizes.sm),
      chip: s(t.fontSizes.chip),
      body: s(t.fontSizes.body),
      input: s(t.fontSizes.input),
    },
    fonts: t.fonts,
    rtl: t.rtl,
    sizes: {
      control: s(t.sizes.control),
      row: s(t.sizes.row),
      input: s(t.sizes.input),
    },
  };
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

/** Resolved theme + user partial override. Override wins per-token. */
export function mergeTheme(
  base: DropdownTheme,
  override?: DeepPartial<DropdownTheme>,
): DropdownTheme {
  if (!override) return base;
  return {
    colors: { ...base.colors, ...override.colors },
    radii: { ...base.radii, ...override.radii },
    spacing: { ...base.spacing, ...override.spacing },
    fontSizes: { ...base.fontSizes, ...override.fontSizes },
    fonts: { ...base.fonts, ...override.fonts },
    rtl: override.rtl ?? base.rtl,
    sizes: { ...base.sizes, ...override.sizes },
  };
}

const ThemeContext = createContext<DropdownTheme>(lightTheme);
export const ThemeProvider = ThemeContext.Provider;

/** Resolved theme for the current dropdown. Falls back to light if no provider. */
export function useTheme(): DropdownTheme {
  return useContext(ThemeContext);
}
