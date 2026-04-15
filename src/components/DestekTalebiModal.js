import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Card, Btn, Input } from './Shared';
import { useToast } from './Toast';
import { destekTipleri } from '../utils/adminUtils';
import { useTheme } from '../context/ThemeContext';

export default function DestekTalebiModal({ acik, onClose, varsayilanRol = 'ogrenci' }) {
  const toast = useToast();
  const { s } = useTheme();
  const [tip, setTip] = useState('teknik');
  const [baslik, setBaslik] = useState('');
  const [detay, setDetay] = useState('');
  const [gonderiliyor, setGonderiliyor] = useState(false);

  if (!acik) return null;

  const kaydet = async () => {
    if (!baslik.trim() || !detay.trim()) return toast('Başlık ve detay gerekli', 'error');
    setGonderiliyor(true);
    try {
      await addDoc(collection(db, 'destekTalepleri'), {
        tip,
        baslik: baslik.trim(),
        detay: detay.trim(),
        rol: varsayilanRol,
        durum: 'acik',
        olusturma: serverTimestamp(),
      });
      toast('Destek talebi oluşturuldu', 'success');
      setBaslik('');
      setDetay('');
      setTip('teknik');
      onClose?.();
    } catch (e) {
      toast(e?.message || 'Destek talebi oluşturulamadı', 'error');
    }
    setGonderiliyor(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,23,42,0.45)',
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <Card onClick={e => e.stopPropagation()} style={{ width: 'min(560px,100%)', padding: 20 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: s.text }}>🆘 Destek Talebi</div>
            <div style={{ fontSize: 12, color: s.text3, marginTop: 4 }}>
              Teknik sorun, istek veya hesap problemi için kayıt oluştur.
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: 20,
              cursor: 'pointer',
              color: s.text2,
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5,1fr)',
            gap: 8,
            marginBottom: 14,
          }}
        >
          {destekTipleri.map(item => (
            <button
              key={item.value}
              onClick={() => setTip(item.value)}
              style={{
                border: `1px solid ${tip === item.value ? s.accent : s.border}`,
                background: tip === item.value ? s.accentSoft : s.surface2,
                color: tip === item.value ? s.accent : s.text2,
                borderRadius: 12,
                padding: '10px 8px',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 16, marginBottom: 4 }}>{item.icon}</div>
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input
            value={baslik}
            onChange={e => setBaslik(e.target.value)}
            placeholder="Kısa başlık"
          />
          <textarea
            value={detay}
            onChange={e => setDetay(e.target.value)}
            rows={6}
            placeholder="Sorunu veya isteğini detaylı anlat"
            style={{
              width: '100%',
              borderRadius: 12,
              border: `1px solid ${s.border}`,
              background: s.surface2,
              color: s.text,
              padding: 12,
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
          <Btn tip="secondary" onClick={onClose}>
            Vazgeç
          </Btn>
          <Btn onClick={kaydet} disabled={gonderiliyor}>
            {gonderiliyor ? 'Gönderiliyor...' : 'Talep Oluştur'}
          </Btn>
        </div>
      </Card>
    </div>
  );
}
