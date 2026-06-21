import React, { useState } from 'react';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { GUNCEL_SOZLESME_SURUMU } from '../constants/uygulama';

const YASAL_LINKLER = [
  { ad: 'Mesafeli Satış Sözleşmesi', url: 'https://elsway.com.tr/sozlesme.html' },
  { ad: 'Ön Bilgilendirme Formu', url: 'https://elsway.com.tr/on-bilgilendirme.html' },
  { ad: 'KVKK Aydınlatma Metni', url: 'https://elsway.com.tr/kvkk.html' },
  { ad: 'Açık Rıza Beyanı', url: 'https://elsway.com.tr/acik-riza.html' },
  { ad: 'İade ve Cayma Politikası', url: 'https://elsway.com.tr/iade.html' },
  { ad: 'Çerez Politikası', url: 'https://elsway.com.tr/cerez.html' },
  { ad: 'Gizlilik Politikası', url: 'https://elsway.com.tr/gizlilik.html' },
];

export default function SozlesmeOnayModal({ uid, onOnaylandi }) {
  const { s } = useTheme();
  const [onayladi, setOnayladi] = useState(false);
  const [kaydediyor, setKaydediyor] = useState(false);
  const [hata, setHata] = useState('');

  const onayla = async () => {
    if (!onayladi || kaydediyor) return;
    setKaydediyor(true);
    setHata('');
    try {
      await updateDoc(doc(db, 'kullanicilar', uid), {
        sozlesmeOnay: {
          onaylandi: true,
          surum: GUNCEL_SOZLESME_SURUMU,
          tarih: serverTimestamp(),
        },
      });
      onOnaylandi();
    } catch {
      setHata('Kayıt sırasında hata oluştu. Lütfen tekrar deneyin.');
      setKaydediyor(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          background: s.surface,
          border: `1px solid ${s.border}`,
          borderRadius: 20,
          padding: '32px 28px',
          maxWidth: 480,
          width: '100%',
          boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 800, color: s.text, marginBottom: 8 }}>
          Hizmet Sözleşmesi
        </div>
        <div style={{ fontSize: 14, color: s.text2, marginBottom: 20, lineHeight: 1.6 }}>
          ElsWay'i kullanmaya devam etmek için aşağıdaki belgeleri inceleyip onaylamanız
          gerekmektedir.
        </div>

        <div
          style={{
            background: s.surface2 || s.bg,
            border: `1px solid ${s.border}`,
            borderRadius: 12,
            padding: '14px 16px',
            marginBottom: 20,
          }}
        >
          {YASAL_LINKLER.map(({ ad, url }) => (
            <div key={url} style={{ padding: '6px 0', borderBottom: `1px solid ${s.border}` }}>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: 13,
                  color: s.accent || '#5B4FE8',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                {ad} ↗
              </a>
            </div>
          ))}
        </div>

        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            cursor: 'pointer',
            marginBottom: 20,
          }}
        >
          <input
            type="checkbox"
            checked={onayladi}
            onChange={e => setOnayladi(e.target.checked)}
            style={{ marginTop: 3, flexShrink: 0, accentColor: s.accent || '#5B4FE8' }}
          />
          <span style={{ fontSize: 13, color: s.text2, lineHeight: 1.55 }}>
            Yukarıdaki tüm belgeleri okudum, içeriklerini anladım ve kabul ediyorum.
          </span>
        </label>

        {hata && (
          <div
            style={{
              fontSize: 12,
              color: '#dc2626',
              marginBottom: 12,
              padding: '8px 12px',
              background: '#fee2e2',
              borderRadius: 8,
            }}
          >
            {hata}
          </div>
        )}

        <button
          onClick={onayla}
          disabled={!onayladi || kaydediyor}
          style={{
            width: '100%',
            padding: '13px',
            background: onayladi && !kaydediyor ? s.accent || '#5B4FE8' : '#9CA3AF',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 700,
            cursor: onayladi && !kaydediyor ? 'pointer' : 'not-allowed',
            fontFamily: 'Inter, sans-serif',
            transition: 'background 0.15s',
          }}
        >
          {kaydediyor ? 'Kaydediliyor...' : 'Onayla ve Devam Et'}
        </button>
      </div>
    </div>
  );
}
