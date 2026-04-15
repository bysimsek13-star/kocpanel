import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { turdenBransDersler } from '../utils/sinavUtils';
import { Btn, LoadingState, EmptyState } from '../components/Shared';

import DersKarti from './deneme/DersKarti';
import { GenelNetGrafik, DenemeKart } from './deneme/DenemeKart';
import BransBolum from './deneme/BransBolum';
import DenemeModal from './deneme/DenemeModal';

// ─── BRANŞ KONU ANALİZİ ───────────────────────────────────────────────────────
function BransKonuAnalizi({ denemeler, ogrenciTur, ogrenciSinif, s }) {
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

// ─── ANA BİLEŞEN ──────────────────────────────────────────────────────────────
export default function DenemeListesi({
  ogrenciId,
  readOnly = false,
  konuAnalizGoster = false,
  kocId = null,
  ogrenciTur = null,
  ogrenciSinif = null,
}) {
  const { s } = useTheme();
  const [denemeler, setDenemeler] = useState([]);
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenleHedef, setDuzenleHedef] = useState(null);
  const [silOnay, setSilOnay] = useState(null);
  const [acikId, setAcikId] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [bolum, setBolum] = useState('genel'); // genel | brans

  const getir = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, 'ogrenciler', ogrenciId, 'denemeler'));
      const l = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      l.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
      setDenemeler(l);
    } catch (e) {
      console.error(e);
    }
    setYukleniyor(false);
  }, [ogrenciId]);

  useEffect(() => {
    getir();
  }, [getir]);

  const sil = async id => {
    try {
      await deleteDoc(doc(db, 'ogrenciler', ogrenciId, 'denemeler', id));
      getir();
    } catch (e) {
      console.error(e);
    }
    setSilOnay(null);
  };

  const ogrenciDersleri = turdenBransDersler(ogrenciTur, ogrenciSinif);

  const dersNoktaMap = useMemo(() => {
    const map = {};
    ogrenciDersleri.forEach(d => {
      map[d.id] = [];
    });
    denemeler.forEach(deneme => {
      if (deneme.denemeTuru !== 'brans') {
        Object.entries(deneme.netler || {}).forEach(([dersId, v]) => {
          if (!map[dersId]) map[dersId] = [];
          map[dersId].push({
            net: parseFloat(v.net) || 0,
            tarih: deneme.tarih,
            sinav: deneme.sinav,
            tur: 'genel',
            etiket: `${deneme.sinav} ${deneme.tarih?.slice(5) || ''}`,
          });
        });
      } else {
        Object.entries(deneme.netler || {}).forEach(([dersId, v]) => {
          if (!map[dersId]) map[dersId] = [];
          map[dersId].push({
            net: parseFloat(v.net) || 0,
            tarih: deneme.tarih,
            sinav: deneme.sinav,
            tur: 'brans',
            etiket: `Branş ${deneme.tarih?.slice(5) || ''}`,
          });
        });
      }
    });
    Object.keys(map).forEach(k => {
      map[k].sort((a, b) => new Date(a.tarih) - new Date(b.tarih));
    });
    return map;
  }, [denemeler, ogrenciDersleri]);

  const derslerVeriVar = ogrenciDersleri.filter(d => (dersNoktaMap[d.id] || []).length > 0);
  const bransVarMiDersler = ogrenciDersleri.filter(d => {
    const n = dersNoktaMap[d.id] || [];
    return n.some(x => x.tur === 'brans');
  });
  const genelDenemeler = denemeler.filter(d => d.denemeTuru !== 'brans');
  const bransDenemeler = denemeler.filter(d => d.denemeTuru === 'brans');

  if (yukleniyor) return <LoadingState />;

  return (
    <div>
      {(modalAcik || duzenleHedef) && (
        <DenemeModal
          ogrenciId={ogrenciId}
          onKapat={() => {
            setModalAcik(false);
            setDuzenleHedef(null);
          }}
          onEkle={getir}
          mevcutDeneme={duzenleHedef}
          kocId={kocId}
          ogrenciTur={ogrenciTur}
          ogrenciSinif={ogrenciSinif}
        />
      )}

      {/* Silme onay modalı */}
      {silOnay && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
          }}
          onClick={() => setSilOnay(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: s.surface,
              border: `1px solid ${s.border}`,
              borderRadius: 16,
              padding: 28,
              width: 340,
              maxWidth: '90vw',
              boxShadow: s.shadow,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, color: s.text, marginBottom: 8 }}>
              Denemeyi sil
            </div>
            <div style={{ fontSize: 13, color: s.text2, marginBottom: 20 }}>
              <b>{silOnay.sinav}</b> ({silOnay.tarih}) denemesi silinecek. Bu işlem geri alınamaz.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setSilOnay(null)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 10,
                  border: `1px solid ${s.border}`,
                  background: s.surface2,
                  color: s.text2,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                İptal
              </button>
              <button
                onClick={() => sil(silOnay.id)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 10,
                  border: 'none',
                  background: s.tehlika,
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 700, color: s.text }}>Denemeler</div>
        {!readOnly && (
          <Btn onClick={() => setModalAcik(true)} style={{ padding: '8px 16px', fontSize: 13 }}>
            + Deneme Ekle
          </Btn>
        )}
      </div>

      {denemeler.length === 0 ? (
        <EmptyState mesaj="Henüz deneme kaydı yok" icon="📊" />
      ) : (
        <>
          {/* Ders özet kartları */}
          {derslerVeriVar.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: s.text3,
                  marginBottom: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '.05em',
                }}
              >
                Ders bazlı özet
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))',
                  gap: 10,
                }}
              >
                {derslerVeriVar.map(d => (
                  <DersKarti
                    key={d.id}
                    dersId={d.id}
                    dersLabel={d.label}
                    dersRenk={d.renk}
                    dersMax={d.toplam}
                    noktalar={dersNoktaMap[d.id] || []}
                    s={s}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Bölüm seçimi */}
          <div
            style={{
              display: 'flex',
              borderBottom: `2px solid ${s.border}`,
              marginBottom: 20,
              gap: 0,
            }}
          >
            {[
              {
                k: 'genel',
                l: `${ogrenciTur?.includes('lgs') ? 'LGS' : 'Genel'} Denemeler (${genelDenemeler.length})`,
              },
              {
                k: 'brans',
                l: `Branş (${bransDenemeler.length} deneme · ${bransVarMiDersler.length} ders)`,
              },
              ...(konuAnalizGoster ? [{ k: 'konu', l: '🔍 Konu Analizi' }] : []),
            ].map(tab => (
              <button
                key={tab.k}
                type="button"
                onClick={() => setBolum(tab.k)}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  background: 'transparent',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  position: 'relative',
                  color: bolum === tab.k ? s.accent : s.text3,
                }}
              >
                {tab.l}
                {bolum === tab.k && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: -2,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: s.accent,
                      borderRadius: 2,
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          {bolum === 'genel' && (
            <>
              <GenelNetGrafik denemeler={denemeler} s={s} />
              {genelDenemeler.length === 0 ? (
                <EmptyState mesaj="Genel deneme kaydı yok" icon="📋" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {genelDenemeler.map(d => (
                    <DenemeKart
                      key={d.id}
                      deneme={d}
                      acik={acikId === d.id}
                      onToggle={() => setAcikId(acikId === d.id ? null : d.id)}
                      onDuzenle={!readOnly ? () => setDuzenleHedef(d) : undefined}
                      onSil={!readOnly ? () => setSilOnay(d) : undefined}
                      s={s}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {bolum === 'brans' && (
            <>
              {bransVarMiDersler.length === 0 ? (
                <EmptyState mesaj="Branş denemesi verisi yok" icon="📚" />
              ) : (
                bransVarMiDersler.map(d => (
                  <BransBolum
                    key={d.id}
                    dersId={d.id}
                    dersLabel={d.label}
                    dersRenk={d.renk}
                    dersMax={d.toplam}
                    denemeler={denemeler}
                    onSil={!readOnly ? den => setSilOnay(den) : undefined}
                    s={s}
                  />
                ))
              )}
            </>
          )}

          {bolum === 'konu' && konuAnalizGoster && (
            <BransKonuAnalizi denemeler={denemeler} ogrenciTur={ogrenciTur} s={s} />
          )}
        </>
      )}
    </div>
  );
}

export function DenemeAnaliz() {
  return null;
}

DenemeListesi.propTypes = {
  ogrenciId: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
  konuAnalizGoster: PropTypes.bool,
  kocId: PropTypes.string,
  ogrenciTur: PropTypes.string,
  ogrenciSinif: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
