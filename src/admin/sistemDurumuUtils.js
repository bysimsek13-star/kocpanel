export function onceOnce(ts) {
  if (!ts?.toDate) return '—';
  const diff = Math.floor((Date.now() - ts.toDate().getTime()) / 1000);
  if (diff < 60) return `${diff}s önce`;
  if (diff < 3600) return `${Math.floor(diff / 60)}dk önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}sa önce`;
  return ts.toDate().toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function mobilMi(ua = '') {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua) ? '📱' : '🖥️';
}

export function rolRenk(rol) {
  if (rol === 'ogrenci') return '#5B4FE8';
  if (rol === 'koc') return '#10B981';
  if (rol === 'veli') return '#F59E0B';
  return '#6B7280';
}

export function lcpRenk(val) {
  if (val === '—' || val == null) return '#6B7280';
  const n = Number(val);
  if (n <= 2500) return '#10B981';
  if (n <= 4000) return '#F59E0B';
  return '#F43F5E';
}

export function lcpEtiket(val) {
  if (val === '—' || val == null) return '—';
  const n = Number(val);
  if (n <= 2500) return 'İyi';
  if (n <= 4000) return 'Orta';
  return 'Yavaş';
}

export function saglikDurumu(hata1s, hata24s) {
  if (hata1s >= 5 || hata24s >= 20) return { renk: '#F43F5E', etiket: 'Kritik', ikon: '🔴' };
  if (hata1s >= 2 || hata24s >= 5) return { renk: '#F59E0B', etiket: 'Dikkat', ikon: '🟡' };
  return { renk: '#10B981', etiket: 'Normal', ikon: '🟢' };
}
