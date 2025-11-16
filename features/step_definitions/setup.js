import { Given, When, Then, Before, After, BeforeAll, AfterAll, setDefaultTimeout } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
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
  global.page = await global.browser.newPage();
});

Given('I am on the technology assessment page', async () => {
  // Try multiple ports in order
  const ports = [5175, 5174, 5173];
  let connected = false;
  
  for (const port of ports) {
    try {
      await global.page.goto(`http://localhost:${port}/assessment/`, { timeout: 5000 });
      connected = true;
      break;
    } catch (error) {
      // Try next port
      continue;
    }
  }
  
  if (!connected) {
    throw new Error('Could not connect to dev server on any port');
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
  if (global.page) {
    await global.page.close();
    global.page = null;
  }
});

AfterAll(async () => {
  if (global.browser) {
    await global.browser.close();
    global.browser = null;
  }
});