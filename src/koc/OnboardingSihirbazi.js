import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { Btn } from '../components/Shared';

const ADIMLAR = [
  {
    no: 1,
    emoji: '👤',
    baslik: 'İlk öğrencini ekle',
    aciklama: 'Öğrenci ekleyerek başla. İsim, email ve sınıf bilgilerini girerek sisteme kaydet.',
    butonMetin: 'Öğrenci Ekle →',
    aksiyon: 'ogrenciEkle',
  },
  {
    no: 2,
    emoji: '📅',
    baslik: 'Haftalık program kur',
    aciklama:
      'Öğrencin için haftalık çalışma programı oluştur. Ders ve saat planlamasını buradan yaparsın.',
    butonMetin: 'Programa Git →',
    aksiyon: 'haftalikprogram',
  },
  {
    no: 3,
    emoji: '🎯',
    baslik: 'İlk hedefi belirle',
    aciklama: 'Net, puan veya saat hedefi koy. Öğrencinin ilerlemesini takip etmeni kolaylaştırır.',
    butonMetin: 'Hedef Belirle →',
    aksiyon: 'hedeftakibi',
  },
];

async function onboardingBitir(kullaniciUid) {
  try {
    await updateDoc(doc(db, 'kullanicilar', kullaniciUid), {
      onboardingTamamlandi: true,
    });
  } catch (_) {}
}

export default function OnboardingSihirbazi({ kullaniciUid, onTamamla, onNav, onOgrenciEkle }) {
  const { s } = useTheme();
  const [aktifAdim, setAktifAdim] = useState(0);
  const [yukleniyor, setYukleniyor] = useState(false);

  const adim = ADIMLAR[aktifAdim];
  const sonAdim = aktifAdim === ADIMLAR.length - 1;

  const ilerle = async () => {
    if (!sonAdim) {
      // Önce adımı ilerlet, sonra aksiyonu tetikle — böylece sihirbaz kapanmaz
      setAktifAdim(a => a + 1);
      if (adim.aksiyon === 'ogrenciEkle') {
        onOgrenciEkle?.();
      } else {
        onNav?.(adim.aksiyon);
      }
    } else {
      setYukleniyor(true);
      await onboardingBitir(kullaniciUid);
      setYukleniyor(false);
      onTamamla?.();
    }
  };

  const atla = async () => {
    setYukleniyor(true);
    await onboardingBitir(kullaniciUid);
    setYukleniyor(false);
    onTamamla?.();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3000,
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        style={{
          background: s.surface,
          borderRadius: 24,
          padding: '40px 44px',
          width: 460,
          maxWidth: '95vw',
          boxShadow: s.shadow,
          border: `1px solid ${s.border}`,
        }}
      >
        {/* Başlık */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: s.accent,
              marginBottom: 8,
              letterSpacing: '0.05em',
            }}
          >
            HOŞ GELDİN 👋
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: s.text }}>
            ElsWay&apos;e Başlarken
          </div>
          <div style={{ fontSize: 13, color: s.text3, marginTop: 6 }}>
            3 adımda kurulumunu tamamla
          </div>
        </div>

        {/* Adım göstergesi */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          {ADIMLAR.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === aktifAdim ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: i <= aktifAdim ? s.accent : s.border,
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>

        {/* Aktif adım kartı */}
        <div
          style={{
            background: s.surface2,
            borderRadius: 16,
            padding: '28px',
            textAlign: 'center',
            marginBottom: 24,
            border: `1px solid ${s.border}`,
          }}
        >
          <div style={{ fontSize: 52, marginBottom: 12 }}>{adim.emoji}</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: s.text, marginBottom: 8 }}>
            {adim.no}. {adim.baslik}
          </div>
          <div style={{ fontSize: 13, color: s.text2, lineHeight: 1.6 }}>{adim.aciklama}</div>
        </div>

        {/* Butonlar */}
        <Btn
          onClick={ilerle}
          disabled={yukleniyor}
          style={{ width: '100%', padding: 14, fontSize: 15, marginBottom: 10 }}
        >
          {yukleniyor ? 'Kaydediliyor...' : sonAdim ? '✅ Kurulumu Tamamla' : adim.butonMetin}
        </Btn>

        <button
          onClick={atla}
          disabled={yukleniyor}
          style={{
            width: '100%',
            background: 'none',
            border: 'none',
            color: s.text3,
            fontSize: 12,
            cursor: 'pointer',
            padding: 8,
          }}
        >
          Şimdi atla, sonra yaparım
        </button>
      </div>
    </div>
  );
}

OnboardingSihirbazi.propTypes = {
  kullaniciUid: PropTypes.string.isRequired,
  onTamamla: PropTypes.func,
  onNav: PropTypes.func,
  onOgrenciEkle: PropTypes.func,
};
