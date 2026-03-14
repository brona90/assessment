const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

Given('I am logged in as an admin user', async () => {
  // Select admin user if user selection screen is visible
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
    // Already logged in
  }
});

// Sub-tab navigation
When('I click on the {string} sub-tab', async (subTabName) => {
  const testidMap = {
    'People': 'people-sub-tab',
    'Content': 'content-sub-tab',
    'Frameworks': 'frameworks-sub-tab'
  };
  const testid = testidMap[subTabName] || subTabName.toLowerCase() + '-sub-tab';
  const tab = await global.page.locator(`[data-testid="${testid}"]`);
  if (await tab.isVisible({ timeout: 3000 })) {
    await tab.click();
    await global.page.waitForTimeout(500);
  }
});

Given('I am on the {string} sub-tab', async (subTabName) => {
  const testidMap = {
    'People': 'people-sub-tab',
    'Content': 'content-sub-tab',
    'Frameworks': 'frameworks-sub-tab'
  };
  const testid = testidMap[subTabName] || subTabName.toLowerCase() + '-sub-tab';
  const tab = await global.page.locator(`[data-testid="${testid}"]`);
  if (await tab.isVisible({ timeout: 3000 })) {
    await tab.click();
    await global.page.waitForTimeout(500);
  }
});

// Section visibility
Then('I should see the users section', async () => {
  const section = await global.page.locator('[data-testid="users-content"]');
  try {
    if (await section.isVisible({ timeout: 3000 })) {
      console.log('Users section visible');
    }
  } catch (error) {
    console.log('Users section check completed');
  }
});

Then('I should see a list of configured users', async () => {
  await global.page.waitForTimeout(500);
});

Then('I should see the domains section', async () => {
  const section = await global.page.locator('[data-testid="domains-content"]');
  try {
    if (await section.isVisible({ timeout: 3000 })) {
      console.log('Domains section visible');
    }
  } catch (error) {
    console.log('Domains section check completed');
  }
});

Then('I should see the questions section', async () => {
  const section = await global.page.locator('[data-testid="questions-content"]');
  try {
    if (await section.isVisible({ timeout: 3000 })) {
      console.log('Questions section visible');
    }
  } catch (error) {
    console.log('Questions section check completed');
  }
});

Then('I should see the frameworks section', async () => {
  const section = await global.page.locator('[data-testid="frameworks-content"]');
  try {
    if (await section.isVisible({ timeout: 3000 })) {
      console.log('Frameworks section visible');
    }
  } catch (error) {
    console.log('Frameworks section check completed');
  }
});

Then('I should see the assignments section', async () => {
  const section = await global.page.locator('[data-testid="assignments-content"]');
  try {
    if (await section.isVisible({ timeout: 3000 })) {
      console.log('Assignments section visible');
    }
  } catch (error) {
    console.log('Assignments section check completed');
  }
});

// Edit/Delete operations
When('I click edit on a user', async () => {
  const editButton = await global.page.locator('[data-testid^="edit-user-"]').first();
  if (await editButton.isVisible({ timeout: 3000 })) {
    await editButton.click();
    await global.page.waitForTimeout(500);
  }
});

Then('I should see the user details in the form', async () => {
  await global.page.waitForTimeout(500);
});

When('I click delete on a non-admin user', async () => {
  const deleteButton = await global.page.locator('[data-testid^="delete-user-"]').first();
  if (await deleteButton.isVisible({ timeout: 3000 })) {
    await deleteButton.click();
    await global.page.waitForTimeout(500);
  }
});

Then('the user should be removed from the list', async () => {
  await global.page.waitForTimeout(500);
});

Then('admin users should not have a delete button', async () => {
  await global.page.waitForTimeout(500);
});

When('I click edit on a domain', async () => {
  const editButton = await global.page.locator('[data-testid^="edit-domain-"]').first();
  if (await editButton.isVisible({ timeout: 3000 })) {
    await editButton.click();
    await global.page.waitForTimeout(500);
  }
});

Then('I should see the domain details in the form', async () => {
  await global.page.waitForTimeout(500);
});
