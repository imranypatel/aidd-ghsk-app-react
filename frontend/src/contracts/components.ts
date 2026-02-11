/**
 * Component Type Definitions and Interfaces
 * 
 * Feature: 002-modern-ui-redesign
 * Purpose: TypeScript interfaces for layout components (AppBar, Drawer, UserMenu, etc.)
 * 
 * @see ../data-model.md for detailed component schema documentation
 */

// React namespace for type references (no runtime dependency)
declare namespace React {
  export type ComponentType<P = {}> = (props: P) => any;
  export type CSSProperties = Record<string, any>;
  export type ReactNode = any;
}

import type { ThemeMode } from './theme.js';

// ============================================================================
// User Information Types
// ============================================================================

/**
 * User information for display in navigation and profile
 */
export interface UserInfo {
  /** Unique user identifier */
  userId: string;
  /** Display name (username or full name) */
  username: string;
  /** User avatar image URL (optional, uses initials fallback if not provided) */
  avatar?: string;
  /** User role or job title (optional, displayed in profile dropdown) */
  role?: string;
  /** User email (optional, for profile display) */
  email?: string;
}

// ============================================================================
// Navigation Menu Types
// ============================================================================

/**
 * Navigation menu item structure
 * Supports single-level and nested hierarchies
 */
export interface MenuItem {
  /** Unique identifier for the menu item */
  id: string;
  /** Display label shown in the menu */
  label: string;
  /** Material-UI icon component (e.g., DashboardIcon, SettingsIcon) */
  icon: React.ComponentType<{ className?: string; fontSize?: 'small' | 'medium' | 'large' }>;
  /** Route path for React Router navigation */
  path: string;
  /** Nested child menu items (optional, for expandable menus) */
  children?: MenuItem[];
  /** Whether the menu item is disabled */
  disabled?: boolean;
  /** Badge count for notifications (optional, shown as chip) */
  badge?: number;
  /** Badge color variant */
  badgeColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'success' | 'info';
  /** Tooltip text on hover (optional, shown in mini drawer mode) */
  tooltip?: string;
}

/**
 * Navigation state tracking
 */
export interface NavigationState {
  /** Whether the navigation drawer is open */
  drawerOpen: boolean;
  /** Currently active route path */
  activeRoute: string;
  /** Array of expanded menu item IDs (for nested menus) */
  expandedMenuItems: string[];
}

// ============================================================================
// Theme Toggle Component
// ============================================================================

/**
 * Props for ThemeToggle component
 * Provides light/dark/system theme mode selection
 */
export interface ThemeToggleProps {
  /** Current theme mode ('light', 'dark', or 'system') */
  mode: ThemeMode;
  
  /** Callback invoked when theme mode changes */
  onChange: (mode: ThemeMode) => void;
  
  /** Whether to show the 'system' option (default: true) */
  showSystemOption?: boolean;
  
  /** Whether the toggle is disabled */
  disabled?: boolean;
  
  /** Custom tooltip text for each mode */
  tooltips?: {
    light: string;
    dark: string;
    system: string;
  };
  
  /** Icon size for theme icons */
  size?: 'small' | 'medium' | 'large';
  
  /** Additional CSS class name */
  className?: string;
  
  /** Additional inline styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Navigation Drawer Component
// ============================================================================

/**
 * Drawer variant based on viewport size
 * - 'permanent': Always visible, cannot be closed (desktop)
 * - 'persistent': Visible but can be toggled (tablet mini mode)
 * - 'temporary': Overlay drawer, closes on navigation (mobile)
 */
export type DrawerVariant = 'permanent' | 'persistent' | 'temporary';

/**
 * Props for NavigationDrawer component
 * Responsive sidebar navigation with collapsible behavior
 */
export interface NavigationDrawerProps {
  /** Whether the drawer is open (controlled state) */
  open: boolean;
  
