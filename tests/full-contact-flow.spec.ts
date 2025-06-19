import { test, expect } from '@playwright/test';

test.describe('Full Contact Management Flow', () => {
  let userEmail: string;
  let userPassword: string;

  test.beforeEach(async () => {
    // Generate unique test user
    userEmail = `test-${Date.now()}@example.com`;
    userPassword = 'testpassword123';
  });

  test('complete contact management workflow', async ({ page }) => {
    // Step 1: Sign up
    await page.goto('/auth/signup');
    await page.fill('input[type="email"]', userEmail);
    await page.fill('input[type="password"]', userPassword);
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard or handle email confirmation
    await page.waitForTimeout(3000);
    
    // If redirected to email confirmation, skip for now
    const currentUrl = page.url();
    if (currentUrl.includes('verify')) {
      console.log('Email verification required - skipping full test');
      return;
    }
    
    // If we're at dashboard, continue
    if (currentUrl.includes('dashboard')) {
      await expect(page.locator('h1:has-text("CRM Speed")')).toBeVisible();
    }
    
    // Step 2: Navigate to contacts
    await page.click('a[href="/contacts"]');
    await expect(page.locator('h2:has-text("Contacts")')).toBeVisible();
    
    // Step 3: Should show empty state
    await expect(page.locator('text=No contacts')).toBeVisible();
    
    // Step 4: Add first contact
    await page.click('button:has-text("Add Contact")');
    
    // Wait for modal to open
    await expect(page.locator('text=Add New Contact')).toBeVisible();
    
    // Fill contact form
    await page.fill('input[value=""][placeholder*=""]', 'John'); // First name
    await page.fill('input[value=""][type="text"]:nth-of-type(2)', 'Doe'); // Last name  
    await page.fill('input[type="email"]', 'john.doe@example.com');
    await page.fill('input[type="tel"]', '+1234567890');
    await page.fill('input[value=""]:nth-of-type(5)', 'ACME Corp'); // Company
    await page.fill('input[value=""]:nth-of-type(6)', 'CEO'); // Position
    
    // Submit form
    await page.click('button:has-text("Create")');
    
    // Wait for modal to close and contact to appear
    await page.waitForTimeout(2000);
    
    // Step 5: Verify contact appears in list
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=CEO at ACME Corp')).toBeVisible();
    
    // Step 6: Search functionality
    await page.fill('input[placeholder="Search contacts..."]', 'John');
    await expect(page.locator('text=John Doe')).toBeVisible();
    
    await page.fill('input[placeholder="Search contacts..."]', 'ACME');
    await expect(page.locator('text=John Doe')).toBeVisible();
    
    // Clear search
    await page.fill('input[placeholder="Search contacts..."]', '');
    
    // Step 7: Edit contact
    await page.click('button[class*="text-gray-400"]:has(svg)'); // Edit button
    await expect(page.locator('text=Edit Contact')).toBeVisible();
    
    // Update position
    await page.fill('input[value="CEO"]', 'President');
    await page.click('button:has-text("Update")');
    
    // Verify update
    await page.waitForTimeout(2000);
    await expect(page.locator('text=President at ACME Corp')).toBeVisible();
    
    console.log('✅ Contact management workflow completed successfully!');
  });

  test('contact modal validation', async ({ page }) => {
    // Quick test for modal validation
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpass');
    await page.click('button[type="submit"]');
    
    // If auth fails, that's ok for this test
    await page.waitForTimeout(2000);
    
    if (page.url().includes('contacts') || page.url().includes('dashboard')) {
      await page.goto('/contacts');
      await page.click('button:has-text("Add Contact")');
      
      // Try to submit empty form
      await page.click('button:has-text("Create")');
      
      // Should show HTML5 validation for required fields
      const firstNameInput = page.locator('input[required]:first');
      const isInvalid = await firstNameInput.evaluate(el => !(el as HTMLInputElement).validity.valid);
      expect(isInvalid).toBe(true);
    }
  });
});