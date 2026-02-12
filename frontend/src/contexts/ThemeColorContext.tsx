/**
 * Theme Color Context - Dynamic Primary Color Management
 * 
 * Purpose: Allows runtime modification of both light and dark theme primary colors
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { lightTheme } from '../theme/lightTheme';
import { darkTheme } from '../theme/darkTheme';
import type { Theme } from '@mui/material/styles';

interface ThemeColorContextValue {
  lightPrimaryColor: string;
  darkPrimaryColor: string;
  setPrimaryColor: (color: string, mode: 'light' | 'dark') => void;
  resetPrimaryColor: (mode?: 'light' | 'dark') => void;
}

const ThemeColorContext = createContext<ThemeColorContextValue | undefined>(undefined);

const DEFAULT_LIGHT_PRIMARY = '#1976d2'; // Material-UI default blue
const DEFAULT_DARK_PRIMARY = '#90caf9'; // Material-UI default dark mode blue

const STORAGE_KEY_LIGHT = 'AIDD_THEME_COLOR_LIGHT';
const STORAGE_KEY_DARK = 'AIDD_THEME_COLOR_DARK';

interface ThemeColorProviderProps {
  children: React.ReactNode;
  mode: 'light' | 'dark';
}

export const ThemeColorProvider: React.FC<ThemeColorProviderProps> = ({ children, mode }) => {
  const [lightPrimaryColor, setLightPrimaryColor] = useState<string>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_LIGHT);
    return stored || DEFAULT_LIGHT_PRIMARY;
  });
  const [darkPrimaryColor, setDarkPrimaryColor] = useState<string>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_DARK);
    return stored || DEFAULT_DARK_PRIMARY;
  });

  const setPrimaryColor = useCallback((color: string, themeMode: 'light' | 'dark') => {
    if (themeMode === 'light') {
      setLightPrimaryColor(color);
      localStorage.setItem(STORAGE_KEY_LIGHT, color);
    } else {
      setDarkPrimaryColor(color);
      localStorage.setItem(STORAGE_KEY_DARK, color);
    }
  }, []);

  const resetPrimaryColor = useCallback((themeMode?: 'light' | 'dark') => {
    if (!themeMode) {
      // Reset both
      setLightPrimaryColor(DEFAULT_LIGHT_PRIMARY);
      setDarkPrimaryColor(DEFAULT_DARK_PRIMARY);
      localStorage.removeItem(STORAGE_KEY_LIGHT);
      localStorage.removeItem(STORAGE_KEY_DARK);
    } else if (themeMode === 'light') {
      setLightPrimaryColor(DEFAULT_LIGHT_PRIMARY);
      localStorage.removeItem(STORAGE_KEY_LIGHT);
    } else {
      setDarkPrimaryColor(DEFAULT_DARK_PRIMARY);
      localStorage.removeItem(STORAGE_KEY_DARK);
    }
  }, []);

  // Create dynamic theme based on current mode
  const dynamicTheme: Theme = useMemo(() => {
    const primaryColor = mode === 'light' ? lightPrimaryColor : darkPrimaryColor;
    const baseTheme = mode === 'light' ? lightTheme : darkTheme;

    return createTheme({
      ...baseTheme,
      palette: {
        ...baseTheme.palette,
        mode,
        primary: {
          main: primaryColor,
          light: adjustColorBrightness(primaryColor, mode === 'light' ? 20 : 30),
          dark: adjustColorBrightness(primaryColor, mode === 'light' ? -20 : -10),
          contrastText: getContrastText(primaryColor),
        },
      },
    });
  }, [lightPrimaryColor, darkPrimaryColor, mode]);

  const contextValue: ThemeColorContextValue = useMemo(
    () => ({
      lightPrimaryColor,
      darkPrimaryColor,
      setPrimaryColor,
      resetPrimaryColor,
    }),
    [lightPrimaryColor, darkPrimaryColor, setPrimaryColor, resetPrimaryColor]
  );

  return (
    <ThemeColorContext.Provider value={contextValue}>
      <MuiThemeProvider theme={dynamicTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeColorContext.Provider>
  );
};

export const useThemeColor = (): ThemeColorContextValue => {
  const context = useContext(ThemeColorContext);
  if (!context) {
    throw new Error('useThemeColor must be used within ThemeColorProvider');
  }
  return context;
};

/**
 * Adjust color brightness (simple implementation)
 * @param color - Hex color string
 * @param amount - Amount to adjust (-100 to 100)
 * @returns Adjusted hex color
 */
function adjustColorBrightness(color: string, amount: number): string {
  // Remove # if present
  const hex = color.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Adjust brightness
  const newR = Math.min(255, Math.max(0, r + amount));
  const newG = Math.min(255, Math.max(0, g + amount));
  const newB = Math.min(255, Math.max(0, b + amount));
  
  // Convert back to hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

/**
 * Get contrast text color (white or black) based on background
 * @param backgroundColor - Hex color string
 * @returns '#fff' or '#000'
 */
function getContrastText(backgroundColor: string): string {
  // Remove # if present
  const hex = backgroundColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate luminance (simplified)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white for dark backgrounds, black for light backgrounds
  return luminance > 0.5 ? '#000' : '#fff';
}
