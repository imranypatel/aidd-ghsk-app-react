/**
 * useBreakpoint Hook - Simple Breakpoint Detection
 * 
 * Feature: 002-modern-ui-redesign
 * Purpose: Lightweight hook for current breakpoint detection (simpler alternative to useResponsive)
 * 
 * @see ../../../specs/002-modern-ui-redesign/contracts/responsive.ts for type definitions
 */

import { useState, useEffect } from 'react';
import type {
  UseBreakpointResult,
} from '../../../specs/002-modern-ui-redesign/contracts/responsive';
import type { BreakpointKey } from '../../../specs/002-modern-ui-redesign/contracts/theme';
import { breakpoints } from '../theme/tokens';

/**
 * Debounce delay for resize events (milliseconds)
 */
const RESIZE_DEBOUNCE_MS = 150;

/**
 * Get current viewport width
 */
function getViewportWidth(): number {
  if (typeof window === 'undefined') {
    return 1200; // SSR fallback (desktop size)
  }
  
  return window.innerWidth;
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
 * Hook to detect current breakpoint
 * 
 * Simpler alternative to useResponsive when only breakpoint detection is needed
 * Automatically updates on window resize with 150ms debounce
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { current, is } = useBreakpoint();
 *   
 *   return (
 *     <div>
 *       <p>Current breakpoint: {current}</p>
 *       {is.mobile && <MobileView />}
 *       {is.tablet && <TabletView />}
 *       {is.desktop && <DesktopView />}
 *     </div>
 *   );
 * }
 * ```
 * 
 * @returns Current breakpoint and boolean flags
 */
export function useBreakpoint(): UseBreakpointResult {
  // Initialize with current breakpoint
  const [current, setCurrent] = useState<BreakpointKey>(() => {
    const width = getViewportWidth();
    return getBreakpoint(width);
  });
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const width = getViewportWidth();
      const newBreakpoint = getBreakpoint(width);
      
      // Only update if breakpoint actually changed
      setCurrent((prevBreakpoint) => {
        if (prevBreakpoint !== newBreakpoint) {
          return newBreakpoint;
        }
        return prevBreakpoint;
      });
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
  
  // Build result object
  return {
    current,
    is: {
      mobile: current === 'mobile',
      tablet: current === 'tablet',
      desktop: current === 'desktop',
    },
  };
}

export default useBreakpoint;
