import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';

// Test component that consumes AuthContext
function TestComponent() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div data-testid="authenticated">{isAuthenticated ? 'Yes' : 'No'}</div>
      <div data-testid="user-id">{user?.userId || 'None'}</div>
      <div data-testid="username">{user?.username || 'None'}</div>
    </div>
  );
}

describe('AuthContext - Session Persistence Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should restore session from localStorage/cookie on mount', async () => {
    // Arrange: Mock successful session validation
    const mockValidateSession = vi.spyOn(authService, 'validateSession').mockResolvedValue({
      success: true,
      data: {
        userId: 1,
        username: 'Admin',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        isValid: true
      }
    });
    // Act: Render AuthProvider which calls checkSession on mount
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initially loading should be true
    expect(screen.getByText('Loading...')).toBeDefined();

    // Assert: Wait for session validation to complete
    await waitFor(() => {
      expect(mockValidateSession).toHaveBeenCalledOnce();
    });

    // User state should be restored
    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('Yes');
      expect(screen.getByTestId('user-id').textContent).toBe('1');
      expect(screen.getByTestId('username').textContent).toBe('Admin');
    });
  });

  it('should clear user state when session validation fails', async () => {
    // Arrange: Mock failed session validation
    const mockValidateSession = vi.spyOn(authService, 'validateSession').mockRejectedValue({
      success: false,
      errorCode: 'SEC-02-002'
    });

    // Mock console.error to avoid test output noise
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Act: Render AuthProvider
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Assert: Wait for session validation attempt
    await waitFor(() => {
      expect(mockValidateSession).toHaveBeenCalledOnce();
    });

    // User state should be null (not authenticated)
    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('No');
      expect(screen.getByTestId('user-id').textContent).toBe('None');
      expect(screen.getByTestId('username').textContent).toBe('None');
    });

    // Console error should have been logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[AuthContext] Session validation error'),
      expect.anything()
    );

    consoleErrorSpy.mockRestore();
  });

  it('should handle session validation with invalid data gracefully', async () => {
    // Arrange: Mock session validation with success but no data
    const mockValidateSession = vi.spyOn(authService, 'validateSession').mockResolvedValue({
      success: true,
      data: null
    });

    // Act: Render AuthProvider
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Assert: Wait for session validation
    await waitFor(() => {
      expect(mockValidateSession).toHaveBeenCalledOnce();
    });

    // User state should be null (no data to restore)
    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('No');
      expect(screen.getByTestId('user-id').textContent).toBe('None');
      expect(screen.getByTestId('username').textContent).toBe('None');
    });
  });

  it('should expose loading state during session check', async () => {
    // Arrange: Mock validateSession with delay
    const mockValidateSession = vi.spyOn(authService, 'validateSession').mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            data: {
              userId: 1,
              username: 'Admin',
              expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
              isValid: true
            }
          });
        }, 100); // 100ms delay
      });
    });

    // Act: Render AuthProvider
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Assert: Loading state should be true initially
    expect(screen.getByText('Loading...')).toBeDefined();

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).toBeNull();
    }, { timeout: 500 });

    // User should be authenticated after loading
    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('Yes');
    });

    expect(mockValidateSession).toHaveBeenCalledOnce();
  });

  it('should handle network errors during session validation', async () => {
    // Arrange: Mock network error
    const mockValidateSession = vi.spyOn(authService, 'validateSession').mockRejectedValue(
      new Error('Network request failed')
    );

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Act: Render AuthProvider
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Assert: Wait for error handling
    await waitFor(() => {
      expect(mockValidateSession).toHaveBeenCalledOnce();
    });

    // User should not be authenticated
    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('No');
    });

    // Error should be logged
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
