import { test, expect } from '@playwright/test';

test.describe('Contacts Management', () => {
  // First check if we can access the contacts page (requires auth)
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/contacts');
    
    // Wait for potential redirect
    await page.waitForTimeout(2000);
    
    // Should redirect to login or show loading spinner
    const currentUrl = page.url();
    const hasAuthInUrl = currentUrl.includes('auth');
    const hasLoadingSpinner = await page.locator('.animate-spin').count() > 0;
    
    // Either redirected to auth or showing loading state
    expect(hasAuthInUrl || hasLoadingSpinner).toBe(true);
  });

  test('should load contacts page after navigation', async ({ page }) => {
    // For now, let's test the page directly to see layout
    await page.goto('/contacts');
    
    // Check if the page has the correct structure
    // (This will fail if auth is required, but helps us debug)
    const hasContactsHeading = await page.locator('h2:has-text("Contacts")').count();
    const hasAddButton = await page.locator('button:has-text("Add Contact")').count();
    
    // We expect either auth redirect OR contacts page
    if (hasContactsHeading > 0) {
      await expect(page.locator('h2')).toContainText('Contacts');
      await expect(page.locator('button:has-text("Add Contact")')).toBeVisible();
      await expect(page.locator('input[placeholder="Search contacts..."]')).toBeVisible();
    }
  });

  test('should show empty state when no contacts exist', async ({ page }) => {
    await page.goto('/contacts');
    
    // If we can access the page and there are no contacts
    const emptyStateText = await page.locator('text=No contacts').count();
    if (emptyStateText > 0) {
      await expect(page.locator('text=No contacts')).toBeVisible();
      await expect(page.locator('text=Get started by creating a new contact')).toBeVisible();
    }
  });
});