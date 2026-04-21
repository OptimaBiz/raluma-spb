const { test, expect } = require('@playwright/test');

const visualEnabled = process.env.RUN_VISUAL === '1';

test.describe('visual regression foundation', () => {
  test.skip(!visualEnabled, 'Set RUN_VISUAL=1 to run visual regression checks.');

  test('hero desktop baseline', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(page.locator('#rec2143512671')).toBeVisible();
    await expect(page.locator('#rec2143512671')).toHaveScreenshot('hero-desktop.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.02
    });
  });

  test('hero mobile baseline', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('#rec2143512671')).toBeVisible();
    await expect(page.locator('#rec2143512671')).toHaveScreenshot('hero-mobile.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.02
    });
  });
});
