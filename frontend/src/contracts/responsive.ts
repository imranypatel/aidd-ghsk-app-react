/**
 * Responsive Design Type Definitions and Utilities
 * 
 * Feature: 002-modern-ui-redesign
 * Purpose: TypeScript interfaces and utilities for responsive behavior, breakpoints, and media queries
 * 
 * @see ../data-model.md for detailed responsive behavior schema
 */

import type { BreakpointKey, BreakpointValues } from './theme.js';

// ============================================================================
// Breakpoint Constants
// ============================================================================

/**
 * Fixed responsive breakpoint values (Constitution Section VIII)
 */
export const BREAKPOINTS: BreakpointValues = {
  mobile: 768,
  tablet: 992,
  desktop: 1200,
};

// ============================================================================
// Responsive State Types
// ============================================================================

/**
 * Current responsive state based on viewport dimensions
 */
export interface ResponsiveState {
  /** Current active breakpoint */
  breakpoint: BreakpointKey;
  
  /** Current viewport width in pixels */
  width: number;
  
  /** Current viewport height in pixels */
  height: number;
  
  /** Whether viewport is mobile-sized (≥768px, <992px) */
  isMobile: boolean;
  
  /** Whether viewport is tablet-sized (≥992px, <1200px) */
  isTablet: boolean;
  
  /** Whether viewport is desktop-sized (≥1200px) */
  isDesktop: boolean;
  
  /** Device orientation (relevant for mobile/tablet) */
  orientation?: 'portrait' | 'landscape';
}

/**
 * Responsive configuration for a single breakpoint
 */
export interface ResponsiveConfig<T> {
  mobile?: T;
  tablet?: T;
  desktop?: T;
}

/**
 * Responsive value that can be a single value or breakpoint-specific
 */
export type ResponsiveValue<T> = T | ResponsiveConfig<T>;

// ============================================================================
// Media Query Types
// ============================================================================

/**
 * Media query direction
 */
export type MediaQueryDirection = 'up' | 'down' | 'between' | 'only';

/**
 * Media query builder parameters
 */
export interface MediaQueryParams {
  /** Minimum breakpoint (inclusive) */
  minBreakpoint?: BreakpointKey;
  
  /** Maximum breakpoint (exclusive) */
  maxBreakpoint?: BreakpointKey;
  
  /** Custom minimum width in pixels */
  minWidth?: number;
  
  /** Custom maximum width in pixels */
  maxWidth?: number;
  
  /** Orientation constraint */
  orientation?: 'portrait' | 'landscape';
  
  /** Whether to use print media type */
  print?: boolean;
}

/**
 * Media query string result
 */
export type MediaQuery = string;

// ============================================================================
// Responsive Hook Return Types
// ============================================================================

/**
 * Return type for useResponsive hook
 */
export interface UseResponsiveResult {
  /** Current responsive state */
  state: ResponsiveState;
  
  /** Media query matcher function */
  matches: (query: MediaQuery) => boolean;
  
  /** Utility functions */
  utils: {
    /** Check if current viewport is at least the given breakpoint */
    isUp: (breakpoint: BreakpointKey) => boolean;
    
    /** Check if current viewport is below the given breakpoint */
    isDown: (breakpoint: BreakpointKey) => boolean;
    
    /** Check if current viewport is exactly the given breakpoint */
    isOnly: (breakpoint: BreakpointKey) => boolean;
    
    /** Check if current viewport is between two breakpoints */
    isBetween: (min: BreakpointKey, max: BreakpointKey) => boolean;
  };
}

/**
 * Return type for useMediaQuery hook
 */
export interface UseMediaQueryResult {
  /** Whether the media query matches */
  matches: boolean;
  
  /** MediaQueryList object for advanced usage */
  mediaQueryList: MediaQueryList | null;
}

/**
 * Return type for useBreakpoint hook
 */
export interface UseBreakpointResult {
  /** Current active breakpoint */
  current: BreakpointKey;
  
  /** Whether each breakpoint is active */
  is: {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
  };
}

// ============================================================================
// Responsive Component Props Types
// ============================================================================

