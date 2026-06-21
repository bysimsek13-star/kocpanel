import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL;
const ADMIN_SIFRE = process.env.TEST_ADMIN_SIFRE;
const credVar = ADMIN_EMAIL && ADMIN_SIFRE;

async function girisYap(page) {
  await page.goto('/giris');
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
  await page.locator('input[type="password"]').fill(ADMIN_SIFRE);
  await page.locator('button', { hasText: 'Giriş Yap' }).click();
  await page.waitForURL(/\/yonetici/, { timeout: 15000 });
}

test.describe('Admin Paneli Akışları', () => {
  test.beforeEach(async ({}, testInfo) => {
    if (!credVar) testInfo.skip(true, 'TEST_ADMIN_EMAIL / TEST_ADMIN_SIFRE tanımlı değil');
  });

  // ─── Giriş ──────────────────────────────────────────────────────────────────

  test('admin giriş yapar ve yönetici paneline yönlenir', async ({ page }) => {
    await girisYap(page);
    await expect(page).toHaveURL(/\/yonetici/);
    await expect(page.locator('body')).not.toContainText('Giriş Yap');
  });

  test('panel 5 saniye içinde yüklenir', async ({ page }) => {
    const t0 = Date.now();
    await girisYap(page);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    expect(Date.now() - t0).toBeLessThan(5000);
  });

  test('JS kritik hatası oluşmaz', async ({ page }) => {
    const hatalar = [];
    page.on('pageerror', e => hatalar.push(e.message));
    await girisYap(page);
    await page.waitForTimeout(2000);
    const kritik = hatalar.filter(h => h.includes('TypeError') || h.includes('ReferenceError'));
    expect(kritik).toHaveLength(0);
  });

  // ─── Öğrenci & Koç Yönetimi ─────────────────────────────────────────────────

  test('öğrenci listesi görünür', async ({ page }) => {
    await girisYap(page);
    await page.waitForTimeout(2000);
    await expect(
      page.locator('text=/Öğrenci|öğrenci/i').first()
    ).toBeVisible({ timeout: 8000 });
  });

  test('koç listesi sayfasına gidilir', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'mobile') testInfo.skip(true, 'Mobil menü farklı');
    await girisYap(page);
    await page.locator('text=/Koç/i').first().click();
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toContainText(/koç|Koç/i);
  });

  test('sistem durumu sayfası açılır', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'mobile') testInfo.skip(true, 'Mobil menü farklı');
    await girisYap(page);
    await page.locator('text=/Sistem/i').first().click();
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toContainText(/sistem|Sistem/i);
  });

  // ─── Güvenlik: admin yetkisiz erişim yapamaz ─────────────────────────────────

  test('admin /ogrenci rotasına erişemez (yönlendirme olur)', async ({ page }) => {
    await girisYap(page);
    await page.goto('/ogrenci');
    await page.waitForTimeout(2000);
    // Admin, ogrenci sayfasında kalmamalı — yönetici sayfasına yönlenmeli
    await expect(page).not.toHaveURL(/\/ogrenci/);
  });

  // ─── Mobil ──────────────────────────────────────────────────────────────────

  test('admin paneli mobilde yatay scroll yapmaz', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await girisYap(page);
    await page.waitForTimeout(2000);
    const bodyW = await page.evaluate(() => document.body.scrollWidth);
    const viewW = await page.evaluate(() => window.innerWidth);
    expect(bodyW).toBeLessThanOrEqual(viewW + 5);
  });
});
