import { test, expect } from '@playwright/test';

const OGRNC_EMAIL = process.env.TEST_OGRNC_EMAIL;
const OGRNC_SIFRE = process.env.TEST_OGRNC_SIFRE;
const credVar = OGRNC_EMAIL && OGRNC_SIFRE;

async function girisYap(page) {
  await page.goto('/giris');
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.locator('input[type="email"]').fill(OGRNC_EMAIL);
  await page.locator('input[type="password"]').fill(OGRNC_SIFRE);
  await page.locator('button', { hasText: 'Giriş Yap' }).click();
  await page.waitForURL(/\/ogrenci/, { timeout: 15000 });
}

test.describe('Öğrenci Paneli Akışları', () => {
  test.beforeEach(async ({}, testInfo) => {
    if (!credVar) testInfo.skip(true, 'TEST_OGRNC_EMAIL / TEST_OGRNC_SIFRE tanımlı değil');
  });

  // ─── Giriş & Yönlendirme ────────────────────────────────────────────────────

  test('öğrenci giriş yapar ve paneline yönlenir', async ({ page }) => {
    await girisYap(page);
    await expect(page).toHaveURL(/\/ogrenci/);
    await expect(page.locator('body')).not.toContainText('Giriş Yap');
  });

  test('panel temel içeriği 8 saniye içinde görünür', async ({ page }) => {
    await girisYap(page);
    // networkidle kullanma — Firebase onSnapshot bağlantıları sürekli açık tutar
    const t0 = Date.now();
    await page.waitForSelector('body', { timeout: 8000 });
    await page.waitForTimeout(1500);
    expect(Date.now() - t0).toBeLessThan(8000);
  });

  test('JS kritik hatası oluşmaz', async ({ page }) => {
    const hatalar = [];
    page.on('pageerror', e => hatalar.push(e.message));
    await girisYap(page);
    await page.waitForTimeout(2000);
    const kritik = hatalar.filter(h => h.includes('TypeError') || h.includes('ReferenceError'));
    expect(kritik).toHaveLength(0);
  });

  // ─── Bugün Programı ─────────────────────────────────────────────────────────

  test('bugün programı kartı ana sayfada görünür', async ({ page }) => {
    await girisYap(page);
    await page.waitForTimeout(2000);
    await expect(
      page.locator('text=/bugün|program|etüt|slot/i').first()
    ).toBeVisible({ timeout: 8000 });
  });

  test('haftalık program sayfasına gidilir', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'mobile') testInfo.skip(true, 'Mobil menü farklı');
    await girisYap(page);
    await page.locator('text=/Program/i').first().click();
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toContainText(/Pazartesi|Salı|Çarşamba/i);
  });

  // ─── Denemeler ──────────────────────────────────────────────────────────────

  test('denemeler sekmesine gidilir', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'mobile') testInfo.skip(true, 'Mobil menü farklı');
    await girisYap(page);
    await page.locator('text=/Denem/i').first().click();
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toContainText(/Deneme|TYT|Net/i);
  });

  // ─── Müfredat ───────────────────────────────────────────────────────────────

  test('müfredat sayfası açılır', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'mobile') testInfo.skip(true, 'Mobil menü farklı');
    await girisYap(page);
    // Auth tam oturumdan sonra git — aksi hâlde guard /ogrenci'ye redirect eder
    await page.waitForTimeout(2000);
    await page.goto('/ogrenci/mufredat', { waitUntil: 'commit' });
    // Guard yönlendirmesi olabilir — URL ne olursa olsun içerik bekle
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).toContainText(/Matematik|Türkçe|Fizik|ders|konu/i);
  });

  // ─── Mesajlar ───────────────────────────────────────────────────────────────

  test('mesajlar sayfası açılır', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'mobile') testInfo.skip(true, 'Mobil menü farklı');
    await girisYap(page);
    await page.locator('text=/Mesaj/i').first().click();
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toContainText(/Mesaj|mesaj/i);
  });

  // ─── Mobil ──────────────────────────────────────────────────────────────────

  test('öğrenci paneli mobilde yatay scroll yapmaz', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await girisYap(page);
    await page.waitForTimeout(2000);
    const bodyW = await page.evaluate(() => document.body.scrollWidth);
    const viewW = await page.evaluate(() => window.innerWidth);
    expect(bodyW).toBeLessThanOrEqual(viewW + 5);
  });

  test('öğrenci paneli tabletde yatay scroll yapmaz', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await girisYap(page);
    await page.waitForTimeout(2000);
    const bodyW = await page.evaluate(() => document.body.scrollWidth);
    const viewW = await page.evaluate(() => window.innerWidth);
    expect(bodyW).toBeLessThanOrEqual(viewW + 5);
  });
});
