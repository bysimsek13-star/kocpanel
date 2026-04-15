import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useGunlukTarih } from '../../utils/tarih';
import { Btn } from '../../components/Shared';
import BugunProgrami from './BugunProgrami';

// ─── Rutin girişi (öğrencinin doldurduğu) ──────────────────────────────────────
export default function RutinGirisFormu({ ogrenciId, s, onKaydet }) {
  const { bugun: BUGUN } = useGunlukTarih();
  const [uyku, setUyku] = useState(7);
  const [su, setSu] = useState(false);
  const [egzersiz, setEgzersiz] = useState(false);
  const [not, setNot] = useState('');
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [kaydedildi, setKaydedildi] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'ogrenciler', ogrenciId, 'rutin', BUGUN))
      .then(snap => {
        if (snap.exists()) {
          const d = snap.data();
          setUyku(d.uyku ?? 7);
          setSu(d.su ?? false);
          setEgzersiz(d.egzersiz ?? false);
          setNot(d.not ?? '');
          setKaydedildi(true);
        }
      })
      .catch(() => {});
  }, [ogrenciId, BUGUN]);

  const kaydet = async () => {
    setKaydediliyor(true);
    try {
      await setDoc(
        doc(db, 'ogrenciler', ogrenciId, 'rutin', BUGUN),
        {
          tarih: BUGUN,
          uyku: Number(uyku),
          su,
          egzersiz,
          not: not.trim(),
          guncelleme: serverTimestamp(),
        },
        { merge: true }
      );
      setKaydedildi(true);
      if (onKaydet) onKaydet();
    } catch (e) {
      console.error(e);
    }
    setKaydediliyor(false);
  };

  return (
    <div>
      {/* Bugünün programı — program_v2'den */}
      <BugunProgrami ogrenciId={ogrenciId} s={s} />

      {/* Rutin formu */}
      <div style={{ padding: 16, background: s.surface2, borderRadius: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: s.text, marginBottom: 14 }}>
          Bugünkü Rutin
          {kaydedildi && (
            <span style={{ color: s.success, fontSize: 11, marginLeft: 8 }}>Kaydedildi</span>
          )}
        </div>

        {/* Uyku */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: s.text2, marginBottom: 6 }}>Uyku süresi</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[4, 5, 6, 7, 8, 9, 10].map(s2 => (
              <div
                key={s2}
                onClick={() => setUyku(s2)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 700,
                  background: uyku === s2 ? s.accentSoft : s.surface,
                  color: uyku === s2 ? s.accent : s.text3,
                  border: `1px solid ${uyku === s2 ? s.accent : s.border}`,
                }}
              >
                {s2}s
              </div>
            ))}
          </div>
          {uyku < 6 && (
            <div style={{ fontSize: 11, color: s.tehlika, marginTop: 4 }}>
              6 saatten az uyku performansı etkileyebilir
            </div>
          )}
        </div>

        {/* Su + Egzersiz */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          {[
            { key: 'su', val: su, set: setSu, label: 'Su içtim' },
            { key: 'egzersiz', val: egzersiz, set: setEgzersiz, label: 'Egzersiz yaptım' },
          ].map(item => (
            <div
              key={item.key}
              onClick={() => item.set(!item.val)}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 10,
                cursor: 'pointer',
                background: item.val ? s.okSoft : s.surface,
                border: `1px solid ${item.val ? s.success : s.border}`,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: item.val ? s.success : s.text3 }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Not */}
        <textarea
          value={not}
          onChange={e => setNot(e.target.value)}
          placeholder="Bugün nasıl hissediyorsun? (isteğe bağlı)"
          style={{
            width: '100%',
            minHeight: 60,
            padding: '10px 12px',
            borderRadius: 10,
            border: `1px solid ${s.border}`,
            background: s.surface,
            color: s.text,
            fontSize: 12,
            resize: 'vertical',
            boxSizing: 'border-box',
            marginBottom: 12,
          }}
        />

        <Btn onClick={kaydet} disabled={kaydediliyor} style={{ width: '100%' }}>
          {kaydediliyor ? 'Kaydediliyor...' : kaydedildi ? 'Güncelle' : 'Kaydet'}
        </Btn>
      </div>
    </div>
  );
}

RutinGirisFormu.propTypes = {
  ogrenciId: PropTypes.string.isRequired,
  s: PropTypes.object.isRequired,
  onKaydet: PropTypes.func,
};
