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
import BransKonuAnalizi from './deneme/BransKonuAnalizi';
import DenemeSilOnayModal from './deneme/DenemeSilOnayModal';
import DenemeTabBar from './deneme/DenemeTabBar';

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
  const [bolum, setBolum] = useState('genel');

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
      const tur = deneme.denemeTuru !== 'brans' ? 'genel' : 'brans';
      Object.entries(deneme.netler || {}).forEach(([dersId, v]) => {
        if (!map[dersId]) map[dersId] = [];
        map[dersId].push({
          net: parseFloat(tur === 'brans' ? v.net : v.net) || 0,
          tarih: deneme.tarih,
          sinav: deneme.sinav,
          tur,
          etiket:
            tur === 'brans'
              ? `Branş ${deneme.tarih?.slice(5) || ''}`
              : `${deneme.sinav} ${deneme.tarih?.slice(5) || ''}`,
        });
      });
    });
    Object.keys(map).forEach(k => {
      map[k].sort((a, b) => new Date(a.tarih) - new Date(b.tarih));
    });
    return map;
  }, [denemeler, ogrenciDersleri]);

  const derslerVeriVar = ogrenciDersleri.filter(d => (dersNoktaMap[d.id] || []).length > 0);
  const bransVarMiDersler = ogrenciDersleri.filter(d =>
    (dersNoktaMap[d.id] || []).some(x => x.tur === 'brans')
  );
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

      {silOnay && (
        <DenemeSilOnayModal deneme={silOnay} onIptal={() => setSilOnay(null)} onSil={sil} s={s} />
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

          <DenemeTabBar
            bolum={bolum}
            onBolum={setBolum}
            genelSayisi={genelDenemeler.length}
            bransSayisi={bransDenemeler.length}
            bransVeriDersSayisi={bransVarMiDersler.length}
            ogrenciTur={ogrenciTur}
            konuAnalizGoster={konuAnalizGoster}
            s={s}
          />

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
