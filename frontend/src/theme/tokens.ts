/**
 * Design Tokens - Complete Visual Language Definition
 * 
 * Feature: 002-modern-ui-redesign
 * Purpose: Centralized design token values following Material Design 3 and Constitution Section VIII
 * 
 * @see ../../../specs/002-modern-ui-redesign/data-model.md for schema documentation
 * @see ../../../specs/002-modern-ui-redesign/contracts/theme.ts for type definitions
 */

import type {
  DesignTokens,
  ColorPalette,
  ColorTokens,
  BackgroundColors,
  TextColors,
  BorderColors,
  SpacingScale,
  TypographyScale,
  ElevationScale,
  BreakpointValues,
  TransitionDurations,
  TransitionEasings,
  TransitionConfig,
  ZIndexScale,
} from '../../../specs/002-modern-ui-redesign/contracts/theme';

// ============================================================================
// Color Tokens
// ============================================================================

/**
 * Primary color palette (Blue)
 * Light mode: Material Blue #1976d2
 * Dark mode: Light Blue #90caf9
 */
export const primaryColorLight: ColorPalette = {
  main: '#1976d2',
  light: '#42a5f5',
  dark: '#1565c0',
  contrastText: '#ffffff',
};

export const primaryColorDark: ColorPalette = {
  main: '#90caf9',
  light: '#e3f2fd',
  dark: '#42a5f5',
  contrastText: '#000000',
};

/**
 * Secondary color palette (Blue for now, can customize later)
 */
export const secondaryColorLight: ColorPalette = {
  main: '#1976d2',
  light: '#42a5f5',
  dark: '#1565c0',
  contrastText: '#ffffff',
};

export const secondaryColorDark: ColorPalette = {
  main: '#90caf9',
  light: '#e3f2fd',
  dark: '#42a5f5',
  contrastText: '#000000',
};

/**
 * Error color palette (Red)
 */
export const errorColorLight: ColorPalette = {
  main: '#d32f2f',
  light: '#ef5350',
  dark: '#c62828',
  contrastText: '#ffffff',
};

export const errorColorDark: ColorPalette = {
  main: '#f44336',
  light: '#e57373',
  dark: '#d32f2f',
  contrastText: '#000000',
};

/**
 * Warning color palette (Orange)
 */
export const warningColorLight: ColorPalette = {
  main: '#f57c00',
  light: '#ff9800',
  dark: '#e65100',
  contrastText: '#000000',
};

export const warningColorDark: ColorPalette = {
  main: '#ffa726',
  light: '#ffb74d',
  dark: '#f57c00',
  contrastText: '#000000',
};

/**
 * Success color palette (Green)
 */
export const successColorLight: ColorPalette = {
  main: '#388e3c',
  light: '#4caf50',
  dark: '#2e7d32',
  contrastText: '#ffffff',
};

export const successColorDark: ColorPalette = {
  main: '#66bb6a',
  light: '#81c784',
  dark: '#388e3c',
  contrastText: '#000000',
};

/**
 * Info color palette (Light Blue)
 */
export const infoColorLight: ColorPalette = {
  main: '#0288d1',
  light: '#03a9f4',
  dark: '#01579b',
  contrastText: '#ffffff',
};

export const infoColorDark: ColorPalette = {
  main: '#29b6f6',
  light: '#4fc3f7',
  dark: '#0288d1',
  contrastText: '#000000',
};

/**
 * Background colors - Light mode
 */
export const backgroundColorsLight: BackgroundColors = {
  default: '#ffffff',
  paper: '#ffffff',
  elevated: '#f8f9fa',
};

/**
 * Background colors - Dark mode
 */
export const backgroundColorsDark: BackgroundColors = {
  default: '#121212',
  paper: '#1e1e1e',
  elevated: '#1e1e1e', // Will use surface tinting instead
};

/**
 * Text colors - Light mode (WCAG AA 4.5:1 contrast minimum)
 */
export const textColorsLight: TextColors = {
  primary: '#212529',
  secondary: '#6c757d',
  disabled: '#9e9e9e',
};

/**
 * Text colors - Dark mode (WCAG AA 4.5:1 contrast minimum)
 */
export const textColorsDark: TextColors = {
  primary: '#fafafa',
  secondary: '#b0b0b0',
  disabled: '#616161',
};

/**
 * Border colors - Light mode
 */
