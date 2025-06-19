# 🔧 Supabase Settings Fix

## 🚨 Issue Found
**"Email signups are disabled"** and **"Email logins are disabled"**

## ✅ Solution

### Step 1: Enable Email Provider
1. Go to: https://supabase.com/dashboard/project/wvfscwjzvmdzddomlwvl/auth/providers
2. Find **"Email"** in the provider list
3. **Turn ON** "Enable email provider" 
4. **Turn ON** "Enable email signup"
5. Click **Save**

### Step 2: Configure Email Settings (Optional)
1. Go to: https://supabase.com/dashboard/project/wvfscwjzvmdzddomlwvl/auth/settings
2. Under "Email Auth":
   - ✅ Enable email provider (from step 1)
   - ⚪ Disable email confirmations (for easier testing)
   - ⚪ Enable email change confirmations (optional)

### Step 3: Test
After enabling, you should be able to:
- ✅ Sign up with any email
- ✅ Login immediately 
- ✅ Access the CRM

## 🧪 Verification
Run this test after fixing:
```bash
BASE_URL=https://crm-speed.vercel.app npx playwright test tests/working-auth.spec.ts --headed
```

Should see:
- ✅ Signup successful
- ✅ Login successful  
- ✅ Redirected to dashboard

---
**Root cause**: Email authentication provider was disabled in Supabase settings.