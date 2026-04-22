import { test, expect } from '@playwright/test';

const KOC_EMAIL   = process.env.TEST_KOC_EMAIL;
const KOC_SIFRE   = process.env.TEST_KOC_SIFRE;
const OGRNC_EMAIL = process.env.TEST_OGRNC_EMAIL;
const OGRNC_SIFRE = process.env.TEST_OGRNC_SIFRE;

// Credentials yoksa bu dosyadaki tüm testleri atla
// Koşturma: TEST_KOC_EMAIL=x TEST_KOC_SIFRE=y npx playwright test e2e/koc_akislari.spec.js
const kocCredVar    = KOC_EMAIL && KOC_SIFRE;
const ogrenciCredVar = OGRNC_EMAIL && OGRNC_SIFRE;

async function kocGirisYap(page) {
  await page.goto('/giris');
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.locator('input[type="email"]').fill(KOC_EMAIL);
  await page.locator('input[type="password"]').fill(KOC_SIFRE);
  await page.locator('button', { hasText: 'Giriş Yap' }).click();
  await page.waitForURL(/\/koc/, { timeout: 15000 });
}

async function ogrenciGirisYap(page) {
  await page.goto('/giris');
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.locator('input[type="email"]').fill(OGRNC_EMAIL);
  await page.locator('input[type="password"]').fill(OGRNC_SIFRE);
  await page.locator('button', { hasText: 'Giriş Yap' }).click();
  await page.waitForURL(/\/ogrenci/, { timeout: 15000 });
}

async function onboardingKapat(page) {
  try {
    await page.waitForTimeout(1000);
    const skipBtn = page
      .locator(
        'button:has-text("atla"), button:has-text("Atla"), button:has-text("sonra"), button:has-text("Kapat")'
      )
      .first();
    if (await skipBtn.isVisible({ timeout: 3000 })) {
      await skipBtn.click({ force: true });
      await page.waitForTimeout(1000);
    }
    // Overlay hâlâ varsa ESC ile kapat
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  } catch {}
}

// ─── Koç Panel Akışları ───────────────────────────────────────────────────────

test.describe('Koç Paneli Akışları', () => {
  test.beforeEach(async ({}, testInfo) => {
    if (!kocCredVar) testInfo.skip(true, 'TEST_KOC_EMAIL / TEST_KOC_SIFRE tanımlı değil');
  });

  test('koç başarıyla giriş yapar ve panele yönlenir', async ({ page }) => {
    await kocGirisYap(page);
    await onboardingKapat(page);
    await expect(page).toHaveURL(/\/koc/);
    await expect(page.locator('body')).not.toContainText('Giriş Yap');
  });

  // Navigasyon testleri masaüstüne özgüdür — mobil alt tabbar farklı label kullanır
  test('koç mesajlar sayfasına gider', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'mobile') testInfo.skip(true, 'Mobil alt tabbar farklı label kullanır');
    await kocGirisYap(page);
    await onboardingKapat(page);
    await page.locator('text=Mesajlar').first().click();
    await page.waitForURL(/mesajlar/, { timeout: 5000 });
    await expect(page.locator('body')).toContainText('Mesajlar');
  });

  test('koç haftalık program sayfasına gider', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'mobile') testInfo.skip(true, 'Mobil alt tabbar farklı label kullanır');
    await kocGirisYap(page);
    await onboardingKapat(page);
    await page.locator('text=/Haftalık/i').first().click();
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toContainText(/Pazartesi|Salı|program/i);
  });

  test('koç hedef takibi sayfasına gider', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'mobile') testInfo.skip(true, 'Mobil alt tabbar farklı label kullanır');
    await kocGirisYap(page);
    await onboardingKapat(page);
    await page.locator('text=/Hedef/i').first().click();
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toContainText(/hedef|Hedef/i);
  });

  test('koç öğrencilerim sayfasını açar', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'mobile') testInfo.skip(true, 'Mobil alt tabbar farklı label kullanır');
    await kocGirisYap(page);
    await onboardingKapat(page);
    await page.locator('text=/Öğrenci/i').first().click();
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toContainText(/öğrenci|Öğrenci/i);
  });

  test('koç paneli mobilde yatay scroll yapmaz', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await kocGirisYap(page);
    await onboardingKapat(page);
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
  });

  test('koç çıkış yapar ve giriş sayfasına döner', async ({ page }) => {
    await kocGirisYap(page);
    await onboardingKapat(page);
    const cikisBtn = page.locator('button', { hasText: /çıkış|Çıkış/i }).first();
    if (await cikisBtn.isVisible()) {
      await cikisBtn.click();
      await page.waitForURL(/giris/, { timeout: 5000 });
      await expect(page).toHaveURL(/giris/);
    }
  });

  test('playlist sayfasında grup tabları görünür', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'mobile') testInfo.skip(true, 'Mobil menü farklı');
    await kocGirisYap(page);
    await onboardingKapat(page);
    await page.locator('text=/Playlist|Video/i').first().click();
    await page.waitForTimeout(2000);
    // Grup tablarından en az ikisi görünmeli
    await expect(page.locator('button', { hasText: 'TYT' }).first()).toBeVisible();
    await expect(page.locator('button', { hasText: /LGS/i }).first()).toBeVisible();
  });

  test('playlist grup seçilince ders grid gelir', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'mobile') testInfo.skip(true, 'Mobil menü farklı');
    await kocGirisYap(page);
    await onboardingKapat(page);
    await page.locator('text=/Playlist|Video/i').first().click();
    await page.waitForTimeout(2000);
    await page.locator('button', { hasText: 'TYT' }).first().click();
    await page.waitForTimeout(1000);
    // Ders grid'inden en az biri görünmeli
    await expect(page.locator('button', { hasText: 'Matematik' }).first()).toBeVisible();
  });
});

// ─── Öğrenci Panel Akışları ───────────────────────────────────────────────────

test.describe('Öğrenci Paneli Akışları', () => {
  test.beforeEach(async ({}, testInfo) => {
    if (!ogrenciCredVar) testInfo.skip(true, 'TEST_OGRNC_EMAIL / TEST_OGRNC_SIFRE tanımlı değil');
  });

  test('öğrenci giriş yapar ve paneline yönlenir', async ({ page }) => {
    await ogrenciGirisYap(page);
    await expect(page).toHaveURL(/\/ogrenci/);
  });

  test('öğrenci paneli mobilde yatay scroll yapmaz', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await ogrenciGirisYap(page);
    await page.waitForTimeout(3000);
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
  });

  test('öğrenci panelinde JS hatası oluşmaz', async ({ page }) => {
    const jsHatalari = [];
    page.on('pageerror', err => jsHatalari.push(err.message));
    await ogrenciGirisYap(page);
    await page.waitForTimeout(2000);
    const kritik = jsHatalari.filter(h =>
      h.includes('TypeError') || h.includes('ReferenceError')
    );
    expect(kritik).toHaveLength(0);
  });
});
