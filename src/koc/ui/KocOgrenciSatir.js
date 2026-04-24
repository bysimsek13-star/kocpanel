import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';
import { Avatar } from '../../components/Shared';
import { renkler } from '../../data/konular';
import { turBelirle } from '../../utils/sinavUtils';

const OG_SATIR_GRID = '48px minmax(160px,1fr) 88px 100px 72px';

const TUR_LABEL = {
  tyt: 'TYT',
  tyt_10: 'TYT',
  tyt_11: 'TYT',
  tyt_12: 'TYT',
  sayisal: 'AYT Sayısal',
  ea: 'AYT EA',
  sozel: 'AYT Sözel',
  dil: 'AYT Dil',
  lgs: 'LGS',
  lgs_7: '7. Sınıf',
  lgs_8: '8. Sınıf / LGS',
  ortaokul: 'Ortaokul',
};

const AYT_ALANLAR = ['sayisal', 'ea', 'sozel', 'dil'];

function netSatirlar(tur, dashboard) {
  if (!dashboard) return null;
  const t = (tur || '').toLowerCase();
  const kategori = turBelirle(t);

  if (kategori === 'lgs') {
    if (dashboard.sonDenemeNet == null) return null;
    return [{ label: 'LGS', val: dashboard.sonDenemeNet }];
  }
  if (kategori === 'ortaokul') return null;

  const isAyt = AYT_ALANLAR.some(a => t.includes(a));
  if (!isAyt) {
    if (dashboard.sonDenemeNet == null) return null;
    return [{ label: 'TYT', val: dashboard.sonDenemeNet }];
  }

  const tyt = dashboard.sonTytNet ?? dashboard.sonDenemeNet;
  const ayt = dashboard.sonAytNet;
  const satirlar = [];
  if (tyt != null) satirlar.push({ label: 'TYT', val: tyt });
  if (ayt != null) satirlar.push({ label: 'AYT', val: ayt });
  return satirlar.length ? satirlar : null;
}

function turLabel(tur) {
  const key = (tur || '').toLowerCase();
  return TUR_LABEL[key] || tur || '—';
}

const KocOgrenciSatir = memo(function KocOgrenciSatir({
  ogrenci,
  index,
  dashboard,
  okunmamis,
  onClick,
  onDenemeler,
  mobil,
}) {
  const { s } = useTheme();

  const satirlar = netSatirlar(ogrenci.tur, dashboard);
  const netHuc = satirlar ? (
    <div
      onClick={e => {
        e.stopPropagation();
        onDenemeler?.();
      }}
      style={{
        textAlign: mobil ? 'right' : 'center',
        cursor: onDenemeler ? 'pointer' : 'default',
      }}
    >
      {satirlar.map(s2 => (
        <div key={s2.label} style={{ fontSize: 13, fontWeight: 700, color: s.accent }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: s.text3, marginRight: 3 }}>
            {s2.label}:
          </span>
          {s2.val}
        </div>
      ))}
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
  ) : null;

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
            <div style={{ fontSize: 11, color: s.text2, marginTop: 2 }}>
              {turLabel(ogrenci.tur)}
            </div>
          </div>
          {mesajHuc}
        </div>
        {netHuc}
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
      <div style={{ minWidth: 0, alignSelf: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: s.text }}>{ogrenci.isim}</div>
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: s.text2, alignSelf: 'center' }}>
        {turLabel(ogrenci.tur)}
      </div>
      <div style={{ alignSelf: 'center' }}>{netHuc}</div>
      <div style={{ alignSelf: 'center' }}>{mesajHuc}</div>
    </div>
  );
});

export { OG_SATIR_GRID };
export default KocOgrenciSatir;

KocOgrenciSatir.propTypes = {
  ogrenci: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  dashboard: PropTypes.object,
  okunmamis: PropTypes.number,
  onClick: PropTypes.func,
  onDenemeler: PropTypes.func,
  mobil: PropTypes.bool,
};