/**
 * Props for responsive visibility wrapper
 */
export interface ResponsiveVisibilityProps {
  /** Children to conditionally render */
  children: React.ReactNode;
  
  /** Show only on mobile */
  mobileOnly?: boolean;
  
  /** Show only on tablet */
  tabletOnly?: boolean;
  
  /** Show only on desktop */
  desktopOnly?: boolean;
  
  /** Hide on mobile */
  hideMobile?: boolean;
  
  /** Hide on tablet */
  hideTablet?: boolean;
  
  /** Hide on desktop */
  hideDesktop?: boolean;
  
  /** Custom media query for visibility */
  showWhen?: MediaQuery;
  
  /** Custom media query for hiding */
  hideWhen?: MediaQuery;
}

/**
 * Props for responsive container wrapper
 */
export interface ResponsiveContainerProps {
  /** Children to render */
  children: React.ReactNode;
  
  /** Maximum width in pixels (default: 1440) */
  maxWidth?: number;
  
  /** Responsive padding using spacing scale indices */
  padding?: ResponsiveValue<number>;
  
  /** Whether to center the container */
  centered?: boolean;
  
  /** Whether to apply fluid width (100%) */
  fluid?: boolean;
  
  /** Additional CSS class name */
  className?: string;
}

/**
 * Props for responsive grid container
 */
export interface ResponsiveGridProps {
  /** Children grid items */
  children: React.ReactNode;
  
  /** Number of columns per breakpoint */
  columns?: ResponsiveConfig<number>;
  
  /** Gap between items using spacing scale indices */
  gap?: ResponsiveValue<number>;
  
  /** Alignment of grid items */
  align?: 'start' | 'center' | 'end' | 'stretch';
  
  /** Justification of grid items */
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
  
  /** Additional CSS class name */
  className?: string;
}

// ============================================================================
// Layout Responsive Mappings
// ============================================================================

/**
 * AppBar responsive configuration
 */
export interface AppBarResponsiveConfig {
  /** AppBar height per breakpoint */
  height: ResponsiveConfig<number>;
  
  /** Whether to show menu icon (hamburger) per breakpoint */
  showMenuIcon: ResponsiveConfig<boolean>;
  
  /** Whether to show logo per breakpoint */
  showLogo: ResponsiveConfig<boolean>;
  
  /** Logo size per breakpoint */
  logoSize: ResponsiveConfig<{ width: number; height: number }>;
}

/**
 * Drawer responsive configuration
 */
export interface DrawerResponsiveConfig {
  /** Drawer variant per breakpoint */
  variant: ResponsiveConfig<'permanent' | 'persistent' | 'temporary'>;
  
  /** Whether to use mini variant per breakpoint */
  miniVariant: ResponsiveConfig<boolean>;
  
  /** Drawer width per breakpoint */
  width: ResponsiveConfig<number>;
  
  /** Whether drawer is initially open per breakpoint */
  initialOpen: ResponsiveConfig<boolean>;
}

/**
 * Content area responsive configuration
 */
export interface ContentResponsiveConfig {
  /** Padding using spacing scale indices per breakpoint */
  padding: ResponsiveConfig<number>;
  
  /** Maximum width in pixels per breakpoint */
  maxWidth: ResponsiveConfig<number>;
  
  /** Whether content is centered per breakpoint */
  centered: ResponsiveConfig<boolean>;
}

/**
 * Complete layout responsive configuration
 */
export interface LayoutResponsiveConfig {
  appBar: AppBarResponsiveConfig;
  drawer: DrawerResponsiveConfig;
  content: ContentResponsiveConfig;
}

// ============================================================================
// Default Responsive Configurations
// ============================================================================

/**
 * Default AppBar responsive configuration
 */
export const DEFAULT_APP_BAR_RESPONSIVE_CONFIG: AppBarResponsiveConfig = {
  height: {
    mobile: 56,
    tablet: 64,
    desktop: 64,
  },
  showMenuIcon: {
    mobile: true,
    tablet: false,
    desktop: false,
  },
  showLogo: {
    mobile: true,
    tablet: true,
    desktop: true,
  },
  logoSize: {
    mobile: { width: 32, height: 32 },
    tablet: { width: 40, height: 40 },
    desktop: { width: 40, height: 40 },
  },
};