export const borderColorsLight: BorderColors = {
  main: '#e0e0e0',
  light: '#f5f5f5',
};

/**
 * Border colors - Dark mode
 */
export const borderColorsDark: BorderColors = {
  main: '#424242',
  light: '#333333',
};

/**
 * Complete color token system - Light mode
 */
export const colorTokensLight: ColorTokens = {
  primary: primaryColorLight,
  secondary: secondaryColorLight,
  error: errorColorLight,
  warning: warningColorLight,
  success: successColorLight,
  info: infoColorLight,
  background: backgroundColorsLight,
  text: textColorsLight,
  border: borderColorsLight,
};

/**
 * Complete color token system - Dark mode
 */
export const colorTokensDark: ColorTokens = {
  primary: primaryColorDark,
  secondary: secondaryColorDark,
  error: errorColorDark,
  warning: warningColorDark,
  success: successColorDark,
  info: infoColorDark,
  background: backgroundColorsDark,
  text: textColorsDark,
  border: borderColorsDark,
};

// ============================================================================
// Spacing Scale
// ============================================================================

/**
 * 8px-based spacing scale (Constitution Section VIII requirement)
 * 
 * Usage examples:
 * - spacing[0] = 0px (no spacing)
 * - spacing[1] = 8px (minimal gap)
 * - spacing[2] = 16px (small padding)
 * - spacing[3] = 24px (standard padding)
 * - spacing[4] = 32px (section separation)
 * - spacing[6] = 48px (large padding)
 * 
 * @example
 * const cardPadding = `${spacing[3]}px`; // "24px"
 */
export const spacing: SpacingScale = [
  0,   // spacing[0]
  8,   // spacing[1]
  16,  // spacing[2]
  24,  // spacing[3]
  32,  // spacing[4]
  40,  // spacing[5]
  48,  // spacing[6]
  56,  // spacing[7]
  64,  // spacing[8]
  72,  // spacing[9]
  80,  // spacing[10]
  88,  // spacing[11]
  96,  // spacing[12]
];

/**
 * Spacing helper function (multiplies by 8px base)
 * @example spacingFn(3) === 24
 */
export function spacingFn(multiplier: number): number {
  return multiplier * 8;
}

// ============================================================================
// Typography Scale
// ============================================================================

/**
 * Font family (Roboto with fallbacks)
 */
export const fontFamily = 'Roboto, Arial, sans-serif';

/**
 * Typography scale (Material Design 3 baseline)
 * All sizes use rem units for accessibility
 * 1rem = 16px browser default
 */
export const typographyScale: TypographyScale = {
  fontFamily,
  
  // Heading variants
  h1: {
    fontSize: '6rem',      // 96px
    fontWeight: 300,       // Light
    lineHeight: 1.167,
    letterSpacing: '-0.01562em',
  },
  h2: {
    fontSize: '3.75rem',   // 60px
    fontWeight: 300,       // Light
    lineHeight: 1.2,
    letterSpacing: '-0.00833em',
  },
  h3: {
    fontSize: '3rem',      // 48px
    fontWeight: 400,       // Regular
    lineHeight: 1.167,
    letterSpacing: '0em',
  },
  h4: {
    fontSize: '2.125rem',  // 34px
    fontWeight: 400,       // Regular
    lineHeight: 1.235,
    letterSpacing: '0.00735em',
  },
  h5: {
    fontSize: '1.5rem',    // 24px
    fontWeight: 400,       // Regular
    lineHeight: 1.334,
    letterSpacing: '0em',
  },
  h6: {
    fontSize: '1.25rem',   // 20px
    fontWeight: 500,       // Medium
    lineHeight: 1.6,
    letterSpacing: '0.0075em',
  },
  
  // Subtitle variants
  subtitle1: {
    fontSize: '1rem',      // 16px
    fontWeight: 400,       // Regular
    lineHeight: 1.75,
    letterSpacing: '0.00938em',
  },
  subtitle2: {
    fontSize: '0.875rem',  // 14px
    fontWeight: 500,       // Medium
    lineHeight: 1.57,
    letterSpacing: '0.00714em',
  },
  
  // Body variants (default text)
  body1: {
    fontSize: '1rem',      // 16px (minimum readable size)
    fontWeight: 400,       // Regular
    lineHeight: 1.5,
    letterSpacing: '0.00938em',
  },
  body2: {
    fontSize: '0.875rem',  // 14px
    fontWeight: 400,       // Regular
    lineHeight: 1.43,
    letterSpacing: '0.01071em',
  },
  
  // Utility variants
  button: {
    fontSize: '0.875rem',  // 14px
    fontWeight: 500,       // Medium
    lineHeight: 1.75,
    letterSpacing: '0.02857em',
    textTransform: 'uppercase',
  },
  caption: {
    fontSize: '0.75rem',   // 12px
    fontWeight: 400,       // Regular
    lineHeight: 1.66,
    letterSpacing: '0.03333em',
  },
  overline: {
    fontSize: '0.625rem',  // 10px
    fontWeight: 400,       // Regular
    lineHeight: 2.66,
    letterSpacing: '0.08333em',
    textTransform: 'uppercase',
  },
};

