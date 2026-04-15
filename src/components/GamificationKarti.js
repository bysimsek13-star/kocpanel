import React, { useMemo, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { dateToStr } from '../utils/tarih';

// ─── Rozet tanımları ──────────────────────────────────────────────────────────
const ROZETLER = [
  {
    id: 'ilk_adim',
    ikon: '🌱',
    baslik: 'İlk Adım',
    aciklama: 'İlk çalışma gününü tamamla',
    kontrol: ({ toplamGun }) => toplamGun >= 1,
    kategori: 'baslangic',
  },
  {
    id: 'seri_3',
    ikon: '🔥',
    baslik: '3 Günlük Seri',
    aciklama: '3 gün üst üste çalış',
    kontrol: ({ streak }) => streak >= 3,
    kategori: 'seri',
  },
  {
    id: 'seri_7',
    ikon: '⚡',
    baslik: 'Haftalık Savaşçı',
    aciklama: '7 gün üst üste çalış',
    kontrol: ({ streak }) => streak >= 7,
    kategori: 'seri',
  },
  {
    id: 'seri_14',
    ikon: '💎',
    baslik: '2 Haftalık Kesintisiz',
    aciklama: '14 gün üst üste çalış',
    kontrol: ({ streak }) => streak >= 14,
    kategori: 'seri',
  },
  {
    id: 'seri_30',
    ikon: '👑',
    baslik: 'Aylık Kahraman',
    aciklama: '30 gün üst üste çalış',
    kontrol: ({ streak }) => streak >= 30,
    kategori: 'seri',
  },
  {
    id: 'gun_10',
    ikon: '📅',
    baslik: '10 Çalışma Günü',
    aciklama: 'Toplam 10 gün kayıt gir',
    kontrol: ({ toplamGun }) => toplamGun >= 10,
    kategori: 'toplam',
  },
  {
    id: 'gun_30',
    ikon: '📆',
    baslik: '30 Çalışma Günü',
    aciklama: 'Toplam 30 gün kayıt gir',
    kontrol: ({ toplamGun }) => toplamGun >= 30,
    kategori: 'toplam',
  },
  {
    id: 'gun_100',
    ikon: '🏆',
    baslik: '100 Gün Ustası',
    aciklama: 'Toplam 100 gün kayıt gir',
    kontrol: ({ toplamGun }) => toplamGun >= 100,
    kategori: 'toplam',
  },
  {
    id: 'ilk_deneme',
    ikon: '📝',
    baslik: 'İlk Deneme',
    aciklama: 'İlk deneme sonucunu gir',
    kontrol: ({ toplamDeneme }) => toplamDeneme >= 1,
    kategori: 'deneme',
  },
  {
    id: 'deneme_5',
    ikon: '📊',
    baslik: '5 Deneme',
    aciklama: '5 deneme sonucu gir',
    kontrol: ({ toplamDeneme }) => toplamDeneme >= 5,
    kategori: 'deneme',
  },
  {
    id: 'net_artis',
    ikon: '📈',
    baslik: 'Net Artışı',
    aciklama: 'Son denemede net yükselt',
    kontrol: ({ netArtis }) => netArtis === true,
    kategori: 'deneme',
  },
  {
    id: 'deneme_20',
    ikon: '🎯',
    baslik: '20 Deneme',
    aciklama: '20 deneme sonucu gir',
    kontrol: ({ toplamDeneme }) => toplamDeneme >= 20,
    kategori: 'deneme',
  },
];

// ─── Rozet hesaplama ──────────────────────────────────────────────────────────
function rozetleriHesapla({ calismalar, denemeler }) {
  const bugun = new Date();
  const tarihler = new Set(calismalar.map(c => c.tarih || c.id).filter(Boolean));
  const toplamGun = tarihler.size;

  // Streak hesapla
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(bugun);
    d.setDate(bugun.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (tarihler.has(key)) streak++;
    else break;
  }

  const toplamDeneme = denemeler.length;
  const netArtis =
    denemeler.length >= 2
      ? (Number(denemeler[0]?.toplamNet) || 0) > (Number(denemeler[1]?.toplamNet) || 0)
      : false;

  const veri = { toplamGun, streak, toplamDeneme, netArtis };

  return ROZETLER.map(r => ({ ...r, kazanildi: r.kontrol(veri) }));
}

// ─── Streak görsel ────────────────────────────────────────────────────────────
function StreakBant({ calismalar, s }) {
  const bugun = new Date();
  const gunler = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(bugun);
    d.setDate(bugun.getDate() - (27 - i));
    return dateToStr(d);
  });
  const set = new Set(calismalar.map(c => c.tarih || c.id).filter(Boolean));

  let streak = 0;
  for (let i = 27; i >= 0; i--) {
    if (set.has(gunler[i])) streak++;
    else break;
  }

  const enIyiStreak = (() => {
    let maks = 0,
      suan = 0;
    [...gunler].forEach(g => {
      if (set.has(g)) {
        suan++;
        maks = Math.max(maks, suan);
      } else suan = 0;
    });
    return maks;
  })();

  const milestonlar = [3, 7, 14, 30];
  const sonraki = milestonlar.find(m => m > streak) || 30;

  return (
    <div>
      {/* Seri sayacı */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: 42,
              fontWeight: 900,
              lineHeight: 1,
              color: streak >= 7 ? s.warning : streak >= 3 ? s.accent : s.text3,
            }}
          >
            {streak}
          </div>
          <div style={{ fontSize: 10, color: s.text3, marginTop: 2 }}>günlük seri 🔥</div>
        </div>

        <div style={{ flex: 1 }}>
          {/* Milestone progress */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: s.text3 }}>Sonraki hedef: {sonraki} gün</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: s.accent }}>
              {streak}/{sonraki}
            </span>
          </div>
          <div style={{ height: 6, background: s.surface2, borderRadius: 99 }}>
            <div
              style={{
                height: '100%',
                borderRadius: 99,
                background: `linear-gradient(90deg, ${s.accent}, ${s.warning})`,
                width: `${Math.min(100, (streak / sonraki) * 100)}%`,
                transition: 'width .5s',
              }}
            />
          </div>
          <div style={{ fontSize: 10, color: s.text3, marginTop: 4 }}>
            En iyi (son 28 gün): {enIyiStreak} gün
          </div>
        </div>
      </div>

      {/* 28 günlük grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(14, 1fr)', gap: 3 }}>
        {gunler.map((g, i) => {
          const var_ = set.has(g);
          const bugunMu = i === 27;
          return (
            <div
              key={g}
              title={g}
              style={{
                aspectRatio: '1',
                borderRadius: 3,
                background: var_ ? s.success : s.surface2,
                border: bugunMu ? `2px solid ${s.accent}` : 'none',
                opacity: var_ ? 1 : 0.5,
              }}
            />
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontSize: 10, color: s.text3 }}>28 gün önce</span>
        <span style={{ fontSize: 10, color: s.text3 }}>bugün</span>
      </div>
    </div>
  );
}

// ─── Tekil rozet ─────────────────────────────────────────────────────────────
function RozetKutu({ rozet, s }) {
  const [_aciklama, setAciklama] = useState(false);

  return (
    <div
      onClick={() => setAciklama(v => !v)}
      title={rozet.aciklama}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        padding: '10px 6px',
        borderRadius: 12,
        cursor: 'pointer',
        background: rozet.kazanildi ? s.accentSoft : s.surface2,
        border: `1px solid ${rozet.kazanildi ? s.accent + '40' : s.border}`,
        transition: 'transform .15s',
        position: 'relative',
      }}
    >
      <div
        style={{
          fontSize: 22,
          lineHeight: 1,
          filter: rozet.kazanildi ? 'none' : 'grayscale(1) opacity(0.3)',
        }}
      >
        {rozet.ikon}
      </div>
      <div
        style={{
          fontSize: 9,
          fontWeight: rozet.kazanildi ? 700 : 400,
          color: rozet.kazanildi ? s.accent : s.text3,
          textAlign: 'center',
          lineHeight: 1.3,
        }}
      >
        {rozet.baslik}
      </div>
      {rozet.kazanildi && (
        <div
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: s.success,
            border: `2px solid ${s.surface}`,
          }}
        />
      )}
    </div>
  );
}

// ─── Ana bileşen ──────────────────────────────────────────────────────────────
export default function GamificationKarti({ calismalar = [], denemeler = [] }) {
  const { s } = useTheme();
  const [sekme, setSekme] = useState('streak'); // 'streak' | 'rozetler'

  const rozetler = useMemo(
    () => rozetleriHesapla({ calismalar, denemeler }),
    [calismalar, denemeler]
  );

  const kazanilan = rozetler.filter(r => r.kazanildi).length;

  return (
    <div
      style={{
        background: s.surface,
        border: `1px solid ${s.border}`,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
        boxShadow: s.shadowCard || s.shadow,
      }}
    >
      {/* Sekme başlığı */}
      <div
        style={{
          display: 'flex',
          borderBottom: `1px solid ${s.border}`,
        }}
      >
        {[
          { k: 'streak', l: `🔥 Seri` },
          { k: 'rozetler', l: `🏅 Rozetler (${kazanilan}/${rozetler.length})` },
        ].map(tab => (
          <button
            key={tab.k}
            type="button"
            onClick={() => setSekme(tab.k)}
            style={{
              flex: 1,
              border: 'none',
              padding: '12px 8px',
              background: sekme === tab.k ? s.accentSoft : 'transparent',
              color: sekme === tab.k ? s.accent : s.text3,
              fontWeight: sekme === tab.k ? 700 : 500,
              fontSize: 12,
              cursor: 'pointer',
              borderBottom: sekme === tab.k ? `2px solid ${s.accent}` : '2px solid transparent',
              transition: 'all .15s',
            }}
          >
            {tab.l}
          </button>
        ))}
      </div>

      <div style={{ padding: '14px 18px' }}>
        {sekme === 'streak' ? (
          <StreakBant calismalar={calismalar} s={s} />
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {rozetler.map(r => (
                <RozetKutu key={r.id} rozet={r} s={s} />
              ))}
            </div>
            {kazanilan === 0 && (
              <div style={{ textAlign: 'center', color: s.text3, fontSize: 12, marginTop: 12 }}>
                Çalışmaya başla, ilk rozetini kazan!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
