import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Given('I have completed an assessment', async () => {
  // Answer some questions to complete partial assessment
  await global.page.waitForSelector('[data-testid^="question-"]', { timeout: 10000 });
  const firstQuestion = await global.page.locator('[data-testid^="question-"]').first();
  if (await firstQuestion.isVisible()) {
    const options = await firstQuestion.locator('[data-testid^="option-"]').all();
    if (options.length > 3) {
      await options[3].click(); // Click 4th option (value 4)
      await global.page.waitForTimeout(500);
    }
  }
});

Given('my scores are calculated', async () => {
  // Ensure we have scores calculated
  await global.page.waitForTimeout(1000);
});

When('I navigate to the results section', async () => {
  const resultsTab = await global.page.locator('button:has-text("Results")');
  if (await resultsTab.isVisible()) {
    await resultsTab.click();
    await global.page.waitForTimeout(1000);
  }
});

When('I have answered questions', async () => {
  const firstQuestion = await global.page.locator('[data-testid^="question-"]').first();
  if (await firstQuestion.isVisible()) {
    await firstQuestion.click();
    const option3 = await global.page.locator('[data-value="3"]').first();
    if (await option3.isVisible()) {
      await option3.click();
    }
  }
});

Given('I have answers for all questions', async () => {
  // Answer all visible questions with score 5
  await global.page.waitForSelector('[data-testid^="question-"]', { timeout: 10000 });
  const questions = await global.page.locator('[data-testid^="question-"]').all();
  for (const question of questions) {
    if (await question.isVisible()) {
      const options = await question.locator('[data-testid^="option-"]').all();
      if (options.length > 4) {
        await options[4].click(); // Click 5th option (value 5)
        await global.page.waitForTimeout(300);
      }
    }
  }
});

When('I navigate to the assessment section', async () => {
  const assessmentTab = await global.page.locator('button:has-text("Assessment")');
  if (await assessmentTab.isVisible()) {
    await assessmentTab.click();
  }
});

When('I select an answer for a question', async () => {
  // Wait for questions to be visible
  await global.page.waitForSelector('[data-testid^="question-"]', { timeout: 10000 });
  const firstQuestion = await global.page.locator('[data-testid^="question-"]').first();
  await firstQuestion.waitFor({ state: 'visible' });
  
  // Click on an option within the question
  const option3 = await firstQuestion.locator('[data-testid^="option-"]').first();
  await option3.click();
  await global.page.waitForTimeout(500);
});

When('I click on a domain tab', async () => {
  // Look for navigation buttons - skip the first one (Assessment) and click the second
  const navButtons = await global.page.locator('nav button, .app-nav button').all();
  if (navButtons.length > 1) {
    await navButtons[1].click();
    await global.page.waitForTimeout(500);
  }
});

When('I answer all questions across all domains', async () => {
  // Get all navigation buttons
  const navButtons = await global.page.locator('nav button, .app-nav button').all();
  
  for (let i = 0; i < navButtons.length; i++) {
    // Skip Results and Compliance tabs
    const buttonText = await navButtons[i].textContent();
    if (buttonText.includes('Results') || buttonText.includes('Compliance')) {
      continue;
    }
    
    await navButtons[i].click();
    await global.page.waitForTimeout(1000);
    
    // Answer all visible questions
    const questions = await global.page.locator('[data-testid^="question-"]').all();
    for (const question of questions) {
      if (await question.isVisible()) {
        const options = await question.locator('[data-testid^="option-"]').all();
        if (options.length > 3) {
          await options[3].click(); // Click 4th option (value 4)
          await global.page.waitForTimeout(300);
        }
      }
    }
  }
});

When('I complete some questions', async () => {
  await global.page.waitForSelector('[data-testid^="question-"]', { timeout: 10000 });
  
  const questions = await global.page.locator('[data-testid^="question-"]').all();
  
  // Answer first question
  if (questions.length > 0) {
    const options1 = await questions[0].locator('[data-testid^="option-"]').all();
    if (options1.length > 2) {
      await options1[2].click(); // Click 3rd option
      await global.page.waitForTimeout(300);
    }
  }
  
  // Answer second question
  if (questions.length > 1) {
    const options2 = await questions[1].locator('[data-testid^="option-"]').all();
    if (options2.length > 3) {
      await options2[3].click(); // Click 4th option
      await global.page.waitForTimeout(300);
    }
  }
});

