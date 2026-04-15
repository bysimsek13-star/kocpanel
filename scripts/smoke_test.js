#!/usr/bin/env node
/**
 * ElsWay — Deploy Sonrası Smoke Test
 * Çalıştır: node scripts/smoke_test.js
 * Veya: npm run smoke
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.SMOKE_URL || 'https://kocpaneli.web.app';
const MAKS_SURE_MS = 5000;

const YESIL   = '\x1b[32m';
const KIRMIZI = '\x1b[31m';
const SARI    = '\x1b[33m';
const RESET   = '\x1b[0m';

let gecen = 0;
let kalan = 0;

function logGecti(mesaj) {
  gecen++;
  console.log(`${YESIL}✓${RESET} ${mesaj}`);
}

function logKaldi(mesaj, hata) {
  kalan++;
  console.log(`${KIRMIZI}✗${RESET} ${mesaj}`);
  if (hata) console.log(`  ${SARI}→ ${hata}${RESET}`);
}

function httpGet(url, timeout = MAKS_SURE_MS) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let veri = '';
      res.on('data', chunk => (veri += chunk));
      res.on('end', () => resolve({ status: res.statusCode, veri, headers: res.headers }));
    });
    req.on('error', reject);
    req.setTimeout(timeout, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

async function testleriCalistir() {
  console.log(`\n🔥 ElsWay Smoke Testi — ${BASE_URL}\n`);

  // 1. Ana sayfa
  try {
    const res = await httpGet(`${BASE_URL}/`);
    if (res.status === 200) logGecti('Ana sayfa erişilebilir (200)');
    else logKaldi('Ana sayfa', `HTTP ${res.status}`);
  } catch (e) {
    logKaldi('Ana sayfa erişilemiyor', e.message);
  }

  // 2. Giriş sayfası
  try {
    const res = await httpGet(`${BASE_URL}/giris`);
    if (res.status === 200) logGecti('Giriş sayfası yükleniyor (200)');
    else logKaldi('Giriş sayfası', `HTTP ${res.status}`);
  } catch (e) {
    logKaldi('Giriş sayfası', e.message);
  }

  // 3. manifest.json
  try {
    const res = await httpGet(`${BASE_URL}/manifest.json`);
    if (res.status === 200) {
      const manifest = JSON.parse(res.veri);
      if (manifest.name?.includes('ElsWay')) logGecti('manifest.json geçerli');
      else logKaldi('manifest.json içeriği hatalı', `name: ${manifest.name}`);
    } else {
      logKaldi('manifest.json', `HTTP ${res.status}`);
    }
  } catch (e) {
    logKaldi('manifest.json', e.message);
  }

  // 4. sw.js
  try {
    const res = await httpGet(`${BASE_URL}/sw.js`);
    if (res.status === 200) logGecti('Service Worker (sw.js) erişilebilir');
    else logKaldi('sw.js', `HTTP ${res.status}`);
  } catch (e) {
    logKaldi('sw.js', e.message);
  }

  // 5. favicon
  try {
    const res = await httpGet(`${BASE_URL}/favicon.svg`);
    if (res.status === 200) logGecti('favicon.svg erişilebilir');
    else logKaldi('favicon.svg', `HTTP ${res.status}`);
  } catch (e) {
    logKaldi('favicon.svg', e.message);
  }

  // 6. SPA routing (404 → index.html)
  try {
    const res = await httpGet(`${BASE_URL}/var-olmayan-sayfa-xyz`);
    if (res.status === 200) logGecti('SPA routing çalışıyor (404 → index.html)');
    else logKaldi('SPA routing', `HTTP ${res.status} — Firebase rewrites eksik?`);
  } catch (e) {
    logKaldi('SPA routing', e.message);
  }

  // 7. Bundle boyutu
  try {
    const buildDir = path.join(process.cwd(), 'build', 'assets');
    if (fs.existsSync(buildDir)) {
      const dosyalar = fs.readdirSync(buildDir);
      const buyukDosyalar = dosyalar
        .map(d => ({ ad: d, boyut: fs.statSync(path.join(buildDir, d)).size }))
        .filter(d => d.boyut > 600 * 1024)
        .filter(d => !d.ad.includes('VideoGorusme')); // Agora zaten lazy, beklenen

      if (buyukDosyalar.length === 0) {
        logGecti('Bundle boyutları normal (< 600 KB, VideoGorusme hariç)');
      } else {
        buyukDosyalar.forEach(d =>
          logKaldi(`Büyük chunk: ${d.ad}`, `${Math.round(d.boyut / 1024)} KB`)
        );
      }
    } else {
      console.log(`${SARI}⚠${RESET}  build/assets bulunamadı — önce npm run build`);
    }
  } catch (e) {
    logKaldi('Bundle boyutu kontrolü', e.message);
  }

  // ─── Sonuç ───────────────────────────────────────────────────────────────
  console.log(`\n${'─'.repeat(40)}`);
  console.log(`${YESIL}Geçti: ${gecen}${RESET}  ${kalan > 0 ? KIRMIZI : ''}Kaldı: ${kalan}${RESET}`);

  if (kalan > 0) {
    console.log(`\n${KIRMIZI}⚠ ${kalan} test başarısız — deploy kontrol edilmeli!${RESET}\n`);
    process.exit(1);
  } else {
    console.log(`\n${YESIL}✅ Tüm smoke testler geçti — deploy sağlıklı!${RESET}\n`);
    process.exit(0);
  }
}

testleriCalistir().catch(e => {
  console.error('Smoke test çalıştırılamadı:', e);
  process.exit(1);
});
