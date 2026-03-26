/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { getS } from '../theme';
import { Btn, Input } from '../components/Shared';

export default function OgrenciEkleModal({ tema, onKapat, onEkle }) {
  const s = getS(tema);
  const [isim, setIsim] = useState('');
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [veliEmail, setVeliEmail] = useState('');
  const [veliSifre, setVeliSifre] = useState('');
  const [tur, setTur] = useState('TYT');
  const [beklenenSaat, setBeklenenSaat] = useState(6);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState('');

  const ekle = async () => {
    if (!isim || !email || !sifre) return;
    if (sifre.length < 6) { setHata('Sifre en az 6 karakter!'); return; }
    setYukleniyor(true); setHata('');
    try {
      const oS = await createUserWithEmailAndPassword(auth, email, sifre);
      const oUid = oS.user.uid;
      let vUid = null;
      if (veliEmail && veliSifre && veliSifre.length >= 6) {
        try {
          const vS = await createUserWithEmailAndPassword(auth, veliEmail, veliSifre);
          vUid = vS.user.uid;
          await setDoc(doc(db, 'kullanicilar', vUid), { email: veliEmail, rol: 'veli', ogrenciUid: oUid, ogrenciIsim: isim, olusturma: new Date() });
        } catch (e) { if (e.code !== 'auth/email-already-in-use') throw e; }
      }
      await setDoc(doc(db, 'kullanicilar', oUid), { isim, email, tur, rol: 'ogrenci', tamamlama: 0, beklenenSaat, veliEmail: veliEmail || '', veliUid: vUid || '', olusturma: new Date() });
      await setDoc(doc(db, 'ogrenciler', oUid), { isim, email, tur, tamamlama: 0, beklenenSaat, veliEmail: veliEmail || '', olusturma: new Date() });
      onEkle(); onKapat();
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') setHata('Bu email zaten kullanımda!');
      else setHata('Hata: ' + e.message);
    }
    setYukleniyor(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflowY: 'auto', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: s.surface, border: `1px solid ${s.border}`, borderRadius: '20px', padding: '36px', width: '440px', margin: '20px', boxShadow: s.shadow }}>
        <div style={{ color: s.text, fontSize: '18px', fontWeight: '700', marginBottom: '24px' }}>Yeni Ogrenci Ekle</div>

        <div style={{ color: s.accent, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Ogrenci Bilgileri</div>
        {[{ l: 'Ad Soyad', v: isim, fn: setIsim, p: 'Ad Soyad', t: 'text' }, { l: 'Email', v: email, fn: setEmail, p: 'email@ornek.com', t: 'email' }, { l: 'Sifre', v: sifre, fn: setSifre, p: 'En az 6 karakter', t: 'password' }].map(f => (
          <div key={f.l} style={{ marginBottom: '12px' }}>
            <div style={{ color: s.text2, fontSize: '12px', marginBottom: '5px', fontWeight: '500' }}>{f.l}</div>
            <Input tema={tema} type={f.t} value={f.v} onChange={e => f.fn(e.target.value)} placeholder={f.p} />
          </div>
        ))}

        <div style={{ marginBottom: '12px' }}>
          <div style={{ color: s.text2, fontSize: '12px', marginBottom: '5px', fontWeight: '500' }}>Gunluk Beklenen Calisma</div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[4, 5, 6, 7, 8].map(n => (
              <div key={n} onClick={() => setBeklenenSaat(n)} style={{ flex: 1, padding: '9px', borderRadius: '9px', border: beklenenSaat === n ? `2px solid ${s.accent}` : `1px solid ${s.border}`, background: beklenenSaat === n ? s.accentSoft : s.surface2, color: beklenenSaat === n ? s.accent : s.text2, cursor: 'pointer', textAlign: 'center', fontSize: '13px', fontWeight: '600' }}>{n}s</div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: s.text2, fontSize: '12px', marginBottom: '5px', fontWeight: '500' }}>Sinav Turu</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['TYT', 'TYT+AYT', 'LGS'].map(t => (
              <div key={t} onClick={() => setTur(t)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: tur === t ? `2px solid ${s.accent}` : `1px solid ${s.border}`, background: tur === t ? s.accentSoft : s.surface2, color: tur === t ? s.accent : s.text2, cursor: 'pointer', textAlign: 'center', fontSize: '13px', fontWeight: '500' }}>{t}</div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${s.border}`, paddingTop: '16px', marginBottom: '16px' }}>
          <div style={{ color: '#10B981', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Veli (Istege Bagli)</div>
          {[{ l: 'Veli Email', v: veliEmail, fn: setVeliEmail, p: 'veli@email.com', t: 'email' }, { l: 'Veli Sifre', v: veliSifre, fn: setVeliSifre, p: 'En az 6 karakter', t: 'password' }].map(f => (
            <div key={f.l} style={{ marginBottom: '10px' }}>
              <div style={{ color: s.text2, fontSize: '12px', marginBottom: '5px', fontWeight: '500' }}>{f.l}</div>
              <Input tema={tema} type={f.t} value={f.v} onChange={e => f.fn(e.target.value)} placeholder={f.p} />
            </div>
          ))}
        </div>

        {hata && <div style={{ color: '#F43F5E', fontSize: '13px', marginBottom: '14px', padding: '10px 14px', background: 'rgba(244,63,94,0.1)', borderRadius: '8px' }}>{hata}</div>}
        <div style={{ display: 'flex', gap: '10px' }}>
          <Btn tema={tema} onClick={onKapat} variant="ghost" style={{ flex: 1 }}>Iptal</Btn>
          <Btn tema={tema} onClick={ekle} disabled={!isim || !email || !sifre || yukleniyor} style={{ flex: 2 }}>{yukleniyor ? 'Ekleniyor...' : 'Ekle'}</Btn>
        </div>
      </div>
    </div>
  );
}
