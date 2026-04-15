import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { bildirimOlustur } from '../components/BildirimSistemi';

export async function adminlereBildirimGonder(kullanici, userData, ogrenciUid, ogrenciIsim) {
  try {
    const adminSnap = await getDocs(
      query(collection(db, 'kullanicilar'), where('rol', '==', 'admin'))
    );
    for (const adminDoc of adminSnap.docs) {
      await bildirimOlustur({
        aliciId: adminDoc.id,
        tip: 'ogrenci_eklendi',
        baslik: 'Yeni öğrenci eklendi',
        mesaj: `${userData?.isim || 'Koç'}, ${ogrenciIsim} adlı yeni bir öğrenci ekledi.`,
        gonderen: userData?.isim || kullanici.email,
        gonderenId: kullanici.uid,
        ogrenciId: ogrenciUid,
        ogrenciIsim,
        route: '/admin/ogrenciler',
        entityId: ogrenciUid,
      });
    }
  } catch (e) {
    console.warn('Bildirim gönderilemedi:', e);
  }
}
