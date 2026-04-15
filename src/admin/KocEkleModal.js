import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import { Btn, Input } from '../components/Shared';
import { getCallable, hataMesajiVer, emailGecerliMi } from './adminHelpers';

export default function KocEkleModal({ onKapat, onEkle }) {
  const { s } = useTheme();
  const toast = useToast();
  const [form, setForm] = useState({ isim: '', email: '', sifre: '' });
  const [yukleniyor, setYukleniyor] = useState(false);

  const ekle = async () => {
    if (!form.isim.trim()) return toast('Koç adı boş olamaz.', 'info');
    if (!emailGecerliMi(form.email)) return toast('Geçerli bir e-posta adresi girin.', 'info');
    if (String(form.sifre).length < 6) return toast('Şifre en az 6 karakter olmalı.', 'info');
    setYukleniyor(true);
    try {
      await getCallable('kullaniciOlustur')({
        isim: form.isim.trim(),
        email: form.email.trim().toLowerCase(),
        sifre: form.sifre,
        rol: 'koc',
      });
      toast('Koç oluşturuldu.');
      onEkle();
      onKapat();
    } catch (e) {
      toast(hataMesajiVer(e), 'error');
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
          width: 440,
          maxWidth: '95vw',
        }}
      >
        <div style={{ color: s.text, fontWeight: 700, fontSize: 20, marginBottom: 20 }}>
          👨‍🏫 Yeni Koç Ekle
        </div>
        <Input
          placeholder="Koç Ad Soyad"
          value={form.isim}
          onChange={e => setForm(p => ({ ...p, isim: e.target.value }))}
          style={{ marginBottom: 12 }}
        />
        <Input
          placeholder="Koç E-posta"
          value={form.email}
          onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
          style={{ marginBottom: 12 }}
        />
        <Input
          placeholder="Koç Şifre"
          type="password"
          value={form.sifre}
          onChange={e => setForm(p => ({ ...p, sifre: e.target.value }))}
          style={{ marginBottom: 20 }}
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn onClick={onKapat} variant="ghost" style={{ flex: 1 }}>
            İptal
          </Btn>
          <Btn onClick={ekle} disabled={yukleniyor} style={{ flex: 2 }}>
            {yukleniyor ? 'Kaydediliyor...' : 'Koçu Ekle'}
          </Btn>
        </div>
      </div>
    </div>
  );
}
