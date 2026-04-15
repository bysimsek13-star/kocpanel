import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';
import { Avatar } from '../../components/Shared';
import { renkler } from '../../data/konular';

const OG_SATIR_GRID = '48px minmax(160px,1fr) 76px minmax(120px,1fr) 88px 96px';

function dkStr(dk) {
  if (!dk || dk < 1) return null;
  const s = Math.floor(dk / 60);
  const m = dk % 60;
  return s > 0 ? (m > 0 ? `${s}s ${m}dk` : `${s}s`) : `${m}dk`;
}

function BugunRozetleri({ bugun, s }) {
  if (!bugun) return null;
  const items = [
    { ok: bugun.rutin, t: 'R', bg: s.okSoft || 'rgba(109,139,114,0.14)', fg: s.ok || '#6D8B72' },
    { ok: bugun.gunlukSoru, t: 'S', bg: s.accentSoft, fg: s.accent },
    {
      ok: bugun.calisma,
      t: 'C',
      bg: s.bilgiSoft || 'rgba(109,132,153,0.14)',
      fg: s.bilgi || '#6D8499',
    },
  ];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6, alignItems: 'center' }}>
      {items.map(x => (
        <span
          key={x.t}
          style={{
            fontSize: 10,
            fontWeight: 800,
            padding: '2px 6px',
            borderRadius: 6,
            background: x.ok ? x.bg : s.surface2,
            color: x.ok ? x.fg : s.text3,
            border: `1px solid ${x.ok ? 'transparent' : s.border}`,
            opacity: x.ok ? 1 : 0.75,
          }}
        >
          {x.t}
          {x.ok ? '✓' : '·'}
        </span>
      ))}
      {!bugun.rutin && !bugun.gunlukSoru && (
        <span style={{ fontSize: 10, fontWeight: 700, color: s.uyari || '#B89A6E', marginLeft: 2 }}>
          bugün boş
        </span>
      )}
    </div>
  );
}

const KocOgrenciSatir = memo(function KocOgrenciSatir({
  ogrenci,
  index,
  dashboard,
  bugun,
  okunmamis,
  onClick,
  onDenemeler,
  mobil,
}) {
  const { s } = useTheme();

  const netHuc =
    dashboard?.sonDenemeNet != null ? (
      <div style={{ textAlign: mobil ? 'right' : 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: s.text }}>{dashboard.sonDenemeNet}</div>
        {dashboard?.netDegisim != null && (
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: dashboard.netDegisim >= 0 ? s.ok : s.tehlika,
            }}
          >
            {dashboard.netDegisim >= 0 ? '+' : ''}
            {dashboard.netDegisim}
          </div>
        )}
      </div>
    ) : (
      <span style={{ fontSize: 12, color: s.text3, display: 'block', textAlign: 'center' }}>—</span>
    );

  const mesajHuc = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
      {okunmamis > 0 && (
        <span
          style={{
            background: s.tehlikaSoft,
            color: s.tehlika,
            fontSize: 10,
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: 20,
            border: `1px solid ${s.border}`,
          }}
        >
          {okunmamis}
        </span>
      )}
      <span style={{ color: s.accent, fontSize: 15 }}>→</span>
    </div>
  );

  const row = {
    borderBottom: `1px solid ${s.border}`,
    cursor: 'pointer',
    transition: 'background .15s',
  };

  if (mobil)
    return (
      <div
        onClick={onClick}
        style={{ ...row, display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 18px' }}
        onMouseEnter={e => (e.currentTarget.style.background = s.surface2)}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar isim={ogrenci.isim} renk={renkler[index % renkler.length]} boyut={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: s.text }}>{ogrenci.isim}</div>
            <div style={{ fontSize: 11, color: s.text3, marginTop: 2 }}>{ogrenci.email}</div>
          </div>
          {mesajHuc}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: s.text2,
              background: s.surface2,
              padding: '4px 10px',
              borderRadius: 8,
            }}
          >
            {ogrenci.tur || '—'}
          </span>
          {netHuc}
        </div>
        <BugunRozetleri bugun={bugun} s={s} />
        {dkStr(ogrenci.gunlukDakika) && (
          <span
            style={{
              display: 'inline-block',
              marginTop: 2,
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: 6,
              background: s.bilgiSoft || 'rgba(99,132,153,0.12)',
              color: s.bilgi || '#6384A0',
              border: `1px solid ${s.border}`,
            }}
          >
            ⏱ {dkStr(ogrenci.gunlukDakika)}
          </span>
        )}
      </div>
    );

  return (
    <div
      onClick={onClick}
      style={{
        ...row,
        display: 'grid',
        gridTemplateColumns: OG_SATIR_GRID,
        gap: 12,
        padding: '12px 20px',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = s.surface2)}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <Avatar isim={ogrenci.isim} renk={renkler[index % renkler.length]} boyut={40} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: s.text }}>{ogrenci.isim}</div>
        <div
          style={{
            fontSize: 11,
            color: s.text3,
            marginTop: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {ogrenci.email}
        </div>
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: s.text2, alignSelf: 'center' }}>
        {ogrenci.tur || '—'}
      </div>
      <div style={{ alignSelf: 'center' }}>
        <BugunRozetleri bugun={bugun} s={s} />
        {dkStr(ogrenci.gunlukDakika) && (
          <span
            style={{
              display: 'inline-block',
              marginTop: 5,
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: 6,
              background: s.bilgiSoft || 'rgba(99,132,153,0.12)',
              color: s.bilgi || '#6384A0',
              border: `1px solid ${s.border}`,
            }}
          >
            ⏱ {dkStr(ogrenci.gunlukDakika)}
          </span>
        )}
      </div>
      <div style={{ alignSelf: 'center' }}>{netHuc}</div>
      <div
        style={{
          alignSelf: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 8,
        }}
      >
        {onDenemeler && (
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onDenemeler();
            }}
            style={{
              background: s.surface,
              border: `1px solid ${s.border}`,
              borderRadius: 8,
              padding: '5px 8px',
              fontSize: 11,
              fontWeight: 600,
              color: s.accent,
              cursor: 'pointer',
            }}
          >
            Deneme
          </button>
        )}
        {mesajHuc}
      </div>
    </div>
  );
});

export { OG_SATIR_GRID };
export default KocOgrenciSatir;

BugunRozetleri.propTypes = {
  bugun: PropTypes.object,
  s: PropTypes.object.isRequired,
};