  /** Callback invoked when the drawer should close */
  onClose: () => void;
  
  /** Drawer variant determining behavior */
  variant: DrawerVariant;
  
  /** Menu items to display in the drawer */
  menuItems: MenuItem[];
  
  /** Currently active route path for highlighting */
  activeRoute?: string;
  
  /** Whether to display in mini variant (icon-only, tablet mode) */
  miniVariant?: boolean;
  
  /** Drawer width when expanded (default: 240px) */
  width?: number;
  
  /** Drawer width in mini variant (default: 64px) */
  miniWidth?: number;
  
  /** Drawer anchor side (default: 'left') */
  anchor?: 'left' | 'right';
  
  /** Callback when menu item is clicked (for custom navigation handling) */
  onMenuItemClick?: (item: MenuItem) => void;
  
  /** Additional CSS class name */
  className?: string;
  
  /** Additional inline styles */
  style?: React.CSSProperties;
  
  /** ARIA label for accessibility */
  ariaLabel?: string;
}

// ============================================================================
// AppBar Layout Component
// ============================================================================

/**
 * Props for AppBarLayout component
 * Top navigation bar with branding, menu toggle, and user actions
 */
export interface AppBarLayoutProps {
  /** Application title displayed in the AppBar */
  title: string;
  
  /** Subtitle displayed below the title (optional) */
  subtitle?: string;
  
  /** Logo image source URL (optional) */
  logoSrc?: string;
  
  /** Logo alt text for accessibility */
  logoAlt?: string;
  
  /** User information for profile display */
  userInfo?: UserInfo;
  
  /** Callback invoked when the hamburger menu is clicked (mobile) */
  onMenuClick?: () => void;
  
  /** Whether to show the hamburger menu icon (mobile only) */
  showMenuIcon?: boolean;
  
  /** Callback invoked when the logout action is triggered */
  onLogout?: () => void;
  
  /** Whether to show the search bar (reserved for future phase) */
  showSearch?: boolean;
  
  /** AppBar height in pixels (default: 64 desktop, 56 mobile) */
  height?: number;
  
  /** AppBar elevation level (default: 4) */
  elevation?: number;
  
  /** Current theme mode for theme toggle */
  themeMode?: ThemeMode;
  
  /** Callback when theme mode changes */
  onThemeChange?: (mode: ThemeMode) => void;
  
  /** Additional CSS class name */
  className?: string;
  
  /** Additional inline styles */
  style?: React.CSSProperties;
  
  /** AppBar color variant */
  color?: 'default' | 'primary' | 'secondary' | 'transparent';
}

// ============================================================================
// User Menu Component
// ============================================================================

/**
 * Custom menu item for UserMenu dropdown
 */
export interface UserMenuItem {
  /** Unique identifier */
  id: string;
  
  /** Display label */
  label: string;
  
  /** Icon component (optional) */
  icon?: React.ComponentType<{ className?: string; fontSize?: 'small' | 'medium' | 'large' }>;
  
  /** Click handler */
  onClick: () => void;
  
  /** Whether the item is disabled */
  disabled?: boolean;
  
  /** Whether to show a divider after this item */
  divider?: boolean;
  
  /** Custom color for the item */
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'success' | 'info';
}

/**
 * Props for UserMenu component
 * Dropdown menu from user avatar showing profile and actions
 */
export interface UserMenuProps {
  /** User information to display */
  userInfo: UserInfo;
  
  /** Whether the menu is open (controlled state) */
  open: boolean;
  
  /** Anchor element for menu positioning */
  anchorEl: HTMLElement | null;
  
  /** Callback invoked when the menu should close */
  onClose: () => void;
  
  /** Callback invoked when the logout action is triggered */
  onLogout: () => void;
  
  /** Current theme mode */
  themeMode: ThemeMode;
  
  /** Callback when theme mode changes */
  onThemeChange: (mode: ThemeMode) => void;
  
