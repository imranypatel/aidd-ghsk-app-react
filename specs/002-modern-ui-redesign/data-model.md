# Data Model: Modern UI Redesign

**Feature**: 002-modern-ui-redesign  
**Created**: 2026-02-10  
**Purpose**: Define data structures for theme configuration, component props, and design tokens

## Theme Token Schema

### Design Token Structure

Design tokens are the atomic design decisions that define the visual language of the application. All UI components reference these tokens for consistency.

```typescript
interface DesignTokens {
  colors: ColorTokens;
  spacing: SpacingScale;
  typography: TypographyScale;
  elevation: ElevationScale;
  breakpoints: BreakpointValues;
  transitions: TransitionDurations;
  zIndex: ZIndexScale;
}
```

### Color Tokens

**Primary Palette** - Main brand colors used for primary actions and active states:
```typescript
interface PrimaryColor {
  main: string;      // #1976d2 (light) / #90caf9 (dark)
  light: string;     // #42a5f5 (light) / #e3f2fd (dark)
  dark: string;      // #1565c0 (light) / #42a5f5 (dark)
  contrastText: string; // #ffffff (light) / #000000 (dark)
}
```

**Semantic Colors** - Color meanings for system feedback:
```typescript
interface SemanticColors {
  error: {
    main: string;    // #d32f2f (light) / #f44336 (dark)
    light: string;   // #ef5350
    dark: string;    // #c62828
    contrastText: string; // #ffffff
  };
  warning: {
    main: string;    // #f57c00 (light) / #ffa726 (dark)
    light: string;   // #ff9800
    dark: string;    // #ef6c00
    contrastText: string; // #000000 (light) / #000000 (dark)
  };
  success: {
    main: string;    // #388e3c (light) / #66bb6a (dark)
    light: string;   // #4caf50
    dark: string;    // #2e7d32
    contrastText: string; // #ffffff
  };
  info: {
    main: string;    // #0288d1 (light) / #29b6f6 (dark)
    light: string;   // #03a9f4
    dark: string;    // #01579b
    contrastText: string; // #ffffff
  };
}
```

**Background Colors**:
```typescript
interface BackgroundColors {
  default: string;   // #ffffff (light) / #121212 (dark)
  paper: string;     // #ffffff (light) / #1e1e1e (dark)
  elevated: string;  // #f8f9fa (light) / #1e1e1e with elevation tint (dark)
}
```

**Text Colors** - Ensuring WCAG AA contrast ratios:
```typescript
interface TextColors {
  primary: string;      // #212529 (light) / #fafafa (dark) - Contrast 4.5:1 minimum
  secondary: string;    // #6c757d (light) / #b0b0b0 (dark) - Contrast 4.5:1 minimum
  disabled: string;     // #9e9e9e (light) / #616161 (dark)
}
```

**Border Colors**:
```typescript
interface BorderColors {
  main: string;      // #e0e0e0 (light) / #424242 (dark)
  light: string;     // #f5f5f5 (light) / #333333 (dark)
}
```

### Spacing Scale

**8px Base System** - All spacing values are multiples of 8px:
```typescript
type SpacingScale = [0, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96];

// Usage examples:
// spacing[0] = 0px   - No spacing
// spacing[1] = 8px   - Minimal gap between inline elements
// spacing[2] = 16px  - Standard padding for compact components
// spacing[3] = 24px  - Standard padding for cards
// spacing[4] = 32px  - Section separation
// spacing[6] = 48px  - Major section separation
// spacing[8] = 64px  - Page header height (AppBar on mobile)
// spacing[12] = 96px - Large spacing for visual breaks
```

### Typography Scale

