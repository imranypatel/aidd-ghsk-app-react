/**
 * Theme Type Definitions and Interfaces
 * 
 * Feature: 002-modern-ui-redesign
 * Purpose: TypeScript type definitions for theme configuration, design tokens, and theming utilities
 * 
 * @see ../data-model.md for detailed schema documentation
 */

// ============================================================================
// Design Token Types
// ============================================================================

/**
 * Complete design token structure defining visual language
 */
export interface DesignTokens {
  colors: ColorTokens;
  spacing: SpacingScale;
  typography: TypographyScale;
  elevation: ElevationScale;
  breakpoints: BreakpointValues;
  transitions: TransitionDurations;
  zIndex: ZIndexScale;
}

// ============================================================================
// Color Types
// ============================================================================

/**
 * Color palette for a single semantic category (primary, error, etc.)
 */
export interface ColorPalette {
  /** Main color used for most instances */
  main: string;
  /** Lighter variant for hover states or backgrounds */
  light: string;
  /** Darker variant for active states */
  dark: string;
  /** Text color ensuring sufficient contrast on main color */
  contrastText: string;
}

/**
 * Complete color token system
 */
export interface ColorTokens {
  primary: ColorPalette;
  secondary: ColorPalette;
  error: ColorPalette;
  warning: ColorPalette;
  success: ColorPalette;
  info: ColorPalette;
  background: BackgroundColors;
  text: TextColors;
  border: BorderColors;
}

/**
 * Background colors for surfaces at different elevations
 */
export interface BackgroundColors {
  /** Default page background */
  default: string;
  /** Surface background (cards, paper) */
  paper: string;
  /** Elevated surface (higher than paper) */
  elevated?: string;
}

/**
 * Text colors ensuring WCAG AA contrast ratios (minimum 4.5:1 for body text)
 */
export interface TextColors {
  /** Primary body text color (contrast ≥4.5:1) */
  primary: string;
  /** Secondary text color for less emphasis (contrast ≥4.5:1) */
  secondary: string;
  /** Disabled text color (contrast may be lower) */
  disabled: string;
}

/**
 * Border colors for component outlines
 */
export interface BorderColors {
  /** Main border color */
  main: string;
  /** Light border color for subtle dividers */
  light: string;
}

// ============================================================================
// Spacing Types
// ============================================================================

/**
 * 8px-based spacing scale (0, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96)
 * 
 * @example
 * const spacing = useSpacing();
 * const padding = spacing[3]; // 24px
 */
export type SpacingScale = readonly [
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
  96   // spacing[12]
];

/**
 * Valid spacing scale index (0-12)
 */
export type SpacingIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

// ============================================================================
// Typography Types
// ============================================================================

/**
 * Typography variant definition
 */
export interface TypographyVariant {
  /** Font size in rem units for accessibility */
  fontSize: string;
  /** Font weight (300=light, 400=regular, 500=medium, 600=semi-bold) */
  fontWeight: 300 | 400 | 500 | 600;
  /** Line height as a unitless multiplier */
  lineHeight: number;
  /** Letter spacing in px (can be negative for large text) */
  letterSpacing: string;
  /** Text transformation (optional) */
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
}

/**
 * Complete typography scale (Roboto font family)
 */
export interface TypographyScale {
  /** Font family stack */
  fontFamily: string;
  
  // Heading variants
  h1: TypographyVariant;  // 96px, light
  h2: TypographyVariant;  // 60px, light
  h3: TypographyVariant;  // 48px, regular
  h4: TypographyVariant;  // 34px, regular
  h5: TypographyVariant;  // 24px, regular
  h6: TypographyVariant;  // 20px, medium
  
  // Subtitle variants
  subtitle1: TypographyVariant; // 16px, regular
  subtitle2: TypographyVariant; // 14px, medium
  
  // Body variants
  body1: TypographyVariant; // 16px, regular (default)
  body2: TypographyVariant; // 14px, regular
  
  // Utility variants
  button: TypographyVariant;  // 14px, medium, uppercase
  caption: TypographyVariant; // 12px, regular
  overline: TypographyVariant; // 10px, regular, uppercase
}

// ============================================================================
// Elevation Types
// ============================================================================

/**
 * Material Design elevation levels (shadow depth)
 * Light mode: Box shadows at different intensities
 * Dark mode: Surface tinting (5% white overlay per level)
 */
export type ElevationScale = readonly [0, 1, 2, 3, 4, 6, 8, 12, 16, 24];

/**
 * Valid elevation level (0-24)
 */
export type ElevationLevel = 0 | 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16 | 24;

// ============================================================================
// Breakpoint Types
// ============================================================================

/**
 * Responsive breakpoint values (fixed per Constitution Section VIII)
 */
export interface BreakpointValues {
  /** Mobile minimum (768px) */
  mobile: 768;
  /** Tablet minimum (992px) */
  tablet: 992;
  /** Desktop minimum (1200px) */
  desktop: 1200;
}

/**
 * Breakpoint identifiers
 */
export type BreakpointKey = 'mobile' | 'tablet' | 'desktop';

