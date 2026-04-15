import React from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, Btn, Avatar } from '../components/Shared';
import { renkler } from '../data/konular';

function Sparkline({ veriler, renk }) {
  if (!veriler || veriler.length < 2)
    return <span style={{ fontSize: 11, color: '#9CA3AF' }}>— veri yok</span>;
  const data = [...veriler]
    .reverse()
    .slice(0, 8)
    .map((d, i) => ({ i, net: parseFloat(d.toplamNet) || 0 }));
  return (
    <ResponsiveContainer width="100%" height={36}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <Line
          type="monotone"
          dataKey="net"
          stroke={renk}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3 }}
        />
        <Tooltip
          content={({ active, payload }) =>
            active && payload?.[0] ? (
              <div
                style={{
                  background: '#1A1730',
                  color: '#fff',
                  fontSize: 11,
                  padding: '3px 8px',
                  borderRadius: 6,
                }}
              >
                {payload[0].value} net
              </div>
            ) : null
          }
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function MobilKart({ r, s, detay }) {
  const sparkRenk = r.fark == null ? s.text3 : r.fark >= 0 ? '#10B981' : '#F43F5E';
  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <Avatar isim={r.ogrenci.isim} renk={renkler[r.index % renkler.length]} boyut={42} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: s.text }}>{r.ogrenci.isim}</div>
            <div style={{ fontSize: 12, color: s.text3 }}>{r.den.length} deneme</div>
          </div>
          {r.son && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.accent }}>
                {r.son.toplamNet}
              </div>
              <div style={{ fontSize: 10, color: s.text3 }}>{r.son.sinav}</div>
            </div>
          )}
        </div>
        {r.den.length === 0 ? (
          <div style={{ fontSize: 13, color: s.text3 }}>Henüz deneme yok</div>
        ) : (
          <>
            <div
              style={{
                marginBottom: 10,
                padding: '8px 12px',
                borderRadius: 10,
                background: r.netUI.bg,
                color: r.netUI.renk,
                fontSize: 11,
                fontWeight: 700,
                display: 'inline-block',
              }}
            >
              {r.netUI.etiket}
            </div>
            {r.fark !== null && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 10,
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: r.fark >= 0 ? s.okSoft : s.tehlikaSoft,
                  border: `1px solid ${s.border}`,
                }}
              >
                <span style={{ fontSize: 14 }}>{r.fark >= 0 ? '↑' : '↓'}</span>
                <span
                  style={{ fontSize: 13, fontWeight: 700, color: r.fark >= 0 ? s.ok : s.tehlika }}
                >
                  {r.fark >= 0 ? '+' : ''}
                  {r.fark.toFixed(1)} net
                </span>
              </div>
            )}
            {r.sonUcOrt != null && (
              <div style={{ fontSize: 12, color: s.text2, marginBottom: 8 }}>
                Son 3 ortalaması: <strong style={{ color: s.text }}>{r.sonUcOrt.toFixed(1)}</strong>
              </div>
            )}
            {r.den.length >= 2 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 10, color: s.text3, marginBottom: 4 }}>NET TRENDİ</div>
                <Sparkline veriler={r.den} renk={sparkRenk} />
              </div>
            )}
          </>
        )}
      </div>
      <div style={{ padding: '0 16px 14px' }}>
        <Btn
          variant="outline"
          style={{ width: '100%', fontSize: 12 }}
          onClick={() => detay(r.ogrenci.id)}
        >
          Deneme detayı →
        </Btn>
      </div>
    </Card>
  );
}

const COLS = '44px minmax(140px,1.2fr) 72px 100px 88px 120px 100px';

export default function DenemeYonetimiListesi({ listelenen, s, mobil, detay }) {
  if (mobil) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {listelenen.map(r => (
          <MobilKart key={r.ogrenci.id} r={r} s={s} detay={detay} />
        ))}
      </div>
    );
  }
  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: COLS,
          gap: 10,
          padding: '12px 18px',
          borderBottom: `1px solid ${s.border}`,
          background: s.surface2,
          fontSize: 10,
          fontWeight: 700,
          color: s.text3,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        <div />
        <div>Öğrenci</div>
        <div style={{ textAlign: 'center' }}>Adet</div>
        <div style={{ textAlign: 'center' }}>Son net</div>
        <div style={{ textAlign: 'center' }}>Δ</div>
        <div>Trend</div>
        <div style={{ textAlign: 'right' }}>İşlem</div>
      </div>
      {listelenen.map(r => {
        const sparkRenk = r.fark == null ? s.text3 : r.fark >= 0 ? '#10B981' : '#F43F5E';
        return (
          <div
            key={r.ogrenci.id}
            style={{
              display: 'grid',
              gridTemplateColumns: COLS,
              gap: 10,
              padding: '12px 18px',
              borderBottom: `1px solid ${s.border}`,
              alignItems: 'center',
              transition: 'background .12s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = s.surface2;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Avatar isim={r.ogrenci.isim} renk={renkler[r.index % renkler.length]} boyut={36} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: s.text }}>{r.ogrenci.isim}</div>
              <div style={{ fontSize: 11, color: s.text3 }}>{r.ogrenci.tur}</div>
            </div>
            <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: s.text2 }}>
              {r.den.length}
            </div>
            <div
              style={{
                textAlign: 'center',
                fontSize: 15,
                fontWeight: 800,
                color: r.son ? s.accent : s.text3,
              }}
            >
              {r.son ? r.son.toplamNet : '—'}
            </div>
            <div
              style={{
                textAlign: 'center',
                fontSize: 13,
                fontWeight: 700,
                color: r.fark == null ? s.text3 : r.fark >= 0 ? s.ok : s.tehlika,
              }}
            >
              {r.fark == null ? '—' : `${r.fark >= 0 ? '+' : ''}${r.fark.toFixed(1)}`}
            </div>
            <div style={{ height: 36 }}>
              {r.den.length < 2 ? (
                <span style={{ fontSize: 11, color: s.text3 }}>—</span>
              ) : (
                <Sparkline veriler={r.den} renk={sparkRenk} />
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <Btn
                style={{ padding: '7px 12px', fontSize: 12 }}
                onClick={() => detay(r.ogrenci.id)}
              >
                Aç
              </Btn>
            </div>
          </div>
        );
      })}
    </Card>
  );
}