**Roboto Font Family** - Default Material Design font:
```typescript
interface TypographyScale {
  fontFamily: string; // 'Roboto, Arial, sans-serif'
  
  h1: TypographyVariant;  // 96px, light (300), -1.5px letter-spacing
  h2: TypographyVariant;  // 60px, light (300), -0.5px letter-spacing
  h3: TypographyVariant;  // 48px, regular (400), 0px letter-spacing
  h4: TypographyVariant;  // 34px, regular (400), 0.25px letter-spacing
  h5: TypographyVariant;  // 24px, regular (400), 0px letter-spacing
  h6: TypographyVariant;  // 20px, medium (500), 0.15px letter-spacing
  
  subtitle1: TypographyVariant; // 16px, regular (400), 0.15px letter-spacing
  subtitle2: TypographyVariant; // 14px, medium (500), 0.1px letter-spacing
  
  body1: TypographyVariant;     // 16px, regular (400), 0.5px letter-spacing, 1.5 line-height
  body2: TypographyVariant;     // 14px, regular (400), 0.25px letter-spacing, 1.43 line-height
  
  button: TypographyVariant;    // 14px, medium (500), 0.4px letter-spacing, uppercase
  caption: TypographyVariant;   // 12px, regular (400), 0.4px letter-spacing
  overline: TypographyVariant;  // 10px, regular (400), 1.5px letter-spacing, uppercase
}

interface TypographyVariant {
  fontSize: string;        // rem units for accessibility
  fontWeight: number;      // 300 (light), 400 (regular), 500 (medium), 600 (semi-bold)
  lineHeight: number;      // 1.2-1.5 for headings, 1.5 for body
  letterSpacing: string;   // px units, negative for large text
  textTransform?: string;  // 'uppercase' for button/overline
}
```

### Elevation Scale

**Shadow Depth Levels** - Material Design elevation system:
```typescript
type ElevationScale = [0, 1, 2, 3, 4, 6, 8, 12, 16, 24];

// Shadow values (light mode):
// 0: none
// 1: 0px 1px 3px rgba(0,0,0,0.12), 0px 1px 2px rgba(0,0,0,0.06)  - Cards, surfaces
// 2: 0px 1px 5px rgba(0,0,0,0.12), 0px 2px 2px rgba(0,0,0,0.08)  - Raised buttons
// 3: 0px 1px 8px rgba(0,0,0,0.12), 0px 3px 4px rgba(0,0,0,0.10)  - App bar (resting)
// 4: 0px 2px 8px rgba(0,0,0,0.12), 0px 4px 4px rgba(0,0,0,0.10)  - App bar (scrolled)
// 6: 0px 3px 12px rgba(0,0,0,0.12), 0px 6px 6px rgba(0,0,0,0.10) - Floating action button
// 8: 0px 4px 16px rgba(0,0,0,0.16), 0px 8px 8px rgba(0,0,0,0.12) - Login card, drawer
// 12: 0px 6px 24px rgba(0,0,0,0.16), 0px 12px 12px rgba(0,0,0,0.12) - Dialogs
// 16: 0px 8px 32px rgba(0,0,0,0.16), 0px 16px 16px rgba(0,0,0,0.12) - Navigation drawer
// 24: 0px 12px 48px rgba(0,0,0,0.20), 0px 24px 24px rgba(0,0,0,0.14) - Maximum elevation

// Dark mode: Elevation implemented via surface tinting (5% white overlay per level)
// instead of shadows for better contrast
```

### Breakpoint Values

**Responsive Breakpoints** - Fixed per Constitution Section VIII:
```typescript
interface BreakpointValues {
  mobile: number;   // 768px  - Minimum supported viewport width
  tablet: number;   // 992px  - Tablet devices, mini sidebar variant
  desktop: number;  // 1200px - Desktop devices, full sidebar
}

// Media query usage:
// @media (min-width: 768px)  - Mobile and above
// @media (min-width: 992px)  - Tablet and above
// @media (min-width: 1200px) - Desktop only
```

### Transition Durations

**Animation Timing** - Constitution Section VIII limits (max 300ms):
```typescript
interface TransitionDurations {
  shortest: number;  // 150ms - Micro-interactions (checkbox, switch)
  shorter: number;   // 200ms - Small animations (button hover, ripple)
  short: number;     // 250ms - Medium animations (tooltip, snackbar)
  standard: number;  // 300ms - Standard animations (drawer, dialog)
  complex: number;   // 375ms - ONLY for multi-step animations (error shake) - RARE
  
  // Easing functions:
  easeInOut: string; // 'cubic-bezier(0.4, 0, 0.2, 1)' - State changes
  easeOut: string;   // 'cubic-bezier(0.0, 0, 0.2, 1)' - Entrances
  easeIn: string;    // 'cubic-bezier(0.4, 0, 1, 1)'    - Exits
  sharp: string;     // 'cubic-bezier(0.4, 0, 0.6, 1)'  - Temporary elements
}
```

