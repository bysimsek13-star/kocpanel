import { unreadCount } from './readState';

export function gunFarki(a, b = new Date()) {
  if (!a) return null;
  const da = a instanceof Date ? a : new Date(a);
  const db = b instanceof Date ? b : new Date(b);
  return Math.floor((db - da) / 86400000);
}

export function parseDateSafe(value) {
  if (!value) return null;
  if (typeof value?.toDate === 'function') return value.toDate();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDateShort(value) {
  const d = parseDateSafe(value);
  if (!d) return '—';
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
}

export function haftalikOzetOlustur({
  program = [],
  denemeler = [],
  calisma = [],
  mesajlar = [],
  ogrenci = {},
  raporlar = [],
}) {
  const bugun = new Date();
  const yediGunOnce = new Date(bugun);
  yediGunOnce.setDate(bugun.getDate() - 7);
  const haftaCalisma = calisma.filter(c => {
    const d = parseDateSafe(c.tarih) || parseDateSafe(c.olusturma);
    return d && d >= yediGunOnce;
  });
  const toplamSaat = haftaCalisma.reduce((acc, item) => acc + (Number(item.saat) || 0), 0);
  const tamamlanan = program.filter(p => p.tamamlandi).length;
  const tamamOran = program.length ? Math.round((tamamlanan / program.length) * 100) : 0;

  const siraliDenemeler = [...denemeler].sort(
    (a, b) => new Date(b.tarih || 0) - new Date(a.tarih || 0)
  );
  const sonDeneme = siraliDenemeler[0] || null;
  const oncekiDeneme = siraliDenemeler[1] || null;
  const netFark =
    sonDeneme && oncekiDeneme
      ? (Number(sonDeneme.toplamNet) || 0) - (Number(oncekiDeneme.toplamNet) || 0)
      : null;

  const sonRapor = raporlar?.[0];
  const sonRaporTarih = sonRapor?.haftaBitis || sonRapor?.olusturma || null;
  const sonRaporGun = sonRaporTarih ? gunFarki(sonRaporTarih, bugun) : 999;
  const veliRaporGerekli = !!ogrenci.veliEmail && (sonRaporGun === null || sonRaporGun >= 7);

  return {
    ogrenciId: ogrenci.id,
    ogrenciIsim: ogrenci.isim,
    calismaGunSayisi: haftaCalisma.length,
    toplamSaat: Number(toplamSaat.toFixed(1)),
    gorevTamamlama: tamamOran,
    sonDenemeNet: sonDeneme ? Number(sonDeneme.toplamNet) || 0 : null,
    netDegisim: netFark !== null ? Number(netFark.toFixed(1)) : null,
    veliRaporGerekli,
    sonRaporGun: sonRaporGun === null ? null : sonRaporGun,
    programBosGun: ogrenci.sonCalismaTarihi ? gunFarki(ogrenci.sonCalismaTarihi, bugun) : 999,
    okunmamisMesaj: unreadCount(mesajlar, m => m.gonderen === 'ogrenci'),
  };
}

export function mufredatHaritasiOlustur({ mufredat = [], denemeler = [], tumKonular = {} }) {
  const dersler = {};

  Object.entries(tumKonular).forEach(([dersId, konular]) => {
    dersler[dersId] = (konular || []).map(konu => ({
      konu,
      durum: 'baslanmadi',
      yanlis: 0,
      tekrarBekliyor: false,
      dersId,
    }));
  });

  const mevcutMap = new Map();
  mufredat.forEach(item => {
    const key = `${item.dersId || item.ders}|${item.konu}`;
    mevcutMap.set(key, item);
  });

  Object.entries(dersler).forEach(([dersId, liste]) => {
    dersler[dersId] = liste.map(item => {
      const mevcut = mevcutMap.get(`${dersId}|${item.konu}`);
      if (!mevcut) return item;
      const tamamlandi = mevcut.tamamlandi === true || mevcut.durum === 'tamamlandi';
      const tekrarBekliyor = mevcut.durum === 'tekrar' || mevcut.durum === 'tekrar_bekliyor';
      return {
        ...item,
        durum: tekrarBekliyor ? 'tekrar' : tamamlandi ? 'tamamlandi' : 'devam',
        saat: mevcut.saat || 0,
        gun: mevcut.gun || 0,
      };
    });
  });

  denemeler.forEach(deneme => {
    Object.entries(deneme.netler || {}).forEach(([dersId, veri]) => {
      const zayifIsaretle = konu => {
        const ders = dersler[dersId];
        if (!ders) return;
        const mevcut = ders.find(item => item.konu === konu);
        if (!mevcut) return;
        mevcut.yanlis += 1;
        if (mevcut.durum === 'tamamlandi') {
          mevcut.tekrarBekliyor = true;
          mevcut.durum = 'tekrar';
        }
      };
      (veri.yanlisKonular || []).forEach(zayifIsaretle);
      (veri.bosKonular || []).forEach(zayifIsaretle);
    });
  });

  return dersler;
}

export function gorusmeTimelineOlustur(notlar = []) {
  return [...notlar]
    .filter(item => item.tip === 'gorusme')
    .sort((a, b) => {
      const ad = parseDateSafe(a.tarih || a.olusturma) || new Date(0);
      const bd = parseDateSafe(b.tarih || b.olusturma) || new Date(0);
      return bd - ad;
    });
}
