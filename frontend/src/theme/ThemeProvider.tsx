/**
 * ThemeProvider - Global Theme Context Provider
 * 
 * Feature: 002-modern-ui-redesign
 * Purpose: Provides theme state and controls throughout the application
 * 
 * @see ../../../specs/002-modern-ui-redesign/contracts/theme.ts for type definitions
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import type { Theme } from '@mui/material/styles';
import type {
  ThemeMode,
  EffectiveThemeMode,
  ThemeState,
  ThemeContextValue,
} from '../../../specs/002-modern-ui-redesign/contracts/theme';
import {
  createAppTheme,
  getSystemPreference,
  resolveEffectiveMode,
  initializeTheme,
  storeThemeMode,
  watchSystemPreference,
  applyThemeToDocument,
} from './createTheme';

// ============================================================================
// Theme Context
// ============================================================================

/**
 * Theme context - provides theme state and controls
 */
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Hook to access theme context
 * Must be used within ThemeProvider
 * 
 * @throws Error if used outside ThemeProvider
 * @returns Theme context value
 */
export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  
  return context;
}

// ============================================================================
// ThemeProvider Component
// ============================================================================

/**
 * ThemeProvider props
 */
export interface ThemeProviderProps {
  /** Child components */
  children: ReactNode;
  /** Optional initial theme mode (overrides localStorage) */
  initialMode?: ThemeMode;
}

/**
 * ThemeProvider component
 * Manages theme state, localStorage persistence, and system preference sync
 * 
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <ThemeProvider>
 *       <YourApp />
 *     </ThemeProvider>
 *   );
 * }
 * ```
 */
export function ThemeProvider({ children, initialMode }: ThemeProviderProps): React.JSX.Element {
  // Initialize theme state
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (initialMode) {
      return initialMode;
    }
    const { mode: initMode } = initializeTheme();
    return initMode;
  });
  
  const [systemPreference, setSystemPreference] = useState<EffectiveThemeMode>(() => {
    return getSystemPreference();
  });
  
  // Resolve effective mode (system preference applied if mode is 'system')
  const effectiveMode = useMemo<EffectiveThemeMode>(() => {
    return resolveEffectiveMode(mode);
  }, [mode]);
  
  // Create MUI theme based on effective mode
  const muiTheme = useMemo<Theme>(() => {
    return createAppTheme(effectiveMode);
  }, [effectiveMode]);
  
  // Build theme state object
  const themeState = useMemo<ThemeState>(() => {
    return {
      mode,
      effectiveMode,
      systemPreference,
    };
  }, [mode, effectiveMode, systemPreference]);
  
  // Set theme mode (updates state and localStorage)
  const setMode = React.useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    storeThemeMode(newMode);
    
    const newEffectiveMode = resolveEffectiveMode(newMode);
    applyThemeToDocument(newEffectiveMode);
  }, []);
  
  // Toggle between light and dark (ignores system)
  const toggleMode = React.useCallback(() => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
  }, [mode, setMode]);
  
  // Watch for system preference changes
  useEffect(() => {
    const cleanup = watchSystemPreference((newPreference) => {
      setSystemPreference(newPreference);
      
      // If current mode is 'system', update document
      if (mode === 'system') {
        applyThemeToDocument(newPreference);
      }
    });
    
    return cleanup;
  }, [mode]);
  
  // Apply theme to document whenever effective mode changes
  useEffect(() => {
    applyThemeToDocument(effectiveMode);
  }, [effectiveMode]);
  
  // Build context value
  const contextValue = useMemo<ThemeContextValue>(() => {
    return {
      theme: themeState,
      setMode,
      toggleMode,
      muiTheme: muiTheme as any, // MUI Theme is compatible with ExtendedThemeConfig
    };
  }, [themeState, setMode, toggleMode, muiTheme]);
  
  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