### Z-Index Scale

**Stacking Order** - Material-UI default scale:
```typescript
interface ZIndexScale {
  mobileStepper: number;  // 1000
  speedDial: number;      // 1050
  appBar: number;         // 1100
  drawer: number;         // 1200
  modal: number;          // 1300
  snackbar: number;       // 1400
  tooltip: number;        // 1500
}

// Usage:
// AppBar: zIndex 1100 (persistent, above content)
// Drawer: zIndex 1200 (above AppBar when temporary)
// Modal/Dialog: zIndex 1300 (blocks all interaction)
```

---

## Component Interfaces

### ThemeToggle Component

**Purpose**: Toggle switch for light/dark/system theme modes

```typescript
interface ThemeToggleProps {
  /** Current theme mode */
  mode: ThemeMode;
  
  /** Callback when theme mode changes */
  onChange: (mode: ThemeMode) => void;
  
  /** Whether to show system preference option */
  showSystemOption?: boolean; // Default: true
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Tooltip text for each mode */
  tooltips?: {
    light: string;
    dark: string;
    system: string;
  };
  
  /** Icon size */
  size?: 'small' | 'medium' | 'large'; // Default: 'medium'
  
  /** Additional CSS class */
  className?: string;
}

type ThemeMode = 'light' | 'dark' | 'system';
```

**State Management**:
- Stores selected mode in `localStorage` key: `theme-mode`
- Listens to system preference change via `matchMedia('(prefers-color-scheme: dark)')`
- Emits change event when user toggles or system preference changes

### NavigationDrawer Component

**Purpose**: Responsive sidebar navigation with collapsible behavior

```typescript
interface NavigationDrawerProps {
  /** Whether drawer is open (controlled) */
  open: boolean;
  
  /** Callback when drawer should close */
  onClose: () => void;
  
  /** Drawer variant based on viewport */
  variant: 'permanent' | 'persistent' | 'temporary';
  
  /** Menu items to display */
  menuItems: MenuItem[];
  
  /** Currently active route path */
  activeRoute?: string;
  
  /** Whether to show in mini variant (icons only) */
  miniVariant?: boolean;
  
  /** Width when expanded */
  width?: number; // Default: 240
  
  /** Width when mini */
  miniWidth?: number; // Default: 64
  
  /** Drawer anchor side */
  anchor?: 'left' | 'right'; // Default: 'left'
  
  /** Additional CSS class */
  className?: string;
}

interface MenuItem {
  /** Unique identifier */
  id: string;
  
  /** Display label */
  label: string;
  
  /** Material-UI icon component */
  icon: React.ComponentType;
  
  /** Route path for navigation */
  path: string;
  
  /** Nested menu items */
  children?: MenuItem[];
  
  /** Whether item is disabled */
  disabled?: boolean;
  
  /** Badge count (for notifications) */
  badge?: number;
}
```

**Responsive Behavior**:
- Desktop (≥1200px): `variant="permanent"`, `miniVariant=false` (always visible, expanded)
- Tablet (≥992px): `variant="permanent"`, `miniVariant=true` (always visible, collapsed, expands on hover)
- Mobile (≥768px): `variant="temporary"`, opens on hamburger menu click, overlays content

### AppBarLayout Component

**Purpose**: Top navigation bar with branding and user actions

