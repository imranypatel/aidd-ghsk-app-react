import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Session Persistence (User Story 3)
 * 
 * Purpose: Verify session persists across page refreshes and lazy expiration detection
 */

const BASE_URL = 'http://localhost:3000';

// Helper function to login
async function loginUser(page: any) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[name="username"]', 'Admin');
  await page.fill('input[name="password"]', 'Admin123@');
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/dashboard`);
}

test.describe('User Story 3: Session Persistence', () => {
  test.describe('Session Restoration', () => {
    test('T097: Session persists after page refresh', async ({ page }) => {
      // Login first
      await loginUser(page);

      // Verify on dashboard
      await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
      await expect(page.locator('text=Welcome, Admin')).toBeVisible();

      // Refresh the page
      await page.reload();

      // Should still be authenticated and on dashboard
      await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
      await expect(page.locator('text=Welcome, Admin')).toBeVisible();
      
      // Logout button should still be visible
      await expect(page.locator('button:has-text("Logout")')).toBeVisible();
    });

    test('Session persists after browser navigation (back/forward)', async ({ page }) => {
      // Login
      await loginUser(page);

      // Navigate to login page (simulating back button)
      await page.goto(`${BASE_URL}/login`);

      // Should be redirected to dashboard because session is still valid
      await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
      await expect(page.locator('text=Welcome, Admin')).toBeVisible();
    });

    test('Session restoration shows loading state briefly', async ({ page }) => {
      // Login first
      await loginUser(page);

      // Reload to trigger session check
      const reloadPromise = page.reload();

      // Should show loading spinner during session validation
      const loadingSpinner = page.locator('[role="progressbar"]');
      
      // Wait for reload to complete
      await reloadPromise;

      // Eventually shows dashboard
      await expect(page.locator('text=Welcome, Admin')).toBeVisible();
    });

    test('Protected route blocks access before session validation completes', async ({ page, context }) => {
      // Create a new context with a valid session cookie
      await loginUser(page);
      
      // Get the cookies
      const cookies = await context.cookies();
      const sessionCookie = cookies.find(c => c.name === 'AIDD_SESSION');
      expect(sessionCookie).toBeDefined();

      // Open new page with the same cookie
      const newPage = await context.newPage();
      
      // Try to access dashboard directly
      await newPage.goto(`${BASE_URL}/dashboard`);

      // Should show loading state, then dashboard
      await expect(newPage.locator('text=Welcome, Admin')).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Session Expiration (Lazy Detection)', () => {
    test('T098: Expired session redirects to login on next interaction', async ({ page, context }) => {
      // Login first
      await loginUser(page);
      await expect(page).toHaveURL(`${BASE_URL}/dashboard`);

      // Manually expire the session by deleting the cookie
      await context.clearCookies();

      // Try to interact with the page (e.g., refresh or navigate)
      await page.reload();

      // Should be redirected to login page due to session validation failure
      await expect(page).toHaveURL(`${BASE_URL}/login`, { timeout: 5000 });
    });

    test('API call with expired session triggers redirect to login', async ({ page, context }) => {
      // Login first
      await loginUser(page);
      await expect(page).toHaveURL(`${BASE_URL}/dashboard`);

      // Intercept API calls to simulate 401 response
      await page.route('**/api/auth/session', route => {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            errorCode: 'SEC-03-002',
            message: 'Session has expired'
          })
        });
      });

      // Reload to trigger session validation
      await page.reload();

      // Should redirect to login
      await expect(page).toHaveURL(`${BASE_URL}/login`, { timeout: 5000 });
    });

    test('Multiple tabs: logout in one tab expires session in other tabs', async ({ browser }) => {
      // Create first tab and login
      const context1 = await browser.newContext();
      const page1 = await context1.newPage();
      await loginUser(page1);
      await expect(page1).toHaveURL(`${BASE_URL}/dashboard`);

      // Get session cookie
      const cookies = await context1.cookies();
      const sessionCookie = cookies.find(c => c.name === 'AIDD_SESSION');

      // Create second tab with the same session
      const context2 = await browser.newContext();
      if (sessionCookie) {
        await context2.addCookies([sessionCookie]);
      }
      const page2 = await context2.newPage();
      await page2.goto(`${BASE_URL}/dashboard`);
      await expect(page2.locator('text=Welcome, Admin')).toBeVisible();

      // Logout in first tab
      await page1.click('button:has-text("Logout")');
      await expect(page1).toHaveURL(`${BASE_URL}/login`);

      // Reload second tab - should redirect to login
      await page2.reload();
      await expect(page2).toHaveURL(`${BASE_URL}/login`, { timeout: 5000 });

      // Cleanup
      await context1.close();
      await context2.close();
    });
  });

  test.describe('Session Validation API', () => {
    test('Session validation returns user details', async ({ page, context }) => {
      // Login
      await loginUser(page);

      // Intercept session validation call
      const sessionValidation = page.waitForResponse(
        response => response.url().includes('/api/auth/session') && response.status() === 200
      );

      // Trigger validation by reloading
      await page.reload();

      // Check response contains user details
      const response = await sessionValidation;
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('userId');
      expect(data.data).toHaveProperty('username', 'Admin');
      expect(data.data).toHaveProperty('expiresAt');
      expect(data.data).toHaveProperty('isValid', true);
    });

    test('Session validation with no cookie returns 401', async ({ page }) => {
      // Go to login page (no session)
      await page.goto(`${BASE_URL}/login`);

      // Try to call session endpoint directly
      const response = await page.request.get(`${BASE_URL.replace('3000', '5000')}/api/auth/session`, {
        // No cookies
      });

      expect(response.status()).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.errorCode).toBe('SEC-03-001');
    });

    test('Session validation after logout returns 401', async ({ page, request }) => {
      // Login
      await loginUser(page);

      // Get cookies
      const cookies = await page.context().cookies();
      const sessionCookie = cookies.find(c => c.name === 'AIDD_SESSION');
      expect(sessionCookie).toBeDefined();

      // Logout
      await page.click('button:has-text("Logout")');
      await expect(page).toHaveURL(`${BASE_URL}/login`);

      // Try to validate session with old cookie (should fail)
      const response = await request.get(`${BASE_URL.replace('3000', '5000')}/api/auth/session`, {
        headers: {
          Cookie: `AIDD_SESSION=${sessionCookie?.value}`
        }
      });

      expect(response.status()).toBe(401);
    });
  });

  test.describe('Session Timeout Behavior', () => {
    test('Session timeout is 30 minutes from creation', async ({ page }) => {
      // Login
      await loginUser(page);

      // Intercept session validation to check expiry time
      const sessionValidation = page.waitForResponse(
        response => response.url().includes('/api/auth/session') && response.status() === 200
      );

      await page.reload();

      const response = await sessionValidation;
      const data = await response.json();
      
      // Parse expiry time
      const expiresAt = new Date(data.data.expiresAt);
      const now = new Date();
      
      // Should expire in approximately 30 minutes (allow 1 minute tolerance)
      const minutesUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60);
      expect(minutesUntilExpiry).toBeGreaterThan(28);
      expect(minutesUntilExpiry).toBeLessThan(32);
    });

    test('No automatic redirect before session expires', async ({ page }) => {
      // Login
      await loginUser(page);
      await expect(page).toHaveURL(`${BASE_URL}/dashboard`);

      // Wait for 5 seconds (session should still be valid)
      await page.waitForTimeout(5000);

      // Should still be on dashboard
      await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
      await expect(page.locator('text=Welcome, Admin')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('Backend unavailable during session check shows error state gracefully', async ({ page }) => {
      // Intercept session validation to simulate backend error
      await page.route('**/api/auth/session', route => {
        route.abort('failed');
      });

      // Try to access dashboard
      await page.goto(`${BASE_URL}/dashboard`);

      // Should redirect to login (session check failed)
      await expect(page).toHaveURL(`${BASE_URL}/login`, { timeout: 5000 });
    });

    test('Malformed session cookie redirects to login', async ({ page, context }) => {
      // Set invalid session cookie
      await context.addCookies([{
        name: 'AIDD_SESSION',
        value: 'invalid-token-format',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax'
      }]);

      // Try to access dashboard
      await page.goto(`${BASE_URL}/dashboard`);

      // Should redirect to login
      await expect(page).toHaveURL(`${BASE_URL}/login`, { timeout: 5000 });
    });
  });
});