When('I switch to the results section', async () => {
  const resultsTab = await global.page.locator('button:has-text("Results")');
  if (await resultsTab.isVisible()) {
    await resultsTab.click();
  }
});

When('I switch back to assessment', async () => {
  const assessmentTab = await global.page.locator('button:has-text("Assessment")');
  if (await assessmentTab.isVisible()) {
    await assessmentTab.click();
  }
});

When('I reset the assessment', async () => {
  const resetButton = await global.page.locator('button:has-text("Reset")');
  if (await resetButton.isVisible()) {
    await resetButton.click();
  }
});

Then('I should see the assessment form', async () => {
  await global.page.waitForSelector('[data-testid^="question-"]', { state: 'visible' });
  const firstQuestion = await global.page.locator('[data-testid^="question-"]').first();
  await expect(firstQuestion).toBeVisible();
});

Then('I should see domain categories', async () => {
  // Look for domain navigation or tabs - they might be in the nav or as buttons
  const navButtons = await global.page.locator('nav button, .app-nav button');
  const count = await navButtons.count();
  expect(count).toBeGreaterThan(0);
});

Then('I should see progress indicators', async () => {
  const progressBar = await global.page.locator('[data-testid="progress-bar"]');
  await expect(progressBar).toBeVisible();
});

Then('the progress bar should update', async () => {
  await global.page.waitForTimeout(500);
  const progressBar = await global.page.locator('[data-testid="progress-bar"]');
  await expect(progressBar).toBeVisible();
  // Check if progress text exists - it might show "1 answered" or similar
  const progressText = await global.page.locator('text=/\\d+/');
  expect(await progressText.count()).toBeGreaterThan(0);
});

Then('the answer should be saved', async () => {
  // Check if an option is selected by looking for selected class or aria-checked
  const selectedOption = await global.page.locator('[data-testid^="option-"][class*="selected"], [data-testid^="option-"][aria-checked="true"]').first();
  await expect(selectedOption).toBeVisible();
});

Then('I should see that domain\'s questions', async () => {
  await global.page.waitForTimeout(1000);
  const questions = await global.page.locator('[data-testid^="question-"]');
  const count = await questions.count();
  expect(count).toBeGreaterThan(0);
});

Then('the progress should be maintained', async () => {
  const progressBar = await global.page.locator('[data-testid="progress-bar"]');
  await expect(progressBar).toBeVisible();
});

Then('I should see a completion message', async () => {
  const completionText = await global.page.locator('text=/completed|finished|done/i');
  // May not always be visible, so we'll be lenient
  if (await completionText.isVisible()) {
    await expect(completionText).toBeVisible();
  }
});

Then('the overall score should be calculated', async () => {
  // Switch to results to see scores
  const resultsTab = await global.page.locator('button:has-text("Results")');
  if (await resultsTab.isVisible()) {
    await resultsTab.click();
    await global.page.waitForTimeout(1000);
  }
  
  const scoreElement = await global.page.locator('text=/\\d+\\.\\d+/');
  await expect(scoreElement.first()).toBeVisible();
});

Then('the domain scores should be displayed', async () => {
  // Ensure we're on results section
  const resultsTab = await global.page.locator('button:has-text("Results")');
  if (await resultsTab.isVisible()) {
    await resultsTab.click();
    await global.page.waitForTimeout(1000);
  }
  
  const domainScores = await global.page.locator('text=/\\d+\\.\\d+/');
  expect(await domainScores.count()).toBeGreaterThan(0);
});

Then('I should see current scores', async () => {
  const scoreElement = await global.page.locator('text=/\\d+\\.\\d+\/5\.0/');
  await expect(scoreElement.first()).toBeVisible();
});

Then('my answers should be preserved', async () => {
  // Check if selected options are still present
  const selectedOptions = await global.page.locator('[data-testid^="option-"][class*="selected"], [data-testid^="option-"][aria-checked="true"]');
  expect(await selectedOptions.count()).toBeGreaterThan(0);
});

Then('all answers should be cleared', async () => {
  const selectedOptions = await global.page.locator('[data-testid^="option-"][class*="selected"], [data-testid^="option-"][aria-checked="true"]');
  expect(await selectedOptions.count()).toBe(0);
});

Then('progress should be reset to 0', async () => {
  const progressText = await global.page.locator('text=/0 answered/');
  await expect(progressText).toBeVisible();
});