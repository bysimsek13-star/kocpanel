# ElsWay — Yapay Zeka Çalışma Notları & Yakın Dönem Yol Haritası

Bu dosya, ElsWay projesinde geliştirme yapacak yapay zeka asistanlara bırakılan
sürekli güncellenen bir bağlam dosyasıdır. Kod üzerinde çalışmadan önce
`CLAUDE.md` dosyasını da oku.

---

## Son Oturumda Yapılanlar (2026-04-16) — Temiz Teknik Bakım

### BAKIM: Artık kodlar temizlendi, belgeler güncellendi.

| Dosya | Düzeltme |
|---|---|
| `functions/package.json` | `"shell": "react-scripts start"` ve `"start": "npm run shell"` silindi — CRA döneminden kalan anlamsız scriptler |
| `ARCHITECTURE.md` | N+1 notu güncellendi: `useKocVeri.js` → `Promise.allSettled` ile paralel okuma (2026-04-15 düzeltildi) |
| `ARCHITECTURE.md` | `memoryLocalCache()` açıklaması düzeltildi: Firebase'in varsayılan cache'ini *kapatan* çağrı olduğu netleştirildi |
| `ARCHITECTURE.md` | Güvenlik açıkları bölümü güncellendi: `AGORA_APP_CERT` taşıması tamamlandı, App Check durumu netleştirildi |
| `ROADMAP_AI.md` | "GitHub'a push" maddesi silindi — tamamlandı |

---

## Son Oturumda Yapılanlar (2026-04-15) — Üçüncü Tur AI Denetimi

### AI_REVIEW_3: Son bulgular. 1133 test yeşil.

| Dosya | Düzeltme |
|---|---|
| `firestore.rules` | `goruntulu` update: `durum` geçerli değerlerle kısıtlandı (`reddedildi/tamamlandi/iptal`) — öğrenci reddedilmiş oturumu `aktif` yapamaz |

#### Roadmap'e Alınan
- **`sifreSifirlamaGonder` rate limit eksik** → spam/enum aracı olabilir; `kocSil`, `veliOgrenciBagla` da korumasız
- **`emailKontrol` kullanıcı varlığı sızması** → Kasıtlı tasarım kararı (UI gereksinimi) ama KVKK kapsamında hassas; mimari nota eklenecek
- **`istemciHataKayitlari/istemciPerformans` log flooding** → `isActive()` eklemek minimum koruma; gerçek koruma için CF katmanı gerekir (overkill şimdilik)

---

## Son Oturumda Yapılanlar (2026-04-15) — İkinci Tur AI Denetimi & Aggregate Düzeltmeleri

### AI_REVIEW_2: Yeni bulgular uygulandı. 1133 test yeşil.

