/**
 * Theme Factory - Create MUI Theme Based on Mode
 * 
 * Feature: 002-modern-ui-redesign
 * Purpose: Factory function to generate Material-UI theme for light/dark/system mode
 * 
 * @see ../../../specs/002-modern-ui-redesign/contracts/theme.ts for type definitions
 */

import type { Theme } from '@mui/material/styles';
import { lightTheme } from './lightTheme';
import { darkTheme } from './darkTheme';
import type { ThemeMode, EffectiveThemeMode } from '../../../specs/002-modern-ui-redesign/contracts/theme';

/**
 * LocalStorage key for theme mode persistence
 */
export const THEME_MODE_STORAGE_KEY = 'theme-mode';

/**
 * Media query for system dark mode preference
 */
export const PREFERS_DARK_MODE_QUERY = '(prefers-color-scheme: dark)';

/**
 * Detect system color scheme preference
 * 
 * @returns 'dark' if system prefers dark mode, otherwise 'light'
 */
export function getSystemPreference(): EffectiveThemeMode {
  if (typeof window === 'undefined') {
    return 'light'; // SSR fallback
  }
  
  const mediaQuery = window.matchMedia(PREFERS_DARK_MODE_QUERY);
  return mediaQuery.matches ? 'dark' : 'light';
}

/**
 * Get stored theme mode from localStorage
 * 
 * @returns Stored theme mode or null if not found/invalid
 */
export function getStoredThemeMode(): ThemeMode | null {
  if (typeof window === 'undefined') {
    return null; // SSR fallback
  }
  
  try {
    const stored = localStorage.getItem(THEME_MODE_STORAGE_KEY);
    
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored as ThemeMode;
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to read theme mode from localStorage:', error);
    return null;
  }
}

/**
 * Store theme mode in localStorage
 * 
 * @param mode - Theme mode to store
 */
export function storeThemeMode(mode: ThemeMode): void {
  if (typeof window === 'undefined') {
    return; // SSR fallback
  }
  
  try {
    localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
  } catch (error) {
    console.warn('Failed to store theme mode in localStorage:', error);
  }
}

/**
 * Resolve theme mode to effective mode (light or dark)
 * 
 * @param mode - Theme mode (light, dark, or system)
 * @returns Effective theme mode (light or dark)
 */
export function resolveEffectiveMode(mode: ThemeMode): EffectiveThemeMode {
  if (mode === 'system') {
    return getSystemPreference();
  }
  return mode;
}

/**
 * Get initial theme mode on app load
 * Priority: localStorage > system preference > default 'light'
 * 
 * @returns Initial theme mode
 */
export function getInitialThemeMode(): ThemeMode {
  // Try to get from localStorage first
  const stored = getStoredThemeMode();
  if (stored !== null) {
    return stored;
  }
  
  // Default to system preference
  return 'system';
}

/**
 * Create Material-UI theme based on effective mode
 * 
 * @param effectiveMode - Resolved theme mode (light or dark)
 * @returns Material-UI Theme object
 */
export function createAppTheme(effectiveMode: EffectiveThemeMode): Theme {
  return effectiveMode === 'dark' ? darkTheme : lightTheme;
}

/**
 * Apply theme mode to document root for CSS variables
 * This prevents FOUC (Flash of Unstyled Content) on initial load
 * 
 * @param effectiveMode - Resolved theme mode
 */
export function applyThemeToDocument(effectiveMode: EffectiveThemeMode): void {
  if (typeof document === 'undefined') {
    return; // SSR fallback
  }
  
  // Set data attribute on html element
  document.documentElement.setAttribute('data-theme', effectiveMode);
  
  // Set color-scheme meta property for browser UI
  const colorScheme = document.querySelector('meta[name="color-scheme"]');
  if (colorScheme) {
    colorScheme.setAttribute('content', effectiveMode);
  } else {
    const meta = document.createElement('meta');
    meta.name = 'color-scheme';
    meta.content = effectiveMode;
    document.head.appendChild(meta);
  }
}

/**
 * Initialize theme on app startup
 * Reads stored preference and applies to document
 * 
 * @returns Initial theme mode and effective mode
 */
export function initializeTheme(): {
  mode: ThemeMode;
  effectiveMode: EffectiveThemeMode;
} {
  const mode = getInitialThemeMode();
  const effectiveMode = resolveEffectiveMode(mode);
  
  // Apply to document immediately to prevent FOUC
  applyThemeToDocument(effectiveMode);
  
  return { mode, effectiveMode };
}

/**
 * Toggle between light and dark modes (ignores system)
 * 
 * @param currentMode - Current theme mode
 * @returns Next theme mode
 */
export function toggleThemeMode(currentMode: ThemeMode): ThemeMode {
  if (currentMode === 'light') {
    return 'dark';
  }
  if (currentMode === 'dark') {
    return 'system';
  }
  // system -> light
  return 'light';
}

/**
 * Cycle through all theme modes: light -> dark -> system -> light
 * 
 * @param currentMode - Current theme mode
 * @param includeSystem - Whether to include system mode in cycle (default: true)
 * @returns Next theme mode
 */
export function cycleThemeMode(currentMode: ThemeMode, includeSystem = true): ThemeMode {
  if (includeSystem) {
    // light -> dark -> system -> light
    if (currentMode === 'light') return 'dark';
    if (currentMode === 'dark') return 'system';
    return 'light';
  } else {
    // light -> dark -> light (no system)
    return currentMode === 'light' ? 'dark' : 'light';
  }
}

/**
 * Listen for system preference changes
 * 
 * @param callback - Function to call when system preference changes
 * @returns Cleanup function to remove listener
 */
export function watchSystemPreference(
  callback: (preference: EffectiveThemeMode) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {}; // SSR fallback
  }
  
  const mediaQuery = window.matchMedia(PREFERS_DARK_MODE_QUERY);
  
  const handler = (event: MediaQueryListEvent) => {
    callback(event.matches ? 'dark' : 'light');
  };
  
  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }
  
  // Legacy browsers (IE11, old Safari)
  if (mediaQuery.addListener) {
    mediaQuery.addListener(handler);
    return () => mediaQuery.removeListener(handler);
  }
  
  return () => {};
}

/**
 * Default theme mode when nothing is stored
 */
export const DEFAULT_THEME_MODE: ThemeMode = 'system';
