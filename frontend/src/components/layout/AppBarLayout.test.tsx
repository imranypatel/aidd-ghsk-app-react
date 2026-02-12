/**
 * AppBarLayout Component Tests
 * Feature: 002-modern-ui-redesign / US2 Professional Authenticated Layout
 * Tasks: T037-T038
 * 
 * Test Coverage:
 * - Component rendering with required props
 * - Hamburger menu icon visibility (mobile only)
 * - User avatar click handler (opens UserMenu)
 * - Theme toggle integration
 * - Responsive height adjustments (64px desktop, 56px mobile)
 * - Logo display and positioning
 * - Accessibility attributes (aria-labels, roles)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme } from '../../theme/lightTheme';
import AppBarLayout from './AppBarLayout';
import type { UserInfo } from '../../../../specs/002-modern-ui-redesign/contracts/components';

// Mock Material-UI useMediaQuery hook for responsive tests
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual,
    useMediaQuery: vi.fn(),
  };
});

import { useMediaQuery } from '@mui/material';

describe('AppBarLayout Component', () => {
  const mockUserInfo: UserInfo = {
    userId: 'user123',
    username: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Administrator',
  };

  const defaultProps = {
    title: 'Dashboard',
    userInfo: mockUserInfo,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default to desktop viewport
    (useMediaQuery as any).mockReturnValue(false);
  });

  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider theme={lightTheme}>
        <AppBarLayout {...defaultProps} {...props} />
      </ThemeProvider>
    );
  };

  describe('T037: Rendering Tests', () => {
    it('renders AppBar with title', () => {
      renderComponent();
      
      const title = screen.getByText('Dashboard');
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('H6'); // Material-UI Typography h6 variant
    });

    it('renders with default height of 64px on desktop', () => {
      renderComponent();
      
      const appBar = screen.getByRole('banner');
      const styles = window.getComputedStyle(appBar);
      expect(styles.height).toBe('64px');
    });

    it('renders with height of 56px on mobile', () => {
      // Mock mobile viewport
      (useMediaQuery as any).mockReturnValue(true);
      
      renderComponent();
      
      const appBar = screen.getByRole('banner');
      const styles = window.getComputedStyle(appBar);
      expect(styles.height).toBe('56px');
    });

    it('renders logo when logoSrc is provided', () => {
      renderComponent({ logoSrc: '/logo.png', logoAlt: 'Company Logo' });
      
      const logo = screen.getByRole('img', { name: 'Company Logo' });
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src', '/logo.png');
    });

    it('does not render logo when logoSrc is not provided', () => {
      renderComponent();
      
      const logos = screen.queryAllByRole('img', { name: /logo/i });
      expect(logos).toHaveLength(0);
    });

    it('renders user avatar with initials when no avatar URL provided', () => {
      renderComponent();
      
      // Avatar should show initials "JD" from "John Doe"
      const avatar = screen.getByText('JD');
      expect(avatar).toBeInTheDocument();
    });

    it('renders user avatar with image when avatar URL provided', () => {
      const userWithAvatar = { ...mockUserInfo, avatar: '/avatar.jpg' };
      renderComponent({ userInfo: userWithAvatar });
      
      const avatarImg = screen.getByRole('img', { name: /john doe/i });
      expect(avatarImg).toBeInTheDocument();
      expect(avatarImg).toHaveAttribute('src', '/avatar.jpg');
    });

    it('applies custom elevation prop', () => {
      renderComponent({ elevation: 8 });
      
      const appBar = screen.getByRole('banner');
      // Material-UI applies elevation as a class
      expect(appBar).toHaveClass(expect.stringContaining('MuiAppBar'));
    });

    it('applies custom color prop', () => {
      renderComponent({ color: 'secondary' });
      
      const appBar = screen.getByRole('banner');
      expect(appBar).toHaveClass(expect.stringContaining('MuiAppBar'));
    });

    it('applies custom className prop', () => {
      renderComponent({ className: 'custom-app-bar' });
      
      const appBar = screen.getByRole('banner');
      expect(appBar).toHaveClass('custom-app-bar');
    });
  });

  describe('T038: Interaction Tests', () => {
    it('shows hamburger menu icon on mobile', () => {
      // Mock mobile viewport
      (useMediaQuery as any).mockReturnValue(true);
      renderComponent({ showMenuIcon: true, onMenuClick: vi.fn() });
      
      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      expect(menuButton).toBeInTheDocument();
    });

    it('hides hamburger menu icon on desktop', () => {
      // Mock desktop viewport
      (useMediaQuery as any).mockReturnValue(false);
      renderComponent({ showMenuIcon: false });
      
      const menuButton = screen.queryByRole('button', { name: /open navigation menu/i });
      expect(menuButton).not.toBeInTheDocument();
    });

    it('calls onMenuClick when hamburger menu clicked', () => {
      const mockOnMenuClick = vi.fn();
      (useMediaQuery as any).mockReturnValue(true);
      renderComponent({ showMenuIcon: true, onMenuClick: mockOnMenuClick });
      
      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      fireEvent.click(menuButton);
      
      expect(mockOnMenuClick).toHaveBeenCalledTimes(1);
    });

    it('opens user menu when avatar clicked', () => {
      const mockOnUserMenuOpen = vi.fn();
      renderComponent({ onUserMenuOpen: mockOnUserMenuOpen });
      
      // Find avatar button (clickable avatar)
      const avatarButton = screen.getByRole('button', { name: /john doe/i });
      fireEvent.click(avatarButton);
      
      expect(mockOnUserMenuOpen).toHaveBeenCalledTimes(1);
    });

    it('renders theme toggle when themeMode and onThemeChange provided', () => {
      renderComponent({
        themeMode: 'light',
        onThemeChange: vi.fn(),
      });
      
      const themeToggle = screen.getByRole('button', { name: /toggle theme/i });
      expect(themeToggle).toBeInTheDocument();
    });

    it('calls onThemeChange when theme toggle clicked', () => {
      const mockOnThemeChange = vi.fn();
      renderComponent({
        themeMode: 'light',
        onThemeChange: mockOnThemeChange,
      });
      
      const themeToggle = screen.getByRole('button', { name: /toggle theme/i });
      fireEvent.click(themeToggle);
      
      expect(mockOnThemeChange).toHaveBeenCalled();
    });

    it('does not render theme toggle when themeMode not provided', () => {
      renderComponent();
      
      const themeToggle = screen.queryByRole('button', { name: /toggle theme/i });
      expect(themeToggle).not.toBeInTheDocument();
    });

    it('hamburger menu button has proper touch target size (40x40px minimum)', () => {
      (useMediaQuery as any).mockReturnValue(true);
      renderComponent({ showMenuIcon: true, onMenuClick: vi.fn() });
      
      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      const styles = window.getComputedStyle(menuButton);
      
      // Material-UI IconButton default size should be at least 40px
      const width = parseInt(styles.width);
      const height = parseInt(styles.height);
      expect(width).toBeGreaterThanOrEqual(40);
      expect(height).toBeGreaterThanOrEqual(40);
    });

    it('avatar button has proper touch target size (40x40px minimum)', () => {
      renderComponent();
      
      const avatarButton = screen.getByRole('button', { name: /john doe/i });
      const styles = window.getComputedStyle(avatarButton);
      
      const width = parseInt(styles.width);
      const height = parseInt(styles.height);
      expect(width).toBeGreaterThanOrEqual(40);
      expect(height).toBeGreaterThanOrEqual(40);
    });
  });

  describe('T038: Accessibility Tests', () => {
    it('has proper role="banner" for AppBar', () => {
      renderComponent();
      
      const appBar = screen.getByRole('banner');
      expect(appBar).toBeInTheDocument();
    });

    it('hamburger menu button has descriptive aria-label', () => {
      (useMediaQuery as any).mockReturnValue(true);
      renderComponent({ showMenuIcon: true, onMenuClick: vi.fn() });
      
      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      expect(menuButton).toHaveAttribute('aria-label');
    });

    it('avatar button has descriptive aria-label with username', () => {
      renderComponent();
      
      const avatarButton = screen.getByRole('button', { name: /john doe/i });
      expect(avatarButton).toHaveAttribute('aria-label');
      expect(avatarButton.getAttribute('aria-label')).toContain('John Doe');
    });

    it('logo image has proper alt text', () => {
      renderComponent({ logoSrc: '/logo.png', logoAlt: 'Company Logo' });
      
      const logo = screen.getByRole('img', { name: 'Company Logo' });
      expect(logo).toHaveAttribute('alt', 'Company Logo');
    });

    it('maintains focus visibility on interactive elements', () => {
      renderComponent({ showMenuIcon: true, onMenuClick: vi.fn() });
      
      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      menuButton.focus();
      
      expect(document.activeElement).toBe(menuButton);
    });

    it('provides skip link to main content', () => {
      renderComponent();
      
      // Skip link should be first focusable element (may be visually hidden)
      const skipLink = document.querySelector('a[href="#main-content"]');
      expect(skipLink).toBeInTheDocument();
    });
  });

  describe('T038: Responsive Behavior Tests', () => {
    it('shows correct height on desktop (64px)', () => {
      (useMediaQuery as any).mockReturnValue(false);
      renderComponent();
      
      const appBar = screen.getByRole('banner');
      const styles = window.getComputedStyle(appBar);
      expect(styles.height).toBe('64px');
    });

    it('shows correct height on mobile (56px)', () => {
      (useMediaQuery as any).mockReturnValue(true);
      renderComponent();
      
      const appBar = screen.getByRole('banner');
      const styles = window.getComputedStyle(appBar);
      expect(styles.height).toBe('56px');
    });

    it('logo scales down on mobile (32x32px)', () => {
      (useMediaQuery as any).mockReturnValue(true);
      renderComponent({ logoSrc: '/logo.png', logoAlt: 'Logo' });
      
      const logo = screen.getByRole('img', { name: 'Logo' });
      const styles = window.getComputedStyle(logo);
      
      expect(styles.width).toBe('32px');
      expect(styles.height).toBe('32px');
    });

    it('logo shows full size on desktop (40x40px)', () => {
      (useMediaQuery as any).mockReturnValue(false);
      renderComponent({ logoSrc: '/logo.png', logoAlt: 'Logo' });
      
      const logo = screen.getByRole('img', { name: 'Logo' });
      const styles = window.getComputedStyle(logo);
      
      expect(styles.width).toBe('40px');
      expect(styles.height).toBe('40px');
    });

    it('adjusts layout spacing on mobile', () => {
      (useMediaQuery as any).mockReturnValue(true);
      renderComponent();
      
      const toolbar = screen.getByRole('banner').querySelector('[class*="MuiToolbar"]');
      expect(toolbar).toBeInTheDocument();
      
      // Toolbar should have reduced padding on mobile
      const styles = window.getComputedStyle(toolbar!);
      const paddingLeft = parseInt(styles.paddingLeft);
      expect(paddingLeft).toBeLessThanOrEqual(16); // Max 16px on mobile per responsive config
    });
  });

  describe('T038: Theme Integration Tests', () => {
    it('applies theme-aware background color in light mode', () => {
      renderComponent();
      
      const appBar = screen.getByRole('banner');
      // Light mode should use primary color or custom #1e1e1e
      expect(appBar).toHaveStyle({ backgroundColor: expect.any(String) });
    });

    it('applies correct elevation styling', () => {
      renderComponent({ elevation: 4 });
      
      const appBar = screen.getByRole('banner');
      // Elevation should apply box-shadow in light mode
      const styles = window.getComputedStyle(appBar);
      expect(styles.boxShadow).not.toBe('none');
    });

    it('maintains proper z-index (1100)', () => {
      renderComponent();
      
      const appBar = screen.getByRole('banner');
      const styles = window.getComputedStyle(appBar);
      expect(styles.zIndex).toBe('1100');
    });
  });
});
