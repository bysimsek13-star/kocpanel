import React, { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Card, StatCard, EmptyState } from '../components/Shared';
import { coachScoreMeta, computeCoachPerformance } from '../utils/kocSkorUtils';

export default function KocPerformansPaneli({ koclar = [], ogrenciler = [] }) {
  const { s } = useTheme();

  const performans = useMemo(
    () =>
      koclar
        .map(koc =>
          computeCoachPerformance(
            koc,
            ogrenciler.filter(ogr => ogr.kocId === koc.id)
          )
        )
        .sort((a, b) => b.performansSkoru - a.performansSkoru),
    [koclar, ogrenciler]
  );

  const ortGenel = roundAverage(performans.map(item => item.performansSkoru));
  const ortOperasyon = roundAverage(performans.map(item => item.operasyonSkoru));
  const takipGereken = performans.filter(item => item.performansSkoru < 70).length;
  const enYuksek = performans[0];

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: s.text, margin: 0 }}>
          🏆 Koç Performans Paneli
        </h2>
        <div style={{ fontSize: 13, color: s.text2, marginTop: 4 }}>
          Mutlak net yerine başlangıca göre gelişim, kurulan düzen ve koç müdahalesi odaklı
          puanlama.
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
          marginBottom: 18,
        }}
      >
        <StatCard
          label="Ort. Genel Skor"
          value={ortGenel}
          sub="100 üzerinden"
          renk="#5B4FE8"
          icon="📈"
        />
        <StatCard
          label="Ort. Operasyon"
          value={ortOperasyon}
          sub="Giriş + temas + takip"
          renk="#06B6D4"
          icon="🧭"
        />
        <StatCard
          label="Takip Gereken"
          value={takipGereken}
          sub="70 altı koç"
          renk="#F59E0B"
          icon="🟠"
        />
        <StatCard
          label="En Dengeli"
          value={enYuksek?.performansSkoru || 0}
          sub={enYuksek?.isim || enYuksek?.email || '—'}
          renk="#10B981"
          icon="🥇"
        />
      </div>

      <Card style={{ padding: 16, marginBottom: 18, background: `${s.surface2}B0` }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: s.text, marginBottom: 8 }}>
          Bu panel artık nasıl puanlıyor?
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 10,
          }}
        >
          {[
            'Gelişim %35 · Öğrenciyi kendi başlangıcına göre ne kadar ilerletti?',
            'Düzen %30 · Çalışma düzeni kuruldu mu ve korundu mu?',
            'Müdahale %25 · Düşüşte koç teması ve takibi yeterli mi?',
            'Operasyon %10 · Son giriş ve işlem düzeni tamamen kaybolmuş mu?',
          ].map(item => (
            <div key={item} style={{ fontSize: 12, color: s.text2, lineHeight: 1.55 }}>
              • {item}
            </div>
          ))}
        </div>
      </Card>

      {performans.length === 0 ? (
        <EmptyState mesaj="Henüz koç verisi yok" icon="👨‍🏫" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {performans.map(koc => (
            <CoachCard key={koc.id} data={koc} />
          ))}
        </div>
      )}
    </div>
  );
}