  /** Additional custom menu items (future: profile, settings) */
  additionalItems?: UserMenuItem[];
  
  /** Whether to show the theme toggle in the menu (default: true) */
  showThemeToggle?: boolean;
  
  /** Whether to show logout confirmation dialog (default: true) */
  confirmLogout?: boolean;
  
  /** Custom logout confirmation message */
  logoutConfirmMessage?: string;
  
  /** Additional CSS class name */
  className?: string;
  
  /** Additional inline styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Protected Layout Component
// ============================================================================

/**
 * Props for ProtectedLayout component
 * Wrapper combining AppBar + Drawer + main content for authenticated pages
 */
export interface ProtectedLayoutProps {
  /** Child components (page content) to render in main area */
  children: React.ReactNode;
  
  /** Page title for AppBar display */
  title?: string;
  
  /** Menu items for navigation drawer */
  menuItems: MenuItem[];
  
  /** Current route path for active menu highlighting */
  currentRoute: string;
  
  /** User information from AuthContext */
  userInfo: UserInfo;
  
  /** Logout handler from AuthContext */
  onLogout: () => void;
  
  /** Current theme mode from theme context */
  themeMode: ThemeMode;
  
  /** Theme change handler */
  onThemeChange: (mode: ThemeMode) => void;
  
  /** Whether to show breadcrumbs above content (reserved for future) */
  showBreadcrumbs?: boolean;
  
  /** Whether the drawer is initially open (default: true on desktop) */
  drawerInitialOpen?: boolean;
  
  /** Maximum content width in pixels (default: 1440, centered) */
  maxContentWidth?: number;
  
  /** Content area padding (uses spacing scale, default: 3 = 24px) */
  contentPadding?: number;
  
  /** Additional CSS class for main content area */
  contentClassName?: string;
  
  /** Additional CSS class for layout container */
  className?: string;
  
  /** Loading state (shows skeleton/spinner) */
  loading?: boolean;
  
  /** Error state (shows error boundary) */
  error?: Error | null;
}

// ============================================================================
// Responsive Drawer Configuration
// ============================================================================

/**
 * Drawer configuration based on responsive breakpoint
 */
export interface DrawerConfig {
  /** Drawer variant for this breakpoint */
  variant: DrawerVariant;
  /** Whether to show in mini variant (icon-only) */
  miniVariant: boolean;
  /** Whether drawer is initially open */
  initialOpen: boolean;
  /** Drawer width when expanded */
  width: number;
  /** Whether to show drawer toggle button */
  showToggle: boolean;
}

/**
 * Responsive drawer configurations for each breakpoint
 */
export interface ResponsiveDrawerConfig {
  desktop: DrawerConfig;  // ≥1200px
  tablet: DrawerConfig;   // ≥992px, <1200px
  mobile: DrawerConfig;   // ≥768px, <992px
}

// ============================================================================
// Layout State Management
// ============================================================================

/**
 * Layout state for managing drawer, menu, and navigation
 */
export interface LayoutState {
  /** Navigation drawer state */
  drawer: {
    open: boolean;
    variant: DrawerVariant;
    miniVariant: boolean;
  };
  
  /** Active route tracking */
  navigation: {
    currentRoute: string;
    expandedMenuItems: string[];
  };
  
  /** User menu state */
  userMenu: {
    anchorEl: HTMLElement | null;
  };
  
  /** Mobile menu state (for temporary drawer) */
  mobileMenu: {
    open: boolean;
  };
}

/**
 * Layout actions for state updates
 */
export interface LayoutActions {
  /** Toggle drawer open/closed */
  toggleDrawer: () => void;
  
  /** Open drawer */
  openDrawer: () => void;
  
  /** Close drawer */
  closeDrawer: () => void;
  
  /** Set drawer variant */
  setDrawerVariant: (variant: DrawerVariant) => void;
  
  /** Navigate to route */
  navigateTo: (path: string) => void;
  
