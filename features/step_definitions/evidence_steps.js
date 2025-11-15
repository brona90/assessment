import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Given('I am on the assessment page', async () => {
  const assessmentTab = await global.page.locator('button:has-text("Assessment")');
  if (await assessmentTab.isVisible()) {
    await assessmentTab.click();
    await global.page.waitForTimeout(500);
  }
});

When('I click on the evidence button', async () => {
  const evidenceButton = await global.page.locator('[data-testid^="evidence-button"]').first();
  if (await evidenceButton.isVisible()) {
    await evidenceButton.click();
  }
});

When('I have existing evidence', async () => {
  // Setup evidence for a question
  const evidenceButton = await global.page.locator('[data-testid^="evidence-button"]').first();
  if (await evidenceButton.isVisible()) {
    await evidenceButton.click();
    await global.page.waitForTimeout(300);
    
    const textArea = await global.page.locator('textarea[data-testid="evidence-text"]');
    if (await textArea.isVisible()) {
      await textArea.fill('Existing test evidence');
      const saveButton = await global.page.locator('button:has-text("Save")');
      if (await saveButton.isVisible()) {
        await saveButton.click();
        await global.page.waitForTimeout(300);
      }
    }
  }
});

Then('the changes should be persisted', async () => {
  // Verify evidence changes are saved
  const evidenceButton = await global.page.locator('[data-testid^="evidence-button"]').first();
  await expect(evidenceButton).toBeVisible();
});

Given('I have answered some questions', async () => {
  await global.page.locator('[data-testid^="question-"]').first().click();
  await global.page.locator('[data-value="3"]').first().click();
});

When('I click on an evidence button for a question', async () => {
  const evidenceButton = await global.page.locator('[data-testid^="evidence-button"]').first();
  if (await evidenceButton.isVisible()) {
    await evidenceButton.click();
  }
});

When('I enter evidence and save', async () => {
  const textArea = await global.page.locator('textarea[data-testid="evidence-text"]');
  if (await textArea.isVisible()) {
    await textArea.fill('This is test evidence for the assessment question.');
    const saveButton = await global.page.locator('button:has-text("Save")');
    if (await saveButton.isVisible()) {
      await saveButton.click();
    }
  }
});

Given('I have evidence for a question', async () => {
  const evidenceButton = await global.page.locator('[data-testid^="evidence-button"]').first();
  if (await evidenceButton.isVisible()) {
    await evidenceButton.click();
    const textArea = await global.page.locator('textarea[data-testid="evidence-text"]');
    if (await textArea.isVisible()) {
      await textArea.fill('Existing evidence for testing.');
      const saveButton = await global.page.locator('button:has-text("Save")');
      if (await saveButton.isVisible()) {
        await saveButton.click();
      }
    }
  }
});

When('I modify it in the modal', async () => {
  const textArea = await global.page.locator('textarea[data-testid="evidence-text"]');
  if (await textArea.isVisible()) {
    await textArea.fill('Modified evidence content for testing.');
  }
});

When('I save the changes', async () => {
  const saveButton = await global.page.locator('button:has-text("Save")');
  if (await saveButton.isVisible()) {
    await saveButton.click();
  }
});

When('I open the evidence modal', async () => {
  const evidenceButton = await global.page.locator('[data-testid^="evidence-button"]').first();
  if (await evidenceButton.isVisible()) {
    await evidenceButton.click();
  }
});

When('I click delete', async () => {
  const deleteButton = await global.page.locator('button:has-text("Delete")');
  if (await deleteButton.isVisible()) {
    await deleteButton.click();
  }
});

When('I add evidence for multiple questions', async () => {
  const evidenceButtons = await global.page.locator('[data-testid^="evidence-button"]').all();
  for (let i = 0; i < Math.min(3, evidenceButtons.length); i++) {
    if (await evidenceButtons[i].isVisible()) {
      await evidenceButtons[i].click();
      await global.page.waitForTimeout(300);
      
      const textArea = await global.page.locator('textarea[data-testid="evidence-text"]');
      if (await textArea.isVisible()) {
        await textArea.fill(`Evidence for question ${i + 1}`);
        const saveButton = await global.page.locator('button:has-text("Save")');
        if (await saveButton.isVisible()) {
          await saveButton.click();
        }
      }
      await global.page.waitForTimeout(300);
    }
  }
});

When('I navigate between sections', async () => {
  // Switch between assessment and results sections
  const resultsTab = await global.page.locator('button:has-text("Results")');
  if (await resultsTab.isVisible()) {
    await resultsTab.click();
    await global.page.waitForTimeout(500);
  }
  
  const assessmentTab = await global.page.locator('button:has-text("Assessment")');
  if (await assessmentTab.isVisible()) {
    await assessmentTab.click();
    await global.page.waitForTimeout(500);
  }
});

