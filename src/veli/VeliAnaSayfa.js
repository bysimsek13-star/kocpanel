import React from 'react';
import { LoadingState, EmptyState } from '../components/Shared';
import { AbonelikDurum } from './AbonelikDurum';
import { upcomingExams } from '../utils/ogrenciUtils';
import {
  UykuKarti,
  SoruKarti,
  DenemeKarti,
  ProgramKartlari,
  SonRaporKarti,
} from './VeliKartlariYeni';

function OgrenciBaslikKarti({ ogrenci, userData, s }) {
  const isim = ogrenci?.isim || userData?.isim || 'Öğrenci';
  const baslangic = isim
    .split(' ')
    .map(k => k[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const sinavlar = upcomingExams(ogrenci?.tur);
  const yaklasanSinav = sinavlar.find(e => !e.isPast);

  return (
    <div
      style={{
        background: s.surface,
        border: `1px solid ${s.border}`,
        borderRadius: 12,
        padding: 20,
        marginBottom: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: '#EEEDFE',
          color: '#3C3489',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 15,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {baslangic}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: s.text }}>{isim}</div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {ogrenci?.tur && (
            <span style={{ fontSize: 12, color: s.text3 }}>{ogrenci.tur.toUpperCase()}</span>
          )}
          {ogrenci?.sinif && (
            <span style={{ fontSize: 12, color: s.text3 }}>· {ogrenci.sinif}</span>
          )}
        </div>
      </div>
      {yaklasanSinav && (
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#534AB7', lineHeight: 1 }}>
            {yaklasanSinav.daysLeft}
          </div>
          <div style={{ fontSize: 10, color: s.text3, marginTop: 2 }}>
            gün · {yaklasanSinav.label}
          </div>
        </div>
      )}
      {ogrenci?.kocIsim && (
        <div style={{ fontSize: 11, color: s.text3, flexShrink: 0 }}>Koç: {ogrenci.kocIsim}</div>
      )}
    </div>
  );
}

export function VeliAnaSayfa({
  ogrenci,
  denemeler,
  veliRaporlari,
  okunmamisMesaj,
  yukleniyor,
  ogrenciId,
  userData,
  git,
  s,
  uid,
}) {
  return (
    <div>
      <AbonelikDurum uid={uid} s={s} />
      <OgrenciBaslikKarti ogrenci={ogrenci} userData={userData} s={s} />
      {yukleniyor ? (
        <LoadingState />
      ) : !ogrenciId ? (
        <EmptyState mesaj="Bu hesaba bağlı öğrenci bulunamadı" icon="👨‍👩‍👧" />
      ) : (
        <>
          {okunmamisMesaj > 0 && (
            <div
              onClick={() => git('mesajlar')}
              style={{
                background: s.accentSoft,
                border: `1px solid ${s.accent}`,
                borderRadius: 12,
                padding: '12px 18px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: s.accent }}>
                Koçtan {okunmamisMesaj} okunmamış mesaj
              </div>
              <div style={{ fontSize: 12, color: s.accent }}>Koçumla iletişim →</div>
            </div>
          )}
          <UykuKarti ogrenciId={ogrenciId} s={s} />
          <SoruKarti ogrenciId={ogrenciId} s={s} />
          <DenemeKarti denemeler={denemeler} ogrenci={ogrenci} s={s} />
          <ProgramKartlari ogrenciId={ogrenciId} s={s} />
          <SonRaporKarti veliRaporlari={veliRaporlari} s={s} />
          <div
            onClick={() => git('mesajlar')}
            style={{
              background: '#EEEDFE',
              borderRadius: 12,
              padding: '14px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              color: '#3C3489',
              marginBottom: 12,
            }}
          >
            Koça Mesaj Gönder
          </div>
        </>
      )}
    </div>
  );
}
