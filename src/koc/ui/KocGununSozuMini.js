import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

export default function KocGununSozuMini({ s }) {
  const [metin, setMetin] = useState('');
  const [durum, setDurum] = useState(null); // null | 'kaydediliyor' | 'tamam'

  const kaydet = async () => {
    if (!metin.trim()) return;
    setDurum('kaydediliyor');
    try {
      await setDoc(
        doc(db, 'gunun_sozu', 'genel'),
        { metin: metin.trim(), guncelleme: serverTimestamp() },
        { merge: true }
      );
      setDurum('tamam');
      setTimeout(() => setDurum(null), 3000);
    } catch {
      setDurum(null);
    }
  };

  return (
    <div
      style={{
        background: s.surface,
        border: `1px solid ${s.border}`,
        borderRadius: 14,
        padding: '18px 20px',
        marginBottom: 20,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: s.text, marginBottom: 12 }}>
        Günün sözü
      </div>
      <textarea
        value={metin}
        onChange={e => {
          setMetin(e.target.value);
          if (durum === 'tamam') setDurum(null);
        }}
        placeholder="Tüm öğrencilere bir mesaj veya söz yaz..."
        rows={2}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '10px 12px',
          borderRadius: 10,
          border: `1px solid ${s.border}`,
          background: s.surface2,
          color: s.text,
          fontSize: 13,
          resize: 'none',
          outline: 'none',
          fontFamily: 'inherit',
          marginBottom: 10,
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={kaydet}
          disabled={!metin.trim() || durum === 'kaydediliyor'}
          style={{
            padding: '8px 20px',
            borderRadius: 10,
            border: 'none',
            background: s.accent,
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: !metin.trim() || durum === 'kaydediliyor' ? 'not-allowed' : 'pointer',
            opacity: !metin.trim() || durum === 'kaydediliyor' ? 0.5 : 1,
          }}
        >
          {durum === 'kaydediliyor' ? 'Gönderiliyor...' : 'Gönder'}
        </button>
        {durum === 'tamam' && (
          <span style={{ fontSize: 12, color: s.success ?? '#22C55E', fontWeight: 600 }}>
            Gönderildi ✓
          </span>
        )}
      </div>
    </div>
  );
}

KocGununSozuMini.propTypes = { s: PropTypes.object.isRequired };
