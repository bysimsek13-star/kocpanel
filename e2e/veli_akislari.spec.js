import { test, expect } from '@playwright/test';

const VELI_EMAIL = process.env.TEST_VELI_EMAIL;
const VELI_SIFRE = process.env.TEST_VELI_SIFRE;
const credVar = VELI_EMAIL && VELI_SIFRE;

async function girisYap(page) {
  await page.goto('/giris');
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.locator('input[type="email"]').fill(VELI_EMAIL);
  await page.locator('input[type="password"]').fill(VELI_SIFRE);
  await page.locator('button', { hasText: 'Giriş Yap' }).click();
  await page.waitForURL(/\/veli/, { timeout: 15000 });
}

test.describe('Veli Paneli Akışları', () => {
  test.beforeEach(async ({}, testInfo) => {
    if (!credVar) testInfo.skip(true, 'TEST_VELI_EMAIL / TEST_VELI_SIFRE tanımlı değil');
  });

  // ─── Giriş ──────────────────────────────────────────────────────────────────

  test('veli giriş yapar ve paneline yönlenir', async ({ page }) => {
    await girisYap(page);
    await expect(page).toHaveURL(/\/veli/);
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

  // ─── Dashboard ──────────────────────────────────────────────────────────────

  test('çalışma durumu kartı görünür', async ({ page }) => {
    await girisYap(page);
    await page.waitForTimeout(2000);
    await expect(
      page.locator('text=/çalışma|program|etüt/i').first()
    ).toBeVisible({ timeout: 8000 });
  });

  test('koç raporu alanı mevcut', async ({ page }) => {
    await girisYap(page);
    await page.waitForTimeout(2000);
    await expect(
      page.locator('text=/rapor|Rapor/i').first()
    ).toBeVisible({ timeout: 8000 });
  });

  // ─── Program ────────────────────────────────────────────────────────────────

  test('program sayfasına gidilir', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'mobile') testInfo.skip(true, 'Mobil menü farklı');
    await girisYap(page);
    await page.locator('text=/Program/i').first().click();
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toContainText(/Pazartesi|program|slot/i);
  });

  // ─── Mobil ──────────────────────────────────────────────────────────────────

  test('veli paneli mobilde yatay scroll yapmaz', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await girisYap(page);
    await page.waitForTimeout(2000);
    const bodyW = await page.evaluate(() => document.body.scrollWidth);
    const viewW = await page.evaluate(() => window.innerWidth);
    expect(bodyW).toBeLessThanOrEqual(viewW + 5);
  });
});
