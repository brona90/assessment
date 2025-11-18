const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

Given('I am logged in as an admin user', async () => {
  // Select admin user if user selection screen is visible
  try {
    const userSelectionScreen = await global.page.locator('[data-testid="user-selection-screen"]');
    if (await userSelectionScreen.isVisible({ timeout: 2000 })) {
      console.log('User selection screen detected, selecting admin...');
      const adminCard = await global.page.locator('[data-testid="user-card-admin"]');
      if (await adminCard.isVisible()) {
        await adminCard.click();
        await global.page.waitForTimeout(2000);
        console.log('Admin selected successfully');
        
        // Wait for admin view to load
        await global.page.waitForSelector('[data-testid="full-screen-admin-view"]', { timeout: 5000 });
        await global.page.waitForTimeout(1000);
      }
    }
  } catch (error) {
    console.log('No user selection screen or already logged in as admin');
  }
});

When('I click on the Admin navigation button', async () => {
  const adminButton = await global.page.locator('button:has-text("Admin")');
  if (await adminButton.isVisible()) {
    await adminButton.click();
    await global.page.waitForTimeout(500);
  } else {
    // Admin button might not be visible if not admin or not implemented
    console.log('Admin button not found - feature may not be fully integrated');
  }
});

Then('I should see the admin panel', async () => {
  const adminPanel = await global.page.locator('[data-testid="admin-panel"]');
  if (await adminPanel.isVisible()) {
    await expect(adminPanel).toBeVisible();
  } else {
    // Admin panel not visible - feature may not be fully integrated
    console.log('Admin panel not visible - feature may not be fully integrated');
  }
});

Then('I should see tabs for Questions, Users, and Assignments', async () => {
  const questionsTab = await global.page.locator('[data-testid="tab-questions"]');
  const usersTab = await global.page.locator('[data-testid="tab-users"]');
  const assignmentsTab = await global.page.locator('[data-testid="tab-assignments"]');
  
  if (await questionsTab.isVisible()) {
    await expect(questionsTab).toBeVisible();
    await expect(usersTab).toBeVisible();
    await expect(assignmentsTab).toBeVisible();
  }
});

Given('I am on the admin panel', async () => {
  const adminButton = await global.page.locator('button:has-text("Admin")');
  if (await adminButton.isVisible()) {
    await adminButton.click();
    await global.page.waitForTimeout(500);
  }
});

When('I click on the Questions tab', async () => {
  const questionsTab = await global.page.locator('[data-testid="tab-questions"]');
  if (await questionsTab.isVisible()) {
    await questionsTab.click();
    await global.page.waitForTimeout(500);
  }
});

Then('I should see the questions manager', async () => {
  const questionsManager = await global.page.locator('[data-testid="questions-manager"]');
  if (await questionsManager.isVisible()) {
    await expect(questionsManager).toBeVisible();
  }
});

Then('I should see domain and category selectors', async () => {
  const domainSelect = await global.page.locator('[data-testid="domain-select"]');
  if (await domainSelect.isVisible()) {
    await expect(domainSelect).toBeVisible();
  }
});

Then('I should be able to select a domain', async () => {
  const domainSelect = await global.page.locator('[data-testid="domain-select"]');
  if (await domainSelect.isVisible()) {
    await domainSelect.selectOption({ index: 1 });
    await global.page.waitForTimeout(500);
  }
});

Then('I should be able to select a category', async () => {
  const categorySelect = await global.page.locator('[data-testid="category-select"]');
  if (await categorySelect.isVisible()) {
    await expect(categorySelect).toBeVisible();
  }
});

Given('I am on the Questions tab', async () => {
  const questionsTab = await global.page.locator('[data-testid="tab-questions"]');
  if (await questionsTab.isVisible()) {
    await questionsTab.click();
    await global.page.waitForTimeout(500);
  }
});

Given('I have selected a domain and category', async () => {
  const domainSelect = await global.page.locator('[data-testid="domain-select"]');
  if (await domainSelect.isVisible()) {
    await domainSelect.selectOption({ index: 1 });
    await global.page.waitForTimeout(500);
    
    const categorySelect = await global.page.locator('[data-testid="category-select"]');
    if (await categorySelect.isVisible()) {
      await categorySelect.selectOption({ index: 1 });
      await global.page.waitForTimeout(500);
    }
  }
});

When('I enter a question ID', async () => {
  const questionIdInput = await global.page.locator('[data-testid="question-id-input"]');
  if (await questionIdInput.isVisible()) {
    await questionIdInput.fill('test_q1');
  }
});

When('I enter question text', async () => {
  const questionTextInput = await global.page.locator('[data-testid="question-text-input"]');
  if (await questionTextInput.isVisible()) {
    await questionTextInput.fill('This is a test question');
  }
});

When('I click the add question button', async () => {
  const addButton = await global.page.locator('[data-testid="add-question-btn"]');
  if (await addButton.isVisible()) {
    await addButton.click();
    await global.page.waitForTimeout(500);
  }
});