function CoachCard({ data }) {
  const { s } = useTheme();
  const tone = coachScoreMeta(data.performansSkoru);

  return (
    <Card style={{ padding: 18 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: s.text }}>
              {data.isim || data.email || 'İsimsiz Koç'}
            </div>
            <span
              style={{
                padding: '4px 10px',
                borderRadius: 999,
                background: tone.bg,
                color: tone.color,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {tone.label}
            </span>
            {data.kalibrasyonSayisi > 0 && (
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: 'rgba(91,79,232,0.12)',
                  color: '#5B4FE8',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {data.kalibrasyonSayisi} öğrenci kalibrasyonda
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: s.text3, marginTop: 4 }}>
            {data.email || 'Email yok'}
          </div>
          <div style={{ fontSize: 12, color: s.text2, marginTop: 10, lineHeight: 1.6 }}>
            {data.aciklama}
          </div>
        </div>

        <div style={{ minWidth: 160, textAlign: 'right' }}>
          <div
            style={{ fontSize: 11, color: s.text3, textTransform: 'uppercase', marginBottom: 4 }}
          >
            Genel koç skoru
          </div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 800,
              color: data.veriYeterli ? tone.color : s.text3,
              lineHeight: 1,
            }}
          >
            {data.veriYeterli ? data.performansSkoru : '—'}
          </div>
          <div style={{ fontSize: 11, color: s.text3, marginTop: 6 }}>
            {data.veriYeterli ? '100 üzerinden' : 'Veri yetersiz'}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          marginTop: 18,
        }}
      >
        <SubScoreCard
          title="Gelişim"
          value={data.gelisimSkoru}
          subtitle="Başlangıca göre ilerleme"
          color="#5B4FE8"
        />
        <SubScoreCard
          title="Düzen"
          value={data.duzenSkoru}
          subtitle="Çalışma ve görev istikrarı"
          color="#10B981"
        />
        <SubScoreCard
          title="Müdahale"
          value={data.mudahaleSkoru}
          subtitle="Temas ve cevap disiplini"
          color="#F59E0B"
        />
        <SubScoreCard
          title="Operasyon"
          value={data.operasyonSkoru}
          subtitle="Son giriş ve işlem düzeni"
          color="#06B6D4"
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 10,
          marginTop: 18,
        }}
      >
        <MiniMetric label="Öğrenci" value={data.ogrenciSayisi} />
        <MiniMetric label="Ort. tamam" value={`%${data.ortTamamlama}`} />
        <MiniMetric label="Ort. net" value={data.ortNet || '—'} />
        <MiniMetric label="Rapor" value={data.raporBekleyen} />
        <MiniMetric label="Hedefe yakın" value={data.hedefeYakin} />
        <MiniMetric
          label="Potansiyel"
          value={data.ortPotansiyelKullanimi ? `%${data.ortPotansiyelKullanimi}` : '—'}
        />
        <MiniMetric label="Net düşüş" value={data.dususYasayan} />
      </div>

      <div
        style={{
          marginTop: 18,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 10,
        }}
      >
        <InfoStrip label="Son giriş" value={formatDayInfo(data.sonGirisGun)} />
        <InfoStrip label="Son aktif işlem" value={formatDayInfo(data.sonAktiflikGun)} />
        <InfoStrip label="Bekleyen iletişim" value={String(data.bekleyenMesaj ?? 0)} />
      </div>
    </Card>
  );
}

function SubScoreCard({ title, value, subtitle, color }) {
  const { s } = useTheme();
  return (
    <div
      style={{
        border: `1px solid ${s.border}`,
        borderRadius: 14,
        padding: 14,
        background: s.surface2,
      }}
    >
      <div
        style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}
      >
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: s.text }}>{title}</div>
          <div style={{ fontSize: 11, color: s.text3, marginTop: 3 }}>{subtitle}</div>
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color }}>{value}</div>
      </div>
      <div
        style={{
          height: 8,
          borderRadius: 999,
          background: 'rgba(148,163,184,0.18)',
          marginTop: 12,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${Math.max(0, Math.min(100, value))}%`,
            height: '100%',
            background: color,
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  );
}

function MiniMetric({ label, value }) {
  const { s } = useTheme();
  return (
    <div
      style={{
        background: s.surface2,
        border: `1px solid ${s.border}`,
        borderRadius: 12,
        padding: 12,
      }}
    >
      <div style={{ fontSize: 10, color: s.text3, textTransform: 'uppercase', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: s.text }}>{value}</div>
    </div>
  );
}

function InfoStrip({ label, value }) {
  const { s } = useTheme();
  return (
    <div style={{ border: `1px dashed ${s.border}`, borderRadius: 12, padding: '10px 12px' }}>
      <div style={{ fontSize: 10, color: s.text3, textTransform: 'uppercase', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color: s.text, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function roundAverage(values = []) {
  const cleaned = values.filter(v => Number.isFinite(v));
  if (!cleaned.length) return 0;
  return Math.round(cleaned.reduce((sum, item) => sum + item, 0) / cleaned.length);
}

function formatDayInfo(days) {
  if (days === null || days === undefined || Number.isNaN(days)) return 'Veri yok';
  if (days === 0) return 'Bugün';
  if (days === 1) return '1 gün önce';
  return `${days} gün önce`;
}
