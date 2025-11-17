const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to the app
    await page.goto('http://localhost:5173/assessment/', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    
    console.log('Page loaded');
    await page.waitForTimeout(2000);
    
    // Check for user selection screen
    const userSelectionScreen = await page.locator('[data-testid="user-selection-screen"]');
    if (await userSelectionScreen.isVisible({ timeout: 2000 })) {
      console.log('User selection screen visible');
      
      // Select user1
      const userCard = await page.locator('[data-testid="user-card-user1"]');
      await userCard.click();
      console.log('Clicked user1');
      await page.waitForTimeout(3000);
    }
    
    // Check what's on the page now
    const userView = await page.locator('[data-testid="user-view"]');
    console.log('User view visible:', await userView.isVisible());
    
    // Check for questions
    const questions = await page.locator('[data-testid^="question-"]').all();
    console.log('Number of questions found:', questions.length);
    
    // Check for no-questions message
    const noQuestions = await page.locator('[data-testid="no-questions"]');
    console.log('No questions message visible:', await noQuestions.isVisible());
    
    // Get page content
    const content = await page.content();
    console.log('Page has user-view:', content.includes('user-view'));
    console.log('Page has question-card:', content.includes('question-card'));
    console.log('Page has "No Questions Assigned":', content.includes('No Questions Assigned'));
    
    // Check localStorage
    const localStorage = await page.evaluate(() => {
      return {
        users: window.localStorage.getItem('users'),
        questions: window.localStorage.getItem('questions'),
        domains: window.localStorage.getItem('domains')
      };
    });
    console.log('LocalStorage users:', localStorage.users ? 'exists' : 'missing');
    console.log('LocalStorage questions:', localStorage.questions ? 'exists' : 'missing');
    console.log('LocalStorage domains:', localStorage.domains ? 'exists' : 'missing');
    
    // Take a screenshot
    await page.screenshot({ path: '/workspace/assessment/debug_screenshot.png', fullPage: true });
    console.log('Screenshot saved');
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();