/**
 * dersOzetiUtils.js
 * konu_takip koleksiyonunu okuyarak ders bazlı ve genel özet üretir.
 * Firestore'a yazmaz — sadece hesaplar.
 */

/**
 * konu_takip dökümanları listesinden ders bazlı özet üretir.
 *
 * @param {Array} konuTakipListesi - konu_takip koleksiyonundaki tüm dokümanlar
 * @param {Array} mufredatDersler  - öğrencinin müfredat ders listesi [{id, label}]
 * @returns {{ dersBazliOzet: Object, genelOzet: Object }}
 */
export function dersOzetiHesapla(konuTakipListesi = [], mufredatDersler = []) {
  const dersler = {};

  konuTakipListesi.forEach(konu => {
    const { dersId } = konu;
    if (!dersId) return; // dersId olmayan kayıtları (koç manuel toggle) atla
    if (!dersler[dersId]) {
      dersler[dersId] = {
        dersId,
        konular: [],
        toplamVideoSaat: 0,
        toplamSoruSayisi: 0,
        tamamlananKonu: 0,
        toplamKonu: 0,
        tekrarBekleyenKonu: 0,
        hicCalisilmadi: false,
      };
    }

    const ders = dersler[dersId];
    ders.konular.push(konu);
    ders.toplamVideoSaat += konu.videoSaat || 0;
    ders.toplamSoruSayisi += konu.soruSayisi || 0;
    ders.toplamKonu += 1;
    if (konu.durum === 'tamamlandi') ders.tamamlananKonu += 1;
    if (konu.durum === 'tekrar') ders.tekrarBekleyenKonu += 1;
  });

  const calisilmayanDersler = mufredatDersler.filter(d => !dersler[d.id]).map(d => d.id);

  const tumDersler = Object.values(dersler);
  const genelOzet = {
    toplamVideoSaat: tumDersler.reduce((t, d) => t + d.toplamVideoSaat, 0),
    toplamSoruSayisi: tumDersler.reduce((t, d) => t + d.toplamSoruSayisi, 0),
    tamamlananKonu: tumDersler.reduce((t, d) => t + d.tamamlananKonu, 0),
    toplamKonu: tumDersler.reduce((t, d) => t + d.toplamKonu, 0),
    calisilmayanDersler,
    aktifDersSayisi: tumDersler.length,
  };

  return { dersBazliOzet: dersler, genelOzet };
}

/**
 * Saati okunabilir stringe çevirir.
 * 1.5 → "1s 30dk", 0.5 → "30dk", 2 → "2s"
 */
export function saatFormat(saatDecimal) {
  if (!saatDecimal || saatDecimal === 0) return null;
  const saat = Math.floor(saatDecimal);
  const dakika = Math.round((saatDecimal - saat) * 60);
  if (saat === 0) return `${dakika}dk`;
  if (dakika === 0) return `${saat}s`;
  return `${saat}s ${dakika}dk`;
}

export const KAYNAK_ETIKET = {
  program: 'Program',
  gunlukSoru: 'Günlük soru',
  video: 'Video',
  kitap: 'Kitap',
  deneme: 'Deneme',
};

/**
 * Kaynak listesini okunabilir Türkçeye çevirir.
 * ["program", "video"] → "Program, Video"
 */
export function kaynakEtiketleri(kaynaklar = []) {
  return kaynaklar.map(k => KAYNAK_ETIKET[k] || k).join(', ');
}
