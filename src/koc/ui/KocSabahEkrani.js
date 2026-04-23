import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';
import { useKoc } from '../../context/KocContext';
import { EmptyState } from '../../components/Shared';
import KocGirisDurumuModal from './KocGirisDurumuModal';
import KocGununSozuMini from './KocGununSozuMini';
import KocKisayollar from './KocKisayollar';

function avatarHarf(isim) {
  return (isim || '?')
    .trim()
    .split(' ')
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() || '')
    .join('');
}

function SinavTakvimiModal({ onKapat, s }) {
  return (
    <div
      onClick={onKapat}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: s.surface,
          borderRadius: 20,
          padding: '36px 48px',
          textAlign: 'center',
          boxShadow: s.shadowCard ?? s.shadow,
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 12 }}>📅</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: s.text, marginBottom: 8 }}>
          Sınav Takvimi
        </div>
        <div style={{ fontSize: 13, color: s.text3 }}>Yakında eklenecek</div>
      </div>
    </div>
  );
}
SinavTakvimiModal.propTypes = {
  onKapat: PropTypes.func.isRequired,
  s: PropTypes.object.isRequired,
};

export default function KocSabahEkrani({ onSec, onNav, kocAdi }) {
  const { s } = useTheme();
  const { ogrenciler, bugunMap, okunmamisMap } = useKoc();
  const [girisYokAcik, setGirisYokAcik] = useState(false);
  const [sinavAcik, setSinavAcik] = useState(false);

  const saatTR = parseInt(
    new Date().toLocaleString('tr-TR', {
      timeZone: 'Europe/Istanbul',
      hour: 'numeric',
      hour12: false,
    })
  );
  const selam =
    saatTR >= 6 && saatTR < 12
      ? 'Günaydın'
      : saatTR >= 12 && saatTR < 18
        ? 'İyi günler'
        : saatTR >= 18 && saatTR < 22
          ? 'İyi akşamlar'
          : 'İyi geceler';

  const girisYokList = ogrenciler.filter(o => !bugunMap[o.id]?.bugunAktif);
  const sirali = [...ogrenciler].sort((a, b) => (a.isim || '').localeCompare(b.isim || '', 'tr'));

  const ozetKartlar = [
    { v: ogrenciler.length, l: 'Öğrenci', onClick: () => onNav('ogrenciler') },
    {
      v: girisYokList.length,
      l: 'Giriş yok',
      onClick: () => setGirisYokAcik(true),
      renk: girisYokList.length > 0 ? (s.danger ?? '#EF4444') : undefined,
    },
    { v: '📅', l: 'Sınav Takvimi', onClick: () => setSinavAcik(true) },
  ];

  return (
    <div>
      {girisYokAcik && (
        <KocGirisDurumuModal
          ogrenciler={ogrenciler}
          bugunMap={bugunMap}
          onKapat={() => setGirisYokAcik(false)}
          s={s}
        />
      )}
      {sinavAcik && <SinavTakvimiModal onKapat={() => setSinavAcik(false)} s={s} />}

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: s.text }}>
          {selam}, {kocAdi} 👋
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {ozetKartlar.map(k => (
          <div
            key={k.l}
            onClick={k.onClick}
            style={{
              flex: 1,
              background: s.surface,
              border: `1px solid ${k.renk ? k.renk + '55' : s.border}`,
              borderRadius: 14,
              padding: '14px 10px',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = s.surface2)}
            onMouseLeave={e => (e.currentTarget.style.background = s.surface)}
          >
            <div style={{ fontSize: 22, fontWeight: 800, color: k.renk || s.text }}>{k.v}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: s.text3, marginTop: 4 }}>{k.l}</div>
          </div>
        ))}
      </div>

      {ogrenciler.length === 0 ? (
        <EmptyState mesaj="Henüz öğrenci eklemedin" icon="🎓" />
      ) : (
        <div
          style={{
            background: s.surface,
            borderRadius: 16,
            border: `1px solid ${s.border}`,
            overflow: 'hidden',
            marginBottom: 20,
          }}
        >
          {sirali.map((o, i) => {
            const bugun = bugunMap[o.id] || {};
            const okunmamis = okunmamisMap?.[o.id] || 0;
            let etiket, etiketRenk;
            if (!bugun.bugunAktif) {
              etiket = 'Giriş yok';
              etiketRenk = s.danger ?? '#EF4444';
            } else if (okunmamis > 0) {
              etiket = 'Mesaj var';
              etiketRenk = '#F59E0B';
            } else {
              etiket = 'Aktif';
              etiketRenk = s.success ?? '#22C55E';
            }
            return (
              <div
                key={o.id}
                onClick={() => onSec(o)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 16px',
                  cursor: 'pointer',
                  borderBottom: i < sirali.length - 1 ? `1px solid ${s.border}` : 'none',
                  background: 'transparent',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = s.surface2)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: `${s.accent}22`,
                    color: s.accent,
                    fontWeight: 700,
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {avatarHarf(o.isim)}
                </div>
                <div
                  style={{
                    flex: 1,
                    fontSize: 13,
                    fontWeight: 600,
                    color: s.text,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {o.isim}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: etiketRenk,
                    background: `${etiketRenk}1a`,
                    borderRadius: 20,
                    padding: '3px 10px',
                    flexShrink: 0,
                  }}
                >
                  {etiket}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <KocGununSozuMini s={s} />
      <KocKisayollar onNav={onNav} />
    </div>
  );
}

KocSabahEkrani.propTypes = {
  onSec: PropTypes.func,
  onNav: PropTypes.func.isRequired,
  kocAdi: PropTypes.string,
};
