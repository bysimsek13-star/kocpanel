# ElsWay — Koçluk Yönetim Platformu

LGS ve YKS'ya hazırlanan öğrenciler için koç, öğrenci, veli ve admin panellerinden oluşan gerçek zamanlı koçluk takip sistemi.

**Canlı:** https://kocpaneli.web.app

---

## Teknoloji

- **Frontend:** React 18 + Vite
- **Backend / DB:** Firebase Firestore
- **Auth:** Firebase Authentication
- **Fonksiyonlar:** Firebase Cloud Functions (europe-west1)
- **Hosting:** Firebase Hosting
- **Bildirim:** Firebase Cloud Messaging (FCM)
- **Görüntülü görüşme:** Agora RTC

---

## Geliştirme

```bash
npm install
npm run dev        # geliştirme sunucusu (localhost:5173)
npm test           # Vitest test suite
npm run build      # production build
firebase deploy    # hosting + functions deploy
```

### Cloud Functions

```bash
cd functions
npm install
npm run test:cf    # CF unit testleri
```

---

## Ortam Değişkenleri

Proje kökünde `.env.local` dosyası oluştur (`.env` şablonuna bak):

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_RECAPTCHA_SITE_KEY=...
```

`functions/.env` dosyasında:

```
AGORA_APP_ID=...
AGORA_APP_CERT=...
GEMINI_API_KEY=...
```

**Hiçbir secret dosyasını commit'leme.** `.gitignore` bu dosyaları zaten dışlamaktadır.

---

## Kullanıcı Rolleri

| Rol | Panel | Yetkiler |
|---|---|---|
| `admin` | YoneticiPaneli | Tüm koç/öğrenci yönetimi, sistem durumu, audit log |
| `koc` | KocPaneli | Öğrenci takibi, program, deneme, veli raporu |
| `ogrenci` | OgrenciPaneli | Program görüntüleme, rutin, deneme, mesaj |
| `veli` | VeliPaneli | Öğrenci durumu izleme, koç raporu okuma |

---

## Proje Yapısı

Detaylı mimari ve geliştirme notları için `CLAUDE.md` ve `ROADMAP_AI.md` dosyalarına bak.

---

## Test

```bash
npm test                  # tüm frontend testleri (Vitest)
npm run test:coverage     # coverage raporu
npm run test:cf           # Cloud Functions testleri
```

Firestore Rules testleri için Java gereklidir:

```bash
npm run test:rules        # Firebase emülatör üzerinde rules testleri
```
