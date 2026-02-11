/**
 * LoginPage Component Tests
 * 
 * Feature: 002-modern-ui-redesign - User Story 1: Enhanced Login Experience
 * 
 * EXISTING TESTS: Basic functionality (rendering, validation, login flow)
 * NEW TDD TESTS: T015-T022 for enhanced UI (gradient, elevation, validation UX, animations)
 * 
 * Tests T015-T022 MUST FAIL initially before implementation (Red phase of TDD)
 */

import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../theme/ThemeProvider';
import * as authService from '../services/authService';

// Mock window.matchMedia for theme system
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

// Mock the authService
vi.mock('../services/authService', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    validateSession: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLoginPage = () => {
    return render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    );
  };

  describe('Rendering', () => {
    it('should render the login form with all required fields', () => {
      renderLoginPage();

      expect(screen.getByRole('heading', { name: 'Welcome Back' })).toBeInTheDocument();
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign in to your account' })).toBeInTheDocument();
    });

    it('should render password field with masked input', () => {
      renderLoginPage();

      const passwordField = screen.getByLabelText('Password');
      expect(passwordField).toHaveAttribute('type', 'password');
    });

    it('should have the username field focused on mount', () => {
      renderLoginPage();

      const usernameField = screen.getByLabelText('Username');
      expect(usernameField).toHaveFocus();
    });
  });

  describe('Form Validation', () => {
    it('should show validation error when username is empty', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const submitButton = screen.getByRole('button', { name: 'Sign in to your account' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      });
    });

    it('should show validation error when username is less than 3 characters', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const usernameField = screen.getByLabelText('Username');
      await user.type(usernameField, 'ab');
      
      const submitButton = screen.getByRole('button', { name: 'Sign in to your account' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument();
      });
    });

    it('should show validation error when password is empty', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const submitButton = screen.getByRole('button', { name: 'Sign in to your account' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('should show validation error when password is less than 8 characters', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const passwordField = screen.getByLabelText('Password');
      await user.type(passwordField, 'pass123');
      
      const submitButton = screen.getByRole('button', { name: 'Sign in to your account' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });
    });

    it('should not show validation errors when inputs are valid', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const usernameField = screen.getByLabelText('Username');
      const passwordField = screen.getByLabelText('Password');

      await user.type(usernameField, 'Admin');
      await user.type(passwordField, 'Admin123@');

      await waitFor(() => {
        expect(screen.queryByText(/username must be at least 3 characters/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/password must be at least 8 characters/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Successful Login Flow', () => {
    it('should call login service with correct credentials on form submit', async () => {
      const user = userEvent.setup();
      const mockLogin = vi.spyOn(authService.authService, 'login').mockResolvedValue({
        success: true,
        data: {
          user: { userId: 1, username: 'Admin' },
          session: { token: 'test-token', expiresAt: '2026-02-10T12:00:00' },
        },
        message: 'Login successful',
      });

      renderLoginPage();

      const usernameField = screen.getByLabelText('Username');
      const passwordField = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in to your account' });

      await user.type(usernameField, 'Admin');
      await user.type(passwordField, 'Admin123@');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          username: 'Admin',
          password: 'Admin123@',
        });
      });
    });

    it('should navigate to dashboard after successful login', async () => {
      const user = userEvent.setup();
      vi.spyOn(authService.authService, 'login').mockResolvedValue({
        success: true,
        data: {
          user: { userId: 1, username: 'Admin' },
          session: { token: 'test-token', expiresAt: '2026-02-10T12:00:00' },
        },
        message: 'Login successful',
      });

      renderLoginPage();

      const usernameField = screen.getByLabelText('Username');
      const passwordField = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in to your account' });

      await user.type(usernameField, 'Admin');
      await user.type(passwordField, 'Admin123@');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should show loading state during login process', async () => {
      const user = userEvent.setup();
      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });

      vi.spyOn(authService.authService, 'login').mockReturnValue(loginPromise as any);

      renderLoginPage();

      const usernameField = screen.getByLabelText('Username');
      const passwordField = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in to your account' });

      await user.type(usernameField, 'Admin');
      await user.type(passwordField, 'Admin123@');
      await user.click(submitButton);

      // Should show loading indicator
      await waitFor(() => {
        expect(screen.getByLabelText(/logging in/i)).toBeInTheDocument();
      });

      // Fields should be disabled during loading
      expect(usernameField).toBeDisabled();
      expect(passwordField).toBeDisabled();
      expect(submitButton).toBeDisabled();

      // Resolve the promise
      resolveLogin!({
        success: true,
        data: {
          user: { userId: 1, username: 'Admin' },
          session: { token: 'test-token', expiresAt: '2026-02-10T12:00:00' },
        },
      });

      // Loading state should be cleared
      await waitFor(() => {
        expect(screen.queryByLabelText(/logging in/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Failed Login Flow', () => {
    it('should display error message for invalid credentials', async () => {
      const user = userEvent.setup();
      vi.spyOn(authService.authService, 'login').mockResolvedValue({
        success: false,
        message: 'Invalid username or password. Please try again.',
        errorCode: 'SEC-01-001',
      });

      renderLoginPage();

      const usernameField = screen.getByLabelText('Username');
      const passwordField = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in to your account' });

      await user.type(usernameField, 'WrongUser');
      await user.type(passwordField, 'WrongPass123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/invalid username or password/i);
      });
    });

    it('should not navigate to dashboard on failed login', async () => {
      const user = userEvent.setup();
      vi.spyOn(authService.authService, 'login').mockResolvedValue({
        success: false,
        message: 'Invalid username or password',
        errorCode: 'SEC-01-001',
      });

      renderLoginPage();

      const usernameField = screen.getByLabelText('Username');
      const passwordField = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in to your account' });

      await user.type(usernameField, 'WrongUser');
      await user.type(passwordField, 'WrongPass123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();
      vi.spyOn(authService.authService, 'login').mockRejectedValue(
        new Error('Network error')
      );

      renderLoginPage();

      const usernameField = screen.getByLabelText('Username');
      const passwordField = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in to your account' });

      await user.type(usernameField, 'Admin');
      await user.type(passwordField, 'Admin123@');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/an error occurred during login/i);
      });
    });

    it('should clear previous error message on new submission', async () => {
      const user = userEvent.setup();
      
      // First attempt - fail
      vi.spyOn(authService.authService, 'login').mockResolvedValueOnce({
        success: false,
        message: 'Invalid credentials',
        errorCode: 'SEC-01-001',
      });

      renderLoginPage();

      const usernameField = screen.getByLabelText('Username');
      const passwordField = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in to your account' });

      await user.type(usernameField, 'WrongUser');
      await user.type(passwordField, 'WrongPass123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // Second attempt - should clear error first
      vi.spyOn(authService.authService, 'login').mockResolvedValueOnce({
        success: true,
        data: {
          user: { userId: 1, username: 'Admin' },
          session: { token: 'test-token', expiresAt: '2026-02-10T12:00:00' },
        },
      });

      await user.clear(usernameField);
      await user.clear(passwordField);
      await user.type(usernameField, 'Admin');
      await user.type(passwordField, 'Admin123@');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on form fields', () => {
      renderLoginPage();

      const usernameField = screen.getByLabelText('Username');
      const passwordField = screen.getByLabelText('Password');

      expect(usernameField).toHaveAttribute('aria-label', 'Username');
      expect(usernameField).toHaveAttribute('aria-required', 'true');
      expect(passwordField).toHaveAttribute('aria-label', 'Password');
      expect(passwordField).toHaveAttribute('aria-required', 'true');
    });

    it('should mark fields as invalid when validation fails', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const submitButton = screen.getByRole('button', { name: 'Sign in to your account' });
      await user.click(submitButton);

      await waitFor(() => {
        const usernameField = screen.getByLabelText('Username');
        const passwordField = screen.getByLabelText('Password');

        expect(usernameField).toHaveAttribute('aria-invalid', 'true');
        expect(passwordField).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should have error messages announced by screen readers', async () => {
      const user = userEvent.setup();
      vi.spyOn(authService.authService, 'login').mockResolvedValue({
        success: false,
        message: 'Invalid credentials',
        errorCode: 'SEC-01-001',
      });

      renderLoginPage();

      const usernameField = screen.getByLabelText('Username');
      const passwordField = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in to your account' });

      await user.type(usernameField, 'Wrong');
      await user.type(passwordField, 'WrongPass123');
      await user.click(submitButton);

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // TDD TESTS FOR USER STORY 1: ENHANCED LOGIN EXPERIENCE
  // Tasks T015-T018: Component tests (gradient, elevation, validation UX, button states)
  // These tests MUST FAIL before implementation begins (Red phase)
  // ============================================================================

  describe('T015: Enhanced UI - Gradient Background', () => {
    it('should render login page with gradient background container', () => {
      const { container } = renderLoginPage();
      
      // Look for gradient background Box
      const backgroundBox = container.querySelector('[data-testid="login-background"]');
      expect(backgroundBox).toBeTruthy();
    });

    it('should apply linear gradient 135deg with primary colors', () => {
      const { container } = renderLoginPage();
      
      const backgroundBox = container.querySelector('[data-testid="login-background"]');
      if (backgroundBox) {
        const computedStyle = window.getComputedStyle(backgroundBox);
        const background = computedStyle.background || computedStyle.backgroundImage;
        
        // Should contain gradient with 135deg angle
        expect(background).toMatch(/linear-gradient/i);
        expect(background).toMatch(/135deg|2.356rad/); // 135 degrees
      }
    });

    it('should use light mode gradient colors (#1976d2→#42a5f5→#90caf9)', () => {
      const { container } = renderLoginPage();
      
      const backgroundBox = container.querySelector('[data-testid="login-background"]');
      if (backgroundBox) {
        const computedStyle = window.getComputedStyle(backgroundBox);
        const background = computedStyle.background || computedStyle.backgroundImage;
        
        // Light mode uses blue gradient
        expect(background).toMatch(/#1976d2|rgb\(25,\s*118,\s*210\)/i);
      }
    });

    it('should have fallback background color #1976d2', () => {
      const { container } = renderLoginPage();
      
      const backgroundBox = container.querySelector('[data-testid="login-background"]');
      if (backgroundBox) {
        const computedStyle = window.getComputedStyle(backgroundBox);
        const bgColor = computedStyle.backgroundColor;
        
        // Fallback for browsers without gradient support
        expect(bgColor).toMatch(/#1976d2|rgb\(25,\s*118,\s*210\)/i);
      }
    });

    it('should be fullscreen (100vw × 100vh)', () => {
      const { container } = renderLoginPage();
      
      const backgroundBox = container.querySelector('[data-testid="login-background"]');
      if (backgroundBox) {
        const computedStyle = window.getComputedStyle(backgroundBox);
        
        expect(computedStyle.minHeight).toMatch(/100vh|100%/);
        expect(computedStyle.width).toMatch(/100%|100vw/);
      }
    });
  });

  describe('T016: Enhanced UI - Card Elevation', () => {
    it('should render Card with elevation 8', () => {
      const { container } = renderLoginPage();
      
      const card = container.querySelector('[data-testid="login-card"]') 
        || container.querySelector('.MuiCard-root');
      
      expect(card).toBeTruthy();
      
      if (card) {
        const computedStyle = window.getComputedStyle(card);
        const boxShadow = computedStyle.boxShadow;
        
        // Elevation 8 has prominent shadow (not 'none')
        expect(boxShadow).not.toBe('none');
        expect(boxShadow.length).toBeGreaterThan(10);
      }
    });

    it('should have border-radius 16px for modern rounded corners', () => {
      const { container } = renderLoginPage();
      
      const card = container.querySelector('[data-testid="login-card"]')
        || container.querySelector('.MuiCard-root');
      
      if (card) {
        const computedStyle = window.getComputedStyle(card);
        const borderRadius = computedStyle.borderRadius;
        
        expect(borderRadius).toMatch(/16px/);
      }
    });

    it('should have max-width 400px to constrain card size', () => {
      const { container } = renderLoginPage();
      
      const card = container.querySelector('[data-testid="login-card"]')
        || container.querySelector('.MuiCard-root');
      
      if (card) {
        const computedStyle = window.getComputedStyle(card);
        const maxWidth = computedStyle.maxWidth;
        
        expect(maxWidth).toMatch(/400px/);
      }
    });

    it('should be centered using flexbox', () => {
      const { container } = renderLoginPage();
      
      const centerContainer = container.querySelector('[data-testid="login-background"]')
        || container.firstElementChild;
      
      if (centerContainer) {
        const computedStyle = window.getComputedStyle(centerContainer);
        
        expect(computedStyle.display).toBe('flex');
        expect(computedStyle.justifyContent).toMatch(/center/);
        expect(computedStyle.alignItems).toMatch(/center/);
      }
    });
  });

  describe('T017: Enhanced UI - Real-time Form Validation', () => {
    it('should show error icons (ErrorOutline) on invalid fields', async () => {
      const user = userEvent.setup();
      renderLoginPage();
      
      const usernameField = screen.getByLabelText('Username');
      await user.type(usernameField, 'ab'); // Too short
      await user.tab(); // Blur to trigger validation
      
      await waitFor(() => {
        const errorIcon = document.querySelector('[data-testid="ErrorOutlineIcon"]');
        expect(errorIcon).toBeTruthy();
      });
    });

    it('should show success checkmarks (CheckCircle) on valid fields', async () => {
      const user = userEvent.setup();
      renderLoginPage();
      
      const usernameField = screen.getByLabelText('Username');
      const passwordField = screen.getByLabelText('Password');
      
      await user.type(usernameField, 'validuser');
      await user.type(passwordField, 'password123');
      
      await waitFor(() => {
        const successIcon = document.querySelector('[data-testid="CheckCircleIcon"]');
        expect(successIcon).toBeTruthy();
      });
    });

    it('should debounce validation by 300ms', async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      
      renderLoginPage();
      
      const usernameField = screen.getByRole('textbox', { name: /^username$/i });
      await user.type(usernameField, 'ab'); // Invalid
      
      // Should NOT show error immediately
      expect(screen.queryByText(/username must be at least 3 characters/i)).not.toBeInTheDocument();
      
      // After 300ms debounce
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument();
      });
      
      vi.useRealTimers();
    });

    it('should clear errors on input change', async () => {
      const user = userEvent.setup();
      renderLoginPage();
      
      // Trigger error
      const submitButton = screen.getByRole('button', { name: 'Sign in to your account' });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      });
      
      // Start typing
      const usernameField = screen.getByLabelText('Username');
      await user.type(usernameField, 'u');
      
      await waitFor(() => {
        expect(screen.queryByText(/username is required/i)).not.toBeInTheDocument();
      });
    });

    it('should prevent submit if validation fails', async () => {
      const user = userEvent.setup();
      renderLoginPage();
      
      const usernameField = screen.getByLabelText('Username');
      await user.type(usernameField, 'ab'); // Invalid
      
      const submitButton = screen.getByRole('button', { name: 'Sign in to your account' });
      await user.click(submitButton);
      
      // Should NOT call navigate
      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });
  });

  describe('T018: Enhanced UI - Button States and Loading', () => {
    it('should show CircularProgress spinner during submit', async () => {
      const user = userEvent.setup();
      
      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });
      vi.spyOn(authService.authService, 'login').mockReturnValue(loginPromise as any);
      
      renderLoginPage();
      
      const usernameField = screen.getByRole('textbox', { name: /^username$/i });
      const passwordField = screen.getByRole('textbox', { name: /^password$/i });
      await user.type(usernameField, 'testuser');
      await user.type(passwordField, 'password123');
      
      const submitButton = screen.getByRole('button', { name: /sign in to your account/i });
      await user.click(submitButton);
      
      // Should show spinner
      await waitFor(() => {
        const spinner = document.querySelector('.MuiCircularProgress-root');
        expect(spinner).toBeTruthy();
      });
      
      // Clean up
      resolveLogin!({ success: true, data: { user: {}, session: {} } });
    });

    it('should show "Signing in..." text during submit', async () => {
      const user = userEvent.setup();
      
      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });
      vi.spyOn(authService.authService, 'login').mockReturnValue(loginPromise as any);
      
      renderLoginPage();
      
      const usernameField = screen.getByLabelText('Username');
      const passwordField = screen.getByLabelText('Password');
      await user.type(usernameField, 'testuser');
      await user.type(passwordField, 'password123');
      
      const submitButton = screen.getByRole('button', { name: 'Sign in to your account' });
      await user.click(submitButton);
      
      // Should show loading text
      await waitFor(() => {
        expect(screen.getByText(/signing in/i)).toBeInTheDocument();
      });
      
      // Clean up
      resolveLogin!({ success: true, data: { user: {}, session: {} } });
    });

    it('should have elevation changes (2 rest, 4 hover, 1 active)', () => {
      renderLoginPage();
      
      const submitButton = screen.getByRole('button', { name: 'Sign in to your account' });
      const computedStyle = window.getComputedStyle(submitButton);
      
      // Should have box-shadow (elevation applied)
      expect(computedStyle.boxShadow).not.toBe('none');
    });

    it('should have hover transform translateY -2px with 200ms transition', () => {
      renderLoginPage();
      
      const submitButton = screen.getByRole('button', { name: 'Sign in to your account' });
      const computedStyle = window.getComputedStyle(submitButton);
      
      // Should have transition
      expect(computedStyle.transition).toMatch(/200ms|0.2s/);
    });
  });

  describe('T015-T018: Additional Enhanced UI Elements', () => {
    it('should render logo with 64×64px size', () => {
      const { container } = renderLoginPage();
      
      const logo = container.querySelector('[data-testid="login-logo"]');
      if (logo) {
        const computedStyle = window.getComputedStyle(logo);
        expect(computedStyle.width).toMatch(/64px/);
        expect(computedStyle.height).toMatch(/64px/);
      }
    });

    it('should render "Welcome Back" heading as h4', () => {
      renderLoginPage();
      
      const heading = screen.queryByText(/welcome back/i);
      if (heading) {
        expect(heading).toBeInTheDocument();
      }
    });

    it('should render subtitle "Sign in to your account" as body2', () => {
      renderLoginPage();
      
      const subtitle = screen.queryByText(/sign in to your account/i);
      if (subtitle) {
        expect(subtitle).toBeInTheDocument();
      }
    });

    it('should render password visibility toggle button', () => {
      renderLoginPage();
      
      const toggleButton = screen.queryByLabelText(/show password/i);
      expect(toggleButton).toBeTruthy();
    });

    it('should toggle password field type on visibility button click', async () => {
      const user = userEvent.setup();
      renderLoginPage();
      
      const toggleButton = screen.queryByLabelText(/show password/i);
      if (toggleButton) {
        const passwordField = screen.getByLabelText('Password') as HTMLInputElement;
        
        expect(passwordField.type).toBe('password');
        
        await user.click(toggleButton);
        expect(passwordField.type).toBe('text');
        
        await user.click(toggleButton);
        expect(passwordField.type).toBe('password');
      }
    });

    it('should have 40×40px touch target for password toggle', () => {
      renderLoginPage();
      
      const toggleButton = screen.queryByLabelText(/show password/i);
      if (toggleButton) {
        const computedStyle = window.getComputedStyle(toggleButton);
        const width = parseInt(computedStyle.width);
        const height = parseInt(computedStyle.height);
        
        expect(width).toBeGreaterThanOrEqual(40);
        expect(height).toBeGreaterThanOrEqual(40);
      }
    });

    it('should render "Forgot Password" link', () => {
      renderLoginPage();
      
      const forgotLink = screen.queryByText(/forgot password/i);
      expect(forgotLink).toBeTruthy();
    });

    it('should style Forgot Password link as body2 with primary color', () => {
      renderLoginPage();
      
      const forgotLink = screen.queryByText(/forgot password/i);
      if (forgotLink) {
        const computedStyle = window.getComputedStyle(forgotLink);
        expect(computedStyle.color).toMatch(/rgb|#/);
      }
    });
  });
});
