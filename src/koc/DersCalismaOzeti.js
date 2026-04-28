import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { saatFormat, kaynakEtiketleri } from '../utils/dersOzetiUtils';

function KonuSatiri({ konu, s }) {
  const durumRenk =
    konu.durum === 'tamamlandi' ? '#10B981' : konu.durum === 'tekrar' ? '#F59E0B' : s.text3;
  const durumIkon = konu.durum === 'tamamlandi' ? '✓' : konu.durum === 'tekrar' ? '↺' : '·';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 0',
        borderBottom: `1px solid ${s.border}`,
        fontSize: 12,
      }}
    >
      <span style={{ color: durumRenk, fontWeight: 700, minWidth: 14 }}>{durumIkon}</span>
      <span style={{ flex: 1, color: s.text }}>{konu.konuAdi}</span>
      {konu.videoSaat > 0 && <span style={{ color: s.text3 }}>{saatFormat(konu.videoSaat)}</span>}
      {konu.soruSayisi > 0 && <span style={{ color: s.text3 }}>{konu.soruSayisi} soru</span>}
      {konu.kaynaklar?.length > 0 && (
        <span style={{ color: s.text3, fontSize: 10 }}>{kaynakEtiketleri(konu.kaynaklar)}</span>
      )}
    </div>
  );
}

function DersKart({ dersId, dersOzeti, dersLabel, s }) {
  const [acik, setAcik] = useState(false);
  const {
    toplamVideoSaat,
    toplamSoruSayisi,
    tamamlananKonu,
    toplamKonu,
    tekrarBekleyenKonu,
    konular,
  } = dersOzeti;
  const hicCalisilmadi = toplamKonu === 0;

  return (
    <div
      style={{
        border: `1px solid ${hicCalisilmadi ? '#EF444440' : s.border}`,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 8,
        background: hicCalisilmadi ? 'rgba(239,68,68,0.04)' : s.surface,
      }}
    >
      <div
        onClick={() => !hicCalisilmadi && setAcik(v => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 16px',
          cursor: hicCalisilmadi ? 'default' : 'pointer',
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{ fontSize: 13, fontWeight: 700, color: hicCalisilmadi ? '#EF4444' : s.text }}
          >
            {hicCalisilmadi ? '✗ ' : ''}
            {dersLabel || dersId}
          </div>
          {hicCalisilmadi && (
            <div style={{ fontSize: 11, color: '#EF4444', marginTop: 2 }}>Hiç çalışılmadı</div>
          )}
        </div>
        {!hicCalisilmadi && (
          <div style={{ display: 'flex', gap: 12, fontSize: 11, color: s.text3 }}>
            {toplamVideoSaat > 0 && <span>📹 {saatFormat(toplamVideoSaat)}</span>}
            {toplamSoruSayisi > 0 && <span>✏️ {toplamSoruSayisi} soru</span>}
            <span style={{ color: tamamlananKonu > 0 ? '#10B981' : s.text3 }}>
              {tamamlananKonu}/{toplamKonu} konu
            </span>
            {tekrarBekleyenKonu > 0 && (
              <span style={{ color: '#F59E0B' }}>↺ {tekrarBekleyenKonu}</span>
            )}
          </div>
        )}
        {!hicCalisilmadi && (
          <span style={{ color: s.text3, fontSize: 10 }}>{acik ? '▼' : '▶'}</span>
        )}
      </div>

      {acik && konular.length > 0 && (
        <div style={{ padding: '0 16px 12px', borderTop: `1px solid ${s.border}` }}>
          {konular.map(k => (
            <KonuSatiri key={k.id || k.konuAdi} konu={k} s={s} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DersCalismaOzeti({
  dersBazliOzet,
  genelOzet,
  mufredatDersler,
  calisilmayanDersler,
  s,
}) {
  if (!genelOzet) return null;

  const dersListesi = mufredatDersler || [];

  return (
    <div>
      {genelOzet.toplamKonu > 0 && (
        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            marginBottom: 16,
          }}
        >
          {[
            { label: 'Toplam konu', deger: genelOzet.toplamKonu },
            { label: 'Tamamlanan', deger: genelOzet.tamamlananKonu, renk: '#10B981' },
            { label: 'Video', deger: saatFormat(genelOzet.toplamVideoSaat) },
            { label: 'Soru', deger: genelOzet.toplamSoruSayisi || null },
          ]
            .filter(i => i.deger)
            .map(item => (
              <div
                key={item.label}
                style={{
                  background: s.surface,
                  border: `1px solid ${s.border}`,
                  borderRadius: 10,
                  padding: '8px 14px',
                  fontSize: 12,
                }}
              >
                <div style={{ color: s.text3, fontSize: 10 }}>{item.label}</div>
                <div style={{ fontWeight: 700, color: item.renk || s.text }}>{item.deger}</div>
              </div>
            ))}
        </div>
      )}

      {/* Aktif dersler */}
      {Object.entries(dersBazliOzet).map(([dersId, ozet]) => {
        const dersLabel = dersListesi.find(d => d.id === dersId)?.label;
        return (
          <DersKart key={dersId} dersId={dersId} dersOzeti={ozet} dersLabel={dersLabel} s={s} />
        );
      })}

      {/* Hiç çalışılmayan dersler */}
      {calisilmayanDersler?.map(dersId => {
        const dersLabel = dersListesi.find(d => d.id === dersId)?.label;
        return (
          <DersKart
            key={dersId}
            dersId={dersId}
            dersOzeti={{ toplamKonu: 0, konular: [] }}
            dersLabel={dersLabel}
            s={s}
          />
        );
      })}

      {genelOzet.toplamKonu === 0 && (!calisilmayanDersler || calisilmayanDersler.length === 0) && (
        <div style={{ color: s.text3, fontSize: 13, padding: '20px 0', textAlign: 'center' }}>
          Henüz konu bazlı çalışma kaydı yok.
        </div>
      )}
    </div>
  );
}

KonuSatiri.propTypes = { konu: PropTypes.object.isRequired, s: PropTypes.object.isRequired };
DersKart.propTypes = {
  dersId: PropTypes.string.isRequired,
  dersOzeti: PropTypes.object.isRequired,
  dersLabel: PropTypes.string,
  s: PropTypes.object.isRequired,
};
DersCalismaOzeti.propTypes = {
  dersBazliOzet: PropTypes.object.isRequired,
  genelOzet: PropTypes.object.isRequired,
  mufredatDersler: PropTypes.array,
  calisilmayanDersler: PropTypes.array,
  s: PropTypes.object.isRequired,
};
