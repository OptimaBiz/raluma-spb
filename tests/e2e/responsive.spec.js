const { test, expect } = require('@playwright/test');

const viewports = [
  {
    name: 'desktop',
    width: 1440,
    height: 900,
    expects: {
      callbar: true,
      mobileActions: false,
      heroPrimaryButton: true,
      heroSecondaryButton: true
    }
  },
  {
    name: 'tablet',
    width: 834,
    height: 1112,
    expects: {
      callbar: false,
      mobileActions: true,
      heroPrimaryButton: true,
      heroSecondaryButton: true
    }
  },
  {
    name: 'mobile',
    width: 390,
    height: 844,
    expects: {
      callbar: false,
      mobileActions: true,
      heroPrimaryButton: false,
      heroSecondaryButton: true
    }
  }
];

for (const viewport of viewports) {
  test(`landing renders correctly on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');

    await expect(page).toHaveTitle(/Raluma/i);
    await expect(page.locator('#rec2143512671')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Терраса круглый год');

    const callbar = page.locator('.raluma-callbar');
    const mobileActions = page.locator('.raluma-mobile-actions');
    const hero = page.locator('#rec2143512671');
    const heroPrimaryButton = hero.getByRole('link', { name: 'Рассчитать стоимость' });
    const heroSecondaryButton = page.getByRole('link', { name: 'Смотреть примеры' });

    if (viewport.expects.callbar) {
      await expect(callbar).toBeVisible();
    } else {
      await expect(callbar).toBeHidden();
    }

    if (viewport.expects.mobileActions) {
      await expect(mobileActions).toBeVisible();
    } else {
      await expect(mobileActions).toBeHidden();
    }

    if (viewport.expects.heroPrimaryButton) {
      await expect(heroPrimaryButton).toBeVisible();
    } else {
      await expect(heroPrimaryButton).toBeHidden();
    }

    if (viewport.expects.heroSecondaryButton) {
      await expect(heroSecondaryButton).toBeVisible();
    } else {
      await expect(heroSecondaryButton).toBeHidden();
    }
  });
}
