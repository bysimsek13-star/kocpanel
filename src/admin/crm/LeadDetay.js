import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Btn } from '../../components/Shared';
import { KADEMELER, DURUMLAR, KADEME_RENK } from './crmSabitleri';
import LeadDetayGorusmeler from './LeadDetayGorusmeler';
import LeadDetayGorevler from './LeadDetayGorevler';

const SEKMELER = [
  { key: 'gorusmeler', label: '💬 Görüşmeler' },
  { key: 'gorevler', label: '☑️ Görevler' },
];

export default function LeadDetay({
  lead,
  onKapat,
  onKademeGuncelle,
  onDurumGuncelle,
  onGorusmeEkle,
  onGorevEkle,
  onGorevTamamla,
  onOgrenciyeDonustur,
  sorumlular,
  s,
}) {
  const [aktifSekme, setAktifSekme] = useState('gorusmeler');
  const kademeRenk = KADEME_RENK[lead.kademe] || '#6b7280';

  const selectSt = {
    padding: '5px 9px',
    border: `1px solid ${s.border}`,
    borderRadius: 7,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: 16,
        overflowY: 'auto',
      }}
      onClick={onKapat}
    >
      <div
        style={{
          background: s.bg,
          borderRadius: 18,
          width: '100%',
          maxWidth: 640,
          marginTop: 40,
          marginBottom: 40,
          border: `1px solid ${s.border}`,
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
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
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: s.text }}>{lead.adSoyad}</div>
              <div style={{ fontSize: 13, color: s.text2, marginTop: 2 }}>{lead.telefon}</div>
              {lead.email && <div style={{ fontSize: 12, color: s.text3 }}>{lead.email}</div>}
            </div>
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
              <span style={{ fontSize: 11, color: s.accent, fontWeight: 600 }}>
                @{lead.sorumlu}
              </span>
            )}
            {lead.butce && (
              <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>
                💰 {lead.butce}
              </span>
            )}
          </div>

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
                style={{ ...selectSt, background: s.surface2, color: s.text }}
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

        {/* Sekme çubuğu */}
        <div
          style={{ display: 'flex', background: s.surface, borderBottom: `1px solid ${s.border}` }}
        >
          {SEKMELER.map(sk => (
            <button
              key={sk.key}
              onClick={() => setAktifSekme(sk.key)}
              style={{
                flex: 1,
                padding: '12px 0',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: aktifSekme === sk.key ? 700 : 400,
                color: aktifSekme === sk.key ? s.accent : s.text2,
                borderBottom:
                  aktifSekme === sk.key ? `2px solid ${s.accent}` : '2px solid transparent',
              }}
            >
              {sk.label}
            </button>
          ))}
        </div>

        {/* Sekme içeriği */}
        <div style={{ padding: '20px 24px' }}>
          {aktifSekme === 'gorusmeler' && (
            <LeadDetayGorusmeler leadId={lead.id} onGorusmeEkle={onGorusmeEkle} s={s} />
          )}
          {aktifSekme === 'gorevler' && (
            <LeadDetayGorevler
              leadId={lead.id}
              onGorevEkle={onGorevEkle}
              onGorevTamamla={onGorevTamamla}
              sorumlular={sorumlular}
              s={s}
            />
          )}
        </div>

        {/* Öğrenciye Dönüştür */}
        {lead.kademe === 'Kazanıldı' && !lead.ogrenciyeDonusturuldu && (
          <div style={{ padding: '0 24px 24px' }}>
            <Btn
              onClick={() => onOgrenciyeDonustur(lead)}
              style={{
                width: '100%',
                background: '#16a34a',
                color: '#fff',
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              🎓 Öğrenciye Dönüştür
            </Btn>
          </div>
        )}
        {lead.ogrenciyeDonusturuldu && (
          <div
            style={{ padding: '0 24px 20px', textAlign: 'center', fontSize: 12, color: '#22c55e' }}
          >
            ✅ Bu lead öğrenciye dönüştürüldü
          </div>
        )}
      </div>
    </div>
  );
}

LeadDetay.propTypes = {
  lead: PropTypes.object.isRequired,
  onKapat: PropTypes.func.isRequired,
  onKademeGuncelle: PropTypes.func.isRequired,
  onDurumGuncelle: PropTypes.func.isRequired,
  onGorusmeEkle: PropTypes.func.isRequired,
  onGorevEkle: PropTypes.func.isRequired,
  onGorevTamamla: PropTypes.func.isRequired,
  onOgrenciyeDonustur: PropTypes.func.isRequired,
  sorumlular: PropTypes.array.isRequired,
  s: PropTypes.object.isRequired,
};
