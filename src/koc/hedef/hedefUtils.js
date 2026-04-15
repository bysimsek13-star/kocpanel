// ─── Durum hesaplama ──────────────────────────────────────────────────────────
export function hedefDurumu(hedef) {
  const { guncelDeger, hedefDeger, baslangicDegeri, sonTarih } = hedef;
  if (!hedefDeger) return 'aktif';
  const ilerleme = hedefDeger - baslangicDegeri || 1;
  const yapilan = (guncelDeger ?? baslangicDegeri) - baslangicDegeri;
  const yuzde = Math.min(100, Math.max(0, Math.round((yapilan / ilerleme) * 100)));
  if (yuzde >= 100) return 'tamamlandi';
  if (sonTarih && new Date(sonTarih) < new Date()) return 'gecikti';
  if (yuzde < 30 && sonTarih) {
    const kalanGun = Math.ceil((new Date(sonTarih) - new Date()) / 86400000);
    if (kalanGun < 7) return 'riskli';
  }
  return 'aktif';
}

export function ilerlemeYuzdesi(hedef) {
  const { guncelDeger, hedefDeger, baslangicDegeri } = hedef;
  if (!hedefDeger || hedefDeger === baslangicDegeri) return 0;
  const yapilan = (guncelDeger ?? baslangicDegeri) - baslangicDegeri;
  const toplam = hedefDeger - baslangicDegeri;
  return Math.min(100, Math.max(0, Math.round((yapilan / toplam) * 100)));
}

export function durumStil(s, durum) {
  const map = {
    aktif: { renk: s.accent, bg: s.accentSoft, label: 'Aktif' },
    tamamlandi: { renk: s.chartPos, bg: s.okSoft, label: 'Tamamlandı' },
    gecikti: { renk: s.tehlika, bg: s.tehlikaSoft, label: 'Gecikti' },
    riskli: { renk: s.uyari, bg: s.uyariSoft, label: 'Acil' },
  };
  return map[durum] || map.aktif;
}

export const TUR_LABEL = { net: 'Net', saat: 'Saat', puan: 'Puan', diger: 'Diğer' };

// ─── Puan tahmini yardımcıları ─────────────────────────────────────────────────
// TYT ham puan yaklaşımı: baz 100, her net ≈ 3.333 puan (400 üzerinden)
export function nettenTYTPuanTahmini(tytToplam) {
  if (tytToplam == null) return null;
  return Math.min(500, Math.round(100 + tytToplam * 3.333));
}

// AYT için SAY/EA/SÖZ/DİL ayrımı (yaklaşık formül)
export function nettenAYTPuanTahmini(aytToplam, alan = 'say') {
  const katsayilar = { say: 3.0, ea: 3.0, soz: 3.0, dil: 3.0 };
  const k = katsayilar[alan] || 3.0;
  return Math.min(500, Math.round(100 + aytToplam * k));
}

// Genel puan tahmini — ogrenciTur bazlı
export function tahminiPuan(netler = {}, ogrenciTur = '') {
  const tytNet = netler.tyt || 0;
  if (ogrenciTur.startsWith('lgs') || ogrenciTur === 'ortaokul') {
    return Math.min(500, Math.round(100 + tytNet * 4));
  }
  return nettenTYTPuanTahmini(tytNet);
}

// Yeni dokümanlar hedefTur, eskiler tur alanı kullanır — ikisini de okur
export const hedefTurEtiket = h => TUR_LABEL[h.hedefTur || h.tur] || h.hedefTur || h.tur || '—';
