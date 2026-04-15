import { doc, setDoc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { bugunStr } from './tarih';
import { logIstemciHatasi } from './izleme';

export async function aktiflikKaydet(uid, rol) {
  if (!uid) return;
  const bugun = bugunStr();
  try {
    await updateDoc(doc(db, 'kullanicilar', uid), {
      sonAktif: serverTimestamp(),
    });
    await setDoc(
      doc(db, 'kullanicilar', uid, 'aktivite', bugun),
      { tarih: bugun, girisSayisi: increment(1), sonGiris: serverTimestamp() },
      { merge: true }
    );
    // ogrenciler/{uid} — sadece öğrenci rolünde güncelle (getDoc kaldırıldı)
    if (rol === 'ogrenci') {
      await updateDoc(doc(db, 'ogrenciler', uid), {
        sonAktif: serverTimestamp(),
        girisSayisi: increment(1),
      });
    }
  } catch (e) {
    logIstemciHatasi({
      error: e,
      info: 'Aktiflik kaydedilemedi',
      kaynak: 'aktiflikKaydet',
      ekstra: { uid },
    });
  }
}

export async function oturumBitir(uid, sureDakika, rol) {
  if (!uid || !sureDakika || sureDakika < 1) return;
  const bugun = bugunStr();
  try {
    await setDoc(
      doc(db, 'kullanicilar', uid, 'aktivite', bugun),
      {
        toplamDakika: increment(Math.round(sureDakika)),
        sonGuncelleme: serverTimestamp(),
      },
      { merge: true }
    );
    if (rol === 'ogrenci') {
      await updateDoc(doc(db, 'ogrenciler', uid), {
        gunlukDakika: increment(Math.round(sureDakika)),
      });
    }
  } catch (e) {
    logIstemciHatasi({
      error: e,
      info: 'Oturum süresi kaydedilemedi',
      kaynak: 'oturumBitir',
      ekstra: { uid },
    });
  }
}

/** sonAktif timestamp'inden okunabilir etiket + renk üretir */
export function aktifDurumu(sonAktif) {
  if (!sonAktif) return { label: 'Hiç giriş yok', renk: '#9CA3AF', puan: 0 };
  const ms =
    typeof sonAktif?.toDate === 'function'
      ? sonAktif.toDate().getTime()
      : new Date(sonAktif).getTime();
  const dakika = Math.floor((Date.now() - ms) / 60000);
  if (dakika < 30) return { label: 'Şu an aktif', renk: '#10B981', puan: 3 };
  if (dakika < 120) return { label: `${dakika} dk önce`, renk: '#F59E0B', puan: 2 };
  const saat = Math.floor(dakika / 60);
  if (saat < 12) return { label: `${saat} saat önce`, renk: '#F97316', puan: 1 };
  const gun = Math.floor(saat / 24);
  if (gun < 1) return { label: 'Bugün giriş yok', renk: '#F43F5E', puan: 0 };
  return { label: `${gun} gün önce`, renk: '#9CA3AF', puan: 0 };
}
