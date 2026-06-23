import React from 'react';
import PropTypes from 'prop-types';
import { KAYNAKLAR, SINAV_TIPLERI, SINIFLAR } from './crmSabitleri';

const inputSt = s => ({
  padding: '5px 9px',
  border: `1px solid ${s.border}`,
  borderRadius: 7,
  fontSize: 12,
  background: s.bg,
  color: s.text,
  flex: 1,
  outline: 'none',
  minWidth: 0,
});

export default function LeadDetayDuzenleFormu({ form, setForm, onKaydet, onIptal, sorumlular, s }) {
  const selectSt = {
    padding: '5px 9px',
    border: `1px solid ${s.border}`,
    borderRadius: 7,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    background: s.surface2,
    color: s.text,
  };
  const upd = key => e => setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, marginRight: 8 }}>
      <input
        value={form.adSoyad}
        onChange={upd('adSoyad')}
        placeholder="Ad Soyad"
        style={inputSt(s)}
      />
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          value={form.telefon}
          onChange={upd('telefon')}
          placeholder="Telefon"
          style={inputSt(s)}
        />
        <input
          value={form.email}
          onChange={upd('email')}
          placeholder="E-posta"
          style={inputSt(s)}
        />
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <select value={form.kaynak} onChange={upd('kaynak')} style={selectSt}>
          <option value="">Kaynak</option>
          {KAYNAKLAR.map(k => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <select value={form.sorumlu} onChange={upd('sorumlu')} style={selectSt}>
          <option value="">Sorumlu</option>
          {sorumlular.map(sr => (
            <option key={sr.id} value={sr.label}>
              {sr.label}
            </option>
          ))}
        </select>
        <select value={form.sinavTipi} onChange={upd('sinavTipi')} style={selectSt}>
          <option value="">Sınav</option>
          {SINAV_TIPLERI.map(t => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select value={form.sinif} onChange={upd('sinif')} style={selectSt}>
          <option value="">Sınıf</option>
          {SINIFLAR.map(sf => (
            <option key={sf} value={sf}>
              {sf}
            </option>
          ))}
        </select>
        <input
          value={form.butce}
          onChange={upd('butce')}
          placeholder="Bütçe ₺"
          style={{ ...inputSt(s), flex: 'none', width: 90 }}
        />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onKaydet}
          style={{
            padding: '6px 16px',
            background: s.accent,
            color: '#fff',
            border: 'none',
            borderRadius: 7,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Kaydet
        </button>
        <button
          onClick={onIptal}
          style={{
            padding: '6px 14px',
            background: 'transparent',
            color: s.text2,
            border: `1px solid ${s.border}`,
            borderRadius: 7,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          İptal
        </button>
      </div>
    </div>
  );
}

LeadDetayDuzenleFormu.propTypes = {
  form: PropTypes.object.isRequired,
  setForm: PropTypes.func.isRequired,
  onKaydet: PropTypes.func.isRequired,
  onIptal: PropTypes.func.isRequired,
  sorumlular: PropTypes.array.isRequired,
  s: PropTypes.object.isRequired,
};
