import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { LoadingState, EmptyState, Btn } from '../../components/Shared';
import { useGorusmeler } from './useLeadAktivite';
import { GORUSME_KANALLARI } from './crmSabitleri';

function tarihStr(ts) {
  const d = ts?.toDate?.() || (ts ? new Date(ts) : null);
  if (!d) return '—';
  return d.toLocaleString('tr-TR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const KANAL_EMOJI = {
  Telefon: '📞',
  WhatsApp: '💬',
  'Yüz yüze': '🤝',
  Mesaj: '✉️',
  'E-posta': '📧',
};

const inSt = (s, extra = {}) => ({
  padding: '7px 9px',
  background: s.surface,
  border: `1px solid ${s.border}`,
  borderRadius: 7,
  color: s.text,
  fontSize: 12,
  ...extra,
});

export default function LeadDetayGorusmeler({ leadId, onGorusmeEkle, s }) {
  const { gorusmeler, yukleniyor } = useGorusmeler(leadId);
  const [form, setForm] = useState({ kanal: 'Telefon', kim: '', not: '' });
  const [ekleniyor, setEkleniyor] = useState(false);
  const [formAcik, setFormAcik] = useState(false);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const kaydet = async () => {
    if (!form.not.trim()) return;
    setEkleniyor(true);
    try {
      await onGorusmeEkle(form);
      setForm({ kanal: 'Telefon', kim: '', not: '' });
      setFormAcik(false);
    } finally {
      setEkleniyor(false);
    }
  };

  if (yukleniyor) return <LoadingState mesaj="Görüşmeler yükleniyor..." />;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: s.text }}>
          Görüşme Geçmişi ({gorusmeler.length})
        </div>
        <Btn
          variant="ghost"
          onClick={() => setFormAcik(v => !v)}
          style={{ padding: '5px 12px', fontSize: 12 }}
        >
          + Ekle
        </Btn>
      </div>

      {formAcik && (
        <div style={{ background: s.surface2, borderRadius: 10, padding: 14, marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <select
              value={form.kanal}
              onChange={e => set('kanal', e.target.value)}
              style={{ ...inSt(s), flex: 1 }}
            >
              {GORUSME_KANALLARI.map(k => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
            <input
              placeholder="Kim yaptı?"
              value={form.kim}
              onChange={e => set('kim', e.target.value)}
              style={{ ...inSt(s), flex: 1 }}
            />
          </div>
          <textarea
            placeholder="Görüşme notu..."
            value={form.not}
            onChange={e => set('not', e.target.value)}
            rows={3}
            style={{ ...inSt(s), width: '100%', resize: 'vertical', marginBottom: 8 }}
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn
              variant="ghost"
              onClick={() => setFormAcik(false)}
              style={{ padding: '5px 12px', fontSize: 12 }}
            >
              İptal
            </Btn>
            <Btn
              onClick={kaydet}
              disabled={ekleniyor || !form.not.trim()}
              style={{ padding: '5px 14px', fontSize: 12 }}
            >
              {ekleniyor ? '...' : 'Kaydet'}
            </Btn>
          </div>
        </div>
      )}

      {gorusmeler.length === 0 ? (
        <EmptyState mesaj="Henüz görüşme yok" icon="💬" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {gorusmeler.map(g => (
            <div
              key={g.id}
              style={{ background: s.surface2, borderRadius: 10, padding: '10px 12px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: s.text }}>
                  {KANAL_EMOJI[g.kanal] || '📌'} {g.kanal}
                  {g.kim && <span style={{ fontWeight: 400, color: s.text2 }}> · {g.kim}</span>}
                </span>
                <span style={{ fontSize: 11, color: s.text3 }}>{tarihStr(g.tarih)}</span>
              </div>
              <div style={{ fontSize: 12, color: s.text2, lineHeight: 1.55 }}>{g.not}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

LeadDetayGorusmeler.propTypes = {
  leadId: PropTypes.string.isRequired,
  onGorusmeEkle: PropTypes.func.isRequired,
  s: PropTypes.object.isRequired,
};
