# ElsWay — Mimari Belgesi

**Son güncelleme:** 2026-04-14
**Kaynak:** Kaynak kod incelemesi + CLAUDE.md + ROADMAP_AI.md

Bu dosya projeyi ilk kez inceleyen bir geliştirici veya AI için tek başına yeterli bağlamı sağlar.
Detaylı kurallar için `CLAUDE.md`, bekleyen işler için `ROADMAP_AI.md` dosyalarına bak.

---

## Ürün Tanımı

ElsWay, Türkiye'deki LGS ve YKS sınavlarına hazırlanan öğrenciler için geliştirilmiş koçluk yönetim platformudur.

**Canlı URL:** https://kocpaneli.web.app
**Firebase Projesi:** `kocpaneli`

### Kullanıcı Rolleri

| Rol | Giriş Paneli | Temel Yetki |
|---|---|---|
| `admin` | `YoneticiPaneli` | Tüm sistemi yönetir, koç/öğrenci atar, sistemi izler |
| `koc` | `KocPaneli` | Öğrencileri takip eder, program/deneme/rapor yönetir |
| `ogrenci` | `OgrenciPaneli` | Programını görür, rutin girer, deneme analiz eder |
| `veli` | `VeliPaneli` | Öğrencisinin durumunu ve koç raporlarını okur |

Rol bilgisi `kullanicilar/{uid}.rol` alanından gelir. Auth sonrası `AuthContext` bunu yükler.

---

## Teknoloji Stack

| Katman | Teknoloji | Not |
|---|---|---|
| Frontend | React 18 + Vite | `src/` altında |
| Routing | React Router v7 | Lazy loading ile |
| Veritabanı | Firebase Firestore | Realtime değil, `getDocs/getDoc` ağırlıklı |
| Auth | Firebase Authentication | Email/şifre |
| Sunucu mantığı | Firebase Cloud Functions | `europe-west1` bölgesi |
| Hosting | Firebase Hosting | `npm run build` → `firebase deploy` |
| Bildirim | Firebase Cloud Messaging (FCM) | Push + in-app |
| Görüntülü görüşme | Agora RTC | Token CF'den üretilir |
| Test | Vitest + React Testing Library | 1096 test, hepsi yeşil |
| Linting | ESLint + Prettier | Pre-commit hook (Husky) |

---

## Klasör Yapısı

