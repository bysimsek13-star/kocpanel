import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { turdenBransDersler } from '../utils/sinavUtils';
import { bugunStr } from '../utils/tarih';
import { KONULAR } from '../data/konular';

const RUTIN_ALANLARI = [
  { key: 'uyku', label: '😴 Uyku' },
  { key: 'su', label: '💧 Su' },
  { key: 'egzersiz', label: '🏃 Egzersiz' },
];

function netHesapla(d, y) {
  const dogru = parseFloat(d) || 0;
  const yanlis = parseFloat(y) || 0;
  return Math.max(0, dogru - yanlis / 4).toFixed(2);
}

function KonuSatiri({ konuAdi, veri, onChange }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '5px 0',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        flexWrap: 'wrap',
      }}
    >
      <span style={{ flex: 1, fontSize: 12, minWidth: 120 }}>{konuAdi}</span>
      {['dogru', 'yanlis', 'bos'].map(alan => (
        <input
          key={alan}
          type="number"
          min={0}
          placeholder={alan === 'dogru' ? 'D' : alan === 'yanlis' ? 'Y' : 'B'}
          value={veri?.[alan] ?? ''}
          onChange={e => onChange(alan, e.target.value)}
          style={{
            width: 48,
            padding: '4px 6px',
            borderRadius: 6,
            border: '1px solid #e2e8f0',
            fontSize: 12,
            textAlign: 'center',
            outline: 'none',
          }}
        />
      ))}
      <span style={{ fontSize: 11, color: '#6b7280', minWidth: 48, textAlign: 'right' }}>
        Net: {netHesapla(veri?.dogru, veri?.yanlis)}
      </span>
    </div>
  );
}

function DersBolum({ ders, dersVeri, onKonuChange, s }) {
  const [acik, setAcik] = useState(false);
  const konular = KONULAR[ders.id] || [];

  return (
    <div
      style={{
        background: s.surface,
        border: `1px solid ${s.border}`,
        borderRadius: 12,
        marginBottom: 8,
        overflow: 'hidden',
      }}
    >
      <div
        onClick={() => setAcik(a => !a)}
        style={{
          padding: '11px 16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{ width: 3, height: 16, borderRadius: 2, background: ders.renk, flexShrink: 0 }}
        />
        <span style={{ fontSize: 13, fontWeight: 600, color: s.text, flex: 1 }}>{ders.label}</span>
        <span style={{ fontSize: 11, color: s.text3 }}>{konular.length} konu</span>
        <span style={{ color: s.text3, fontSize: 12 }}>{acik ? '▲' : '▼'}</span>
      </div>
      {acik && (
        <div style={{ padding: '0 16px 12px' }}>
          {konular.map(konu => (
            <KonuSatiri
              key={konu}
              konuAdi={konu}
              veri={dersVeri?.[konu]}
              onChange={(alan, deger) => onKonuChange(ders.id, konu, alan, deger)}
            />
          ))}
          {konular.length === 0 && (
            <div style={{ fontSize: 12, color: '#9ca3af', padding: '8px 0' }}>
              Konu listesi bulunamadı
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function OgrenciDetaySoruRutin({ ogrenci, s }) {
  const [tarih, setTarih] = useState(bugunStr());
  const [rutin, setRutin] = useState({});
  const [sorular, setSorular] = useState({});
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [kayitOk, setKayitOk] = useState(false);

  const dersler = turdenBransDersler(ogrenci.tur, ogrenci.sinif);

  const getir = useCallback(async () => {
    try {
      const snap = await getDoc(doc(db, 'ogrenciler', ogrenci.id, 'gunlukSoru', tarih));
      if (snap.exists()) {
        const data = snap.data();
        setRutin(data.rutin || {});
        setSorular(data.sorular || {});
      } else {
        setRutin({});
        setSorular({});
      }
    } catch {}
  }, [ogrenci.id, tarih]);

  useEffect(() => {
    getir();
  }, [getir]);

  const rutinToggle = key => setRutin(prev => ({ ...prev, [key]: !prev[key] }));

  const konuChange = (dersId, konu, alan, deger) => {
    setSorular(prev => ({
      ...prev,
      [dersId]: {
        ...(prev[dersId] || {}),
        [konu]: { ...(prev[dersId]?.[konu] || {}), [alan]: deger },
      },
    }));
  };

  const kaydet = async () => {
    setKaydediliyor(true);
    try {
      await setDoc(doc(db, 'ogrenciler', ogrenci.id, 'gunlukSoru', tarih), {
        rutin,
        sorular,
        guncelleme: new Date().toISOString(),
      });
      setKayitOk(true);
      setTimeout(() => setKayitOk(false), 2500);
    } catch {}
    setKaydediliyor(false);
  };

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <input
          type="date"
          value={tarih}
          onChange={e => setTarih(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: 10,
            border: `1px solid ${s.border}`,
            background: s.surface,
            color: s.text,
            fontSize: 13,
            outline: 'none',
          }}
        />
        <span style={{ fontSize: 12, color: s.text3 }}>tarih seç</span>
      </div>

      <div
        style={{
          background: s.surface,
          border: `1px solid ${s.border}`,
          borderRadius: 14,
          padding: '16px 20px',
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: s.text, marginBottom: 12 }}>
          Günlük rutin
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {RUTIN_ALANLARI.map(a => (
            <label
              key={a.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                fontSize: 13,
                color: s.text,
              }}
            >
              <input
                type="checkbox"
                checked={!!rutin[a.key]}
                onChange={() => rutinToggle(a.key)}
                style={{ width: 16, height: 16, cursor: 'pointer' }}
              />
              {a.label}
            </label>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, color: s.text, marginBottom: 10 }}>
        Soru çözümü
      </div>
      {dersler.map(ders => (
        <DersBolum
          key={ders.id}
          ders={ders}
          dersVeri={sorular[ders.id]}
          onKonuChange={konuChange}
          s={s}
        />
      ))}

      <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={kaydet}
          disabled={kaydediliyor}
          style={{
            padding: '10px 24px',
            borderRadius: 10,
            border: 'none',
            background: s.accent,
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: kaydediliyor ? 'not-allowed' : 'pointer',
            opacity: kaydediliyor ? 0.6 : 1,
          }}
        >
          {kaydediliyor ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
        {kayitOk && (
          <span style={{ fontSize: 12, color: s.success ?? '#22C55E', fontWeight: 600 }}>
            Kaydedildi ✓
          </span>
        )}
      </div>
    </div>
  );
}

KonuSatiri.propTypes = {
  konuAdi: PropTypes.string.isRequired,
  veri: PropTypes.object,
  onChange: PropTypes.func.isRequired,
};

DersBolum.propTypes = {
  ders: PropTypes.object.isRequired,
  dersVeri: PropTypes.object,
  onKonuChange: PropTypes.func.isRequired,
  s: PropTypes.object.isRequired,
};

OgrenciDetaySoruRutin.propTypes = {
  ogrenci: PropTypes.object.isRequired,
  s: PropTypes.object.isRequired,
};
