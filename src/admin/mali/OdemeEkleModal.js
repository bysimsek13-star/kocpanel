import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { serverTimestamp } from 'firebase/firestore';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../components/Toast';
import { Input, Btn } from '../../components/Shared';
import { ayYilStr, ODEME_YONTEMLERI, MIN_AY, tlFormat } from './maliSabitleri';
import { odemeKaydet } from './useMaliVeri';

export default function OdemeEkleModal({ ogrenciler, onKapat }) {
  const { s } = useTheme();
  const toast = useToast();
  const [form, setForm] = useState({
    ogrenciId: '',
    ayYil: ayYilStr(),
    tutar: '',
    yontem: ODEME_YONTEMLERI[0],
    not: '',
  });
  const [kaydediyor, setKaydediyor] = useState(false);

  const deger = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const seciliOgrenci = ogrenciler.find(o => o.id === form.ogrenciId);

  const kaydet = async () => {
    if (!form.ogrenciId) {
      toast('Öğrenci seçiniz.', 'error');
      return;
    }
    if (!form.tutar || Number(form.tutar) <= 0) {
      toast('Tutar giriniz.', 'error');
      return;
    }
    if (!form.ayYil || form.ayYil < MIN_AY) {
      toast(`En erken ${MIN_AY} girilebilir.`, 'error');
      return;
    }
    setKaydediyor(true);
    try {
      await odemeKaydet(form.ogrenciId, form.ayYil, {
        ogrenciAdi: seciliOgrenci?.isim || seciliOgrenci?.email || form.ogrenciId,
        bedelTL: Number(form.tutar),
        iskontoOrani: 0,
        iskontoKodu: '',
        odenecekTutar: Number(form.tutar),
        odendi: true,
        odemeTarihi: serverTimestamp(),
        odemeYontemi: form.yontem,
        not: form.not.trim(),
        manuel: true,
      });
      toast('Ödeme kaydedildi.');
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
          maxWidth: 440,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: s.text, marginBottom: 18 }}>
          Manuel Ödeme Ekle
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: s.text2, marginBottom: 4 }}>Öğrenci</div>
            <select
              value={form.ogrenciId}
              onChange={deger('ogrenciId')}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 8,
                border: `1px solid ${s.border}`,
                background: s.surface,
                color: s.text,
                fontSize: 14,
              }}
            >
              <option value="">Seçiniz...</option>
              {ogrenciler.map(o => (
                <option key={o.id} value={o.id}>
                  {o.isim || o.email}
                </option>
              ))}
            </select>
          </div>

          {seciliOgrenci?.aylikUcret > 0 && (
            <div
              style={{
                fontSize: 12,
                color: s.text3,
                padding: '6px 10px',
                background: s.surface2,
                borderRadius: 8,
              }}
            >
              Kayıtlı aylık: {tlFormat(seciliOgrenci.aylikUcret)}
              {seciliOgrenci.iskontoOrani > 0 &&
                ` — %${seciliOgrenci.iskontoOrani} iskonto → ${tlFormat(Math.round(seciliOgrenci.aylikUcret * (1 - seciliOgrenci.iskontoOrani / 100)))}`}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: s.text2, marginBottom: 4 }}>Ay</div>
              <Input type="month" min={MIN_AY} value={form.ayYil} onChange={deger('ayYil')} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: s.text2, marginBottom: 4 }}>Tutar (₺)</div>
              <Input
                type="number"
                min={1}
                placeholder="Örn: 3500"
                value={form.tutar}
                onChange={deger('tutar')}
              />
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: s.text2, marginBottom: 4 }}>Ödeme Yöntemi</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {ODEME_YONTEMLERI.map(y => (
                <button
                  key={y}
                  onClick={() => setForm(f => ({ ...f, yontem: y }))}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    background: form.yontem === y ? s.accent : s.surface2,
                    color: form.yontem === y ? '#fff' : s.text2,
                    border: `1px solid ${form.yontem === y ? s.accent : s.border}`,
                  }}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: s.text2, marginBottom: 4 }}>Not (opsiyonel)</div>
            <Input placeholder="Notunuz..." value={form.not} onChange={deger('not')} />
          </div>
        </div>

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

OdemeEkleModal.propTypes = {
  ogrenciler: PropTypes.array.isRequired,
  onKapat: PropTypes.func.isRequired,
};
