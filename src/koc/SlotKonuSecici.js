import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { KONULAR, TYT_DERSLER, AYT_DERSLER } from '../data/konular';
import { lgsKonular } from '../data/konularLgs';
import { LGS_DERSLER } from '../utils/ogrenciBaglam';
import { konuDuzListe } from '../utils/konuUtils';
import { konuIdOlustur } from '../utils/konuTakipUtils';

const TUM_DERSLER = [...TYT_DERSLER, ...AYT_DERSLER, ...LGS_DERSLER];

function konulariBulById(dersId) {
  if (!dersId) return [];
  const ham = KONULAR[dersId] || lgsKonular[dersId] || [];
  return konuDuzListe(ham);
}

function konulariBul(ders) {
  if (!ders?.trim()) return [];
  const dl = ders.trim().toLowerCase();
  const eslesen = TUM_DERSLER.find(d => {
    const label = d.label.toLowerCase();
    return label.includes(dl) || dl.includes(label);
  });
  if (!eslesen) return [];
  const ham = KONULAR[eslesen.id] || lgsKonular[eslesen.id] || [];
  return konuDuzListe(ham);
}

function seciliListesi(seciliKonular) {
  if (!seciliKonular?.trim()) return [];
  return seciliKonular
    .split(',')
    .map(k => k.trim())
    .filter(Boolean);
}

function vurgula(metin, arama) {
  if (!arama) return metin;
  const idx = metin.toLowerCase().indexOf(arama.toLowerCase());
  if (idx === -1) return metin;
  return (
    <>
      {metin.slice(0, idx)}
      <strong>{metin.slice(idx, idx + arama.length)}</strong>
      {metin.slice(idx + arama.length)}
    </>
  );
}

export default function SlotKonuSecici({
  ders,
  dersId,
  seciliKonular,
  onToggle,
  onKonularDegisti,
  s,
}) {
  const [aramaQuery, setAramaQuery] = useState('');

  const tumKonular = useMemo(
    () => (dersId ? konulariBulById(dersId) : konulariBul(ders)),
    [ders, dersId]
  );

  const konular = useMemo(() => {
    if (!aramaQuery.trim()) return tumKonular;
    const a = aramaQuery.trim().toLowerCase();
    return tumKonular.filter(k => k.toLowerCase().includes(a));
  }, [tumKonular, aramaQuery]);

  const secili = useMemo(() => new Set(seciliListesi(seciliKonular)), [seciliKonular]);

  const konuToggle = k => {
    onToggle(k); // geriye dönük uyumluluk
    if (onKonularDegisti && dersId) {
      const yeniSecili = new Set(secili);
      if (yeniSecili.has(k)) yeniSecili.delete(k);
      else yeniSecili.add(k);
      onKonularDegisti([...yeniSecili].map(ad => ({ id: konuIdOlustur(dersId, ad), ad })));
    }
  };

  if (!tumKonular.length) return null;

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: s.text3, marginBottom: 5 }}>
        Müfredattan seç{secili.size > 0 ? ` · ${secili.size} seçili` : ''}
      </div>

      <input
        value={aramaQuery}
        onChange={e => setAramaQuery(e.target.value)}
        placeholder="Konularda ara..."
        style={{
          width: '100%',
          boxSizing: 'border-box',
          background: s.surface2,
          border: `1px solid ${s.border}`,
          borderRadius: 8,
          padding: '7px 10px',
          color: s.text,
          fontSize: 12,
          outline: 'none',
          marginBottom: 5,
        }}
      />

      {konular.length === 0 ? (
        <div style={{ fontSize: 11, color: s.text3, padding: '6px 2px' }}>Eşleşen konu yok</div>
      ) : (
        <div
          style={{
            maxHeight: 160,
            overflowY: 'auto',
            border: `1px solid ${s.border}`,
            borderRadius: 10,
            background: s.surface2,
          }}
        >
          {konular.map((k, i) => {
            const isaretli = secili.has(k);
            return (
              <button
                key={i}
                type="button"
                onClick={() => konuToggle(k)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  fontSize: 12,
                  fontWeight: isaretli ? 600 : 400,
                  cursor: 'pointer',
                  border: 'none',
                  borderBottom: i < konular.length - 1 ? `1px solid ${s.border}` : 'none',
                  background: isaretli ? `${s.accent}18` : 'transparent',
                  color: isaretli ? s.accent : s.text,
                }}
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 4,
                    border: `1.5px solid ${isaretli ? s.accent : s.border}`,
                    background: isaretli ? s.accent : 'transparent',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 9,
                    color: '#fff',
                  }}
                >
                  {isaretli ? '✓' : ''}
                </span>
                {vurgula(k, aramaQuery)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

SlotKonuSecici.propTypes = {
  ders: PropTypes.string,
  dersId: PropTypes.string,
  seciliKonular: PropTypes.string,
  onToggle: PropTypes.func.isRequired,
  onKonularDegisti: PropTypes.func,
  s: PropTypes.object.isRequired,
};
