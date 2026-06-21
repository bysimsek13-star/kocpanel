import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useMobil } from '../hooks/useMediaQuery';
import TemaSecici from '../components/TemaSecici';
import AdminOgrenciEkleModal from '../admin/AdminOgrenciEkleModal';
import LeadTakipSayfasi from '../admin/crm/LeadTakipSayfasi';
import MaliYonetimSayfasi from '../admin/mali/MaliYonetimSayfasi';
import useYoneticiVeri from './useYoneticiVeri';

const SEKMELER = [
  { key: 'leads', label: '🎯 Lead Takip' },
  { key: 'mali', label: '💰 Mali Yönetim' },
];

export default function CrmPaneli() {
  const { s } = useTheme();
  const { rol, isAdmin, cikisYap } = useAuth();
  const mobil = useMobil();
  const navigate = useNavigate();
  const [aktifSekme, setAktifSekme] = useState('leads');
  const [ogrenciEkleAcik, setOgrenciEkleAcik] = useState(false);

  const yetkili = isAdmin || rol === 'finans';
  const { koclar, ogrenciler, verileriGetir } = useYoneticiVeri(yetkili);

  return (
    <div style={{ minHeight: '100vh', background: s.bg, fontFamily: 'Inter, sans-serif' }}>
      <div
        style={{
          height: 56,
          background: s.surface,
          borderBottom: `1px solid ${s.border}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: 12,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 16, color: s.accent, flexShrink: 0 }}>
          ElsWay CRM
        </div>

        <div style={{ display: 'flex', gap: 4, flex: 1, justifyContent: 'center' }}>
          {SEKMELER.map(sek => (
            <button
              key={sek.key}
              onClick={() => setAktifSekme(sek.key)}
              style={{
                background: aktifSekme === sek.key ? s.accentSoft : 'transparent',
                color: aktifSekme === sek.key ? s.accent : s.text2,
                border: 'none',
                borderRadius: 8,
                padding: mobil ? '6px 10px' : '6px 18px',
                cursor: 'pointer',
                fontWeight: aktifSekme === sek.key ? 700 : 500,
                fontSize: mobil ? 13 : 14,
              }}
            >
              {sek.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <TemaSecici />
          {isAdmin && !mobil && (
            <button
              onClick={() => navigate('/admin')}
              style={{
                fontSize: 12,
                color: s.text2,
                background: s.surface2,
                border: `1px solid ${s.border}`,
                borderRadius: 8,
                padding: '5px 12px',
                cursor: 'pointer',
              }}
            >
              Yönetici Paneli
            </button>
          )}
          <button
            onClick={cikisYap}
            style={{
              fontSize: 12,
              color: s.text3,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '5px 4px',
            }}
          >
            Çıkış
          </button>
        </div>
      </div>

      <div>
        {aktifSekme === 'leads' && (
          <LeadTakipSayfasi
            s={s}
            mobil={mobil}
            koclar={koclar}
            ogrenciEkleAcik_Ac={() => setOgrenciEkleAcik(true)}
          />
        )}
        {aktifSekme === 'mali' && (
          <MaliYonetimSayfasi ogrenciler={ogrenciler} s={s} mobil={mobil} />
        )}
      </div>

      {ogrenciEkleAcik && (
        <AdminOgrenciEkleModal
          koclar={koclar}
          onKapat={() => setOgrenciEkleAcik(false)}
          onEkle={verileriGetir}
        />
      )}
    </div>
  );
}
