import React, { useState, useEffect, memo } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Card, Avatar, Btn } from '../components/Shared';
import { aktifDurumu } from '../utils/aktiflikKaydet';
import { bugunStr } from '../utils/tarih';

const KocKarti = memo(function KocKarti({ koc, ogrenciSayisi, s, onSil, islemYukleniyor }) {
  const isim = koc.isim || koc.email || 'İsimsiz Koç';
  const [bugunGiris, setBugunGiris] = useState(null);
  const durum = aktifDurumu(koc.sonAktif);
  const bugun = bugunStr();

  useEffect(() => {
    getDoc(doc(db, 'kullanicilar', koc.id, 'aktivite', bugun))
      .then(snap => {
        if (snap.exists()) setBugunGiris(snap.data().girisSayisi || 0);
      })
      .catch(() => {});
  }, [koc.id, bugun]);

  return (
    <Card style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <Avatar isim={isim} renk="#5B4FE8" boyut={46} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: s.text, fontWeight: 700, fontSize: 15 }}>{isim}</div>
          <div style={{ color: s.text2, fontSize: 12, marginTop: 2 }}>{koc.email || '—'}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: s.accent, fontSize: 22, fontWeight: 700 }}>{ogrenciSayisi}</div>
          <div style={{ color: s.text3, fontSize: 10 }}>Öğrenci</div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 12px',
          background: s.surface2,
          borderRadius: 10,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: durum.renk,
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: durum.renk }}>{durum.label}</div>
          {bugunGiris !== null && (
            <div style={{ fontSize: 11, color: s.text3, marginTop: 2 }}>
              Bugün {bugunGiris} kez giriş
            </div>
          )}
        </div>
        {koc.aktif === false && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#F43F5E',
              background: 'rgba(244,63,94,.1)',
              padding: '2px 8px',
              borderRadius: 20,
            }}
          >
            Pasif
          </span>
        )}
      </div>

      <Btn
        onClick={() => onSil(koc)}
        variant="danger"
        disabled={islemYukleniyor}
        style={{ width: '100%', fontSize: 12, padding: '7px 12px' }}
      >
        Sistemden Kaldır
      </Btn>
    </Card>
  );
});

export default KocKarti;
