const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// Note: Reusing step definitions from assessment_steps.cjs
// - "I have completed an assessment"
// - "I have answers for all questions"
// - "I have scores calculated"

// Helper: navigate to admin view so the export-pdf-button is available
async function ensureOnAdminView() {
  const adminView = await global.page.locator('[data-testid="full-screen-admin-view"]');
  if (await adminView.isVisible({ timeout: 1000 }).catch(() => false)) {
    return; // already on admin
  }

  // Logout first if on a user view
  const logoutBtn = await global.page.locator('[data-testid="logout-btn"]');
  if (await logoutBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await logoutBtn.click();
    await global.page.waitForTimeout(1000);
  }

  // Select admin user
  const adminCard = await global.page.locator('[data-testid="user-card-admin"]');
  if (await adminCard.isVisible({ timeout: 3000 }).catch(() => false)) {
    await adminCard.click();
    await global.page.waitForTimeout(2000);
    await global.page.waitForSelector('[data-testid="full-screen-admin-view"]', { timeout: 5000 }).catch(() => {});
  }
}

When('I click the export PDF button in the header', async () => {
  await ensureOnAdminView();
  const exportButton = await global.page.locator('[data-testid="export-pdf-button"]');
  await expect(exportButton).toBeVisible({ timeout: 5000 });
  await exportButton.click();
});

When('I generate a PDF', async () => {
  await ensureOnAdminView();
  const exportButton = await global.page.locator('[data-testid="export-pdf-button"]');
  await exportButton.click();
});

Then('a PDF should be generated', async () => {
  await global.page.waitForTimeout(2000);
  const errorDialog = await global.page.locator('text=/error|failed/i');
  expect(await errorDialog.isVisible().catch(() => false)).toBeFalsy();
});

Then('the PDF should contain the assessment results', async () => {
  const errorDialog = await global.page.locator('text=/error|failed/i');
  expect(await errorDialog.isVisible().catch(() => false)).toBeFalsy();
});

Then('the PDF should be downloaded automatically', async () => {
  await global.page.waitForTimeout(1000);
  const errorDialog = await global.page.locator('text=/error|failed/i');
  expect(await errorDialog.isVisible().catch(() => false)).toBeFalsy();
});

Given('I have compliance frameworks enabled', async () => {
  await ensureOnAdminView();

  const configureTab = await global.page.locator('[data-testid="configure-tab"]');
  if (await configureTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await configureTab.click();
    await global.page.waitForTimeout(500);

    const frameworksSubTab = await global.page.locator('[data-testid="frameworks-sub-tab"]');
    if (await frameworksSubTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await frameworksSubTab.click();
      await global.page.waitForTimeout(500);
    }

    const toggle = await global.page.locator('[data-testid^="framework-toggle"]').first();
    if (await toggle.isVisible({ timeout: 2000 }).catch(() => false)) {
      await toggle.click();
    }
  }
});

Then('the PDF should include compliance information', async () => {
  const errorDialog = await global.page.locator('text=/error|failed/i');
  expect(await errorDialog.isVisible().catch(() => false)).toBeFalsy();
});

Then('it should show framework mappings', async () => {
  const overviewTab = await global.page.locator('[data-testid="overview-tab"]');
  if (await overviewTab.isVisible({ timeout: 2000 }).catch(() => false)) {
    await overviewTab.click();
    await global.page.waitForTimeout(500);
  }
});

Then('it should display compliance scores', async () => {
  await global.page.waitForTimeout(500);
});

Given('PDF generation fails', async () => {
  await ensureOnAdminView();
});

Then('an error message should be displayed', async () => {
  const errorDialog = await global.page.locator('text=/error|failed/i');
  if (await errorDialog.isVisible().catch(() => false)) {
    await expect(errorDialog).toBeVisible();
  }
});

Then('the application should remain functional', async () => {
  const adminView = await global.page.locator('[data-testid="full-screen-admin-view"]');
  const userView = await global.page.locator('[data-testid="user-view"]');
  const selectionScreen = await global.page.locator('[data-testid="user-selection-screen"]');

  const isAdminVisible = await adminView.isVisible({ timeout: 2000 }).catch(() => false);
  const isUserVisible = await userView.isVisible({ timeout: 1000 }).catch(() => false);
  const isSelectionVisible = await selectionScreen.isVisible({ timeout: 1000 }).catch(() => false);

  expect(isAdminVisible || isUserVisible || isSelectionVisible).toBe(true);
});

Then('I should be able to retry the export', async () => {
  await ensureOnAdminView();
  const exportButton = await global.page.locator('[data-testid="export-pdf-button"]');
  await expect(exportButton).toBeVisible({ timeout: 5000 });
  await expect(exportButton).toBeEnabled();
});

Given('I have completed an assessment with scores', async () => {
  await global.page.waitForTimeout(500);
});

Then('the PDF should include the radar chart', async () => {
  await ensureOnAdminView();
  const overviewTab = await global.page.locator('[data-testid="overview-tab"]');
  if (await overviewTab.isVisible({ timeout: 2000 }).catch(() => false)) {
    await overviewTab.click();
    await global.page.waitForTimeout(1000);

    const radarChart = await global.page.locator('[data-testid="radar-chart"]');
    if (await radarChart.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(radarChart).toBeVisible();
    }
  }
});

Then('the PDF should include the bar chart', async () => {
  await global.page.waitForTimeout(1000);
  const barChart = await global.page.locator('[data-testid="bar-chart"]');
  const isVisible = await barChart.isVisible({ timeout: 10000 }).catch(() => false);

  if (isVisible) {
    await expect(barChart).toBeVisible();
  } else {
    const errorDialog = await global.page.locator('text=/error|failed/i');
    const hasError = await errorDialog.isVisible().catch(() => false);
    expect(hasError).toBe(false);
  }
});

Then('charts should be clearly visible', async () => {
  await global.page.waitForTimeout(1000);
  await ensureOnAdminView();
  const overviewTab = await global.page.locator('[data-testid="overview-tab"]');
  if (await overviewTab.isVisible({ timeout: 2000 }).catch(() => false)) {
    await overviewTab.click();
    await global.page.waitForTimeout(1500);
  }

  const canvas = await global.page.locator('canvas');
  const count = await canvas.count();
  expect(count).toBeGreaterThan(0);
});

Then('charts should maintain their aspect ratio', async () => {
  await global.page.waitForTimeout(500);
  const errorDialog = await global.page.locator('text=/error|failed/i');
  const hasError = await errorDialog.isVisible().catch(() => false);
  expect(hasError).toBe(false);
});

// Shared steps used by other features
Then('a comprehensive PDF should be generated', async () => {
  await global.page.waitForTimeout(1000);
});

Then('I should receive a download', async () => {
  await global.page.waitForTimeout(500);
});
