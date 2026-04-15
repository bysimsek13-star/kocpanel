import React, { useState } from 'react';
import { haftaBaslangici } from '../utils/programAlgoritma';

export const AYLAR = [
  'Oca',
  'Şub',
  'Mar',
  'Nis',
  'May',
  'Haz',
  'Tem',
  'Ağu',
  'Eyl',
  'Eki',
  'Kas',
  'Ara',
];

export const DONEM_RENKLER = [
  { renk: '#5B7FA6', acik: 'rgba(91,127,166,0.13)', label: 'Dönem 1' },
  { renk: '#7A6EA0', acik: 'rgba(122,110,160,0.13)', label: 'Dönem 2' },
  { renk: '#4A8C6F', acik: 'rgba(74,140,111,0.13)', label: 'Sınav dönemi' },
  { renk: '#B89A6E', acik: 'rgba(184,154,110,0.13)', label: 'Tatil' },
  { renk: '#9B5E5E', acik: 'rgba(155,94,94,0.13)', label: 'Yoğun çalışma' },
];

// Yılın tüm haftalarını üret (Pazartesi bazlı ISO haftaları)
export function yilHaftalari(yil) {
  const haftalar = [];
  const bas = new Date(yil, 0, 1);
  const gun = bas.getDay();
  const fark = gun === 0 ? 1 : gun === 1 ? 0 : 8 - gun;
  bas.setDate(bas.getDate() + fark);
  while (bas.getFullYear() <= yil) {
    const bitis = new Date(bas);
    bitis.setDate(bitis.getDate() + 6);
    const key = `${bas.getFullYear()}-${String(bas.getMonth() + 1).padStart(2, '0')}-${String(bas.getDate()).padStart(2, '0')}`;
    haftalar.push({
      key,
      bas: new Date(bas),
      bitis: new Date(bitis),
      ay: bas.getMonth(),
      ay2: bitis.getMonth(),
    });
    bas.setDate(bas.getDate() + 7);
    if (haftalar.length > 60) break;
  }
  return haftalar;
}

export function haftaOffsetHesapla(haftaKey) {
  const bugunKey = haftaBaslangici();
  const hedef = new Date(haftaKey);
  const bugun = new Date(bugunKey);
  return Math.round((hedef - bugun) / (7 * 24 * 60 * 60 * 1000));
}

// ─── Hafta hücresi ────────────────────────────────────────────────────────────
export function HaftaHucresi({ hafta, donem, denemeVar, sinav, secili, onClick, s }) {
  const [hoverlandi, setHoverlandi] = useState(false);
  const b = new Date();
  const bugun = `${b.getFullYear()}-${String(b.getMonth() + 1).padStart(2, '0')}-${String(b.getDate()).padStart(2, '0')}`;
  const gecmis = hafta.key < bugun;
  const bitis = hafta.bitis;
  const bitisStr = `${bitis.getFullYear()}-${String(bitis.getMonth() + 1).padStart(2, '0')}-${String(bitis.getDate()).padStart(2, '0')}`;
  const bugunHafta = bugun >= hafta.key && bugun <= bitisStr;

  const bg = donem ? donem.acik : bugunHafta ? s.accentSoft : gecmis ? s.surface2 : s.surface;
  const border = secili
    ? `2px solid ${s.accent}`
    : bugunHafta
      ? `1.5px solid ${s.accent}`
      : `1px solid ${s.border}`;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHoverlandi(true)}
      onMouseLeave={() => setHoverlandi(false)}
      title={`${hafta.bas.toLocaleDateString('tr-TR')} – ${hafta.bitis.toLocaleDateString('tr-TR')}`}
      style={{
        background: bg,
        border,
        borderRadius: 6,
        height: 44,
        cursor: 'pointer',
        position: 'relative',
        transition: 'transform .12s, box-shadow .12s',
        transform: hoverlandi && !secili ? 'scale(1.05)' : 'scale(1)',
        boxShadow: hoverlandi && !secili ? s.shadow : 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        overflow: 'hidden',
      }}
    >
      {(donem || sinav) && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: sinav ? '#9B5E5E' : donem?.renk,
            borderRadius: '5px 5px 0 0',
          }}
        />
      )}
      <div
        style={{
          fontSize: 10,
          fontWeight: bugunHafta ? 700 : 500,
          color: bugunHafta ? s.accent : gecmis ? s.text3 : s.text,
        }}
      >
        {hafta.bas.getDate()}
        {hafta.bas.getMonth() !== hafta.bitis.getMonth() ? `/${hafta.bitis.getDate()}` : ''}
      </div>
      {denemeVar && (
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: s.accent }} />
      )}
      {bugunHafta && (
        <div
          style={{
            position: 'absolute',
            bottom: 2,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 16,
            height: 2,
            borderRadius: 1,
            background: s.accent,
          }}
        />
      )}
    </div>
  );
}