/**
 * Default Drawer responsive configuration
 */
export const DEFAULT_DRAWER_RESPONSIVE_CONFIG: DrawerResponsiveConfig = {
  variant: {
    mobile: 'temporary',
    tablet: 'permanent',
    desktop: 'permanent',
  },
  miniVariant: {
    mobile: false,
    tablet: true,
    desktop: false,
  },
  width: {
    mobile: 240,
    tablet: 64,
    desktop: 240,
  },
  initialOpen: {
    mobile: false,
    tablet: true,
    desktop: true,
  },
};

/**
 * Default Content responsive configuration
 */
export const DEFAULT_CONTENT_RESPONSIVE_CONFIG: ContentResponsiveConfig = {
  padding: {
    mobile: 2,  // 16px
    tablet: 3,  // 24px
    desktop: 3, // 24px
  },
  maxWidth: {
    mobile: 0,    // No max-width (100%)
    tablet: 0,    // No max-width (100%)
    desktop: 1440, // Centered with max-width
  },
  centered: {
    mobile: false,
    tablet: false,
    desktop: true,
  },
};

/**
 * Default complete layout responsive configuration
 */
export const DEFAULT_LAYOUT_RESPONSIVE_CONFIG: LayoutResponsiveConfig = {
  appBar: DEFAULT_APP_BAR_RESPONSIVE_CONFIG,
  drawer: DEFAULT_DRAWER_RESPONSIVE_CONFIG,
  content: DEFAULT_CONTENT_RESPONSIVE_CONFIG,
};

// ============================================================================
// Responsive Utility Functions
// ============================================================================

/**
 * Get current breakpoint based on viewport width
 */
export function getCurrentBreakpoint(width: number): BreakpointKey {
  if (width >= BREAKPOINTS.desktop) return 'desktop';
  if (width >= BREAKPOINTS.tablet) return 'tablet';
  return 'mobile';
}

/**
 * Check if viewport width is at least the given breakpoint
 */
export function isBreakpointUp(width: number, breakpoint: BreakpointKey): boolean {
  return width >= BREAKPOINTS[breakpoint];
}

/**
 * Check if viewport width is below the given breakpoint
 */
export function isBreakpointDown(width: number, breakpoint: BreakpointKey): boolean {
  return width < BREAKPOINTS[breakpoint];
}

/**
 * Check if viewport width is exactly within the given breakpoint range
 */
export function isBreakpointOnly(width: number, breakpoint: BreakpointKey): boolean {
  switch (breakpoint) {
    case 'mobile':
      return width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet;
    case 'tablet':
      return width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop;
    case 'desktop':
      return width >= BREAKPOINTS.desktop;
    default:
      return false;
  }
}

/**
 * Check if viewport width is between two breakpoints
 */
export function isBreakpointBetween(
  width: number,
  minBreakpoint: BreakpointKey,
  maxBreakpoint: BreakpointKey
): boolean {
  return width >= BREAKPOINTS[minBreakpoint] && width < BREAKPOINTS[maxBreakpoint];
}

/**
 * Build media query string
 */
export function buildMediaQuery(params: MediaQueryParams): MediaQuery {
  const parts: string[] = [];
  
  if (params.print) {
    parts.push('print');
  } else {
    parts.push('screen');
  }
  
  if (params.minWidth !== undefined) {
    parts.push(`(min-width: ${params.minWidth}px)`);
  } else if (params.minBreakpoint) {
    parts.push(`(min-width: ${BREAKPOINTS[params.minBreakpoint]}px)`);
  }
  
  if (params.maxWidth !== undefined) {
    parts.push(`(max-width: ${params.maxWidth}px)`);
  } else if (params.maxBreakpoint) {
    parts.push(`(max-width: ${BREAKPOINTS[params.maxBreakpoint] - 1}px)`);
  }
  
  if (params.orientation) {
    parts.push(`(orientation: ${params.orientation})`);
  }
  
  return parts.join(' and ');
}

