import { Given, When, Then, Before, After, BeforeAll, AfterAll, setDefaultTimeout } from '@cucumber/cucumber';
const { expect } = require('@playwright/test');
import { chromium } from 'playwright';

// Set default timeout for all steps to 60 seconds
setDefaultTimeout(60000);

// Global setup for cucumber tests
global.browser = null;
global.page = null;

BeforeAll(async () => {
  global.browser = await chromium.launch({ headless: true });
});

Before(async () => {
  // Ensure browser is still open
  if (!global.browser || !global.browser.isConnected()) {
    global.browser = await chromium.launch({ headless: true });
  }
  global.page = await global.browser.newPage();
});

Given('I am on the technology assessment page', async () => {
  // Try multiple ports in order
  const ports = [5173, 5174, 5175];
  let connected = false;
  let lastError = null;
  
  for (const port of ports) {
    try {
      await global.page.goto(`http://localhost:${port}/assessment/`, { 
        timeout: 15000,
        waitUntil: 'domcontentloaded'
      });
      connected = true;
      console.log(`Connected to dev server on port ${port}`);
      break;
    } catch (error) {
      lastError = error;
      console.log(`Failed to connect to port ${port}: ${error.message}`);
      // Try next port
      continue;
    }
  }
  
  if (!connected) {
    throw new Error(`Could not connect to dev server on any port. Last error: ${lastError?.message}`);
  }
  
  // Check if user selection screen is visible and select a user
  try {
    const userSelectionScreen = await global.page.locator('[data-testid="user-selection-screen"]');
    if (await userSelectionScreen.isVisible({ timeout: 2000 })) {
      console.log('User selection screen detected, selecting a user...');
      const userCard = await global.page.locator('[data-testid="user-card-user1"]');
      if (await userCard.isVisible()) {
        await userCard.click();
        await global.page.waitForTimeout(2000);
        console.log('User selected successfully');
        
        // Wait for user view to load
        await global.page.waitForSelector('[data-testid="user-view"]', { timeout: 5000 });
        await global.page.waitForTimeout(1000);
      }
    }
  } catch (error) {
    console.log('No user selection screen or already logged in');
  }
});

Given('the assessment data is loaded', async () => {
  try {
    await global.page.waitForSelector('[data-testid="loading"]', { state: 'hidden', timeout: 10000 });
  } catch (error) {
    // Loading might not be present, continue
  }
  // Wait a bit more for data to fully load
  await global.page.waitForTimeout(1000);
});

// Cleanup after each scenario
After(async () => {
  if (global.page && !global.page.isClosed()) {
    try {
      await global.page.close();
    } catch (error) {
      console.log('Error closing page:', error.message);
    }
    global.page = null;
  }
});

AfterAll(async () => {
  if (global.browser) {
    try {
      await global.browser.close();
    } catch (error) {
      console.log('Error closing browser:', error.message);
    }
    global.browser = null;
  }
});