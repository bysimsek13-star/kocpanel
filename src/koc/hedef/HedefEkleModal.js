import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useToast } from '../../components/Toast';
import { Btn } from '../../components/Shared';
import { TUR_LABEL } from './hedefUtils';

export default function HedefEkleModal({ ogrenci, onKapat, onEkle, s }) {
  const toast = useToast();
  const [baslik, setBaslik] = useState('');
  const [tur, setTur] = useState('net');
  const [baslangic, setBaslangic] = useState('');
  const [hedefDeger, setHedefDeger] = useState('');
  const [sonTarih, setSonTarih] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  useEffect(() => {
    const kapat = e => {
      if (e.key === 'Escape') onKapat();
    };
    document.addEventListener('keydown', kapat);
    return () => document.removeEventListener('keydown', kapat);
  }, [onKapat]);

  const kaydet = async () => {
    if (!baslik.trim() || !hedefDeger) return;
    setYukleniyor(true);
    try {
      await addDoc(collection(db, 'ogrenciler', ogrenci.id, 'hedefler'), {
        baslik: baslik.trim(),
        hedefTur: tur,
        baslangicDegeri: parseFloat(baslangic) || 0,
        hedefDeger: parseFloat(hedefDeger),
        guncelDeger: parseFloat(baslangic) || 0,
        sonTarih: sonTarih || null,
        durum: 'aktif',
        olusturma: new Date(),
      });
      toast('Hedef eklendi!');
      onEkle();
      onKapat();
    } catch {
      toast('Eklenemedi', 'error');
    }
    setYukleniyor(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="hedef-modal-baslik"
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
          width: 420,
          maxWidth: '95vw',
          margin: 20,
          boxShadow: s.shadow,
        }}
      >
        <div
          id="hedef-modal-baslik"
          style={{ color: s.text, fontSize: 17, fontWeight: 700, marginBottom: 20 }}
        >
          {ogrenci.isim} — Yeni hedef
        </div>

        {/* Başlık */}
        <div style={{ marginBottom: 12 }}>
          <label
            htmlFor="hedef-baslik"
            style={{
              display: 'block',
              color: s.text2,
              fontSize: 12,
              fontWeight: 500,
              marginBottom: 5,
            }}
          >
            Hedef Başlığı
          </label>
          <input
            id="hedef-baslik"
            value={baslik}
            onChange={e => setBaslik(e.target.value)}
            placeholder="örn: TYT Matematikte 90 net"
            style={{
              width: '100%',
              background: s.surface2,
              border: `1px solid ${s.border}`,
              borderRadius: 10,
              padding: '10px 14px',
              color: s.text,
              fontSize: 13,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Tür */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ color: s.text2, fontSize: 12, fontWeight: 500, marginBottom: 5 }}>Tür</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {Object.entries(TUR_LABEL).map(([k, v]) => (
              <div
                key={k}
                onClick={() => setTur(k)}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '8px 4px',
                  borderRadius: 9,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: tur === k ? `2px solid ${s.accent}` : `1px solid ${s.border}`,
                  background: tur === k ? s.accentSoft : s.surface2,
                  color: tur === k ? s.accent : s.text2,
                }}
              >
                {v}
              </div>
            ))}
          </div>
        </div>

        {/* Puan türü bilgi notu */}
        {tur === 'puan' && (
          <div
            style={{
              fontSize: 11,
              color: s.text3,
              background: s.surface2,
              borderRadius: 8,
              padding: '8px 10px',
              marginBottom: 12,
              lineHeight: 1.5,
              border: `1px solid ${s.border}`,
            }}
          >
            💡 Puan hedefi genel deneme ortalamasına göre hesaplanır. Branş bazlı hedef için
            &quot;Net&quot; türünü kullan.
          </div>
        )}

        {/* Değerler */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          {[
            {
              l: `Başlangıç (${TUR_LABEL[tur]})`,
              v: baslangic,
              fn: setBaslangic,
              p: '0',
              id: 'hedef-baslangic',
            },
            {
              l: `Hedef (${TUR_LABEL[tur]})`,
              v: hedefDeger,
              fn: setHedefDeger,
              p: '90',
              id: 'hedef-deger',
            },
          ].map(f => (
            <div key={f.l}>
              <label
                htmlFor={f.id}
                style={{
                  display: 'block',
                  color: s.text2,
                  fontSize: 12,
                  fontWeight: 500,
                  marginBottom: 5,
                }}
              >
                {f.l}
              </label>
              <input
                id={f.id}
                type="number"
                value={f.v}
                onChange={e => f.fn(e.target.value)}
                placeholder={f.p}
                style={{
                  width: '100%',
                  background: s.surface2,
                  border: `1px solid ${s.border}`,
                  borderRadius: 10,
                  padding: '10px 12px',
                  color: s.text,
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          ))}
        </div>

        {/* Son tarih */}
        <div style={{ marginBottom: 20 }}>
          <label
            htmlFor="hedef-tarih"
            style={{
              display: 'block',
              color: s.text2,
              fontSize: 12,
              fontWeight: 500,
              marginBottom: 5,
            }}
          >
            Bitiş Tarihi (İsteğe Bağlı)
          </label>
          <input
            id="hedef-tarih"
            type="date"
            value={sonTarih}
            onChange={e => setSonTarih(e.target.value)}
            style={{
              width: '100%',
              background: s.surface2,
              border: `1px solid ${s.border}`,
              borderRadius: 10,
              padding: '10px 14px',
              color: s.text,
              fontSize: 13,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Btn onClick={onKapat} variant="ghost" style={{ flex: 1 }}>
            İptal
          </Btn>
          <Btn
            onClick={kaydet}
            disabled={!baslik.trim() || !hedefDeger || yukleniyor}
            style={{ flex: 2 }}
          >
            {yukleniyor ? 'Ekleniyor...' : 'Hedef Ekle'}
          </Btn>
        </div>
      </div>
    </div>
  );
}

HedefEkleModal.propTypes = {
  ogrenci: PropTypes.shape({ id: PropTypes.string, isim: PropTypes.string }).isRequired,
  onKapat: PropTypes.func.isRequired,
  onEkle: PropTypes.func.isRequired,
  s: PropTypes.object.isRequired,
};
