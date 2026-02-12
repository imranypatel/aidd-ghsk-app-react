/**
 * Dark Theme Configuration
 * 
 * Feature: 002-modern-ui-redesign
 * Purpose: Material-UI theme configuration for dark mode with surface tinting
 * 
 * @see ../../../specs/002-modern-ui-redesign/data-model.md for design specifications
 */

import { createTheme } from '@mui/material/styles';
import type { Theme, ThemeOptions } from '@mui/material/styles';
import {
  colorTokensDark,
  typographyScale,
  getSurfaceTint,
  breakpoints,
  transitions,
  zIndex,
} from './tokens';

/**
 * Dark theme configuration options
 */
const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    
    // Primary color (Light Blue)
    primary: {
      main: colorTokensDark.primary.main,
      light: colorTokensDark.primary.light,
      dark: colorTokensDark.primary.dark,
      contrastText: colorTokensDark.primary.contrastText,
    },
    
    // Secondary color
    secondary: {
      main: colorTokensDark.secondary.main,
      light: colorTokensDark.secondary.light,
      dark: colorTokensDark.secondary.dark,
      contrastText: colorTokensDark.secondary.contrastText,
    },
    
    // Error color (Light Red)
    error: {
      main: colorTokensDark.error.main,
      light: colorTokensDark.error.light,
      dark: colorTokensDark.error.dark,
      contrastText: colorTokensDark.error.contrastText,
    },
    
    // Warning color (Light Orange)
    warning: {
      main: colorTokensDark.warning.main,
      light: colorTokensDark.warning.light,
      dark: colorTokensDark.warning.dark,
      contrastText: colorTokensDark.warning.contrastText,
    },
    
    // Success color (Light Green)
    success: {
      main: colorTokensDark.success.main,
      light: colorTokensDark.success.light,
      dark: colorTokensDark.success.dark,
      contrastText: colorTokensDark.success.contrastText,
    },
    
    // Info color (Light Blue)
    info: {
      main: colorTokensDark.info.main,
      light: colorTokensDark.info.light,
      dark: colorTokensDark.info.dark,
      contrastText: colorTokensDark.info.contrastText,
    },
    
    // Background colors (dark surfaces)
    background: {
      default: colorTokensDark.background.default, // #121212
      paper: colorTokensDark.background.paper,     // #1e1e1e
    },
    
    // Text colors (WCAG AA 4.5:1 contrast minimum on dark)
    text: {
      primary: colorTokensDark.text.primary,
      secondary: colorTokensDark.text.secondary,
      disabled: colorTokensDark.text.disabled,
    },
    
    // Divider color
    divider: colorTokensDark.border.main,
    
    // Action colors (dark mode optimized)
    action: {
      active: 'rgba(255, 255, 255, 0.56)',
      hover: 'rgba(255, 255, 255, 0.08)',
      hoverOpacity: 0.08,
      selected: 'rgba(144, 202, 249, 0.16)', // Primary with 16% opacity
      selectedOpacity: 0.16,
      disabled: 'rgba(255, 255, 255, 0.30)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
      disabledOpacity: 0.38,
      focus: 'rgba(255, 255, 255, 0.12)',
      focusOpacity: 0.12,
      activatedOpacity: 0.24,
    },
  },
  
  // Typography (same as light mode)
  typography: {
    fontFamily: typographyScale.fontFamily,
    
    // Heading variants
    h1: {
      fontSize: typographyScale.h1.fontSize,
      fontWeight: typographyScale.h1.fontWeight,
      lineHeight: typographyScale.h1.lineHeight,
      letterSpacing: typographyScale.h1.letterSpacing,
    },
    h2: {
      fontSize: typographyScale.h2.fontSize,
      fontWeight: typographyScale.h2.fontWeight,
      lineHeight: typographyScale.h2.lineHeight,
      letterSpacing: typographyScale.h2.letterSpacing,
    },
    h3: {
      fontSize: typographyScale.h3.fontSize,
      fontWeight: typographyScale.h3.fontWeight,
      lineHeight: typographyScale.h3.lineHeight,
      letterSpacing: typographyScale.h3.letterSpacing,
    },
    h4: {
      fontSize: typographyScale.h4.fontSize,
      fontWeight: typographyScale.h4.fontWeight,
      lineHeight: typographyScale.h4.lineHeight,
      letterSpacing: typographyScale.h4.letterSpacing,
    },
    h5: {
      fontSize: typographyScale.h5.fontSize,
      fontWeight: typographyScale.h5.fontWeight,
      lineHeight: typographyScale.h5.lineHeight,
      letterSpacing: typographyScale.h5.letterSpacing,
    },
    h6: {
      fontSize: typographyScale.h6.fontSize,
      fontWeight: typographyScale.h6.fontWeight,
      lineHeight: typographyScale.h6.lineHeight,
      letterSpacing: typographyScale.h6.letterSpacing,
    },
    
    // Subtitle variants
    subtitle1: {
      fontSize: typographyScale.subtitle1.fontSize,
      fontWeight: typographyScale.subtitle1.fontWeight,
      lineHeight: typographyScale.subtitle1.lineHeight,
      letterSpacing: typographyScale.subtitle1.letterSpacing,
    },
    subtitle2: {
      fontSize: typographyScale.subtitle2.fontSize,
      fontWeight: typographyScale.subtitle2.fontWeight,
      lineHeight: typographyScale.subtitle2.lineHeight,
      letterSpacing: typographyScale.subtitle2.letterSpacing,
    },
    
    // Body variants
    body1: {
      fontSize: typographyScale.body1.fontSize,
      fontWeight: typographyScale.body1.fontWeight,
      lineHeight: typographyScale.body1.lineHeight,
      letterSpacing: typographyScale.body1.letterSpacing,
    },
    body2: {
      fontSize: typographyScale.body2.fontSize,
      fontWeight: typographyScale.body2.fontWeight,
      lineHeight: typographyScale.body2.lineHeight,
      letterSpacing: typographyScale.body2.letterSpacing,
    },
    
    // Utility variants
    button: {
      fontSize: typographyScale.button.fontSize,
      fontWeight: typographyScale.button.fontWeight,
      lineHeight: typographyScale.button.lineHeight,
      letterSpacing: typographyScale.button.letterSpacing,
      textTransform: typographyScale.button.textTransform,
    },
    caption: {
      fontSize: typographyScale.caption.fontSize,
      fontWeight: typographyScale.caption.fontWeight,
      lineHeight: typographyScale.caption.lineHeight,
      letterSpacing: typographyScale.caption.letterSpacing,
    },
    overline: {
      fontSize: typographyScale.overline.fontSize,
      fontWeight: typographyScale.overline.fontWeight,
      lineHeight: typographyScale.overline.lineHeight,
      letterSpacing: typographyScale.overline.letterSpacing,
      textTransform: typographyScale.overline.textTransform,
    },
  },
  
  // Spacing function (8px base)
  spacing: (factor: number) => `${factor * 8}px`,
  
  // Breakpoints (fixed per Constitution)
  breakpoints: {
    values: {
      xs: 0,
      sm: breakpoints.mobile,   // 768px
      md: breakpoints.tablet,   // 992px
      lg: breakpoints.desktop,  // 1200px
      xl: 1536,
    },
  },
  
  // Shadows (dark mode uses surface tinting instead of shadows)
  shadows: [
    'none', // 0
    'none', // 1 - use surface tint
    'none', // 2 - use surface tint
    'none', // 3 - use surface tint
    'none', // 4 - use surface tint
    'none', // 5 - use surface tint
    'none', // 6 - use surface tint
    'none', // 7 - use surface tint
    'none', // 8 - use surface tint
    'none', // 9 - use surface tint
    'none', // 10 - use surface tint
    'none', // 11 - use surface tint
    'none', // 12 - use surface tint
    'none', // 13 - use surface tint
    'none', // 14 - use surface tint
    'none', // 15 - use surface tint
    'none', // 16 - use surface tint
    'none', // 17 - use surface tint
    'none', // 18 - use surface tint
    'none', // 19 - use surface tint
    'none', // 20 - use surface tint
    'none', // 21 - use surface tint
    'none', // 22 - use surface tint
    'none', // 23 - use surface tint
    'none', // 24 - use surface tint
  ],
  
  // Transitions (same as light mode)
  transitions: {
    duration: {
      shortest: transitions.shortest,
      shorter: transitions.shorter,
      short: transitions.short,
      standard: transitions.standard,
      complex: transitions.complex,
      enteringScreen: transitions.standard,
      leavingScreen: transitions.shorter,
    },
    easing: {
      easeInOut: transitions.easeInOut,
      easeOut: transitions.easeOut,
      easeIn: transitions.easeIn,
      sharp: transitions.sharp,
    },
  },
  
  // Z-index
  zIndex: {
    mobileStepper: zIndex.mobileStepper,
    speedDial: zIndex.speedDial,
    appBar: zIndex.appBar,
    drawer: zIndex.drawer,
    modal: zIndex.modal,
    snackbar: zIndex.snackbar,
    tooltip: zIndex.tooltip,
  },
  
  // Component overrides (dark mode specific)
  components: {
    // Button overrides
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          padding: '8px 16px',
          minHeight: 40,
        },
        contained: {
          // No shadows in dark mode, rely on surface tint
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
            backgroundColor: colorTokensDark.primary.light,
          },
          '&:active': {
            boxShadow: 'none',
            backgroundColor: colorTokensDark.primary.dark,
          },
        },
      },
      defaultProps: {
        disableElevation: true, // Disable shadows in dark mode
      },
    },
    
    // TextField overrides
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: colorTokensDark.border.main,
            },
            '&:hover fieldset': {
              borderColor: colorTokensDark.primary.light,
            },
            '&.Mui-focused fieldset': {
              borderColor: colorTokensDark.primary.main,
            },
          },
          '& .MuiInputBase-input': {
            fontSize: typographyScale.body1.fontSize,
            color: colorTokensDark.text.primary,
          },
        },
      },
      defaultProps: {
        variant: 'outlined',
      },
    },
    
    // Card overrides (surface tinting for elevation)
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${colorTokensDark.border.main}`,
          backgroundColor: colorTokensDark.background.paper,
          backgroundImage: 'none',
          // Apply surface tinting based on elevation prop
          '&[data-elevation="1"]': {
            backgroundColor: colorTokensDark.background.paper,
            backgroundImage: `linear-gradient(${getSurfaceTint(1)}, ${getSurfaceTint(1)})`,
          },
          '&[data-elevation="8"]': {
            backgroundColor: colorTokensDark.background.paper,
            backgroundImage: `linear-gradient(${getSurfaceTint(8)}, ${getSurfaceTint(8)})`,
          },
        },
      },
      defaultProps: {
        elevation: 1,
      },
    },
    
    // Paper overrides (surface tinting)
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: colorTokensDark.background.paper,
        },
        rounded: {
          borderRadius: 8,
        },
        // Surface tinting for elevated papers
        elevation1: {
          backgroundImage: `linear-gradient(${getSurfaceTint(1)}, ${getSurfaceTint(1)})`,
        },
        elevation2: {
          backgroundImage: `linear-gradient(${getSurfaceTint(2)}, ${getSurfaceTint(2)})`,
        },
        elevation4: {
          backgroundImage: `linear-gradient(${getSurfaceTint(4)}, ${getSurfaceTint(4)})`,
        },
        elevation8: {
          backgroundImage: `linear-gradient(${getSurfaceTint(8)}, ${getSurfaceTint(8)})`,
        },
      },
    },
    
    // AppBar overrides (surface tinting)
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colorTokensDark.background.paper,
          backgroundImage: `linear-gradient(${getSurfaceTint(4)}, ${getSurfaceTint(4)})`,
          color: colorTokensDark.text.primary,
        },
      },
      defaultProps: {
        elevation: 0, // Use surface tint instead of shadow
      },
    },
    
    // Drawer overrides (surface tinting)
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${colorTokensDark.border.main}`,
          backgroundColor: colorTokensDark.background.paper,
          backgroundImage: `linear-gradient(${getSurfaceTint(1)}, ${getSurfaceTint(1)})`,
        },
      },
    },
    
    // ListItem overrides (navigation items)
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          marginBottom: 4,
          '&.Mui-selected': {
            backgroundColor: 'rgba(144, 202, 249, 0.16)', // Primary with 16% opacity
            borderLeft: `4px solid ${colorTokensDark.primary.main}`,
            '& .MuiListItemIcon-root': {
              color: colorTokensDark.primary.main,
            },
            '& .MuiListItemText-primary': {
              color: colorTokensDark.primary.main,
              fontWeight: 500,
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
        },
      },
    },
    
    // Icon button overrides
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: 8,
          color: colorTokensDark.text.primary,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
        },
      },
    },
    
    // Tooltip overrides
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'rgba(250, 250, 250, 0.9)', // Light semi-transparent for contrast
          color: '#212529', // Dark text on light background
          fontSize: typographyScale.body2.fontSize,
          padding: '8px 12px',
          borderRadius: 4,
        },
        arrow: {
          color: 'rgba(250, 250, 250, 0.9)',
        },
      },
    },
  },
};

/**
 * Create and export the dark theme
 */
export const darkTheme: Theme = createTheme(darkThemeOptions);

export default darkTheme;
