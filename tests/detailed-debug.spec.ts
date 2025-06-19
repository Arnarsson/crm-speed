import { test, expect } from '@playwright/test';

test.describe('Detailed Debug', () => {
  test('step-by-step signup and login debug', async ({ page }) => {
    // Capture all network requests
    const requests: string[] = [];
    const responses: any[] = [];
    
    page.on('request', request => {
      if (request.url().includes('supabase') || request.url().includes('auth')) {
        requests.push(`${request.method()} ${request.url()}`);
      }
    });
    
    page.on('response', async response => {
      if (response.url().includes('supabase') || response.url().includes('auth')) {
        const status = response.status();
        const url = response.url();
        let body = '';
        try {
          body = await response.text();
        } catch (e) {
          body = 'Could not read response body';
        }
        responses.push({ status, url, body });
      }
    });

    // Capture console messages
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    });

    const testEmail = `debug.test.${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';

    console.log('🧪 Testing with:', testEmail);

    // Step 1: Test signup
    console.log('\n📝 STEP 1: Testing Signup');
    await page.goto('/auth/signup');
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    
    console.log('📤 Submitting signup form...');
    await page.click('button[type="submit"]');
    
    // Wait for network activity to complete
    await page.waitForTimeout(5000);
    
    const signupUrl = page.url();
    console.log('📍 After signup URL:', signupUrl);
    
    // Check for any error messages
    const signupError = await page.locator('[class*="red"], [class*="error"], .text-red-600').textContent();
    if (signupError) {
      console.log('🔴 Signup error visible:', signupError);
    }

    // Step 2: Test login immediately after signup
    console.log('\n🔑 STEP 2: Testing Login');
    await page.goto('/auth/login');
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    
    console.log('📤 Submitting login form...');
    await page.click('button[type="submit"]');
    
    // Wait for network activity
    await page.waitForTimeout(5000);
    
    const loginUrl = page.url();
    console.log('📍 After login URL:', loginUrl);
    
    const loginError = await page.locator('[class*="red"], [class*="error"], .text-red-600').textContent();
    if (loginError) {
      console.log('🔴 Login error visible:', loginError);
    }

    // Step 3: Print debug info
    console.log('\n🌐 NETWORK REQUESTS:');
    requests.forEach(req => console.log('  ', req));
    
    console.log('\n📡 NETWORK RESPONSES:');
    responses.forEach(res => {
      console.log(`  ${res.status} ${res.url}`);
      if (res.body && res.body.length < 500) {
        console.log(`    Response: ${res.body}`);
      }
    });
    
    console.log('\n💬 CONSOLE LOGS:');
    consoleLogs.forEach(log => console.log('  ', log));

    // Step 4: Check if user is actually created in Supabase
    console.log('\n👤 CHECKING USER STATUS...');
    
    // Try to access a protected page to see auth state
    await page.goto('/contacts');
    await page.waitForTimeout(3000);
    
    const contactsUrl = page.url();
    console.log('📍 Contacts page URL:', contactsUrl);
    
    if (contactsUrl.includes('contacts')) {
      console.log('✅ User is authenticated - can access protected pages');
    } else {
      console.log('❌ User not authenticated - redirected to auth');
    }

    expect(true).toBe(true);
  });
});