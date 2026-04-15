import { SLOT_TIPLERI } from '../constants/slotTipleri';

// Neon renk mapping (HaftalikProgram stili)
export const TIPLER_NEON = SLOT_TIPLERI.map(t => ({
  ...t,
  renk: t.neonRenk,
  acikRenk: t.neonAcik,
}));

export const tipBulNeon = id =>
  TIPLER_NEON.find(t => t.id === id) || TIPLER_NEON[TIPLER_NEON.length - 1];

// ─── Süre yardımcıları ───────────────────────────────────────────────────────
export function sureyeSaniyeCevir(sure) {
  if (!sure) return 0;
  const p = sure.split(':').map(Number);
  if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2];
  if (p.length === 2) return p[0] * 60 + p[1];
  return 0;
}

export function saniyedenSureMetni(sn) {
  if (!sn) return '';
  const h = Math.floor(sn / 3600);
  const m = Math.floor((sn % 3600) / 60);
  if (h > 0) return `${h} sa ${m} dk`;
  return `${m} dk`;
}

export function toplamSureHesapla(videolar) {
  const toplam = (videolar || []).reduce((acc, v) => acc + sureyeSaniyeCevir(v.duration), 0);
  return saniyedenSureMetni(toplam);
}
