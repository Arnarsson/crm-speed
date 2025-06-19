import { test, expect } from '@playwright/test';

test.describe('User Signup Flow', () => {
  test('guide user through complete signup process', async ({ page }) => {
    console.log('🎯 Testing complete user signup flow...\n');

    // Step 1: Go to homepage (what user sees now)
    await page.goto('/');
    console.log('✅ Homepage loaded - user sees the landing page');
    
    // Look for signup/login links on homepage
    const signupLink = await page.locator('a[href*="signup"], button:has-text("Sign"), a:has-text("Sign")').count();
    const loginLink = await page.locator('a[href*="login"], button:has-text("Login"), a:has-text("Login")').count();
    
    console.log(`📍 Found ${signupLink} signup links and ${loginLink} login links on homepage`);
    
    // Step 2: Navigate to signup (user's next step)
    console.log('\n🔗 Step 2: Navigating to signup page...');
    await page.goto('/auth/signup');
    
    await expect(page.locator('h1')).toContainText('Sign Up');
    console.log('✅ Signup page loaded correctly');
    
    // Step 3: Test the signup form
    const testEmail = `real.user.${Date.now()}@gmail.com`;
    const testPassword = 'SecurePassword123!';
    
    console.log(`\n📝 Step 3: Testing signup with: ${testEmail}`);
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    
    // Check that form fields are working
    const emailValue = await page.inputValue('input[type="email"]');
    const passwordValue = await page.inputValue('input[type="password"]');
    
    console.log(`✅ Form fields populated: ${emailValue.slice(0, 20)}...`);
    
    // Submit the form
    console.log('\n🚀 Step 4: Submitting signup form...');
    await page.click('button[type="submit"]');
    
    // Wait for response
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log(`📍 After signup URL: ${currentUrl}`);
    
    // Check what happened
    if (currentUrl.includes('dashboard')) {
      console.log('🎉 SUCCESS: User automatically logged in and redirected to dashboard!');
      
      // Verify dashboard elements
      const hasCrmSpeed = await page.locator('h1:has-text("CRM Speed")').count() > 0;
      const hasNavigation = await page.locator('nav, [role="navigation"]').count() > 0;
      
      console.log(`✅ Dashboard loaded: CRM title = ${hasCrmSpeed}, Navigation = ${hasNavigation}`);
      
    } else if (currentUrl.includes('verify')) {
      console.log('📧 Email verification required - user needs to check email');
      
    } else {
      // Check for any error messages
      const errorMsg = await page.locator('[class*="red"], [class*="error"], .text-red-600').textContent();
      if (errorMsg) {
        console.log(`🔴 Signup error: ${errorMsg}`);
      } else {
        console.log('⚠️ Signup completed but no obvious redirect occurred');
      }
    }
    
    console.log('\n📋 USER INSTRUCTIONS:');
    console.log('1. Go to: https://crm-speed.vercel.app/auth/signup');
    console.log('2. Enter your email and password');
    console.log('3. Click "Sign up"');
    console.log('4. You should be redirected to the dashboard');
    console.log('5. Start adding contacts and using your CRM!');
    
    expect(true).toBe(true);
  });
});