  /** Toggle menu item expansion (for nested menus) */
  toggleMenuExpansion: (menuItemId: string) => void;
  
  /** Open user menu */
  openUserMenu: (anchorEl: HTMLElement) => void;
  
  /** Close user menu */
  closeUserMenu: () => void;
}

/**
 * Complete layout context value
 */
export interface LayoutContextValue {
  /** Current layout state */
  state: LayoutState;
  
  /** Layout state actions */
  actions: LayoutActions;
}

// ============================================================================
// Gradient Background Configuration
// ============================================================================

/**
 * Gradient configuration for login page background
 */
export interface GradientConfig {
  /** Gradient type */
  type: 'linear' | 'radial';
  
  /** Gradient angle (degrees, for linear gradients) */
  angle?: number;
  
  /** Gradient color stops */
  stops: Array<{
    color: string;
    position: number; // 0-100 percentage
  }>;
  
  /** Whether gradient animates (subtle shift animation) */
  animated?: boolean;
  
  /** Animation duration in milliseconds (if animated) */
  animationDuration?: number;
}

/**
 * Background configuration for login page
 */
export interface LoginBackgroundConfig {
  /** Primary gradient configuration */
  gradient: GradientConfig;
  
  /** Optional overlay pattern (dots, grid, etc.) */
  pattern?: {
    type: 'dots' | 'grid' | 'waves';
    opacity: number;
    color: string;
  };
  
  /** Background color fallback (for browsers without gradient support) */
  fallbackColor: string;
}

/**
 * Default login page gradient configuration
 * 135-degree diagonal from primary blue to light blue
 */
export const DEFAULT_LOGIN_GRADIENT: GradientConfig = {
  type: 'linear',
  angle: 135,
  stops: [
    { color: '#1976d2', position: 0 },   // Primary blue (light mode)
    { color: '#42a5f5', position: 50 },  // Mid blue
    { color: '#90caf9', position: 100 }, // Light blue
  ],
  animated: false,
};

/**
 * Default login page background configuration
 */
export const DEFAULT_LOGIN_BACKGROUND: LoginBackgroundConfig = {
  gradient: DEFAULT_LOGIN_GRADIENT,
  fallbackColor: '#1976d2', // Primary blue fallback
};

// ============================================================================
// Animation Configuration
// ============================================================================

/**
 * Animation configuration for component transitions
 */
export interface AnimationConfig {
  /** Animation duration in milliseconds (max 300ms per Constitution) */
  duration: number;
  
  /** Easing function */
  easing: 'easeInOut' | 'easeOut' | 'easeIn' | 'sharp';
  
  /** Delay before animation starts (milliseconds) */
  delay?: number;
  
  /** Whether to use GPU acceleration (transform/opacity only) */
  gpuAccelerated?: boolean;
}

/**
 * Component-specific animation configurations
 */
export interface ComponentAnimations {
  /** Drawer slide animation */
  drawer: AnimationConfig;
  
  /** Menu fade-in animation */
  menu: AnimationConfig;
  
  /** Button ripple animation */
  button: AnimationConfig;
  
  /** Tooltip fade animation */
  tooltip: AnimationConfig;
  
  /** Page transition animation */
  pageTransition: AnimationConfig;
  
  /** Theme toggle animation */
  themeToggle: AnimationConfig;
}

// ============================================================================
// Accessibility Configuration
// ============================================================================

/**
 * Accessibility configuration for components
 */
export interface A11yConfig {
  /** Whether to announce navigation changes to screen readers */
  announceNavigationChanges: boolean;
  
  /** Whether to show skip links (skip to main content) */
  showSkipLinks: boolean;
  
  /** Whether to enforce keyboard navigation focus indicators */
  enforceKeyboardFocus: boolean;
  
  /** Whether to reduce motion for users with motion preference */
  respectMotionPreference: boolean;
  