/**
 * Build media query for breakpoint up (≥ breakpoint)
 */
export function mediaQueryUp(breakpoint: BreakpointKey): MediaQuery {
  return buildMediaQuery({ minBreakpoint: breakpoint });
}

/**
 * Build media query for breakpoint down (< breakpoint)
 */
export function mediaQueryDown(breakpoint: BreakpointKey): MediaQuery {
  const breakpoints: BreakpointKey[] = ['mobile', 'tablet', 'desktop'];
  const index = breakpoints.indexOf(breakpoint);
  
  if (index === 0) {
    // Can't go down from mobile
    return buildMediaQuery({ maxWidth: BREAKPOINTS.mobile - 1 });
  }
  
  return buildMediaQuery({ maxWidth: BREAKPOINTS[breakpoint] - 1 });
}

/**
 * Build media query for breakpoint only (exact range)
 */
export function mediaQueryOnly(breakpoint: BreakpointKey): MediaQuery {
  switch (breakpoint) {
    case 'mobile':
      return buildMediaQuery({
        minBreakpoint: 'mobile',
        maxWidth: BREAKPOINTS.tablet - 1,
      });
    case 'tablet':
      return buildMediaQuery({
        minBreakpoint: 'tablet',
        maxWidth: BREAKPOINTS.desktop - 1,
      });
    case 'desktop':
      return buildMediaQuery({ minBreakpoint: 'desktop' });
    default:
      return '';
  }
}

/**
 * Build media query for between two breakpoints
 */
export function mediaQueryBetween(
  minBreakpoint: BreakpointKey,
  maxBreakpoint: BreakpointKey
): MediaQuery {
  return buildMediaQuery({
    minBreakpoint,
    maxWidth: BREAKPOINTS[maxBreakpoint] - 1,
  });
}

/**
 * Resolve responsive value for current breakpoint
 */
export function resolveResponsiveValue<T>(
  value: ResponsiveValue<T>,
  currentBreakpoint: BreakpointKey
): T {
  // If value is not an object or doesn't have breakpoint keys, return as-is
  if (typeof value !== 'object' || value === null) {
    return value as T;
  }
  
  const config = value as ResponsiveConfig<T>;
  
  // Return exact breakpoint match if exists
  if (config[currentBreakpoint] !== undefined) {
    return config[currentBreakpoint]!;
  }
  
  // Fallback cascade: desktop -> tablet -> mobile
  if (currentBreakpoint === 'desktop') {
    return config.desktop ?? config.tablet ?? config.mobile ?? (value as T);
  } else if (currentBreakpoint === 'tablet') {
    return config.tablet ?? config.mobile ?? (value as T);
  } else {
    return config.mobile ?? (value as T);
  }
}

/**
 * Get viewport dimensions
 */
export function getViewportDimensions(): { width: number; height: number } {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }
  
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

/**
 * Get device orientation
 */
export function getOrientation(): 'portrait' | 'landscape' {
  if (typeof window === 'undefined') {
    return 'portrait';
  }
  
  const { width, height } = getViewportDimensions();
  return width < height ? 'portrait' : 'landscape';
}

/**
 * Create responsive state from viewport dimensions
 */
export function createResponsiveState(width: number, height: number): ResponsiveState {
  const breakpoint = getCurrentBreakpoint(width);
  
  return {
    breakpoint,
    width,
    height,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    orientation: getOrientation(),
  };
}

/**
 * Check if media query matches (client-side only)
 */
export function matchesMediaQuery(query: MediaQuery): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  
  return window.matchMedia(query).matches;
}

/**
 * Listen to media query changes (returns cleanup function)
 */
