import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Btn, Input } from '../../components/Shared';
import {
  KAYNAKLAR,
  KADEMELER,
  BASVURAN_TIPLERI,
  SINAV_TIPLERI,
  SINIFLAR,
  KOMISYONLU_KAYNAKLAR,
} from './crmSabitleri';

const BOŞ_FORM = {
  adSoyad: '',
  telefon: '',
  email: '',
  basvuran: 'Veli',
  sinavTipi: 'LGS',
  sinif: '',
  kaynak: 'Diğer',
  armutUcreti: '',
  sorumlu: '',
  kademe: 'Dönüş Yapıldı',
  durum: 'Aktif',
  butce: '',
  notlar: '',
};

const selSt = (s, extra = {}) => ({
  width: '100%',
  padding: '9px 10px',
  background: s.surface2,
  border: `1px solid ${s.border}`,
  borderRadius: 8,
  color: s.text,
  fontSize: 13,
  ...extra,
});

function Alan({ label, children }) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function Toggle({ value, options, onChange, s }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {options.map(o => (
        <button
          key={o}
          onClick={() => onChange(o)}
          type="button"
          style={{
            flex: 1,
            padding: '7px 0',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            border: `1px solid ${value === o ? '#6366f1' : s.border}`,
            background: value === o ? '#6366f1' : s.surface2,
            color: value === o ? '#fff' : s.text2,
          }}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export default function LeadEkleModal({ onKaydet, onKapat, sorumlular, s }) {
  const [form, setForm] = useState(BOŞ_FORM);
  const [kaydediliyor, setKaydediliyor] = useState(false);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const deger = key => e => set(key, e.target.value);

  const kaydet = async () => {
    if (!form.adSoyad.trim() || !form.telefon.trim()) return;
    setKaydediliyor(true);
    try {
      await onKaydet({ ...form });
      onKapat();
    } finally {
      setKaydediliyor(false);
    }
  };

  const armutGoster = KOMISYONLU_KAYNAKLAR[form.kaynak];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onKapat}
    >
      <div
        style={{
          background: s.surface,
          borderRadius: 16,
          padding: 24,
          width: '100%',
          maxWidth: 520,
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: s.text, marginBottom: 20 }}>
          Yeni Lead
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Kişi bilgileri */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Alan label="Ad Soyad *">
              <Input value={form.adSoyad} onChange={deger('adSoyad')} placeholder="Ad Soyad" />
            </Alan>
            <Alan label="Telefon *">
              <Input
                value={form.telefon}
                onChange={deger('telefon')}
                placeholder="05xx xxx xx xx"
              />
            </Alan>
          </div>

          <Alan label="E-posta">
            <Input
              type="email"
              value={form.email}
              onChange={deger('email')}
              placeholder="ornek@mail.com"
            />
          </Alan>

          {/* Başvuran */}
          <Alan label="Başvuran Kim?">
            <Toggle
              value={form.basvuran}
              options={BASVURAN_TIPLERI}
              onChange={v => set('basvuran', v)}
              s={s}
            />
          </Alan>

          {/* Sınav & Sınıf */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Alan label="Sınav Tipi">
              <select value={form.sinavTipi} onChange={deger('sinavTipi')} style={selSt(s)}>
                {SINAV_TIPLERI.map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Alan>
            <Alan label="Sınıf">
              <select value={form.sinif} onChange={deger('sinif')} style={selSt(s)}>
                <option value="">— Seç —</option>
                {SINIFLAR.map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Alan>
          </div>

          {/* Kaynak + Armut ücreti */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: armutGoster ? '1fr 1fr' : '1fr',
              gap: 10,
            }}
          >
            <Alan label="Kaynak">
              <select value={form.kaynak} onChange={deger('kaynak')} style={selSt(s)}>
                {KAYNAKLAR.map(k => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            </Alan>
            {armutGoster && (
              <Alan label="Armut Komisyon Ücreti (₺)">
                <Input
                  type="number"
                  min={0}
                  placeholder="Örn: 80"
                  value={form.armutUcreti}
                  onChange={deger('armutUcreti')}
                />
              </Alan>
            )}
          </div>

          {/* Sorumlu + Kademe */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Alan label="Sorumlu">
              <select value={form.sorumlu} onChange={deger('sorumlu')} style={selSt(s)}>
                <option value="">— Seç —</option>
                {sorumlular.map(sr => (
                  <option key={sr.id} value={sr.label}>
                    {sr.label}
                  </option>
                ))}
              </select>
            </Alan>
            <Alan label="Kademe">
              <select value={form.kademe} onChange={deger('kademe')} style={selSt(s)}>
                {KADEMELER.map(k => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            </Alan>
          </div>

          <Alan label="Bütçe (₺, opsiyonel)">
            <Input
              type="number"
              min={0}
              value={form.butce}
              onChange={deger('butce')}
              placeholder="Aylık bütçe"
            />
          </Alan>

          <Alan label="Notlar">
            <textarea
              value={form.notlar}
              onChange={deger('notlar')}
              rows={3}
              placeholder="İlk izlenimler, özel durumlar..."
              style={selSt(s, { resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 })}
            />
          </Alan>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <Btn variant="ghost" onClick={onKapat} style={{ padding: '9px 16px', fontSize: 13 }}>
            İptal
          </Btn>
          <Btn
            onClick={kaydet}
            disabled={kaydediliyor || !form.adSoyad.trim() || !form.telefon.trim()}
            style={{ padding: '9px 20px', fontSize: 13 }}
          >
            {kaydediliyor ? 'Kaydediliyor...' : 'Kaydet'}
          </Btn>
        </div>
      </div>
    </div>
  );
}

LeadEkleModal.propTypes = {
  onKaydet: PropTypes.func.isRequired,
  onKapat: PropTypes.func.isRequired,
  sorumlular: PropTypes.array.isRequired,
  s: PropTypes.object.isRequired,
};
