import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Dashboard } from './Dashboard';
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

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful session validation
    vi.spyOn(authService.authService, 'validateSession').mockResolvedValue({
      success: true,
      data: { userId: 1, username: 'TestUser', expiresAt: '2026-02-10T12:00:00', isValid: true },
    });
  });

  const renderDashboard = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  describe('Rendering', () => {
    it('should render the dashboard with user welcome message', async () => {
      renderDashboard();

      // Wait for auth context to load
      await waitFor(() => {
        expect(screen.getByText(/welcome/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/aidd ems.*dashboard/i)).toBeInTheDocument();
    });

    it('should display logout button', async () => {
      renderDashboard();

      await waitFor(() => {
        const logoutButton = screen.getByRole('button', { name: /logout/i });
        expect(logoutButton).toBeInTheDocument();
      });
    });

    it('should display session information section', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/session information/i)).toBeInTheDocument();
      });
    });

    it('should display user avatar with first letter of username', async () => {
      renderDashboard();

      await waitFor(() => {
        // Check for avatar with user initial "U"
        const avatarElement = screen.getByText('U');
        expect(avatarElement.closest('.MuiAvatar-root')).toBeInTheDocument();
      });
    });
  });

  describe('Logout Functionality', () => {
    it('should call logout service when logout button is clicked', async () => {
      const user = userEvent.setup();
      const mockLogout = vi.spyOn(authService.authService, 'logout').mockResolvedValue();

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
      });

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      await user.click(logoutButton);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
      });
    });

    it('should navigate to login page after logout', async () => {
      const user = userEvent.setup();
      vi.spyOn(authService.authService, 'logout').mockResolvedValue();

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
      });

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      await user.click(logoutButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on logout button', async () => {
      renderDashboard();

      await waitFor(() => {
        const logoutButton = screen.getByRole('button', { name: /logout/i });
        expect(logoutButton).toHaveAttribute('aria-label', 'Logout');
      });
    });

    it('should have tooltip on logout button', async () => {
      renderDashboard();

      await waitFor(() => {
        const logoutButton = screen.getByRole('button', { name: /logout/i });
        expect(logoutButton).toHaveAttribute('title', 'End your session securely');
      });
    });
  });

  describe('Content', () => {
    it('should display upcoming features section', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/dashboard features.*coming soon/i)).toBeInTheDocument();
      });
    });

    it('should show feature list items', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/user management/i)).toBeInTheDocument();
        expect(screen.getByText(/system analytics/i)).toBeInTheDocument();
        expect(screen.getByText(/reports and monitoring/i)).toBeInTheDocument();
      });
    });
  });
});
