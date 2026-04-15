import React, { useState } from 'react';
import {
  browserSessionPersistence,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import TemaSecici from '../components/TemaSecici';
import ElsWayLogo from '../components/ElsWayLogo';
import { useToast } from '../components/Toast';
import { Btn, Input } from '../components/Shared';
import { useMobil } from '../hooks/useMediaQuery';

function girisHataMesaji(error) {
  const code = error?.code || '';

  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/wrong-password' ||
    code === 'auth/user-not-found' ||
    code === 'auth/invalid-email'
  ) {
    return 'Email veya şifre hatalı!';
  }

  if (code === 'auth/too-many-requests') {
    return 'Çok fazla başarısız deneme yapıldı. Lütfen biraz sonra tekrar deneyin.';
  }

  if (code === 'auth/network-request-failed') {
    return 'Ağ bağlantısı hatası oluştu. İnternetinizi kontrol edin.';
  }

  return 'Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.';
}

export default function GirisEkrani() {
  const { s } = useTheme();
  const toast = useToast();
  const mobil = useMobil();
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [sifreGoster, setSifreGoster] = useState(false);

  const handleGiris = async () => {
    if (!email.trim() || !sifre) return;

    setYukleniyor(true);
    setHata('');

    try {
      await setPersistence(auth, browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), sifre);
    } catch (error) {
      setHata(girisHataMesaji(error));
    } finally {
      setYukleniyor(false);
    }
  };

  const sifreSifirla = async () => {
    if (!email.trim()) {
      setHata('Lütfen email adresinizi girin.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      toast('Şifre sıfırlama maili gönderildi! Spam klasörünü de kontrol edin.');
      setHata('');
    } catch (error) {
      const code = error?.code || '';
      console.error('Şifre sıfırlama hatası:', code, error?.message);
      if (code === 'auth/invalid-email') {
        setHata('Geçersiz email adresi.');
      } else if (code === 'auth/too-many-requests') {
        setHata('Çok fazla istek gönderildi. Lütfen biraz bekleyin.');
      } else if (code === 'auth/network-request-failed') {
        setHata('Ağ bağlantısı hatası. İnternetinizi kontrol edin.');
      } else {
        // user-not-found veya başka hatalar — koç ile iletişime geçmelerini söyle
        setHata(
          'Mail gönderilemedi. Email adresinizi kontrol edin veya koçunuzla iletişime geçin.'
        );
      }
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: mobil ? 'column' : 'row',
        fontFamily: 'Inter,sans-serif',
        background: s.bg,
      }}
    >
      {!mobil && (
        <div
          style={{
            flex: '0 0 45%',
            background: s.accentGrad,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: 60,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -120,
              right: -120,
              width: 350,
              height: 350,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '50%',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -100,
              left: -100,
              width: 280,
              height: 280,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '50%',
            }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.6)',
                letterSpacing: 2,
                textTransform: 'uppercase',
                marginBottom: 24,
              }}
            >
              YKS / LGS Koçluk Platformu
            </div>
            <div style={{ marginBottom: 16 }}>
              <ElsWayLogo size="hero" variant="onDark" />
            </div>
            <p
              style={{
                fontSize: 18,
                color: 'rgba(255,255,255,0.85)',
                lineHeight: 1.7,
                marginBottom: 48,
                maxWidth: 320,
              }}
            >
              Öğrencilerinin her adımını takip et. Başarıya giden yolu birlikte oluşturun.
            </p>
            {[
              { i: '📅', b: 'Akıllı Program Takibi', a: 'Haftalık, aylık, yıllık programlar' },
              { i: '📊', b: 'Deneme Analizi', a: 'Konu bazlı performans takibi' },
              { i: '💬', b: 'Anlık İletişim', a: 'Koç-öğrenci-veli mesajlaşma' },
              { i: '📈', b: 'Müfredat Takibi', a: 'Ders ders konu başarı analizi' },
            ].map(f => (
              <div
                key={f.b}
                style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  {f.i}
                </div>
                <div>
                  <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{f.b}</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 }}>
                    {f.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: mobil ? 24 : 48,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 400,
            background: s.surface,
            borderRadius: 24,
            padding: mobil ? '32px 24px' : 44,
            boxShadow: s.shadow,
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
              <ElsWayLogo size="card" variant="onLight" />
            </div>
            <div style={{ fontSize: 13, color: s.text3 }}>YKS / LGS Koçluk & Danışmanlık</div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: s.text2, fontSize: 13, marginBottom: 7, fontWeight: 500 }}>
              Email
            </div>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@ornek.com"
              onKeyDown={e => e.key === 'Enter' && handleGiris()}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ color: s.text2, fontSize: 13, marginBottom: 7, fontWeight: 500 }}>
              Şifre
            </div>
            <div style={{ position: 'relative' }}>
              <Input
                type={sifreGoster ? 'text' : 'password'}
                value={sifre}
                onChange={e => setSifre(e.target.value)}
                placeholder="••••••••"
                onKeyDown={e => e.key === 'Enter' && handleGiris()}
                style={{ paddingRight: 42 }}
              />
              <button
                onClick={() => setSifreGoster(v => !v)}
                tabIndex={-1}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  color: s.text3,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {sifreGoster ? (
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx={12} cy={12} r={3} />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div style={{ textAlign: 'right', marginBottom: 20 }}>
            <span
              onClick={sifreSifirla}
              style={{ fontSize: 12, color: s.accent, cursor: 'pointer', fontWeight: 500 }}
            >
              Şifremi unuttum
            </span>
          </div>
          {hata && (
            <div
              style={{
                color: s.tehlika,
                fontSize: 13,
                marginBottom: 16,
                padding: '10px 14px',
                background: s.tehlikaSoft,
                border: `1px solid ${s.border}`,
                borderRadius: 10,
              }}
            >
              {hata}
            </div>
          )}
          <Btn
            onClick={handleGiris}
            disabled={yukleniyor || !email.trim() || !sifre}
            style={{ width: '100%', padding: 14, fontSize: 15 }}
          >
            {yukleniyor ? 'Giriş yapılıyor...' : 'Giriş Yap →'}
          </Btn>
          <TemaSecici variant="giris" />
        </div>
      </div>
    </div>
  );
}
