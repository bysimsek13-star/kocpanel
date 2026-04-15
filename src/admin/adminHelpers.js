import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '../firebase';

const FUNCTIONS_REGION = 'europe-west1';

export function getCallable(name) {
  const functions = getFunctions(app, FUNCTIONS_REGION);
  return httpsCallable(functions, name);
}

export function hataMesajiVer(error) {
  const code = error?.code || error?.message || '';
  const map = {
    'auth/email-already-in-use': 'Bu e-posta adresi zaten kullanımda.',
    'auth/invalid-email': 'Geçerli bir e-posta adresi girin.',
    'auth/weak-password': 'Şifre en az 6 karakter olmalı.',
    'permission-denied': 'Bu işlemi yapmak için yetkiniz yok.',
    'functions/internal': 'Sunucu tarafında bir hata oluştu.',
    'functions/invalid-argument': 'Gönderilen bilgiler geçersiz.',
    'functions/not-found': 'İstenen kayıt bulunamadı.',
    'functions/failed-precondition': 'İşlem şu an için yapılamıyor.',
    'functions/already-exists': 'Bu kayıt zaten mevcut.',
    unauthorized: 'Yetkisiz erişim.',
    pasif: 'Bu kullanıcı hesabı pasif durumda.',
  };
  return map[code] || 'İşlem tamamlanamadı.';
}

export function kisaTarih(ts) {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function emailGecerliMi(email) {
  return /.+@.+\..+/.test(String(email || '').trim());
}

export const SINAV_TUR_SECENEKLERI = (
  <>
    <optgroup label="LGS">
      <option value="lgs_7">7. Sınıf (LGS Hazırlık)</option>
      <option value="lgs_8">8. Sınıf (LGS)</option>
    </optgroup>
    <optgroup label="Ortaokul / Lise">
      <option value="ortaokul_9">9. Sınıf</option>
      <option value="ortaokul_10">10. Sınıf</option>
      <option value="ortaokul_11">11. Sınıf</option>
    </optgroup>
    <optgroup label="YKS - 12. Sınıf">
      <option value="tyt_12">12. Sınıf (TYT)</option>
      <option value="sayisal_12">12. Sınıf (Sayısal)</option>
      <option value="ea_12">12. Sınıf (EA)</option>
      <option value="sozel_12">12. Sınıf (Sözel)</option>
      <option value="dil_12">12. Sınıf (Dil)</option>
    </optgroup>
    <optgroup label="Mezun">
      <option value="tyt_mezun">Mezun (TYT)</option>
      <option value="sayisal_mezun">Mezun (Sayısal)</option>
      <option value="ea_mezun">Mezun (EA)</option>
      <option value="sozel_mezun">Mezun (Sözel)</option>
      <option value="dil_mezun">Mezun (Dil)</option>
    </optgroup>
  </>
);
