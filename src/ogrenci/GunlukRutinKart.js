import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { bugunStr } from '../utils/tarih';
import { useToast } from '../components/Toast';
import { logIstemciHatasi } from '../utils/izleme';

export default function GunlukRutinKart({ ogrenciId, s }) {
  const toast = useToast();
  const BUGUN = bugunStr();
  const [uyku, setUyku] = useState(7);
  const [su, setSu] = useState(false);
  const [egzersiz, setEgzersiz] = useState(false);
  const [hissediyorum, setHissediyorum] = useState('');
  const [kaydedildi, setKaydedildi] = useState(false);
  const [kaydediliyor, setKaydediliyor] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'ogrenciler', ogrenciId, 'rutin', BUGUN))
      .then(snap => {
        if (snap.exists()) {
          const d = snap.data();
          setUyku(d.uyku ?? 7);
          setSu(d.su ?? false);
          setEgzersiz(d.egzersiz ?? false);
          setHissediyorum(d.not ?? '');
          setKaydedildi(true);
        }
      })
      .catch(e => {
        logIstemciHatasi({
          error: e,
          info: 'Rutin verisi alınamadı',
          kaynak: 'GunlukRutinKart',
          ekstra: { ogrenciId },
        });
      });
  }, [ogrenciId]);

  const kaydet = async () => {
    setKaydediliyor(true);
    try {
      await setDoc(
        doc(db, 'ogrenciler', ogrenciId, 'rutin', BUGUN),
        { tarih: BUGUN, uyku: Number(uyku), su, egzersiz, not: hissediyorum.trim() },
        { merge: true }
      );
      // bugunRutinTarihi → rutinAggregateGuncelle CF yazar
      setKaydedildi(true);
    } catch (e) {
      logIstemciHatasi({
        error: e,
        info: 'Rutin kaydedilemedi',
        kaynak: 'GunlukRutinKart',
        ekstra: { ogrenciId },
      });
      toast('Kaydedilemedi', 'error');
    }
    setKaydediliyor(false);
  };

  return (
    <div
      style={{
        background: s.surface,
        border: `1px solid ${s.border}`,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
        boxShadow: s.shadowCard || s.shadow,
        transition: 'box-shadow .18s ease',
      }}
      onMouseEnter={e =>
        (e.currentTarget.style.boxShadow = s.shadowHover ?? s.shadowCard ?? s.shadow)
      }
      onMouseLeave={e => (e.currentTarget.style.boxShadow = s.shadowCard ?? s.shadow)}
    >
      <div
        style={{
          padding: '14px 18px',
          borderBottom: `1px solid ${s.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600, color: s.text }}>Günlük rutin</div>
        {kaydedildi && (
          <span style={{ fontSize: 11, color: s.accent, fontWeight: 600 }}>Kaydedildi</span>
        )}
      </div>
      <div style={{ padding: '14px 18px' }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: s.text, marginBottom: 8 }}>
            Bugün nasıl hissediyorsun?
          </div>
          <textarea
            value={hissediyorum}
            onChange={e => setHissediyorum(e.target.value)}
            placeholder="Bugünkü ruh halini, motivasyonunu veya aklındakileri yaz..."
            rows={3}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 10,
              border: `1px solid ${s.border}`,
              background: s.surface2,
              color: s.text,
              fontSize: 13,
              lineHeight: 1.6,
              resize: 'none',
              boxSizing: 'border-box',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              fontSize: 11,
              color: s.text3,
              marginBottom: 8,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Uyku süresi
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[5, 6, 7, 8, 9, 10].map(n => (
              <div
                key={n}
                onClick={() => setUyku(n)}
                style={{
                  padding: '6px 13px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                  background: uyku === n ? s.accentSoft : s.surface2,
                  color: uyku === n ? s.accent : s.text3,
                  border: `1px solid ${uyku === n ? s.accent : s.border}`,
                  transition: 'all .12s',
                }}
              >
                {n}s
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          {[
            { val: su, set: setSu, label: 'Su içtim' },
            { val: egzersiz, set: setEgzersiz, label: 'Egzersiz yaptım' },
          ].map((item, i) => (
            <div
              key={i}
              onClick={() => item.set(!item.val)}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 10,
                cursor: 'pointer',
                background: item.val ? s.accentSoft : s.surface2,
                border: `1px solid ${item.val ? s.accent : s.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all .12s',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, color: item.val ? s.accent : s.text3 }}>
                {item.label}
              </span>
              {item.val && (
                <span style={{ fontSize: 11, color: s.accent, fontWeight: 700 }}>✓</span>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={kaydet}
          disabled={kaydediliyor}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: 10,
            border: `1px solid ${s.border}`,
            background: s.surface2,
            color: s.text,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all .15s',
          }}
        >
          {kaydediliyor ? 'Kaydediliyor...' : kaydedildi ? 'Güncelle' : 'Kaydet'}
        </button>
      </div>
    </div>
  );
}

GunlukRutinKart.propTypes = {
  ogrenciId: PropTypes.string.isRequired,
  s: PropTypes.object.isRequired,
};
