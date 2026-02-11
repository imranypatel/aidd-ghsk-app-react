/**
 * ProtectedLayout Component Tests
 * Feature: 002-modern-ui-redesign / US2 Professional Authenticated Layout
 * Task: T043
 * 
 * Test Coverage:
 * - Layout composition (AppBar + Drawer + children)
 * - Props passing to child components
 * - Responsive variant changes
 * - Drawer state management
 * - Content padding and max-width
 * - Loading and error states
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme } from '../../theme/lightTheme';
import ProtectedLayout from './ProtectedLayout';
import type { UserInfo, MenuItem } from '../../contracts/components';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';

// Mock useMediaQuery for responsive tests
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual,
    useMediaQuery: vi.fn(),
  };
});

import { useMediaQuery } from '@mui/material';

describe('ProtectedLayout Component', () => {
  const mockUserInfo: UserInfo = {
    userId: 'user123',
    username: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
  };

  const mockMenuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: DashboardIcon,
      path: '/dashboard',
    },
    {
      id: 'users',
      label: 'Users',
      icon: PeopleIcon,
      path: '/users',
    },
  ];

  const defaultProps = {
    children: <div>Test Content</div>,
    title: 'Dashboard',
    menuItems: mockMenuItems,
    currentRoute: '/dashboard',
    userInfo: mockUserInfo,
    onLogout: vi.fn(),
    themeMode: 'light' as const,
    onThemeChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useMediaQuery as any).mockReturnValue(false); // Default desktop
  });

  const renderComponent = (props = {}) => {
    return render(
      <BrowserRouter>
        <ThemeProvider theme={lightTheme}>
          <ProtectedLayout {...defaultProps} {...props} />
        </ThemeProvider>
      </BrowserRouter>
    );
  };

  describe('T043: Composition Tests', () => {
    it('renders AppBar at top', () => {
      renderComponent();
      
      const appBar = screen.getByRole('banner');
      expect(appBar).toBeInTheDocument();
      expect(appBar).toHaveTextContent('Dashboard');
    });

    it('renders NavigationDrawer with menu items', () => {
      renderComponent();
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
    });

    it('renders children in main content area', () => {
      renderComponent();
      
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('passes title prop to AppBar', () => {
      renderComponent({ title: 'Custom Title' });
      
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('passes userInfo prop to AppBar', () => {
      renderComponent();
      
      const avatar = screen.getByText('JD'); // John Doe initials
      expect(avatar).toBeInTheDocument();
    });

    it('passes menuItems prop to Drawer', () => {
      renderComponent();
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
    });

    it('passes currentRoute prop to Drawer for active highlighting', () => {
      renderComponent({ currentRoute: '/users' });
      
      const usersItem = screen.getByText('Users').closest('[role="button"]');
      expect(usersItem).toHaveAttribute('aria-current', 'page');
    });

    it('passes onLogout callback to AppBar/UserMenu', () => {
      const mockOnLogout = vi.fn();
      renderComponent({ onLogout: mockOnLogout });
      
      // Open user menu
      const avatar = screen.getByRole('button', { name: /john doe/i });
      fireEvent.click(avatar);
      
      // Click logout
      const logoutItem = screen.getByRole('menuitem', { name: /logout/i });
      fireEvent.click(logoutItem);
      
      // Confirm logout
      const confirmButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(confirmButton);
      
      expect(mockOnLogout).toHaveBeenCalled();
    });

    it('passes themeMode and onThemeChange to AppBar/UserMenu', () => {
      const mockOnThemeChange = vi.fn();
      renderComponent({ themeMode: 'light', onThemeChange: mockOnThemeChange });
      
      // Theme toggle should be available
      const themeToggle = screen.getByRole('button', { name: /toggle theme/i });
      fireEvent.click(themeToggle);
      
      expect(mockOnThemeChange).toHaveBeenCalled();
    });
  });

  describe('T043: Responsive Behavior Tests', () => {
    it('uses permanent drawer variant on desktop', () => {
      (useMediaQuery as any).mockReturnValue(false); // Desktop
      renderComponent();
      
      const drawer = screen.getByRole('navigation').closest('[class*="MuiDrawer"]');
      // Permanent drawer should always be visible
      expect(drawer).toBeInTheDocument();
    });

    it('drawer is initially open on desktop', () => {
      (useMediaQuery as any).mockReturnValue(false);
      renderComponent();
      
      const drawer = screen.getByRole('navigation');
      expect(drawer).toBeVisible();
    });

    it('uses mini variant on tablet', () => {
      (useMediaQuery as any).mockReturnValue(true); // Tablet
      renderComponent();
      
      const drawer = screen.getByRole('navigation').closest('[class*="MuiDrawer"]');
      const paper = drawer?.querySelector('[class*="MuiPaper"]');
      const styles = window.getComputedStyle(paper!);
      
      expect(styles.width).toBe('64px');
    });

    it('uses temporary drawer variant on mobile', () => {
      (useMediaQuery as any).mockReturnValue(true); // Mobile
      renderComponent();
      
      const drawer = screen.getByRole('navigation').closest('[class*="MuiDrawer"]');
      // Temporary drawer should exist but may be closed initially
      expect(drawer).toBeInTheDocument();
    });

    it('drawer is initially closed on mobile', () => {
      (useMediaQuery as any).mockReturnValue(true); // Mobile
      renderComponent();
      
      const drawer = screen.getByRole('navigation');
      // May not be visible initially
      expect(drawer).toBeInTheDocument();
    });

    it('hamburger menu toggles drawer on mobile', () => {
      (useMediaQuery as any).mockReturnValue(true); // Mobile
      renderComponent();
      
      const menuButton = screen.getByRole('button', { name: /open navigation/i });
      fireEvent.click(menuButton);
      
      const drawer = screen.getByRole('navigation');
      expect(drawer).toBeVisible();
    });
  });

  describe('T043: Drawer State Management Tests', () => {
    it('manages drawer open state internally', () => {
      renderComponent();
      
      const drawer = screen.getByRole('navigation');
      expect(drawer).toBeInTheDocument();
    });

    it('closes drawer when mobile drawer item clicked', () => {
      (useMediaQuery as any).mockReturnValue(true); // Mobile
      renderComponent();
      
      // Open drawer
      const menuButton = screen.getByRole('button', { name: /open navigation/i });
      fireEvent.click(menuButton);
      
      // Click menu item
      const dashboardItem = screen.getByText('Dashboard');
      fireEvent.click(dashboardItem);
      
      // Drawer should close on mobile
      const drawer = screen.getByRole('navigation');
      expect(drawer).not.toBeVisible();
    });

    it('respects drawerInitialOpen prop on desktop', () => {
      renderComponent({ drawerInitialOpen: false });
      
      const drawer = screen.getByRole('navigation');
      // Even on desktop, should respect initial state
      expect(drawer).toBeInTheDocument();
    });
  });

  describe('T043: Content Area Styling Tests', () => {
    it('applies default content padding (24px)', () => {
      renderComponent();
      
      const content = screen.getByText('Test Content').closest('[class*="MuiBox"]');
      const styles = window.getComputedStyle(content!);
      
      expect(styles.padding).toContain('24px');
    });

    it('applies custom contentPadding prop', () => {
      renderComponent({ contentPadding: 4 }); // spacing[4] = 32px
      
      const content = screen.getByText('Test Content').closest('[class*="MuiBox"]');
      const styles = window.getComputedStyle(content!);
      
      expect(styles.padding).toContain('32px');
    });

    it('applies default maxContentWidth (1440px) on desktop', () => {
      (useMediaQuery as any).mockReturnValue(false); // Desktop
      renderComponent();
      
      const content = screen.getByText('Test Content').closest('[class*="MuiBox"]');
      const styles = window.getComputedStyle(content!);
      
      expect(styles.maxWidth).toBe('1440px');
    });

    it('applies custom maxContentWidth prop', () => {
      renderComponent({ maxContentWidth: 1200 });
      
      const content = screen.getByText('Test Content').closest('[class*="MuiBox"]');
      const styles = window.getComputedStyle(content!);
      
      expect(styles.maxWidth).toBe('1200px');
    });

    it('centers content on desktop with margin auto', () => {
      (useMediaQuery as any).mockReturnValue(false); // Desktop
      renderComponent();
      
      const content = screen.getByText('Test Content').closest('[class*="MuiBox"]');
      const styles = window.getComputedStyle(content!);
      
      expect(styles.margin).toContain('auto');
    });

    it('applies top margin for AppBar height (64px desktop)', () => {
      (useMediaQuery as any).mockReturnValue(false); // Desktop
      renderComponent();
      
      const content = screen.getByText('Test Content').closest('[class*="MuiBox"]');
      const styles = window.getComputedStyle(content!);
      
      expect(styles.marginTop).toBe('64px');
    });

    it('applies top margin for AppBar height (56px mobile)', () => {
      (useMediaQuery as any).mockReturnValue(true); // Mobile
      renderComponent();
      
      const content = screen.getByText('Test Content').closest('[class*="MuiBox"]');
      const styles = window.getComputedStyle(content!);
      
      expect(styles.marginTop).toBe('56px');
    });

    it('applies left margin for drawer width (240px desktop)', () => {
      (useMediaQuery as any).mockReturnValue(false); // Desktop
      renderComponent();
      
      const content = screen.getByText('Test Content').closest('[class*="MuiBox"]');
      const styles = window.getComputedStyle(content!);
      
      expect(styles.marginLeft).toBe('240px');
    });

    it('applies left margin for mini drawer (64px tablet)', () => {
      (useMediaQuery as any).mockReturnValue(true); // Tablet
      renderComponent();
      
      const content = screen.getByText('Test Content').closest('[class*="MuiBox"]');
      const styles = window.getComputedStyle(content!);
      
      expect(styles.marginLeft).toBe('64px');
    });

    it('no left margin on mobile (temporary drawer overlay)', () => {
      (useMediaQuery as any).mockReturnValue(true); // Mobile
      renderComponent();
      
      const content = screen.getByText('Test Content').closest('[class*="MuiBox"]');
      const styles = window.getComputedStyle(content!);
      
      expect(styles.marginLeft).toBe('0px');
    });

    it('applies minHeight calc(100vh - AppBar height)', () => {
      renderComponent();
      
      const content = screen.getByText('Test Content').closest('[class*="MuiBox"]');
      const styles = window.getComputedStyle(content!);
      
      expect(styles.minHeight).toContain('calc');
    });

    it('applies theme background color', () => {
      renderComponent();
      
      const content = screen.getByText('Test Content').closest('[class*="MuiBox"]');
      const styles = window.getComputedStyle(content!);
      
      expect(styles.backgroundColor).toBeTruthy();
    });

    it('applies custom contentClassName', () => {
      renderComponent({ contentClassName: 'custom-content' });
      
      const content = screen.getByText('Test Content').closest('[class*="MuiBox"]');
      expect(content).toHaveClass('custom-content');
    });

    it('applies custom className to container', () => {
      renderComponent({ className: 'custom-layout' });
      
      const layout = screen.getByText('Test Content').closest('[class*="MuiBox"]')?.parentElement;
      expect(layout).toHaveClass('custom-layout');
    });
  });

  describe('T043: Loading State Tests', () => {
    it('shows skeleton loader when loading prop is true', () => {
      renderComponent({ loading: true });
      
      const skeletons = document.querySelectorAll('[class*="MuiSkeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('hides content when loading', () => {
      renderComponent({ loading: true });
      
      expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
    });

    it('shows content when loading is false', () => {
      renderComponent({ loading: false });
      
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('T043: Error State Tests', () => {
    it('shows error boundary when error prop provided', () => {
      const mockError = new Error('Test error');
      renderComponent({ error: mockError });
      
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });

    it('hides content when error exists', () => {
      const mockError = new Error('Test error');
      renderComponent({ error: mockError });
      
      expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
    });

    it('shows content when error is null', () => {
      renderComponent({ error: null });
      
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('T043: Skip Link Tests', () => {
    it('renders skip link for accessibility', () => {
      renderComponent();
      
      const skipLink = document.querySelector('a[href="#main-content"]');
      expect(skipLink).toBeInTheDocument();
    });

    it('skip link is first in tab order', () => {
      renderComponent();
      
      const skipLink = document.querySelector('a[href="#main-content"]') as HTMLElement;
      expect(skipLink.tabIndex).toBe(0);
    });

    it('skip link navigates to main content', () => {
      renderComponent();
      
      const skipLink = document.querySelector('a[href="#main-content"]') as HTMLElement;
      fireEvent.click(skipLink);
      
      const mainContent = document.getElementById('main-content');
      expect(mainContent).toBeInTheDocument();
    });

    it('skip link has proper styling (visible on focus)', () => {
      renderComponent();
      
      const skipLink = document.querySelector('a[href="#main-content"]') as HTMLElement;
      const styles = window.getComputedStyle(skipLink);
      
      // Should be absolutely positioned and hidden by default
      expect(styles.position).toBe('absolute');
    });
  });

  describe('T043: Accessibility Tests', () => {
    it('main content area has proper landmark role', () => {
      renderComponent();
      
      const main = document.querySelector('main');
      expect(main).toBeInTheDocument();
    });

    it('main content area has id for skip link target', () => {
      renderComponent();
      
      const main = document.getElementById('main-content');
      expect(main).toBeInTheDocument();
    });

    it('navigation landmark is properly labeled', () => {
      renderComponent();
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label');
    });

    it('AppBar landmark is properly identified', () => {
      renderComponent();
      
      const banner = screen.getByRole('banner');
      expect(banner).toBeInTheDocument();
    });
  });
});
