import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';
import { turdenBransDersler } from '../../utils/sinavUtils';
import { Btn } from '../../components/Shared';
import { AYT_ALANLAR, alanKilitli } from './denemeUtils';
import { DersGirisiBlok } from './DersGirisiBlok';
import useDenemeModal from './useDenemeModal';
import DenemeFormSecim from './DenemeFormSecim';

export default function DenemeModal({
  ogrenciId,
  onKapat,
  onEkle,
  mevcutDeneme = null,
  kocId = null,
  ogrenciTur = null,
  ogrenciSinif = null,
}) {
  const { s } = useTheme();
  const {
    duzenle,
    denemeTuru,
    setDenemeTuru,
    sinav,
    setSinav,
    alan,
    setAlan,
    bransDersler,
    bransDersToggle,
    tarih,
    setTarih,
    yayinevi,
    setYayinevi,
    veriler,
    konuDetay,
    yukleniyor,
    guncelle,
    konuGuncelle,
    kaydet,
    toplamNet,
    dersler,
    secenekler,
    setVeriler,
    setKonuDetay,
  } = useDenemeModal({ ogrenciId, onKapat, onEkle, mevcutDeneme, kocId, ogrenciTur, ogrenciSinif });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          background: s.surface,
          border: `1px solid ${s.border}`,
          borderRadius: 20,
          padding: 28,
          width: 620,
          maxWidth: '95vw',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: s.shadow,
          margin: 20,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700, color: s.text, marginBottom: 16 }}>
          {duzenle ? 'Deneme Düzenle' : 'Deneme Sonucu Gir'}
        </div>

        <DenemeFormSecim
          denemeTuru={denemeTuru}
          onTurDegis={tur => {
            setDenemeTuru(tur);
            setVeriler({});
            setKonuDetay({});
          }}
          secenekler={secenekler}
          sinav={sinav}
          onSinavDegis={t => {
            setSinav(t);
            setVeriler({});
            setKonuDetay({});
          }}
          tarih={tarih}
          onTarihDegis={setTarih}
          yayinevi={yayinevi}
          onYayineviDegis={setYayinevi}
          s={s}
        />

        {denemeTuru === 'brans' && (
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: s.text3,
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Ders seç (birden fazla seçebilirsin)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {turdenBransDersler(ogrenciTur, ogrenciSinif).map(d => {
                const secili = bransDersler.includes(d.id);
                return (
                  <div
                    key={d.id}
                    onClick={() => bransDersToggle(d.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: secili ? `2px solid ${d.renk}` : `1px solid ${s.border}`,
                      background: secili ? `${d.renk}20` : s.surface2,
                      color: secili ? d.renk : s.text2,
                    }}
                  >
                    {d.label}
                  </div>
                );
              })}
            </div>
            {bransDersler.length === 0 && (
              <div style={{ fontSize: 12, color: s.text3, marginTop: 8 }}>
                Yukarıdan en az bir ders seç, sonra sonuçları gir.
              </div>
            )}
          </div>
        )}

        {sinav === 'AYT' &&
          denemeTuru === 'genel' &&
          (alanKilitli(ogrenciTur) ? (
            <div
              style={{
                marginBottom: 14,
                padding: '8px 14px',
                background: s.surface2,
                borderRadius: 10,
                border: `1px solid ${s.border}`,
                fontSize: 12,
                color: s.text2,
              }}
            >
              Alan:{' '}
              <b style={{ color: s.text }}>{AYT_ALANLAR.find(a => a.k === alan)?.l || alan}</b>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
              {AYT_ALANLAR.map(a => (
                <div
                  key={a.k}
                  onClick={() => {
                    setAlan(a.k);
                    setVeriler({});
                    setKonuDetay({});
                  }}
                  style={{
                    flex: 1,
                    minWidth: 70,
                    padding: '7px 10px',
                    borderRadius: 10,
                    textAlign: 'center',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: alan === a.k ? `2px solid ${s.accent}` : `1px solid ${s.border}`,
                    background: alan === a.k ? s.accentSoft : s.surface2,
                    color: alan === a.k ? s.accent : s.text2,
                  }}
                >
                  <div>{a.l}</div>
                  <div style={{ fontSize: 10, fontWeight: 400, marginTop: 1, opacity: 0.7 }}>
                    maks {a.maks} net
                  </div>
                </div>
              ))}
            </div>
          ))}

        {dersler.map(ders => (
          <DersGirisiBlok
            key={ders.id}
            ders={ders}
            veriler={veriler}
            konuDetay={konuDetay}
            onGuncelle={guncelle}
            onKonuGuncelle={konuGuncelle}
            s={s}
          />
        ))}

        <div
          style={{
            background: s.accentSoft,
            borderRadius: 12,
            padding: '12px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
            border: `1px solid ${s.accent}`,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: s.text }}>TOPLAM NET</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: s.accent }}>{toplamNet}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn onClick={onKapat} variant="ghost" style={{ flex: 1 }}>
            İptal
          </Btn>
          <Btn onClick={kaydet} disabled={yukleniyor} style={{ flex: 2 }}>
            {yukleniyor ? 'Kaydediliyor...' : duzenle ? 'Güncelle' : 'Kaydet'}
          </Btn>
        </div>
      </div>
    </div>
  );
}

DenemeModal.propTypes = {
  ogrenciId: PropTypes.string.isRequired,
  onKapat: PropTypes.func.isRequired,
  onEkle: PropTypes.func.isRequired,
  mevcutDeneme: PropTypes.object,
  kocId: PropTypes.string,
  ogrenciTur: PropTypes.string,
  ogrenciSinif: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
