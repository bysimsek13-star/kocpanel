import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';

const SEVİYE_RENK = { 1: '#5B4FE8', 2: '#0891B2', 3: '#059669', 4: '#6B7280' };
const SEVİYE_ETİKET = { 1: 'Ders', 2: 'Alt Başlık', 3: 'Konu', 4: 'Alt Konu' };

function agaciOlustur(dugumler) {
  const harita = {};
  dugumler.forEach(d => {
    harita[d.id] = { ...d, cocuklar: [] };
  });
  const kokler = [];
  dugumler.forEach(d => {
    if (!d.parentId) kokler.push(harita[d.id]);
    else harita[d.parentId]?.cocuklar.push(harita[d.id]);
  });
  const sirala = liste => {
    liste.sort((a, b) => (a.sira ?? 0) - (b.sira ?? 0));
    liste.forEach(n => sirala(n.cocuklar));
  };
  sirala(kokler);
  return kokler;
}

function DugumSatiri({ dugum, onEkle, onSil, onDuzenle, s, derinlik }) {
  const [acik, setAcik] = useState(derinlik < 2);
  const [duzenleme, setDuzenleme] = useState(false);
  const [duzenAd, setDuzenAd] = useState(dugum.ad);
  const [ekleAcik, setEkleAcik] = useState(false);
  const [yeniAd, setYeniAd] = useState('');

  const altSeviye = dugum.seviye + 1;
  const ekleYapilabilir = dugum.seviye < 4;
  const renk = SEVİYE_RENK[dugum.seviye];

  const onKaydet = () => {
    if (duzenAd.trim()) onDuzenle(dugum.id, duzenAd.trim());
    setDuzenleme(false);
  };

  const onYeniEkle = () => {
    if (yeniAd.trim()) {
      onEkle(dugum.id, yeniAd.trim(), altSeviye);
      setYeniAd('');
      setEkleAcik(false);
    }
  };

  return (
    <div style={{ paddingLeft: derinlik > 0 ? 22 : 0 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '5px 6px',
          borderRadius: 7,
          marginBottom: 1,
          background: duzenleme ? s.accentSoft : 'transparent',
        }}
      >
        <button
          onClick={() => dugum.cocuklar.length > 0 && setAcik(!acik)}
          style={{
            background: 'none',
            border: 'none',
            cursor: dugum.cocuklar.length > 0 ? 'pointer' : 'default',
            color: s.text3,
            fontSize: 9,
            width: 14,
            flexShrink: 0,
          }}
        >
          {dugum.cocuklar.length > 0 ? (acik ? '▼' : '▶') : '·'}
        </button>

        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: renk,
            background: `${renk}18`,
            borderRadius: 4,
            padding: '1px 5px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {SEVİYE_ETİKET[dugum.seviye]}
        </span>

        {duzenleme ? (
          <>
            <input
              value={duzenAd}
              onChange={e => setDuzenAd(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') onKaydet();
                if (e.key === 'Escape') setDuzenleme(false);
              }}
              autoFocus
              style={{
                flex: 1,
                padding: '3px 8px',
                borderRadius: 6,
                border: `1px solid ${s.accent}`,
                background: s.surface,
                color: s.text,
                fontSize: 12,
              }}
            />
            <button
              onClick={onKaydet}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#10B981',
                fontSize: 14,
              }}
            >
              ✓
            </button>
            <button
              onClick={() => setDuzenleme(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: s.text3,
                fontSize: 14,
              }}
            >
              ✕
            </button>
          </>
        ) : (
          <>
            <span
              onClick={() => setDuzenleme(true)}
              style={{ flex: 1, fontSize: 13, color: s.text, cursor: 'text', userSelect: 'none' }}
            >
              {dugum.ad}
            </span>
            {ekleYapilabilir && (
              <button
                onClick={() => setEkleAcik(!ekleAcik)}
                title={`${SEVİYE_ETİKET[altSeviye]} ekle`}
                style={{
                  fontSize: 11,
                  color: s.text3,
                  background: 'none',
                  border: `1px solid ${s.border}`,
                  borderRadius: 4,
                  cursor: 'pointer',
                  padding: '1px 6px',
                  whiteSpace: 'nowrap',
                }}
              >
                + {SEVİYE_ETİKET[altSeviye]}
              </button>
            )}
            <button
              onClick={() => onSil(dugum.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#F43F5E',
                fontSize: 11,
                opacity: 0.6,
                padding: '0 4px',
              }}
            >
              ✕
            </button>
          </>
        )}
      </div>

      {ekleAcik && (
        <div style={{ paddingLeft: 36, marginBottom: 6, display: 'flex', gap: 6 }}>
          <input
            value={yeniAd}
            onChange={e => setYeniAd(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onYeniEkle()}
            placeholder={`${SEVİYE_ETİKET[altSeviye]} adı`}
            autoFocus
            style={{
              flex: 1,
              padding: '5px 10px',
              borderRadius: 6,
              border: `1px solid ${s.accent}`,
              background: s.surface,
              color: s.text,
              fontSize: 12,
            }}
          />
          <button
            onClick={onYeniEkle}
            style={{
              padding: '5px 12px',
              borderRadius: 6,
              background: s.accent,
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            Ekle
          </button>
          <button
            onClick={() => setEkleAcik(false)}
            style={{
              padding: '5px 10px',
              borderRadius: 6,
              background: s.surface2,
              color: s.text2,
              border: `1px solid ${s.border}`,
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            İptal
          </button>
        </div>
      )}

      {acik &&
        dugum.cocuklar.map(cocuk => (
          <DugumSatiri
            key={cocuk.id}
            dugum={cocuk}
            onEkle={onEkle}
            onSil={onSil}
            onDuzenle={onDuzenle}
            s={s}
            derinlik={derinlik + 1}
          />
        ))}
    </div>
  );
}

export default function MufredatAgaci({ dugumler, onEkle, onSil, onDuzenle, s }) {
  const agac = useMemo(() => agaciOlustur(dugumler), [dugumler]);

  if (agac.length === 0) return null;

  return (
    <div>
      {agac.map(ders => (
        <DugumSatiri
          key={ders.id}
          dugum={ders}
          onEkle={onEkle}
          onSil={onSil}
          onDuzenle={onDuzenle}
          s={s}
          derinlik={0}
        />
      ))}
    </div>
  );
}

MufredatAgaci.propTypes = {
  dugumler: PropTypes.array.isRequired,
  onEkle: PropTypes.func.isRequired,
  onSil: PropTypes.func.isRequired,
  onDuzenle: PropTypes.func.isRequired,
  s: PropTypes.object.isRequired,
};
