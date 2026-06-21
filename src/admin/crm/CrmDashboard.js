import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { EmptyState, StatCard } from '../../components/Shared';
import { KADEMELER, KADEME_RENK } from './crmSabitleri';

function tsStr(ts) {
  const d = ts?.toDate?.() || (ts ? new Date(ts) : null);
  if (!d) return '—';
  return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

export default function CrmDashboard({ leads, bugunGorevler, s }) {
  const istatistik = useMemo(() => {
    const toplam = leads.length;
    const aktif = leads.filter(l => l.durum === 'Aktif').length;
    const simdi = new Date();
    const ayBaslangic = new Date(simdi.getFullYear(), simdi.getMonth(), 1);
    const ayKazanilan = leads.filter(l => {
      if (l.kademe !== 'Kazanıldı') return false;
      const t = l.olusturmaTarihi?.toDate?.();
      return t && t >= ayBaslangic;
    }).length;
    const toplamKazanilan = leads.filter(l => l.kademe === 'Kazanıldı').length;
    const donusum = toplam > 0 ? Math.round((toplamKazanilan / toplam) * 100) : 0;
    return { toplam, aktif, ayKazanilan, donusum };
  }, [leads]);

  const huniVerisi = useMemo(
    () =>
      KADEMELER.map(k => ({
        kademe: k,
        sayi: leads.filter(l => l.kademe === k).length,
        renk: KADEME_RENK[k],
      })),
    [leads]
  );

  const maxSayi = Math.max(...huniVerisi.map(h => h.sayi), 1);

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 14,
          marginBottom: 24,
        }}
      >
        <StatCard label="Toplam Lead" value={istatistik.toplam} renk={s.accent} icon="🎯" />
        <StatCard label="Aktif Lead" value={istatistik.aktif} renk="#22c55e" icon="🔥" />
        <StatCard label="Bu Ay Kazanılan" value={istatistik.ayKazanilan} renk="#f59e0b" icon="🏆" />
        <StatCard label="Dönüşüm Oranı" value={`%${istatistik.donusum}`} renk="#6366f1" icon="📈" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div
          style={{
            background: s.surface,
            borderRadius: 14,
            border: `1px solid ${s.border}`,
            padding: 20,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: s.text, marginBottom: 16 }}>
            Pipeline Hunisi
          </div>
          {huniVerisi.map(({ kademe, sayi, renk }) => (
            <div key={kademe} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: s.text2 }}>{kademe}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: renk }}>{sayi}</span>
              </div>
              <div style={{ height: 6, background: s.surface2, borderRadius: 99 }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.round((sayi / maxSayi) * 100)}%`,
                    background: renk,
                    borderRadius: 99,
                    transition: 'width 0.4s',
                    minWidth: sayi > 0 ? 6 : 0,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            background: s.surface,
            borderRadius: 14,
            border: `1px solid ${s.border}`,
            padding: 20,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: s.text, marginBottom: 16 }}>
            Bugünün Görevleri ({bugunGorevler.length})
          </div>
          {bugunGorevler.length === 0 ? (
            <EmptyState mesaj="Bugün görev yok" icon="✅" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {bugunGorevler.map(g => (
                <div
                  key={g.id}
                  style={{
                    padding: '8px 10px',
                    background: s.surface2,
                    borderRadius: 8,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: s.text }}>{g.baslik}</div>
                    <div style={{ fontSize: 11, color: s.text2 }}>{g.leadAdi}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {g.sorumlu && <div style={{ fontSize: 11, color: s.accent }}>@{g.sorumlu}</div>}
                    {g.tarih && (
                      <div style={{ fontSize: 11, color: s.text3 }}>{tsStr(g.tarih)}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

CrmDashboard.propTypes = {
  leads: PropTypes.array.isRequired,
  bugunGorevler: PropTypes.array.isRequired,
  s: PropTypes.object.isRequired,
};
