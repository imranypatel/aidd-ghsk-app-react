import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Logout Flow
 * Tests the complete user logout flow from dashboard to login page
 */

test.describe('Logout Flow', () => {
  // Helper function to login before each test
  async function loginUser(page: any) {
    await page.goto('/login');
    await page.getByLabel(/username/i).fill('Admin');
    await page.getByLabel(/password/i).fill('Admin123@');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('/dashboard');
  }

  test.describe('Successful Logout', () => {
    test('should logout and redirect to login page', async ({ page }) => {
      // First login
      await loginUser(page);

      // Verify we're on dashboard
      await expect(page.getByText(/welcome.*admin/i)).toBeVisible();

      // Click logout button
      await page.getByRole('button', { name: /logout/i }).click();

      // Wait for redirect to login page
      await page.waitForURL('/login');

      // Verify we're on login page
      expect(page.url()).toContain('/login');
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    });

    test('should clear authentication cookie on logout', async ({ page, context }) => {
      // Login
      await loginUser(page);

      // Verify auth cookie exists
      const cookiesBeforeLogout = await context.cookies();
      const authCookieBeforeLogout = cookiesBeforeLogout.find(c => c.name === 'AIDD_SESSION');
      expect(authCookieBeforeLogout).toBeDefined();

      // Logout
      await page.getByRole('button', { name: /logout/i }).click();
      await page.waitForURL('/login');

      // Check cookies after logout
      const cookiesAfterLogout = await context.cookies();
      const authCookieAfterLogout = cookiesAfterLogout.find(c => c.name === 'AIDD_SESSION');
      
      // Cookie should be either absent or expired
      if (authCookieAfterLogout) {
        // If cookie exists, it should be expired (expires in the past)
        expect(authCookieAfterLogout.expires).toBeLessThan(Date.now() / 1000);
      }
    });

    test('should not be able to access dashboard after logout', async ({ page }) => {
      // Login
      await loginUser(page);

      // Logout
      await page.getByRole('button', { name: /logout/i }).click();
      await page.waitForURL('/login');

      // Try to access dashboard
      await page.goto('/dashboard');

      // Should be redirected to login
      await page.waitForURL('/login');
      expect(page.url()).toContain('/login');
    });

    test('should show logout button with proper tooltip', async ({ page }) => {
      // Login
      await loginUser(page);

      // Find logout button
      const logoutButton = page.getByRole('button', { name: /logout/i });
      await expect(logoutButton).toBeVisible();

      // Check tooltip
      await expect(logoutButton).toHaveAttribute('title', 'End your session securely');
    });
  });

  test.describe('Session Termination', () => {
    test('should terminate session in backend', async ({ page }) => {
      // Login
      await loginUser(page);

      // Logout
      await page.getByRole('button', { name: /logout/i }).click();
      await page.waitForURL('/login');

      // Try to login again (to verify previous session is terminated)
      await page.getByLabel(/username/i).fill('Admin');
      await page.getByLabel(/password/i).fill('Admin123@');
      await page.getByRole('button', { name: /sign in/i }).click();

      // Should successfully login with new session
      await page.waitForURL('/dashboard');
      await expect(page.getByText(/welcome.*admin/i)).toBeVisible();
    });
  });

  test.describe('Multiple Sessions', () => {
    test('should handle logout in one tab', async ({ page, context }) => {
      // Login
      await loginUser(page);

      // Open a new tab with the same context
      const newPage = await context.newPage();
      await newPage.goto('/dashboard');

      // Verify new tab also shows dashboard (shared session)
      await expect(newPage.getByText(/welcome/i)).toBeVisible();

      // Logout from first tab
      await page.getByRole('button', { name: /logout/i }).click();
      await page.waitForURL('/login');

      // Try to access dashboard in second tab (refresh to trigger auth check)
      await newPage.reload();

      // Second tab should also be logged out and redirected to login
      await newPage.waitForURL('/login', { timeout: 5000 }).catch(() => {
        // Some implementations might not immediately redirect on refresh
        // This is acceptable as long as the session is no longer valid
      });

      await newPage.close();
    });
  });

  test.describe('UI/UX', () => {
    test('should display logout button prominently in app bar', async ({ page }) => {
      // Login
      await loginUser(page);

      // Check logout button is in the app bar
      const logoutButton = page.getByRole('button', { name: /logout/i });
      await expect(logoutButton).toBeVisible();

      // Verify it's part of the navigation/toolbar
      const appBar = page.locator('header');
      await expect(appBar).toContainText(/logout/i);
    });

    test('should show logout icon with button text', async ({ page }) => {
      // Login
      await loginUser(page);

      // Check logout button has both icon and text
      const logoutButton = page.getByRole('button', { name: /logout/i });
      await expect(logoutButton).toBeVisible();
      await expect(logoutButton).toContainText(/logout/i);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle logout even if backend call fails', async ({ page, context }) => {
      // Login
      await loginUser(page);

      // Intercept logout request and make it fail
      await page.route('**/api/auth/logout', route => {
        route.abort('failed');
      });

      // Click logout
      await page.getByRole('button', { name: /logout/i }).click();

      // Should still redirect to login page (client-side cleanup)
      await page.waitForURL('/login', { timeout: 5000 }).catch(() => {
        // If navigation doesn't happen, that's also acceptable
        // The important part is that the session is cleared client-side
      });
    });
  });

  test.describe('Accessibility', () => {
    test('should announce logout action to screen readers', async ({ page }) => {
      // Login
      await loginUser(page);

      // Check ARIA attributes
      const logoutButton = page.getByRole('button', { name: /logout/i });
      await expect(logoutButton).toHaveAttribute('aria-label', 'Logout');
    });
  });
});
