import React from 'react';
import { Btn } from '../components/Shared';
import { KocNotlari } from '../ogrenci/KocNotlari';

export function OgrenciDetayBanner({
  ogrenci,
  oran,
  sonDeneme,
  denemeler,
  program,
  duzenleyebilir,
  dersBaslat,
  readOnly,
  setSilOnay: _setSilOnay,
  s,
  mobil,
}) {
  return (
    <>
      {/* Hero banner */}
      <div
        style={{
          background: readOnly ? 'linear-gradient(135deg, #6B7280, #9CA3AF)' : s.accentGrad,
          borderRadius: 20,
          padding: mobil ? 20 : '24px 28px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          boxShadow: readOnly
            ? '0 8px 32px rgba(107,114,128,0.25)'
            : '0 8px 32px rgba(91,79,232,0.25)',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          {ogrenci.isim
            ?.split(' ')
            .map(n => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 150 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{ogrenci.isim}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 3 }}>
            {ogrenci.tur} · {ogrenci.email}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { v: `%${oran}`, l: 'Görev tamamlama' },
            { v: sonDeneme ? sonDeneme.toplamNet : '—', l: 'Son deneme neti' },
            { v: denemeler.length, l: 'Kayıtlı deneme' },
          ].map((st, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: 12,
                padding: '10px 14px',
                textAlign: 'center',
                minWidth: 60,
              }}
            >
              <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>{st.v}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>{st.l}</div>
            </div>
          ))}
          {duzenleyebilir && (
            <button
              onClick={dersBaslat}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.35)',
                borderRadius: 12,
                padding: '10px 16px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                backdropFilter: 'blur(4px)',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
            >
              📹 Ders Başlat
            </button>
          )}
        </div>
      </div>

      {/* Özet kartlar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: mobil ? '1fr 1fr' : 'repeat(3,1fr)',
          gap: 10,
          marginBottom: 16,
        }}
      >
        {[
          {
            label: 'Haftalık görev',
            val: `${program.filter(p => p.tamamlandi).length}/${program.length}`,
            renk: oran >= 80 ? '#10B981' : oran >= 50 ? '#F59E0B' : '#F43F5E',
          },
          {
            label: 'Son deneme',
            val: sonDeneme ? `${sonDeneme.toplamNet} net` : '—',
            renk: s.accent,
          },
          { label: 'Toplam deneme kaydı', val: String(denemeler.length), renk: s.text },
        ].map(k => (
          <div
            key={k.label}
            style={{ background: s.surface2, borderRadius: 12, padding: '12px 16px' }}
          >
            <div style={{ fontSize: 11, color: s.text3, marginBottom: 4, fontWeight: 600 }}>
              {k.label}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: k.renk }}>{k.val}</div>
          </div>
        ))}
      </div>
    </>
  );
}

export function OgrenciDetayBilgiler({ ogrenci, oran, duzenleyebilir, setSilOnay, s }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={{
          background: s.surface,
          border: `1px solid ${s.border}`,
          borderRadius: 14,
          padding: 20,
          boxShadow: s.shadowCard || s.shadow,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 15, color: s.text, marginBottom: 14 }}>
          Bilgiler
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          {[
            { l: 'Sınav hedefi', v: ogrenci.tur, c: s.accent },
            { l: 'Program tamamlama', v: '%' + oran, c: s.chartPos || '#10B981' },
          ].map(k => (
            <div
              key={k.l}
              style={{ background: s.surface2, borderRadius: 10, padding: '12px 14px' }}
            >
              <div style={{ fontSize: 10, color: s.text3, marginBottom: 4, fontWeight: 600 }}>
                {k.l}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: k.c }}>{k.v}</div>
            </div>
          ))}
        </div>
        {ogrenci.veliEmail && (
          <div
            style={{
              background: s.surface2,
              borderRadius: 10,
              padding: '12px 14px',
              marginBottom: 10,
            }}
          >
            <div style={{ fontSize: 10, color: s.text3, marginBottom: 4, fontWeight: 600 }}>
              VELİ
            </div>
            <div style={{ fontSize: 13, color: s.text2 }}>{ogrenci.veliEmail}</div>
          </div>
        )}
        {ogrenci.sonVeliRaporOzeti && (
          <div
            style={{
              background: s.surface2,
              borderRadius: 10,
              padding: '12px 14px',
              marginBottom: 10,
            }}
          >
            <div style={{ fontSize: 10, color: s.text3, marginBottom: 4, fontWeight: 600 }}>
              SON VELİ NOTU
            </div>
            <div style={{ fontSize: 12, color: s.text2, lineHeight: 1.5 }}>
              {ogrenci.sonVeliRaporOzeti}
            </div>
          </div>
        )}
        {duzenleyebilir && (
          <Btn onClick={() => setSilOnay(true)} variant="danger" style={{ width: '100%' }}>
            Öğrenciyi Sil
          </Btn>
        )}
      </div>
      {duzenleyebilir && <KocNotlari ogrenciId={ogrenci.id} />}
    </div>
  );
}
