/**
 * useResponsive Hook - Track Viewport State and Breakpoints
 * 
 * Feature: 002-modern-ui-redesign
 * Purpose: React hook for responsive state management with breakpoint detection
 * 
 * @see ../../../specs/002-modern-ui-redesign/contracts/responsive.ts for type definitions
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  ResponsiveState,
  UseResponsiveResult,
} from '../../../specs/002-modern-ui-redesign/contracts/responsive';
import type { BreakpointKey } from '../../../specs/002-modern-ui-redesign/contracts/theme';
import { breakpoints } from '../theme/tokens';

/**
 * Debounce delay for resize events (milliseconds)
 */
const RESIZE_DEBOUNCE_MS = 150;

/**
 * Get current viewport dimensions
 */
function getViewportDimensions(): { width: number; height: number } {
  if (typeof window === 'undefined') {
    return { width: 1200, height: 800 }; // SSR fallback (desktop size)
  }
  
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

/**
 * Determine breakpoint from viewport width
 */
function getBreakpoint(width: number): BreakpointKey {
  if (width >= breakpoints.desktop) {
    return 'desktop';
  }
  if (width >= breakpoints.tablet) {
    return 'tablet';
  }
  return 'mobile';
}

/**
 * Get device orientation
 */
function getOrientation(width: number, height: number): 'portrait' | 'landscape' | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  
  // Only relevant for mobile/tablet
  if (width >= breakpoints.desktop) {
    return undefined;
  }
  
  return width > height ? 'landscape' : 'portrait';
}

/**
 * Build complete responsive state
 */
function buildResponsiveState(width: number, height: number): ResponsiveState {
  const breakpoint = getBreakpoint(width);
  
  return {
    breakpoint,
    width,
    height,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    orientation: getOrientation(width, height),
  };
}

/**
 * Debounce helper function
 */
function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Hook to track responsive viewport state
 * 
 * Provides:
 * - Current breakpoint (mobile/tablet/desktop)
 * - Viewport width and height
 * - Boolean flags for each breakpoint
 * - Device orientation
 * - Media query matcher
 * - Breakpoint utility functions
 * 
 * Automatically updates on window resize with 150ms debounce
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { state, matches, utils } = useResponsive();
 *   
 *   return (
 *     <div>
 *       <p>Breakpoint: {state.breakpoint}</p>
 *       <p>Width: {state.width}px</p>
 *       {state.isMobile && <MobileMenu />}
 *       {state.isDesktop && <DesktopSidebar />}
 *       {utils.isUp('tablet') && <TabletFeature />}
 *     </div>
 *   );
 * }
 * ```
 * 
 * @returns Responsive state and utility functions
 */
export function useResponsive(): UseResponsiveResult {
  // Initialize state with current viewport
  const [state, setState] = useState<ResponsiveState>(() => {
    const { width, height } = getViewportDimensions();
    return buildResponsiveState(width, height);
  });
  
  // Handle window resize
  useEffect(() => {
    // Update state on resize
    const handleResize = () => {
      const { width, height } = getViewportDimensions();
      setState(buildResponsiveState(width, height));
    };
    
    // Debounced resize handler
    const debouncedResize = debounce(handleResize, RESIZE_DEBOUNCE_MS);
    
    // Add listener
    window.addEventListener('resize', debouncedResize);
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', debouncedResize);
    };
  }, []);
  
  // Media query matcher function
  const matches = useCallback((query: string): boolean => {
    if (typeof window === 'undefined') {
      return false; // SSR fallback
    }
    
    return window.matchMedia(query).matches;
  }, []);
  
  // Utility functions
  const utils = useMemo(() => {
    return {
      /**
       * Check if viewport is at least the given breakpoint
       * @example isUp('tablet') // true if ≥992px (tablet or desktop)
       */
      isUp: (breakpoint: BreakpointKey): boolean => {
        const currentWidth = state.width;
        const minWidth = breakpoints[breakpoint];
        return currentWidth >= minWidth;
      },
      
      /**
       * Check if viewport is below the given breakpoint
       * @example isDown('desktop') // true if <1200px (mobile or tablet)
       */
      isDown: (breakpoint: BreakpointKey): boolean => {
        const currentWidth = state.width;
        const maxWidth = breakpoints[breakpoint];
        return currentWidth < maxWidth;
      },
      
      /**
       * Check if viewport is exactly the given breakpoint
       * @example isOnly('tablet') // true if ≥992px and <1200px
       */
      isOnly: (breakpoint: BreakpointKey): boolean => {
        return state.breakpoint === breakpoint;
      },
      
      /**
       * Check if viewport is between two breakpoints (inclusive min, exclusive max)
       * @example isBetween('tablet', 'desktop') // true if ≥992px and <1200px
       */
      isBetween: (min: BreakpointKey, max: BreakpointKey): boolean => {
        const currentWidth = state.width;
        const minWidth = breakpoints[min];
        const maxWidth = breakpoints[max];
        return currentWidth >= minWidth && currentWidth < maxWidth;
      },
    };
  }, [state.width, state.breakpoint]);
  
  return {
    state,
    matches,
    utils,
  };
}

export default useResponsive;