```typescript
interface AppBarLayoutProps {
  /** Application title/name */
  title: string;
  
  /** Logo image source (optional) */
  logoSrc?: string;
  
  /** Logo alt text */
  logoAlt?: string;
  
  /** User information for profile display */
  userInfo?: UserInfo;
  
  /** Callback when hamburger menu clicked (mobile) */
  onMenuClick?: () => void;
  
  /** Whether to show hamburger menu icon */
  showMenuIcon?: boolean;
  
  /** Callback when logout clicked */
  onLogout?: () => void;
  
  /** Whether to show search bar (future) */
  showSearch?: boolean; // Default: false (reserved for future)
  
  /** AppBar height */
  height?: number; // Default: 64 (desktop), 56 (mobile)
  
  /** Elevation level */
  elevation?: number; // Default: 4
  
  /** Additional CSS class */
  className?: string;
}

interface UserInfo {
  /** Username to display */
  username: string;
  
  /** User ID (for avatar fallback) */
  userId: string;
  
  /** Avatar image URL (optional) */
  avatar?: string;
  
  /** User role (optional, for display) */
  role?: string;
}
```

**Layout Structure**:
- Left section: Hamburger menu (mobile only) + Logo + Title
- Center section: Reserved for global search (future phase)
- Right section: Notification icon (future) + User profile dropdown

### UserMenu Component

**Purpose**: Dropdown menu from user avatar showing profile actions

```typescript
interface UserMenuProps {
  /** User information */
  userInfo: UserInfo;
  
  /** Whether menu is open (controlled) */
  open: boolean;
  
  /** Anchor element for menu positioning */
  anchorEl: HTMLElement | null;
  
  /** Callback when menu should close */
  onClose: () => void;
  
  /** Callback when logout clicked */
  onLogout: () => void;
  
  /** Current theme mode */
  themeMode: ThemeMode;
  
  /** Callback when theme mode changes */
  onThemeChange: (mode: ThemeMode) => void;
  
  /** Additional menu items (future: profile, settings) */
  additionalItems?: UserMenuItem[];
  
  /** Whether to show theme toggle in menu */
  showThemeToggle?: boolean; // Default: true
  
  /** Additional CSS class */
  className?: string;
}

interface UserMenuItem {
  /** Unique identifier */
  id: string;
  
  /** Display label */
  label: string;
  
  /** Icon component */
  icon?: React.ComponentType;
  
  /** Click handler */
  onClick: () => void;
  
  /** Whether item is disabled */
  disabled?: boolean;
  
  /** Divider after this item */
  divider?: boolean;
}
```

**Menu Structure**:
1. User info header (avatar, username, role)
2. Theme toggle switch (light/dark/system)
3. Divider
4. Profile settings (future, placeholder)
5. Preferences (future, placeholder)
6. Divider
7. Logout button (with confirmation)

### ProtectedLayout Component

**Purpose**: Wrapper combining AppBar + Drawer + main content for authenticated pages

```typescript
interface ProtectedLayoutProps {
  /** Child components (page content) */
  children: React.ReactNode;
  
  /** Page title for AppBar */
  title?: string; // Default: "AIDD EMS"
  
  /** Menu items for navigation drawer */
  menuItems: MenuItem[];
  
  /** Current route path for active highlighting */
  currentRoute: string;
  
  /** User information from AuthContext */
  userInfo: UserInfo;
  
  /** Logout handler from AuthContext */
  onLogout: () => void;
  
  /** Theme mode from theme context */
  themeMode: ThemeMode;
  
  /** Theme change handler */
  onThemeChange: (mode: ThemeMode) => void;
  
  /** Whether to show breadcrumbs (future) */
  showBreadcrumbs?: boolean; // Default: false
  
  /** Additional CSS class for main content area */
  contentClassName?: string;
}
```

**Layout Composition**:
- AppBarLayout (fixed top, height 64px)
- NavigationDrawer (responsive: permanent/persistent/temporary)
- Main content area (padding, max-width 1440px, centered)
- Responsive behavior managed internally

---

## Theme Configuration Structure

### Light Theme Configuration

