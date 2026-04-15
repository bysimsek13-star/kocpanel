import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useToast } from '../../components/Toast';
import { Btn } from '../../components/Shared';
import { hedefTurEtiket, hedefDurumu, ilerlemeYuzdesi, durumStil } from './hedefUtils';

export default function GuncelleModal({ hedef, ogrenciId, onKapat, onGuncelle, s }) {
  const toast = useToast();
  const [deger, setDeger] = useState(String(hedef.guncelDeger ?? hedef.baslangicDegeri ?? ''));
  const [yukleniyor, setYukleniyor] = useState(false);

  const kaydet = async () => {
    setYukleniyor(true);
    try {
      const guncDeger = parseFloat(deger);
      const durum = hedefDurumu({ ...hedef, guncelDeger: guncDeger });
      await updateDoc(doc(db, 'ogrenciler', ogrenciId, 'hedefler', hedef.id), {
        guncelDeger: guncDeger,
        durum,
        sonGuncelleme: new Date(),
      });
      toast('Güncellendi!');
      onGuncelle();
      onKapat();
    } catch {
      toast('Hata', 'error');
    }
    setYukleniyor(false);
  };

  const yuzde = ilerlemeYuzdesi({
    ...hedef,
    guncelDeger: parseFloat(deger) || hedef.baslangicDegeri,
  });
  const durum = hedefDurumu({ ...hedef, guncelDeger: parseFloat(deger) || hedef.baslangicDegeri });
  const d = durumStil(s, durum);

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
          padding: 32,
          width: 380,
          maxWidth: '95vw',
          margin: 20,
          boxShadow: s.shadow,
        }}
      >
        <div style={{ color: s.text, fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
          İlerleme güncelle
        </div>
        <div style={{ color: s.text2, fontSize: 13, marginBottom: 20 }}>{hedef.baslik}</div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ color: s.text2, fontSize: 12, fontWeight: 500, marginBottom: 5 }}>
            Güncel Değer ({hedefTurEtiket(hedef)})
          </div>
          <input
            type="number"
            value={deger}
            onChange={e => setDeger(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              background: s.surface2,
              border: `1px solid ${s.accent}`,
              borderRadius: 10,
              padding: '12px 14px',
              color: s.text,
              fontSize: 16,
              fontWeight: 700,
              outline: 'none',
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Canlı preview */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 6,
              fontSize: 12,
            }}
          >
            <span style={{ color: s.text2 }}>
              {hedef.baslangicDegeri} → {hedef.hedefDeger}
            </span>
            <span style={{ fontWeight: 700, color: d.renk }}>{yuzde}%</span>
          </div>
          <div style={{ height: 8, background: s.surface2, borderRadius: 4, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${yuzde}%`,
                background: d.renk,
                borderRadius: 4,
                transition: 'width 0.3s',
              }}
            />
          </div>
          <div
            style={{
              marginTop: 8,
              display: 'inline-block',
              fontSize: 11,
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: 20,
              background: d.bg,
              color: d.renk,
            }}
          >
            {d.label}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Btn onClick={onKapat} variant="ghost" style={{ flex: 1 }}>
            İptal
          </Btn>
          <Btn onClick={kaydet} disabled={!deger || yukleniyor} style={{ flex: 2 }}>
            {yukleniyor ? 'Kaydediliyor...' : 'Kaydet'}
          </Btn>
        </div>
      </div>
    </div>
  );
}

GuncelleModal.propTypes = {
  hedef: PropTypes.object.isRequired,
  ogrenciId: PropTypes.string.isRequired,
  onKapat: PropTypes.func.isRequired,
  onGuncelle: PropTypes.func.isRequired,
  s: PropTypes.object.isRequired,
};
