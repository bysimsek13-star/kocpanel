/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { getS } from '../theme';

export default function TopBar({ tema, tercih, setTema, kullanici, rol, onCikis, title }) {
  const s = getS(tema);
  const rolRenk = rol === 'koc' ? '#5B4FE8' : rol === 'ogrenci' ? '#10B981' : '#F59E0B';
  const rolLabel = rol === 'koc' ? 'Koç' : rol === 'ogrenci' ? 'Öğrenci' : 'Veli';

  return (
    <div style={{ background: s.surface, borderBottom: `1px solid ${s.border}`, padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: s.shadow, position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ fontWeight: '800', fontSize: '22px', letterSpacing: '-0.5px' }}>
        <span style={{ color: '#5B4FE8' }}>Els</span><span style={{ color: '#8B7FF5' }}>Way</span>
      </div>
      {title && <div style={{ fontSize: '15px', fontWeight: '600', color: s.text, marginLeft: '4px' }}>{title}</div>}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
        {setTema && (
          <div style={{ display: 'flex', gap: '2px', background: s.surface2, padding: '3px', borderRadius: '8px' }}>
            {[{ key: 'otomatik', icon: '⚡' }, { key: 'light', icon: '☀️' }, { key: 'dark', icon: '🌙' }].map(t => (
              <div key={t.key} onClick={() => setTema(t.key)} title={t.key === 'otomatik' ? 'Otomatik' : t.key === 'light' ? 'Gündüz' : 'Gece'}
                style={{ padding: '5px 8px', borderRadius: '6px', background: tercih === t.key ? s.surface : 'transparent', cursor: 'pointer', fontSize: '13px', transition: 'all 0.15s' }}>
                {t.icon}
              </div>
            ))}
          </div>
        )}
        <div style={{ background: `${rolRenk}20`, color: rolRenk, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>{rolLabel}</div>
        <div style={{ fontSize: '13px', color: s.text2 }}>{kullanici?.email}</div>
        <button onClick={onCikis} style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: '#F43F5E', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Çıkış</button>
      </div>
    </div>
  );
}