```
src/
├── pages/              # Rota entry point'leri — hepsi React.lazy ile yüklenir
│   ├── GirisEkrani.js
│   ├── KocPaneli.js
│   ├── OgrenciPaneli.js
│   ├── VeliPaneli.js
│   └── YoneticiPaneli.js
│
├── koc/                # Koç paneli bileşenleri
│   ├── ui/             # KocSolMenu, KocTopBar, KocHeroKart, KocOgrenciListesi vb.
│   ├── gunluk/         # BugunProgrami, GunlukIlerlemePano, OgrenciRutinKarti
│   ├── hedef/          # HedefEkleModal, OgrenciHedefKarti, hedefUtils
│   ├── hooks/          # useKocVeri (ana veri hook'u), useOkunmamis
│   ├── HaftalikProgram.js       # Haftalık slot programı — sadece UI
│   ├── useHaftalikProgram.js    # Haftalık program tüm state + Firestore mantığı
│   ├── DenemeYonetimi.js        # Deneme listesi + filtreleme
│   ├── Istatistikler.js         # KPI grafikler
│   ├── VeliRaporlari.js         # Koçun veli raporu yazma ekranı
│   └── OgrenciDetay.js          # 6 sekmeli öğrenci detay sayfası
│
├── ogrenci/            # Öğrenci paneli bileşenleri
│   ├── deneme/         # DenemeModal, DenemeKart, BransBolum, GrafikModal
│   ├── BugunProgramKart.js      # Öğrencinin günlük programı + tamamlama işaretleri
│   ├── MufredatGoruntule.js     # Konu takip ekranı
│   ├── GunlukSoruFormu.js       # Günlük soru girişi
│   └── KocNotlari.js            # Koçtan gelen notlar (öğrenci görünümü)
│
├── admin/              # Yönetici paneli bileşenleri
│   ├── KocPerformansPaneli.js   # Koç skor algoritması ile performans tablosu
│   ├── CanliOperasyonPaneli.js  # Canlı sistem izleme
│   ├── SistemDurumuPaneli.js    # Web vitals + hata logları
│   └── YasamDongusuSayfasi.js  # Öğrenci yaşam döngüsü yönetimi
│
├── veli/               # Veli paneli bileşenleri
│   ├── VeliAnaSayfa.js          # Çalışma özeti + koç raporu
│   ├── VeliKartlari.js          # OgrenciDurumKart, CalismaOzet
│   └── KocRaporu.js             # Haftalık koç raporu görüntüleme + WhatsApp/PDF
│
├── components/         # Paylaşılan genel bileşenler
│   ├── Shared.js               # Card, Btn, Input, Avatar, EmptyState vb. — temel UI kütüphanesi
│   ├── BildirimSistemi.js       # In-app bildirim oluşturma + okuma
│   ├── VideoGorusme.js          # Agora RTC görüntülü görüşme (1.5MB chunk — lazy loaded)
│   ├── Toast.js                 # Anlık bildirim toast'ları
│   └── ErrorBoundary.js         # Chunk hatalarında otomatik reload
│
├── context/
│   ├── AuthContext.js           # kullanici, rol, userData, yukleniyor, cikisYap
│   ├── ThemeContext.js          # s (stil objesi), tema değiştirme
│   └── KocContext.js            # Koç paneli veri context'i (ogrenciler, dashboardMap vb.)
│
├── utils/
│   ├── programAlgoritma.js      # Haftalık program otomatik oluşturma + slot mantığı
│   ├── ogrenciBaglam.js         # Öğrenci segmentasyon çözücüsü (tur → ders seti, program modu)
│   ├── kocSkorUtils.js          # Koç performans skoru algoritması (494 satır)
│   ├── sinavUtils.js            # turBelirle(), turdenBransDersler()
│   ├── ogrenciUtils.js          # SINAV_TAKVIMI, calculateStreak, generateSuggestions
│   ├── izleme.js                # logIstemciHatasi, logPerformansMetriği → Firestore'a yazar
│   ├── auditLog.js              # Admin işlem logu
│   └── tarih.js                 # Tarih yardımcıları
│
├── data/
│   ├── konular.js               # TYT/AYT/LGS konu ağaçları + netHesapla
│   └── konularTyt/Ayt/Lgs.js   # Konu verileri — bölünmüş modüller
│
├── themes/themes.js             # Dark/light + özel tema renk tanımları
├── firebase.js                  # Firebase init (auth, db, secondaryAuth)
└── App.js                       # Routing + lazy loading + ErrorBoundary

functions/
├── index.js            # initializeApp + tüm modülleri re-export eder (~20 satır)
├── kullanici.js        # kullaniciOlustur, pasifYap, rolDegistir, kocAta vb.
├── aggregate.js        # deneme/calisma/rutin aggregate güncelleyiciler
├── mesaj.js            # mesajOkunmamisArt, mesajOkunduAzalt
├── bildirim.js         # FCM push gönderici, eskiBildirimleriSil
├── zamanlama.js        # riskSkoreHesapla (gece 03:00), gunlukAlanlariSifirla
├── medya.js            # Agora token üretimi, playlist yönetimi, goruntulReddet
└── helpers.js          # Ortak yardımcılar: arayaniBul, adminKontrol, logYaz vb.
```

---

## Kritik Veri Akışları

### 1. Kullanıcı Girişi
```
GirisEkrani → Firebase Auth (email/şifre)
→ AuthContext: kullanicilar/{uid} oku → rol belirle
→ rol'e göre yönlendir: /koc | /ogrenci | /veli | /admin
```

