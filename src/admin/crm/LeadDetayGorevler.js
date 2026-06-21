import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { LoadingState, EmptyState, Btn } from '../../components/Shared';
import { useLeadGorevleri } from './useLeadAktivite';

function tarihStr(ts) {
  const d = ts?.toDate?.() || (ts ? new Date(ts) : null);
  if (!d) return '—';
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function gorevRenk(tarih, tamamlandi) {
  if (tamamlandi) return '#22c55e';
  const d = tarih?.toDate?.() || (tarih ? new Date(tarih) : null);
  if (!d) return '#6b7280';
  const simdi = new Date();
  simdi.setHours(0, 0, 0, 0);
  const hedef = new Date(d);
  hedef.setHours(0, 0, 0, 0);
  const fark = Math.floor((hedef - simdi) / 86400000);
  if (fark < 0) return '#ef4444';
  if (fark === 0) return '#f97316';
  if (fark <= 3) return '#eab308';
  return '#6b7280';
}

const inSt = (s, extra = {}) => ({
  padding: '7px 9px',
  background: s.surface,
  border: `1px solid ${s.border}`,
  borderRadius: 7,
  color: s.text,
  fontSize: 12,
  ...extra,
});

export default function LeadDetayGorevler({ leadId, onGorevEkle, onGorevTamamla, sorumlular, s }) {
  const { gorevler, yukleniyor } = useLeadGorevleri(leadId);
  const [form, setForm] = useState({ baslik: '', tarih: '', sorumlu: '' });
  const [ekleniyor, setEkleniyor] = useState(false);
  const [formAcik, setFormAcik] = useState(false);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const kaydet = async () => {
    if (!form.baslik.trim()) return;
    setEkleniyor(true);
    try {
      await onGorevEkle(form);
      setForm({ baslik: '', tarih: '', sorumlu: '' });
      setFormAcik(false);
    } finally {
      setEkleniyor(false);
    }
  };

  if (yukleniyor) return <LoadingState mesaj="Görevler yükleniyor..." />;

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
          Görevler ({gorevler.length})
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              placeholder="Görev başlığı *"
              value={form.baslik}
              onChange={e => set('baslik', e.target.value)}
              style={{ ...inSt(s), width: '100%' }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="date"
                value={form.tarih}
                onChange={e => set('tarih', e.target.value)}
                style={{ ...inSt(s), flex: 1 }}
              />
              <select
                value={form.sorumlu}
                onChange={e => set('sorumlu', e.target.value)}
                style={{ ...inSt(s), flex: 1 }}
              >
                <option value="">— Sorumlu —</option>
                {sorumlular.map(sr => (
                  <option key={sr.id} value={sr.label}>
                    {sr.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 }}>
            <Btn
              variant="ghost"
              onClick={() => setFormAcik(false)}
              style={{ padding: '5px 12px', fontSize: 12 }}
            >
              İptal
            </Btn>
            <Btn
              onClick={kaydet}
              disabled={ekleniyor || !form.baslik.trim()}
              style={{ padding: '5px 14px', fontSize: 12 }}
            >
              {ekleniyor ? '...' : 'Kaydet'}
            </Btn>
          </div>
        </div>
      )}

      {gorevler.length === 0 ? (
        <EmptyState mesaj="Henüz görev yok" icon="☑️" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {gorevler.map(g => {
            const renk = gorevRenk(g.tarih, g.tamamlandi);
            return (
              <div
                key={g.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: s.surface2,
                  borderRadius: 10,
                  padding: '10px 12px',
                  opacity: g.tamamlandi ? 0.55 : 1,
                }}
              >
                <input
                  type="checkbox"
                  checked={!!g.tamamlandi}
                  onChange={() => !g.tamamlandi && onGorevTamamla(g.id)}
                  style={{
                    accentColor: renk,
                    width: 15,
                    height: 15,
                    flexShrink: 0,
                    cursor: 'pointer',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: s.text,
                      textDecoration: g.tamamlandi ? 'line-through' : 'none',
                    }}
                  >
                    {g.baslik}
                  </div>
                  {g.sorumlu && <div style={{ fontSize: 11, color: s.text2 }}>@{g.sorumlu}</div>}
                </div>
                {g.tarih && (
                  <span style={{ fontSize: 11, color: renk, fontWeight: 600, flexShrink: 0 }}>
                    {tarihStr(g.tarih)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

LeadDetayGorevler.propTypes = {
  leadId: PropTypes.string.isRequired,
  onGorevEkle: PropTypes.func.isRequired,
  onGorevTamamla: PropTypes.func.isRequired,
  sorumlular: PropTypes.array.isRequired,
  s: PropTypes.object.isRequired,
};
