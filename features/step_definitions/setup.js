import { Given, When, Then, After } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { chromium } from 'playwright';

// Global setup for cucumber tests
global.browser = null;
global.page = null;

Given('I am on the technology assessment page', async () => {
  if (!global.browser) {
    global.browser = await chromium.launch({ headless: true });
  }
  global.page = await global.browser.newPage();
  
  // Start the dev server if not running
  try {
    await global.page.goto('http://localhost:5173');
  } catch (error) {
    // If server is not running, we'll wait and try again
    await global.page.waitForTimeout(2000);
    await global.page.goto('http://localhost:5173');
  }
});

Given('the assessment data is loaded', async () => {
  try {
    await global.page.waitForSelector('[data-testid="loading"]', { state: 'hidden', timeout: 10000 });
  } catch (error) {
    // Loading might not be present, continue
  }
});

// Cleanup after each scenario
After(async () => {
  if (global.page) {
    await global.page.close();
  }
});