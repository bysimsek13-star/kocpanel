import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import { Btn, Input } from '../components/Shared';
import { SINAV_TUR_SECENEKLERI } from './adminHelpers';

export default function OgrenciDuzenleModal({ ogrenci, onKapat, onKaydet }) {
  const { s } = useTheme();
  const toast = useToast();
  const [form, setForm] = useState({ isim: ogrenci.isim || '', tur: ogrenci.tur || 'tyt_12' });
  const [yukleniyor, setYukleniyor] = useState(false);

  const kaydet = async () => {
    if (!form.isim.trim()) return toast('İsim boş olamaz.', 'info');
    setYukleniyor(true);
    try {
      await updateDoc(doc(db, 'ogrenciler', ogrenci.id), { isim: form.isim.trim(), tur: form.tur });
      await updateDoc(doc(db, 'kullanicilar', ogrenci.id), {
        isim: form.isim.trim(),
        tur: form.tur,
      });
      toast('Öğrenci bilgileri güncellendi.');
      onKaydet({ ...ogrenci, isim: form.isim.trim(), tur: form.tur });
      onKapat();
    } catch (e) {
      toast('Güncellenemedi: ' + e.message, 'error');
    }
    setYukleniyor(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        style={{
          background: s.surface,
          border: `1px solid ${s.border}`,
          borderRadius: 24,
          padding: 30,
          width: 420,
          maxWidth: '95vw',
        }}
      >
        <div style={{ color: s.text, fontWeight: 700, fontSize: 18, marginBottom: 20 }}>
          ✏️ Öğrenci Düzenle
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: s.text2, marginBottom: 6 }}>
          İsim Soyisim
        </div>
        <Input
          value={form.isim}
          onChange={e => setForm(f => ({ ...f, isim: e.target.value }))}
          placeholder="Öğrenci adı soyadı"
          style={{ marginBottom: 16 }}
        />
        <div style={{ fontSize: 12, fontWeight: 600, color: s.text2, marginBottom: 6 }}>
          Sınav Türü
        </div>
        <select
          value={form.tur}
          onChange={e => setForm(f => ({ ...f, tur: e.target.value }))}
          style={{
            width: '100%',
            padding: 12,
            borderRadius: 12,
            background: s.surface2,
            border: `1px solid ${s.border}`,
            color: s.text,
            marginBottom: 24,
          }}
        >
          {SINAV_TUR_SECENEKLERI}
        </select>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn onClick={onKapat} variant="ghost" style={{ flex: 1 }}>
            İptal
          </Btn>
          <Btn onClick={kaydet} disabled={yukleniyor} style={{ flex: 2 }}>
            {yukleniyor ? 'Kaydediliyor...' : 'Kaydet'}
          </Btn>
        </div>
      </div>
    </div>
  );
}
