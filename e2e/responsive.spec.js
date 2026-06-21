import { test, expect } from '@playwright/test';

const KOC_EMAIL   = process.env.TEST_KOC_EMAIL;
const KOC_SIFRE   = process.env.TEST_KOC_SIFRE;
const OGRNC_EMAIL = process.env.TEST_OGRNC_EMAIL;
const OGRNC_SIFRE = process.env.TEST_OGRNC_SIFRE;

const MOBIL_VIEWPORTS = [
  { ad: 'iPhone SE', w: 375, h: 667 },
  { ad: 'Pixel 5',   w: 393, h: 851 },
  { ad: 'iPad Mini', w: 768, h: 1024 },
];

async function scrollKontrol(page) {
  const bodyW = await page.evaluate(() => document.body.scrollWidth);
  const viewW = await page.evaluate(() => window.innerWidth);
  expect(bodyW).toBeLessThanOrEqual(viewW + 5);
}

// ─── Giriş Sayfası — Tüm Cihazlar ───────────────────────────────────────────

test.describe('Giriş sayfası tüm cihazlarda', () => {
  for (const vp of MOBIL_VIEWPORTS) {
    test(`giriş — ${vp.ad} (${vp.w}x${vp.h})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.goto('/giris');
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await scrollKontrol(page);
    });
  }
});

// ─── Koç Paneli Mobil ────────────────────────────────────────────────────────

test.describe('Koç paneli mobil', () => {
  test.beforeEach(async ({}, testInfo) => {
    if (!KOC_EMAIL || !KOC_SIFRE) testInfo.skip(true, 'TEST_KOC_EMAIL / TEST_KOC_SIFRE tanımlı değil');
  });

  for (const vp of MOBIL_VIEWPORTS) {
    test(`koç paneli yatay scroll yok — ${vp.ad}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.goto('/giris');
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.locator('input[type="email"]').fill(KOC_EMAIL);
      await page.locator('input[type="password"]').fill(KOC_SIFRE);
      await page.locator('button', { hasText: 'Giriş Yap' }).click();
      await page.waitForURL(/\/koc/, { timeout: 15000 });
      await page.waitForTimeout(2000);
      await scrollKontrol(page);
    });
  }

  test('koç haftalık program mobilde yatay scroll yok', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });
    await page.goto('/giris');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.locator('input[type="email"]').fill(KOC_EMAIL);
    await page.locator('input[type="password"]').fill(KOC_SIFRE);
    await page.locator('button', { hasText: 'Giriş Yap' }).click();
    await page.waitForURL(/\/koc/, { timeout: 15000 });
    await page.waitForTimeout(1500);
    const programBtn = page.locator('text=/Program/i').first();
    if (await programBtn.isVisible({ timeout: 3000 })) {
      await programBtn.click();
      await page.waitForTimeout(2000);
    }
    await scrollKontrol(page);
  });
});

// ─── Öğrenci Paneli Mobil ────────────────────────────────────────────────────

test.describe('Öğrenci paneli mobil', () => {
  test.beforeEach(async ({}, testInfo) => {
    if (!OGRNC_EMAIL || !OGRNC_SIFRE) testInfo.skip(true, 'TEST_OGRNC_EMAIL / TEST_OGRNC_SIFRE tanımlı değil');
  });

  for (const vp of MOBIL_VIEWPORTS) {
    test(`öğrenci paneli yatay scroll yok — ${vp.ad}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.goto('/giris');
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.locator('input[type="email"]').fill(OGRNC_EMAIL);
      await page.locator('input[type="password"]').fill(OGRNC_SIFRE);
      await page.locator('button', { hasText: 'Giriş Yap' }).click();
      await page.waitForURL(/\/ogrenci/, { timeout: 15000 });
      await page.waitForTimeout(2000);
      await scrollKontrol(page);
    });
  }
});

// ─── Performans ──────────────────────────────────────────────────────────────

test.describe('Sayfa yüklenme süresi', () => {
  test('giriş sayfası 3 saniye içinde yüklenir', async ({ page }) => {
    const t0 = Date.now();
    await page.goto('/giris');
    await page.waitForLoadState('domcontentloaded');
    expect(Date.now() - t0).toBeLessThan(3000);
  });

  test('giriş sayfası formu 5 saniye içinde görünür', async ({ page }) => {
    await page.goto('/giris');
    const t0 = Date.now();
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    expect(Date.now() - t0).toBeLessThan(5000);
  });
});
