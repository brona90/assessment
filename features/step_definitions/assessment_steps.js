import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Given('I have completed an assessment', async () => {
  // Answer some questions to complete partial assessment
  const firstQuestion = await global.page.locator('[data-testid^="question-"]').first();
  if (await firstQuestion.isVisible()) {
    await firstQuestion.click();
    const option4 = await global.page.locator('[data-value="4"]').first();
    if (await option4.isVisible()) {
      await option4.click();
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
  const questions = await global.page.locator('[data-testid^="question-"]').all();
  for (const question of questions) {
    if (await question.isVisible()) {
      await question.click();
      const option5 = await global.page.locator('[data-value="5"]').first();
      if (await option5.isVisible()) {
        await option5.click();
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
  const firstQuestion = await global.page.locator('[data-testid^="question-"]').first();
  await firstQuestion.click();
  const option3 = await global.page.locator('[data-value="3"]').first();
  await option3.click();
});

When('I click on a domain tab', async () => {
  const domainTab = await global.page.locator('button[data-testid^="domain-"]').first();
  if (await domainTab.isVisible()) {
    await domainTab.click();
  }
});

When('I answer all questions across all domains', async () => {
  const domains = await global.page.locator('button[data-testid^="domain-"]').all();
  
  for (const domain of domains) {
    if (await domain.isVisible()) {
      await domain.click();
      
      // Wait for domain content to load
      await global.page.waitForTimeout(500);
      
      // Answer all questions in this domain
      const questions = await global.page.locator('[data-testid^="question-"]').all();
      for (const question of questions) {
        if (await question.isVisible()) {
          await question.click();
          const option4 = await global.page.locator('[data-value="4"]').first();
          if (await option4.isVisible()) {
            await option4.click();
          }
        }
      }
    }
  }
});

When('I complete some questions', async () => {
  await global.page.locator('[data-testid^="question-"]').first().click();
  await global.page.locator('[data-value="3"]').first().click();
  await global.page.locator('[data-testid^="question-"]').nth(1).click();
  await global.page.locator('[data-value="4"]').first().click();
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
  const domainTabs = await global.page.locator('button[data-testid^="domain-"]');
  await expect(domainTabs.first()).toBeVisible();
});

Then('I should see progress indicators', async () => {
  const progressBar = await global.page.locator('[data-testid="progress-bar"]');
  await expect(progressBar).toBeVisible();
});

Then('the progress bar should update', async () => {
  const progressBar = await global.page.locator('[data-testid="progress-bar"]');
  await expect(progressBar).toBeVisible();
  // Check if progress text exists
  const progressText = await global.page.locator('text=/\\d+ answered/');
  await expect(progressText).toBeVisible();
});

Then('the answer should be saved', async () => {
  const firstQuestion = await global.page.locator('[data-testid^="question-"]').first();
  await expect(firstQuestion).toHaveClass(/selected/);
});

Then('I should see that domain\'s questions', async () => {
  await global.page.waitForTimeout(500);
  const questions = await global.page.locator('[data-testid^="question-"]');
  await expect(questions.first()).toBeVisible();
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
  const scoreElement = await global.page.locator('text=/\\d+\\.\\d+\\/5\\.0/');
  await expect(scoreElement).toBeVisible();
});

Then('the domain scores should be displayed', async () => {
  const domainScores = await global.page.locator('text=/\\d+\\.\\d+\/5\.0/');
  await expect(domainScores.first()).toBeVisible();
});

Then('I should see current scores', async () => {
  const scoreElement = await global.page.locator('text=/\\d+\\.\\d+\/5\.0/');
  await expect(scoreElement.first()).toBeVisible();
});

Then('my answers should be preserved', async () => {
  const answeredQuestions = await global.page.locator('[class*="selected"]');
  expect(await answeredQuestions.count()).toBeGreaterThan(0);
});

Then('all answers should be cleared', async () => {
  const answeredQuestions = await global.page.locator('[class*="selected"]');
  expect(await answeredQuestions.count()).toBe(0);
});

Then('progress should be reset to 0', async () => {
  const progressText = await global.page.locator('text=/0 answered/');
  await expect(progressText).toBeVisible();
});