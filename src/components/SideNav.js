/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { getS } from '../theme';

export default function SideNav({ tema, menu, aktif, onSelect }) {
  const s = getS(tema);
  return (
    <div style={{ width: '240px', background: s.surface, borderRight: `1px solid ${s.border}`, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '2px', flexShrink: 0, minHeight: 'calc(100vh - 64px)' }}>
      {menu.map(item => (
        <div key={item.label} onClick={() => onSelect(item)}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', background: aktif === item.key ? s.accentSoft : 'transparent', color: aktif === item.key ? s.accent : s.text2, cursor: 'pointer', fontSize: '13.5px', fontWeight: aktif === item.key ? '600' : '400', transition: 'all 0.15s', position: 'relative' }}>
          <span style={{ fontSize: '16px' }}>{item.icon}</span>
          <span style={{ flex: 1 }}>{item.label}</span>
          {item.badge > 0 && <span style={{ background: '#F43F5E', color: 'white', fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '20px' }}>{item.badge}</span>}
          {aktif === item.key && <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '3px', background: s.accent, borderRadius: '0 3px 3px 0' }} />}
        </div>
      ))}
    </div>
  );
}
