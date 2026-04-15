# ElsWay — Proje Tanım Dosyası

Bu dosya, ElsWay uygulamasını yapay zeka asistanlara tanıtmak için yazılmıştır.
Kod üzerinde çalışmadan önce bu dosyayı oku.

---

## Uygulama Nedir?

**ElsWay**, Türkiye'deki LGS ve YKS sınavlarına hazırlanan öğrenciler için geliştirilmiş
bir koçluk yönetim platformudur. Koçlar öğrencilerini takip eder, veliler süreci izler,
yönetici sistemi yönetir.

- **Canlı URL:** https://kocpaneli.web.app
- **Firebase Projesi:** `kocpaneli`
- **İç repo adı:** `kocpanel` (npm/package.json adı: `elsway`)

---

## Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Frontend | React 18 (Vite) |
| Routing | React Router v7 (react-router-dom 7.x) |
| Backend / DB | Firebase Firestore |
| Auth | Firebase Authentication |
| Hosting | Firebase Hosting |
| Fonksiyonlar | Firebase Cloud Functions |
| Bildirim | Firebase Cloud Messaging (FCM) |
| Build | `npm run build` (Vite) |
| Deploy | `firebase deploy` |

---

## Kullanıcı Rolleri ve Panelleri

### 1. `admin` → `YoneticiPaneli.js`
- Tüm koç ve öğrencileri yönetir
- Koç ekleme/atama, öğrenci düzenleme
- Koç performans paneli (ağırlıklı skorlama algoritması)
- Canlı operasyon paneli, audit log, sistem durumu
- Yaşam döngüsü sayfası, müfredat yönetimi

### 2. `koc` → `KocPaneli.js`
- Öğrenci listesi, filtreleme, öğrenci detay
- Haftalık program oluşturma (slot sistemi)
- Günlük takip (rutin giriş formu)
- Deneme yönetimi (TYT/AYT/LGS net girişi)
- Hedef takibi, istatistikler
- Veli raporları yazma
- Mesajlaşma (koç ↔ öğrenci, koç ↔ veli)
- Kitap/video kütüphane, playlist yönetimi
- Duyuru merkezi, günün sözü
- Toplu işlemler

### 3. `ogrenci` → `OgrenciPaneli.js`
- Ana sayfa: KPI serit, bugünün programı, geri sayım, günlük rutin
- Deneme listesi (genel + branş, grafik analizi)
- Mesajlar (koçtan gelen)
- Müfredat görüntüleme
- Çalışma kaydı, koç notları
- Video görüşme

### 4. `veli` → `VeliPaneli.js`
- Öğrencinin çalışma durumunu görme
- Koç raporu okuma
- Veli mesajları, program görüntüleme

---

## Klasör Yapısı

```
src/
├── pages/          # Rota entry point'leri (lazy load edilir)
│   ├── GirisEkrani.js
│   ├── KocPaneli.js
│   ├── OgrenciPaneli.js
│   ├── VeliPaneli.js
│   ├── VeliMesajlar.js
│   ├── VeliProgram.js
│   └── YoneticiPaneli.js
│
├── koc/            # Koç paneli bileşenleri ve sayfaları
│   ├── ui/         # KocTopBar, KocSolMenu, KocAltTabBar, KocSabahEkrani vb.
│   ├── gunluk/     # BugunProgrami, GunlukIlerlemePano, OgrenciRutinKarti vb.
│   ├── hedef/      # HedefEkleModal, OgrenciHedefKarti, hedefUtils vb.
│   ├── hooks/      # useKocVeri, useOkunmamis
│   ├── HaftalikProgram.js   # Haftalık slot programı ana bileşeni
│   ├── ProgramBilesenleri.js # TIPLER_NEON, SlotModal, GunKolonu
│   ├── VideoIzleModal.js
│   ├── OgrenciDetay.js
│   ├── DenemeYonetimi.js
│   └── ... (diğer sayfalar)
│
├── ogrenci/        # Öğrenci paneli bileşenleri
│   ├── deneme/     # DenemeModal, DenemeKart, BransBolum, DersKarti, GrafikModal
│   ├── AnaSayfaKartlari.js
│   ├── BugunProgramKart.js
│   ├── GeriSayimKart.js
│   ├── GunlukRutinKart.js
│   ├── DenemeListesi.js
│   ├── OgrenciNav.js       # PATHS, BASLIK, SolMenu, AltTabBar
│   └── ...
│
├── admin/          # Yönetici paneli bileşenleri
│   ├── KocPerformansPaneli.js
│   ├── SistemDurumuPaneli.js
│   ├── CanliOperasyonPaneli.js
│   └── ...
│
├── veli/
│   └── VeliKartlari.js     # CalismaOzet, KocRaporu
│
├── components/     # Paylaşılan genel bileşenler
│   ├── Shared.js            # Card, Btn, Input, Avatar, LoadingState, EmptyState vb.
│   ├── ErrorBoundary.js     # Chunk hatalarında otomatik reload yapar
│   ├── BildirimSistemi.js
│   ├── Toast.js
│   ├── TemaSecici.js
│   ├── VideoGorusme.js
│   └── ...
│
├── context/
│   ├── AuthContext.js       # kullanici, rol, userData, yukleniyor, cikisYap
│   └── ThemeContext.js      # s (style objesi), tema değiştirme
│
├── utils/
│   ├── sinavUtils.js        # turBelirle(), turdenBransDersler()
│   ├── ogrenciUtils.js      # SINAV_TAKVIMI, upcomingExams, calculateStreak, generateSuggestions vb.
│   ├── kocSkorUtils.js      # computeCoachPerformance(), coachScoreMeta() — koç performans algoritması
│   ├── programAlgoritma.js  # Haftalık program otomatik oluşturma
│   ├── tarih.js             # Tarih yardımcıları
│   ├── aktiflikKaydet.js    # Son aktiflik zamanını Firestore'a yazar
│   ├── readState.js         # Mesaj okundu/okunmadı durumu
│   ├── auditLog.js          # Admin işlem logu
│   ├── izleme.js            # Hata loglama (logIstemciHatasi, logPerformansMetriği)
│   └── ...
│
├── data/
│   └── konular.js           # TYT_DERSLER, AYT_DERSLER, AYT_SAY/EA/SOZ/DIL, KONULAR, netHesapla, renkler
│
├── constants/
│   └── slotTipleri.js       # SLOT_TIPLERI (haftalık program slot türleri: neonRenk, neonAcik)
│
├── hooks/
│   ├── useMediaQuery.js     # useMobil(), useTablet()
│   └── usePlaylist.js
│
├── themes/
│   └── themes.js            # Tema renk tanımları
│
├── firebase.js              # Firebase init (auth, db, secondaryAuth)
├── App.js                   # Routing + lazy loading + ErrorBoundary
└── index.js
```