// ============================================================================
// Transition Types
// ============================================================================

/**
 * Animation timing durations (max 300ms per Constitution Section VIII)
 */
export interface TransitionDurations {
  /** 150ms - Micro-interactions (checkbox, switch) */
  shortest: 150;
  /** 200ms - Small animations (button hover, ripple) */
  shorter: 200;
  /** 250ms - Medium animations (tooltip, snackbar) */
  short: 250;
  /** 300ms - Standard animations (drawer, dialog) */
  standard: 300;
  /** 375ms - Multi-step animations (error shake) - RARE, constitution exception */
  complex: 375;
}

/**
 * CSS easing function strings
 */
export interface TransitionEasings {
  /** Standard easing for state changes */
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)';
  /** Easing for element entrances */
  easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)';
  /** Easing for element exits */
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)';
  /** Sharp easing for temporary elements */
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)';
}

/**
 * Complete transition configuration
 */
export interface TransitionConfig extends TransitionDurations, TransitionEasings {}

// ============================================================================
// Z-Index Types
// ============================================================================

/**
 * Component stacking order (Material-UI defaults)
 */
export interface ZIndexScale {
  mobileStepper: 1000;
  speedDial: 1050;
  appBar: 1100;
  drawer: 1200;
  modal: 1300;
  snackbar: 1400;
  tooltip: 1500;
}

// ============================================================================
// Theme Mode Types
// ============================================================================

/**
 * Theme mode selection
 * - 'light': Light mode (high brightness backgrounds)
 * - 'dark': Dark mode (low brightness backgrounds)
 * - 'system': Follow OS/browser preference
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Effective theme mode (system preference resolved)
 */
export type EffectiveThemeMode = 'light' | 'dark';

/**
 * Theme state including user preference and resolved mode
 */
export interface ThemeState {
  /** User-selected mode (includes 'system' option) */
  mode: ThemeMode;
  /** Actual applied mode (system preference resolved to light/dark) */
  effectiveMode: EffectiveThemeMode;
  /** Current OS/browser preference */
  systemPreference: EffectiveThemeMode;
}

// ============================================================================
// Theme Configuration Types
// ============================================================================

/**
 * Complete theme configuration structure
 * Extends Material-UI Theme interface with custom tokens
 */
export interface ThemeConfig {
  /** Theme mode (light or dark) */
  mode: EffectiveThemeMode;
  /** Color palette */
  palette: ColorTokens & { mode: EffectiveThemeMode };
  /** Spacing scale */
  spacing: SpacingScale;
  /** Typography scale */
  typography: TypographyScale;
  /** Elevation scale */
  elevation: ElevationScale;
  /** Breakpoint values */
  breakpoints: BreakpointValues;
  /** Transition configuration */
  transitions: TransitionConfig;
  /** Z-index scale */
  zIndex: ZIndexScale;
}

// ============================================================================
// Component Theme Override Types
// ============================================================================

/**
 * Style overrides for a single component
 * Generic type parameter T represents component's slot keys
 */
export interface ComponentStyleOverride<T extends string = string> {
  /** Style overrides for component slots */
  styleOverrides?: Partial<Record<T, React.CSSProperties | ((props: any) => React.CSSProperties)>>;
  /** Default props for component */
  defaultProps?: Record<string, any>;
  /** Variant definitions (optional) */
  variants?: Array<{
    props: Record<string, any>;
    style: React.CSSProperties;
  }>;
}

/**
 * All component theme overrides
 */
export interface ComponentOverrides {
  MuiButton?: ComponentStyleOverride<'root' | 'contained' | 'outlined' | 'text'>;
  MuiTextField?: ComponentStyleOverride<'root' | 'input'>;
  MuiCard?: ComponentStyleOverride<'root'>;
  MuiAppBar?: ComponentStyleOverride<'root'>;
  MuiDrawer?: ComponentStyleOverride<'root' | 'paper' | 'docked'>;
  MuiPaper?: ComponentStyleOverride<'root' | 'elevation'>;
  MuiTypography?: ComponentStyleOverride<'root'>;
  MuiIconButton?: ComponentStyleOverride<'root'>;
  MuiList?: ComponentStyleOverride<'root' | 'padding'>;
  MuiListItem?: ComponentStyleOverride<'root' | 'button'>;
  MuiListItemIcon?: ComponentStyleOverride<'root'>;
  MuiListItemText?: ComponentStyleOverride<'root' | 'primary' | 'secondary'>;
  MuiMenu?: ComponentStyleOverride<'root' | 'paper' | 'list'>;
  MuiMenuItem?: ComponentStyleOverride<'root'>;
  MuiAvatar?: ComponentStyleOverride<'root'>;
  MuiChip?: ComponentStyleOverride<'root'>;
  MuiDivider?: ComponentStyleOverride<'root'>;
  MuiTooltip?: ComponentStyleOverride<'tooltip' | 'arrow'>;
  MuiSwitch?: ComponentStyleOverride<'root' | 'switchBase' | 'track'>;
  // Add more components as needed
}

