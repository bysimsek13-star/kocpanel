import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useMobil } from '../hooks/useMediaQuery';
import { Btn, Card } from '../components/Shared';
import { KocHeroBand } from '../components/koc/KocPanelUi';
import { OgrenciTakvimi } from './OgrenciTakvimi';

// ─── Ana sayfa ────────────────────────────────────────────────────────────────
export default function SenelikProgramSayfasi({ ogrenciler, onGeri }) {
  const { s } = useTheme();
  const mobil = useMobil();
  const [yil, setYil] = useState(new Date().getFullYear());
  const [seciliOgrenci, setSeciliOgrenci] = useState(null);

  const aktifOgrenciler = ogrenciler.filter(o => o.aktif !== false);

  useEffect(() => {
    if (aktifOgrenciler.length > 0 && !seciliOgrenci) setSeciliOgrenci(aktifOgrenciler[0]);
  }, [aktifOgrenciler]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ padding: mobil ? 12 : 0 }}>
      <KocHeroBand
        baslik="Senelik program"
        aciklama="Tüm yılı 52 haftalık takvimde görün. Dönem bloklarını, sınav haftalarını ve notları tek ekranda düzenleyin."
        onGeri={onGeri}
        mobil={mobil}
      />

      {/* Üst kontroller */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
        {/* Öğrenci seçimi */}
        <select
          value={seciliOgrenci?.id || ''}
          onChange={e =>
            setSeciliOgrenci(aktifOgrenciler.find(o => o.id === e.target.value) || null)
          }
          style={{
            flex: 1,
            minWidth: 160,
            background: s.surface2,
            border: `1px solid ${s.border}`,
            borderRadius: 10,
            padding: '9px 12px',
            color: s.text,
            fontSize: 13,
            outline: 'none',
          }}
        >
          {aktifOgrenciler.map(o => (
            <option key={o.id} value={o.id}>
              {o.isim}
            </option>
          ))}
        </select>

        {/* Yıl seçimi */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => setYil(y => y - 1)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: `1px solid ${s.border}`,
              background: s.surface2,
              cursor: 'pointer',
              color: s.text2,
              fontSize: 16,
            }}
          >
            ‹
          </button>
          <div
            style={{
              fontWeight: 700,
              fontSize: 16,
              color: s.text,
              minWidth: 48,
              textAlign: 'center',
            }}
          >
            {yil}
          </div>
          <button
            onClick={() => setYil(y => y + 1)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: `1px solid ${s.border}`,
              background: s.surface2,
              cursor: 'pointer',
              color: s.text2,
              fontSize: 16,
            }}
          >
            ›
          </button>
        </div>

        <Btn
          onClick={() => setYil(new Date().getFullYear())}
          variant="outline"
          style={{ padding: '8px 14px', fontSize: 12 }}
        >
          Bu yıl
        </Btn>
      </div>

      {aktifOgrenciler.length === 0 ? (
        <div style={{ textAlign: 'center', color: s.text3, padding: 40 }}>Henüz öğrenci yok</div>
      ) : seciliOgrenci ? (
        <Card style={{ padding: mobil ? 14 : 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: s.text, marginBottom: 16 }}>
            {seciliOgrenci.isim} — {yil}
          </div>
          <OgrenciTakvimi ogrenci={seciliOgrenci} yil={yil} s={s} mobil={mobil} />
        </Card>
      ) : null}

      {/* Tüm öğrenciler için yıl özeti */}
      {aktifOgrenciler.length > 1 && (
        <div style={{ marginTop: 20 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: s.text3,
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: '.05em',
            }}
          >
            Diğer öğrenciler
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {aktifOgrenciler
              .filter(o => o.id !== seciliOgrenci?.id)
              .map(o => (
                <button
                  key={o.id}
                  onClick={() => setSeciliOgrenci(o)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 10,
                    border: `1px solid ${s.border}`,
                    background: s.surface2,
                    color: s.text2,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {o.isim}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
