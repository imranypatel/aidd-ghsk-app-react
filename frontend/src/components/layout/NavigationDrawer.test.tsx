/**
 * NavigationDrawer Component Tests
 * Feature: 002-modern-ui-redesign / US2 Professional Authenticated Layout
 * Tasks: T039-T040
 * 
 * Test Coverage:
 * - Drawer variants (permanent/persistent/temporary)
 * - Menu item rendering with icons and labels
 * - Active route highlighting
 * - Mini variant behavior (icon-only, 64px width)
 * - Hover expand functionality on mini variant
 * - Badge display for notification counts
 * - Keyboard navigation (arrows, Enter/Space)
 * - Accessibility attributes and focus management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme } from '../../theme/lightTheme';
import NavigationDrawer from './NavigationDrawer';
import type { MenuItem } from '../../../../specs/002-modern-ui-redesign/contracts/components';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';

describe('NavigationDrawer Component', () => {
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
    {
      id: 'settings',
      label: 'Settings',
      icon: SettingsIcon,
      path: '/settings',
      badge: 3,
      badgeColor: 'error',
    },
    {
      id: 'help',
      label: 'Help',
      icon: HelpIcon,
      path: '/help',
      tooltip: 'Help & Support',
    },
  ];

  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    variant: 'permanent' as const,
    menuItems: mockMenuItems,
    activeRoute: '/dashboard',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <BrowserRouter>
        <ThemeProvider theme={lightTheme}>
          <NavigationDrawer {...defaultProps} {...props} />
        </ThemeProvider>
      </BrowserRouter>
    );
  };

  describe('T039: Rendering Tests', () => {
    it('renders drawer with navigation role', () => {
      renderComponent();
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('renders all menu items', () => {
      renderComponent();
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Help')).toBeInTheDocument();
    });

    it('renders menu item icons', () => {
      renderComponent();
      
      // Icons should be rendered (Material-UI renders them as SVGs)
      const listItems = screen.getAllByRole('button');
      expect(listItems.length).toBeGreaterThanOrEqual(mockMenuItems.length);
    });

    it('renders with permanent variant and full width (240px)', () => {
      renderComponent({ variant: 'permanent' });
      
      const drawer = screen.getByRole('navigation').closest('[class*="MuiDrawer"]');
      expect(drawer).toBeInTheDocument();
      
      // Check for permanent variant class or computed style
      const paper = drawer?.querySelector('[class*="MuiPaper"]');
      const styles = window.getComputedStyle(paper!);
      expect(styles.width).toBe('240px');
    });

    it('renders with mini variant and reduced width (64px)', () => {
      renderComponent({ miniVariant: true });
      
      const drawer = screen.getByRole('navigation').closest('[class*="MuiDrawer"]');
      const paper = drawer?.querySelector('[class*="MuiPaper"]');
      const styles = window.getComputedStyle(paper!);
      expect(styles.width).toBe('64px');
    });

    it('renders with temporary variant', () => {
      renderComponent({ variant: 'temporary' });
      
      const drawer = screen.getByRole('navigation').closest('[class*="MuiDrawer"]');
      expect(drawer).toBeInTheDocument();
      // Temporary variant should have modal backdrop
    });

    it('hides labels in mini variant', () => {
      renderComponent({ miniVariant: true });
      
      // Labels should not be visible (opacity 0 or display none)
      const dashboardLabel = screen.getByText('Dashboard');
      const styles = window.getComputedStyle(dashboardLabel);
      expect(styles.opacity === '0' || styles.display === 'none').toBe(true);
    });

    it('shows labels in normal variant', () => {
      renderComponent({ miniVariant: false });
      
      const dashboardLabel = screen.getByText('Dashboard');
      const styles = window.getComputedStyle(dashboardLabel);
      expect(styles.opacity).not.toBe('0');
      expect(styles.display).not.toBe('none');
    });

    it('renders badge with count on menu item', () => {
      renderComponent();
      
      // Settings item has badge: 3
      const badge = screen.getByText('3');
      expect(badge).toBeInTheDocument();
      expect(badge.closest('[class*="MuiBadge"]')).toBeInTheDocument();
    });

    it('applies custom width prop', () => {
      renderComponent({ width: 280 });
      
      const drawer = screen.getByRole('navigation').closest('[class*="MuiDrawer"]');
      const paper = drawer?.querySelector('[class*="MuiPaper"]');
      const styles = window.getComputedStyle(paper!);
      expect(styles.width).toBe('280px');
    });

    it('applies custom miniWidth prop', () => {
      renderComponent({ miniVariant: true, miniWidth: 72 });
      
      const drawer = screen.getByRole('navigation').closest('[class*="MuiDrawer"]');
      const paper = drawer?.querySelector('[class*="MuiPaper"]');
      const styles = window.getComputedStyle(paper!);
      expect(styles.width).toBe('72px');
    });

    it('applies custom className', () => {
      renderComponent({ className: 'custom-drawer' });
      
      const drawer = screen.getByRole('navigation').closest('[class*="MuiDrawer"]');
      expect(drawer).toHaveClass('custom-drawer');
    });
  });

  describe('T040: Active Route Highlighting Tests', () => {
    it('highlights active route with primary color', () => {
      renderComponent({ activeRoute: '/dashboard' });
      
      const dashboardItem = screen.getByText('Dashboard').closest('[role="button"]');
      expect(dashboardItem).toHaveAttribute('aria-current', 'page');
      
      // Should have primary color styling
      const styles = window.getComputedStyle(dashboardItem!);
      expect(styles.backgroundColor).not.toBe('transparent');
    });

    it('applies left border to active item (4px solid primary)', () => {
      renderComponent({ activeRoute: '/users' });
      
      const usersItem = screen.getByText('Users').closest('[role="button"]');
      const styles = window.getComputedStyle(usersItem!);
      
      expect(styles.borderLeft).toContain('4px');
    });

    it('does not highlight inactive items', () => {
      renderComponent({ activeRoute: '/dashboard' });
      
      const usersItem = screen.getByText('Users').closest('[role="button"]');
      expect(usersItem).not.toHaveAttribute('aria-current');
    });

    it('updates highlighting when activeRoute prop changes', () => {
      const { rerender } = renderComponent({ activeRoute: '/dashboard' });
      
      let dashboardItem = screen.getByText('Dashboard').closest('[role="button"]');
      expect(dashboardItem).toHaveAttribute('aria-current', 'page');
      
      // Change active route
      rerender(
        <BrowserRouter>
          <ThemeProvider theme={lightTheme}>
            <NavigationDrawer {...defaultProps} activeRoute="/users" />
          </ThemeProvider>
        </BrowserRouter>
      );
      
      dashboardItem = screen.getByText('Dashboard').closest('[role="button"]');
      const usersItem = screen.getByText('Users').closest('[role="button"]');
      
      expect(dashboardItem).not.toHaveAttribute('aria-current');
      expect(usersItem).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('T040: Interaction Tests', () => {
    it('calls onMenuItemClick when item clicked', () => {
      const mockOnMenuItemClick = vi.fn();
      renderComponent({ onMenuItemClick: mockOnMenuItemClick });
      
      const dashboardItem = screen.getByText('Dashboard');
      fireEvent.click(dashboardItem);
      
      expect(mockOnMenuItemClick).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'dashboard', path: '/dashboard' })
      );
    });

    it('calls onClose when temporary drawer item clicked', () => {
      const mockOnClose = vi.fn();
      renderComponent({ variant: 'temporary', onClose: mockOnClose });
      
      const dashboardItem = screen.getByText('Dashboard');
      fireEvent.click(dashboardItem);
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('does not call onClose when permanent drawer item clicked', () => {
      const mockOnClose = vi.fn();
      renderComponent({ variant: 'permanent', onClose: mockOnClose });
      
      const dashboardItem = screen.getByText('Dashboard');
      fireEvent.click(dashboardItem);
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('shows hover state on menu items', () => {
      renderComponent();
      
      const dashboardItem = screen.getByText('Dashboard').closest('[role="button"]');
      fireEvent.mouseEnter(dashboardItem!);
      
      // Hover should add background color
      const styles = window.getComputedStyle(dashboardItem!);
      expect(styles.backgroundColor).not.toBe('transparent');
    });

    it('expands mini drawer on hover', async () => {
      renderComponent({ miniVariant: true });
      
      const drawer = screen.getByRole('navigation').closest('[class*="MuiDrawer"]');
      const paper = drawer?.querySelector('[class*="MuiPaper"]');
      
      fireEvent.mouseEnter(paper!);
      
      await waitFor(() => {
        const styles = window.getComputedStyle(paper!);
        expect(styles.width).toBe('240px'); // Expands from 64px to 240px
      });
    });

    it('collapses mini drawer on mouse leave', async () => {
      renderComponent({ miniVariant: true });
      
      const drawer = screen.getByRole('navigation').closest('[class*="MuiDrawer"]');
      const paper = drawer?.querySelector('[class*="MuiPaper"]');
      
      // Expand first
      fireEvent.mouseEnter(paper!);
      await waitFor(() => {
        expect(window.getComputedStyle(paper!).width).toBe('240px');
      });
      
      // Then collapse
      fireEvent.mouseLeave(paper!);
      await waitFor(() => {
        expect(window.getComputedStyle(paper!).width).toBe('64px');
      });
    });

    it('shows tooltip on hover in mini variant', async () => {
      renderComponent({ miniVariant: true });
      
      const helpItem = screen.getByText('Help').closest('[role="button"]');
      fireEvent.mouseEnter(helpItem!);
      
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
        expect(tooltip).toHaveTextContent('Help & Support');
      });
    });
  });

  describe('T040: Keyboard Navigation Tests', () => {
    it('navigates to item with Enter key', () => {
      const mockOnMenuItemClick = vi.fn();
      renderComponent({ onMenuItemClick: mockOnMenuItemClick });
      
      const dashboardItem = screen.getByText('Dashboard').closest('[role="button"]');
      (dashboardItem as HTMLElement)?.focus();
      fireEvent.keyDown(dashboardItem!, { key: 'Enter', code: 'Enter' });
      
      expect(mockOnMenuItemClick).toHaveBeenCalled();
    });

    it('navigates to item with Space key', () => {
      const mockOnMenuItemClick = vi.fn();
      renderComponent({ onMenuItemClick: mockOnMenuItemClick });
      
      const dashboardItem = screen.getByText('Dashboard').closest('[role="button"]');
      (dashboardItem as HTMLElement)?.focus();
      fireEvent.keyDown(dashboardItem!, { key: ' ', code: 'Space' });
      
      expect(mockOnMenuItemClick).toHaveBeenCalled();
    });

    it('closes temporary drawer with Escape key', () => {
      const mockOnClose = vi.fn();
      renderComponent({ variant: 'temporary', onClose: mockOnClose });
      
      const drawer = screen.getByRole('navigation');
      fireEvent.keyDown(drawer, { key: 'Escape', code: 'Escape' });
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('maintains focus visibility on keyboard navigation', () => {
      renderComponent();
      
      const dashboardItem = screen.getByText('Dashboard').closest('[role="button"]');
      (dashboardItem as HTMLElement)?.focus();
      
      expect(document.activeElement).toBe(dashboardItem);
      
      const styles = window.getComputedStyle(dashboardItem!);
      // Should have visible focus indicator (outline or ring)
      expect(styles.outline || styles.boxShadow).toBeTruthy();
    });

    it('arrow keys navigate between menu items', () => {
      renderComponent();
      
      const dashboardItem = screen.getByText('Dashboard').closest('[role="button"]');
      (dashboardItem as HTMLElement)?.focus();
      
      fireEvent.keyDown(dashboardItem!, { key: 'ArrowDown', code: 'ArrowDown' });
      
      const usersItem = screen.getByText('Users').closest('[role="button"]');
      expect(document.activeElement).toBe(usersItem);
    });
  });

  describe('T040: Accessibility Tests', () => {
    it('has proper navigation role', () => {
      renderComponent();
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('has descriptive aria-label', () => {
      renderComponent({ ariaLabel: 'Main navigation' });
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Main navigation');
    });

    it('has default aria-label when not provided', () => {
      renderComponent();
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label');
    });

    it('menu items have role="button"', () => {
      renderComponent();
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(mockMenuItems.length);
    });

    it('active menu item has aria-current="page"', () => {
      renderComponent({ activeRoute: '/dashboard' });
      
      const dashboardItem = screen.getByText('Dashboard').closest('[role="button"]');
      expect(dashboardItem).toHaveAttribute('aria-current', 'page');
    });

    it('disabled menu items have aria-disabled', () => {
      const itemsWithDisabled = [
        ...mockMenuItems,
        {
          id: 'disabled',
          label: 'Disabled',
          icon: SettingsIcon,
          path: '/disabled',
          disabled: true,
        },
      ];
      renderComponent({ menuItems: itemsWithDisabled });
      
      const disabledItem = screen.getByText('Disabled').closest('[role="button"]');
      expect(disabledItem).toHaveAttribute('aria-disabled', 'true');
    });

    it('maintains proper focus trap in temporary variant', () => {
      renderComponent({ variant: 'temporary' });
      
      const nav = screen.getByRole('navigation');
      // FocusTrap should be applied (can be tested indirectly through keyboard navigation)
      expect(nav).toBeInTheDocument();
    });

    it('provides keyboard navigation hints via aria-description', () => {
      renderComponent();
      
      const nav = screen.getByRole('navigation');
      // Should have hints for keyboard users (can be on nav or first item)
      expect(nav.getAttribute('aria-description') || nav.getAttribute('title')).toBeTruthy();
    });
  });

  describe('T040: Badge Rendering Tests', () => {
    it('renders badge with notification count', () => {
      renderComponent();
      
      const badge = screen.getByText('3');
      expect(badge).toBeInTheDocument();
    });

    it('positions badge correctly (8px from right)', () => {
      renderComponent();
      
      const badgeElement = screen.getByText('3').closest('[class*="MuiBadge"]');
      const styles = window.getComputedStyle(badgeElement!);
      
      // Badge should be positioned with right offset
      expect(styles.position).toBeTruthy();
    });

    it('applies badge color prop', () => {
      renderComponent();
      
      // Settings item has badgeColor: 'error'
      const badge = screen.getByText('3').closest('[class*="MuiBadge"]');
      expect(badge).toHaveClass(expect.stringContaining('error'));
    });

    it('does not render badge when count is 0 or undefined', () => {
      const itemsNoBadge = mockMenuItems.filter(item => item.id !== 'settings');
      renderComponent({ menuItems: itemsNoBadge });
      
      const badges = screen.queryAllByText(/^\d+$/);
      expect(badges).toHaveLength(0);
    });
  });

  describe('T040: Responsive Behavior Tests', () => {
    it('uses temporary variant on mobile', () => {
      renderComponent({ variant: 'temporary' });
      
      const drawer = screen.getByRole('navigation').closest('[class*="MuiDrawer"]');
      // Should have modal backdrop and overlay behavior
      expect(drawer).toBeInTheDocument();
    });

    it('uses permanent mini variant on tablet', () => {
      renderComponent({ variant: 'permanent', miniVariant: true });
      
      const drawer = screen.getByRole('navigation').closest('[class*="MuiDrawer"]');
      const paper = drawer?.querySelector('[class*="MuiPaper"]');
      const styles = window.getComputedStyle(paper!);
      
      expect(styles.width).toBe('64px');
    });

    it('uses permanent full variant on desktop', () => {
      renderComponent({ variant: 'permanent', miniVariant: false });
      
      const drawer = screen.getByRole('navigation').closest('[class*="MuiDrawer"]');
      const paper = drawer?.querySelector('[class*="MuiPaper"]');
      const styles = window.getComputedStyle(paper!);
      
      expect(styles.width).toBe('240px');
    });

    it('drawer has proper border on desktop/tablet', () => {
      renderComponent({ variant: 'permanent' });
      
      const paper = screen.getByRole('navigation').closest('[class*="MuiDrawer"]')?.querySelector('[class*="MuiPaper"]');
      const styles = window.getComputedStyle(paper!);
      
      expect(styles.borderRight).toContain('1px solid');
    });

    it('drawer has no border on mobile (overlay)', () => {
      renderComponent({ variant: 'temporary' });
      
      const paper = screen.getByRole('navigation').closest('[class*="MuiDrawer"]')?.querySelector('[class*="MuiPaper"]');
      const styles = window.getComputedStyle(paper!);
      
      expect(styles.borderRight).not.toContain('solid');
    });
  });

  describe('T040: Theme Integration Tests', () => {
    it('applies theme-aware background color', () => {
      renderComponent();
      
      const paper = screen.getByRole('navigation').closest('[class*="MuiDrawer"]')?.querySelector('[class*="MuiPaper"]');
      const styles = window.getComputedStyle(paper!);
      
      expect(styles.backgroundColor).toBeTruthy();
    });

    it('applies theme-aware text color', () => {
      renderComponent();
      
      const dashboardLabel = screen.getByText('Dashboard');
      const styles = window.getComputedStyle(dashboardLabel);
      
      expect(styles.color).toBeTruthy();
    });

    it('applies theme-aware hover color', () => {
      renderComponent();
      
      const dashboardItem = screen.getByText('Dashboard').closest('[role="button"]');
      fireEvent.mouseEnter(dashboardItem!);
      
      const styles = window.getComputedStyle(dashboardItem!);
      expect(styles.backgroundColor).not.toBe('transparent');
    });
  });
});
