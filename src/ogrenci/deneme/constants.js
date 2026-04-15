// ─── Renk sabitleri ───────────────────────────────────────────────────────────
export const RENK = {
  genel: '#5B7FA6', // steel blue
  brans: '#7A6EA0', // muted purple
  artis: '#4A8C6F', // forest green
  istikrar: '#6B7280',
  bg: {
    genel: 'rgba(91,127,166,0.08)',
    brans: 'rgba(122,110,160,0.08)',
  },
};

// ─── Yorum motoru (sadece pozitif) ────────────────────────────────────────────
export function yorumUret(nets) {
  if (!nets || nets.length < 2) return null;
  const sirali = [...nets].sort((a, b) => new Date(a.tarih) - new Date(b.tarih));
  const son = sirali[sirali.length - 1].net;
  const onceki = sirali[sirali.length - 2].net;
  const fark = son - onceki;
  const son3 = sirali.slice(-3).map(d => d.net);
  const hepsiBuyuyor = son3.length >= 3 && son3[1] >= son3[0] && son3[2] >= son3[1];
  const stabil = Math.abs(fark) < 0.5;

  if (fark > 2)
    return { ikon: '🎉', metin: `Son denemede ${fark.toFixed(1)} net artış!`, renk: RENK.artis };
  if (fark > 0.5) return { ikon: '📈', metin: `${fark.toFixed(1)} net yükseliş`, renk: RENK.artis };
  if (stabil && sirali.length >= 3)
    return { ikon: '💪', metin: 'İstikrarlı gidiş', renk: RENK.istikrar };
  if (hepsiBuyuyor) return { ikon: '🔥', metin: 'Sürekli yükseliş serisi!', renk: RENK.artis };
  return null; // Düşüşte hiçbir şey yazılmaz
}
