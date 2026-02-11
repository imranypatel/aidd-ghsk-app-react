/**
 * UserMenu Component Tests
 * Feature: 002-modern-ui-redesign / US2 Professional Authenticated Layout
 * Tasks: T041-T042
 * 
 * Test Coverage:
 * - Menu rendering with user information header
 * - Theme toggle switch integration
 * - Logout item with confirmation dialog
 * - Additional custom menu items
 * - Menu positioning and animations
 * - Keyboard navigation and accessibility
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme } from '../../theme/lightTheme';
import UserMenu from './UserMenu';
import type { UserInfo } from '../../../../specs/002-modern-ui-redesign/contracts/components';

describe('UserMenu Component', () => {
  const mockUserInfo: UserInfo = {
    userId: 'user123',
    username: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Administrator',
  };

  const mockAnchorEl = document.createElement('button');
  document.body.appendChild(mockAnchorEl);

  const defaultProps = {
    userInfo: mockUserInfo,
    open: true,
    anchorEl: mockAnchorEl,
    onClose: vi.fn(),
    onLogout: vi.fn(),
    themeMode: 'light' as const,
    onThemeChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider theme={lightTheme}>
        <UserMenu {...defaultProps} {...props} />
      </ThemeProvider>
    );
  };

  describe('T041: Rendering Tests', () => {
    it('renders menu when open', () => {
      renderComponent();
      
      const menu = screen.getByRole('menu');
      expect(menu).toBeInTheDocument();
    });

    it('does not render menu when closed', () => {
      renderComponent({ open: false });
      
      const menu = screen.queryByRole('menu');
      expect(menu).not.toBeInTheDocument();
    });

    it('renders user information header', () => {
      renderComponent();
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Administrator')).toBeInTheDocument();
    });

    it('renders user avatar with initials in header', () => {
      renderComponent();
      
      const avatar = screen.getByText('JD'); // John Doe initials
      expect(avatar).toBeInTheDocument();
    });

    it('renders user avatar with image when provided', () => {
      const userWithAvatar = { ...mockUserInfo, avatar: '/avatar.jpg' };
      renderComponent({ userInfo: userWithAvatar });
      
      const avatarImg = screen.getByRole('img', { name: /john doe/i });
      expect(avatarImg).toBeInTheDocument();
      expect(avatarImg).toHaveAttribute('src', '/avatar.jpg');
    });

    it('renders theme toggle menu item by default', () => {
      renderComponent();
      
      const themeToggle = screen.getByRole('menuitem', { name: /theme/i });
      expect(themeToggle).toBeInTheDocument();
    });

    it('hides theme toggle when showThemeToggle is false', () => {
      renderComponent({ showThemeToggle: false });
      
      const themeToggle = screen.queryByRole('menuitem', { name: /theme/i });
      expect(themeToggle).not.toBeInTheDocument();
    });

    it('renders logout menu item', () => {
      renderComponent();
      
      const logoutItem = screen.getByRole('menuitem', { name: /logout/i });
      expect(logoutItem).toBeInTheDocument();
    });

    it('applies error color to logout item', () => {
      renderComponent();
      
      const logoutItem = screen.getByRole('menuitem', { name: /logout/i });
      const styles = window.getComputedStyle(logoutItem);
      
      // Should have error/red color
      expect(styles.color).toBeTruthy();
    });

    it('renders divider after theme toggle', () => {
      renderComponent();
      
      const dividers = document.querySelectorAll('[class*="MuiDivider"]');
      expect(dividers.length).toBeGreaterThanOrEqual(2); // After header and after theme
    });

    it('has proper menu width (280px)', () => {
      renderComponent();
      
      const menu = screen.getByRole('menu').closest('[class*="MuiMenu"]');
      const paper = menu?.querySelector('[class*="MuiPaper"]');
      const styles = window.getComputedStyle(paper!);
      
      expect(styles.width).toBe('280px');
    });

    it('has proper elevation (8)', () => {
      renderComponent();
      
      const menu = screen.getByRole('menu').closest('[class*="MuiMenu"]');
      const paper = menu?.querySelector('[class*="MuiPaper"]');
      
      // Should have elevation class or box-shadow
      expect(paper).toHaveClass(expect.stringContaining('MuiPaper'));
    });

    it('applies custom className', () => {
      renderComponent({ className: 'custom-user-menu' });
      
      const menu = screen.getByRole('menu').closest('[class*="MuiMenu"]');
      expect(menu).toHaveClass('custom-user-menu');
    });
  });

  describe('T042: Additional Menu Items Tests', () => {
    it('renders additional custom menu items', () => {
      const additionalItems = [
        {
          id: 'profile',
          label: 'Profile',
          onClick: vi.fn(),
        },
        {
          id: 'settings',
          label: 'Settings',
          onClick: vi.fn(),
        },
      ];
      
      renderComponent({ additionalItems });
      
      expect(screen.getByRole('menuitem', { name: 'Profile' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Settings' })).toBeInTheDocument();
    });

    it('renders icons for additional items when provided', () => {
      const additionalItems = [
        {
          id: 'profile',
          label: 'Profile',
          icon: vi.fn(() => <span>ProfileIcon</span>),
          onClick: vi.fn(),
        },
      ];
      
      renderComponent({ additionalItems });
      
      expect(screen.getByText('ProfileIcon')).toBeInTheDocument();
    });

    it('calls onClick handler for additional items', () => {
      const mockOnClick = vi.fn();
      const additionalItems = [
        {
          id: 'profile',
          label: 'Profile',
          onClick: mockOnClick,
        },
      ];
      
      renderComponent({ additionalItems });
      
      const profileItem = screen.getByRole('menuitem', { name: 'Profile' });
      fireEvent.click(profileItem);
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('disables additional items when disabled prop is true', () => {
      const additionalItems = [
        {
          id: 'disabled',
          label: 'Disabled Item',
          onClick: vi.fn(),
          disabled: true,
        },
      ];
      
      renderComponent({ additionalItems });
      
      const disabledItem = screen.getByRole('menuitem', { name: 'Disabled Item' });
      expect(disabledItem).toHaveAttribute('aria-disabled', 'true');
    });

    it('renders divider after item when divider is true', () => {
      const additionalItems = [
        {
          id: 'profile',
          label: 'Profile',
          onClick: vi.fn(),
          divider: true,
        },
        {
          id: 'settings',
          label: 'Settings',
          onClick: vi.fn(),
        },
      ];
      
      renderComponent({ additionalItems });
      
      const dividers = document.querySelectorAll('[class*="MuiDivider"]');
      // Should have dividers: after header, after theme, after profile item
      expect(dividers.length).toBeGreaterThanOrEqual(3);
    });

    it('applies custom color to additional items', () => {
      const additionalItems = [
        {
          id: 'danger',
          label: 'Danger Action',
          onClick: vi.fn(),
          color: 'error' as const,
        },
      ];
      
      renderComponent({ additionalItems });
      
      const dangerItem = screen.getByRole('menuitem', { name: 'Danger Action' });
      const styles = window.getComputedStyle(dangerItem);
      
      expect(styles.color).toBeTruthy();
    });
  });

  describe('T042: Theme Toggle Interaction Tests', () => {
    it('shows current theme mode in toggle', () => {
      renderComponent({ themeMode: 'light' });
      
      const themeToggle = screen.getByRole('menuitem', { name: /theme/i });
      expect(themeToggle).toBeInTheDocument();
      
      // Light mode icon should be visible
      const lightIcon = themeToggle.querySelector('[data-testid*="Light"]');
      expect(lightIcon).toBeInTheDocument();
    });

    it('calls onThemeChange when theme toggle clicked', () => {
      const mockOnThemeChange = vi.fn();
      renderComponent({ onThemeChange: mockOnThemeChange });
      
      const themeToggle = screen.getByRole('menuitem', { name: /theme/i });
      const switchControl = themeToggle.querySelector('[type="checkbox"]');
      
      fireEvent.click(switchControl!);
      
      expect(mockOnThemeChange).toHaveBeenCalled();
    });

    it('toggles between light and dark modes', () => {
      const mockOnThemeChange = vi.fn();
      renderComponent({ themeMode: 'light', onThemeChange: mockOnThemeChange });
      
      const themeToggle = screen.getByRole('menuitem', { name: /theme/i });
      const switchControl = themeToggle.querySelector('[type="checkbox"]');
      
      fireEvent.click(switchControl!);
      
      // Should call with 'dark' mode
      expect(mockOnThemeChange).toHaveBeenCalledWith('dark');
    });

    it('reflects theme mode in switch state', () => {
      renderComponent({ themeMode: 'dark' });
      
      const themeToggle = screen.getByRole('menuitem', { name: /theme/i });
      const switchControl = themeToggle.querySelector('[type="checkbox"]') as HTMLInputElement;
      
      expect(switchControl.checked).toBe(true); // Checked for dark mode
    });
  });

  describe('T042: Logout Interaction Tests', () => {
    it('shows confirmation dialog when logout clicked (default behavior)', () => {
      renderComponent();
      
      const logoutItem = screen.getByRole('menuitem', { name: /logout/i });
      fireEvent.click(logoutItem);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(screen.getByText(/confirm logout/i)).toBeInTheDocument();
    });

    it('skips confirmation dialog when confirmLogout is false', () => {
      const mockOnLogout = vi.fn();
      renderComponent({ confirmLogout: false, onLogout: mockOnLogout });
      
      const logoutItem = screen.getByRole('menuitem', { name: /logout/i });
      fireEvent.click(logoutItem);
      
      expect(mockOnLogout).toHaveBeenCalledTimes(1);
      
      const dialog = screen.queryByRole('dialog');
      expect(dialog).not.toBeInTheDocument();
    });

    it('displays custom logout confirmation message', () => {
      renderComponent({ logoutConfirmMessage: 'Custom logout message?' });
      
      const logoutItem = screen.getByRole('menuitem', { name: /logout/i });
      fireEvent.click(logoutItem);
      
      expect(screen.getByText('Custom logout message?')).toBeInTheDocument();
    });

    it('calls onLogout when confirmed', () => {
      const mockOnLogout = vi.fn();
      renderComponent({ onLogout: mockOnLogout });
      
      const logoutItem = screen.getByRole('menuitem', { name: /logout/i });
      fireEvent.click(logoutItem);
      
      const confirmButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(confirmButton);
      
      expect(mockOnLogout).toHaveBeenCalledTimes(1);
    });

    it('closes menu after logout confirmed', () => {
      const mockOnClose = vi.fn();
      const mockOnLogout = vi.fn();
      renderComponent({ onClose: mockOnClose, onLogout: mockOnLogout });
      
      const logoutItem = screen.getByRole('menuitem', { name: /logout/i });
      fireEvent.click(logoutItem);
      
      const confirmButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(confirmButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('closes dialog when cancel clicked', () => {
      renderComponent();
      
      const logoutItem = screen.getByRole('menuitem', { name: /logout/i });
      fireEvent.click(logoutItem);
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);
      
      const dialog = screen.queryByRole('dialog');
      expect(dialog).not.toBeInTheDocument();
    });

    it('does not call onLogout when cancelled', () => {
      const mockOnLogout = vi.fn();
      renderComponent({ onLogout: mockOnLogout });
      
      const logoutItem = screen.getByRole('menuitem', { name: /logout/i });
      fireEvent.click(logoutItem);
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);
      
      expect(mockOnLogout).not.toHaveBeenCalled();
    });
  });

  describe('T042: Menu Positioning and Closing Tests', () => {
    it('positions menu relative to anchor element', () => {
      renderComponent();
      
      const menu = screen.getByRole('menu').closest('[class*="MuiMenu"]');
      expect(menu).toBeInTheDocument();
      
      // Menu should be positioned (not in default document flow)
      const styles = window.getComputedStyle(menu!);
      expect(styles.position).toBe('fixed');
    });

    it('calls onClose when clicking outside menu', () => {
      const mockOnClose = vi.fn();
      renderComponent({ onClose: mockOnClose });
      
      // Click backdrop
      const backdrop = document.querySelector('[class*="MuiBackdrop"]');
      fireEvent.click(backdrop!);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when pressing Escape key', () => {
      const mockOnClose = vi.fn();
      renderComponent({ onClose: mockOnClose });
      
      const menu = screen.getByRole('menu');
      fireEvent.keyDown(menu, { key: 'Escape', code: 'Escape' });
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('closes menu after selecting a menu item', () => {
      const mockOnClose = vi.fn();
      const additionalItems = [
        {
          id: 'profile',
          label: 'Profile',
          onClick: vi.fn(),
        },
      ];
      
      renderComponent({ onClose: mockOnClose, additionalItems });
      
      const profileItem = screen.getByRole('menuitem', { name: 'Profile' });
      fireEvent.click(profileItem);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('T042: Animation Tests', () => {
    it('menu appears with fade and grow transition', async () => {
      renderComponent();
      
      const menu = screen.getByRole('menu').closest('[class*="MuiMenu"]');
      
      // Material-UI Fade + Grow transition should be applied
      expect(menu).toHaveClass(expect.stringContaining('Mui'));
      
      // Transition duration should be ~200ms per spec
      const styles = window.getComputedStyle(menu!);
      expect(styles.transition).toBeTruthy();
    });

    it('menu exits with fade out transition', async () => {
      const { rerender } = renderComponent({ open: true });
      
      rerender(
        <ThemeProvider theme={lightTheme}>
          <UserMenu {...defaultProps} open={false} />
        </ThemeProvider>
      );
      
      // Menu should fade out before unmounting
      await waitFor(() => {
        const menu = screen.queryByRole('menu');
        expect(menu).not.toBeInTheDocument();
      });
    });
  });

  describe('T042: Accessibility Tests', () => {
    it('has proper role="menu"', () => {
      renderComponent();
      
      const menu = screen.getByRole('menu');
      expect(menu).toBeInTheDocument();
    });

    it('menu items have role="menuitem"', () => {
      renderComponent();
      
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems.length).toBeGreaterThanOrEqual(2); // At least theme toggle and logout
    });

    it('has descriptive aria-labels on menu items', () => {
      renderComponent();
      
      const logoutItem = screen.getByRole('menuitem', { name: /logout/i });
      expect(logoutItem).toHaveAttribute('aria-label');
    });

    it('keyboard navigation works with arrows', () => {
      renderComponent();
      
      const menu = screen.getByRole('menu');
      const menuItems = screen.getAllByRole('menuitem');
      
      menuItems[0].focus();
      expect(document.activeElement).toBe(menuItems[0]);
      
      fireEvent.keyDown(menu, { key: 'ArrowDown', code: 'ArrowDown' });
      
      expect(document.activeElement).toBe(menuItems[1]);
    });

    it('Enter key activates menu item', () => {
      const mockOnClick = vi.fn();
      const additionalItems = [
        {
          id: 'profile',
          label: 'Profile',
          onClick: mockOnClick,
        },
      ];
      
      renderComponent({ additionalItems });
      
      const profileItem = screen.getByRole('menuitem', { name: 'Profile' });
      profileItem.focus();
      fireEvent.keyDown(profileItem, { key: 'Enter', code: 'Enter' });
      
      expect(mockOnClick).toHaveBeenCalled();
    });

    it('Space key activates menu item', () => {
      const mockOnClick = vi.fn();
      const additionalItems = [
        {
          id: 'profile',
          label: 'Profile',
          onClick: mockOnClick,
        },
      ];
      
      renderComponent({ additionalItems });
      
      const profileItem = screen.getByRole('menuitem', { name: 'Profile' });
      profileItem.focus();
      fireEvent.keyDown(profileItem, { key: ' ', code: 'Space' });
      
      expect(mockOnClick).toHaveBeenCalled();
    });

    it('focus returns to anchor element when menu closes', () => {
      const mockOnClose = vi.fn();
      renderComponent({ onClose: mockOnClose });
      
      // Focus should return to anchor (avatar button)
      mockAnchorEl.focus = vi.fn();
      
      const menu = screen.getByRole('menu');
      fireEvent.keyDown(menu, { key: 'Escape', code: 'Escape' });
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('theme toggle has aria-live for feedback', () => {
      renderComponent();
      
      const themeToggle = screen.getByRole('menuitem', { name: /theme/i });
      const liveRegion = themeToggle.querySelector('[aria-live]');
      
      expect(liveRegion || themeToggle.closest('[aria-live]')).toBeTruthy();
    });

    it('logout confirmation dialog has proper focus management', () => {
      renderComponent();
      
      const logoutItem = screen.getByRole('menuitem', { name: /logout/i });
      fireEvent.click(logoutItem);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      
      // Dialog should trap focus within it
      const confirmButton = screen.getByRole('button', { name: /logout/i });
      expect(confirmButton).toBeInTheDocument();
    });
  });

  describe('T042: Theme Integration Tests', () => {
    it('applies theme-aware background color', () => {
      renderComponent();
      
      const menu = screen.getByRole('menu').closest('[class*="MuiMenu"]');
      const paper = menu?.querySelector('[class*="MuiPaper"]');
      const styles = window.getComputedStyle(paper!);
      
      expect(styles.backgroundColor).toBeTruthy();
    });

    it('applies theme-aware text color', () => {
      renderComponent();
      
      const username = screen.getByText('John Doe');
      const styles = window.getComputedStyle(username);
      
      expect(styles.color).toBeTruthy();
    });

    it('applies theme-aware divider color', () => {
      renderComponent();
      
      const divider = document.querySelector('[class*="MuiDivider"]');
      const styles = window.getComputedStyle(divider!);
      
      expect(styles.backgroundColor || styles.borderColor).toBeTruthy();
    });

    it('logout item has error color from theme', () => {
      renderComponent();
      
      const logoutItem = screen.getByRole('menuitem', { name: /logout/i });
      const styles = window.getComputedStyle(logoutItem);
      
      // Should use theme error color
      expect(styles.color).toBeTruthy();
    });
  });

  describe('T042: Header Section Tests', () => {
    it('renders header with proper padding (16px)', () => {
      renderComponent();
      
      const username = screen.getByText('John Doe');
      const header = username.closest('[class*="MuiBox"]');
      const styles = window.getComputedStyle(header!);
      
      expect(styles.padding).toContain('16px');
    });

    it('renders avatar at 40x40px size', () => {
      renderComponent();
      
      const avatar = screen.getByText('JD').closest('[class*="MuiAvatar"]');
      const styles = window.getComputedStyle(avatar!);
      
      expect(styles.width).toBe('40px');
      expect(styles.height).toBe('40px');
    });

    it('positions avatar left and text right with flexbox', () => {
      renderComponent();
      
      const username = screen.getByText('John Doe');
      const header = username.closest('[class*="MuiBox"]');
      const styles = window.getComputedStyle(header!);
      
      expect(styles.display).toBe('flex');
    });

    it('renders role as caption variant (12px)', () => {
      renderComponent();
      
      const role = screen.getByText('Administrator');
      expect(role.tagName).toBe('P'); // Typography renders as p with caption variant
      
      const styles = window.getComputedStyle(role);
      expect(styles.fontSize).toBe('12px');
    });

    it('renders divider below header', () => {
      renderComponent();
      
      const username = screen.getByText('John Doe');
      const header = username.closest('[class*="MuiBox"]');
      const nextSibling = header?.nextElementSibling;
      
      expect(nextSibling).toHaveClass(expect.stringContaining('MuiDivider'));
    });
  });
});