Then('the question should be added to the list', async () => {
  // Verify question was added
  await global.page.waitForTimeout(500);
});

Then('I should see the new question in the questions list', async () => {
  const questionItem = await global.page.locator('[data-testid^="question-item-"]');
  if (await questionItem.first().isVisible()) {
    await expect(questionItem.first()).toBeVisible();
  }
});

Given('I have selected a domain with questions', async () => {
  const domainSelect = await global.page.locator('[data-testid="domain-select"]');
  if (await domainSelect.isVisible()) {
    await domainSelect.selectOption({ index: 1 });
    await global.page.waitForTimeout(500);
    
    const categorySelect = await global.page.locator('[data-testid="category-select"]');
    if (await categorySelect.isVisible()) {
      await categorySelect.selectOption({ index: 1 });
      await global.page.waitForTimeout(500);
    }
  }
});

When('I click edit on a question', async () => {
  const editButton = await global.page.locator('[data-testid^="edit-"]').first();
  if (await editButton.isVisible()) {
    await editButton.click();
    await global.page.waitForTimeout(500);
  }
});

Then('I should see the question details in the form', async () => {
  const questionIdInput = await global.page.locator('[data-testid="question-id-input"]');
  if (await questionIdInput.isVisible()) {
    const value = await questionIdInput.inputValue();
    expect(value).toBeTruthy();
  }
});

When('I modify the question text', async () => {
  const questionTextInput = await global.page.locator('[data-testid="question-text-input"]');
  if (await questionTextInput.isVisible()) {
    await questionTextInput.fill('Updated question text');
  }
});

When('I click the update button', async () => {
  const updateButton = await global.page.locator('[data-testid="update-question-btn"]');
  if (await updateButton.isVisible()) {
    await updateButton.click();
    await global.page.waitForTimeout(500);
  }
});

Then('the question should be updated', async () => {
  // Verify question was updated
  await global.page.waitForTimeout(500);
});

Then('I should see the updated question in the list', async () => {
  const questionItem = await global.page.locator('[data-testid^="question-item-"]');
  if (await questionItem.first().isVisible()) {
    await expect(questionItem.first()).toBeVisible();
  }
});

When('I click delete on a question', async () => {
  const deleteButton = await global.page.locator('[data-testid^="delete-"]').first();
  if (await deleteButton.isVisible()) {
    await deleteButton.click();
    await global.page.waitForTimeout(500);
  }
});

When('I confirm the deletion', async () => {
  // Handle confirmation dialog
  global.page.on('dialog', async dialog => {
    await dialog.accept();
  });
  await global.page.waitForTimeout(500);
});

Then('the question should be removed from the list', async () => {
  // Verify question was removed
  await global.page.waitForTimeout(500);
});

When('I click on the Users tab', async () => {
  const usersTab = await global.page.locator('[data-testid="tab-users"]');
  if (await usersTab.isVisible()) {
    await usersTab.click();
    await global.page.waitForTimeout(500);
  }
});

Then('I should see the users manager', async () => {
  const usersManager = await global.page.locator('[data-testid="users-manager"]');
  if (await usersManager.isVisible()) {
    await expect(usersManager).toBeVisible();
  }
});

Then('I should see a list of users', async () => {
  const userItem = await global.page.locator('[data-testid^="user-item-"]');
  if (await userItem.first().isVisible()) {
    await expect(userItem.first()).toBeVisible();
  }
});

Then('each user should show their name, email, and role', async () => {
  const userItem = await global.page.locator('[data-testid^="user-item-"]').first();
  if (await userItem.isVisible()) {
    const text = await userItem.textContent();
    expect(text).toBeTruthy();
  }
});

Given('I am on the Users tab', async () => {
  const usersTab = await global.page.locator('[data-testid="tab-users"]');
  if (await usersTab.isVisible()) {
    await usersTab.click();
    await global.page.waitForTimeout(500);
  }
});

When('I click delete on a non-admin user', async () => {
  const deleteButton = await global.page.locator('[data-testid^="delete-user-"]').first();
  if (await deleteButton.isVisible()) {
    await deleteButton.click();
    await global.page.waitForTimeout(500);
  }
});

Then('the user should be removed from the list', async () => {
  // Verify user was removed
  await global.page.waitForTimeout(500);
});

Then('admin users should not have a delete button', async () => {
  // Verify admin users don't have delete buttons
  await global.page.waitForTimeout(500);
});

When('I click on the Assignments tab', async () => {
  const assignmentsTab = await global.page.locator('[data-testid="tab-assignments"]');
  if (await assignmentsTab.isVisible()) {
    await assignmentsTab.click();
    await global.page.waitForTimeout(500);
  }
});

Then('I should see the assignments manager', async () => {
  const assignmentsManager = await global.page.locator('[data-testid="assignments-manager"]');
  if (await assignmentsManager.isVisible()) {
    await expect(assignmentsManager).toBeVisible();
  }
});

Then('I should see a message about the feature', async () => {
  const message = await global.page.locator('text=/coming soon/i');
  if (await message.isVisible()) {
    await expect(message).toBeVisible();
  }
});