```typescript
interface LightThemeConfig {
  palette: {
    mode: 'light';
    primary: PrimaryColor;
    secondary: SecondaryColor;
    error: SemanticColors['error'];
    warning: SemanticColors['warning'];
    success: SemanticColors['success'];
    info: SemanticColors['info'];
    background: {
      default: '#ffffff';
      paper: '#ffffff';
    };
    text: {
      primary: '#212529';      // Contrast 12.63:1 on white
      secondary: '#6c757d';    // Contrast 4.54:1 on white (WCAG AA)
      disabled: '#9e9e9e';
    };
  };
  
  // Component style overrides (MUI theming)
  components: {
    MuiButton: ComponentStyleOverride;
    MuiTextField: ComponentStyleOverride;
    MuiCard: ComponentStyleOverride;
    MuiAppBar: ComponentStyleOverride;
    MuiDrawer: ComponentStyleOverride;
    // ... (20+ component overrides)
  };
}
```

### Dark Theme Configuration

```typescript
interface DarkThemeConfig {
  palette: {
    mode: 'dark';
    primary: {
      main: '#90caf9';         // Lighter for dark background
      light: '#e3f2fd';
      dark: '#42a5f5';
      contrastText: '#000000'; // Dark text on light primary
    };
    background: {
      default: '#121212';      // Material Design dark surface
      paper: '#1e1e1e';        // Elevated surface
    };
    text: {
      primary: '#fafafa';      // Contrast 11.85:1 on #121212
      secondary: '#b0b0b0';    // Contrast 4.62:1 on #121212 (WCAG AA)
      disabled: '#616161';
    };
  };
  
  // Dark mode uses elevation tinting instead of shadows
  // 5% white overlay per elevation level
}
```

### Component Style Overrides

**Example: MuiButton Customization**
```typescript
MuiButton: {
  styleOverrides: {
    root: {
      borderRadius: '8px',           // Rounded corners (modern)
      textTransform: 'none',         // No uppercase (more readable)
      fontWeight: 500,               // Medium weight
      padding: '8px 16px',           // Comfortable touch targets
      transition: 'all 200ms ease-out', // Smooth hover
    },
    contained: {
      boxShadow: '0px 2px 4px rgba(0,0,0,0.1)', // Subtle depth
      '&:hover': {
        boxShadow: '0px 4px 8px rgba(0,0,0,0.15)', // Lift on hover
        transform: 'translateY(-1px)', // Subtle lift
      },
      '&:active': {
        boxShadow: '0px 1px 2px rgba(0,0,0,0.1)', // Press down
        transform: 'translateY(0)',
      },
    },
  },
  defaultProps: {
    disableElevation: false, // Keep elevation for depth
  },
}
```

---

## Responsive Behavior Schema

### Breakpoint Matching Logic

```typescript
interface ResponsiveState {
  /** Current breakpoint */
  breakpoint: 'mobile' | 'tablet' | 'desktop';
  
  /** Viewport width in pixels */
  width: number;
  
  /** Viewport height in pixels */
  height: number;
  
  /** Whether viewport is mobile-sized */
  isMobile: boolean;  // width >= 768px && width < 992px
  
  /** Whether viewport is tablet-sized */
  isTablet: boolean;  // width >= 992px && width < 1200px
  
  /** Whether viewport is desktop-sized */
  isDesktop: boolean; // width >= 1200px
  
  /** Orientation (mobile/tablet) */
  orientation?: 'portrait' | 'landscape';
}
```

### Layout Responsive Mappings

| Component | Desktop (≥1200px) | Tablet (≥992px) | Mobile (≥768px) |
|-----------|-------------------|-----------------|-----------------|
| **AppBar Height** | 64px | 64px | 56px |
| **Sidebar Variant** | permanent | permanent | temporary |
| **Sidebar Width** | 240px (expanded) | 64px (mini, hover expands) | Full width overlay |
| **Content Padding** | 24px | 24px | 16px |
| **Content Max-Width** | 1440px centered | 100% | 100% |
| **Grid Columns** | 3-4 columns | 2-3 columns | 1 column |
| **Button Size** | medium | medium | medium (48px min height) |
| **Touch Targets** | 44x44px min | 44x44px min | 48x48px recommended |

---

## State Management

### Theme State

**Storage**: `localStorage` key `theme-mode`  
**Values**: `'light' | 'dark' | 'system'`  
**Default**: `'system'` (sync with OS preference)