export function subscribeToMediaQuery(
  query: MediaQuery,
  callback: (matches: boolean) => void
): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {};
  }
  
  const mediaQueryList = window.matchMedia(query);
  
  const handler = (event: MediaQueryListEvent) => {
    callback(event.matches);
  };
  
  // Modern browsers
  if (mediaQueryList.addEventListener) {
    mediaQueryList.addEventListener('change', handler);
    return () => mediaQueryList.removeEventListener('change', handler);
  }
  
  // Legacy browsers (Safari < 14)
  mediaQueryList.addListener(handler);
  return () => mediaQueryList.removeListener(handler);
}

/**
 * Listen to viewport resize (returns cleanup function)
 */
export function subscribeToResize(callback: (dimensions: { width: number; height: number }) => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  
  const handler = () => {
    callback(getViewportDimensions());
  };
  
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}

/**
 * Debounce function for resize listeners
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, waitMs);
  };
}

/**
 * Throttle function for scroll/resize listeners
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limitMs: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limitMs);
    }
  };
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if value is a responsive configuration object
 */
export function isResponsiveConfig<T>(value: ResponsiveValue<T>): value is ResponsiveConfig<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    ('mobile' in value || 'tablet' in value || 'desktop' in value)
  );
}

/**
 * Check if value is a valid breakpoint key
 */
export function isBreakpointKey(value: string): value is BreakpointKey {
  return ['mobile', 'tablet', 'desktop'].includes(value);
}

// ============================================================================
// CSS Helper Functions
// ============================================================================

/**
 * Generate CSS media query string for use in styled-components or Emotion
 */
export function cssMediaQuery(breakpoint: BreakpointKey, direction: MediaQueryDirection = 'up'): string {
  let query = '';
  
  switch (direction) {
    case 'up':
      query = mediaQueryUp(breakpoint);
      break;
    case 'down':
      query = mediaQueryDown(breakpoint);
      break;
    case 'only':
      query = mediaQueryOnly(breakpoint);
      break;
    default:
      query = mediaQueryUp(breakpoint);
  }
  
  return `@media ${query}`;
}

/**
 * Generate responsive CSS property value
 * @example
 * // Input: { mobile: 16, tablet: 24, desktop: 32 }
 * // Output: CSS with media queries for each breakpoint
 */
export function responsiveCSSProperty(
  property: string,
  value: ResponsiveValue<string | number>,
  unit: string = 'px'
): string {
  if (!isResponsiveConfig(value)) {
    return `${property}: ${value}${typeof value === 'number' ? unit : ''};`;
  }
  
  const config = value as ResponsiveConfig<string | number>;
  const cssRules: string[] = [];
  
  // Mobile (base, no media query)
  if (config.mobile !== undefined) {
    cssRules.push(`${property}: ${config.mobile}${typeof config.mobile === 'number' ? unit : ''};`);
  }
  
  // Tablet
  if (config.tablet !== undefined) {
    cssRules.push(
      `${cssMediaQuery('tablet')} {`,
      `  ${property}: ${config.tablet}${typeof config.tablet === 'number' ? unit : ''};`,
      `}`
    );
  }
  
  // Desktop
  if (config.desktop !== undefined) {
    cssRules.push(
      `${cssMediaQuery('desktop')} {`,
      `  ${property}: ${config.desktop}${typeof config.desktop === 'number' ? unit : ''};`,
      `}`
    );
  }
  
  return cssRules.join('\n');
}

// ============================================================================
// Constants Export
// ============================================================================

/**
 * Common media query strings for direct use
 */
export const MEDIA_QUERIES = {
  mobile: mediaQueryOnly('mobile'),
  tablet: mediaQueryOnly('tablet'),
  desktop: mediaQueryOnly('desktop'),
  mobileUp: mediaQueryUp('mobile'),
  tabletUp: mediaQueryUp('tablet'),
  desktopUp: mediaQueryUp('desktop'),
  mobileDown: mediaQueryDown('mobile'),
  tabletDown: mediaQueryDown('tablet'),
  desktopDown: mediaQueryDown('desktop'),
} as const;

/**
 * Prefers reduced motion media query
 */
export const PREFERS_REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Prefers color scheme dark media query
 */
export const PREFERS_COLOR_SCHEME_DARK_QUERY = '(prefers-color-scheme: dark)';
