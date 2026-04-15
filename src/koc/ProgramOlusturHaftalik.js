import React from 'react';
import { Card, Btn, EmptyState } from '../components/Shared';

const DERSLER = [
  'Matematik',
  'Türkçe',
  'Fizik',
  'Kimya',
  'Biyoloji',
  'Tarih',
  'Coğrafya',
  'Edebiyat',
];

export default function ProgramOlusturHaftalik({
  gorev,
  setGorev,
  gorevDers,
  setGorevDers,
  gorevEkle,
  gorevSil,
  program,
  s,
}) {
  return (
    <Card style={{ padding: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: s.text, marginBottom: 16 }}>
        📅 Haftalık Program
      </div>
      <div style={{ fontSize: 12, color: s.text3, marginBottom: 12 }}>
        Öğrencinin bu hafta yapacağı görevleri ekleyin. Öğrenci sadece bunları görür ve tamamlar.
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <select
          value={gorevDers}
          onChange={e => setGorevDers(e.target.value)}
          style={{
            background: s.surface2,
            border: `1px solid ${s.border}`,
            borderRadius: 9,
            padding: '9px 12px',
            color: s.text,
            fontSize: 13,
            outline: 'none',
          }}
        >
          {DERSLER.map(d => (
            <option key={d}>{d}</option>
          ))}
        </select>
        <input
          value={gorev}
          onChange={e => setGorev(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && gorevEkle()}
          placeholder="Görev yaz... (Enter)"
          style={{
            flex: 1,
            minWidth: 140,
            background: s.surface2,
            border: `1px solid ${s.border}`,
            borderRadius: 9,
            padding: '9px 12px',
            color: s.text,
            fontSize: 13,
            outline: 'none',
          }}
        />
        <Btn
          onClick={gorevEkle}
          disabled={!gorev.trim()}
          style={{ padding: '9px 16px', fontSize: 13 }}
        >
          + Ekle
        </Btn>
      </div>

      {program.length === 0 ? (
        <EmptyState mesaj="Henüz haftalık görev yok" icon="📅" />
      ) : (
        program.map(p => (
          <div
            key={p.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: 10,
              borderRadius: 8,
              marginBottom: 4,
              background: p.tamamlandi ? s.surface2 : 'transparent',
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 6,
                flexShrink: 0,
                background: p.tamamlandi ? '#10B981' : s.surface2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                color: '#fff',
              }}
            >
              {p.tamamlandi && '✓'}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 13,
                  color: p.tamamlandi ? s.text3 : s.text,
                  textDecoration: p.tamamlandi ? 'line-through' : 'none',
                }}
              >
                {p.gorev}
              </div>
              <div style={{ fontSize: 11, color: s.text3 }}>{p.ders}</div>
            </div>
            <div style={{ fontSize: 11, color: p.tamamlandi ? '#10B981' : s.text3 }}>
              {p.tamamlandi ? 'Tamamlandı' : 'Bekliyor'}
            </div>
            <button
              onClick={() => gorevSil(p.id)}
              style={{
                background: 'none',
                border: 'none',
                color: '#F43F5E',
                cursor: 'pointer',
                fontSize: 14,
                opacity: 0.5,
              }}
            >
              ✕
            </button>
          </div>
        ))
      )}
    </Card>
  );
}
