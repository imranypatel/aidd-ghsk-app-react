/**
 * useMediaQuery Hook - Match Media Queries
 * 
 * Feature: 002-modern-ui-redesign
 * Purpose: React hook wrapper for window.matchMedia() with automatic updates
 * 
 * @see ../../../specs/002-modern-ui-redesign/contracts/responsive.ts for type definitions
 */

import { useState, useEffect } from 'react';

/**
 * Hook to match a CSS media query
 * 
 * Automatically updates when the media query match state changes
 * Safe for SSR (returns false on server)
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isMobile = useMediaQuery('(max-width: 991px)');
 *   const preferseDark = useMediaQuery('(prefers-color-scheme: dark)');
 *   const isLandscape = useMediaQuery('(orientation: landscape)');
 *   
 *   return (
 *     <div>
 *       {isMobile ? <MobileView /> : <DesktopView />}
 *       {prefersDark && <DarkModeIcon />}
 *     </div>
 *   );
 * }
 * ```
 * 
 * @param query - CSS media query string (e.g., '(min-width: 768px)')
 * @returns Boolean indicating whether the query matches
 */
export function useMediaQuery(query: string): boolean {
  // SSR-safe initialization
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false; // SSR fallback
    }
    
    return window.matchMedia(query).matches;
  });
  
  useEffect(() => {
    // SSR check
    if (typeof window === 'undefined') {
      return;
    }
    
    const mediaQueryList = window.matchMedia(query);
    
    // Update state when query match changes
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Modern browsers
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handleChange);
      
      // Cleanup
      return () => {
        mediaQueryList.removeEventListener('change', handleChange);
      };
    }
    
    // Legacy browsers (IE11, old Safari)
    if (mediaQueryList.addListener) {
      mediaQueryList.addListener(handleChange);
      
      // Cleanup
      return () => {
        mediaQueryList.removeListener(handleChange);
      };
    }
    
    // No listener support (should never happen in modern browsers)
    return undefined;
  }, [query]);
  
  return matches;
}

export default useMediaQuery;
