import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import { Btn, Input } from '../components/Shared';
import { bildirimOlustur } from '../components/BildirimSistemi';
import { getCallable, hataMesajiVer, emailGecerliMi, SINAV_TUR_SECENEKLERI } from './adminHelpers';

export default function AdminOgrenciEkleModal({ koclar, onKapat, onEkle }) {
  const { s } = useTheme();
  const toast = useToast();
  const [yukleniyor, setYukleniyor] = useState(false);
  const [form, setForm] = useState({
    isim: '',
    email: '',
    sifre: '',
    veliEmail: '',
    veliSifre: '',
    kocId: '',
    tur: 'tyt_12',
  });

  const guncelle = (alan, deger) => setForm(prev => ({ ...prev, [alan]: deger }));

  const dogrula = () => {
    if (!form.isim.trim()) return 'Öğrenci adı boş olamaz.';
    if (!emailGecerliMi(form.email)) return 'Geçerli bir öğrenci e-postası girin.';
    if (String(form.sifre).length < 6) return 'Öğrenci şifresi en az 6 karakter olmalı.';
    if (form.veliEmail && !emailGecerliMi(form.veliEmail))
      return 'Geçerli bir veli e-postası girin.';
    if (form.veliEmail && String(form.veliSifre).length < 6)
      return 'Veli şifresi en az 6 karakter olmalı.';
    return null;
  };

  const ekle = async () => {
    const hata = dogrula();
    if (hata) return toast(hata, 'info');
    setYukleniyor(true);
    try {
      const sonuc = await getCallable('kullaniciOlustur')({
        isim: form.isim.trim(),
        email: form.email.trim().toLowerCase(),
        sifre: form.sifre,
        veliEmail: form.veliEmail.trim().toLowerCase(),
        veliSifre: form.veliSifre,
        kocId: form.kocId || '',
        tur: form.tur,
        beklenenSaat: 6,
        rol: 'ogrenci',
      });
      if (form.kocId) {
        await bildirimOlustur({
          aliciId: form.kocId,
          tip: 'ogrenci_eklendi',
          baslik: 'Yeni öğrenci atandı',
          mesaj: `${form.isim.trim()} size atandı.`,
          gonderenId: sonuc?.data?.olusturanUid || 'admin',
          route: '/koc/ogrenciler',
          entityId: sonuc?.data?.uid || '',
        }).catch(() => {});
      }
      toast(form.veliEmail ? 'Öğrenci ve veli oluşturuldu.' : 'Öğrenci oluşturuldu.');
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
        background: 'rgba(0,0,0,0.7)',
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
          width: 520,
          maxWidth: '95vw',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ color: s.text, fontWeight: 700, fontSize: 20, marginBottom: 20 }}>
          🎓 Yeni Öğrenci ve Veli Kaydı
        </div>

        <div
          style={{
            color: s.accent,
            fontSize: 11,
            fontWeight: 800,
            marginBottom: 10,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
          }}
        >
          Öğrenci Bilgileri
        </div>
        <Input
          placeholder="Öğrenci Ad Soyad"
          value={form.isim}
          onChange={e => guncelle('isim', e.target.value)}
          style={{ marginBottom: 12 }}
        />
        <Input
          placeholder="Öğrenci E-posta"
          value={form.email}
          onChange={e => guncelle('email', e.target.value)}
          style={{ marginBottom: 12 }}
        />
        <Input
          placeholder="Öğrenci Şifre"
          type="password"
          value={form.sifre}
          onChange={e => guncelle('sifre', e.target.value)}
          style={{ marginBottom: 12 }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: s.text2, marginBottom: 6 }}>
              Sınav Türü
            </div>
            <select
              value={form.tur}
              onChange={e => guncelle('tur', e.target.value)}
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 12,
                background: s.surface2,
                border: `1px solid ${s.border}`,
                color: s.text,
              }}
            >
              {SINAV_TUR_SECENEKLERI}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: s.text2, marginBottom: 6 }}>
            Sorumlu Koç
          </div>
          <select
            value={form.kocId}
            onChange={e => guncelle('kocId', e.target.value)}
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 12,
              background: s.surface2,
              border: `1px solid ${s.border}`,
              color: s.text,
            }}
          >
            <option value="">Koç seçilmesin</option>
            {koclar.map(k => (
              <option key={k.id} value={k.id}>
                {k.isim || k.email}
              </option>
            ))}
          </select>
        </div>

        <div style={{ background: s.surface2, borderRadius: 18, padding: 16, marginBottom: 22 }}>
          <div
            style={{
              color: s.text,
              fontSize: 12,
              fontWeight: 800,
              marginBottom: 10,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
            }}
          >
            Veli Bilgileri (Opsiyonel)
          </div>
          <Input
            placeholder="Veli E-posta"
            value={form.veliEmail}
            onChange={e => guncelle('veliEmail', e.target.value)}
            style={{ marginBottom: 12 }}
          />
          <Input
            placeholder="Veli Şifre"
            type="password"
            value={form.veliSifre}
            onChange={e => guncelle('veliSifre', e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Btn onClick={onKapat} variant="ghost" style={{ flex: 1 }}>
            İptal
          </Btn>
          <Btn onClick={ekle} disabled={yukleniyor} style={{ flex: 2 }}>
            {yukleniyor ? 'Kaydediliyor...' : 'Kaydı Tamamla'}
          </Btn>
        </div>
      </div>
    </div>
  );
}
