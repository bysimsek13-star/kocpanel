/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useTheme, getS } from './theme';

// Pages
import GirisEkrani from './pages/GirisEkrani';
import VeliPaneli from './pages/VeliPaneli';
import OgrenciPaneli from './pages/OgrenciPaneli';
import KocPaneli from './pages/KocPaneli';

function App() {
  const { tema, tercih, setTema } = useTheme();
  const [kullanici, setKullanici] = useState(null);
  const [rol, setRol] = useState('');
  const [userData, setUserData] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const kd = await getDoc(doc(db, 'kullanicilar', user.uid));
          let r = 'koc'; let d = null;
          if (kd.exists()) { r = kd.data().rol || 'ogrenci'; d = kd.data(); }
          setKullanici(user); setRol(r); setUserData(d);
        } catch (e) { setKullanici(user); setRol('koc'); }
      } else {
        setKullanici(null); setRol(''); setUserData(null);
      }
      setYukleniyor(false);
    });
    return () => unsub();
  }, []);

  const girisYap = (u, r, d) => { setKullanici(u); setRol(r); setUserData(d); };
  const cikisYap = async () => { await signOut(auth); setKullanici(null); setRol(''); setUserData(null); };

  const s = getS(tema);
  useEffect(() => { document.body.style.background = s.bg; document.body.style.transition = 'background 0.5s'; }, [tema]);

  if (yukleniyor) return (
    <div style={{ minHeight: '100vh', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter,sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '16px' }}>
          <span style={{ color: '#5B4FE8' }}>Els</span><span style={{ color: '#8B7FF5' }}>Way</span>
        </div>
        <div style={{ color: s.text3, fontSize: '14px' }}>Yükleniyor...</div>
      </div>
    </div>
  );

  if (kullanici && rol === 'ogrenci') return <OgrenciPaneli tema={tema} kullanici={kullanici} ogrenciData={userData} onCikis={cikisYap} />;
  if (kullanici && rol === 'veli') return <VeliPaneli tema={tema} kullanici={kullanici} veliData={userData} onCikis={cikisYap} />;
  if (kullanici) return <KocPaneli tema={tema} tercih={tercih} setTema={setTema} kullanici={kullanici} onCikis={cikisYap} />;
  return <GirisEkrani tema={tema} tercih={tercih} setTema={setTema} onGiris={girisYap} />;
}

export default App;
