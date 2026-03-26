/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { getS } from '../theme';
import { Btn, Input } from '../components/Shared';

export default function GirisEkrani({ tema, tercih, setTema, onGiris }) {
  const s = getS(tema);
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const girisYap = async () => {
    setYukleniyor(true); setHata('');
    try {
      const sonuc = await signInWithEmailAndPassword(auth, email, sifre);
      const kd = await getDoc(doc(db, 'kullanicilar', sonuc.user.uid));
      let rol = 'koc'; let data = null;
      if (kd.exists()) { rol = kd.data().rol || 'ogrenci'; data = kd.data(); }
      onGiris(sonuc.user, rol, data);
    } catch (e) { setHata('Email veya şifre hatalı!'); }
    setYukleniyor(false);
  };

  const kucukEkran = window.innerWidth < 768;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: kucukEkran ? 'column' : 'row', fontFamily: 'Inter,sans-serif', background: s.bg }}>
      {/* SOL */}
      {!kucukEkran && (
        <div style={{ flex: '0 0 45%', background: s.accentGrad, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
          <div style={{ position: 'absolute', top: '-120px', right: '-120px', width: '350px', height: '350px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '280px', height: '280px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: '40%', right: '-60px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '24px' }}>YKS / LGS Koçluk Platformu</div>
            <h1 style={{ fontSize: '52px', fontWeight: '800', marginBottom: '16px', letterSpacing: '-1px', lineHeight: '1.1' }}>
              <span style={{ color: 'white' }}>Els</span><span style={{ color: 'rgba(255,255,255,0.6)' }}>Way</span>
            </h1>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.7', marginBottom: '48px', maxWidth: '320px' }}>
              Öğrencilerinin her adımını takip et. Başarıya giden yolu birlikte oluşturun.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { icon: '📅', baslik: 'Akıllı Program Takibi', alt: 'Haftalık görevler, tamamlama oranları' },
                { icon: '📊', baslik: 'Deneme Analizi', alt: 'Net hesaplama, konu bazlı performans' },
                { icon: '💬', baslik: 'Anlık İletişim', alt: 'Koç-öğrenci-veli mesajlaşma' },
                { icon: '📈', baslik: 'Verimlilik Skoru', alt: 'Çalışma saati ve etkinlik takibi' },
              ].map(f => (
                <div key={f.baslik} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0, backdropFilter: 'blur(8px)' }}>
                    {f.icon}
                  </div>
                  <div>
                    <div style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>{f.baslik}</div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '2px' }}>{f.alt}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SAĞ */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: kucukEkran ? '24px' : '48px', minHeight: kucukEkran ? '100vh' : 'auto' }}>
        <div style={{ width: '100%', maxWidth: '400px', background: s.surface, borderRadius: '24px', padding: kucukEkran ? '32px 24px' : '44px', boxShadow: s.shadow }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '34px', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '8px' }}>
              <span style={{ color: '#5B4FE8' }}>Els</span><span style={{ color: '#8B7FF5' }}>Way</span>
            </div>
            <div style={{ fontSize: '13px', color: s.text3 }}>YKS / LGS Koçluk & Danışmanlık</div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ color: s.text2, fontSize: '13px', marginBottom: '7px', fontWeight: '500' }}>Email</div>
            <Input tema={tema} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@ornek.com" />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ color: s.text2, fontSize: '13px', marginBottom: '7px', fontWeight: '500' }}>Şifre</div>
            <Input tema={tema} type="password" value={sifre} onChange={e => setSifre(e.target.value)} placeholder="••••••••" />
          </div>

          {hata && <div style={{ color: '#F43F5E', fontSize: '13px', marginBottom: '16px', padding: '10px 14px', background: 'rgba(244,63,94,0.1)', borderRadius: '10px', border: '1px solid rgba(244,63,94,0.2)' }}>{hata}</div>}

          <Btn tema={tema} onClick={girisYap} disabled={yukleniyor || !email || !sifre} style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
            {yukleniyor ? 'Giriş yapılıyor...' : 'Giriş Yap →'}
          </Btn>

          {/* TEMA SEÇİCİ */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '20px', background: s.surface2, padding: '4px', borderRadius: '10px' }}>
            {[{ key: 'otomatik', icon: '⚡', label: 'Otomatik' }, { key: 'light', icon: '☀️', label: 'Gündüz' }, { key: 'dark', icon: '🌙', label: 'Gece' }].map(t => (
              <div key={t.key} onClick={() => setTema && setTema(t.key)}
                style={{ flex: 1, padding: '7px', borderRadius: '7px', background: tercih === t.key ? s.surface : 'transparent', color: tercih === t.key ? s.accent : s.text3, cursor: 'pointer', textAlign: 'center', fontSize: '12px', fontWeight: tercih === t.key ? '600' : '400', transition: 'all 0.15s', boxShadow: tercih === t.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
                {t.icon} {t.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
