export const STANDART_NET = 6000;
export const ERKEN_KAYIT_NET = 5000;
export const VARSAYILAN_KDV = 20;
export const ERKEN_KAYIT_BITIS = new Date('2026-08-31T23:59:59+03:00');

export function kdvHesapla(net, kdvOrani = VARSAYILAN_KDV) {
  return Math.round(net * kdvOrani) / 100;
}

export function erkenKayitAktifMi(simdi = new Date()) {
  return simdi <= ERKEN_KAYIT_BITIS;
}

function kodDogrulaIc(kodDoc, email, telefon) {
  if (!kodDoc) return { gecerli: false, sebep: 'Kod bulunamadı.' };
  if (kodDoc.status !== 'active') return { gecerli: false, sebep: 'Kod aktif değil.' };
  if (kodDoc.usedCount >= kodDoc.maxUses)
    return { gecerli: false, sebep: 'Kullanım limiti dolmuş.' };
  if (kodDoc.validUntil) {
    const bitis = kodDoc.validUntil.toDate
      ? kodDoc.validUntil.toDate()
      : new Date(kodDoc.validUntil);
    if (bitis < new Date()) return { gecerli: false, sebep: 'Kodun süresi dolmuş.' };
  }
  const emailEslesti =
    kodDoc.allowedEmail &&
    email &&
    kodDoc.allowedEmail.trim().toLowerCase() === email.trim().toLowerCase();
  const telefonEslesti =
    kodDoc.allowedPhone &&
    telefon &&
    kodDoc.allowedPhone.replace(/\D/g, '') === telefon.replace(/\D/g, '');
  if (!emailEslesti && !telefonEslesti)
    return { gecerli: false, sebep: 'Bu kod bu e-posta/telefon ile kullanılamaz.' };
  return { gecerli: true, sebep: null };
}

function temelFiyat(simdi) {
  if (erkenKayitAktifMi(simdi)) {
    const kdvTutari = kdvHesapla(ERKEN_KAYIT_NET);
    return {
      kaynak: 'erken_kayit',
      net: ERKEN_KAYIT_NET,
      kdvOrani: VARSAYILAN_KDV,
      kdvTutari,
      brut: ERKEN_KAYIT_NET + kdvTutari,
    };
  }
  const kdvTutari = kdvHesapla(STANDART_NET);
  return {
    kaynak: 'standart',
    net: STANDART_NET,
    kdvOrani: VARSAYILAN_KDV,
    kdvTutari,
    brut: STANDART_NET + kdvTutari,
  };
}

/**
 * Nihai fiyatı hesapla.
 * @param {{ kodDoc?: object|null, email?: string, telefon?: string, simdi?: Date }}
 * @returns {{ kaynak, net, kdvOrani, kdvTutari, brut, kodGecerli, kodSebep }}
 */
export function fiyatHesapla({ kodDoc = null, email = '', telefon = '', simdi = new Date() } = {}) {
  if (kodDoc) {
    const { gecerli, sebep } = kodDogrulaIc(kodDoc, email, telefon);
    if (gecerli) {
      const kdvOrani = kodDoc.vatRate ?? VARSAYILAN_KDV;
      const net = kodDoc.monthlyNetAmount;
      const kdvTutari = kdvHesapla(net, kdvOrani);
      return {
        kaynak: 'ozel_kod',
        net,
        kdvOrani,
        kdvTutari,
        brut: net + kdvTutari,
        kodGecerli: true,
        kodSebep: null,
      };
    }
    return { ...temelFiyat(simdi), kodGecerli: false, kodSebep: sebep };
  }
  return { ...temelFiyat(simdi), kodGecerli: false, kodSebep: null };
}
