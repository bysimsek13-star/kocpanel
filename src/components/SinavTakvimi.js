import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Card } from './Shared';
import { upcomingExams, formatCountdown } from '../utils/ogrenciUtils';

export default function SinavTakvimi({ tur, compact = false, title = 'Sınav Takvimi' }) {
  const { s } = useTheme();
  const exams = upcomingExams(tur).slice(0, compact ? 2 : 4);
  return (
    <Card style={{ padding: compact ? 16 : 18 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 15, color: s.text }}>🗓️ {title}</div>
        <div style={{ fontSize: 11, color: s.text3 }}>{tur || 'Genel'}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {exams.map(exam => (
          <div
            key={exam.key}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              alignItems: 'center',
              padding: '10px 12px',
              background: s.surface2,
              borderRadius: 12,
              border: `1px solid ${s.border}`,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: s.text }}>{exam.label}</div>
              <div style={{ fontSize: 11, color: s.text3, marginTop: 2 }}>
                {new Date(exam.date).toLocaleDateString('tr-TR')}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: exam.daysLeft <= 30 ? s.warning : s.accent,
                }}
              >
                {formatCountdown(exam.daysLeft)}
              </div>
              {exam.daysLeft >= 0 && (
                <div style={{ fontSize: 10, color: s.text3, marginTop: 2 }}>geri sayım</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
