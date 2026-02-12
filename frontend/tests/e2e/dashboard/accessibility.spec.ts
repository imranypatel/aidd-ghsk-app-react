/**
 * Dashboard Accessibility E2E Tests
 * Feature: 002-modern-ui-redesign / US2 Professional Authenticated Layout
 * Task: T048
 * 
 * Test Coverage:
 * - Tab order: AppBar → Drawer → Main content
 * - Keyboard navigation with arrows
 * - Enter/Space activation
 * - Escape closes temporary drawer
 * - Skip link to main content
 * - Focus indicators visible (2px primary)
 * - axe-core 0 violations
 * - Screen reader announcements
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Dashboard Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('T048: Tab order - AppBar → Drawer → Main content', async ({ page }) => {
    // Press Tab to move through focusable elements
    await page.keyboard.press('Tab');
    
    // First focus should be skip link or AppBar element
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON']).toContain(focusedTag);
    
    // Continue tabbing through drawer items
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should reach main content area
    const focusedInMain = await page.evaluate(() => 
      document.activeElement?.closest('main') !== null
    );
    expect(focusedInMain).toBeTruthy();
  });

  test('T048: Drawer keyboard navigation with arrows', async ({ page }) => {
    // Focus first menu item
    await page.locator('[role="button"]:has-text("Dashboard")').focus();
    
    // Arrow down to next item
    await page.keyboard.press('ArrowDown');
    
    const focused = await page.evaluate(() => document.activeElement?.textContent);
    expect(focused).toContain('Users');
  });

  test('T048: Enter/Space activates menu items', async ({ page }) => {
    const usersItem = page.locator('[role="button"]:has-text("Users")');
    await usersItem.focus();
    
    // Press Enter
    await page.keyboard.press('Enter');
    
    await page.waitForURL('/users');
    expect(page.url()).toContain('/users');
    
    // Go back
    await page.goto('/dashboard');
    
    // Test Space key
    await usersItem.focus();
    await page.keyboard.press('Space');
    await page.waitForURL('/users');
    expect(page.url()).toContain('/users');
  });

  test('T048: Escape closes temporary drawer on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Open drawer
    await page.click('[aria-label*="Open navigation"]');
    const drawer = page.locator('[role="navigation"]');
    await expect(drawer).toBeVisible();
    
    // Press Escape
    await page.keyboard.press('Escape');
    await expect(drawer).not.toBeVisible();
  });

  test('T048: Skip link to main content', async ({ page }) => {
    // Tab to skip link (should be first)
    await page.keyboard.press('Tab');
    
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeFocused();
    
    // Activate skip link
    await page.keyboard.press('Enter');
    
    // Focus should move to main content
    const mainFocused = await page.evaluate(() => 
      document.activeElement?.closest('main') !== null ||
      document.activeElement?.id === 'main-content'
    );
    expect(mainFocused).toBeTruthy();
  });

  test('T048: Focus indicators visible (2px primary)', async ({ page }) => {
    const dashboardItem = page.locator('[role="button"]:has-text("Dashboard")');
    await dashboardItem.focus();
    
    // Check for visible focus indicator
    const outline = await dashboardItem.evaluate(el => {
      const styles = getComputedStyle(el);
      return styles.outline || styles.boxShadow;
    });
    
    expect(outline).toBeTruthy();
    expect(outline).toContain('2px');
  });

  test('T048: axe-core 0 critical violations', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    const criticalViolations = results.violations.filter((v: any) => 
      ['critical', 'serious'].includes(v.impact || '')
    );
    
    expect(criticalViolations).toHaveLength(0);
  });

  test('T048: Screen reader announcements for navigation changes', async ({ page }) => {
    // Check for aria-live region
    const liveRegion = page.locator('[aria-live="polite"]');
    
    // Navigate to Users
    await page.click('[role="button"]:has-text("Users")');
    await page.waitForURL('/users');
    
    // Live region should announce navigation
    await expect(liveRegion).toBeVisible();
    const announcement = await liveRegion.textContent();
    expect(announcement).toContain('Users');
  });

  test('T048: All interactive elements have accessible names', async ({ page }) => {
    // Check menu items
    const menuItems = page.locator('[role="button"]');
    const count = await menuItems.count();
    
    for (let i = 0; i < count; i++) {
      const item = menuItems.nth(i);
      const label = await item.getAttribute('aria-label');
      const text = await item.textContent();
      
      expect(label || text).toBeTruthy();
    }
  });

  test('T048: Color contrast meets WCAG AA (4.5:1)', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['color-contrast'])
      .analyze();
    
    expect(results.violations).toHaveLength(0);
  });
});