// ============================================================================
// Elevation Scale
// ============================================================================

/**
 * Material Design elevation levels (shadow depth)
 * Light mode: Box shadows with varying blur and spread
 * Dark mode: Surface tinting (5% white overlay per level)
 * 
 * @see elevationShadows for light mode shadow values
 * @see getSurfaceTint for dark mode tint calculation
 */
export const elevation: ElevationScale = [0, 1, 2, 3, 4, 6, 8, 12, 16, 24];

/**
 * Box shadow values for each elevation level (light mode)
 */
export const elevationShadows: Record<number, string> = {
  0: 'none',
  1: '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
  2: '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
  3: '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)',
  4: '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
  6: '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
  8: '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
  12: '0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.12)',
  16: '0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)',
  24: '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',
};

/**
 * Calculate surface tint for dark mode elevation
 * Each elevation level adds 5% white overlay
 * 
 * @param level - Elevation level (0-24)
 * @returns RGBA color string for surface tint
 * 
 * @example
 * getSurfaceTint(8) // "rgba(255, 255, 255, 0.40)" (8 * 5% = 40%)
 */
export function getSurfaceTint(level: number): string {
  const opacity = Math.min(level * 0.05, 1.0); // Max 100% at level 20
  return `rgba(255, 255, 255, ${opacity.toFixed(2)})`;
}

// ============================================================================
// Breakpoint Values
// ============================================================================

/**
 * Responsive breakpoints (fixed per Constitution Section VIII)
 * Mobile: ≥768px (minimum supported viewport)
 * Tablet: ≥992px (mini drawer behavior)
 * Desktop: ≥1200px (full drawer, centered content)
 * 
 * @see ../../../specs/002-modern-ui-redesign/quickstart.md for usage examples
 */
export const breakpoints: BreakpointValues = {
  mobile: 768,
  tablet: 992,
  desktop: 1200,
};

// ============================================================================
// Transition Configuration
// ============================================================================

/**
 * Animation timing durations (max 300ms per Constitution Section VIII)
 */
export const transitionDurations: TransitionDurations = {
  shortest: 150,  // Micro-interactions (checkbox, switch)
  shorter: 200,   // Small animations (button hover, ripple)
  short: 250,     // Medium animations (tooltip, snackbar)
  standard: 300,  // Standard animations (drawer, dialog)
  complex: 375,   // Multi-step animations (error shake) - RARE
};

/**
 * CSS easing functions
 */
export const transitionEasings: TransitionEasings = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
};

/**
 * Complete transition configuration
 */
export const transitions: TransitionConfig = {
  ...transitionDurations,
  ...transitionEasings,
};

// ============================================================================
// Z-Index Scale
// ============================================================================

/**
 * Component stacking order (Material-UI defaults)
 */
export const zIndex: ZIndexScale = {
  mobileStepper: 1000,
  speedDial: 1050,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
};

// ============================================================================
// Complete Design Token Export
// ============================================================================

/**
 * Complete design token structure (light mode)
 */
export const designTokensLight: DesignTokens = {
  colors: colorTokensLight,
  spacing,
  typography: typographyScale,
  elevation,
  breakpoints,
  transitions,
  zIndex,
};

/**
 * Complete design token structure (dark mode)
 */
export const designTokensDark: DesignTokens = {
  colors: colorTokensDark,
  spacing,
  typography: typographyScale, // Same typography for both modes
  elevation,
  breakpoints,
  transitions,
  zIndex,
};

/**
 * Get design tokens for a specific mode
 */
export function getDesignTokens(mode: 'light' | 'dark'): DesignTokens {
  return mode === 'light' ? designTokensLight : designTokensDark;
}
