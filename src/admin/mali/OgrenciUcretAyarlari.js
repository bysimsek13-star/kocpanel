import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Input, Btn } from '../../components/Shared';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../components/Toast';
import { MIN_AY } from './maliSabitleri';

export default function OgrenciUcretAyarlari({ ogrenci, onKapat, onKaydet }) {
  const { s } = useTheme();
  const toast = useToast();
  const [form, setForm] = useState({
    aylikUcret: ogrenci.aylikUcret || '',
    baslangicAyi: ogrenci.baslangicAyi || MIN_AY,
    iskontoOrani: ogrenci.iskontoOrani || 0,
    iskontoKodu: ogrenci.iskontoKodu || '',
  });
  const [kaydediyor, setKaydediyor] = useState(false);

  const deger = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const odenecek = () => {
    const b = Number(form.aylikUcret) || 0;
    const r = Number(form.iskontoOrani) || 0;
    return Math.round(b * (1 - r / 100));
  };

  const kaydet = async () => {
    if (!form.aylikUcret || Number(form.aylikUcret) <= 0) {
      toast('Aylık ücret giriniz.', 'error');
      return;
    }
    if (!form.baslangicAyi || form.baslangicAyi < MIN_AY) {
      toast(`Başlangıç ayı en erken ${MIN_AY} olabilir.`, 'error');
      return;
    }
    setKaydediyor(true);
    try {
      const data = {
        aylikUcret: Number(form.aylikUcret),
        baslangicAyi: form.baslangicAyi,
        iskontoOrani: Number(form.iskontoOrani) || 0,
        iskontoKodu: form.iskontoKodu.trim(),
      };
      await updateDoc(doc(db, 'ogrenciler', ogrenci.id), data);
      onKaydet?.({ ...ogrenci, ...data });
      toast('Ücret bilgileri kaydedildi.');
      onKapat();
    } catch {
      toast('Kaydedilemedi.', 'error');
    } finally {
      setKaydediyor(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={e => e.target === e.currentTarget && onKapat()}
    >
      <div
        style={{
          background: s.surface,
          borderRadius: 16,
          padding: 24,
          width: '100%',
          maxWidth: 420,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: s.text, marginBottom: 18 }}>
          {ogrenci.isim || ogrenci.email} — Ücret Ayarı
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: s.text2, marginBottom: 4 }}>Aylık Ücret (₺)</div>
            <Input
              type="number"
              min={0}
              placeholder="Örn: 3500"
              value={form.aylikUcret}
              onChange={deger('aylikUcret')}
            />
          </div>
          <div>
            <div style={{ fontSize: 12, color: s.text2, marginBottom: 4 }}>
              Başlangıç Ayı (en erken: {MIN_AY})
            </div>
            <Input
              type="month"
              min={MIN_AY}
              value={form.baslangicAyi}
              onChange={deger('baslangicAyi')}
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: s.text2, marginBottom: 4 }}>İskonto Oranı (%)</div>
              <Input
                type="number"
                min={0}
                max={100}
                placeholder="0"
                value={form.iskontoOrani}
                onChange={deger('iskontoOrani')}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: s.text2, marginBottom: 4 }}>
                İskonto Kodu (referans)
              </div>
              <Input
                placeholder="Opsiyonel"
                value={form.iskontoKodu}
                onChange={deger('iskontoKodu')}
              />
            </div>
          </div>
        </div>

        {Number(form.aylikUcret) > 0 && (
          <div
            style={{
              marginTop: 14,
              padding: '10px 14px',
              borderRadius: 10,
              background: s.accentSoft || s.surface2,
              fontSize: 13,
              color: s.text,
            }}
          >
            Ödenecek tutar:{' '}
            <strong>
              {new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: 'TRY',
                maximumFractionDigits: 0,
              }).format(odenecek())}
            </strong>
            {Number(form.iskontoOrani) > 0 && (
              <span style={{ color: s.text2, marginLeft: 8 }}>(%{form.iskontoOrani} iskonto)</span>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <Btn onClick={onKapat} variant="secondary" style={{ flex: 1 }}>
            İptal
          </Btn>
          <Btn onClick={kaydet} disabled={kaydediyor} style={{ flex: 2 }}>
            {kaydediyor ? 'Kaydediliyor...' : 'Kaydet'}
          </Btn>
        </div>
      </div>
    </div>
  );
}

OgrenciUcretAyarlari.propTypes = {
  ogrenci: PropTypes.object.isRequired,
  onKapat: PropTypes.func.isRequired,
  onKaydet: PropTypes.func,
};
