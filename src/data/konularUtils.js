export const renkler = ['#5B4FE8', '#10B981', '#F43F5E', '#F59E0B', '#3B82F6', '#EC4899'];

export function netHesapla(d, y) {
  return (d - y / 4).toFixed(2);
}

export function verimlilikHesapla(c, b, g) {
  if (b === 0) return 0;
  const o = Math.min(c / b, 1.5);
  return Math.min(Math.round(((o + g / 100) / 2) * 100), 100);
}

export function verimlilikDurum(v) {
  if (v <= 20) return { emoji: '🔴', label: 'Çalışmadı', renk: '#F43F5E' };
  if (v <= 40) return { emoji: '🟠', label: 'Yetersiz', renk: '#F97316' };
  if (v <= 60) return { emoji: '🟡', label: 'Orta', renk: '#F59E0B' };
  if (v <= 80) return { emoji: '🟢', label: 'İyi', renk: '#10B981' };
  return { emoji: '💎', label: 'Mükemmel', renk: '#5B4FE8' };
}
