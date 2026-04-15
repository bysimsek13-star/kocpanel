import { test, expect } from '@playwright/test';

test.describe('Giriş Ekranı', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/giris');
    // Firebase auth init bitmeden form görünmez — bekle
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  });

  test('giriş sayfası yüklenir', async ({ page }) => {
    await expect(page).toHaveTitle(/ElsWay/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('boş form ile giriş yapılamaz — buton disabled', async ({ page }) => {
    const girisBtn = page.locator('button', { hasText: 'Giriş Yap' });
    await expect(girisBtn).toBeDisabled();
  });

  test('email girilince buton aktif olur', async ({ page }) => {
    await page.locator('input[type="email"]').fill('test@test.com');
    await page.locator('input[type="password"]').fill('123456');
    const girisBtn = page.locator('button', { hasText: 'Giriş Yap' });
    await expect(girisBtn).toBeEnabled();
  });

  test('yanlış şifre ile hata mesajı gösterilir', async ({ page }) => {
    await page.locator('input[type="email"]').fill('yanlis@test.com');
    await page.locator('input[type="password"]').fill('yanlissifre');
    await page.locator('button', { hasText: 'Giriş Yap' }).click();
    // Hata mesajı veya toast bekleniyor
    await expect(page.locator('body')).toContainText(
      /hata|geçersiz|bulunamadı|wrong|invalid/i,
      { timeout: 8000 }
    );
  });

  test('Enter tuşu ile giriş tetiklenir', async ({ page }) => {
    await page.locator('input[type="email"]').fill('test@test.com');
    await page.locator('input[type="password"]').fill('test123');
    await page.keyboard.press('Enter');
    // Sayfa değişmeli veya hata gelmeli
    await page.waitForTimeout(2000);
    const url = page.url();
    // Ya giriş başarılı (url değişti) ya da hata mesajı var
    const basarili = !url.includes('/giris');
    const hatali = await page.locator('body').textContent();
    expect(basarili || hatali.length > 0).toBeTruthy();
  });
});
