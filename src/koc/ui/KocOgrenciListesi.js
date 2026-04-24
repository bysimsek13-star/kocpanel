import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';
import { useMobil } from '../../hooks/useMediaQuery';
import { Btn, LoadingState, EmptyState } from '../../components/Shared';
import { KocHeroBand, KocKpiStrip, KocTableShell } from '../../components/koc/KocPanelUi';
import KocOgrenciSatir, { OG_SATIR_GRID } from './KocOgrenciSatir';
import KocOgrenciFiltreler from './KocOgrenciFiltreler';
import { useKoc } from '../../context/KocContext';

export default function KocOgrenciListesi({ onSec, onEkle, onGeri }) {
  const { ogrenciler, dashboardMap, bugunMap, okunmamisMap, yukleniyor } = useKoc();
  const { s } = useTheme();
  const mobil = useMobil();
  const [arama, setArama] = useState('');
  const [filtre, setFiltre] = useState('tumu');
  const [sira, setSira] = useState('isim');

  const toplamMesaj = useMemo(
    () => Object.values(okunmamisMap || {}).reduce((t, v) => t + (Number(v) || 0), 0),
    [okunmamisMap]
  );

  const filtreli = useMemo(() => {
    let l = ogrenciler.filter(o => o.isim?.toLowerCase().includes(arama.toLowerCase()));
    if (filtre === 'mesaj') l = l.filter(o => (okunmamisMap?.[o.id] || 0) > 0);
    if (filtre === 'bugun_bos')
      l = l.filter(o => !bugunMap[o.id]?.rutin && !bugunMap[o.id]?.gunlukSoru);
    const net = id => dashboardMap[id]?.sonDenemeNet;
    if (sira === 'isim')
      l = [...l].sort((a, b) => (a.isim || '').localeCompare(b.isim || '', 'tr'));
    if (sira === 'net_az') l = [...l].sort((a, b) => (net(a.id) ?? -1) - (net(b.id) ?? -1));
    if (sira === 'net_cok') l = [...l].sort((a, b) => (net(b.id) ?? -1) - (net(a.id) ?? -1));
    return l;
  }, [ogrenciler, arama, filtre, sira, okunmamisMap, bugunMap, dashboardMap]);

  return (
    <>
      <KocHeroBand
        baslik="Öğrencilerim"
        aciklama="Öğrenci seçerek detay, program ve denemelere gidebilirsiniz."
        mobil={mobil}
        onGeri={onGeri}
        geriEtiket="← Ana sayfa"
        sagSlot={
          <Btn onClick={onEkle} style={{ padding: '10px 18px', fontSize: 13, fontWeight: 600 }}>
            + Öğrenci ekle
          </Btn>
        }
      />
      <KocKpiStrip
        mobil={mobil}
        items={[
          { label: 'Kayıtlı öğrenci', deger: ogrenciler.length, alt: 'Listede' },
          {
            label: 'Okunmamış mesaj',
            deger: toplamMesaj,
            alt: toplamMesaj ? 'Kontrol edin' : 'Güncel',
          },
        ]}
      />

      <KocOgrenciFiltreler
        arama={arama}
        setArama={setArama}
        filtre={filtre}
        setFiltre={setFiltre}
        sira={sira}
        setSira={setSira}
      />

      <KocTableShell>
        {!mobil && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: OG_SATIR_GRID,
              gap: 12,
              padding: '14px 20px',
              borderBottom: `1px solid ${s.border}`,
              background: s.surface2,
              fontSize: 10,
              fontWeight: 700,
              color: s.text3,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            <div />
            <div>Öğrenci</div>
            <div>Sınav</div>
            <div style={{ textAlign: 'center' }}>Son net</div>
            <div style={{ textAlign: 'right' }}>İşlem</div>
          </div>
        )}
        {yukleniyor ? (
          <LoadingState />
        ) : filtreli.length === 0 ? (
          <EmptyState
            mesaj={
              ogrenciler.length === 0
                ? 'Henüz öğrenci eklenmemiş'
                : arama || filtre !== 'tumu'
                  ? 'Filtreye uygun öğrenci yok'
                  : 'Liste boş'
            }
            icon="👥"
          />
        ) : (
          filtreli.map((o, i) => (
            <KocOgrenciSatir
              key={o.id}
              ogrenci={o}
              index={i}
              dashboard={dashboardMap[o.id]}
              okunmamis={okunmamisMap?.[o.id] || 0}
              onClick={() => onSec(o)}
              onDenemeler={() => onSec(o, 'deneme')}
              mobil={mobil}
            />
          ))
        )}
      </KocTableShell>
    </>
  );
}

KocOgrenciListesi.propTypes = {
  onSec: PropTypes.func.isRequired,
  onEkle: PropTypes.func,
  onGeri: PropTypes.func,
};
