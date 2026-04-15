import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import { Btn } from '../components/Shared';
import { auditLog, AuditTip } from '../utils/auditLog';
import { getCallable, hataMesajiVer } from './adminHelpers';

export default function KocAtamaModal({ ogrenci, koclar, onKapat, onAta, kullanici }) {
  const { s } = useTheme();
  const toast = useToast();
  const [seciliKocId, setSeciliKocId] = useState(ogrenci?.kocId || '');
  const [yukleniyor, setYukleniyor] = useState(false);

  const ata = async () => {
    setYukleniyor(true);
    try {
      await getCallable('kocAta')({ ogrenciUid: ogrenci.id, yeniKocUid: seciliKocId || '' });
      const secili = koclar.find(k => k.id === seciliKocId);
      await auditLog({
        kim: kullanici?.uid,
        kimIsim: 'Admin',
        ne: AuditTip.KOC_ATA,
        kimi: ogrenci.id,
        kimiIsim: ogrenci.isim,
        detay: { eskiKocId: ogrenci.kocId || '', yeniKocId: seciliKocId || '' },
      }).catch(() => {});
      toast(`${ogrenci.isim} → ${secili?.isim || 'Atanmamış'}`);
      onAta();
      onKapat();
    } catch (e) {
      toast(hataMesajiVer(e), 'error');
    }
    setYukleniyor(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        style={{
          background: s.surface,
          border: `1px solid ${s.border}`,
          borderRadius: 24,
          padding: 30,
          width: 440,
          maxWidth: '95vw',
        }}
      >
        <div style={{ color: s.text, fontWeight: 700, fontSize: 20, marginBottom: 8 }}>
          🔁 Koç Ata
        </div>
        <div style={{ color: s.text2, fontSize: 13, marginBottom: 16 }}>
          {ogrenci?.isim} için yeni koç seçin
        </div>
        <select
          value={seciliKocId}
          onChange={e => setSeciliKocId(e.target.value)}
          style={{
            width: '100%',
            padding: 12,
            borderRadius: 12,
            background: s.surface2,
            border: `1px solid ${s.border}`,
            color: s.text,
            marginBottom: 20,
          }}
        >
          <option value="">Koç atanmamış</option>
          {koclar.map(k => (
            <option key={k.id} value={k.id}>
              {k.isim || k.email}
            </option>
          ))}
        </select>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn onClick={onKapat} variant="ghost" style={{ flex: 1 }}>
            İptal
          </Btn>
          <Btn onClick={ata} disabled={yukleniyor} style={{ flex: 2 }}>
            {yukleniyor ? 'Kaydediliyor...' : 'Atamayı Kaydet'}
          </Btn>
        </div>
      </div>
    </div>
  );
}
