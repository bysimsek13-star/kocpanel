import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import { Input, Btn } from '../components/Shared';
import { getCallable, hataMesajiVer } from './adminHelpers';

export default function CrmKullaniciEkleModal({ onKapat, onEkle }) {
  const { s } = useTheme();
  const toast = useToast();
  const [form, setForm] = useState({ isim: '', email: '', sifre: '' });
  const [yukleniyor, setYukleniyor] = useState(false);

  const deger = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const kaydet = async () => {
    if (!form.isim.trim() || !form.email.trim() || form.sifre.length < 6) {
      toast('İsim, email ve en az 6 haneli şifre gerekli.', 'error');
      return;
    }
    setYukleniyor(true);
    try {
      await getCallable('kullaniciOlustur')({
        isim: form.isim.trim(),
        email: form.email.trim().toLowerCase(),
        sifre: form.sifre,
        rol: 'finans',
      });
      toast(`${form.isim} CRM hesabı oluşturuldu.`);
      onEkle?.();
      onKapat();
    } catch (e) {
      toast(hataMesajiVer(e), 'error');
    } finally {
      setYukleniyor(false);
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
          padding: 28,
          width: '100%',
          maxWidth: 400,
        }}
      >
        <div style={{ fontSize: 17, fontWeight: 700, color: s.text, marginBottom: 6 }}>
          CRM Kullanıcısı Ekle
        </div>
        <div style={{ fontSize: 13, color: s.text2, marginBottom: 20 }}>
          Bu kullanıcı yalnızca Lead Takip ve Mali Yönetim paneline erişebilir.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: s.text2, marginBottom: 4 }}>Ad Soyad</div>
            <Input placeholder="Ahmet Yılmaz" value={form.isim} onChange={deger('isim')} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: s.text2, marginBottom: 4 }}>E-posta</div>
            <Input
              type="email"
              placeholder="crm@elsway.com"
              value={form.email}
              onChange={deger('email')}
            />
          </div>
          <div>
            <div style={{ fontSize: 12, color: s.text2, marginBottom: 4 }}>Şifre (min 6 hane)</div>
            <Input
              type="password"
              placeholder="••••••"
              value={form.sifre}
              onChange={deger('sifre')}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <Btn onClick={onKapat} variant="secondary" style={{ flex: 1 }}>
            İptal
          </Btn>
          <Btn onClick={kaydet} disabled={yukleniyor} style={{ flex: 2 }}>
            {yukleniyor ? 'Oluşturuluyor...' : 'Hesap Oluştur'}
          </Btn>
        </div>
      </div>
    </div>
  );
}

CrmKullaniciEkleModal.propTypes = {
  onKapat: PropTypes.func.isRequired,
  onEkle: PropTypes.func,
};
