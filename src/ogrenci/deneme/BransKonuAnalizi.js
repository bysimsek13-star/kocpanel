import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { turdenBransDersler } from '../../utils/sinavUtils';
import { EmptyState } from '../../components/Shared';

export default function BransKonuAnalizi({ denemeler, ogrenciTur, ogrenciSinif, s }) {
  const dersSetim = turdenBransDersler(ogrenciTur, ogrenciSinif);
  const konuSkoru = useMemo(() => {
    const map = {};
    denemeler.forEach(den => {
      Object.entries(den.netler || {}).forEach(([dersId, dv]) => {
        if (!map[dersId]) map[dersId] = {};
        const kd = dv.konuDetay || {};
        if (Object.keys(kd).length > 0) {
          Object.entries(kd).forEach(([konu, v]) => {
            if (!map[dersId][konu]) map[dersId][konu] = { yanlis: 0, bos: 0, dogru: 0 };
            const yanlis = v.yanlis || 0;
            const bos = v.bos || 0;
            const dogru = Math.max(0, (v.soru || 0) - yanlis - bos);
            map[dersId][konu].yanlis += yanlis;
            map[dersId][konu].bos += bos;
            map[dersId][konu].dogru += dogru;
          });
        } else {
          (dv.yanlisKonular || []).forEach(k => {
            if (!map[dersId][k]) map[dersId][k] = { yanlis: 0, bos: 0, dogru: 0 };
            map[dersId][k].yanlis += 1;
          });
          (dv.bosKonular || []).forEach(k => {
            if (!map[dersId][k]) map[dersId][k] = { yanlis: 0, bos: 0, dogru: 0 };
            map[dersId][k].bos += 1;
          });
        }
      });
    });
    const result = {};
    Object.entries(map).forEach(([dersId, konular]) => {
      const liste = Object.entries(konular)
        .map(([konu, v]) => ({ konu, skor: v.yanlis * 2 + v.bos - v.dogru, ...v }))
        .filter(k => k.skor > 0)
        .sort((a, b) => b.skor - a.skor)
        .slice(0, 6);
      if (liste.length > 0) result[dersId] = liste;
    });
    return result;
  }, [denemeler]);

  const derslerVeri = dersSetim.filter(d => konuSkoru[d.id]);

  if (derslerVeri.length === 0) {
    return (
      <EmptyState
        mesaj="Konu analizi için henüz veri yok — denemeler girilirken konu detayı ekleyin"
        icon="📚"
      />
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
        gap: 14,
      }}
    >
      {derslerVeri.map(ders => {
        const konular = konuSkoru[ders.id];
        const maks = konular[0].skor;
        return (
          <div
            key={ders.id}
            style={{
              background: s.surface2,
              borderRadius: 14,
              padding: '16px 18px',
              border: `1px solid ${s.border}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: ders.renk,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 13, fontWeight: 700, color: s.text }}>{ders.label}</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: s.text3, fontWeight: 500 }}>
                {konular.length} konu
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {konular.map((k, i) => {
                const oran = Math.round((k.skor / maks) * 100);
                const renk = i < 2 ? s.danger || '#ef4444' : i < 4 ? s.uyari || '#f59e0b' : s.text3;
                return (
                  <div key={k.konu}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 3,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          color: s.text,
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: 155,
                        }}
                        title={k.konu}
                      >
                        {k.konu}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: renk,
                          flexShrink: 0,
                          marginLeft: 6,
                          letterSpacing: '0.03em',
                        }}
                      >
                        {k.yanlis > 0 ? `${k.yanlis}Y` : ''}
                        {k.bos > 0 ? ` ${k.bos}B` : ''}
                        {k.dogru > 0 ? ` ${k.dogru}D` : ''}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        background: s.surface3 || s.border,
                        borderRadius: 4,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${oran}%`,
                          background: renk,
                          borderRadius: 4,
                          transition: 'width 0.5s',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

BransKonuAnalizi.propTypes = {
  denemeler: PropTypes.arrayOf(PropTypes.object).isRequired,
  ogrenciTur: PropTypes.string,
  ogrenciSinif: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  s: PropTypes.object.isRequired,
};
