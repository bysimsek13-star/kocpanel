import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { renkler } from '../data/konular';
import { useMobil } from '../hooks/useMediaQuery';
import { Btn, Avatar } from '../components/Shared';
import Mesajlar from '../ogrenci/Mesajlar';
import VeliMesajlariPaneli from './VeliMesajlariPaneli';

export default function MesajlarSayfasi({ ogrenciler, okunmamisMap, onGeri }) {
  const { s } = useTheme();
  const mobil = useMobil();

  // Okunmamış önce sırala (WhatsApp mantığı)
  const siraliOgrenciler = useMemo(() => {
    return [...ogrenciler].sort((a, b) => {
      const aUnread = okunmamisMap?.[a.id] || 0;
      const bUnread = okunmamisMap?.[b.id] || 0;
      return bUnread - aUnread;
    });
  }, [ogrenciler, okunmamisMap]);

  const [secili, setSecili] = useState(siraliOgrenciler[0] || null);
  const [listeAcik, setListeAcik] = useState(!mobil);

  const ogrenciSec = ogrenci => {
    setSecili(ogrenci);
    if (mobil) setListeAcik(false);
    if ((okunmamisMap?.[ogrenci.id] || 0) > 0) {
      updateDoc(doc(db, 'ogrenciler', ogrenci.id), { okunmamisMesajSayisi: 0 }).catch(() => {});
    }
  };

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 60px)' }}>
      {(listeAcik || !mobil) && (
        <div
          style={{
            width: mobil ? '100%' : 280,
            background: s.surface,
            borderRight: `1px solid ${s.border}`,
            overflowY: 'auto',
            position: mobil ? 'absolute' : 'relative',
            zIndex: mobil ? 50 : 1,
            top: mobil ? 56 : 'auto',
            bottom: 0,
            left: 0,
          }}
        >
          <div
            style={{
              padding: 16,
              borderBottom: `1px solid ${s.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Btn onClick={onGeri} variant="outline" style={{ padding: '6px 12px', fontSize: 12 }}>
              ← Geri
            </Btn>
            <div style={{ fontWeight: 600, color: s.text }}>Mesajlar</div>
          </div>
          {siraliOgrenciler.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: s.text3, fontSize: 13 }}>
              Öğrenci yok
            </div>
          ) : (
            siraliOgrenciler.map((o, i) => {
              const unread = okunmamisMap?.[o.id] || 0;
              const seciliMi = secili?.id === o.id;
              return (
                <div
                  key={o.id}
                  onClick={() => ogrenciSec(o)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    borderBottom: `1px solid ${s.border}`,
                    cursor: 'pointer',
                    background: seciliMi
                      ? s.accentSoft
                      : unread > 0
                        ? s.tehlikaSoft
                        : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <Avatar isim={o.isim} renk={renkler[i % renkler.length]} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        color: seciliMi ? s.accent : unread > 0 ? s.text : s.text,
                        fontSize: 13.5,
                        fontWeight: unread > 0 ? 700 : 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {o.isim}
                    </div>
                    <div style={{ color: s.text3, fontSize: 11.5 }}>{o.tur}</div>
                  </div>
                  {unread > 0 && (
                    <span
                      style={{
                        background: s.tehlika,
                        color: '#fff',
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: 20,
                        minWidth: 18,
                        textAlign: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {unread}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      <div
        style={{
          flex: 1,
          padding: 20,
          background: s.bg,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {mobil && (
          <Btn
            onClick={() => setListeAcik(true)}
            variant="outline"
            style={{ marginBottom: 12, fontSize: 12, padding: '6px 12px' }}
          >
            {secili ? `${secili.isim} ↓` : 'Öğrenci Seç ↓'}
          </Btn>
        )}
        {secili ? (
          <>
            <Mesajlar ogrenciId={secili.id} gonderen="koc" />
            <VeliMesajlariPaneli ogrenciId={secili.id} />
          </>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: s.text3,
            }}
          >
            Öğrenci seçin
          </div>
        )}
      </div>
    </div>
  );
}

MesajlarSayfasi.propTypes = {
  ogrenciler: PropTypes.arrayOf(PropTypes.object).isRequired,
  okunmamisMap: PropTypes.object,
  onGeri: PropTypes.func.isRequired,
};
