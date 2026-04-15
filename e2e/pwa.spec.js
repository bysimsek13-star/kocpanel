import { test, expect } from '@playwright/test';

test.describe('PWA', () => {
  test('manifest.json erişilebilir', async ({ page }) => {
    const response = await page.request.get('/manifest.json');
    expect(response.status()).toBe(200);
    const manifest = await response.json();
    expect(manifest.name).toContain('ElsWay');
  });

  test('sw.js erişilebilir', async ({ page }) => {
    const response = await page.request.get('/sw.js');
    expect(response.status()).toBe(200);
  });

  test('favicon erişilebilir', async ({ page }) => {
    const response = await page.request.get('/favicon.svg');
    expect(response.status()).toBe(200);
  });
});
