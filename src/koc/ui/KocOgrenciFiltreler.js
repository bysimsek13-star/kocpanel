import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';
import { useMobil } from '../../hooks/useMediaQuery';
import { Input } from '../../components/Shared';
import { KocToolbar, KocChipGroup, KocSortRow } from '../../components/koc/KocPanelUi';

const FILTRE_SECENEKLERI = [
  { id: 'tumu', label: 'Tümü' },
  { id: 'mesaj', label: 'Mesaj bekleyen' },
  { id: 'bugun_bos', label: 'Bugün giriş yok' },
];
const SIRA_SECENEKLERI = [
  { id: 'isim', label: 'İsim' },
  { id: 'net_cok', label: 'Net (yüksek)' },
  { id: 'net_az', label: 'Net (düşük)' },
];

export default function KocOgrenciFiltreler({ arama, setArama, filtre, setFiltre, sira, setSira }) {
  const { s } = useTheme();
  const mobil = useMobil();

  return (
    <>
      <KocToolbar mobil={mobil}>
        <div style={{ flex: mobil ? undefined : 1, minWidth: mobil ? undefined : 200 }}>
          <Input
            value={arama}
            onChange={e => setArama(e.target.value)}
            placeholder="İsim veya e-posta ara…"
            style={{ borderRadius: 12, padding: '12px 16px', fontSize: 14, width: '100%' }}
          />
        </div>
        <KocChipGroup options={FILTRE_SECENEKLERI} value={filtre} onChange={setFiltre} />
        {!mobil && (
          <>
            <span style={{ width: 1, height: 28, background: s.border, margin: '0 4px' }} />
            <KocSortRow options={SIRA_SECENEKLERI} value={sira} onChange={setSira} />
          </>
        )}
      </KocToolbar>
      {mobil && (
        <div style={{ marginBottom: 14 }}>
          <KocSortRow options={SIRA_SECENEKLERI} value={sira} onChange={setSira} />
        </div>
      )}
    </>
  );
}

KocOgrenciFiltreler.propTypes = {
  arama: PropTypes.string,
  setArama: PropTypes.func.isRequired,
  filtre: PropTypes.string,
  setFiltre: PropTypes.func.isRequired,
  sira: PropTypes.string,
  setSira: PropTypes.func.isRequired,
};