/**
 * Extended theme configuration with component overrides
 */
export interface ExtendedThemeConfig extends ThemeConfig {
  /** Component-specific style overrides */
  components?: ComponentOverrides;
}

// ============================================================================
// Theme Context Types
// ============================================================================

/**
 * Theme context value providing theme state and controls
 */
export interface ThemeContextValue {
  /** Current theme state */
  theme: ThemeState;
  /** Update theme mode */
  setMode: (mode: ThemeMode) => void;
  /** Toggle between light and dark (ignores system) */
  toggleMode: () => void;
  /** Current Material-UI theme object */
  muiTheme: ExtendedThemeConfig;
}

// ============================================================================
// Responsive Helper Types
// ============================================================================

/**
 * Current responsive state
 */
export interface ResponsiveState {
  /** Current breakpoint */
  breakpoint: BreakpointKey;
  /** Viewport width in pixels */
  width: number;
  /** Viewport height in pixels */
  height: number;
  /** Whether viewport is mobile-sized (≥768px, <992px) */
  isMobile: boolean;
  /** Whether viewport is tablet-sized (≥992px, <1200px) */
  isTablet: boolean;
  /** Whether viewport is desktop-sized (≥1200px) */
  isDesktop: boolean;
  /** Device orientation (mobile/tablet only) */
  orientation?: 'portrait' | 'landscape';
}

/**
 * Media query helper function type
 * @example
 * const isMobile = useMediaQuery('(max-width: 991px)');
 */
export type MediaQueryMatcher = (query: string) => boolean;

// ============================================================================
// Utility Types
// ============================================================================

/**
 * CSS color string (hex, rgb, hsl, or CSS variable)
 */
export type CSSColor = string;

/**
 * CSS length value (px, rem, em, %, etc.)
 */
export type CSSLength = string | number;

/**
 * CSS box shadow value
 */
export type CSSBoxShadow = string;

/**
 * CSS transition value
 */
export type CSSTransition = string;

/**
 * Theme-aware CSS properties (can reference theme tokens)
 */
export interface ThemeAwareCSSProperties extends React.CSSProperties {
  /** Use theme color tokens */
  color?: CSSColor;
  backgroundColor?: CSSColor;
  borderColor?: CSSColor;
  
  /** Use theme spacing tokens */
  padding?: CSSLength;
  margin?: CSSLength;
  gap?: CSSLength;
  
  /** Use theme elevation */
  boxShadow?: CSSBoxShadow;
  
  /** Use theme transitions */
  transition?: CSSTransition;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if a mode is 'light' or 'dark' (not 'system')
 */
export function isEffectiveThemeMode(mode: ThemeMode): mode is EffectiveThemeMode {
  return mode === 'light' || mode === 'dark';
}

/**
 * Type guard to check if a value is a valid elevation level
 */
export function isElevationLevel(value: number): value is ElevationLevel {
  return [0, 1, 2, 3, 4, 6, 8, 12, 16, 24].includes(value);
}

/**
 * Type guard to check if a value is a valid spacing index
 */
export function isSpacingIndex(value: number): value is SpacingIndex {
  return Number.isInteger(value) && value >= 0 && value <= 12;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Default theme mode (sync with OS preference)
 */
export const DEFAULT_THEME_MODE: ThemeMode = 'system';

/**
 * LocalStorage key for persisting theme mode
 */
export const THEME_MODE_STORAGE_KEY = 'theme-mode';

/**
 * Media query for detecting system dark mode preference
 */
export const PREFERS_DARK_MODE_QUERY = '(prefers-color-scheme: dark)';

/**
 * Default Material-UI font family
 */
export const DEFAULT_FONT_FAMILY = 'Roboto, Arial, sans-serif';

/**
 * Default content max-width (centered layout)
 */
export const DEFAULT_CONTENT_MAX_WIDTH = 1440;

/**
 * WCAG AA minimum contrast ratio for body text (16px)
 */
export const WCAG_AA_CONTRAST_RATIO_BODY = 4.5;

/**
 * WCAG AA minimum contrast ratio for large text (≥18px or ≥14px bold)
 */
export const WCAG_AA_CONTRAST_RATIO_LARGE = 3.0;

/**
 * Minimum touch target size (WCAG 2.1 AAA, Material Design)
 */
export const MIN_TOUCH_TARGET_SIZE = 44;

/**
 * Recommended touch target size (Material Design guideline)
 */
export const RECOMMENDED_TOUCH_TARGET_SIZE = 48;

/**
 * Maximum animation duration per Constitution Section VIII
 */
export const MAX_ANIMATION_DURATION = 300;

/**
 * AppBar height on desktop
 */
export const APP_BAR_HEIGHT_DESKTOP = 64;

/**
 * AppBar height on mobile
 */
export const APP_BAR_HEIGHT_MOBILE = 56;

/**
 * Drawer width when expanded
 */
export const DRAWER_WIDTH_EXPANDED = 240;

/**
 * Drawer width in mini variant (icon-only)
 */
export const DRAWER_WIDTH_MINI = 64;
