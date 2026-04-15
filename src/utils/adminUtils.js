import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

export const destekTipleri = [
  { value: 'teknik', label: 'Teknik Sorun', icon: '🛠️' },
  { value: 'ozellik', label: 'Özellik İsteği', icon: '✨' },
  { value: 'hesap', label: 'Hesap / Yetki', icon: '🔐' },
  { value: 'odeme', label: 'Ödeme / Paket', icon: '💳' },
  { value: 'diger', label: 'Diğer', icon: '💬' },
];

export function duyuruRenk(duyuru = {}) {
  if (duyuru.seviye === 'kritik')
    return { bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.25)', text: '#F43F5E' };
  if (duyuru.seviye === 'guncelleme')
    return { bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.25)', text: '#10B981' };
  return { bg: 'rgba(91,79,232,0.10)', border: 'rgba(91,79,232,0.22)', text: '#5B4FE8' };
}

export function funnelYuzde(toplam, deger) {
  if (!toplam) return 0;
  return Math.max(0, Math.min(100, Math.round((deger / toplam) * 100)));
}

export async function sonDuyurulariGetir(adet = 6) {
  const q = query(collection(db, 'duyurular'), orderBy('olusturma', 'desc'), limit(adet));
  const snap = await getDocs(q);
  const simdi = new Date();
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(d => {
      if (d.aktif === false) return false;
      // bitisTarihi geçmişse otomatik arşive sayılır
      if (d.bitisTarihi?.toDate && d.bitisTarihi.toDate() < simdi) return false;
      return true;
    });
}

export async function destekOzetiniGetir() {
  const q = query(collection(db, 'destekTalepleri'), orderBy('olusturma', 'desc'), limit(100));
  const snap = await getDocs(q);
  const liste = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return {
    acik: liste.filter(x => x.durum === 'acik').length,
    bekliyor: liste.filter(x => x.durum === 'beklemede').length,
    kapali: liste.filter(x => x.durum === 'kapali').length,
    son: liste.slice(0, 8),
  };
}

export function aktivasyonRozet(sk) {
  if (sk >= 80) return { label: 'Güçlü', renk: '#10B981', bg: 'rgba(16,185,129,0.12)' };
  if (sk >= 50) return { label: 'Orta', renk: '#F59E0B', bg: 'rgba(245,158,11,0.12)' };
  return { label: 'Riskli', renk: '#F43F5E', bg: 'rgba(244,63,94,0.12)' };
}
