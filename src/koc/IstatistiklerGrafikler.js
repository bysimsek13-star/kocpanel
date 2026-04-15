import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { KocChartCard } from '../components/koc/KocPanelUi';

export function NetTrendGrafik({ veri, s }) {
  const ttStyle = {
    background: s.surface,
    border: `1px solid ${s.border}`,
    borderRadius: 10,
    color: s.text,
    fontSize: 12,
  };
  return (
    <KocChartCard title="Deneme net trendi" hint="Seçili kapsam ve öğrenci için tarihsel ortalama">
      {veri.length < 2 ? (
        <div style={{ textAlign: 'center', padding: 32, color: s.text3, fontSize: 13 }}>
          Grafik için bu kapsamda en az iki sınav kaydı gerekir.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={veri} margin={{ top: 8, right: 12, left: -22, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={s.border} />
            <XAxis dataKey="tarih" tick={{ fontSize: 10, fill: s.text3 }} />
            <YAxis tick={{ fontSize: 10, fill: s.text3 }} />
            <Tooltip contentStyle={ttStyle} formatter={v => [`${v} net`, 'Ort.']} />
            <Line
              type="monotone"
              dataKey="net"
              stroke={s.accent}
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: s.accent, stroke: s.surface, strokeWidth: 2 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </KocChartCard>
  );
}

export function CalismaBarGrafik({ veri, s }) {
  const ttStyle = {
    background: s.surface,
    border: `1px solid ${s.border}`,
    borderRadius: 10,
    color: s.text,
    fontSize: 12,
  };
  return (
    <KocChartCard title="14 günlük çalışma saati" hint="Öğrenci başına günlük ortalama saat">
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={veri} margin={{ top: 4, right: 12, left: -22, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={s.border} vertical={false} />
          <XAxis dataKey="gun" tick={{ fontSize: 9, fill: s.text3 }} />
          <YAxis tick={{ fontSize: 10, fill: s.text3 }} unit="s" />
          <Tooltip contentStyle={ttStyle} formatter={v => [`${v}s`, 'Ort. çalışma']} />
          <Bar dataKey="ort" fill={s.chartPos || s.accent} radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </KocChartCard>
  );
}
