import { dateToStr } from '../utils/tarih';
import { TYT_DERSLER, AYT_DERSLER } from '../data/konular';
import { LGS_DERSLER } from '../utils/ogrenciBaglam';

export const TUM_DERSLER_IST = [...TYT_DERSLER, ...AYT_DERSLER, ...LGS_DERSLER];

export const ARALIK_SECENEKLER = [
  { label: '7 gün', deger: 7 },
  { label: '30 gün', deger: 30 },
  { label: 'Tümü', deger: 0 },
];

export function hesaplaKpiler(ogrenciler, veriler, aralikTarih) {
  const n = ogrenciler.length;
  let sonNetToplam = 0,
    sonNetSayac = 0;
  ogrenciler.forEach(o => {
    const den = veriler.den[o.id] || [];
    if (den.length > 0) {
      const net = parseFloat(den[0].toplamNet || 0);
      if (!isNaN(net)) {
        sonNetToplam += net;
        sonNetSayac++;
      }
    }
  });
  const ortSonNet = sonNetSayac > 0 ? (sonNetToplam / sonNetSayac).toFixed(1) : '—';
  let topCalisma = 0;
  ogrenciler.forEach(o => {
    (veriler.cal[o.id] || []).forEach(c => {
      if (!aralikTarih || c.tarih >= aralikTarih) topCalisma += c.saat || 0;
    });
  });
  let progTamToplam = 0,
    progTamSayac = 0;
  ogrenciler.forEach(o => {
    (veriler.prog2[o.id] || []).forEach(d => {
      const tam = d.tamamlandi || {};
      const keys = Object.keys(tam);
      if (keys.length > 0) {
        progTamToplam += Object.values(tam).filter(Boolean).length / keys.length;
        progTamSayac++;
      }
    });
  });
  const ortProgTam = progTamSayac > 0 ? Math.round((progTamToplam / progTamSayac) * 100) : 0;
  const yediStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return dateToStr(d);
  })();
  const riskSayisi = ogrenciler.filter(o => {
    const den = veriler.den[o.id] || [];
    const sonNet = den.length > 0 ? parseFloat(den[0].toplamNet || 0) : 0;
    const sonCalismaTarihi = (veriler.cal[o.id] || [])
      .filter(c => c.saat > 0)
      .map(c => c.tarih)
      .sort()
      .pop();
    return sonNet < 15 || !sonCalismaTarihi || sonCalismaTarihi < yediStr;
  }).length;
  return { n, ortSonNet, topCalisma: Math.round(topCalisma), ortProgTam, riskSayisi };
}

export function hesaplaNetTrend(hedefOgrenciler, filtreliDen) {
  const gunluk = {};
  hedefOgrenciler.forEach(o => {
    (filtreliDen[o.id] || []).forEach(d => {
      if (!d.tarih) return;
      const net = parseFloat(d.toplamNet || 0);
      if (isNaN(net)) return;
      if (!gunluk[d.tarih]) gunluk[d.tarih] = { toplam: 0, sayac: 0 };
      gunluk[d.tarih].toplam += net;
      gunluk[d.tarih].sayac++;
    });
  });
  return Object.entries(gunluk)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([tarih, v]) => ({
      tarih: tarih.slice(5),
      net: parseFloat((v.toplam / v.sayac).toFixed(1)),
    }));
}

export function hesaplaCalismaTrend(hedefOgrenciler, veriler) {
  const bugun = new Date();
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(bugun);
    d.setDate(bugun.getDate() - (13 - i));
    const tarih = dateToStr(d);
    let top = 0;
    hedefOgrenciler.forEach(o => {
      const c = (veriler.cal[o.id] || []).find(x => x.tarih === tarih);
      if (c) top += c.saat || 0;
    });
    const ort =
      hedefOgrenciler.length > 0 ? Math.round((top / hedefOgrenciler.length) * 10) / 10 : 0;
    return { gun: tarih.slice(5), ort };
  });
}

export function hesaplaOgrenciDurum(ogrenciler, veriler) {
  const yediStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return dateToStr(d);
  })();
  return ogrenciler.map(o => {
    const den = veriler.den[o.id] || [];
    const sonNet = den.length > 0 ? parseFloat(den[0].toplamNet || 0) : null;
    const oncekiNet = den.length > 1 ? parseFloat(den[1].toplamNet || 0) : null;
    const netFark = sonNet !== null && oncekiNet !== null ? sonNet - oncekiNet : null;
    const haftalikCalisma = (veriler.cal[o.id] || [])
      .filter(c => c.tarih >= yediStr)
      .reduce((a, c) => a + (c.saat || 0), 0);
    let progTamToplam = 0,
      progTamSayac = 0;
    (veriler.prog2[o.id] || []).forEach(d => {
      const tam = d.tamamlandi || {};
      const keys = Object.keys(tam);
      if (keys.length > 0) {
        progTamToplam += Object.values(tam).filter(Boolean).length / keys.length;
        progTamSayac++;
      }
    });
    const progTam = progTamSayac > 0 ? Math.round((progTamToplam / progTamSayac) * 100) : null;
    const risk = (sonNet !== null && sonNet < 15) || haftalikCalisma === 0;
    return {
      ...o,
      sonNet,
      netFark,
      haftalikCalisma: Math.round(haftalikCalisma * 10) / 10,
      progTam,
      risk,
    };
  });
}

export function hesaplaZayifKonular(hedefOgrenciler, filtreliDen) {
  const dersMap = {};
  hedefOgrenciler.forEach(o => {
    (filtreliDen[o.id] || []).forEach(den => {
      Object.entries(den.netler || {}).forEach(([dersId, dv]) => {
        if (!dersMap[dersId]) dersMap[dersId] = {};
        (dv.yanlisKonular || []).forEach(k => {
          dersMap[dersId][k] = (dersMap[dersId][k] || 0) + 2;
        });
        (dv.bosKonular || []).forEach(k => {
          dersMap[dersId][k] = (dersMap[dersId][k] || 0) + 1;
        });
      });
    });
  });
  return Object.entries(dersMap)
    .map(([dersId, sayac]) => {
      const ders = TUM_DERSLER_IST.find(d => d.id === dersId);
      const konular = Object.entries(sayac)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([konu, skor]) => ({ konu, skor }));
      return {
        dersId,
        dersLabel: ders?.label || dersId,
        dersRenk: ders?.renk || '#888',
        konular,
      };
    })
    .filter(d => d.konular.length > 0);
}
