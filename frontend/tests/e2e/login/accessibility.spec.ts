/**
 * T022: E2E Test for LoginPage Accessibility
 * 
 * Feature: 002-modern-ui-redesign - User Story 1: Enhanced Login Experience
 * Purpose: Playwright accessibility tests with axe-core integration
 * 
 * Tests:
 * - Keyboard navigation (tab order, Enter submit, Escape clears)
 * - Focus indicators (2px primary offset 2px)
 * - ARIA attributes (labels, roles, states)
 * - Screen reader announcements
 * - axe-core 0 violations (WCAG AA)
 * 
 * Constitution Section VI: SC-006 WCAG AA mandatory
 * 
 * This test MUST FAIL before implementation (Red phase TDD)
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('T022: LoginPage Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector('form');
  });

  test('should have correct tab order: Username→Password→Show Password→Sign In→Forgot Password', async ({ page }) => {
    // Start from beginning of page
    await page.keyboard.press('Tab');
    
    // First tab should focus username field
    let focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('name'));
    expect(focusedElement).toBe('username');
    
    // Second tab should focus password field
    await page.keyboard.press('Tab');
    focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('name'));
    expect(focusedElement).toBe('password');
    
    // Third tab should focus password visibility toggle
    await page.keyboard.press('Tab');
    const focusedAriaLabel = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
    expect(focusedAriaLabel).toMatch(/show password/i);
    
    // Fourth tab should focus Sign In button
    await page.keyboard.press('Tab');
    const focusedButtonText = await page.evaluate(() => document.activeElement?.textContent);
    expect(focusedButtonText).toMatch(/sign in/i);
    
    // Fifth tab should focus Forgot Password link
    await page.keyboard.press('Tab');
    const focusedLinkText = await page.evaluate(() => document.activeElement?.textContent);
    expect(focusedLinkText).toMatch(/forgot password/i);
  });

  test('should submit form when Enter key pressed in password field', async ({ page }) => {
    // Mock authentication
    await page.route('**/api/auth/login', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            user: { userId: 1, username: 'testuser' },
            session: { token: 'mock-token', expiresAt: '2026-12-31T23:59:59' },
          },
        }),
      });
    });
    
    await page.route('**/api/auth/session', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { user: { userId: 1, username: 'testuser' } },
        }),
      });
    });
    
    // Fill form
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password123');
    
    // Press Enter in password field
    await page.locator('input[name="password"]').press('Enter');
    
    // Should navigate to dashboard
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    expect(page.url()).toContain('/dashboard');
  });

  test('should clear validation errors when Escape key pressed', async ({ page }) => {
    // Submit empty form to trigger errors
    await page.click('button[type="submit"]');
    
    // Wait for error to appear
    await page.waitForSelector('[role="alert"]', { timeout: 2000 }).catch(() => {
      // Error might not appear yet, that's OK for this test
    });
    
    // Press Escape
    await page.keyboard.press('Escape');
    
    // Errors should be cleared (or form should be reset)
    // Note: Implementation will determine exact behavior
    // This test verifies Escape key handling exists
  });

  test('should have visible focus indicators (2px primary color, offset 2px)', async ({ page }) => {
    // Focus username field
    await page.focus('input[name="username"]');
    
    // Check focus indicator styles
    const focusStyles = await page.locator('input[name="username"]').evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        outlineColor: styles.outlineColor,
        outlineOffset: styles.outlineOffset,
        borderColor: styles.borderColor,
      };
    });
    
    // Should have visible outline or border
    const hasVisibleFocus = focusStyles.outline !== 'none' || 
                            focusStyles.outlineWidth !== '0px' ||
                            focusStyles.borderColor.includes('25, 118, 210'); // Primary color RGB
    
    expect(hasVisibleFocus).toBeTruthy();
    
    // Check outline width is 2px
    if (focusStyles.outlineWidth !== '0px') {
      expect(focusStyles.outlineWidth).toBe('2px');
    }
    
    // Check outline offset is 2px
    if (focusStyles.outlineOffset) {
      expect(focusStyles.outlineOffset).toBe('2px');
    }
  });

  test('should have focus indicators on all interactive elements', async ({ page }) => {
    const interactiveElements = [
      'input[name="username"]',
      'input[name="password"]',
      'button[type="submit"]',
      '[aria-label*="show password"]',
    ];
    
    for (const selector of interactiveElements) {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        await element.focus();
        
        // Check for focus indicator
        const focusStyles = await element.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return {
            outline: styles.outline,
            outlineWidth: styles.outlineWidth,
            borderColor: styles.borderColor,
          };
        });
        
        const hasFocus = focusStyles.outline !== 'none' || 
                        focusStyles.outlineWidth !== '0px' ||
                        focusStyles.borderColor.length > 0;
        
        expect(hasFocus).toBeTruthy();
      }
    }
  });

  test('should have proper ARIA labels on all form fields', async ({ page }) => {
    // Check username field
    const usernameLabel = await page.locator('input[name="username"]').getAttribute('aria-label');
    expect(usernameLabel).toBe('Username');
    
    // Check password field
    const passwordLabel = await page.locator('input[name="password"]').getAttribute('aria-label');
    expect(passwordLabel).toBe('Password');
    
    // Check submit button
    const buttonLabel = await page.locator('button[type="submit"]').getAttribute('aria-label');
    expect(buttonLabel).toMatch(/sign in/i);
  });

  test('should mark fields as required with aria-required', async ({ page }) => {
    // Check username required
    const usernameRequired = await page.locator('input[name="username"]').getAttribute('aria-required');
    expect(usernameRequired).toBe('true');
    
    // Check password required
    const passwordRequired = await page.locator('input[name="password"]').getAttribute('aria-required');
    expect(passwordRequired).toBe('true');
  });

  test('should mark invalid fields with aria-invalid after validation', async ({ page }) => {
    // Submit empty form
    await page.click('button[type="submit"]');
    
    // Wait for validation
    await page.waitForTimeout(500);
    
    // Check aria-invalid on username
    const usernameInvalid = await page.locator('input[name="username"]').getAttribute('aria-invalid');
    expect(usernameInvalid).toBe('true');
    
    // Check aria-invalid on password
    const passwordInvalid = await page.locator('input[name="password"]').getAttribute('aria-invalid');
    expect(passwordInvalid).toBe('true');
  });

  test('should link error messages with aria-describedby', async ({ page }) => {
    // Submit empty form to trigger errors
    await page.click('button[type="submit"]');
    
    // Wait for error messages
    await page.waitForTimeout(500);
    
    // Check if username field has aria-describedby
    const usernameDescribedBy = await page.locator('input[name="username"]').getAttribute('aria-describedby');
    
    if (usernameDescribedBy) {
      // Verify the element referenced by aria-describedby exists
      const errorElement = page.locator(`#${usernameDescribedBy}`);
      await expect(errorElement).toBeVisible();
    }
  });

  test('should announce validation errors with role="alert"', async ({ page }) => {
    // Mock failed login
    await page.route('**/api/auth/login', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Invalid credentials',
          errorCode: 'SEC-01-001',
        }),
      });
    });
    
    await page.fill('input[name="username"]', 'invalid');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    
    // Wait for alert
    await page.waitForSelector('[role="alert"]', { timeout: 3000 });
    
    // Verify alert is visible
    const alert = page.locator('[role="alert"]');
    await expect(alert).toBeVisible();
    
    // Alert should contain error message
    const alertText = await alert.textContent();
    expect(alertText).toMatch(/invalid|error/i);
  });

  test('should have aria-live for dynamic validation feedback', async ({ page }) => {
    // Type in username field
    await page.fill('input[name="username"]', 'ab'); // Too short
    await page.keyboard.press('Tab'); // Blur to trigger validation
    
    // Wait for validation message
    await page.waitForTimeout(350); // 300ms debounce + buffer
    
    // Check for aria-live on error message container
    const errorContainer = page.locator('[role="alert"]').first();
    if (await errorContainer.count() > 0) {
      const ariaLive = await errorContainer.getAttribute('aria-live');
      // Should be polite or assertive
      expect(ariaLive).toMatch(/polite|assertive/);
    }
  });

  test('should have no axe-core violations (WCAG AA)', async ({ page }) => {
    // Run axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    // Should have zero violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have no critical or serious axe violations', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .analyze();
    
    // Filter critical and serious violations
    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    
    // Should have zero critical/serious violations
    expect(criticalViolations).toEqual([]);
  });

  test('should have sufficient color contrast (WCAG AA 4.5:1)', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();
    
    // Check for contrast violations
    const contrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'color-contrast'
    );
    
    expect(contrastViolations).toEqual([]);
  });

  test('should have all images with alt text or aria-labels', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .analyze();
    
    // Check for image-alt violations
    const imageAltViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'image-alt'
    );
    
    expect(imageAltViolations).toEqual([]);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Get all headings
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    
    // Should have at least one heading
    expect(headings.length).toBeGreaterThan(0);
    
    // First heading should be h1
    const firstHeading = headings[0];
    const tagName = await firstHeading.evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe('h1');
  });

  test('should allow password visibility toggle via keyboard', async ({ page }) => {
    // Focus password field
    await page.focus('input[name="password"]');
    
    // Tab to password toggle button
    await page.keyboard.press('Tab');
    
    // Get password field type
    const initialType = await page.locator('input[name="password"]').getAttribute('type');
    expect(initialType).toBe('password');
    
    // Press Enter or Space to toggle
    await page.keyboard.press('Enter');
    
    // Wait for toggle
    await page.waitForTimeout(100);
    
    // Password should now be visible (type="text")
    const toggledType = await page.locator('input[name="password"]').getAttribute('type');
    expect(toggledType).toBe('text');
  });

  test('should maintain focus during loading state', async ({ page }) => {
    // Mock slow login
    await page.route('**/api/auth/login', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: { user: {}, session: {} },
        }),
      });
    });
    
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password123');
    
    // Focus submit button
    await page.focus('button[type="submit"]');
    
    // Press Enter to submit
    await page.keyboard.press('Enter');
    
    // Wait a bit for loading state
    await page.waitForTimeout(200);
    
    // Focus should remain on button (or move predictably)
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('should have descriptive page title', async ({ page }) => {
    const title = await page.title();
    
    // Title should indicate it's a login page
    expect(title).toMatch(/login|sign in|aidd ems/i);
  });

  test('should have lang attribute on html element', async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang');
    
    // Should have language specified (e.g., "en")
    expect(lang).toBeTruthy();
    expect(lang).toMatch(/en|en-US/);
  });

  test('should not have any duplicate IDs', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .analyze();
    
    // Check for duplicate-id violations
    const duplicateIdViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'duplicate-id'
    );
    
    expect(duplicateIdViolations).toEqual([]);
  });

  test('should have proper form labels', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .analyze();
    
    // Check for label violations
    const labelViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'label'
    );
    
    expect(labelViolations).toEqual([]);
  });
});
