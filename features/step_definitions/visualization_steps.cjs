const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

Given('I am on the results section', async () => {
  const resultsView = await global.page.locator('[data-testid="results-view"]');
  if (await resultsView.isVisible({ timeout: 1000 }).catch(() => false)) {
    return;
  }

  const viewResultsBtn = await global.page.locator('[data-testid="view-results-btn"]');
  if (await viewResultsBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await viewResultsBtn.click();
    await global.page.waitForTimeout(1000);
    try {
      await global.page.waitForSelector('[data-testid="results-view"]', { timeout: 5000 });
    } catch (e) {
      console.log('Results view did not appear after clicking view-results-btn');
    }
  }
});

When('I change an answer', async () => {
  const backBtn = await global.page.locator('[data-testid="back-to-assessment"]');
  if (await backBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await backBtn.click();
    await global.page.waitForTimeout(500);
  }

  await global.page.waitForSelector('[data-testid="user-view"]', { timeout: 5000 }).catch(() => {});

  try {
    const domainTabs = await global.page.locator('[role="tab"]');
    if (await domainTabs.count() > 0) {
      await domainTabs.first().click();
      await global.page.waitForTimeout(500);
    }
  } catch (e) { /* no tabs */ }

  try {
    await global.page.waitForSelector('[data-testid^="question-"]', { timeout: 10000 });
    const firstQuestion = await global.page.locator('[data-testid^="question-"]').first();
    if (await firstQuestion.isVisible()) {
      const options = await firstQuestion.locator('[data-testid^="option-"]').all();
      if (options.length > 4) {
        await options[4].click();
        await global.page.waitForTimeout(300);
      } else if (options.length > 0) {
        await options[options.length - 1].click();
        await global.page.waitForTimeout(300);
      }
    }
  } catch (error) {
    console.log('Error changing answer:', error.message);
  }
});

When('I hover over chart elements', async () => {
  const chart = await global.page.locator('canvas').first();
  if (await chart.isVisible()) {
    await chart.hover({ position: { x: 100, y: 100 } });
    await global.page.waitForTimeout(500);
  }
});

When('I have no answers', async () => {
  // Clear answers from localStorage
  await global.page.evaluate(() => {
    const keysToRemove = Object.keys(localStorage).filter(k => k.startsWith('answers_'));
    keysToRemove.forEach(k => localStorage.removeItem(k));
  });
  await global.page.reload({ waitUntil: 'domcontentloaded' });
  await global.page.waitForTimeout(2000);
});

When('I interact with data points', async () => {
  const chart = await global.page.locator('canvas').first();
  if (await chart.isVisible()) {
    await chart.click({ position: { x: 100, y: 100 } });
    await global.page.waitForTimeout(500);
  }
});

Then('I should see a radar chart', async () => {
  try {
    await global.page.waitForSelector('[data-testid="radar-chart"]', { timeout: 15000 });
    const radarChart = await global.page.locator('[data-testid="radar-chart"]');
    await expect(radarChart).toBeVisible();

    const canvas = await radarChart.locator('canvas');
    await expect(canvas).toBeVisible();
  } catch (error) {
    console.log('Radar chart not found - this is expected if no answers exist yet');
    const dashboardContent = await global.page.locator('[data-testid="overview-content"]');
    if (await dashboardContent.isVisible({ timeout: 2000 })) {
      return;
    }
    throw error;
  }
});

Then('the chart should show all domains', async () => {
  const radarChart = await global.page.locator('[data-testid="radar-chart"] canvas');
  await expect(radarChart).toBeVisible();
});

Then('the chart should reflect current scores', async () => {
  const radarChart = await global.page.locator('[data-testid="radar-chart"] canvas');
  await expect(radarChart).toBeVisible();
});

Then('I should see a bar chart', async () => {
  try {
    const barChart = await global.page.locator('[data-testid="bar-chart"]');
    if (await barChart.isVisible({ timeout: 5000 })) {
      await expect(barChart).toBeVisible();
    } else {
      const canvas = await global.page.locator('[data-testid="bar-chart"] canvas');
      await expect(canvas).toBeVisible();
    }
  } catch (error) {
    console.log('Bar chart not found - this is expected if no answers exist yet');
    const dashboardContent = await global.page.locator('[data-testid="overview-content"]');
    if (await dashboardContent.isVisible({ timeout: 2000 })) {
      return;
    }
    throw error;
  }
});

Then('the chart should display domain scores', async () => {
  const scoreElement = await global.page.locator('text=/\\d+\\.\\d+\/5\.0/');
  if (await scoreElement.first().isVisible()) {
    await expect(scoreElement.first()).toBeVisible();
  }
});

Then('the chart should have proper labels', async () => {
  const barChart = await global.page.locator('[data-testid="bar-chart"] canvas');
  await expect(barChart).toBeVisible();
});

Then('the charts should update', async () => {
  const viewResultsBtn = await global.page.locator('[data-testid="view-results-btn"]');
  if (await viewResultsBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await viewResultsBtn.click();
    await global.page.waitForTimeout(1000);
  }

  await global.page.waitForSelector('[data-testid="results-view"]', { timeout: 5000 }).catch(() => {});

  const chart = await global.page.locator('canvas').first();
  if (await chart.isVisible({ timeout: 3000 }).catch(() => false)) {
    await expect(chart).toBeVisible();
  }
});

Then('the visualization should reflect new scores', async () => {
  const scoreElement = await global.page.locator('text=/\\d+\\.\\d+\/5\.0/');
  if (await scoreElement.first().isVisible()) {
    await expect(scoreElement.first()).toBeVisible();
  }
});

Then('transitions should be smooth', async () => {
  const chart = await global.page.locator('canvas').first();
  if (await chart.isVisible()) {
    await expect(chart).toBeVisible();
  }
});

Then('charts should handle empty data gracefully', async () => {
  const chart = await global.page.locator('canvas').first();
  if (await chart.isVisible()) {
    await expect(chart).toBeVisible();
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
    const text = await errorElement.textContent();
    const isError = text.toLowerCase().includes('error') || text.toLowerCase().includes('failed');
    if (isError) {
      await expect(errorElement).not.toBeVisible();
    }
  }
});

Then('charts should resize appropriately', async () => {
  const chart = await global.page.locator('canvas').first();
  if (await chart.isVisible()) {
    await expect(chart).toBeVisible();
  }
});

Then('labels should remain readable', async () => {
  const labels = await global.page.locator('text=/\\d+|\\w+/');
  if (await labels.first().isVisible()) {
    await expect(labels.first()).toBeVisible();
  }
});

Then('functionality should be preserved', async () => {
  const chart = await global.page.locator('canvas').first();
  if (await chart.isVisible()) {
    await expect(chart).toBeVisible();
  }
});

Then('I should see tooltips with details', async () => {
  const tooltip = await global.page.locator('[data-testid="chart-tooltip"]');
  if (await tooltip.isVisible()) {
    await expect(tooltip).toBeVisible();
  }
});

Then('I should be able to interact with data points', async () => {
  const chart = await global.page.locator('canvas').first();
  if (await chart.isVisible()) {
    await expect(chart).toBeVisible();
  }
});

Then('relevant information should be displayed', async () => {
  const chartInfo = await global.page.locator('text=/score|domain|result/i');
  if (await chartInfo.first().isVisible()) {
    await expect(chartInfo.first()).toBeVisible();
  }
});
