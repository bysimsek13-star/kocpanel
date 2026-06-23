import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { KADEMELER, DURUMLAR, KADEME_RENK } from './crmSabitleri';
import LeadDetayDuzenleFormu from './LeadDetayDuzenleFormu';

export default function LeadDetayHeader({
  lead,
  onKapat,
  onKademeGuncelle,
  onDurumGuncelle,
  onLeadGuncelle,
  onLeadSil,
  sorumlular,
  s,
}) {
  const [duzenle, setDuzenle] = useState(false);
  const [form, setForm] = useState({});
  const kademeRenk = KADEME_RENK[lead.kademe] || '#6b7280';

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

  const handleDuzenleAc = () => {
    setForm({
      adSoyad: lead.adSoyad || '',
      telefon: lead.telefon || '',
      email: lead.email || '',
      kaynak: lead.kaynak || '',
      sorumlu: lead.sorumlu || '',
      butce: lead.butce || '',
      sinavTipi: lead.sinavTipi || '',
      sinif: lead.sinif || '',
    });
    setDuzenle(true);
  };

  const handleKaydet = async () => {
    await onLeadGuncelle(form);
    setDuzenle(false);
  };

  const handleSil = () => {
    if (window.confirm(`"${lead.adSoyad}" silinecek. Emin misiniz?`)) {
      onLeadSil();
    }
  };

  return (
    <div
      style={{
        padding: '20px 24px',
        borderBottom: `1px solid ${s.border}`,
        background: s.surface,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 12,
        }}
      >
        {duzenle ? (
          <LeadDetayDuzenleFormu
            form={form}
            setForm={setForm}
            onKaydet={handleKaydet}
            onIptal={() => setDuzenle(false)}
            sorumlular={sorumlular}
            s={s}
          />
        ) : (
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.text }}>{lead.adSoyad}</div>
            <div style={{ fontSize: 13, color: s.text2, marginTop: 2 }}>{lead.telefon}</div>
            {lead.email && <div style={{ fontSize: 12, color: s.text3 }}>{lead.email}</div>}
          </div>
        )}
        <div style={{ display: 'flex', gap: 4, flexShrink: 0, alignItems: 'center' }}>
          {!duzenle && (
            <button
              onClick={handleDuzenleAc}
              title="Düzenle"
              style={{
                background: 'none',
                border: 'none',
                fontSize: 15,
                cursor: 'pointer',
                color: s.text3,
                padding: '4px 6px',
              }}
            >
              ✏️
            </button>
          )}
          <button
            onClick={handleSil}
            title="Sil"
            style={{
              background: 'none',
              border: 'none',
              fontSize: 15,
              cursor: 'pointer',
              color: '#ef4444',
              padding: '4px 6px',
            }}
          >
            🗑️
          </button>
          <button
            onClick={onKapat}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 20,
              cursor: 'pointer',
              color: s.text3,
              padding: '4px 6px',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {!duzenle && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            alignItems: 'center',
            marginBottom: 14,
          }}
        >
          {lead.kaynak && (
            <span
              style={{
                fontSize: 11,
                background: s.surface2,
                color: s.text2,
                padding: '3px 9px',
                borderRadius: 99,
              }}
            >
              {lead.kaynak}
            </span>
          )}
          {lead.sorumlu && (
            <span style={{ fontSize: 11, color: s.accent, fontWeight: 600 }}>@{lead.sorumlu}</span>
          )}
          {lead.sinavTipi && <span style={{ fontSize: 11, color: s.text2 }}>{lead.sinavTipi}</span>}
          {lead.sinif && <span style={{ fontSize: 11, color: s.text2 }}>{lead.sinif}</span>}
          {lead.butce && (
            <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>💰 {lead.butce}</span>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <div>
          <div
            style={{
              fontSize: 10,
              color: s.text3,
              marginBottom: 4,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Kademe
          </div>
          <select
            value={lead.kademe || ''}
            onChange={e => onKademeGuncelle(e.target.value)}
            style={{ ...selectSt, background: kademeRenk, color: '#fff', border: 'none' }}
          >
            {KADEMELER.map(k => (
              <option key={k} value={k} style={{ background: '#1f2937', color: '#fff' }}>
                {k}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div
            style={{
              fontSize: 10,
              color: s.text3,
              marginBottom: 4,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Durum
          </div>
          <select
            value={lead.durum || ''}
            onChange={e => onDurumGuncelle(e.target.value)}
            style={selectSt}
          >
            {DURUMLAR.map(d => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

LeadDetayHeader.propTypes = {
  lead: PropTypes.object.isRequired,
  onKapat: PropTypes.func.isRequired,
  onKademeGuncelle: PropTypes.func.isRequired,
  onDurumGuncelle: PropTypes.func.isRequired,
  onLeadGuncelle: PropTypes.func.isRequired,
  onLeadSil: PropTypes.func.isRequired,
  sorumlular: PropTypes.array.isRequired,
  s: PropTypes.object.isRequired,
};
