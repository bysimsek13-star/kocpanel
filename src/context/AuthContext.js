import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { fcmTokenGuncelle } from '../utils/fcmToken';
import { setIzlemeUser } from '../utils/izleme';

const AuthContext = createContext();

const BOS_DURUM = {
  kullanici: null,
  rol: '',
  userData: null,
};

export function AuthProvider({ children }) {
  const [kullanici, setKullanici] = useState(BOS_DURUM.kullanici);
  const [rol, setRol] = useState(BOS_DURUM.rol);
  const [userData, setUserData] = useState(BOS_DURUM.userData);
  const [yukleniyor, setYukleniyor] = useState(true);

  const durumuTemizle = useCallback(() => {
    setKullanici(BOS_DURUM.kullanici);
    setRol(BOS_DURUM.rol);
    setUserData(BOS_DURUM.userData);
  }, []);

  const oturumuUygula = useCallback((user, yeniRol, yeniUserData) => {
    setKullanici(user);
    setRol(yeniRol || 'unauthorized');
    setUserData(yeniUserData || null);
    setIzlemeUser(user ? { uid: user.uid, email: user.email, rol: yeniRol || '' } : null);
  }, []);

  useEffect(() => {
    let unsubFirestore = null;

    const unsubAuth = onAuthStateChanged(auth, user => {
      // Eğer önceki bir Firestore takibi varsa temizle (Bellek sızıntısını önler)
      if (unsubFirestore) {
        unsubFirestore();
        unsubFirestore = null;
      }

      if (!user) {
        durumuTemizle();
        setYukleniyor(false);
        return;
      }

      setYukleniyor(true);

      // --- GERÇEK ZAMANLI TAKİP BAŞLIYOR ---
      const ref = doc(db, 'kullanicilar', user.uid);

      unsubFirestore = onSnapshot(
        ref,
        snap => {
          if (!snap.exists()) {
            console.warn('Kullanıcı kaydı bulunamadı.');
            oturumuUygula(user, 'unauthorized', null);
          } else {
            const data = snap.data();

            // Eğer admin bu kişiyi pasife aldıysa anında yakala
            if (data.aktif === false) {
              oturumuUygula(user, 'pasif', data);
            } else {
              oturumuUygula(user, data.rol || 'unauthorized', data);
              fcmTokenGuncelle(user.uid).catch(() => {});
            }
          }
          setYukleniyor(false);
        },
        error => {
          console.error('Firestore Takip Hatası:', error);
          setYukleniyor(false);
        }
      );
    });

    // Component kapandığında her iki dinleyiciyi de durdur
    return () => {
      unsubAuth();
      if (unsubFirestore) unsubFirestore();
    };
  }, [durumuTemizle, oturumuUygula]);

  const girisYap = useCallback(
    (user, yeniRol, yeniUserData) => {
      oturumuUygula(user, yeniRol, yeniUserData);
    },
    [oturumuUygula]
  );

  const cikisYap = useCallback(async () => {
    await signOut(auth);
    durumuTemizle();
  }, [durumuTemizle]);

  // Yardımcı Yetki Kontrolleri (Aynı kaldı)
  const isAdmin = useMemo(() => rol === 'admin', [rol]);
  const isKoc = useMemo(() => rol === 'koc' || rol === 'admin', [rol]);
  const isOgrenci = useMemo(() => rol === 'ogrenci', [rol]);
  const isVeli = useMemo(() => rol === 'veli', [rol]);

  const isOwnStudent = useCallback(
    ogrenciData => {
      if (rol === 'admin') return true;
      if (rol !== 'koc') return false;
      return ogrenciData?.kocId === kullanici?.uid;
    },
    [rol, kullanici]
  );

  const canEdit = useCallback(
    ogrenciData => {
      if (rol === 'admin') return true;
      if (rol === 'koc') return ogrenciData?.kocId === kullanici?.uid;
      return false;
    },
    [rol, kullanici]
  );

  const value = useMemo(
    () => ({
      kullanici,
      rol,
      userData,
      yukleniyor,
      girisYap,
      cikisYap,
      isAdmin,
      isKoc,
      isOgrenci,
      isVeli,
      isOwnStudent,
      canEdit,
    }),
    [
      kullanici,
      rol,
      userData,
      yukleniyor,
      girisYap,
      cikisYap,
      isAdmin,
      isKoc,
      isOgrenci,
      isVeli,
      isOwnStudent,
      canEdit,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
