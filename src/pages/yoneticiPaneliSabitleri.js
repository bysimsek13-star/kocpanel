import React from 'react';
import { Card, Btn } from '../components/Shared';

export const OGRENCI_SAYFA_BOYUTU = 20;

export const ADMIN_MENU_PATHS = {
  ana: '/admin/home',
  koclar: '/admin/koclar',
  ogrenciler: '/admin/ogrenciler',
  yasamdongusu: '/admin/yasam-dongusu',
  performans: '/admin/performans',
  auditlog: '/admin/audit-log',
  sistem: '/admin/sistem-durumu',
  sistemdurumu: '/admin/sistem-durumu',
  canli: '/admin/canli-operasyon',
  canlioperasyon: '/admin/canli-operasyon',
  mufredat: '/admin/mufredat',
};

export function adminSayfaAnahtariGetir(pathname) {
  const bulunan = Object.entries(ADMIN_MENU_PATHS).find(([, path]) => pathname.startsWith(path));
  return bulunan?.[0] || 'ana';
}

export const MENU = [
  { key: 'ana', icon: '🏠', label: 'Genel Bakış' },
  { key: 'koclar', icon: '👨‍🏫', label: 'Koç Yönetimi' },
  { key: 'ogrenciler', icon: '👥', label: 'Öğrenci Portföyü' },
  { key: 'yasamdongusu', icon: '🔄', label: 'Kullanıcı Döngüsü' },
  { key: 'auditlog', icon: '📋', label: 'İşlem Geçmişi' },
  { key: 'performans', icon: '🏆', label: 'Koç Performansı' },
  { key: 'canli', icon: '🚀', label: 'Canlı Operasyon' },
  { key: 'sistem', icon: '🩺', label: 'Sistem Durumu' },
  { key: 'mufredat', icon: '📚', label: 'Müfredat' },
];

export const ALT_TABS = [
  { key: 'ana', label: 'Genel' },
  { key: 'koclar', label: 'Koçlar' },
  { key: 'ogrenciler', label: 'Öğrenciler' },
  { key: 'performans', label: 'Performans' },
  { key: 'auditlog', label: 'Loglar' },
];

export function UnauthorizedScreen({ s, onCikis }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: s.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <Card style={{ maxWidth: 480, width: '100%', padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 42, marginBottom: 12 }}>🚫</div>
        <div style={{ color: s.text, fontSize: 22, fontWeight: 700, marginBottom: 10 }}>
          Yetkisiz Erişim
        </div>
        <div style={{ color: s.text2, fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
          Bu alan yalnızca yönetici kullanıcılar içindir.
        </div>
        <Btn onClick={onCikis}>Çıkış Yap</Btn>
      </Card>
    </div>
  );
}