| Dosya | Düzeltme |
|---|---|
| `functions/aggregate.js` | `denemeAggregateGuncelle`: `onDocumentCreated` → `onDocumentWritten` (düzenleme aggregate'i güncelliyordu) |
| `functions/aggregate.js` | `rutinAggregateGuncelle`: silme durumu eklendi → `bugunRutinTarihi: null` (yanlış pozitif önlemi) |
| `functions/aggregate.js` | `gunlukSoruAggregateGuncelle`: silme durumu eklendi → `bugunSoruTarihi: null` |
| `functions/aggregate.js` | `onDocumentCreated` import kaldırıldı (artık kullanılmıyor) |
| `functions/medya.js` | `agoraToken`: `AGORA_APP_ID/CERT` env var guard eklendi (undefined geçilirse sessiz hata önlendi) |

#### Roadmap'e Alınan (Kod Değişikliği Yok)
- **FCM multi-device** → `fcmToken: string` yerine `fcmTokenler: []` array (kullanıcı tabanı büyüyünce gerekli)
- **Koç skor snapshot** → Haftalık scheduled CF ile `sistemOzetleri/{tarih}` koleksiyonuna yazılmalı
- **Bildirimler kuralı `get()` maliyeti** → Custom Claims gelince 3 okuma → 1 okumaya düşer

---

## Son Oturumda Yapılanlar (2026-04-15) — Güvenlik Denetimi & Kapsamlı Düzeltmeler

### AI_REVIEW: İki turlu Claude AI kod incelemesinden çıkan bulgular uygulandı. 1133 test yeşil.

#### Tur 1 Düzeltmeleri (kendi tespit)
| Dosya | Düzeltme |
|---|---|
| `functions/medya.js` | `goruntulReddet`: `e.message` → `'Sunucu hatası'` (iç hata sızmıyor) |
| `functions/medya.js` | `goruntulReddet`: `olusturanAt` yoksa 403 (token artık sonsuz geçerli olamaz) |
| `functions/medya.js` | `goruntulReddet`: TOCTOU → `runTransaction` (reddet atomik) |
| `functions/medya.js` | CORS: `kocpaneli.firebaseapp.com` eklendi (ikinci Firebase domain) |
| `functions/zamanlama.js` | N+1 sequential `for...of await` → `Promise.all` paralel + toplam saat/aktif gün üzerinden risk |
| `src/koc/hooks/useKocVeri.js` | `Promise.all` → `Promise.allSettled` (1 öğrenci hatası diğerlerini patlatmıyor) |

#### Tur 2 Düzeltmeleri (Claude AI dış inceleme)
| Dosya | Düzeltme |
|---|---|
| `firestore.rules` | `bildirimler` IDOR: koç sadece kendi öğrencisine `ders_daveti` gönderebilir; alıcı öğrenci değilse (veli/admin) serbest |
| `firestore.rules` | `ogrenciler` create: `kocId == request.auth.uid` zorunlu (başka koça atama engeli) |
| `firestore.rules` | `playlists` create: `coachId == request.auth.uid` zorunlu |
| `firestore.rules` | `rateLimits` explicit `allow read, write: if false` kuralı (niyet belgesi) |
| `src/firebase.js` | App Check production fallback: `VITE_RECAPTCHA_SITE_KEY` yoksa `debug_token=true` artık **sadece** `DEV`'de çalışır; prod'da `console.error` |
| `functions/mesaj.js` | `mesajOkunduAzalt`: okuma→yazma TOCTOU kaldırıldı, doğrudan `FieldValue.increment(-1)` |
| `functions/aggregate.js` | `denemeKonuTakipYaz`: sequential `for...of await` → `Promise.allSettled` |
| `functions/helpers.js` | `dateToStrTR`: `Intl.DateTimeFormat` ile timezone-aware (UTC+3 manuel ekleme kaldırıldı) |
| `functions/helpers.js` | `arayaniBul` / `adminKontrol` / `kocVeyaAdminKontrol`: parametre adı `context` → `request` (v2 API uyumu) |

#### Bilinçli Yapılmayanlar
- **Risk threshold (`risk <= 40`)** → `risk=50` zaten `yuksek_risk` gidiyor, reviewer hatalıydı
- **Tarih string karşılaması** → `daysAgoStrTR` `YYYY-MM-DD` döndürür, lexicographic doğru çalışır
- **Rules `get()` maliyeti** → Custom Claims ile çözülür, büyük refactor; aşağıda teknik borç olarak eklendi
- **`console.log` suppress** → Cloud Logging'de yapılandırılabilir, kod değişikliği gerekmez

---

## Son Oturumda Yapılanlar (2026-04-14) — Dosya Boyutu Bölme (#13–#19) Tamamlandı

### DOSYA_BOLME: 7 büyük dosya CLAUDE.md limitine indirildi, 1094 test yeşil

Bölünen dosyalar ve oluşturulan yeni dosyalar:

| # | Orijinal | Eski Satır | Yeni Dosyalar | Sonuç |
|---|---|---|---|---|
| 13 | `koc/Istatistikler.js` | 650 | `istatistiklerUtils.js`, `IstatistiklerGrafikler.js`, `IstatistiklerTablo.js` | 160 satır |
| 14 | `koc/VeliRaporlari.js` | 638 | `veliRaporlariUtils.js`, `RaporKarti.js` | 110 satır |
| 15 | `admin/SistemDurumuPaneli.js` | 598 | `sistemDurumuUtils.js`, `SistemDurumuKart.js` | 190 satır |
| 16 | `ogrenci/MufredatGoruntule.js` | 583 | `mufredatUtils.js`, `MufredatDers.js` | 220 satır |
| 17 | `ogrenci/KocNotlari.js` | 559 | `kocNotlariSabitleri.js`, `KocNotEkleForm.js`, `KocNotKarti.js` | 75 satır |
| 18 | `veli/VeliKartlari.js` | 501 | `KocRaporu.js` | 195 satır |
| 19 | `koc/OgrenciEkleModal.js` | 501 | `ogrenciEkleUtils.js`, `OgrenciEkleForm.js` | 156 satır |

**Test sayısı:** 1031 → 1094 (+63 yeni test, tamamı yeşil)

**Hâlâ limit aşan üretim dosyaları (sonraki tura bırakıldı):**

| Dosya | Satır | Limit | Tür |
|---|---|---|---|
| `admin/CanliOperasyonPaneli.js` | 496 | 250 | bileşen |
| `utils/kocSkorUtils.js` | 494 | 200 | utility |
| `koc/ProgramOlustur.js` | 493 | 250 | bileşen |
| `ogrenci/GunlukSoruFormu.js` | 480 | 250 | bileşen |
| `koc/gunluk/BugunProgrami.js` | 478 | 250 | bileşen |
| `pages/YoneticiPaneli.js` | 462 | 300 | sayfa |
| `koc/DenemeYonetimi.js` | 454 | 250 | bileşen |
| `components/VideoGorusme.js` | 446 | 250 | bileşen |
| `ogrenci/OgrenciNav.js` | 438 | 250 | bileşen |

---

## Son Oturumda Yapılanlar (2026-04-13) — Davranış Testleri Tamamlandı

### DAVRANIŞ_TESTLERİ: 59 test eklendi, toplam 1011

Yeni eklenen test dosyası: `davranis_testleri.test.js` — tüm testler yeşil (59/59).

**Kapsam (smoke → davranış yükseltmesi yapılan 13 bileşen):**

| Bileşen | Yeni Test Sayısı | Test Türü |
|---|---|---|
| DenemeYonetimi | 8 | Arama filtresi, chip filtre (veri_yok, dusus), sıralama butonları, onGeri |
| OgrenciDetay | 8 | 6 sekme geçişi, Geri butonu, initialTab, onTabChange callback |
| KocPerformansPaneli | 4 | Panel başlığı, koç listeleme, boş prop, takip gereken sayacı |
| OgrenciDuzenleModal | 5 | İsim dolu, isim değiştirilir, boş isimle kaydet, İptal, select mevcuttur |
| CanliOperasyonPaneli | 5 | Form mevcut, input yazılır, "Duyuruyu Yayınla" butonu, mobil mod |
| GunlukIlerlemePano | 5 | Boş öğrenci → null, başlık, Rutin etiketi, Program etiketi, tarih |
| OgrenciRutinKarti | 5 | İsim görünür, "Rutin yok" durumu, uyku/su/egzersiz kartları, hareket önerisi |
| GorusmeTimeline | 1 | Mock bileşen render kontrol |
| HaftalikVerimlilik | 4 | İçerik, başlık, 7 gün adları (Pzt/Sal), boş veri gösterimi |
| ProgramOlustur | 4 | Render, sekme geçişi, ders seçimi, onKaydet |
| Istatistikler | 3 | Render, onGeri, aralik seçenekleri (7/30/Tümü) |
| GuncelleModal | 5 | Mevcut değer dolu, yüzde güncellemesi, İptal, Kaydet disabled, başlık |

**Tüm test suite:** 29 dosya, 1011 test — 1011/1011 yeşil, 0 kırmızı, 0 skip

---

## Son Oturumda Yapılanlar (2026-04-12) — Bileşen Test Kapsamı Tamamlandı

Test kapsamı tamamlandı — 952 test (864 yeşil)

**Yeni eklenen test dosyaları (5 adet, 77 yeni test — tamamı yeşil):**

| Dosya | Kapsam | Testler |
|---|---|---|
| `admin_kalanlar.test.js` | AdminOgrenciEkleModal, OgrenciDuzenleModal | 6 |
| `admin_kalanlar2.test.js` | CanliOperasyonPaneli, SistemDurumuPaneli, YasamDongusuSayfasi | 7 |
| `admin_kalanlar3.test.js` | KocPerformansPaneli, MufredatYonetimSayfasi | 5 |
| `koc_agir_bilesenleri.test.js` | DenemeYonetimi, GorevKutuphane, GorusmeTimeline, GunlukTakip, GununSozu, HaftalikVerimlilik, HedefTakibi, Istatistikler, KitapVideoKutuphane, MesajlarSayfasi, OgrenciDetay, OgrenciEkleModal | 28 |
| `koc_hafif_bilesenleri.test.js` | PlaylistYonetimi, ProgramBilesenleri, ProgramOlustur, SenelikProgram, TopluIslemler, VeliMesajlariPaneli, VeliRaporlari, VideoIzleModal, BugunProgrami, GunlukIlerlemePano, OgrenciRutinKarti, RutinGirisFormu, GuncelleModal | 31 |

**Toplam suite:** 28 test dosyası, 952 test — 864 yeşil / 88 kırmızı
**Not:** 88 kırmızı test önceki oturumdan kalan `yeni_testler_*.test.js` dosyalarında — yeni eklenen 5 dosya 77/77 yeşil.

---

## Son Oturumda Yapılanlar (2026-04-12) — Katman 1: Firestore Emulator Rules Testleri

### FIRESTORE_RULES: 32 senaryo, gerçek emülatör üzerinde rules doğrulaması

**Mevcut durum:** Test dosyası hazır, altyapı kurulu. Çalıştırmak için Java gerekli.

**Dosya:** `src/__tests__/firestore_rules.test.js` — 32 test, 7 describe bloğu

| Describe | Test sayısı | Kapsam |
|---|---|---|
| `kullanicilar` | 6 | okuma/yazma izinleri, aktivite sub-koleksiyonu |
| `ogrenciler` | 11 | koç/öğrenci/veli erişimi, sonAktif KRİTİK testi, güvenlik testleri |
| `ogrenciler/denemeler` | 4 | öğrenci/koç CRUD, başka koç reddi |
| `ogrenciler/mesajlar` | 3 | koç yazma, başka koç reddi |
| `ogrenciler/program_v2` | 3 | öğrenci tamamlandi-only güncelleme, hafta alanı koruması |
| `bildirimler` | 2 | auth/anonim |
| `istemciHataKayitlari` | 2 | auth/anonim |

**Kritik test:** `"öğrenci sonAktif güncelleyebilir"` — bugün yaşanan rules bug'ının regresyon testi (`firestore.rules:97` satırı)

**Altyapı değişiklikleri:**
- `vitest.config.mjs`: `exclude: ['src/__tests__/firestore_rules.test.js']` eklendi → `npm test` artık temiz (11 passed, 448/448), emülatör gerektiren test ana suite'ten ayrıldı
- `package.json` scripts güncellendi:
  - `test:rules` → `firebase emulators:exec --only firestore "vitest run ..."` (emülatörü otomatik başlatır/durdurur)
  - `test:rules:manual` → emülatör zaten çalışıyorsa doğrudan vitest çalıştırır

**Çalıştırmak için (Java kurulduktan sonra):**
```bash
npm run test:rules         # emülatörü otomatik başlatır → testleri çalıştırır → kapatır
# VEYA ayrı terminal:
npm run emulator:start     # terminal 1
npm run test:rules:manual  # terminal 2
```

**Java kurulum:** https://adoptium.net → LTS sürüm → PATH'e ekle → `java -version` ile doğrula

**Bağımlılıklar (zaten kurulu):** `@firebase/rules-unit-testing@^5.0.0`, `firebase-admin`, `firebase-tools@15.11.0`

---

## Son Oturumda Yapılanlar (2026-04-10) — Güvenlik: Rate Limiting + App Check + Input Sanitization

- **Rate Limiting:** `functions/helpers.js`'e Firestore tabanlı sliding window `rateLimitKontrol()` eklendi
  - `kullaniciOlustur`: 20 istek / 24 saat
  - `kullaniciSil`: 10 istek / 24 saat
  - `rolDegistir`: 5 istek / 1 saat
  - `kocAta`: 10 istek / 1 saat
- **Firebase App Check:** `src/firebase.js`'e `ReCaptchaV3Provider` ile App Check init eklendi; DEV'de debug token otomatik açılır
  - `.env.local` ve `.env.production`'a `VITE_RECAPTCHA_SITE_KEY` eklendi (key'ler Firebase Console'dan doldurulacak)
- **Input Sanitizasyon:** `helpers.js`'e `temizle()`, `emailGecerliMi()`, `telefonNormalize()` eklendi; `kullaniciOlustur`'da email format kontrolü ve isim sanitizasyonu devreye alındı

---

## Son Oturumda Yapılanlar (2026-04-10) — Lighthouse CI + Coverage + Güvenlik

### LIGHTHOUSE_CI: Performans ölçümü, coverage threshold, güvenlik denetimi

- `@lhci/cli` kuruldu
- `lighthouserc.js` → `./build` statik dizininde `/giris` URL'i tarar; tüm assert'ler `warn` seviyesinde
  - performance ≥ 0.70, accessibility ≥ 0.80, best-practices ≥ 0.80, seo ≥ 0.80
  - FCP ≤ 3000ms, TTI ≤ 5000ms
- `vitest.config.mjs` threshold güncellendi: **lines 90 / functions 90 / branches 80 / statements 90**
  - Mevcut coverage: stmts 96%, branch 83%, funcs 93% → hepsi karşılanıyor
- `.husky/pre-commit` → `npm run test -- --coverage` eklendi (commit öncesi coverage kontrolü)
- **Yeni script'ler:**
  - `lighthouse` — build + lhci autorun
  - `lighthouse:assert` — mevcut build üzerinde sadece assert
  - `audit:deps` — npm audit --audit-level=high
  - `audit:full` — npm audit (tam rapor)

---

## Son Oturumda Yapılanlar (2026-04-10) — Playwright E2E Testler

### PLAYWRIGHT: E2E test altyapısı kuruldu

- `@playwright/test` kuruldu, Chromium indirildi
- `playwright.config.js` → `vite preview --port 4173` üzerinde çalışır; `reuseExistingServer: false`
- `test:e2e` script'i `npm run build && playwright test` olarak tanımlandı (production build üzerinde test)
- **4 test dosyası oluşturuldu (`e2e/` klasörü):**
  - `giris.spec.js` — Giriş formu: yükleniyor, disabled buton, fill + enabled, yanlış şifre hatası, Enter tetiklemesi
  - `navigasyon.spec.js` — Auth redirect'leri (`/` → `/giris`, `/koc` → `/giris`, `/ogrenci` → `/giris`), başlık, logo
  - `pwa.spec.js` — `manifest.json`, `sw.js`, `favicon.svg` erişilebilirlik kontrolü
  - `responsive.spec.js` — Mobil (Pixel 5) layout, yatay scroll kontrolü
- **Düzeltmeler:**
  - `test.use()` `describe` dışına alındı (Playwright kısıtı)
  - `waitForSelector` ile Firebase auth init bekleniyor
  - `waitForURL` ile client-side redirect bekleniyor
- Sonuç: **28/28 test yeşil** (14 chromium + 14 mobile)

---

## Son Oturumda Yapılanlar (2026-04-10) — UX & Erişilebilirlik

### A11Y: temel erişilebilirlik — label, aria-label, role, ESC desteği eklendi

- `Shared.js` → `Btn`: `type`, `ariaLabel`, `aria-disabled` eklendi; `Input`: `id`, `ariaLabel`, `aria-required`, `aria-invalid`, `gecersiz` (hata rengi) eklendi; `Card`: `tabIndex`, `role="button"`, `onKeyDown` (Enter/Space) eklendi; `ConfirmDialog`: ESC handler, `role="dialog"`, `aria-modal`, `aria-labelledby`, buton aria-label'ları eklendi
- `HedefEkleModal.js` → `<label htmlFor>` + `id` her input için, `role="dialog" aria-modal`, ESC kapatma
- `OgrenciEkleModal.js` → aynı pattern (öğrenci + veli alanları + select), iki modal div'ine `role="dialog" aria-modal`, ESC kapatma
- `KocHeroKart.js` → GirisYokModal ✕ butonuna `aria-label="Modalı kapat"`

### UX: senelik program, veli raporları, günün sözü, sol menü, günaydın iyileştirmeleri

- `SenelikProgram.js` → HaftaHucresi: hover scale + boxShadow animasyonu; OgrenciTakvimi: KPI şeridi (işaretli hafta, sınav haftası, tatil, kalan hafta)
- `VeliRaporlari.js` → Rapor önizleme div'ine `id="rapor-icerik"`; PDF İndir butonu (`window.print()`)
- `public/index.html` → print media query: sadece `#rapor-icerik` görünür
- `GununSozu.js` → gece sıfırlama (timestamp kontrolü) zaten uygulanmıştı ✅
- `KocSolMenu.js` → grup başlık stilleri zaten uygulanmıştı ✅
- `KocHeroKart.js` → Günaydın kişiselleştirme zaten uygulanmıştı ✅

---

## Son Oturumda Yapılanlar (2026-04-10) — Performans Optimizasyonu

### Performans: lazy loading + vendor chunk split eklendi

- `OgrenciDetay.js` → `VideoGorusme` static import kaldırıldı, `React.lazy` + `React.Suspense` eklendi
- `OgrenciPaneli.js` → `VideoGorusme`, `DenemeListesi`, `MufredatGoruntule`, `HaftalikProgramSayfasi`, `DuyuruMerkezi` lazy'e çevrildi; `renderSayfa()` Suspense ile sarıldı
- `KocPaneli.js` → `SenelikProgramSayfasi`, `KitapVideoKutuphane`, `PlaylistYonetimi`, `IstatistiklerSayfasi`, `TopluIslemlerSayfasi`, `DuyuruMerkezi`, `GununSozu` lazy'e çevrildi; `renderSayfa()` Suspense ile sarıldı
- `vite.config.js` → `manualChunks`: `vendor-firebase` (534 kB), `vendor-recharts` (377 kB), `vendor-react` (179 kB); `chunkSizeWarningLimit` 600'e indirildi
- Sonuç: `VideoGorusme` (1.53 MB Agora SDK) artık ayrı chunk — video görüşmeye girilmeden indirilmiyor; KocPaneli ana chunk 104 kB; 264/264 test yeşil

---

## Son Oturumda Yapılanlar (2026-04-12) — Test Kapsamı Genişletme

### TEST_GENISLETME: Eksik utility, UI bileşen, Firebase bağımlı bileşen, sayfa ve entegrasyon testleri eklendi

| Dosya | Test sayısı | Kapsam |
|---|---|---|
| `utility_eksik.test.js` | 40 | aktifDurumu, duyuruRenk, funnelYuzde, aktivasyonRozet, destekTipleri, hedefDurumu, ilerlemeYuzdesi, hedefTurEtiket, TUR_LABEL |
| `bilesenler_ui.test.js` | 37 | KocSolMenu, KocVeriGirisiKart, KocMesajUyari, KocAltTabBar, GeriSayimKart, DersKarti, KocTopBar, KocOgrenciListesi, KocRiskOzeti, KocSabahEkrani, DenemeKart |
| `giris_ekrani.test.js` | 14 | GirisEkrani form validasyonu, buton disabled/enabled, trim kontrolü, şifre göster/gizle, Enter tetiklemesi |
| `bilesenler_firebase.test.js` | 21 | DenemeListesi, MesajlarSayfasi, GunlukSoruFormu, MufredatGoruntule — Firebase mock'lu bileşen testleri |
| `sayfalar.test.js` | 14 | KocPaneli smoke (7 test), OgrenciPaneli smoke (7 test) — tüm ağır bileşenler mock'lanmış |
| `entegrasyon.test.js` | 58 | ogrenciBaglam segmentasyon, turBelirle, hedef zinciri, programAlgoritma, tarih güvenliği, readState, aktifDurumu — regresyon testleri dahil |
| **Yeni toplam** | **448** | **+134 test (314 → 448)** |

**Altyapı güncellemeleri:**
- `setup.js`: `temaListesi/temaId` ThemeContext mock'a eklendi; `increment, startAfter` Firestore mock'a eklendi; `signInWithEmailAndPassword, setPersistence, browserSessionPersistence, sendPasswordResetEmail` Auth mock'a eklendi; Toast mock eklendi; firebase default export eklendi
- `testUtils.js`: `renderWithTheme` yardımcı fonksiyonu eklendi (renderWithProviders alias'ı)

**Önemli mock pattern'leri:**
- `sayfalar.test.js`: `useKocVeri` ve `useOkunmamis` hook'ları mock'landı; tüm statik ve lazy import'lar mock'landı
- `bilesenler_firebase.test.js`: `import { getDocs } from 'firebase/firestore'` → `vi.mocked(getDocs).mockResolvedValue(...)` pattern'i
- `entegrasyon.test.js`: Pure fonksiyon testleri — gerçek API alan adları doğrulandı (`guncelDeger/baslangicDegeri` vs `mevcutDeger`)

---

## Son Oturumda Yapılanlar (2026-04-10) — Test Altyapısı

### Test kapsamı tamamlandı

| Dosya | Test sayısı | Kapsam |
|---|---|---|
| `smoke.test.js` | 31 | netHesapla, streak, readState, turBelirle |
| `program_ve_skor.test.js` | 58 | programAlgoritma + kocSkorUtils |
| `tarih_ve_timeline.test.js` | 38 | tarih yardımcıları + haftalikOzet + müfredat haritası |
| `baglam_ve_ogrenci.test.js` | 66 | segment çözücü + ders setleri + generateSuggestions |
| `bilesenler.test.js` | 71 | KocSolMenu, KocHeroKart, KocVeriGirisiKart, KocMesajUyari, GeriSayimKart, DersKarti, hedefUtils, useGunlukTarih |
| `functions/__tests__/cf_yardimci.test.js` | 25 | dateToStrTR, normalizeEmail, riskDurumu, CF modül smoke |
| **Toplam** | **289** | **%97 stmt / %83 branch** |

**Altyapı:**
- `vitest.config.mjs`: jsdom ortamı, react plugin, v8 coverage, threshold'lar (60/60/50)
- `src/__tests__/setup.js`: Firebase, ThemeContext, AuthContext, recharts, react-router mock'ları
- `src/__tests__/testUtils.js`: renderWithProviders, renderSade, mockS
- `functions/vitest.config.mjs` + `functions/__tests__/setup.js`: firebase-admin mock'ları

**Scriptler:**
- `npm test` — tüm frontend testleri
- `npm run test:coverage` — coverage raporu (coverage/ klasörüne)
- `npm run test:cf` — Cloud Functions testleri

---

## Son Oturumda Yapılanlar (2026-04-10)

### Kritik Bug: `tur`/`sinif` alanı her zaman `undefined` geliyordu
**Kök neden:** `kullanicilar/{uid}` koleksiyonunda `tur` ve `sinif` hiç kaydedilmiyordu.
**Düzeltmeler:**
- `OgrenciPaneli.js` → `ogrenciler/{uid}`'den `ogrenciTur` + `ogrenciSinif` state olarak çekiliyor
- `GeriSayimKart`, `DenemeListesi`, `MufredatGoruntule`, `SolMenu` → hepsi `ogrenciTur || userData?.tur` alıyor
- `functions/index.js` → `kullaniciOlustur` CF artık `tur` alanını `kullanicilar`'a da yazıyor
- `OgrenciDuzenleModal.js` → koç düzenlediğinde `tur` `kullanicilar`'a da yazılıyor

### PDF notlarından gelen görevler (2026-04-10 oturumu)

| # | Görev | Dosya | Durum |
|---|-------|-------|-------|
| 1 | Sol menü grup başlıkları koyu | `KocSolMenu.js` | ✅ |
| 2 | Hero kart `"Koç paneli"` → `"Sevgili [Ad] 👋"` | `KocHeroKart.js` | ✅ |
| 3 | Okunmamış mesaj: tek kişi → direkt aç | `KocHeroKart.js` | ✅ zaten vardı |
| 4 | "Henüz veri yok" kartı tıklanabilir | `KocVeriGirisiKart.js` | ✅ |
| 5 | Öğrencilerim geri tuşu | `KocOgrenciListesi.js` | ✅ zaten vardı |
| 6 | Hedef puan formülleri + bilgi notu + tahmini değer | `hedefUtils.js`, `HedefEkleModal.js`, `OgrenciHedefKarti.js` | ✅ |
| 7a | `KutlamaEkrani.js` yeni bileşen | `src/ogrenci/KutlamaEkrani.js` | ✅ |
| 7b | Doğum günü kontrolü + kutlama ekranı tetikleyici | `OgrenciPaneli.js` | ✅ |
| 7c | OgrenciEkleModal doğum tarihi alanı + CF güncelleme | `OgrenciEkleModal.js`, `functions/index.js` | ⏳ YAPILMADI |
| 8 | Rutin kartı günün hareketi chip'i | `OgrenciRutinKarti.js` | ✅ |
| 9 | Günlük soru formu son 7 gün listesi | `GunlukSoruFormu.js` | ✅ |
| 10 | Müfredat konu bazlı saat + soru istatistiği | `MufredatGoruntule.js` | ⏳ YAPILMADI |
| 11 | 14 günlük çalışma saati programdan hesapla | `Istatistikler.js` | ⏳ YAPILMADI |
| 12 | İki ders arası ilişki bölümünü kaldır | `Istatistikler.js` | ⏭️ Bölüm yok |
| 13 | Senelik program profesyonel görünüm | `SenelikProgram.js` | ⏳ YAPILMADI |
| 14 | Veli raporları profesyonelleştir (koç tarafı) | `VeliRaporlari.js` | ⏳ YAPILMADI |
| 15 | Günün sözü bugün kontrolü | `GununSozu.js` | ✅ |
| 16 | Görev şablonları programa entegre | `GorevKutuphane.js` | ✅ önceki oturumda |
| 17 | Sol menüden Playlist kaldır + KitapVideoKutuphane'de sekme | `KocSolMenu.js` | ✅ |
| 18 | Denemeler tur bug fix | `DenemeListesi.js` | ✅ |

---

## Son Oturumda Yapılanlar (2026-04-10) — Context Refactor

### CONTEXT_REFACTOR: KocContext oluşturuldu, prop drilling kaldırıldı

- `src/context/KocContext.js` — `KocProvider` + `useKoc()` hook oluşturuldu
  - Context değerleri: `ogrenciler, dashboardMap, bugunMap, okunmamisMap, yukleniyor, yenile`
- `KocPaneli.js` — tüm return `<KocProvider ...>` ile sarıldı; `okunmasisMap` prop adı context'te `okunmamisMap` olarak normalize edildi
- **Refactor edilen 5 bileşen** (data prop'ları kaldırıldı, `useKoc()` eklendi):
  - `KocSabahEkrani` — `ogrenciler, bugunMap, okunmamisMap` artık context'ten
  - `KocOgrenciListesi` — `ogrenciler, dashboardMap, bugunMap, okunmamisMap, yukleniyor` artık context'ten
  - `KocVeriGirisiKart` — `ogrenciler, bugunMap` artık context'ten
  - `KocMesajUyari` — `ogrenciler, okunmasisMap` artık context'ten
  - `KocRiskOzeti` — `ogrenciler` artık context'ten
- **Kural:** `onSec, onNav, onGeri` callback'leri prop olarak kalmaya devam etti (context'e taşınmadı)
- **Testler:** `bilesenler.test.js` güncellendi — KocVeriGirisiKart ve KocMesajUyari testleri KocProvider wrapper kullanıyor
- Sonuç: 264/264 test yeşil, build başarılı

---

## Son Oturumda Yapılanlar (2026-04-10) — PropTypes

### PROPTYPES: Tüm bileşenlere PropTypes eklendi

- `npm install prop-types --save` çalıştırıldı
- **10 öncelikli dosya:** Shared.js (Btn/Input/Card/StatCard/Avatar/LoadingState/EmptyState/ConfirmDialog), KocSolMenu, KocHeroKart, KocSabahEkrani, KocVeriGirisiKart, KocMesajUyari, GeriSayimKart, DersKarti, OgrenciHedefKarti, HedefEkleModal
- **Tüm koc/** + **ogrenci/** bileşenleri (44 dosya daha): node script ile toplu eklendi
- Sonuç: 264/264 test yeşil, format geçti
- PropTypes artık dev konsolda yanlış prop geçince uyarı verir

---

## Son Oturumda Yapılanlar (2026-04-10) — CF Dosya Bölme

### CF_BOLME: functions/index.js (1344 satır → 7 modül)

- `functions/helpers.js` — dateToStrTR, todayStrTR, daysAgoStrTR, arayaniBul, normalizeEmail, adminKontrol, kocVeyaAdminKontrol, logYaz, ogrenciDokuman
- `functions/kullanici.js` — emailKontrol, kullaniciOlustur, kullaniciAktiveEt, kullaniciPasifYap, kullaniciSil, rolDegistir, kocAta, kocSilVeOgrenciTasi, veliOgrenciBagla, sifreSifirlamaGonder, kocSil
- `functions/aggregate.js` — denemeAggregateGuncelle, denemeKonuTakipYaz, calismaAggregateGuncelle, rutinAggregateGuncelle, gunlukSoruAggregateGuncelle
- `functions/mesaj.js` — mesajOkunmamisArt, mesajOkunduAzalt
- `functions/bildirim.js` — bildirimPushGonder, eskiBildirimleriSil
- `functions/zamanlama.js` — riskSkoreHesapla, gunlukAlanlariSifirla
- `functions/medya.js` — playlistEkle, playlistYenile, agoraToken, goruntulReddet
- `functions/index.js` — sadece initializeApp + setGlobalOptions + Object.assign re-export'lar (~20 satır)
- Sonuç: 25/25 CF testi yeşil, frontend build başarılı

---

## Bekleyen Görevler — Sonraki Oturumda Yapılacak

### 🔴 Öncelikli

#### G7c — OgrenciEkleModal doğum tarihi alanı
**Dosya:** `src/koc/OgrenciEkleModal.js`
Form'a `dogumTarihi` input'u ekle (`type="date"`). `kullaniciOlustur` CF çağrısına bu alanı geç.
`functions/index.js`'te `ogrenciDokuman()` fonksiyonuna `dogumTarihi` alanı ekle.
**Not:** KutlamaEkrani bileşeni hazır, sadece veri girişi eksik.

#### G14 — VeliRaporlari koç tarafı güncelleme
**Dosya:** `src/koc/VeliRaporlari.js`
Mevcut koç raporu listesine tarih filtresi + PDF yazdırma butonu ekle.
Şu an veli tarafı (`VeliKartlari.js`) güncel ama koç tarafı eski.
Kodu oku → `haftalikOzetOlustur` ve `waMetniOlustur` fonksiyonları var.
PDF için `window.print()` yeterli.

#### G10 — Müfredat konu saat + soru istatistiği
**Dosya:** `src/ogrenci/MufredatGoruntule.js`
`konu_takip/{konuId}` dokümanında `calismaSaati` ve `cozulenSoru` alanları
henüz doldurulmuyor. Önce Firestore'da bu alanların kaynağını netleştir.
Şu an manuel koç işaretlemesi var (`koc_isareti` kaynağı). Otomatik veri yok.
**Öneri:** Önce veri modeline karar ver, sonra UI ekle.

#### G13 — Senelik program profesyonel görünüm
**Dosya:** `src/koc/SenelikProgram.js`
6 iyileştirme: ay başlıkları, renk legend, hover efekti, seçili hafta vurgusu,
üst özet şerit (KPI), mobil yatay scroll. Önce dosyayı oku.

#### G11 — 14 günlük çalışma saati programdan hesapla
**Dosya:** `src/koc/Istatistikler.js`
Mevcut bar chart gerçek `calisma` alt koleksiyonundan geliyor.
Görev: program slotlarından da beklenen saat hesapla ve karşılaştır.
Önce `src/koc/Istatistikler.js` tümünü oku.

### 🔵 Teknik Borç

#### Rules `get()` maliyeti → Custom Claims
**Dosyalar:** `firestore.rules`, `functions/kullanici.js`
`myRole()`, `isOgrencininKocu()` gibi fonksiyonlar her kural değerlendirmesinde `get()` çağrısı yapıyor — 50 öğrencili koç panelinde ciddi okuma maliyeti.
`bildirimler` kuralına eklenen `get(.../ogrenciler/...)` ile bu maliyet daha da arttı (artık 3 okuma / istek).
**Çözüm:** `auth.setCustomUserClaims(uid, { rol: 'koc' })` ile rol bilgisini JWT'e taşı; rules'da `request.auth.token.rol` ile oku (0 Firestore okuma).
**Önkoşul:** `kullaniciOlustur`, `rolDegistir`, `kullaniciAktiveEt` CF fonksiyonlarında claim set edilmeli.

#### `sifreSifirlamaGonder` + Diğer CF'lere Rate Limit
**Dosya:** `functions/kullanici.js`
`kocSil`, `veliOgrenciBagla`, `sifreSifirlamaGonder` fonksiyonlarında `rateLimitKontrol` yok.
`sifreSifirlamaGonder` özellikle kritik: sınırsız çağrılırsa spam veya e-posta enum aracına dönüşür.
**Çözüm:** `sifreSifirlamaGonder`'a `rateLimitKontrol(uid, 'sifreSifirla', 3, 3600)` ekle.

#### `istemciHataKayitlari` / `istemciPerformans` Log Flooding
**Dosya:** `firestore.rules`
`allow create: if isAuth()` — aktiflik kontrolü bile yok, giriş yapmış herhangi biri sonsuz log yazabilir.
**Kısa vadeli çözüm:** `isActive()` ekle. Gerçek koruma: yazmaları CF katmanından geçir (ileride).

#### `emailKontrol` KVKK Notu
**Dosya:** `functions/kullanici.js`
`emailKontrol` kasıtlı olarak kullanıcı varlığını açıklıyor (UI gereksinimi).
Koç herhangi bir e-postanın sistemde kayıtlı olup olmadığını öğrenebilir.
**Not:** Şu an sorun değil ama GDPR/KVKK denetiminde sorgulanabilir. Mimari dokümana eklenecek.

#### FCM Multi-Device Desteği
**Dosya:** `src/utils/aktiflikKaydet.js` (veya token kayıt noktası), `functions/bildirim.js`
Şu an `kullanicilar/{uid}.fcmToken` tek alan — aynı kullanıcı ikinci cihazda giriş yapınca token eziliyor.
**Çözüm:** `fcmTokenler: []` array'e geç. `bildirimPushGonder`'da her token'a gönder; `messaging/registration-token-not-registered` alınınca array'den çıkar.
**Not:** Kullanıcı tabanı küçükken kritik değil; büyüyünce şikâyet alınır.

#### Koç Performans Skoru Snapshot
**Dosya:** `functions/zamanlama.js` (yeni scheduled CF)
`computeCoachPerformance()` şu an sadece frontend'de hesaplanıyor — geçmiş kaydedilmiyor.
**Çözüm:** `riskSkoreHesapla` gibi haftalık bir scheduled CF ekle; `sistemOzetleri/{YYYY-WNN}` koleksiyonuna her koçun skorunu yaz.
**Not:** Admin "bu ay koç daha mı iyi oldu?" sorusunu cevaplayabilir; trend grafiği çizilebilir.

#### SW Hardcoded URL'ler
**Dosya:** `public/firebase-messaging-sw.js`
`https://kocpaneli.web.app` ve `https://europe-west1-kocpaneli.cloudfunctions.net/goruntulReddet` URL'leri hardcoded.
SW güncellemesi garanti değil — eski SW'i olan kullanıcılar domain veya CF bölgesi değişirse sessizce hata alır.
**Uzun vadeli çözüm:** `notificationclick` handler'ını `postMessage` ile ana uygulamaya delege et; SW'den doğrudan `fetch` yapmaktan kaçın.
**Not:** SW Firebase sürüm güncellenmesi gerektiğinde `firebase-messaging-sw.js` importScripts satırları da güncellenmelidir (şu an 12.11.0 ile `package.json` uyumlu).

#### `rateLimits` → Redis/Memorystore
**Dosya:** `functions/helpers.js`
Firestore tabanlı rate limiting işe yarıyor ama her istek 1 transaction = okuma + yazma maliyeti.
**Uzun vadeli çözüm:** Google Cloud Memorystore (Redis) ile in-memory rate limiting — ölçekte daha ucuz ve hızlı.

#### `functions/` için ESLint `no-console` Kuralı
**Dosya:** `.eslintrc.cjs` veya `functions/.eslintrc.cjs` (oluşturulacak)
`no-console: warn` kuralı sadece `src/` için yapılandırılmış (`lint: eslint src --ext .js,.jsx`).
`functions/` klasöründe `console.log` / `console.error` serbestçe kullanılıyor — Cloud Logging'e her satır ayrı log entry olarak yazıldığından hem **maliyet** hem de **dahili veri sızıntısı** riski var (hata mesajlarında uid, e-posta vs. geçebilir).
**Çözüm:** `functions/` için ayrı lint config ekle veya package.json `lint` scriptine `functions/` klasörünü dahil et; `no-console: warn` ile başla, sonra `error`'a çek.
```json
// functions/.eslintrc.cjs
module.exports = {
  rules: { 'no-console': 'warn' }
};
```
**Not:** Cloud Logging'de `console.log` suppress etmek için `functions.logger` (Firebase SDK) kullanımına geçilebilir — yapılandırılmış log + severity desteği sunar.

---

### 🟡 Orta Öncelik

#### Mevcut öğrenciler `tur` toplu sync (admin araç)
**Dosya:** `src/admin/` (yeni panel bölümü veya `TopluIslemler.js`)
CF düzeltmesi yeni öğrencileri kapsar ama mevcut öğrencilerin `kullanicilar`
dökümanında `tur` yok. Admin paneline bir kez çalıştırılacak "Segment Sync" butonu.
```js
// Mantık:
const snap = await getDocs(collection(db, 'ogrenciler'));
for (const ogr of snap.docs) {
  const { tur, sinif } = ogr.data();
  if (tur) await updateDoc(doc(db, 'kullanicilar', ogr.id), { tur, sinif: sinif || null });
}
```

#### VideoGorusme code split (1.57 MB chunk)
**Dosya:** `src/pages/OgrenciPaneli.js` + `src/App.js`
`VideoGorusme` import'unu `React.lazy` ile sar. Şu an tüm öğrenci paneli
yüklenirken 1.57 MB VideoGorusme indiriliyor.

#### Firebase App Check — Konsol Aktivasyonu (Son Adım)

**Kod tarafı tamamen hazır (2026-04-15):**
- ✅ `src/firebase.js` — `ReCaptchaV3Provider` ile `initializeAppCheck` init; DEV'de debug token otomatik açılır
- ✅ `functions/helpers.js` — `appCheckKontrol(request)` fonksiyonu eklendi
- ✅ `functions/kullanici.js` — `kullaniciOlustur` ve `kocAta` fonksiyonlarına `appCheckKontrol` eklendi

**Yapılacak tek şey: Firebase Console'dan enforce etmek.**

Adım adım aktivasyon:

**1. reCAPTCHA Site Key al**
- Google Cloud Console → `kocpaneli` projesi → APIs & Services → Credentials
- "Create Credentials" → reCAPTCHA v3 key → domain: `kocpaneli.web.app`
- Anahtarı `.env.production` ve `.env.local`'daki `VITE_RECAPTCHA_SITE_KEY=` satırına yaz

**2. Firebase Console App Check aç**
- Firebase Console → `kocpaneli` projesi → App Check (sol menü)
- "Web" uygulamasına tıkla → Provider: reCAPTCHA v3 → Site Key'i yapıştır → Kaydet

**3. Dev ortamı debug token**
- App Check → "Apps" sekmesi → web app → "Overflow menu" → "Manage debug tokens" → "Add debug token"
- Üretilen token'ı `.env.local`'a yaz: `VITE_APPCHECK_DEBUG_TOKEN=<token>`
- Bu olmadan `npm run dev` App Check hatası verir

**4. Cloud Functions enforce**
- Firebase Console → App Check → "APIs" sekmesi
- "Cloud Functions API" → "Enforce" butonuna tıkla
- ⚠️ Bu adımdan sonra `appCheckKontrol()` olan fonksiyonlar token olmadan 401 döner

**5. Firestore / Auth enforce (isteğe bağlı, daha sonra)**
- Aynı "APIs" sekmesinden Firestore ve Auth için de enforce edilebilir
- Önce yalnızca Cloud Functions'ı enforce et; birkaç gün sorun yoksa devam et

**Geri alma:** Enforce → "Unenforce" ile anında geri alınabilir; zero-downtime.

**Bağlam:** Rate limiting + App Check altyapısı 2026-04-10'da kısmen yapıldı; `appCheckKontrol()` 2026-04-15'te eklendi.

---

## Mimari Notlar (Değişmeyen Kurallar)

### Test Dosyası Eşleştirme Haritası

Yeni test nereye yazılır:

| Değişen dosya | Test dosyası |
|---|---|
| `src/utils/*` | `yeni_testler_utils.test.js` veya `yeni_testler_utils2.test.js` |
| `src/components/*` | `yeni_testler_bilesenleri.test.js` veya `yeni_testler_bilesenleri3.test.js` |
| `src/admin/*` | `yeni_testler_admin.test.js` |
| `src/koc/ui/*` | `yeni_testler_koc_ui.test.js` |
| `src/koc/hedef/*` | `yeni_testler_hedef_ogrenci.test.js` |
| `src/koc/hooks/*` | `yeni_testler_sayfalar.test.js` |
| `src/koc/*.js` | `koc_agir_bilesenleri.test.js` veya `koc_hafif_bilesenleri.test.js` |
| `src/ogrenci/*` | `yeni_testler_hedef_ogrenci.test.js` |
| `src/pages/*` | `yeni_testler_sayfalar.test.js` |
| `src/context/*` | `yeni_testler_auth_modal.test.js` veya `yeni_testler_hooks_bilesenleri.test.js` |
| `src/hooks/*` | `yeni_testler_hooks_bilesenleri.test.js` |
| `src/constants/*` | `yeni_testler_utils.test.js` |
| `src/themes/*` | `yeni_testler_utils.test.js` |

Eğer hiçbir dosyaya uymuyorsa yeni bir test dosyası aç ve listeye ekle.

### `tur` alanı nerede yaşar?
```
ogrenciler/{uid}.tur   ← KAYNAK GERÇEK (CF ogrenciDokuman ile yazılır)
kullanicilar/{uid}.tur ← KOPYA (CF + OgrenciDuzenleModal senkronize eder)
userData?.tur          ← kullanicilar'dan gelir — yeni öğrenciler için güvenilir
ogrenciTur (state)     ← ogrenciler'den ayrıca çekilir — eski öğrenciler için fallback
```
**Kural:** Bileşenlerde her zaman `ogrenciTur || userData?.tur` kullan.

### Firestore koleksiyon hiyerarşisi
```
kullanicilar/{uid}                    ← Auth profil (rol, isim, email, tur*)
ogrenciler/{uid}                      ← Öğrenci akademik veri (tur, sonDenemeNet, ...)
ogrenciler/{uid}/program_v2/{hafta}   ← Haftalık slot programı
ogrenciler/{uid}/konu_takip/{konuId}  ← Konu durumları (tamamlandi/eksik)
ogrenciler/{uid}/denemeler/{id}       ← Deneme sonuçları
ogrenciler/{uid}/veliRaporlari/{id}   ← Koç haftalık raporları
ogrenciler/{uid}/gunlukSoru/{tarih}   ← Günlük soru çözümü (tarih = YYYY-MM-DD)
```

### CF tetikleyiciler
```
denemeKonuTakipYaz   ← denemeler yazılınca konu_takip'e otomatik işaretler
calismaAggregateGnc  ← calisma eklenince ogrenciler root'taki toplamları günceller
riskSkoreHesapla     ← gece 03:00 çalışır, tüm öğrencilerin riskDurumu'nu yazar
```

### Lint & Format
```bash
npm run lint:fix   # ESLint otomatik düzelt
npm run format     # Prettier formatla
npm run build      # Sonra build ile doğrula
firebase deploy --only hosting  # Deploy
```

---

## Kod Kalite Kuralları (Değişmeyen)

- Tüm değişken/fonksiyon adları **Türkçe**
- Yorum satırları Türkçe
- Dosya başına 500 satır sınırı
- `useTheme()` → `s` objesi, tüm renkler buradan
- `console.log` yasak — sadece `console.error`
- `catch {}` boş bırakma — `catch (e) { console.error(e); }` kullan

---

### Sessiz güncelleme (silent update) eklendi (2026-04-10)
- `public/sw.js` — activate sonunda `SW_GUNCELLENDI` mesajı tüm sekmelere gönderiliyor
- `src/index.js` — SW mesajı dinleniyor, `window.__swGuncellendi = true` flag'i konuluyor
- `src/App.js` — her route değişiminde flag kontrol ediliyor, varsa sessiz reload
- `src/components/ErrorBoundary.js` — chunk hatası sessizce reload (30s döngü koruması), buton sadece gerçek hatalarda çıkıyor

*Son güncelleme: 2026-04-10*
*Güncelleyen: Claude Sonnet 4.6 (claude-sonnet-4-6)*
