/**
 * useTheme Hook - Access Theme State and Controls
 * 
 * Feature: 002-modern-ui-redesign
 * Purpose: Convenient hook to access theme context
 * 
 * @see ../../../specs/002-modern-ui-redesign/contracts/theme.ts for type definitions
 */

import { useThemeContext } from '../theme/ThemeProvider';
import type { ThemeContextValue } from '../../../specs/002-modern-ui-redesign/contracts/theme';

/**
 * Hook to access theme state and controls
 * 
 * Provides:
 * - Current theme mode (light/dark/system)
 * - Effective mode (light/dark resolved from system)
 * - System preference
 * - setMode function to change theme
 * - toggleMode function to switch between light/dark
 * - Material-UI theme object
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, setMode, toggleMode, muiTheme } = useTheme();
 *   
 *   return (
 *     <div>
 *       <p>Current mode: {theme.mode}</p>
 *       <p>Effective mode: {theme.effectiveMode}</p>
 *       <button onClick={toggleMode}>Toggle Theme</button>
 *       <button onClick={() => setMode('system')}>Use System</button>
 *     </div>
 *   );
 * }
 * ```
 * 
 * @throws Error if used outside ThemeProvider
 * @returns Theme context value
 */
export function useTheme(): ThemeContextValue {
  return useThemeContext();
}

export default useTheme;
