/**
 * Light Theme Configuration
 * 
 * Feature: 002-modern-ui-redesign
 * Purpose: Material-UI theme configuration for light mode with component overrides
 * 
 * @see ../../../specs/002-modern-ui-redesign/data-model.md for design specifications
 */

import { createTheme } from '@mui/material/styles';
import type { Theme, ThemeOptions } from '@mui/material/styles';
import {
  colorTokensLight,
  typographyScale,
  elevationShadows,
  breakpoints,
  transitions,
  zIndex,
} from './tokens';

/**
 * Light theme configuration options
 */
const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    
    // Primary color (Blue)
    primary: {
      main: colorTokensLight.primary.main,
      light: colorTokensLight.primary.light,
      dark: colorTokensLight.primary.dark,
      contrastText: colorTokensLight.primary.contrastText,
    },
    
    // Secondary color
    secondary: {
      main: colorTokensLight.secondary.main,
      light: colorTokensLight.secondary.light,
      dark: colorTokensLight.secondary.dark,
      contrastText: colorTokensLight.secondary.contrastText,
    },
    
    // Error color (Red)
    error: {
      main: colorTokensLight.error.main,
      light: colorTokensLight.error.light,
      dark: colorTokensLight.error.dark,
      contrastText: colorTokensLight.error.contrastText,
    },
    
    // Warning color (Orange)
    warning: {
      main: colorTokensLight.warning.main,
      light: colorTokensLight.warning.light,
      dark: colorTokensLight.warning.dark,
      contrastText: colorTokensLight.warning.contrastText,
    },
    
    // Success color (Green)
    success: {
      main: colorTokensLight.success.main,
      light: colorTokensLight.success.light,
      dark: colorTokensLight.success.dark,
      contrastText: colorTokensLight.success.contrastText,
    },
    
    // Info color (Light Blue)
    info: {
      main: colorTokensLight.info.main,
      light: colorTokensLight.info.light,
      dark: colorTokensLight.info.dark,
      contrastText: colorTokensLight.info.contrastText,
    },
    
    // Background colors
    background: {
      default: colorTokensLight.background.default,
      paper: colorTokensLight.background.paper,
    },
    
    // Text colors (WCAG AA 4.5:1 contrast minimum)
    text: {
      primary: colorTokensLight.text.primary,
      secondary: colorTokensLight.text.secondary,
      disabled: colorTokensLight.text.disabled,
    },
    
    // Divider color
    divider: colorTokensLight.border.main,
    
    // Action colors (derived from primary)
    action: {
      active: 'rgba(0, 0, 0, 0.54)',
      hover: 'rgba(0, 0, 0, 0.04)',
      hoverOpacity: 0.04,
      selected: 'rgba(25, 118, 210, 0.08)', // Primary with 8% opacity
      selectedOpacity: 0.08,
      disabled: 'rgba(0, 0, 0, 0.26)',
      disabledBackground: 'rgba(0, 0, 0, 0.12)',
      disabledOpacity: 0.38,
      focus: 'rgba(0, 0, 0, 0.12)',
      focusOpacity: 0.12,
      activatedOpacity: 0.12,
    },
  },
  
  // Typography (Roboto font)
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
  
  // Shadows (elevation levels 0-24)
  shadows: [
    'none', // Must be literal 'none' for MUI type compatibility
    elevationShadows[1],
    elevationShadows[2],
    elevationShadows[3],
    elevationShadows[4],
    elevationShadows[4], // 5 not in our scale, use 4
    elevationShadows[6],
    elevationShadows[6], // 7 not in our scale, use 6
    elevationShadows[8],
    elevationShadows[8], // 9-11 not in our scale, use 8
    elevationShadows[8],
    elevationShadows[8],
    elevationShadows[12],
    elevationShadows[12], // 13-15 not in our scale, use 12
    elevationShadows[12],
    elevationShadows[12],
    elevationShadows[16],
    elevationShadows[16], // 17-23 not in our scale, use 16
    elevationShadows[16],
    elevationShadows[16],
    elevationShadows[16],
    elevationShadows[16],
    elevationShadows[16],
    elevationShadows[16],
    elevationShadows[24],
  ] as const,
  
  // Transitions
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
  
  // Component overrides
  components: {
    // Button overrides
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none', // Override uppercase default for better readability
          padding: '8px 16px',
          minHeight: 40,
        },
        contained: {
          boxShadow: elevationShadows[2], // elevation 2
          '&:hover': {
            boxShadow: elevationShadows[4], // elevation 4
          },
          '&:active': {
            boxShadow: elevationShadows[1], // elevation 1
          },
        },
      },
      defaultProps: {
        disableElevation: false,
      },
    },
    
    // TextField overrides
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: colorTokensLight.border.main,
            },
            '&:hover fieldset': {
              borderColor: colorTokensLight.primary.light,
            },
            '&.Mui-focused fieldset': {
              borderColor: colorTokensLight.primary.main,
            },
          },
          '& .MuiInputBase-input': {
            fontSize: typographyScale.body1.fontSize,
          },
        },
      },
      defaultProps: {
        variant: 'outlined',
      },
    },
    
    // Card overrides
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${colorTokensLight.border.light}`,
        },
      },
      defaultProps: {
        elevation: 1,
      },
    },
    
    // Paper overrides
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Disable gradient overlay
        },
        rounded: {
          borderRadius: 8,
        },
      },
    },
    
    // AppBar overrides
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colorTokensLight.primary.main,
          color: colorTokensLight.primary.contrastText,
        },
      },
      defaultProps: {
        elevation: 4,
      },
    },
    
    // Drawer overrides
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${colorTokensLight.border.main}`,
          backgroundColor: colorTokensLight.background.paper,
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
            backgroundColor: 'rgba(25, 118, 210, 0.08)', // Primary with 8% opacity
            borderLeft: `4px solid ${colorTokensLight.primary.main}`,
            '& .MuiListItemIcon-root': {
              color: colorTokensLight.primary.main,
            },
            '& .MuiListItemText-primary': {
              color: colorTokensLight.primary.main,
              fontWeight: 500,
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    
    // Icon button overrides (touch targets)
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: 8,
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    
    // Tooltip overrides
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'rgba(33, 37, 41, 0.9)', // Dark semi-transparent
          fontSize: typographyScale.body2.fontSize,
          padding: '8px 12px',
          borderRadius: 4,
        },
        arrow: {
          color: 'rgba(33, 37, 41, 0.9)',
        },
      },
    },
  },
};

/**
 * Create and export the light theme
 */
export const lightTheme: Theme = createTheme(lightThemeOptions);

export default lightTheme;
