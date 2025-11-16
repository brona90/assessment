import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Navigate to the page
    await page.goto('http://localhost:5173/assessment/', { 
      timeout: 15000,
      waitUntil: 'domcontentloaded'
    });
    
    // Wait for data to load
    await page.waitForTimeout(3000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'debug_initial_page.png', fullPage: true });
    
    // Check what tabs are available
    const tabs = await page.locator('button').all();
    console.log('Found buttons:', tabs.length);
    
    for (let i = 0; i < Math.min(tabs.length, 10); i++) {
      const text = await tabs[i].textContent();
      console.log(`Button ${i}:`, text);
    }
    
    // Click on Assessment tab first
    const assessmentTab = page.locator('button:has-text("Assessment")');
    if (await assessmentTab.isVisible()) {
      await assessmentTab.click();
      await page.waitForTimeout(1000);
    }
    
    // Take screenshot after clicking Assessment
    await page.screenshot({ path: 'debug_assessment_page.png', fullPage: true });
    
    // Answer all questions
    const domains = ['Infrastructure', 'Applications', 'Data', 'Security'];
    
    for (const domain of domains) {
      console.log(`Processing domain: ${domain}`);
      // Click on domain tab
      const domainTab = page.locator(`button:has-text("${domain}")`);
      await domainTab.click();
      await page.waitForTimeout(500);
      
      // Answer all questions in this domain
      const questions = await page.locator('[data-testid="question-card"]').all();
      console.log(`Found ${questions.length} questions in ${domain}`);
      
      for (let i = 0; i < questions.length; i++) {
        const question = page.locator('[data-testid="question-card"]').nth(i);
        const yesButton = question.locator('button:has-text("Yes")');
        await yesButton.click();
        await page.waitForTimeout(200);
      }
    }
    
    // Click Results tab
    const resultsTab = page.locator('button:has-text("Results")');
    if (await resultsTab.isVisible()) {
      await resultsTab.click();
      await page.waitForTimeout(2000);
    }
    
    // Take screenshot
    await page.screenshot({ path: 'debug_results_page.png', fullPage: true });
    
    // Look for score elements
    const scoreElements = await page.locator('text=/\\d+\\.\\d+/').all();
    console.log('Found score elements:', scoreElements.length);
    
    for (let i = 0; i < scoreElements.length; i++) {
      const text = await scoreElements[i].textContent();
      const isVisible = await scoreElements[i].isVisible();
      console.log(`Score ${i}: "${text}" (visible: ${isVisible})`);
    }
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'debug_error_page.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
