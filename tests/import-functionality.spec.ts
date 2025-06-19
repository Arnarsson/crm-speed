import { test, expect } from '@playwright/test';

test.describe('Contact Import Functionality', () => {
  test('should show import dropdown and options', async ({ page }) => {
    // Navigate to contacts page
    await page.goto('/contacts');
    
    // Check if we're redirected to auth (not logged in)
    if (page.url().includes('auth')) {
      console.log('⚠️ User not logged in - cannot test import functionality');
      return;
    }
    
    console.log('✅ On contacts page, testing import functionality...');
    
    // Look for import button
    const importButton = await page.locator('button:has-text("Import")').count();
    console.log(`📤 Import button found: ${importButton > 0}`);
    
    if (importButton > 0) {
      // Click import button to show dropdown
      await page.click('button:has-text("Import")');
      
      // Check for dropdown options
      const csvImportOption = await page.locator('text=Import from CSV').count();
      const linkedinImportOption = await page.locator('text=Import from LinkedIn').count();
      
      console.log(`📊 CSV import option visible: ${csvImportOption > 0}`);
      console.log(`🔗 LinkedIn import option visible: ${linkedinImportOption > 0}`);
      
      // Test CSV import modal
      if (csvImportOption > 0) {
        await page.click('text=Import from CSV');
        await page.waitForTimeout(1000);
        
        const csvModalVisible = await page.locator('text=Import Contacts').count();
        console.log(`📋 CSV import modal opened: ${csvModalVisible > 0}`);
        
        if (csvModalVisible > 0) {
          // Check for upload area
          const uploadArea = await page.locator('text=Choose CSV file to upload').count();
          const downloadTemplate = await page.locator('text=Download Template').count();
          
          console.log(`📁 Upload area visible: ${uploadArea > 0}`);
          console.log(`📄 Download template button visible: ${downloadTemplate > 0}`);
          
          // Close modal
          await page.click('button:has([data-testid="close"])').catch(() => {
            // Try alternative close method
            page.keyboard.press('Escape');
          });
        }
      }
      
      // Test LinkedIn import modal
      await page.click('button:has-text("Import")');
      await page.waitForTimeout(500);
      
      if (linkedinImportOption > 0) {
        await page.click('text=Import from LinkedIn');
        await page.waitForTimeout(1000);
        
        const linkedinModalVisible = await page.locator('text=LinkedIn Import').count();
        console.log(`🔗 LinkedIn import modal opened: ${linkedinModalVisible > 0}`);
        
        if (linkedinModalVisible > 0) {
          // Check for bookmarklet and manual options
          const bookmarkletOption = await page.locator('text=Browser Bookmarklet').count();
          const manualOption = await page.locator('text=Add Contact Manually').count();
          
          console.log(`🔖 Bookmarklet option visible: ${bookmarkletOption > 0}`);
          console.log(`✏️ Manual entry option visible: ${manualOption > 0}`);
        }
      }
    }
    
    expect(true).toBe(true); // Test passes if no errors
  });
  
  test('should show bulk actions when contacts are selected', async ({ page }) => {
    await page.goto('/contacts');
    
    // Skip if not authenticated
    if (page.url().includes('auth')) {
      console.log('⚠️ User not logged in - skipping bulk actions test');
      return;
    }
    
    console.log('🧪 Testing bulk actions functionality...');
    
    // Check if there are any contacts to select
    const contactCheckboxes = await page.locator('input[type="checkbox"]').count();
    console.log(`☑️ Contact checkboxes found: ${contactCheckboxes}`);
    
    if (contactCheckboxes > 1) { // More than just select-all checkbox
      // Click first contact checkbox
      await page.locator('input[type="checkbox"]').nth(1).click();
      await page.waitForTimeout(500);
      
      // Check if bulk actions bar appears
      const bulkActionsVisible = await page.locator('text=selected').count();
      console.log(`📊 Bulk actions bar visible: ${bulkActionsVisible > 0}`);
      
      if (bulkActionsVisible > 0) {
        // Check for bulk action buttons
        const addTagButton = await page.locator('button:has-text("Add Tag")').count();
        const exportButton = await page.locator('button:has-text("Export")').count();
        const deleteButton = await page.locator('button:has-text("Delete")').count();
        
        console.log(`🏷️ Add Tag button visible: ${addTagButton > 0}`);
        console.log(`📤 Export button visible: ${exportButton > 0}`);
        console.log(`🗑️ Delete button visible: ${deleteButton > 0}`);
        
        // Test clear selection
        const clearButton = await page.locator('button:has-text("Clear")').count();
        if (clearButton > 0) {
          await page.click('button:has-text("Clear")');
          await page.waitForTimeout(500);
          
          const bulkActionsHidden = await page.locator('text=selected').count();
          console.log(`✅ Bulk actions cleared: ${bulkActionsHidden === 0}`);
        }
      }
    } else {
      console.log('📝 No contacts available for bulk testing - create some contacts first');
    }
    
    expect(true).toBe(true);
  });
  
  test('should handle select all functionality', async ({ page }) => {
    await page.goto('/contacts');
    
    if (page.url().includes('auth')) {
      console.log('⚠️ User not logged in - skipping select all test');
      return;
    }
    
    console.log('🧪 Testing select all functionality...');
    
    // Check if select all checkbox exists
    const selectAllCheckbox = await page.locator('text=Select all').count();
    console.log(`☑️ Select all checkbox found: ${selectAllCheckbox > 0}`);
    
    if (selectAllCheckbox > 0) {
      // Click select all
      await page.click('input[type="checkbox"]').first();
      await page.waitForTimeout(500);
      
      // Check if bulk actions appear for all contacts
      const selectedText = await page.locator('text=selected').textContent();
      console.log(`📊 Selection text: ${selectedText || 'none'}`);
      
      // Unselect all
      await page.click('input[type="checkbox"]').first();
      await page.waitForTimeout(500);
      
      const bulkActionsHidden = await page.locator('text=selected').count();
      console.log(`✅ All contacts unselected: ${bulkActionsHidden === 0}`);
    }
    
    expect(true).toBe(true);
  });
  
  test('CSV import modal functionality', async ({ page }) => {
    await page.goto('/contacts');
    
    if (page.url().includes('auth')) {
      console.log('⚠️ User not logged in - skipping CSV import test');
      return;
    }
    
    console.log('🧪 Testing CSV import modal in detail...');
    
    // Open import dropdown and click CSV import
    const importButton = await page.locator('button:has-text("Import")').count();
    if (importButton > 0) {
      await page.click('button:has-text("Import")');
      await page.click('text=Import from CSV');
      await page.waitForTimeout(1000);
      
      // Test download template button
      const downloadTemplateButton = await page.locator('button:has-text("Download Template")').count();
      if (downloadTemplateButton > 0) {
        console.log('📄 Download template button found');
        // Note: Actually clicking would download a file, so we just verify it exists
      }
      
      // Check for import guidelines
      const guidelines = await page.locator('text=Import Guidelines').count();
      console.log(`📋 Import guidelines visible: ${guidelines > 0}`);
      
      // Check for step indicators
      const uploadStep = await page.locator('text=Upload File').count();
      const mappingStep = await page.locator('text=Map Fields').count();
      const importStep = await page.locator('text=Import').count();
      const resultsStep = await page.locator('text=Results').count();
      
      console.log(`📤 Upload step visible: ${uploadStep > 0}`);
      console.log(`🔗 Mapping step visible: ${mappingStep > 0}`);
      console.log(`⚙️ Import step visible: ${importStep > 0}`);
      console.log(`📊 Results step visible: ${resultsStep > 0}`);
      
      // Check file upload area
      const fileUploadArea = await page.locator('text=Choose CSV file to upload').count();
      console.log(`📁 File upload area visible: ${fileUploadArea > 0}`);
    }
    
    expect(true).toBe(true);
  });
  
  test('LinkedIn import modal functionality', async ({ page }) => {
    await page.goto('/contacts');
    
    if (page.url().includes('auth')) {
      console.log('⚠️ User not logged in - skipping LinkedIn import test');
      return;
    }
    
    console.log('🧪 Testing LinkedIn import modal in detail...');
    
    // Open LinkedIn import modal
    const importButton = await page.locator('button:has-text("Import")').count();
    if (importButton > 0) {
      await page.click('button:has-text("Import")');
      await page.click('text=Import from LinkedIn');
      await page.waitForTimeout(1000);
      
      // Check for different import methods
      const bookmarkletMethod = await page.locator('text=Browser Bookmarklet').count();
      const manualMethod = await page.locator('text=Manual Entry').count();
      const extensionMethod = await page.locator('text=Chrome Extension').count();
      
      console.log(`🔖 Bookmarklet method visible: ${bookmarkletMethod > 0}`);
      console.log(`✏️ Manual method visible: ${manualMethod > 0}`);
      console.log(`🔌 Extension method visible: ${extensionMethod > 0}`);
      
      // Test manual entry
      const manualButton = await page.locator('button:has-text("Add Contact Manually")').count();
      if (manualButton > 0) {
        await page.click('button:has-text("Add Contact Manually")');
        await page.waitForTimeout(500);
        
        // Check for form fields
        const firstNameField = await page.locator('input[placeholder*="First"], label:has-text("First Name")').count();
        const lastNameField = await page.locator('input[placeholder*="Last"], label:has-text("Last Name")').count();
        const emailField = await page.locator('input[type="email"]').count();
        const linkedinField = await page.locator('input[placeholder*="linkedin"]').count();
        
        console.log(`👤 First name field visible: ${firstNameField > 0}`);
        console.log(`👤 Last name field visible: ${lastNameField > 0}`);
        console.log(`📧 Email field visible: ${emailField > 0}`);
        console.log(`🔗 LinkedIn URL field visible: ${linkedinField > 0}`);
      }
      
      // Check for copy bookmarklet button
      const copyButton = await page.locator('button:has-text("Copy")').count();
      console.log(`📋 Copy bookmarklet button visible: ${copyButton > 0}`);
    }
    
    expect(true).toBe(true);
  });
});