import React from 'react';
import PropTypes from 'prop-types';
import { Btn } from '../../components/Shared';
import { KADEME_RENK, DURUM_RENK } from './crmSabitleri';

function tarihStr(ts) {
  const d = ts?.toDate?.() || (ts ? new Date(ts) : null);
  if (!d) return '—';
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
}

const LeadKarti = React.memo(function LeadKarti({ lead, onDetay, s }) {
  const kademeRenk = KADEME_RENK[lead.kademe] || '#6b7280';
  const durumRenk = DURUM_RENK[lead.durum] || '#6b7280';

  return (
    <div
      onClick={onDetay}
      style={{
        background: s.surface,
        borderRadius: 12,
        border: `1px solid ${s.border}`,
        borderLeft: `3px solid ${kademeRenk}`,
        padding: '14px 16px',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 8,
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: s.text }}>{lead.adSoyad}</div>
          <div style={{ fontSize: 12, color: s.text2, marginTop: 2 }}>{lead.telefon}</div>
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#fff',
            background: kademeRenk,
            borderRadius: 99,
            padding: '2px 8px',
            flexShrink: 0,
            marginLeft: 8,
          }}
        >
          {lead.kademe || '—'}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        {lead.kaynak && (
          <span
            style={{
              fontSize: 11,
              color: s.text2,
              background: s.surface2,
              padding: '2px 7px',
              borderRadius: 99,
            }}
          >
            {lead.kaynak}
          </span>
        )}
        {lead.sorumlu && (
          <span style={{ fontSize: 11, color: s.accent, fontWeight: 600 }}>@{lead.sorumlu}</span>
        )}
        {lead.butce && (
          <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>💰 {lead.butce}</span>
        )}
        <span
          style={{
            fontSize: 11,
            color: durumRenk,
            background: `${durumRenk}20`,
            padding: '2px 7px',
            borderRadius: 99,
            marginLeft: 'auto',
          }}
        >
          {lead.durum}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: s.text3 }}>{tarihStr(lead.guncellenmeTarihi)}</span>
        <Btn
          variant="ghost"
          onClick={e => {
            e.stopPropagation();
            onDetay();
          }}
          style={{ padding: '5px 12px', fontSize: 12 }}
        >
          Detay →
        </Btn>
      </div>
    </div>
  );
});

export default LeadKarti;

LeadKarti.propTypes = {
  lead: PropTypes.object.isRequired,
  onDetay: PropTypes.func.isRequired,
  s: PropTypes.object.isRequired,
};
