import { Given, When, Then, Before, After, BeforeAll, AfterAll, setDefaultTimeout } from '@cucumber/cucumber';
const { expect } = require('@playwright/test');
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import http from 'http';

// Set default timeout for all steps to 60 seconds
setDefaultTimeout(60000);

// Global setup for cucumber tests
global.browser = null;
global.page = null;
global._devServer = null;
global._devServerPort = null;

function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/assessment/`, (res) => {
      res.resume();
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => { req.destroy(); resolve(false); });
  });
}

async function findOrStartDevServer() {
  // Check if a dev server is already running
  for (const port of [5173, 5174, 5175]) {
    if (await checkPort(port)) {
      global._devServerPort = port;
      return;
    }
  }

  // Start one ourselves
  const child = spawn('npx', ['vite', '--port', '5173'], {
    cwd: process.cwd(),
    stdio: 'pipe',
    detached: true,
  });
  global._devServer = child;

  // Wait for it to be ready (up to 30s)
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 500));
    if (await checkPort(5173)) {
      global._devServerPort = 5173;
      return;
    }
  }
  throw new Error('Dev server failed to start within 30s');
}

BeforeAll(async () => {
  await findOrStartDevServer();
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

  // Stop dev server if we started it
  if (global._devServer) {
    try {
      process.kill(-global._devServer.pid, 'SIGTERM');
    } catch (e) {
      global._devServer.kill('SIGTERM');
    }
    global._devServer = null;
  }
});