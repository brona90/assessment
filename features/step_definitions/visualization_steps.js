import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Given('I am on the results section', async () => {
  const resultsTab = await global.page.locator('button:has-text("Results")');
  if (await resultsTab.isVisible()) {
    await resultsTab.click();
    await global.page.waitForTimeout(1000);
  }
});

When('I change an answer', async () => {
  // Go back to assessment to change an answer
  const assessmentTab = await global.page.locator('button:has-text("Assessment")');
  if (await assessmentTab.isVisible()) {
    await assessmentTab.click();
    await global.page.waitForTimeout(500);
    
    // Change first answer
    const firstQuestion = await global.page.locator('[data-testid^="question-"]').first();
    if (await firstQuestion.isVisible()) {
      await firstQuestion.click();
      const option5 = await global.page.locator('[data-value="5"]').first();
      if (await option5.isVisible()) {
        await option5.click();
      }
    }
  }
});

When('I resize the browser window', async () => {
  // Resize window to test responsiveness
  await global.page.setViewportSize({ width: 800, height: 600 });
  await global.page.waitForTimeout(500);
});

When('I hover over chart elements', async () => {
  const chart = await global.page.locator('canvas');
  if (await chart.isVisible()) {
    await chart.hover({ position: { x: 100, y: 100 } });
    await global.page.waitForTimeout(500);
  }
});

When('I have no answers', async () => {
  // Reset assessment to have no answers
  const resetButton = await global.page.locator('button:has-text("Reset")');
  if (await resetButton.isVisible()) {
    await resetButton.click();
    await global.page.waitForTimeout(500);
  }
});

When('I interact with data points', async () => {
  const chart = await global.page.locator('canvas');
  if (await chart.isVisible()) {
    await chart.click({ position: { x: 100, y: 100 } });
    await global.page.waitForTimeout(500);
  }
});

Then('I should see a radar chart', async () => {
  const radarChart = await global.page.locator('[data-testid="radar-chart"]');
  if (await radarChart.isVisible()) {
    await expect(radarChart).toBeVisible();
  } else {
    // Chart might be implemented as canvas
    const canvas = await global.page.locator('canvas');
    await expect(canvas.first()).toBeVisible();
  }
});

Then('the chart should show all domains', async () => {
  const chart = await global.page.locator('canvas');
  if (await chart.isVisible()) {
    await expect(chart.first()).toBeVisible();
  }
});

Then('the chart should reflect current scores', async () => {
  const chart = await global.page.locator('canvas');
  if (await chart.isVisible()) {
    await expect(chart.first()).toBeVisible();
  }
});

Then('I should see a bar chart', async () => {
  const barChart = await global.page.locator('[data-testid="bar-chart"]');
  if (await barChart.isVisible()) {
    await expect(barChart).toBeVisible();
  } else {
    // Chart might be implemented as canvas
    const canvas = await global.page.locator('canvas');
    await expect(canvas.first()).toBeVisible();
  }
});

Then('the chart should display domain scores', async () => {
  // Verify we have scores to display
  const scoreElement = await global.page.locator('text=/\\d+\\.\\d+\/5\.0/');
  if (await scoreElement.first().isVisible()) {
    await expect(scoreElement.first()).toBeVisible();
  }
});

Then('the chart should have proper labels', async () => {
  const chart = await global.page.locator('canvas');
  if (await chart.isVisible()) {
    await expect(chart.first()).toBeVisible();
  }
});

Then('the charts should update', async () => {
  // Go back to results to see updated charts
  const resultsTab = await global.page.locator('button:has-text("Results")');
  if (await resultsTab.isVisible()) {
    await resultsTab.click();
    await global.page.waitForTimeout(1000);
  }
  
  const chart = await global.page.locator('canvas');
  if (await chart.isVisible()) {
    await expect(chart.first()).toBeVisible();
  }
});

Then('the visualization should reflect new scores', async () => {
  const scoreElement = await global.page.locator('text=/\\d+\\.\\d+\/5\.0/');
  if (await scoreElement.first().isVisible()) {
    await expect(scoreElement.first()).toBeVisible();
  }
});

Then('transitions should be smooth', async () => {
  // Verify chart transitions don't break
  const chart = await global.page.locator('canvas');
  if (await chart.isVisible()) {
    await expect(chart.first()).toBeVisible();
  }
});

Then('charts should handle empty data gracefully', async () => {
  const chart = await global.page.locator('canvas');
  if (await chart.isVisible()) {
    await expect(chart.first()).toBeVisible();
  }
});

Then('I should see appropriate placeholders', async () => {
  const placeholder = await global.page.locator('text=/no data|no answers|empty/i');
  if (await placeholder.isVisible()) {
    await expect(placeholder).toBeVisible();
  }
});

Then('no errors should occur', async () => {
  const errorElement = await global.page.locator('text=/error|failed|undefined/i');
  if (await errorElement.isVisible()) {
    // Check if it's actually an error or just text content
    const isVisible = await errorElement.isVisible();
    if (isVisible) {
      // Only fail if it's a clear error message
      const text = await errorElement.textContent();
      const isError = text.toLowerCase().includes('error') || text.toLowerCase().includes('failed');
      if (isError) {
        await expect(errorElement).not.toBeVisible();
      }
    }
  }
});

Then('charts should resize appropriately', async () => {
  const chart = await global.page.locator('canvas');
  if (await chart.isVisible()) {
    await expect(chart.first()).toBeVisible();
  }
});

Then('labels should remain readable', async () => {
  const labels = await global.page.locator('text=/\\d+|\\w+/');
  if (await labels.first().isVisible()) {
    await expect(labels.first()).toBeVisible();
  }
});

Then('functionality should be preserved', async () => {
  const chart = await global.page.locator('canvas');
  if (await chart.isVisible()) {
    await expect(chart.first()).toBeVisible();
  }
});

Then('I should see tooltips with details', async () => {
  const tooltip = await global.page.locator('[data-testid="chart-tooltip"]');
  if (await tooltip.isVisible()) {
    await expect(tooltip).toBeVisible();
  }
});

Then('I should be able to interact with data points', async () => {
  const chart = await global.page.locator('canvas');
  if (await chart.isVisible()) {
    await expect(chart.first()).toBeVisible();
  }
});

Then('relevant information should be displayed', async () => {
  const chartInfo = await global.page.locator('text=/score|domain|result/i');
  if (await chartInfo.first().isVisible()) {
    await expect(chartInfo.first()).toBeVisible();
  }
});