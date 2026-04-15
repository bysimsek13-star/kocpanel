/**
 * programAlgoritma.js
 * Haftalık program öneri motoru.
 *
 * Görevler:
 *   1. Geçmiş günlerdeki eksik/kısmi görevleri tespit et
 *   2. Kalan günlerin kapasitesini hesapla
 *   3. Koça uygulanabilir öneriler üret
 *   4. Koç onaylarsa programı güncelle
 */

export const GUNLER = ['pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi', 'pazar'];
export const GUN_ETIKET = {
  pazartesi: 'Pazartesi',
  sali: 'Salı',
  carsamba: 'Çarşamba',
  persembe: 'Perşembe',
  cuma: 'Cuma',
  cumartesi: 'Cumartesi',
  pazar: 'Pazar',
};

/** Bu haftanın Pazartesi tarihini döner (YYYY-MM-DD) */
export function haftaBaslangici(tarih = new Date()) {
  const d = new Date(tarih);
  const gun = d.getDay();
  const fark = (gun + 6) % 7;
  d.setDate(d.getDate() - fark);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Bugünün haftadaki indeksini döner (0=Pazartesi, 6=Pazar) */
export function bugunIndeks(tarih = new Date()) {
  return (tarih.getDay() + 6) % 7;
}

/** Gün adından indeks döner */
export function gunIndeks(gunAdi) {
  return GUNLER.indexOf(gunAdi);
}

/**
 * Bir günün görevlerini analiz eder.
 * Döner: { toplam, tamamlandi, eksik, kismiGorevler }
 */
export function gunAnalizi(gorevler = []) {
  const toplam = gorevler.length;
  const tamamlandi = gorevler.filter(g => g.tamamlandi === true).length;
  const eksik = gorevler.filter(g => !g.tamamlandi);
  const kismiGorevler = gorevler.filter(
    g => !g.tamamlandi && g.kismiOran != null && g.kismiOran > 0
  );
  return { toplam, tamamlandi, eksik, kismiGorevler };
}

/**
 * Haftalık programı analiz eder.
 * Geçmiş günlerdeki eksikleri bulur, kalan günleri listeler.
 *
 * @param {object} programDoc - Firestore'dan gelen program dokümanı
 * @param {Date} simdi - Şu anki zaman (test için override edilebilir)
 * @returns {{ eksikGorevler, kalanGunler, gecmisAnaliz }}
 */
export function haftaAnalizi(programDoc, simdi = new Date()) {
  const gunler = programDoc?.gunler || {};
  const bugun = bugunIndeks(simdi);

  const gecmisAnaliz = [];
  const eksikGorevler = [];
  const kalanGunler = [];

  GUNLER.forEach((gunAdi, i) => {
    const gorevler = gunler[gunAdi] || [];
    const analiz = gunAnalizi(gorevler);

    if (i < bugun) {
      // Geçmiş gün
      gecmisAnaliz.push({ gun: gunAdi, ...analiz });
      if (analiz.eksik.length > 0) {
        analiz.eksik.forEach(gorev => {
          eksikGorevler.push({ ...gorev, kaynakGun: gunAdi });
        });
      }
    } else if (i > bugun) {
      // Gelecek gün — kapasiteye dahil et
      kalanGunler.push({ gun: gunAdi, mevcutSayi: gorevler.length });
    }
    // Bugün (i === bugun) → öneriye dahil edilmez, koç zaten takip ediyor
  });

  return { eksikGorevler, kalanGunler, gecmisAnaliz };
}

/**
 * Eksik görevleri kalan günlere dağıt.
 * Mümkün olduğunca eşit dağıtır, günlük max 8 görev aşılmaz.
 *
 * @returns {Array<{ gun, eklenecek: [] }>} - Her kalan gün için önerilen eklemeler
 */
const GUNLUK_MAX = 8;

export function oneriUret(eksikGorevler = [], kalanGunler = []) {
  if (!eksikGorevler.length || !kalanGunler.length) return [];

  // Kalan kapasite hesapla
  const kapasiteli = kalanGunler.map(g => ({
    ...g,
    kapasite: Math.max(0, GUNLUK_MAX - g.mevcutSayi),
    eklenecek: [],
  }));

  const toplamKapasite = kapasiteli.reduce((acc, g) => acc + g.kapasite, 0);

  // Dağıtılacak görevler (kapasiteyi aşarsa en kritikleri al)
  const dagitilacak = eksikGorevler.slice(0, toplamKapasite);

  let gorevIndex = 0;
  for (const gun of kapasiteli) {
    while (gun.eklenecek.length < gun.kapasite && gorevIndex < dagitilacak.length) {
      gun.eklenecek.push(dagitilacak[gorevIndex]);
      gorevIndex++;
    }
    if (gorevIndex >= dagitilacak.length) break;
  }

  // Sadece eklenecek görevi olan günleri döndür
  return kapasiteli.filter(g => g.eklenecek.length > 0);
}

/**
 * Koça sunulacak öneri özetini oluşturur.
 *
 * @returns {{
 *   var: boolean,
 *   eksikSayisi: number,
 *   dagitilamayan: number,
 *   oneriler: Array,
 *   ozet: string
 * }}
 */
export function oneriOzeti(programDoc, simdi = new Date()) {
  const { eksikGorevler, kalanGunler } = haftaAnalizi(programDoc, simdi);

  if (!eksikGorevler.length) {
    return { var: false, eksikSayisi: 0, dagitilamayan: 0, oneriler: [], ozet: '' };
  }

  const oneriler = oneriUret(eksikGorevler, kalanGunler);
  const dagitilan = oneriler.reduce((acc, o) => acc + o.eklenecek.length, 0);
  const dagitilamayan = eksikGorevler.length - dagitilan;

  const ozet =
    dagitilamayan > 0
      ? `${eksikGorevler.length} eksik görev var. ${dagitilan} tanesi kalan günlere dağıtılabilir, ${dagitilamayan} tanesi bu haftaya sığmıyor.`
      : `${eksikGorevler.length} eksik görev ${oneriler.length} güne dağıtılabilir.`;

  return {
    var: true,
    eksikSayisi: eksikGorevler.length,
    dagitilamayan,
    oneriler,
    ozet,
  };
}

/**
 * Koç öneriyi onayladığında programı günceller.
 * Yeni görevleri ilgili günlere ekler, kaynak günden kaldırır.
 *
 * @param {object} programDoc - Mevcut program dokümanı
 * @param {Array} oneriler - oneriUret() çıktısı
 * @returns {object} - Güncellenmiş gunler objesi (Firestore'a yazılacak)
 */
export function oneriUygula(programDoc, oneriler) {
  const gunler = JSON.parse(JSON.stringify(programDoc?.gunler || {}));

  // Taşınan görevlerin id'lerini kaynak günden kaldır
  const tasinanIdler = new Set(oneriler.flatMap(o => o.eklenecek.map(g => g.id).filter(Boolean)));

  GUNLER.forEach(gunAdi => {
    if (gunler[gunAdi]) {
      gunler[gunAdi] = gunler[gunAdi].filter(g => !tasinanIdler.has(g.id));
    }
  });

  // Hedef günlere ekle (kaynak gün bilgisini temizle)
  oneriler.forEach(({ gun, eklenecek }) => {
    if (!gunler[gun]) gunler[gun] = [];
    eklenecek.forEach(gorev => {
      const { kaynakGun, ...temizGorev } = gorev;
      gunler[gun].push({
        ...temizGorev,
        tamamlandi: false,
        kismiOran: null,
        tasindiGun: kaynakGun, // nereden geldiği bilgisi (opsiyonel)
      });
    });
  });

  return gunler;
}

/**
 * Boş bir haftalık program dokümanı oluşturur.
 */
export function bosHaftaOlustur(haftaKey) {
  const gunler = {};
  GUNLER.forEach(gun => {
    gunler[gun] = [];
  });
  return { hafta: haftaKey, gunler };
}

/**
 * Haftalık ilerleme yüzdesini döner (eski program formatı).
 */
export function haftaIlerleme(programDoc) {
  const gunler = programDoc?.gunler || {};
  let toplam = 0;
  let tamamlandi = 0;
  GUNLER.forEach(gun => {
    const gorevler = gunler[gun] || [];
    toplam += gorevler.length;
    tamamlandi += gorevler.filter(g => g.tamamlandi).length;
  });
  return toplam === 0 ? 0 : Math.round((tamamlandi / toplam) * 100);
}

/**
 * program_v2 dokümanından ilerleme yüzdesini hesaplar.
 * { hafta: { pazartesi: [{tip,...},...], ... }, tamamlandi: { 'pazartesi_0': true, ... } }
 */
export function haftaIlerlemeV2(programDoc) {
  const hafta = programDoc?.hafta || {};
  const tam = programDoc?.tamamlandi || {};
  let toplam = 0;
  let tamamlanan = 0;
  GUNLER.forEach(gun => {
    (hafta[gun] || []).forEach((slot, i) => {
      if (slot?.tip) {
        toplam++;
        if (tam[`${gun}_${i}`]) tamamlanan++;
      }
    });
  });
  return toplam === 0 ? 0 : Math.round((tamamlanan / toplam) * 100);
}

/**
 * program_v2 dokümanını haftalikOzetOlustur ile uyumlu görev dizisine çevirir.
 */
export function programV2ToGorevler(programDoc) {
  if (!programDoc) return [];
  const hafta = programDoc.hafta || {};
  const tam = programDoc.tamamlandi || {};
  const gorevler = [];
  GUNLER.forEach(gun => {
    (hafta[gun] || []).forEach((slot, i) => {
      if (slot?.tip) {
        gorevler.push({ tamamlandi: tam[`${gun}_${i}`] || false });
      }
    });
  });
  return gorevler;
}