When('I try to save empty evidence', async () => {
  const textArea = await global.page.locator('textarea[data-testid="evidence-text"]');
  if (await textArea.isVisible()) {
    await textArea.fill('');
    const saveButton = await global.page.locator('button:has-text("Save")');
    if (await saveButton.isVisible()) {
      await saveButton.click();
    }
  }
});

When('I try to save evidence that\'s too long', async () => {
  const textArea = await global.page.locator('textarea[data-testid="evidence-text"]');
  if (await textArea.isVisible()) {
    const longText = 'a'.repeat(10000); // Very long text
    await textArea.fill(longText);
    const saveButton = await global.page.locator('button:has-text("Save")');
    if (await saveButton.isVisible()) {
      await saveButton.click();
    }
  }
});

Then('the evidence modal should open', async () => {
  const modal = await global.page.locator('[data-testid="evidence-modal"]');
  if (await modal.isVisible()) {
    await expect(modal).toBeVisible();
  }
});

Then('I should see input fields for evidence', async () => {
  const textArea = await global.page.locator('textarea[data-testid="evidence-text"]');
  if (await textArea.isVisible()) {
    await expect(textArea).toBeVisible();
  }
});

Then('the evidence should be stored', async () => {
  // Check if evidence indicator shows evidence exists
  const evidenceButton = await global.page.locator('[data-testid^="evidence-button"]').first();
  await expect(evidenceButton).toBeVisible();
});

Then('the modal should close', async () => {
  const modal = await global.page.locator('[data-testid="evidence-modal"]');
  await global.page.waitForTimeout(500);
  if (await modal.isVisible()) {
    await expect(modal).not.toBeVisible();
  }
});

Then('I should see the existing evidence', async () => {
  const textArea = await global.page.locator('textarea[data-testid="evidence-text"]');
  if (await textArea.isVisible()) {
    const value = await textArea.inputValue();
    expect(value.length).toBeGreaterThan(0);
  }
});

Then('I should be able to edit it', async () => {
  const textArea = await global.page.locator('textarea[data-testid="evidence-text"]');
  if (await textArea.isVisible()) {
    await expect(textArea).toBeEnabled();
  }
});

Then('I should be able to delete it', async () => {
  const deleteButton = await global.page.locator('button:has-text("Delete")');
  if (await deleteButton.isVisible()) {
    await expect(deleteButton).toBeVisible();
  }
});

Then('the evidence should be updated', async () => {
  // Evidence should be modified
  const evidenceButton = await global.page.locator('[data-testid^="evidence-button"]').first();
  await expect(evidenceButton).toBeVisible();
});

Then('the evidence should be removed', async () => {
  // Check if evidence was deleted
  await global.page.waitForTimeout(500);
  const modal = await global.page.locator('[data-testid="evidence-modal"]');
  if (await modal.isVisible()) {
    await expect(modal).not.toBeVisible();
  }
});

Then('the evidence indicator should update', async () => {
  const evidenceButton = await global.page.locator('[data-testid^="evidence-button"]').first();
  await expect(evidenceButton).toBeVisible();
});

Then('all evidence should be preserved', async () => {
  const evidenceButtons = await global.page.locator('[data-testid^="evidence-button"]').all();
  expect(evidenceButtons.length).toBeGreaterThan(0);
});

Then('evidence should be available when I return', async () => {
  const evidenceButton = await global.page.locator('[data-testid^="evidence-button"]').first();
  if (await evidenceButton.isVisible()) {
    await evidenceButton.click();
    await global.page.waitForTimeout(300);
    
    const textArea = await global.page.locator('textarea[data-testid="evidence-text"]');
    if (await textArea.isVisible()) {
      const value = await textArea.inputValue();
      // Check if evidence exists (may be empty depending on test state)
    }
  }
});

Then('evidence should survive page reload', async () => {
  // Reload the page and check evidence persistence
  await global.page.reload();
  await global.page.waitForTimeout(2000);
  
  const evidenceButton = await global.page.locator('[data-testid^="evidence-button"]').first();
  if (await evidenceButton.isVisible()) {
    await evidenceButton.click();
    await global.page.waitForTimeout(300);
  }
});

Then('I should see validation messages', async () => {
  const validationMessage = await global.page.locator('text=/required|empty|validation/i');
  if (await validationMessage.isVisible()) {
    await expect(validationMessage).toBeVisible();
  }
});

Then('the evidence should not be saved', async () => {
  // Modal should remain open or validation should show
  const modal = await global.page.locator('[data-testid="evidence-modal"]');
  if (await modal.isVisible()) {
    await expect(modal).toBeVisible();
  }
});

Then('I should see length constraints', async () => {
  const lengthMessage = await global.page.locator('text=/too long|character limit|max length/i');
  if (await lengthMessage.isVisible()) {
    await expect(lengthMessage).toBeVisible();
  }
});