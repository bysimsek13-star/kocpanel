import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';

export default function GununSozu({ ogrenciler = [] }) {
  const { s } = useTheme();
  const [hedef, setHedef] = useState('genel'); // 'genel' veya ogrenciId
  const [metin, setMetin] = useState('');
  const [mevcut, setMevcut] = useState(null);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [kaydedildi, setKaydedildi] = useState(false);

  // Seçilen hedefe göre mevcut mesajı çek
  useEffect(() => {
    setMetin('');
    setMevcut(null);
    const ref = doc(db, 'gunun_sozu', hedef);
    getDoc(ref)
      .then(snap => {
        if (snap.exists()) {
          const veri = snap.data();
          const guncelleme = veri.guncelleme?.toDate?.() || new Date(0);
          const simdi = new Date();
          const bugunBaslangic = new Date(simdi.getFullYear(), simdi.getMonth(), simdi.getDate());
          // Bugün güncellenmişse göster, dünden kalma ise boş bırak
          if (guncelleme >= bugunBaslangic) {
            setMevcut(veri);
            setMetin(veri.metin || '');
          }
        }
      })
      .catch(() => {});
  }, [hedef]);

  const kaydet = async () => {
    if (!metin.trim()) return;
    setKaydediliyor(true);
    try {
      await setDoc(doc(db, 'gunun_sozu', hedef), {
        metin: metin.trim(),
        hedef,
        guncelleme: serverTimestamp(),
      });
      setMevcut({ metin: metin.trim() });
      setKaydedildi(true);
      setTimeout(() => setKaydedildi(false), 3000);
    } catch (e) {
      console.error(e);
    }
    setKaydediliyor(false);
  };

  const seciliIsim =
    hedef === 'genel' ? 'Tüm öğrenciler' : ogrenciler.find(o => o.id === hedef)?.isim || hedef;

  return (
    <div
      style={{
        background: s.surface,
        border: `1px solid ${s.border}`,
        borderRadius: 14,
        padding: '20px 22px',
        marginBottom: 20,
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 700, color: s.text, marginBottom: 16 }}>
        Günün sözü
      </div>

      {/* Hedef seçici */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: s.text3,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 8,
          }}
        >
          Alıcı
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <div
            onClick={() => setHedef('genel')}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              background: hedef === 'genel' ? s.accentSoft : s.surface2,
              color: hedef === 'genel' ? s.accent : s.text2,
              border: `1px solid ${hedef === 'genel' ? s.accent : s.border}`,
              transition: 'all .12s',
            }}
          >
            Tüm öğrenciler
          </div>
          {ogrenciler.map(o => (
            <div
              key={o.id}
              onClick={() => setHedef(o.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                background: hedef === o.id ? s.accentSoft : s.surface2,
                color: hedef === o.id ? s.accent : s.text2,
                border: `1px solid ${hedef === o.id ? s.accent : s.border}`,
                transition: 'all .12s',
              }}
            >
              {o.isim?.split(' ')[0] || o.id}
            </div>
          ))}
        </div>
      </div>

      {/* Mevcut mesaj */}
      {mevcut?.metin && (
        <div
          style={{
            background: s.surface2,
            border: `1px solid ${s.border}`,
            borderLeft: `3px solid ${s.accent}`,
            borderRadius: 10,
            padding: '10px 14px',
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: s.text3,
              marginBottom: 4,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {seciliIsim} — Mevcut
          </div>
          <div style={{ fontSize: 13, color: s.text, lineHeight: 1.6 }}>{mevcut.metin}</div>
        </div>
      )}

      {/* Yazma alanı */}
      <textarea
        value={metin}
        onChange={e => {
          setMetin(e.target.value);
          setKaydedildi(false);
        }}
        placeholder={`${seciliIsim} için bir söz veya mesaj yaz...`}
        rows={3}
        style={{
          width: '100%',
          padding: '12px 14px',
          borderRadius: 10,
          border: `1px solid ${s.border}`,
          background: s.surface2,
          color: s.text,
          fontSize: 13,
          lineHeight: 1.6,
          resize: 'vertical',
          boxSizing: 'border-box',
          marginBottom: 12,
          outline: 'none',
          fontFamily: 'inherit',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={kaydet}
          disabled={kaydediliyor || !metin.trim()}
          style={{
            padding: '9px 22px',
            borderRadius: 10,
            border: 'none',
            background: s.accent,
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            opacity: !metin.trim() || kaydediliyor ? 0.5 : 1,
          }}
        >
          {kaydediliyor ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
        {kaydedildi && (
          <span style={{ fontSize: 12, color: s.success, fontWeight: 600 }}>Kaydedildi</span>
        )}
      </div>
    </div>
  );
}

GununSozu.propTypes = {
  ogrenciler: PropTypes.arrayOf(PropTypes.object),
};
