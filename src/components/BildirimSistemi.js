import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import app from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Btn, EmptyState } from './Shared';
import { useToast } from './Toast';
import { isUnread } from '../utils/readState';
import { useBildirimler } from './useBildirimler';
import { BildirimItem } from './BildirimItem';
import {
  tipCfg,
  FILTRELER,
  GRUP_SIRASI,
  GRUP_ETIKET,
  gunGrubu,
  bildirimOlustur,
} from './bildirimUtils';

// Re-exports for backward compatibility
export { bildirimOlustur } from './bildirimUtils';
export { caprazKocBildirim } from './bildirimUtils';
export { useBildirimler } from './useBildirimler';

// ─── BildirimPaneli ───────────────────────────────────────────────────────────
export function BildirimPaneli({ acik, onKapat }) {
  const { s } = useTheme();
  const { kullanici, isAdmin } = useAuth();
  const { bildirimler, okunmamis, okunduIsaretle, tumunuOku, bildirimSil, okunmuslariTemizle } =
    useBildirimler();
  const navigate = useNavigate();
  const toast = useToast();
  const [islemYapiliyor, setIslemYapiliyor] = useState(null);
  const [tamamlananlar, setTamamlananlar] = useState(new Set());
  const [filtre, setFiltre] = useState('hepsi');

  const gorunenler = useMemo(() => {
    if (filtre === 'hepsi') return bildirimler;
    return bildirimler.filter(b => tipCfg(b.tip).filtre === filtre);
  }, [bildirimler, filtre]);

  const gruplar = useMemo(() => {
    const grp = {};
    gorunenler.forEach(b => {
      const key = gunGrubu(b.olusturma);
      if (!grp[key]) grp[key] = [];
      grp[key].push(b);
    });
    return grp;
  }, [gorunenler]);

  if (!acik) return null;

  const zamanFark = ts => {
    if (!ts?.toDate) return '';
    const fark = Date.now() - ts.toDate().getTime();
    const dk = Math.floor(fark / 60000);
    if (dk < 1) return 'Az önce';
    if (dk < 60) return `${dk}dk`;
    const saat = Math.floor(dk / 60);
    if (saat < 24) return `${saat}sa`;
    return `${Math.floor(saat / 24)}g`;
  };

  const hedefRoute = b => {
    const path = window.location.pathname;
    const panel = path.startsWith('/koc')
      ? 'koc'
      : path.startsWith('/ogrenci')
        ? 'ogrenci'
        : path.startsWith('/veli')
          ? 'veli'
          : 'admin';
    if (b.route) {
      const panelBase = '/' + path.split('/')[1];
      return b.route.startsWith(panelBase) ? b.route : '';
    }
    if (panel === 'ogrenci') {
      if (b.tip === 'program_degisti') return '/ogrenci/program';
      if (b.tip === 'deneme_girildi' || b.tip === 'deneme_yorumu')
        return b.entityId ? `/ogrenci/denemeler/${b.entityId}` : '/ogrenci/denemeler';
      if (b.tip === 'yeni_mesaj') return '/ogrenci/mesajlar';
    }
    if (panel === 'koc') {
      if (b.tip === 'yeni_mesaj' || b.tip === 'deneme_girildi' || b.tip === 'deneme_yorumu')
        return b.ogrenciId ? `/koc/ogrenciler/${b.ogrenciId}` : '/koc/mesajlar';
      if (b.tip === 'capraz_koc' || b.tip === 'silme_talebi') return '/koc/ogrenciler';
    }
    if (panel === 'veli') {
      if (b.tip === 'yeni_mesaj') return '/veli/mesajlar';
      if (b.tip === 'program_degisti') return '/veli/program';
    }
    if (panel === 'admin') {
      if (b.tip === 'ogrenci_eklendi' || b.tip === 'capraz_koc' || b.tip === 'silme_talebi')
        return '/admin/ogrenciler';
    }
    return '';
  };

  const bildirimeTikla = async b => {
    if (isUnread(b)) await okunduIsaretle(b.id);
    const route = hedefRoute(b);
    if (route) {
      navigate(route);
      onKapat?.();
    }
  };

  const silmeTalebiniIsle = async (b, karar) => {
    setIslemYapiliyor(b.id + karar);
    try {
      if (karar === 'onayla') {
        const fn = httpsCallable(getFunctions(app, 'europe-west1'), 'kullaniciSil');
        await fn({ uid: b.ogrenciId, onay: 'SIL' });
      }
      if (b.entityId) {
        await updateDoc(doc(db, 'silmeTalepleri', b.entityId), {
          durum: karar === 'onayla' ? 'onaylandi' : 'reddedildi',
        });
      }
      await bildirimOlustur({
        aliciId: b.gonderenId,
        tip: karar === 'onayla' ? 'silme_onaylandi' : 'silme_reddedildi',
        baslik: karar === 'onayla' ? 'Silme Talebi Onaylandı' : 'Silme Talebi Reddedildi',
        mesaj:
          karar === 'onayla'
            ? `${b.ogrenciIsim} adlı öğrencinin silinmesi onaylandı.`
            : `${b.ogrenciIsim} adlı öğrencinin silme talebi reddedildi.`,
        gonderenId: kullanici?.uid,
      });
      setTamamlananlar(prev => new Set([...prev, b.id]));
      await okunduIsaretle(b.id);
      toast(karar === 'onayla' ? 'Öğrenci silindi.' : 'Talep reddedildi.');
      setTimeout(() => onKapat?.(), 1200);
    } catch (e) {
      console.error(e);
      toast('Hata: ' + (e?.message || 'Bilinmeyen hata'), 'error');
    }
    setIslemYapiliyor(null);
  };

  const okunmusCount = bildirimler.filter(b => !isUnread(b)).length;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1100 }}>
      <div
        onClick={onKapat}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }}
      />
      <div
        style={{
          position: 'absolute',
          top: 56,
          right: 16,
          width: 400,
          maxWidth: 'calc(100vw - 32px)',
          maxHeight: 'calc(100vh - 80px)',
          background: s.surface,
          border: `1px solid ${s.border}`,
          borderRadius: 18,
          boxShadow: s.shadowCard ?? s.shadow,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Başlık */}
        <div style={{ padding: '14px 18px 0', borderBottom: `1px solid ${s.border}` }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: s.text,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              🔔 Bildirimler
              {okunmamis > 0 && (
                <span
                  style={{
                    background: s.danger,
                    color: '#fff',
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 20,
                  }}
                >
                  {okunmamis}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {okunmamis > 0 && (
                <Btn
                  onClick={tumunuOku}
                  variant="ghost"
                  style={{ padding: '3px 9px', fontSize: 11 }}
                >
                  Tümünü oku
                </Btn>
              )}
              {okunmusCount > 0 && (
                <Btn
                  onClick={okunmuslariTemizle}
                  variant="ghost"
                  style={{ padding: '3px 9px', fontSize: 11, color: s.text3 }}
                >
                  Temizle
                </Btn>
              )}
              <button
                onClick={onKapat}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 18,
                  color: s.text3,
                  cursor: 'pointer',
                  padding: '0 4px',
                }}
              >
                ✕
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 2, overflowX: 'auto', paddingBottom: 1 }}>
            {FILTRELER.map(f => (
              <button
                key={f.k}
                onClick={() => setFiltre(f.k)}
                style={{
                  padding: '5px 11px',
                  borderRadius: 20,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: filtre === f.k ? 700 : 500,
                  whiteSpace: 'nowrap',
                  background: filtre === f.k ? s.accent : s.surface2,
                  color: filtre === f.k ? s.buttonText || '#fff' : s.text3,
                  transition: 'all 0.15s',
                }}
              >
                {f.l}
              </button>
            ))}
          </div>
        </div>

        {/* Liste */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {gorunenler.length === 0 ? (
            <EmptyState mesaj="Bu kategoride bildirim yok" icon="🔔" />
          ) : (
            GRUP_SIRASI.filter(g => gruplar[g]?.length).map(grup => (
              <div key={grup}>
                <div
                  style={{
                    padding: '8px 18px 4px',
                    fontSize: 10,
                    fontWeight: 700,
                    color: s.text3,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    background: s.surface2,
                  }}
                >
                  {GRUP_ETIKET[grup]}
                </div>
                {gruplar[grup].map(b => (
                  <BildirimItem
                    key={b.id}
                    b={b}
                    isAdmin={isAdmin}
                    islemYapiliyor={islemYapiliyor}
                    tamamlananlar={tamamlananlar}
                    bildirimSil={bildirimSil}
                    bildirimeTikla={bildirimeTikla}
                    silmeTalebiniIsle={silmeTalebiniIsle}
                    zamanFark={zamanFark}
                    s={s}
                  />
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── BildirimZili ─────────────────────────────────────────────────────────────
export function BildirimZili({ onClick }) {
  const { s } = useTheme();
  const { okunmamis } = useBildirimler();
  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        cursor: 'pointer',
        padding: '6px 8px',
        borderRadius: 8,
        background: okunmamis > 0 ? s.topBarTemaBg : 'transparent',
        transition: 'background 0.15s',
      }}
    >
      <span style={{ fontSize: 18 }}>🔔</span>
      {okunmamis > 0 && (
        <span
          style={{
            position: 'absolute',
            top: 2,
            right: 2,
            background: s.danger,
            color: s.buttonText ?? '#fff',
            fontSize: 9,
            fontWeight: 700,
            padding: '1px 5px',
            borderRadius: 20,
            minWidth: 16,
            textAlign: 'center',
            lineHeight: '14px',
          }}
        >
          {okunmamis > 99 ? '99+' : okunmamis}
        </span>
      )}
    </div>
  );
}
