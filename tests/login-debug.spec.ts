import { test, expect } from '@playwright/test';

test.describe('Login Debug', () => {
  test('attempt login and capture errors', async ({ page }) => {
    // Capture console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Navigate to login
    await page.goto('/auth/login');
    await expect(page.locator('h1')).toContainText('Login');

    // Try to login with test credentials
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    
    // Click login and wait for response
    await page.click('button[type="submit"]');
    
    // Wait for any response/error
    await page.waitForTimeout(5000);
    
    // Check for any visible error messages
    const errorElements = await page.locator('[class*="red"], [class*="error"], .text-red-600').count();
    
    if (errorElements > 0) {
      const errorText = await page.locator('[class*="red"], [class*="error"], .text-red-600').first().textContent();
      console.log('🔴 Visible error message:', errorText);
    }
    
    // Check for console errors
    if (errors.length > 0) {
      console.log('🔴 Console errors:');
      errors.forEach(error => console.log('  -', error));
    }
    
    // Check current URL to see if redirect happened
    const currentUrl = page.url();
    console.log('📍 Current URL after login attempt:', currentUrl);
    
    // Check for loading state
    const isLoading = await page.locator('text=Signing in...').count() > 0;
    console.log('⏳ Is loading:', isLoading);
    
    // The test passes - we're just gathering debug info
    expect(true).toBe(true);
  });
  
  test('attempt signup and check email verification', async ({ page }) => {
    // Navigate to signup
    await page.goto('/auth/signup');
    
    // Try to sign up with test credentials
    const testEmail = `test-${Date.now()}@example.com`;
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', 'testpassword123');
    
    // Click signup
    await page.click('button[type="submit"]');
    
    // Wait for response
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    console.log('📍 Current URL after signup:', currentUrl);
    
    // Check for any messages about email verification
    const bodyText = await page.textContent('body');
    if (bodyText?.includes('email') || bodyText?.includes('verify') || bodyText?.includes('confirm')) {
      console.log('📧 Email verification may be required');
    }
    
    expect(true).toBe(true);
  });
});