```typescript
interface ThemeState {
  mode: ThemeMode;
  effectiveMode: 'light' | 'dark'; // Resolved mode (system preference applied)
  systemPreference: 'light' | 'dark'; // OS preference
}
```

### Navigation State

**Storage**: Component state (not persisted)  
**Tracks**: Drawer open/close, active route, menu expansion

```typescript
interface NavigationState {
  drawerOpen: boolean;
  activeRoute: string;
  expandedMenuItems: string[]; // IDs of expanded nested menus
}
```

### User Session State

**Source**: AuthContext (existing from 001-user-login-logout)  
**No changes required** - UI components consume existing context

```typescript
// Existing from AuthContext - no modifications
interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  loading: boolean;
}
```

---

## Data Flow

### Theme Toggle Flow

1. User clicks theme toggle → `ThemeToggle.onChange(mode)`
2. Update `localStorage.setItem('theme-mode', mode)`
3. If mode === 'system', read `matchMedia('(prefers-color-scheme: dark)').matches`
4. Apply effective mode to theme → `ThemeProvider` re-renders
5. All components receive new theme via `useTheme()` hook

### Navigation Flow

1. User clicks menu item → `NavigationDrawer` calls `navigate(path)` (React Router)
2. Route changes → `ProtectedLayout` receives new `currentRoute` prop
3. Active menu item highlights → `MenuItem.path === currentRoute` check
4. Breadcrumbs update (future phase)

### Authentication Flow (Existing)

1. User submits login → `AuthContext.login()` (existing, unchanged)
2. Success → Navigate to `/dashboard`
3. Dashboard mounts → `ProtectedLayout` wraps content
4. `ProtectedLayout` reads `user` from `AuthContext`
5. Displays user info in `AppBarLayout` → `UserMenu`

---

## Validation Rules

### Design Token Constraints

**Color Contrast** (WCAG AA):
- Body text (16px): Minimum 4.5:1 contrast ratio
- Large text (≥18px or ≥14px bold): Minimum 3:1 contrast ratio
- UI components (borders, icons): Minimum 3:1 contrast ratio

**Spacing Adherence**:
- All component padding/margins MUST use spacing scale values (multiples of 8px)
- Exception: 1-2px borders (not subject to 8px rule)

**Typography Sizes**:
- Minimum body text: 16px (1rem)
- Maximum heading: 96px (6rem) - h1
- Line height: 1.5 for body text, 1.2-1.4 for headings

**Animation Durations**:
- Maximum: 300ms (constitution limit)
- Exception: Multi-step animations (e.g., error shake) up to 375ms - RARE
- Reduced motion: 0ms or 50ms maximum

**Touch Targets**:
- Mobile minimum: 44x44px (WCAG 2.1 Level AAA)
- Recommended: 48x48px (Material Design guideline)

### Component Prop Validation

All component props include runtime validation (TypeScript + PropTypes):
- Required props: Non-null checks
- Enum props: Value whitelist validation
- Numeric props: Range validation (e.g., `elevation: 0-24`)
- Callback props: Function type checks

---

## Performance Considerations

### Bundle Size Impact

**New Dependencies**: ~50KB increase (Material-UI icons tree-shaken)
**Theme Configuration**: ~5KB (design tokens + overrides)
**Component Code**: ~30KB (all new layout components)

**Total Estimated**: +85KB minified, +25KB gzipped

### Rendering Optimization

**Theme Provider**: Single top-level provider, no nested providers
**Component Memoization**: Use `React.memo()` for NavigationDrawer, AppBarLayout
**Event Handlers**: Use `useCallback()` to prevent re-renders
**CSS-in-JS**: Emotion styles cached, reused across re-renders

### Animation Performance

**GPU Acceleration**: Only animate `transform` and `opacity`
**Will-Change**: Applied to drawer, modal, tooltip (temporary elements)
**RAF Scheduling**: Theme toggle color transition uses `requestAnimationFrame`

---

**Data Model Status**: ✅ Complete - Ready for contract generation (Phase 1 CT001-CT003)
