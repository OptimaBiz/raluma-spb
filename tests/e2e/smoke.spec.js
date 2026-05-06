const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.route('https://formspree.io/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true })
    });
  });
});

test('landing smoke flow: hero, validation, submit and thanks', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Raluma/i);
  await expect(page.locator('#rec2143512671')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Терраса круглый год');

  const form = page.locator('form.lead-form').first();
  await expect(form).toBeVisible();

  const submitButton = form.getByRole('button', { name: 'Рассчитать стоимость' });
  await submitButton.click();
  await expect(form.locator('.js-successbox')).toContainText('Введите имя');

  await form.locator('input[name="name"]').fill('А');
  await form.locator('input[name="phone"]').fill('123');
  await submitButton.click();
  await expect(form.locator('.js-successbox')).toContainText('Введите имя');

  await form.locator('input[name="name"]').fill('Иван');
  await form.locator('input[name="phone"]').fill('+79991234567');
  await form.locator('input[name="personal_data_consent"]').check();
  await submitButton.click();

  await expect(page).toHaveURL(/\/thanks\.html$/);

  await expect(page.locator('.thanks__card')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Спасибо, заявка отправлена');
  await expect(page.getByRole('link', { name: 'Вернуться на главную' })).toBeVisible();
});
