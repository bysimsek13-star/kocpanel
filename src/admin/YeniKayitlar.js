import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Card, Btn } from '../components/Shared';
import { useToast } from '../components/Toast';
import { getCallable } from './adminHelpers';

const DURUM_RENK = {
  odeme_bekleniyor: { bg: '#fef9c3', text: '#854d0e', label: 'Ödeme Bekleniyor' },
  odeme_basarili: { bg: '#d1fae5', text: '#065f46', label: 'Ödeme Başarılı' },
  odeme_basarisiz: { bg: '#fee2e2', text: '#991b1b', label: 'Ödeme Başarısız' },
  koc_bekleniyor: { bg: '#dbeafe', text: '#1e40af', label: 'Koç Bekleniyor' },
  tamamlandi: { bg: '#f3f4f6', text: '#374151', label: 'Tamamlandı' },
};

function DurumBadge({ durum }) {
  const r = DURUM_RENK[durum] || { bg: '#f3f4f6', text: '#374151', label: durum };
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: '3px 10px',
        borderRadius: 20,
        background: r.bg,
        color: r.text,
      }}
    >
      {r.label}
    </span>
  );
}

function KocAtamaModal({ basvuru, koclar, onAta, onKapat, s }) {
  const [seciliKoc, setSeciliKoc] = useState('');
  const [yukleniyor, setYukl] = useState(false);
  const toast = useToast();

  const ata = async () => {
    if (!seciliKoc) {
      toast('Koç seçin.', 'error');
      return;
    }
    setYukl(true);
    try {
      await getCallable('kocAta')({
        ogrenciId: basvuru.ogrenciUid || null,
        kocId: seciliKoc,
        onboardingId: basvuru.id,
      });
      await updateDoc(doc(db, 'onboardingApplications', basvuru.id), {
        kocId: seciliKoc,
        durum: 'tamamlandi',
        guncellemeAt: serverTimestamp(),
      });
      toast('Koç atandı.');
      onAta();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setYukl(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <Card style={{ width: '100%', maxWidth: 460, padding: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: s.text, marginBottom: 16 }}>
          Koç Ata — {basvuru.ogrenciIsim}
        </div>
        <div style={{ fontSize: 13, color: s.text2, marginBottom: 8 }}>
          {basvuru.sinifTuru?.toUpperCase()} · {basvuru.sinif}. sınıf
          {basvuru.alan && ` · ${basvuru.alan}`}
        </div>
        <select
          value={seciliKoc}
          onChange={e => setSeciliKoc(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: `1px solid ${s.border}`,
            background: s.surface,
            color: s.text,
            fontSize: 14,
            marginBottom: 16,
          }}
        >
          <option value="">Koç seçin...</option>
          {koclar.map(k => (
            <option key={k.id} value={k.id}>
              {k.isim} ({k._ogrenciSayisi ?? 0} öğrenci)
            </option>
          ))}
        </select>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" onClick={onKapat} disabled={yukleniyor}>
            İptal
          </Btn>
          <Btn onClick={ata} disabled={yukleniyor}>
            {yukleniyor ? 'Atanıyor...' : 'Ata'}
          </Btn>
        </div>
      </Card>
    </div>
  );
}

export default function YeniKayitlar({ s, mobil, koclar = [] }) {
  const [basvurular, setBasvurular] = useState([]);
  const [yukleniyor, setYukl] = useState(true);
  const [atamaModal, setAtamaModal] = useState(null);
  const [filtre, setFiltre] = useState('odeme_basarili');

  const yukle = useCallback(async () => {
    setYukl(true);
    try {
      const snap = await getDocs(collection(db, 'onboardingApplications'));
      setBasvurular(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.olusturmaAt?.seconds ?? 0) - (a.olusturmaAt?.seconds ?? 0))
      );
    } finally {
      setYukl(false);
    }
  }, []);

  useEffect(() => {
    yukle();
  }, [yukle]);

  const koclarla = koclar.map(k => ({ ...k, _ogrenciSayisi: k.ogrenciSayisi ?? 0 }));

  const gorunenler = filtre === 'hepsi' ? basvurular : basvurular.filter(b => b.durum === filtre);

  if (yukleniyor) return <div style={{ padding: 32, color: s.text2 }}>Yükleniyor...</div>;

  return (
    <div style={{ padding: mobil ? 16 : 28 }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: s.text, marginBottom: 16 }}>
        Yeni Kayıtlar
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          ['odeme_basarili', 'Koç Bekleyenler'],
          ['hepsi', 'Tümü'],
          ['odeme_bekleniyor', 'Ödeme Bekleniyor'],
          ['tamamlandi', 'Tamamlandı'],
        ].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setFiltre(k)}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              background: filtre === k ? s.accent : s.surface2,
              color: filtre === k ? '#fff' : s.text2,
            }}
          >
            {l} {k !== 'hepsi' && `(${basvurular.filter(b => b.durum === k).length})`}
          </button>
        ))}
      </div>

      {gorunenler.length === 0 && (
        <div style={{ color: s.text2, textAlign: 'center', padding: 48 }}>Başvuru yok.</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {gorunenler.map(b => (
          <Card key={b.id} style={{ padding: '16px 18px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'center',
                    marginBottom: 6,
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ fontWeight: 700, color: s.text }}>{b.ogrenciIsim}</span>
                  <DurumBadge durum={b.durum} />
                  {b.sinifTuru && (
                    <span style={{ fontSize: 12, color: s.text2 }}>
                      {b.sinifTuru.toUpperCase()}
                      {b.sinif && ` · ${b.sinif}. sınıf`}
                      {b.alan && ` · ${b.alan}`}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: s.text2 }}>
                  Veli: {b.veliIsim} · {b.veliEmail}
                  {b.veliTelefon && ` · ${b.veliTelefon}`}
                </div>
                <div style={{ fontSize: 13, color: s.text2, marginTop: 3 }}>
                  <strong style={{ color: s.accent }}>
                    {(b.brutFiyat || 0).toLocaleString('tr-TR')} TL
                  </strong>{' '}
                  ({b.fiyatTuru?.replace('_', ' ')})
                  {b.kuponKodu && (
                    <span style={{ marginLeft: 6, fontFamily: 'monospace' }}>{b.kuponKodu}</span>
                  )}
                  {b.kocId && (
                    <span style={{ marginLeft: 8, color: '#2563eb' }}>Koç: {b.kocId}</span>
                  )}
                </div>
              </div>
              {b.durum === 'odeme_basarili' && (
                <Btn style={{ whiteSpace: 'nowrap' }} onClick={() => setAtamaModal(b)}>
                  Koç Ata
                </Btn>
              )}
            </div>
          </Card>
        ))}
      </div>

      {atamaModal && (
        <KocAtamaModal
          basvuru={atamaModal}
          koclar={koclarla}
          onAta={() => {
            setAtamaModal(null);
            yukle();
          }}
          onKapat={() => setAtamaModal(null)}
          s={s}
        />
      )}
    </div>
  );
}
