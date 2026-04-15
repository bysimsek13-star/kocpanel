/**
 * Deploy smoke testleri.
 * Not: manifest/sw/favicon testleri pwa.spec.js'de mevcut — burada
 * performans, JS hatası ve SPA routing test edilir.
 */
import { test, expect } from '@playwright/test';

test.describe('Deploy Smoke Testleri', () => {
  test('giriş sayfası 4 saniyede yüklenir', async ({ page }) => {
    const baslangic = Date.now();
    await page.goto('/giris');
    await page.waitForLoadState('domcontentloaded');
    const sure = Date.now() - baslangic;
    expect(sure).toBeLessThan(4000);
  });

  test('CSS yüklendi — sayfa beyaz değil', async ({ page }) => {
    await page.goto('/giris');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    const bgColor = await page.evaluate(() =>
      window.getComputedStyle(document.body).backgroundColor
    );
    // Tamamen şeffaf ise CSS yüklenmemiştir
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('giriş sayfasında kritik JS hatası oluşmaz', async ({ page }) => {
    const jsHatalari = [];
    page.on('pageerror', err => jsHatalari.push(err.message));
    await page.goto('/giris');
    await page.waitForLoadState('networkidle');
    const kritik = jsHatalari.filter(h =>
      h.includes('TypeError') || h.includes('ReferenceError')
    );
    expect(kritik).toHaveLength(0);
  });

  test('SPA routing çalışıyor — bilinmeyen route index.html döner', async ({ page }) => {
    const res = await page.request.get('/var-olmayan-sayfa-xyz-404');
    // Firebase hosting rewrites: tüm 404'ler index.html döndürmeli
    expect(res.status()).toBe(200);
  });

  test('Service Worker kaydoluyor', async ({ page }) => {
    await page.goto('/giris');
    await page.waitForTimeout(2000);
    const swKayitli = await page.evaluate(async () => {
      if (!navigator.serviceWorker) return false;
      const reg = await navigator.serviceWorker.getRegistration();
      return !!reg;
    });
    expect(swKayitli).toBe(true);
  });

  test('giriş formu input\'ları görünür ve etkileşilebilir', async ({ page }) => {
    await page.goto('/giris');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await expect(page.locator('input[type="email"]')).toBeEnabled();
    await expect(page.locator('input[type="password"]')).toBeEnabled();
    await expect(page.locator('button', { hasText: 'Giriş Yap' })).toBeVisible();
  });
});
