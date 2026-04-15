import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Audit Log — Kritik işlemleri kaydeder.
 * Koleksiyon: auditLog
 * Her kayıt: { kim, kimIsim, ne, kimi, kimiIsim, zaman, detay }
 *
 * NOT: Cloud Functions tarafından yazılan loglar için bu util çağrılmaz.
 * Sadece frontend'den yapılan (koç atama vb.) küçük işlemler için kullanılır.
 */

export const AuditTip = {
  KULLANICI_OLUSTUR: 'kullanici_olustur',
  KULLANICI_SIL: 'kullanici_sil',
  KULLANICI_PASIFE_AL: 'kullanici_pasife_al',
  KULLANICI_AKTIFE_AL: 'kullanici_aktife_al',
  ROL_DEGISTIR: 'rol_degistir',
  KOC_ATA: 'koc_ata',
  KOC_SIL: 'koc_sil',
  OGRENCI_SIL: 'ogrenci_sil',
  DENEME_EKLE: 'deneme_ekle',
  PROGRAM_GUNCELLE: 'program_guncelle',
  VELI_BAGLA: 'veli_bagla',
};

/**
 * @param {{ kim: string, kimIsim?: string, ne: string, kimi?: string, kimiIsim?: string, detay?: object }} params
 */
export async function auditLog({ kim, kimIsim = '', ne, kimi = '', kimiIsim = '', detay = {} }) {
  try {
    await addDoc(collection(db, 'auditLog'), {
      kim,
      kimIsim,
      ne,
      kimi,
      kimiIsim,
      zaman: serverTimestamp(),
      detay,
    });
  } catch (e) {
    // Audit log başarısız olsa bile ana işlemi durdurma
    console.warn('Audit log yazılamadı:', e.message);
  }
}

/**
 * Admin paneli için audit log listesini getir
 */
export async function auditLogGetir(adet = 100, kimUid = null) {
  try {
    let q;
    if (kimUid) {
      q = query(
        collection(db, 'auditLog'),
        where('kim', '==', kimUid),
        orderBy('zaman', 'desc'),
        limit(adet)
      );
    } else {
      q = query(collection(db, 'auditLog'), orderBy('zaman', 'desc'), limit(adet));
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('Audit log alınamadı:', e);
    return [];
  }
}

export function auditTipMetin(tip) {
  const map = {
    [AuditTip.KULLANICI_OLUSTUR]: 'Kullanıcı oluşturdu',
    [AuditTip.KULLANICI_SIL]: 'Kullanıcı sildi',
    [AuditTip.KULLANICI_PASIFE_AL]: 'Hesabı pasife aldı',
    [AuditTip.KULLANICI_AKTIFE_AL]: 'Hesabı aktife aldı',
    [AuditTip.ROL_DEGISTIR]: 'Rol değiştirdi',
    [AuditTip.KOC_ATA]: 'Koç atadı',
    [AuditTip.KOC_SIL]: 'Koç kaldırdı',
    [AuditTip.OGRENCI_SIL]: 'Öğrenci sildi',
    [AuditTip.DENEME_EKLE]: 'Deneme sonucu ekledi',
    [AuditTip.PROGRAM_GUNCELLE]: 'Program güncelledi',
    [AuditTip.VELI_BAGLA]: 'Veli bağladı',
  };
  return map[tip] || tip;
}

export function auditTipIkon(tip) {
  const map = {
    [AuditTip.KULLANICI_OLUSTUR]: '➕',
    [AuditTip.KULLANICI_SIL]: '🗑️',
    [AuditTip.KULLANICI_PASIFE_AL]: '⏸️',
    [AuditTip.KULLANICI_AKTIFE_AL]: '▶️',
    [AuditTip.ROL_DEGISTIR]: '🔄',
    [AuditTip.KOC_ATA]: '🔗',
    [AuditTip.KOC_SIL]: '✂️',
    [AuditTip.OGRENCI_SIL]: '❌',
    [AuditTip.DENEME_EKLE]: '📊',
    [AuditTip.PROGRAM_GUNCELLE]: '📅',
    [AuditTip.VELI_BAGLA]: '👨‍👩‍👦',
  };
  return map[tip] || '📝';
}
