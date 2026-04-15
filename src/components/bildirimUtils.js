import { collection, addDoc, getDocs, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { unreadPatch } from '../utils/readState';

// ─── Tip konfigürasyonu ────────────────────────────────────────────────────────
const TIP_CONFIG = {
  yeni_mesaj: { ikon: '💬', renk: '#6366f1', filtre: 'mesaj' },
  deneme_girildi: { ikon: '📊', renk: '#22c55e', filtre: 'deneme' },
  deneme_yorumu: { ikon: '📝', renk: '#22c55e', filtre: 'deneme' },
  program_degisti: { ikon: '📅', renk: '#f59e0b', filtre: 'program' },
  ogrenci_eklendi: { ikon: '👤', renk: '#8b5cf6', filtre: 'sistem' },
  ogrenci_silindi: { ikon: '❌', renk: '#ef4444', filtre: 'sistem' },
  silme_talebi: { ikon: '🗑️', renk: '#ef4444', filtre: 'sistem' },
  silme_onaylandi: { ikon: '✅', renk: '#22c55e', filtre: 'sistem' },
  silme_reddedildi: { ikon: '🚫', renk: '#ef4444', filtre: 'sistem' },
  capraz_koc: { ikon: '🔀', renk: '#f97316', filtre: 'sistem' },
  veli_raporu_hazir: { ikon: '📋', renk: '#06b6d4', filtre: 'sistem' },
  duyuru: { ikon: '📢', renk: '#dc2626', filtre: 'sistem' },
  sistem: { ikon: '⚙️', renk: '#6b7280', filtre: 'sistem' },
};
const TIP_DEFAULT = { ikon: '🔔', renk: '#6b7280', filtre: 'sistem' };
export const tipCfg = tip => TIP_CONFIG[tip] || TIP_DEFAULT;

export const FILTRELER = [
  { k: 'hepsi', l: 'Tümü' },
  { k: 'mesaj', l: '💬 Mesajlar' },
  { k: 'deneme', l: '📊 Denemeler' },
  { k: 'program', l: '📅 Program' },
  { k: 'sistem', l: '⚙️ Sistem' },
];

export const GRUP_SIRASI = ['bugun', 'dun', 'bu_hafta', 'eskiler'];
export const GRUP_ETIKET = {
  bugun: 'Bugün',
  dun: 'Dün',
  bu_hafta: 'Bu hafta',
  eskiler: 'Daha önce',
};

export function gunGrubu(olusturma) {
  if (!olusturma?.toDate) return 'eskiler';
  const ts = olusturma.toDate();
  const diff = Math.floor((Date.now() - ts.getTime()) / 86400000);
  if (diff === 0) return 'bugun';
  if (diff === 1) return 'dun';
  if (diff < 7) return 'bu_hafta';
  return 'eskiler';
}

// ─── bildirimOlustur ──────────────────────────────────────────────────────────
export async function bildirimOlustur({
  aliciId,
  aliciRol,
  tip,
  baslik,
  mesaj,
  gonderen,
  gonderenId,
  ogrenciId,
  ogrenciIsim,
  route = '',
  entityId = '',
  meta = {},
}) {
  try {
    await addDoc(collection(db, 'bildirimler'), {
      aliciId,
      aliciRol: aliciRol || '',
      tip,
      baslik,
      mesaj,
      gonderen: gonderen || '',
      gonderenId: gonderenId || '',
      ogrenciId: ogrenciId || '',
      ogrenciIsim: ogrenciIsim || '',
      route: route || '',
      entityId: entityId || '',
      ...unreadPatch(),
      olusturma: serverTimestamp(),
      meta,
    });
  } catch (e) {
    console.error('Bildirim oluşturulamadı:', e);
  }
}

// ─── caprazKocBildirim ────────────────────────────────────────────────────────
export async function caprazKocBildirim({
  isteyenKocId,
  isteyenKocIsim,
  hedefKocId,
  hedefKocIsim,
  ogrenciId,
  ogrenciIsim,
  islemTipi,
  detay = '',
}) {
  await bildirimOlustur({
    aliciId: hedefKocId,
    tip: 'capraz_koc',
    baslik: `${isteyenKocIsim} öğrencinizde değişiklik istiyor`,
    mesaj: `${isteyenKocIsim}, ${ogrenciIsim} adlı öğrenciniz için ${islemTipi} yapmak istiyor. ${detay}`,
    gonderen: isteyenKocIsim,
    gonderenId: isteyenKocId,
    ogrenciId,
    ogrenciIsim,
    route: '/koc/ogrenciler',
    entityId: ogrenciId,
    meta: { islemTipi },
  });
  try {
    const adminSnap = await getDocs(
      query(collection(db, 'kullanicilar'), where('rol', '==', 'admin'))
    );
    for (const adminDoc of adminSnap.docs) {
      await bildirimOlustur({
        aliciId: adminDoc.id,
        tip: 'capraz_koc',
        baslik: 'Çapraz koç erişim talebi',
        mesaj: `${isteyenKocIsim}, ${hedefKocIsim}'in öğrencisi ${ogrenciIsim} için ${islemTipi} yapmak istiyor. ${detay}`,
        gonderen: isteyenKocIsim,
        gonderenId: isteyenKocId,
        ogrenciId,
        ogrenciIsim,
        route: '/admin/ogrenciler',
        entityId: ogrenciId,
        meta: { islemTipi, hedefKocId, hedefKocIsim },
      });
    }
  } catch (e) {
    console.error('Admin bildirimi gönderilemedi:', e);
  }
}