---

## Önemli Teknik Detaylar

### Tema Sistemi
- `useTheme()` hook'u `s` objesini döndürür
- Tüm renk/stil değerleri `s.text`, `s.bg`, `s.surface`, `s.accent`, `s.border` gibi
- Dark/light ve birçok özel tema desteklenir

### Auth
- `useAuth()` → `{ kullanici, rol, userData, yukleniyor, cikisYap }`
- `rol`: `'admin'` | `'koc'` | `'ogrenci'` | `'veli'` | `'unauthorized'`
- Firestore'da kullanıcı dokümanı `kullanicilar/{uid}` koleksiyonunda

### Sınav Türleri (`userData.tur`)
- `'lgs'`, `'ortaokul'` → LGS öğrencisi
- `'tyt'` → Sadece TYT
- `'sayisal'`, `'ea'`, `'sozel'`, `'dil'` → TYT + AYT (ilgili alan)
- `turBelirle(tur)` → `'lgs'` | `'ortaokul'` | `'yks'` döndürür

### Haftalık Program Slot Sistemi
- `SLOT_TIPLERI` → `src/constants/slotTipleri.js`
- `TIPLER_NEON` = SLOT_TIPLERI map'i: `neonRenk → renk`, `neonAcik → acikRenk`
- Günler: `['pazar','pazartesi','sali','carsamba','persembe','cuma','cumartesi']`
- `HAFTA_BAZ`: o haftanın pazartesi tarihi (ISO string)

### Koç Performans Skoru
- `computeCoachPerformance(koc, ogrenciler)` → `src/utils/kocSkorUtils.js`
- Ağırlıklar: Gelişim %35, Düzen %30, Müdahale %25, Operasyon %10
- Başlangıç netine göre kalibrasyona alınan öğrenciler ayrı işlenir

### Lazy Loading & Chunk Hatası
- `App.js` tüm sayfa bileşenlerini `React.lazy` ile yükler
- `ErrorBoundary` chunk load hatalarını yakalar, otomatik `location.reload()` yapar
- Sonsuz döngü koruması: `sessionStorage['chunk_reload_ts']` (15s bekleme)

### Dil
- Tüm kodda değişken/fonksiyon adları **Türkçe** yazılmıştır
- Yorum satırları Türkçe
- Bu bir stil tercihi, değiştirme

---

## Sık Kullanılan Firestore Koleksiyonları

| Koleksiyon | İçerik |
|---|---|
| `kullanicilar` | Tüm kullanıcılar (rol, isim, tur, kocId, aktif vb.) |
| `ogrenciler` | Öğrenci ana dokümanları + alt koleksiyonlar |
| `ogrenciler/{id}/calisma` | Günlük çalışma kayıtları |
| `ogrenciler/{id}/denemeler` | TYT/AYT/LGS deneme sonuçları |
| `ogrenciler/{id}/program_v2` | Slot bazlı haftalık programlar |
| `ogrenciler/{id}/mesajlar` | Koç-öğrenci mesajları |
| `ogrenciler/{id}/hedefler` | Öğrenci hedefleri |
| `ogrenciler/{id}/veliRaporlari` | Koçun haftalık öğrenci raporları |
| `bildirimler` | Uygulama içi bildirimler |
| `auditLog` | Admin işlem geçmişi |
| `istemciHataKayitlari` | Frontend hata logları |
| `goruntulu` | Video görüşme oturumları |
| `playlists` | Koç playlist'leri |
| `kutuphane` | Kitap/video kütüphane içerikleri |
| `destekTalepleri` | Destek/silme talepleri |

