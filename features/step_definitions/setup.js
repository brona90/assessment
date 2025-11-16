import { Given, When, Then, Before, After, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { chromium } from 'playwright';

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
  // Try both ports
  try {
    await global.page.goto('http://localhost:5174');
  } catch (error) {
    try {
      await global.page.goto('http://localhost:5173');
    } catch (error2) {
      // If server is not running, wait and try again
      await global.page.waitForTimeout(2000);
      await global.page.goto('http://localhost:5174');
    }
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