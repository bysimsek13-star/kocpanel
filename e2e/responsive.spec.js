import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['Pixel 5'] });

test.describe('Mobil Görünüm', () => {

  test('giriş sayfası mobilde düzgün görünür', async ({ page }) => {
    await page.goto('/giris');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    // Yatay scroll olmamalı
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
  });
});
