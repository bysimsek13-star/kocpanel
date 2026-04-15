import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import app from '../firebase';
import { db } from '../firebase';
import { logIstemciHatasi } from './izleme';

// Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
// "Generate key pair" ile oluşturun ve aşağıya yapıştırın
const VAPID_KEY =
  'BArQufSg1XLSONzN86kiiVRA8gqhkMkfqSP8u39ZIiAAnIi6RbQMpPAMUpauVlQxs_gYwvvWClIS3GwcWBQ2wPM';

export async function fcmTokenGuncelle(uid) {
  if (!uid) return;
  try {
    const destekleniyor = await isSupported();
    if (!destekleniyor) return;

    // İzin yoksa sadece 'default' durumunda sor, 'denied' ise çık
    if (Notification.permission === 'denied') return;
    if (Notification.permission === 'default') {
      const izin = await Notification.requestPermission();
      if (izin !== 'granted') return;
    }

    const messaging = getMessaging(app);
    const swReg = await navigator.serviceWorker.ready;
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swReg,
    });
    if (!token) return;

    await updateDoc(doc(db, 'kullanicilar', uid), { fcmToken: token });
  } catch (e) {
    logIstemciHatasi({
      error: e,
      info: 'FCM token alınamadı/kaydedilemedi',
      kaynak: 'fcmToken',
      ekstra: { uid },
    });
  }
}
