import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { AuthProvider } from '../contexts/AuthContext';
import * as authService from '../services/authService';

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
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  describe('Rendering', () => {
    it('should render the login form with all required fields', () => {
      renderLoginPage();

      expect(screen.getByRole('heading', { name: /AIDD EMS/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should render password field with masked input', () => {
      renderLoginPage();

      const passwordField = screen.getByLabelText(/password/i);
      expect(passwordField).toHaveAttribute('type', 'password');
    });

    it('should have the username field focused on mount', () => {
      renderLoginPage();

      const usernameField = screen.getByLabelText(/username/i);
      expect(usernameField).toHaveFocus();
    });
  });

  describe('Form Validation', () => {
    it('should show validation error when username is empty', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      });
    });

    it('should show validation error when username is less than 3 characters', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const usernameField = screen.getByLabelText(/username/i);
      await user.type(usernameField, 'ab');
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument();
      });
    });

    it('should show validation error when password is empty', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('should show validation error when password is less than 8 characters', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const passwordField = screen.getByLabelText(/password/i);
      await user.type(passwordField, 'pass123');
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });
    });

    it('should not show validation errors when inputs are valid', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const usernameField = screen.getByLabelText(/username/i);
      const passwordField = screen.getByLabelText(/password/i);

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

      const usernameField = screen.getByLabelText(/username/i);
      const passwordField = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

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

      const usernameField = screen.getByLabelText(/username/i);
      const passwordField = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

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

      const usernameField = screen.getByLabelText(/username/i);
      const passwordField = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

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

      const usernameField = screen.getByLabelText(/username/i);
      const passwordField = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

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

      const usernameField = screen.getByLabelText(/username/i);
      const passwordField = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

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

      const usernameField = screen.getByLabelText(/username/i);
      const passwordField = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

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

      const usernameField = screen.getByLabelText(/username/i);
      const passwordField = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

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

      const usernameField = screen.getByLabelText(/username/i);
      const passwordField = screen.getByLabelText(/password/i);

      expect(usernameField).toHaveAttribute('aria-label', 'Username');
      expect(usernameField).toHaveAttribute('aria-required', 'true');
      expect(passwordField).toHaveAttribute('aria-label', 'Password');
      expect(passwordField).toHaveAttribute('aria-required', 'true');
    });

    it('should mark fields as invalid when validation fails', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        const usernameField = screen.getByLabelText(/username/i);
        const passwordField = screen.getByLabelText(/password/i);

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

      const usernameField = screen.getByLabelText(/username/i);
      const passwordField = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameField, 'Wrong');
      await user.type(passwordField, 'WrongPass123');
      await user.click(submitButton);

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
      });
    });
  });
});
