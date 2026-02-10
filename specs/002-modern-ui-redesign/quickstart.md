# Modern UI Redesign - API Documentation & Developer Quickstart

**Feature**: 002-modern-ui-redesign  
**Version**: 1.0.0  
**Created**: 2026-02-10  
**Purpose**: Developer guide for implementing and using the modern UI components

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Getting Started](#getting-started)
4. [Theme System](#theme-system)
5. [Component API](#component-api)
6. [Responsive Utilities](#responsive-utilities)
7. [Custom Hooks](#custom-hooks)
8. [Testing Guide](#testing-guide)
9. [Performance Best Practices](#performance-best-practices)
10. [Accessibility Guidelines](#accessibility-guidelines)
11. [Troubleshooting](#troubleshooting)

---

## Overview

This feature introduces a comprehensive modern UI redesign for the AIDD EMS application, focusing on:

- **Modern Visual Design**: Gradient backgrounds, elevated cards, smooth animations
- **Responsive Layout**: AppBar + Drawer navigation adapting to mobile/tablet/desktop
- **Dark Mode Support**: System-aware light/dark theme with manual toggle
- **Accessibility**: WCAG AA compliance with keyboard navigation and screen reader support
- **Performance**: Optimized animations (<300ms), lazy loading, GPU acceleration

### Key Technologies

- **Material-UI v7.2.0**: Core UI component library
- **Emotion**: CSS-in-JS styling solution
- **React 19.2.4**: Component framework
- **TypeScript 5.x**: Type safety (strict mode)

---

## Architecture

### Directory Structure

```
frontend/src/
├── theme/
│   ├── ThemeProvider.tsx          # Theme context and provider
│   ├── lightTheme.ts              # Light mode configuration
│   ├── darkTheme.ts               # Dark mode configuration
│   ├── tokens.ts                  # Design token definitions
│   └── createTheme.ts             # Theme factory function
│
├── components/
│   ├── layout/
│   │   ├── ProtectedLayout.tsx    # Main authenticated layout wrapper
│   │   ├── AppBarLayout.tsx       # Top navigation bar
│   │   ├── NavigationDrawer.tsx   # Sidebar navigation
│   │   └── UserMenu.tsx           # User profile dropdown
│   │
│   └── theme/
│       └── ThemeToggle.tsx        # Light/dark mode toggle
│
├── hooks/
│   ├── useTheme.ts                # Theme context consumer hook
│   ├── useResponsive.ts           # Responsive state hook
│   ├── useMediaQuery.ts           # Media query matcher hook
│   └── useBreakpoint.ts           # Breakpoint detection hook
│
└── pages/
    ├── LoginPage.tsx              # Redesigned login page
    └── Dashboard.tsx              # Dashboard with new layout
```

### Data Flow

```
┌─────────────────────────────────────────────────────┐
│                   App.tsx (Root)                    │
│  - ThemeProvider wraps entire app                  │
│  - Reads localStorage for theme preference         │
│  - Listens to system preference changes            │
└────────────────┬────────────────────────────────────┘
                 │
                 ├─► Login Route
                 │   └─► LoginPage.tsx (gradient background)
                 │
                 └─► Protected Routes
                     └─► ProtectedLayout (AppBar + Drawer + Content)
                         ├─► AppBarLayout
                         │   ├─► Logo + Title
                         │   ├─► Hamburger menu (mobile)
                         │   └─► UserMenu
                         │       ├─► Avatar
                         │       ├─► ThemeToggle
                         │       └─► Logout
                         │
                         ├─► NavigationDrawer
                         │   ├─► Menu items (from config)
                         │   └─► Active route highlighting
                         │
                         └─► Main Content Area
                             └─► Page components (Dashboard, etc.)
```

---

## Getting Started

### 1. Installation (Already completed in setup)

```bash
# Material-UI dependencies already installed:
# @mui/material@7.2.0
# @emotion/react@^11.11.1
# @emotion/styled@^11.11.0
# @mui/icons-material@^6.2.0
```

### 2. Basic Usage

#### Wrap App with ThemeProvider

```tsx
// src/main.tsx
import { ThemeProvider } from './theme/ThemeProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
```

#### Use ProtectedLayout for Authenticated Pages

```tsx
// src/pages/Dashboard.tsx
import { ProtectedLayout } from '../components/layout/ProtectedLayout';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { themeMode, setThemeMode } = useTheme();
  
  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/settings' },
  ];
  
  return (
    <ProtectedLayout
      title="AIDD EMS"
      menuItems={menuItems}
      currentRoute="/dashboard"
      userInfo={user!}
      onLogout={logout}
      themeMode={themeMode}
      onThemeChange={setThemeMode}
    >
      {/* Your page content here */}
      <h1>Dashboard</h1>
    </ProtectedLayout>
  );
}
```

---

## Theme System

### ThemeProvider API

**Purpose**: Provides theme state and controls to all components

```tsx
interface ThemeContextValue {
  theme: ThemeState;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  muiTheme: ExtendedThemeConfig;
}
```

**Usage**:

```tsx
import { useTheme } from '../hooks/useTheme';

function MyComponent() {
  const { theme, setMode, toggleMode } = useTheme();
  
  return (
    <div>
      <p>Current mode: {theme.mode}</p>
      <p>Effective mode: {theme.effectiveMode}</p>
      <button onClick={toggleMode}>Toggle Theme</button>
      <button onClick={() => setMode('system')}>Use System Preference</button>
    </div>
  );
}
```

### Design Tokens

**Location**: `src/theme/tokens.ts`

**Color Tokens**:

```typescript
// Light Mode
const lightColors = {
  primary: { main: '#1976d2', light: '#42a5f5', dark: '#1565c0' },
  background: { default: '#ffffff', paper: '#ffffff' },
  text: { primary: '#212529', secondary: '#6c757d' },
};

// Dark Mode
const darkColors = {
  primary: { main: '#90caf9', light: '#e3f2fd', dark: '#42a5f5' },
  background: { default: '#121212', paper: '#1e1e1e' },
  text: { primary: '#fafafa', secondary: '#b0b0b0' },
};
```

**Spacing Scale** (8px base):

```typescript
const spacing = [0, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96];

// Usage:
<Box sx={{ padding: theme.spacing(3) }}> {/* 24px */}
```

**Typography Scale**:

```typescript
const typography = {
  h1: { fontSize: '6rem', fontWeight: 300 },
  h5: { fontSize: '1.5rem', fontWeight: 400 },
  body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5 },
};
```

### Theme Customization

**Extend Theme**:

```typescript
// src/theme/customTheme.ts
import { createTheme } from './createTheme';
import { ColorTokens } from '../contracts/theme';

const customColors: ColorTokens = {
  primary: { main: '#00bcd4' }, // Custom cyan
  // ... other colors
};

export const customTheme = createTheme('light', customColors);
```

---

## Component API

### ProtectedLayout

**Purpose**: Main layout wrapper for authenticated pages

**Props**:

```typescript
interface ProtectedLayoutProps {
  children: React.ReactNode;
  title?: string;
  menuItems: MenuItem[];
  currentRoute: string;
  userInfo: UserInfo;
  onLogout: () => void;
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  maxContentWidth?: number;       // Default: 1440
  contentPadding?: number;        // Default: 3 (24px)
  contentClassName?: string;
  loading?: boolean;
}
```

**Example**:

```tsx
<ProtectedLayout
  title="My App"
  menuItems={navigationItems}
  currentRoute={location.pathname}
  userInfo={{ userId: '123', username: 'John Doe' }}
  onLogout={handleLogout}
  themeMode={themeMode}
  onThemeChange={setThemeMode}
  maxContentWidth={1200}
  contentPadding={4}
>
  <YourPageContent />
</ProtectedLayout>
```

---

### AppBarLayout

**Purpose**: Top navigation bar with branding and user menu

**Props**:

```typescript
interface AppBarLayoutProps {
  title: string;
  logoSrc?: string;
  logoAlt?: string;
  userInfo?: UserInfo;
  onMenuClick?: () => void;
  showMenuIcon?: boolean;
  onLogout?: () => void;
  height?: number;            // Default: 64 (desktop), 56 (mobile)
  elevation?: number;         // Default: 4
  themeMode?: ThemeMode;
  onThemeChange?: (mode: ThemeMode) => void;
}
```

**Example**:

```tsx
<AppBarLayout
  title="AIDD EMS"
  logoSrc="/logo.png"
  logoAlt="Company Logo"
  userInfo={user}
  onMenuClick={handleMenuToggle}
  showMenuIcon={isMobile}
  onLogout={handleLogout}
  themeMode={themeMode}
  onThemeChange={setThemeMode}
  elevation={4}
/>
```

---

### NavigationDrawer

**Purpose**: Responsive sidebar navigation

**Props**:

```typescript
interface NavigationDrawerProps {
  open: boolean;
  onClose: () => void;
  variant: 'permanent' | 'persistent' | 'temporary';
  menuItems: MenuItem[];
  activeRoute?: string;
  miniVariant?: boolean;
  width?: number;             // Default: 240
  miniWidth?: number;         // Default: 64
  anchor?: 'left' | 'right';
  onMenuItemClick?: (item: MenuItem) => void;
}
```

**MenuItem Structure**:

```typescript
interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType;
  path: string;
  children?: MenuItem[];      // Nested menus
  disabled?: boolean;
  badge?: number;             // Notification badge
  badgeColor?: 'primary' | 'error' | 'warning';
  tooltip?: string;
}
```

**Example**:

```tsx
const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: DashboardIcon,
    path: '/dashboard',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: SettingsIcon,
    path: '/settings',
    children: [
      { id: 'profile', label: 'Profile', icon: PersonIcon, path: '/settings/profile' },
      { id: 'security', label: 'Security', icon: LockIcon, path: '/settings/security' },
    ],
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: NotificationsIcon,
    path: '/notifications',
    badge: 5,
    badgeColor: 'error',
  },
];

<NavigationDrawer
  open={drawerOpen}
  onClose={handleDrawerClose}
  variant="permanent"
  menuItems={menuItems}
  activeRoute="/dashboard"
  miniVariant={isTablet}
/>
```

---

### UserMenu

**Purpose**: Dropdown menu from user avatar

**Props**:

```typescript
interface UserMenuProps {
  userInfo: UserInfo;
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onLogout: () => void;
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  additionalItems?: UserMenuItem[];
  showThemeToggle?: boolean;    // Default: true
  confirmLogout?: boolean;      // Default: true
}
```

**Example**:

```tsx
const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

<UserMenu
  userInfo={user}
  open={Boolean(anchorEl)}
  anchorEl={anchorEl}
  onClose={() => setAnchorEl(null)}
  onLogout={handleLogout}
  themeMode={themeMode}
  onThemeChange={setThemeMode}
  additionalItems={[
    { id: 'profile', label: 'View Profile', icon: PersonIcon, onClick: () => navigate('/profile') },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, onClick: () => navigate('/settings') },
  ]}
/>
```

---

### ThemeToggle

**Purpose**: Light/dark/system theme mode toggle

**Props**:

```typescript
interface ThemeToggleProps {
  mode: ThemeMode;
  onChange: (mode: ThemeMode) => void;
  showSystemOption?: boolean;     // Default: true
  disabled?: boolean;
  tooltips?: {
    light: string;
    dark: string;
    system: string;
  };
  size?: 'small' | 'medium' | 'large';
}
```

**Example**:

```tsx
<ThemeToggle
  mode={themeMode}
  onChange={setThemeMode}
  showSystemOption={true}
  tooltips={{
    light: 'Switch to light mode',
    dark: 'Switch to dark mode',
    system: 'Use system preference',
  }}
  size="medium"
/>
```

---

## Responsive Utilities

### useResponsive Hook

**Purpose**: Get current responsive state and utilities

```typescript
const { state, matches, utils } = useResponsive();

console.log(state.breakpoint);  // 'mobile' | 'tablet' | 'desktop'
console.log(state.isMobile);    // boolean
console.log(state.isTablet);    // boolean
console.log(state.isDesktop);   // boolean
console.log(state.width);       // viewport width in px

// Utility functions
if (utils.isUp('tablet')) {
  // Viewport ≥ 992px
}

if (utils.isDown('desktop')) {
  // Viewport < 1200px
}

if (utils.isBetween('tablet', 'desktop')) {
  // Viewport between 992px and 1199px
}
```

---

### useMediaQuery Hook

**Purpose**: Match custom media queries

```typescript
const isMobile = useMediaQuery('(max-width: 991px)');
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

if (isMobile) {
  // Show mobile UI
}

if (prefersReducedMotion) {
  // Disable animations
}
```

---

### useBreakpoint Hook

**Purpose**: Get current breakpoint only

```typescript
const { current, is } = useBreakpoint();

console.log(current); // 'mobile' | 'tablet' | 'desktop'

if (is.mobile) {
  // Mobile-specific logic
}
```

---

### Responsive CSS Utilities

**Generate media queries in styled-components**:

```typescript
import { cssMediaQuery, MEDIA_QUERIES } from '../contracts/responsive';

const StyledBox = styled.div`
  padding: 16px;
  
  ${cssMediaQuery('tablet')} {
    padding: 24px;
  }
  
  ${cssMediaQuery('desktop')} {
    padding: 32px;
    max-width: 1440px;
  }
`;
```

**Responsive values**:

```typescript
import { resolveResponsiveValue } from '../contracts/responsive';

const padding = { mobile: 16, tablet: 24, desktop: 32 };
const currentPadding = resolveResponsiveValue(padding, currentBreakpoint);
```

---

## Custom Hooks

### useTheme

**Purpose**: Access theme state and controls

```typescript
import { useTheme } from '../hooks/useTheme';

function MyComponent() {
  const { theme, setMode, toggleMode, muiTheme } = useTheme();
  
  return (
    <Box sx={{ backgroundColor: muiTheme.palette.background.default }}>
      <Typography>Current mode: {theme.effectiveMode}</Typography>
      <Button onClick={toggleMode}>Toggle Theme</Button>
    </Box>
  );
}
```

---

### useResponsive

**Purpose**: Track viewport size and breakpoints

```typescript
import { useResponsive } from '../hooks/useResponsive';

function MyComponent() {
  const { state, utils } = useResponsive();
  
  const showDrawer = utils.isUp('tablet'); // Show drawer on tablet+
  const columns = state.isDesktop ? 3 : state.isTablet ? 2 : 1;
  
  return (
    <Grid container columns={columns}>
      {/* Grid content */}
    </Grid>
  );
}
```

---

## Testing Guide

### Unit Testing Components

**Test theme toggle**:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';

test('toggles between light and dark mode', () => {
  const onChange = jest.fn();
  render(<ThemeToggle mode="light" onChange={onChange} />);
  
  const button = screen.getByRole('button');
  fireEvent.click(button);
  
  expect(onChange).toHaveBeenCalledWith('dark');
});
```

**Test responsive behavior**:

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useResponsive } from '../hooks/useResponsive';

test('detects mobile breakpoint', () => {
  global.innerWidth = 800;
  global.dispatchEvent(new Event('resize'));
  
  const { result } = renderHook(() => useResponsive());
  
  expect(result.current.state.isMobile).toBe(true);
  expect(result.current.state.breakpoint).toBe('mobile');
});
```

---

### E2E Testing (Playwright)

**Test drawer navigation**:

```typescript
import { test, expect } from '@playwright/test';

test('drawer navigation works on desktop', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Desktop: Drawer is permanent
  await expect(page.locator('[data-testid="navigation-drawer"]')).toBeVisible();
  
  // Click menu item
  await page.click('text=Settings');
  await expect(page).toHaveURL('/settings');
});

test('drawer navigation works on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/dashboard');
  
  // Mobile: Drawer is temporary (hidden initially)
  await expect(page.locator('[data-testid="navigation-drawer"]')).not.toBeVisible();
  
  // Open drawer via hamburger menu
  await page.click('[data-testid="menu-button"]');
  await expect(page.locator('[data-testid="navigation-drawer"]')).toBeVisible();
});
```

**Test theme toggle**:

```typescript
test('theme toggle changes appearance', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Get initial background color (light mode)
  const lightBg = await page.evaluate(() => {
    return window.getComputedStyle(document.body).backgroundColor;
  });
  
  // Toggle to dark mode
  await page.click('[data-testid="theme-toggle"]');
  
  // Wait for theme transition
  await page.waitForTimeout(300);
  
  const darkBg = await page.evaluate(() => {
    return window.getComputedStyle(document.body).backgroundColor;
  });
  
  expect(lightBg).not.toBe(darkBg);
});
```

---

## Performance Best Practices

### 1. Memoize Components

```typescript
import React, { memo } from 'react';

export const NavigationDrawer = memo(function NavigationDrawer(props: NavigationDrawerProps) {
  // Component implementation
});
```

### 2. Use useCallback for Event Handlers

```typescript
import { useCallback } from 'react';

const handleMenuClick = useCallback((item: MenuItem) => {
  navigate(item.path);
}, [navigate]);
```

### 3. Lazy Load Heavy Components

```typescript
import { lazy, Suspense } from 'react';

const UserMenu = lazy(() => import('../components/layout/UserMenu'));

function AppBar() {
  return (
    <Suspense fallback={<CircularProgress />}>
      <UserMenu {...props} />
    </Suspense>
  );
}
```

### 4. Optimize Animations

```typescript
// GPU-accelerated animations (transform, opacity only)
const animatedStyle = {
  transform: 'translateX(0)',
  opacity: 1,
  transition: 'transform 300ms ease-out, opacity 300ms ease-out',
};

// Avoid animating: width, height, left, right, top, bottom, margin, padding
```

### 5. Debounce Resize Listeners

```typescript
import { debounce } from '../contracts/responsive';

useEffect(() => {
  const handleResize = debounce(() => {
    setDimensions(getViewportDimensions());
  }, 150);
  
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

---

## Accessibility Guidelines

### 1. Keyboard Navigation

**All interactive elements must be keyboard accessible**:

```tsx
<MenuItem
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
/>
```

### 2. ARIA Labels

**Provide descriptive labels for assistive technologies**:

```tsx
<IconButton
  aria-label="Open navigation menu"
  onClick={handleMenuOpen}
>
  <MenuIcon />
</IconButton>

<Drawer
  aria-label="Main navigation"
  aria-hidden={!open}
>
  {/* Drawer content */}
</Drawer>
```

### 3. Focus Management

**Trap focus in modals/drawers when open**:

```tsx
import { FocusTrap } from '@mui/material';

<FocusTrap open={drawerOpen}>
  <Drawer open={drawerOpen}>
    {/* Drawer content */}
  </Drawer>
</FocusTrap>
```

### 4. Color Contrast

**Ensure WCAG AA contrast ratios**:
- Body text (16px): ≥4.5:1
- Large text (≥18px): ≥3:1
- UI components: ≥3:1

**Test with browser dev tools**: Chrome DevTools > Accessibility panel

### 5. Screen Reader Announcements

**Announce navigation changes**:

```tsx
import { useEffect } from 'react';

useEffect(() => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.textContent = `Navigated to ${pageTitle}`;
  document.body.appendChild(announcement);
  
  setTimeout(() => document.body.removeChild(announcement), 1000);
}, [location.pathname]);
```

---

## Troubleshooting

### Issue: Theme not persisting on page reload

**Solution**: Check localStorage implementation

```typescript
// Ensure theme mode is saved to localStorage
useEffect(() => {
  localStorage.setItem('theme-mode', themeMode);
}, [themeMode]);
```

---

### Issue: Drawer not responding to breakpoint changes

**Solution**: Ensure resize listener is active

```typescript
useEffect(() => {
  const handleResize = () => {
    const newBreakpoint = getCurrentBreakpoint(window.innerWidth);
    setBreakpoint(newBreakpoint);
  };
  
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

---

### Issue: Animations jittery or slow

**Solution**: Use GPU-accelerated properties

```css
/* ✅ Good: GPU-accelerated */
transform: translateX(240px);
opacity: 1;

/* ❌ Bad: Forces layout recalculation */
left: 240px;
width: 240px;
```

---

### Issue: Dark mode colors not applying

**Solution**: Verify theme mode resolution

```typescript
// Check effective mode calculation
const effectiveMode = mode === 'system'
  ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  : mode;
```

---

### Issue: Menu items not highlighting active route

**Solution**: Ensure exact path matching

```typescript
const isActive = (itemPath: string) => {
  // Exact match for root routes
  if (itemPath === '/') {
    return currentRoute === '/';
  }
  // Prefix match for nested routes
  return currentRoute.startsWith(itemPath);
};
```

---

## Additional Resources

### Official Documentation

- [Material-UI v7 Documentation](https://mui.com/material-ui/)
- [Emotion Documentation](https://emotion.sh/docs/introduction)
- [React 19 Documentation](https://react.dev/)

### Internal References

- [Feature Specification](./spec.md) - Requirements and user stories
- [Data Model](./data-model.md) - Schema definitions
- [Type Contracts](./contracts/) - TypeScript interfaces
- [Implementation Plan](./plan.md) - Phased development roadmap

### Constitution Compliance

- **Section VIII: Enterprise UI/UX Standards** - All design decisions align with constitution requirements
- **Section XIII: Quality Assurance** - TDD approach, Phase 6 quality gates
- **Section XIV: Code Organization** - Absolute paths, modular structure

---

## Support

For questions or issues, refer to:

1. Check [Troubleshooting](#troubleshooting) section
2. Review [data-model.md](./data-model.md) for detailed schemas
3. Consult [spec.md](./spec.md) for requirements clarification
4. Check [plan.md](./plan.md) for implementation guidance

**Version**: 1.0.0  
**Last Updated**: 2026-02-10  
**Maintainer**: Development Team