  /** Minimum touch target size in pixels (default: 44, WCAG 2.1 AAA) */
  minTouchTargetSize: number;
  
  /** ARIA live region politeness level for announcements */
  liveRegionPoliteness: 'polite' | 'assertive' | 'off';
}

// ============================================================================
// Performance Configuration
// ============================================================================

/**
 * Performance optimization configuration
 */
export interface PerformanceConfig {
  /** Whether to lazy load drawer content */
  lazyLoadDrawer: boolean;
  
  /** Whether to virtualize long menu lists */
  virtualizeMenus: boolean;
  
  /** Whether to debounce theme toggle (prevent rapid switches) */
  debounceThemeToggle: boolean;
  
  /** Debounce delay in milliseconds */
  debounceDelay: number;
  
  /** Whether to preload navigation routes */
  preloadRoutes: boolean;
  
  /** Whether to cache user menu state */
  cacheUserMenu: boolean;
}

// ============================================================================
// Default Configuration Values
// ============================================================================

/**
 * Default responsive drawer configurations
 */
export const DEFAULT_DRAWER_CONFIG: ResponsiveDrawerConfig = {
  desktop: {
    variant: 'permanent',
    miniVariant: false,
    initialOpen: true,
    width: 240,
    showToggle: false,
  },
  tablet: {
    variant: 'permanent',
    miniVariant: true,
    initialOpen: true,
    width: 64,
    showToggle: false,
  },
  mobile: {
    variant: 'temporary',
    miniVariant: false,
    initialOpen: false,
    width: 240,
    showToggle: true,
  },
};

/**
 * Default accessibility configuration
 */
export const DEFAULT_A11Y_CONFIG: A11yConfig = {
  announceNavigationChanges: true,
  showSkipLinks: true,
  enforceKeyboardFocus: true,
  respectMotionPreference: true,
  minTouchTargetSize: 44,
  liveRegionPoliteness: 'polite',
};

/**
 * Default performance configuration
 */
export const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  lazyLoadDrawer: false,
  virtualizeMenus: false,
  debounceThemeToggle: true,
  debounceDelay: 150,
  preloadRoutes: true,
  cacheUserMenu: true,
};

// ============================================================================
// Component Prop Validation Helpers
// ============================================================================

/**
 * Validate MenuItem structure
 * @throws Error if validation fails
 */
export function validateMenuItem(item: MenuItem): void {
  if (!item.id) throw new Error('MenuItem must have an id');
  if (!item.label) throw new Error('MenuItem must have a label');
  if (!item.path) throw new Error('MenuItem must have a path');
  if (!item.icon) throw new Error('MenuItem must have an icon');
  
  if (item.children) {
    item.children.forEach(child => validateMenuItem(child));
  }
}

/**
 * Validate UserInfo structure
 * @throws Error if validation fails
 */
export function validateUserInfo(userInfo: UserInfo): void {
  if (!userInfo.userId) throw new Error('UserInfo must have a userId');
  if (!userInfo.username) throw new Error('UserInfo must have a username');
}

/**
 * Check if a route path is active (exact or partial match)
 */
export function isRouteActive(currentRoute: string, itemPath: string, exact: boolean = false): boolean {
  if (exact) {
    return currentRoute === itemPath;
  }
  return currentRoute.startsWith(itemPath);
}

/**
 * Generate avatar fallback initials from username
 */
export function getAvatarInitials(username: string): string {
  const parts = username.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return username.substring(0, 2).toUpperCase();
}

/**
 * Generate deterministic avatar color from userId
 */
export function getAvatarColor(userId: string): string {
  const colors = [
    '#1976d2', // Blue
    '#388e3c', // Green
    '#d32f2f', // Red
    '#f57c00', // Orange
    '#7b1fa2', // Purple
    '#0288d1', // Light blue
    '#689f38', // Light green
    '#c2185b', // Pink
  ];
  
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}
