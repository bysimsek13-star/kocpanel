import { test, expect } from '@playwright/test';

test.describe('Temel Navigasyon', () => {
  test('ana sayfa /giris\'e yönlendirir', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL(/giris/, { timeout: 10000 });
    await expect(page).toHaveURL(/giris/);
  });

  test('koç paneli direkt erişimde /giris\'e yönlendirir', async ({ page }) => {
    await page.goto('/koc');
    await page.waitForURL(/giris/, { timeout: 10000 });
    await expect(page).toHaveURL(/giris/);
  });

  test('öğrenci paneli direkt erişimde /giris\'e yönlendirir', async ({ page }) => {
    await page.goto('/ogrenci');
    await page.waitForURL(/giris/, { timeout: 10000 });
    await expect(page).toHaveURL(/giris/);
  });

  test('sayfa başlığı ElsWay içerir', async ({ page }) => {
    await page.goto('/giris');
    await expect(page).toHaveTitle(/ElsWay/, { timeout: 10000 });
  });

  test('ElsWay logosu görünür', async ({ page }) => {
    await page.goto('/giris');
    await expect(page.locator('body')).toContainText(/Els|Way|ElsWay/, { timeout: 10000 });
  });
});
