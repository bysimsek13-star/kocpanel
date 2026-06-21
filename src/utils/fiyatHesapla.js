/**
 * fiyatHesapla.js — Fiyat öncelik mantığı
 *
 * Öncelik: özel kod > erken kayıt > standart
 * Tüm fonksiyonlar saf (side-effect yok), test edilebilir.
 */

export const STANDART_NET = 6000;
export const ERKEN_KAYIT_NET = 5000;
export const VARSAYILAN_KDV = 20;
export const ERKEN_KAYIT_BITIS = new Date('2026-08-31T23:59:59+03:00');

export function kdvHesapla(net, kdvOrani = VARSAYILAN_KDV) {
  return Math.round(net * kdvOrani) / 100;
}

export function brutHesapla(net, kdvOrani = VARSAYILAN_KDV) {
  return net + kdvHesapla(net, kdvOrani);
}

export function erkenKayitAktifMi(simdi = new Date()) {
  return simdi <= ERKEN_KAYIT_BITIS;
}

/**
 * Özel indirim kodunu doğrula:
 * - email VEYA telefon eşleşmeli
 * - aktif, süresi dolmamış, limit aşılmamış olmalı
 * @returns {{ gecerli: boolean, hata?: string }}
 */
export function kodDogrula(kod, email, telefon) {
  if (!kod) return { gecerli: false, hata: 'Kod bulunamadı.' };
  if (kod.status !== 'active') return { gecerli: false, hata: 'Kod aktif değil.' };
  if (kod.usedCount >= kod.maxUses) return { gecerli: false, hata: 'Kod kullanım limiti dolmuş.' };
  if (kod.validUntil) {
    const bitis = kod.validUntil.toDate ? kod.validUntil.toDate() : new Date(kod.validUntil);
    if (bitis < new Date()) return { gecerli: false, hata: 'Kodun süresi dolmuş.' };
  }

  const emailEslesti =
    kod.allowedEmail &&
    email &&
    kod.allowedEmail.trim().toLowerCase() === email.trim().toLowerCase();
  const telefonEslesti =
    kod.allowedPhone &&
    telefon &&
    kod.allowedPhone.replace(/\D/g, '') === telefon.replace(/\D/g, '');

  if (!emailEslesti && !telefonEslesti) {
    return { gecerli: false, hata: 'Bu kod bu e-posta/telefon ile kullanılamaz.' };
  }

  return { gecerli: true };
}

/**
 * Nihai fiyatı hesapla.
 * @param {{ ozelKod?: object, email?: string, telefon?: string, simdi?: Date }}
 * @returns {{ fiyatTuru, netFiyat, kdvOrani, kdvTutari, brutFiyat, kuponKodu? }}
 */
export function fiyatHesapla({
  ozelKod = null,
  email = '',
  telefon = '',
  simdi = new Date(),
} = {}) {
  if (ozelKod) {
    const { gecerli } = kodDogrula(ozelKod, email, telefon);
    if (gecerli) {
      const kdvOrani = ozelKod.vatRate ?? VARSAYILAN_KDV;
      const netFiyat = ozelKod.monthlyNetAmount;
      const kdvTutari = kdvHesapla(netFiyat, kdvOrani);
      return {
        fiyatTuru: 'ozel_kod',
        netFiyat,
        kdvOrani,
        kdvTutari,
        brutFiyat: netFiyat + kdvTutari,
        kuponKodu: ozelKod.code,
        surekliMi: ozelKod.appliesToRecurring ?? false,
      };
    }
  }

  if (erkenKayitAktifMi(simdi)) {
    const kdvTutari = kdvHesapla(ERKEN_KAYIT_NET);
    return {
      fiyatTuru: 'erken_kayit',
      netFiyat: ERKEN_KAYIT_NET,
      kdvOrani: VARSAYILAN_KDV,
      kdvTutari,
      brutFiyat: ERKEN_KAYIT_NET + kdvTutari,
    };
  }

  const kdvTutari = kdvHesapla(STANDART_NET);
  return {
    fiyatTuru: 'standart',
    netFiyat: STANDART_NET,
    kdvOrani: VARSAYILAN_KDV,
    kdvTutari,
    brutFiyat: STANDART_NET + kdvTutari,
  };
}
