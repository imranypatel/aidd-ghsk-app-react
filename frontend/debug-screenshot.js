const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Navigate to login
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  
  // Login
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Wait for dashboard
  await page.waitForURL('**/dashboard');
  await page.waitForTimeout(1000);
  
  // Take screenshot
  await page.screenshot({ path: 'dashboard-debug.png', fullPage: true });
  
  console.log('Screenshot saved to dashboard-debug.png');
  
  await browser.close();
})();
