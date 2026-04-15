/**
 * Güvenlik ve yetki testleri.
 * Not: /koc ve /ogrenci redirect'leri navigasyon.spec.js'de mevcut — burada
 * admin, veli ve form validasyon senaryoları test edilir.
 */
import { test, expect } from '@playwright/test';

test.describe('Güvenlik ve Yetki', () => {
  test('giriş yapmadan admin paneline erişim engellenir', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForURL(/giris/, { timeout: 10000 });
    await expect(page).toHaveURL(/giris/);
  });

  test('giriş yapmadan veli paneline erişim engellenir', async ({ page }) => {
    await page.goto('/veli');
    await page.waitForURL(/giris/, { timeout: 10000 });
    await expect(page).toHaveURL(/giris/);
  });

  test('giriş yapmadan derin rotaya erişim engellenir', async ({ page }) => {
    await page.goto('/koc/ogrenciler/biri');
    await page.waitForURL(/giris/, { timeout: 10000 });
    await expect(page).toHaveURL(/giris/);
  });

  test('yanlış email formatı ile giriş yapılamaz — HTML5 validasyon', async ({ page }) => {
    await page.goto('/giris');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.locator('input[type="email"]').fill('gecersizemail');
    await page.locator('input[type="password"]').fill('sifre123');
    await page.locator('button', { hasText: 'Giriş Yap' }).click();
    // HTML5 email validasyonu devreye girmeli, URL değişmemeli
    await expect(page).toHaveURL(/giris/);
  });

  test('kısa şifre ile giriş denemesi hata verir', async ({ page }) => {
    await page.goto('/giris');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.locator('input[type="email"]').fill('test@test.com');
    await page.locator('input[type="password"]').fill('123');
    await page.locator('button', { hasText: 'Giriş Yap' }).click();
    await page.waitForTimeout(4000);
    // Firebase auth-weak-password hatası veya hâlâ giriş sayfasında
    await expect(page).toHaveURL(/giris/);
  });

  test('var olmayan kullanıcı ile giriş hata gösterir', async ({ page }) => {
    await page.goto('/giris');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.locator('input[type="email"]').fill('yokboylebiri_xyz_999@test.com');
    await page.locator('input[type="password"]').fill('sifre123456');
    await page.locator('button', { hasText: 'Giriş Yap' }).click();
    await expect(page.locator('body')).toContainText(
      /hata|geçersiz|bulunamadı|wrong|invalid|not-found/i,
      { timeout: 8000 }
    );
    await expect(page).toHaveURL(/giris/);
  });

  test('boş form submit edilemez — buton disabled', async ({ page }) => {
    await page.goto('/giris');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    const girisBtn = page.locator('button', { hasText: 'Giriş Yap' });
    await expect(girisBtn).toBeDisabled();
  });

  test('sadece email dolu iken buton hâlâ disabled', async ({ page }) => {
    await page.goto('/giris');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.locator('input[type="email"]').fill('test@test.com');
    const girisBtn = page.locator('button', { hasText: 'Giriş Yap' });
    await expect(girisBtn).toBeDisabled();
  });
});