---

## Root `ogrenciler` Summary Şeması

`ogrenciler/{id}` dokümanındaki özet alanlar — her birinin tek sahibi (owner) ve okuyucuları bellidir.

| Alan | Owner | Ne zaman güncellenir | Okuyucular |
|---|---|---|---|
| `sonDenemeNet` | CF `denemeAggregateGuncelle` + client `DenemeModal` (rules ile sınırlı) | Yeni deneme kaydında | KocPerformansPaneli, OgrenciPaneli, CanliOperasyonPaneli |
| `sonDenemeTarih` | CF `denemeAggregateGuncelle` + client `DenemeModal` | Yeni deneme kaydında | KocPerformansPaneli, OgrenciPaneli |
| `toplamCalismaGunu` | CF `calismaAggregateGuncelle` | Çalışma eklenince/silinince | OgrenciPaneli, KocPerformansPaneli |
| `sonCalismaTarihi` | CF `calismaAggregateGuncelle` | Çalışma eklenince | OgrenciPaneli, CanliOperasyonPaneli |
| `bugunCalismaSaat` | CF `calismaAggregateGuncelle` + CF `gunlukAlanlariSifirla` (gece sıfırlar) | Çalışma yazılınca | OgrenciPaneli, KocPaneli günlük takip |
| `bugunRutinTarihi` | CF `rutinAggregateGuncelle` | Rutin yazılınca | `GunlukRutinKart` tarih karşılaştırması |
| `bugunSoruTarihi` | CF `gunlukSoruAggregateGuncelle` | Günlük soru yazılınca | `GunlukSoruFormu` tarih karşılaştırması |
| `okunmamisMesajSayisi` | CF `mesajOkunmamisArt` (++) / `mesajOkunduAzalt` (--) | Mesaj gönderilince / okunca | KocPaneli öğrenci listesi badge |
| `riskDurumu` | CF `riskSkoreHesapla` (scheduled, gece 03:00) | Günlük | CanliOperasyonPaneli, KocPerformansPaneli |
| `riskPuan` | CF `riskSkoreHesapla` | Günlük | KocPerformansPaneli |

**Kural:** Yukarıdaki alanları client kodu yazmak istiyorsa `firestore.rules` allow list'inde açıkça izin verilmeli ve roadmap Faz 12 kararına uygun olmalı.

---

## Geliştirme Notları

- `npm run build` — Vite ile production build (`build/` klasörüne)
- `firebase deploy` — build + hosting deploy
- `secondaryAuth` — admin yeni kullanıcı oluştururken mevcut oturumu kaybetmemek için kullanılır
- `memoryLocalCache()` — Firestore offline cache kapalı (bilerek)
## Dosya Boyutu Kuralları (İhlal Edilemez)

| Dosya türü | Maksimum |
|---|---|
| Bileşen dosyaları | 250 satır |
| Sayfa dosyaları (pages/) | 300 satır |
| Utility / hook dosyaları | 200 satır |
| Veri / sabit dosyaları | 400 satır |
| Test dosyaları | Sınırsız |

Satır sayısından bağımsız olarak: "Bu dosya tek bir şey mi yapıyor?"
Cevap hayırsa — böl.

Bölme şablonu:
- `BilesenAna.js`       — render + state
- `BilesenUtils.js`     — saf fonksiyonlar
- `BilesenAlt.js`       — bağımsız alt bileşenler
- `bilesenSabitleri.js` — sabitler

Her görev başında:
  wc -l src/**/*.js src/**/**/*.js | sort -rn | head -15
Limit aşan dosyaya dokunmadan önce böl.

## Kod Kalite Standardı

Pre-commit hook (Husky) her commit öncesi otomatik çalışır:

```
npm run lint          # ESLint, max-warnings 0
npm run format:check  # Prettier format kontrolü
```

Manuel çalıştırma:
- `npm run lint:fix` — ESLint otomatik düzelt
- `npm run format` — Prettier otomatik formatla

Kural: Lint veya format hatası olan kod commit edilemez.

## Test Kuralı (İhlal Edilemez)

Her görevde şu adımlar zorunludur:

1. Görevi tamamla
2. `npm test` çalıştır
3. Kırmızı test varsa düzelt — bitirmeden bir sonraki adıma geçme
4. Değiştirdiğin veya eklediğin her dosya için ilgili test dosyasına en az 1 yeni test ekle:
   - Yeni bileşen → render testi
   - Yeni fonksiyon → girdi/çıktı testi
   - Bug fix → o bug'u yakalayan regresyon testi
5. Tekrar `npm test` — hepsi yeşil olunca görev biter

Test yoksa görev tamamlanmış sayılmaz.
