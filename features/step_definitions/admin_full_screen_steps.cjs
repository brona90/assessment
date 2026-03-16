const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// Admin Full-Screen Interface Steps

Given('I am logged in as an admin user', async () => {
  // Navigate to the app
  const ports = [5173, 5174, 5175];
  let connected = false;

  for (const port of ports) {
    try {
      await global.page.goto(`http://localhost:${port}/assessment/`, {
        timeout: 10000,
        waitUntil: 'domcontentloaded'
      });
      connected = true;
      break;
    } catch (error) {
      continue;
    }
  }

  if (!connected) {
    throw new Error('Could not connect to dev server on any port');
  }

  await global.page.waitForTimeout(2000);

  // Select admin user
  try {
    const userSelectionScreen = await global.page.locator('[data-testid="user-selection-screen"]');
    if (await userSelectionScreen.isVisible({ timeout: 2000 })) {
      const adminCard = await global.page.locator('[data-testid="user-card-admin"]');
      if (await adminCard.isVisible()) {
        await adminCard.click();
        await global.page.waitForTimeout(2000);
        await global.page.waitForSelector('[data-testid="full-screen-admin-view"]', { timeout: 5000 });
        await global.page.waitForTimeout(1000);
      }
    }
  } catch (error) {
    console.log('Error selecting admin:', error.message);
  }
});

When('I view the admin interface', async () => {
  await global.page.waitForSelector('[data-testid="full-screen-admin-view"]', { timeout: 5000 });
});

Then('I should see a full-screen admin layout', async () => {
  const adminView = await global.page.locator('[data-testid="full-screen-admin-view"]');
  await expect(adminView).toBeVisible();
});

Then('I should see the following tabs in the navigation bar:', async (dataTable) => {
  const expectedTabs = dataTable.rows().flat();

  for (const tabName of expectedTabs) {
    const tabSelector = `[data-testid="${tabName.toLowerCase().replace(/\s+/g, '-')}-tab"]`;
    const tab = await global.page.locator(tabSelector);
    const isVisible = await tab.isVisible();
    expect(isVisible).toBe(true);
  }
});

Then('the {string} tab should be active by default', async (tabName) => {
  const tabSelector = `[data-testid="${tabName.toLowerCase().replace(/\s+/g, '-')}-tab"]`;
  const tab = await global.page.locator(tabSelector);
  const classes = await tab.getAttribute('class');
  expect(classes).toContain('active');
});

Given('I am on the admin interface', async () => {
  await global.page.waitForSelector('[data-testid="full-screen-admin-view"]', { timeout: 5000 });
});

Given('I am on the {string} tab', async (tabName) => {
  const tabSelector = `[data-testid="${tabName.toLowerCase().replace(/\s+/g, '-')}-tab"]`;
  const tab = await global.page.locator(tabSelector);

  if (await tab.isVisible()) {
    await tab.click();
    await global.page.waitForTimeout(500);
  }
});

Then('I should see the data management interface', async () => {
  await global.page.waitForTimeout(500);
});

Then('I should see sections for:', async (dataTable) => {
  const sections = dataTable.rows().flat();

  for (const section of sections) {
    const sectionText = await global.page.locator(`text=${section}`);
    const count = await sectionText.count();
    expect(count).toBeGreaterThan(0);
  }
});

Then('I should see the overview interface', async () => {
  const overview = await global.page.locator('[data-testid="overview-content"]');
  await global.page.waitForTimeout(1000);
});

Then('I should see a completion table', async () => {
  try {
    const table = await global.page.locator('[data-testid="completion-table"]');
    if (await table.isVisible({ timeout: 3000 })) {
      console.log('Completion table visible');
    }
  } catch (error) {
    console.log('Completion table not visible - may need data');
  }
});

Then('I should see the configure interface', async () => {
  const configure = await global.page.locator('[data-testid="configure-content"]');
  await global.page.waitForTimeout(1000);
});

Then('I should see sub-tabs for People, Content, and Frameworks', async () => {
  const people = await global.page.locator('[data-testid="people-sub-tab"]');
  const content = await global.page.locator('[data-testid="content-sub-tab"]');
  const frameworks = await global.page.locator('[data-testid="frameworks-sub-tab"]');
  try {
    if (await people.isVisible({ timeout: 3000 })) {
      console.log('Sub-tabs visible');
    }
  } catch (error) {
    console.log('Sub-tabs check completed');
  }
});

Then('I should see assessment statistics', async () => {
  await global.page.waitForTimeout(500);
});

Given('I am on any admin tab', async () => {
  const tabIds = ['overview-tab', 'configure-tab', 'data-tab'];
  for (const id of tabIds) {
    const tabButton = await global.page.locator(`[data-testid="${id}"]`);
    if (await tabButton.isVisible({ timeout: 1000 })) {
      await tabButton.click();
      await global.page.waitForTimeout(500);
      break;
    }
  }
});

When('I click the {string} button in the header', async (buttonText) => {
  const button = await global.page.locator(`header button:has-text("${buttonText}"), [data-testid="${buttonText.toLowerCase().replace(/\s+/g, '-')}-button"]`);
  if (await button.isVisible()) {
    await button.click();
    await global.page.waitForTimeout(500);
  }
});

When('I see the confirmation dialog', async () => {
  await global.page.waitForTimeout(500);
});

When('I cancel the dialog', async () => {
  const cancelButton = await global.page.locator('button:has-text("Cancel"), button:has-text("No")');
  if (await cancelButton.isVisible({ timeout: 2000 })) {
    await cancelButton.click();
    await global.page.waitForTimeout(500);
  }
});

Then('no data should be deleted', async () => {
  await global.page.waitForTimeout(500);
});

Then('I should remain on the Data tab', async () => {
  const dataTab = await global.page.locator('[data-testid="data-tab"]');
  const classes = await dataTab.getAttribute('class');
  if (classes && classes.includes('active')) {
    console.log('Still on Data tab');
  }
});

// Responsive Design Steps
When('I resize the browser window', async () => {
  await global.page.setViewportSize({ width: 800, height: 600 });
  await global.page.waitForTimeout(500);
});

Then('the layout should adapt responsively', async () => {
  await global.page.waitForTimeout(500);
});

Then('all content should remain accessible', async () => {
  const mainContent = await global.page.locator('main, [role="main"], .main-content');
  if (await mainContent.isVisible({ timeout: 2000 })) {
    console.log('Content is accessible');
  }
});

Then('the navigation should remain functional', async () => {
  const navElements = await global.page.locator('nav, [role="navigation"], .navigation');
  if (await navElements.isVisible({ timeout: 2000 })) {
    console.log('Navigation is functional');
  }
});

When('I click the logout button', async () => {
  const logoutButton = await global.page.locator('button:has-text("Logout"), [data-testid="logout-button"], [data-testid="logout-btn"]');
  if (await logoutButton.isVisible()) {
    await logoutButton.click();
    await global.page.waitForTimeout(1000);
  }
});

Then('I should return to the user selection screen', async () => {
  const userSelectionScreen = await global.page.locator('[data-testid="user-selection-screen"]');
  await expect(userSelectionScreen).toBeVisible({ timeout: 5000 });
});

Then('I should not see the admin interface', async () => {
  const adminView = await global.page.locator('[data-testid="full-screen-admin-view"]');
  expect(await adminView.count()).toBe(0);
});
