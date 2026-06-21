import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { turdenBransDersler } from '../utils/sinavUtils';
import { bugunStr, dateToStr } from '../utils/tarih';

function SegmentBar({ dogru, yanlis, bos }) {
  const toplam = (dogru || 0) + (yanlis || 0) + (bos || 0);
  if (!toplam) return null;
  return (
    <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden' }}>
      {dogru > 0 && <div style={{ flex: dogru, background: '#10B981' }} />}
      {yanlis > 0 && <div style={{ flex: yanlis, background: '#EF4444' }} />}
      {bos > 0 && <div style={{ flex: bos, background: '#9CA3AF' }} />}
    </div>
  );
}

export default function OgrenciDetaySoruRutin({ ogrenci, s }) {
  const [tarih, setTarih] = useState(bugunStr());
  const [veri, setVeri] = useState(null);

  const minTarih = dateToStr(
    (() => {
      const x = new Date();
      x.setDate(x.getDate() - 14);
      return x;
    })()
  );

  const getir = useCallback(async () => {
    try {
      const snap = await getDoc(doc(db, 'ogrenciler', ogrenci.id, 'gunlukSoru', tarih));
      setVeri(snap.exists() ? snap.data() : null);
    } catch {
      setVeri(null);
    }
  }, [ogrenci.id, tarih]);

  useEffect(() => {
    getir();
  }, [getir]);

  const dersler = turdenBransDersler(ogrenci.tur, ogrenci.sinif);
  const dersMap = Object.fromEntries(dersler.map(d => [d.id, d]));
  const dersVerisi = veri?.dersler || {};
  const konuDetay = veri?.konuDetay || {};

  const dolDersler = Object.entries(dersVerisi).filter(
    ([, v]) => (v.d || 0) + (v.y || 0) + (v.b || 0) > 0
  );

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <input
          type="date"
          value={tarih}
          min={minTarih}
          max={bugunStr()}
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

      {veri?.sureDk > 0 && (
        <div style={{ fontSize: 12, color: s.text3, marginBottom: 14 }}>
          Toplam süre: <strong style={{ color: s.text2 }}>{veri.sureDk} dk</strong>
        </div>
      )}

      {dolDersler.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {dolDersler.map(([dersId, row]) => {
            const ders = dersMap[dersId] || { label: dersId, renk: s.accent };
            const d = row.d || 0,
              y = row.y || 0,
              b = row.b || 0;
            const konular = Object.entries(konuDetay[dersId] || {}).filter(
              ([, kv]) => (kv.yanlis || 0) + (kv.bos || 0) > 0
            );
            return (
              <div
                key={dersId}
                style={{
                  background: s.surface,
                  border: `1px solid ${s.border}`,
                  borderRadius: 12,
                  padding: '14px 16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: ders.renk,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ fontSize: 13, fontWeight: 700, color: ders.renk, flex: 1 }}>
                    {ders.label}
                  </div>
                  <div style={{ fontSize: 12, color: s.text2, flexShrink: 0 }}>
                    <span style={{ color: s.success ?? '#10B981' }}>D{d}</span>{' '}
                    <span style={{ color: s.danger ?? '#EF4444' }}>Y{y}</span>{' '}
                    <span style={{ color: s.text3 }}>B{b}</span>
                  </div>
                </div>
                <SegmentBar dogru={d} yanlis={y} bos={b} />
                {konular.length > 0 && (
                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {konular.map(([konuAdi, kv]) => {
                      const ky = kv.yanlis || 0,
                        kb = kv.bos || 0;
                      return (
                        <div key={konuAdi} style={{ paddingLeft: 16 }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              marginBottom: 3,
                            }}
                          >
                            <div
                              style={{
                                fontSize: 11,
                                color: s.text2,
                                flex: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {konuAdi}
                            </div>
                            <div style={{ fontSize: 10, color: s.text3, flexShrink: 0 }}>
                              Y{ky} B{kb}
                            </div>
                          </div>
                          <SegmentBar dogru={0} yanlis={ky} bos={kb} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

SegmentBar.propTypes = {
  dogru: PropTypes.number,
  yanlis: PropTypes.number,
  bos: PropTypes.number,
};

OgrenciDetaySoruRutin.propTypes = {
  ogrenci: PropTypes.object.isRequired,
  s: PropTypes.object.isRequired,
};