### 2. Haftalık Program (koç yazar, öğrenci okur)
```
Koç: HaftalikProgram → useHaftalikProgram.kaydet()
  → setDoc(ogrenciler/{id}/program_v2/{hafta}, { hafta: ... }, { merge: true })
  ⚠ merge:true zorunlu — öğrencinin tamamlandi işaretleri korunmalı

Öğrenci: BugunProgramKart → getDoc(ogrenciler/{id}/program_v2/{hafta})
  → togglTamamla → setDoc({ tamamlandi: ... }, { merge: true })
  ⚠ merge:true zorunlu — koçun hafta verisi korunmalı

Kural: hafta alanı koça ait, tamamlandi alanı öğrenciye ait — birbirine dokunmazlar
```

### 3. Deneme Girişi ve Aggregate
```
Öğrenci/Koç: DenemeModal → ogrenciler/{id}/denemeler'e yaz
→ CF denemeAggregateGuncelle tetiklenir
→ ogrenciler/{id}.sonDenemeNet + sonDenemeTarih güncellenir
→ CF denemeKonuTakipYaz: konu_takip koleksiyonu güncellenir
```

### 4. Risk Skoru
```
CF riskSkoreHesapla → her gece 03:00 çalışır (scheduled)
→ tüm aktif öğrenciler için risk puanı hesaplar
→ ogrenciler/{id}.riskDurumu + riskPuan güncellenir
→ CanliOperasyonPaneli bu değeri gösterir
```

### 5. Koç Performans Skoru
```
KocPerformansPaneli → computeCoachPerformance(koc, ogrenciler)
→ kocSkorUtils.js: 4 boyut: Gelişim %35, Düzen %30, Müdahale %25, Operasyon %10
→ Başlangıç netine göre kalibrasyon uygulanır
→ Sadece frontend hesaplama — Firestore'a yazılmaz
```

---

## Önemli Tasarım Kararları

### `tur` alanı iki yerde yaşar
```
ogrenciler/{uid}.tur       ← KAYNAK GERÇEK (CF ogrenciDokuman ile yazılır)
kullanicilar/{uid}.tur     ← KOPYA (CF + OgrenciDuzenleModal senkronize eder)
```
Bileşenlerde her zaman `ogrenciTur || userData?.tur` kullan — eski öğrenciler için fallback gerekli.

### Lazy Loading Stratejisi
`App.js` tüm sayfa bileşenlerini `React.lazy` ile yükler.
`VideoGorusme` (1.5MB Agora SDK) ayrı chunk — video görüşme ekranına girilmeden indirilmez.
Vendor chunk'lar: `vendor-firebase` (534kB), `vendor-recharts` (377kB), `vendor-react` (179kB).

### Firestore Cache
`memoryLocalCache()` bilerek kapalı. Tüm okumalar network'ten gelir.

### secondaryAuth
Admin yeni kullanıcı oluştururken kendi oturumunu kaybetmemek için `secondaryAuth` kullanılır (`firebase.js`).

---

## Güvenlik Mimarisi

### Firestore Rules
`firestore.rules` — koleksiyon bazında erişim kontrolü:
- `kullanicilar`: sadece kendi dokümanını okuyabilir
- `ogrenciler`: koç kendi öğrencilerini yönetir, öğrenci sadece kendini okur, veli sadece bağlı olduğu öğrenciyi
- `ogrenciler/{id}/program_v2`: öğrenci sadece `tamamlandi` alanını güncelleyebilir
- `bildirimler`: sadece alıcı okuyabilir

### Cloud Functions Auth
Callable functions (`onCall`) otomatik olarak Firebase Auth doğrulaması yapar.
`request.auth` üzerinden uid ve rol kontrol edilir.

### Bilinen Açıklar (ROADMAP'te)
- `goruntulReddet` endpoint'i `onRequest` ile public — auth yok (GÜVENLİK-2)
- `AGORA_APP_CERT` kodda gömülü, `functions/.env`'e taşınmalı (GÜVENLİK-1)
- Firebase App Check henüz aktif değil

