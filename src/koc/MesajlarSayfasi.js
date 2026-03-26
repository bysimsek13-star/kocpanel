/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from 'react';
import { getS, renkler } from '../theme';
import { Btn } from '../components/Shared';
import Mesajlar from '../ogrenci/Mesajlar';

export default function KocMesajlarSayfasi({ tema, ogrenciler, onGeri }) {
  const s = getS(tema);
  const [secili, setSecili] = useState(ogrenciler[0] || null);

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 64px)' }}>
      {/* SOL: ÖĞRENCİ LİSTESİ */}
      <div style={{ width: '280px', background: s.surface, borderRight: `1px solid ${s.border}`, overflowY: 'auto' }}>
        <div style={{ padding: '16px', borderBottom: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Btn tema={tema} onClick={onGeri} variant="outline" style={{ padding: '6px 12px', fontSize: '12px' }}>Geri</Btn>
          <div style={{ fontWeight: '600', color: s.text }}>Mesajlar</div>
        </div>
        {ogrenciler.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: s.text3, fontSize: '13px' }}>Ogrenci yok</div>
        ) : ogrenciler.map((o, i) => (
          <div key={o.id} onClick={() => setSecili(o)}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderBottom: `1px solid ${s.border}`, cursor: 'pointer', background: secili?.id === o.id ? s.accentSoft : 'transparent', transition: 'background 0.15s' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `${renkler[i % renkler.length]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: renkler[i % renkler.length], fontWeight: '700', fontSize: '13px', flexShrink: 0 }}>
              {o.isim.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: secili?.id === o.id ? s.accent : s.text, fontSize: '13.5px', fontWeight: '500' }}>{o.isim}</div>
              <div style={{ color: s.text3, fontSize: '11.5px' }}>{o.tur}</div>
            </div>
          </div>
        ))}
      </div>

      {/* SAĞ: MESAJLAŞMA */}
      <div style={{ flex: 1, padding: '20px', background: s.bg }}>
        {secili ? (
          <Mesajlar tema={tema} ogrenciId={secili.id} gonderen="koc" />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: s.text3 }}>Soldaki listeden ogrenci sec</div>
        )}
      </div>
    </div>
  );
}