---

## Test Altyapısı

**Toplam:** 29 test dosyası, 1096 test — tamamı yeşil

```
npm test                # tüm frontend testleri
npm run test:coverage   # v8 coverage raporu
npm run test:cf         # Cloud Functions testleri
npm run test:rules      # Firestore rules testleri (Java + emülatör gerekli)
```

### Test Dosyası → Kaynak Eşleşmesi

| Değişen dosya | Test dosyası |
|---|---|
| `src/utils/*` | `yeni_testler_utils.test.js` veya `yeni_testler_utils2.test.js` |
| `src/components/*` | `yeni_testler_bilesenleri.test.js` veya `yeni_testler_bilesenleri3.test.js` |
| `src/admin/*` | `yeni_testler_admin.test.js` |
| `src/koc/ui/*` | `yeni_testler_koc_ui.test.js` |
| `src/koc/hedef/*` | `yeni_testler_hedef_ogrenci.test.js` |
| `src/koc/*.js` | `koc_agir_bilesenleri.test.js` veya `koc_hafif_bilesenleri.test.js` |
| `src/ogrenci/*` | `yeni_testler_hedef_ogrenci.test.js` |
| `src/pages/*` | `yeni_testler_sayfalar.test.js` |
| `src/context/*` | `yeni_testler_auth_modal.test.js` |
| `src/hooks/*` | `yeni_testler_hooks_bilesenleri.test.js` |

### Mock Altyapısı (`src/__tests__/setup.js`)
- Firebase (Firestore, Auth, Functions, FCM) tamamen mock'lu
- `useTheme()` → `s` Proxy nesnesi döndürür (her alan `#cccccc`)
- `useAuth()` → `{ kullanici: { uid: 'test-uid' }, rol: 'koc', userData: {...} }`
- recharts bileşenleri → basit `<div>` wrapper'ları
- `vi.unmock('../context/AuthContext')` kullanan test dosyalarında gerçek AuthContext çalışır → `AuthProvider` wrapper gerekli

---

## Dosya Boyutu Kuralları (CLAUDE.md'den)

| Tür | Limit |
|---|---|
| Bileşen dosyası | 250 satır |
| Sayfa dosyası (pages/) | 300 satır |
| Utility / hook | 200 satır |
| Veri / sabit | 400 satır |
| Test | Sınırsız |

Limit aşan dosyalar `BilesenAna.js` + `BilesenUtils.js` + `BilesenAlt.js` şemasıyla bölünür.

### Şu An Limit Aşan Dosyalar
| Dosya | Satır | Öncelik |
|---|---|---|
| `admin/CanliOperasyonPaneli.js` | 496 | 🟡 |
| `utils/kocSkorUtils.js` | 494 | 🟡 |
| `koc/ProgramOlustur.js` | 493 | 🟡 |
| `ogrenci/GunlukSoruFormu.js` | 480 | 🟡 |
| `koc/gunluk/BugunProgrami.js` | 478 | 🟡 |
| `pages/YoneticiPaneli.js` | 462 | 🟡 |
| `koc/DenemeYonetimi.js` | 454 | 🟡 |
| `components/VideoGorusme.js` | 446 | 🟡 |
| `ogrenci/OgrenciNav.js` | 438 | 🟡 |

---

## Bilinen Teknik Borçlar

1. **Inline style yoğunluğu** — tüm stilleme `style={{ ... }}` ile yapılmış, CSS modülü veya styled-components yok
2. **N+1 Firestore okuma** — `useKocVeri.js` her öğrenci için ayrı `program_v2` + deneme sorgusu yapıyor; 50+ öğrencide sorun çıkarır
3. **console.warn/error temizliği** — üretimde kontrolsüz log izi var, `izleme.js` kullanımı tutarsız
4. **App Check aktif değil** — yetkisiz uygulamaların Firestore'a erişimini engellemez
5. **`goruntulReddet` auth yok** — bkz. Güvenlik Mimarisi
