import { GUN_ETIKET } from '../utils/programAlgoritma';

export function addDays(str, n) {
  const d = new Date(str + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function fmt(str) {
  if (!str) return '—';
  return new Date(str + 'T00:00:00').toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
  });
}

export function waMetniOlustur({
  ogrenci,
  secilenHafta,
  haftaBitis,
  gunVerileri,
  denemeler,
  kocNotu,
  ozet,
}) {
  const sep = '━━━━━━━━━━━━━━━━━━━━';
  const satirlar = [
    `🎓 *HAFTALIK ÖĞRENCİ RAPORU*`,
    `📅 ${fmt(secilenHafta)} – ${fmt(haftaBitis)}`,
    ``,
    `👤 *${ogrenci.isim}*  |  ${ogrenci.tur || ''}`,
    sep,
    `📊 *HAFTALIK ÖZET*`,
    `📆 Çalışma: ${ozet.calismaGun} gün · ${ozet.toplamSaat} saat`,
    `✅ Görev tamamlama: %${ozet.gorevOran}`,
    ozet.sonDenemeNet != null ? `📈 Son deneme neti: ${ozet.sonDenemeNet}` : null,
    sep,
    `📆 *GÜNLÜK PROGRAM*`,
  ].filter(x => x !== null);

  gunVerileri.forEach(g => {
    const doluSlotlar = g.slotlar.filter(sl => sl.tip);
    if (!doluSlotlar.length && !g.calismaSaat && !g.soruToplam) return;
    satirlar.push(``);
    let baslik = `*${GUN_ETIKET[g.gunAdi]}, ${fmt(g.tarih)}*`;
    const badges = [];
    if (g.calismaSaat > 0) badges.push(`⏱️ ${g.calismaSaat}s`);
    if (g.soruToplam > 0) badges.push(`📚 ${g.soruToplam} soru`);
    satirlar.push(baslik + (badges.length ? `  ${badges.join(' · ')}` : ''));
    doluSlotlar.forEach((sl, _i) => {
      const origIdx = g.slotlar.indexOf(sl);
      const tamam = !!g.tamamlandi[origIdx];
      const isim = [sl.ders, sl.icerik].filter(Boolean).join(' – ');
      satirlar.push(`${tamam ? '✅' : '❌'} ${isim}`);
    });
  });

  if (denemeler.length > 0) {
    satirlar.push(``);
    satirlar.push(sep);
    satirlar.push(`🏆 *DENEME SONUÇLARI*`);
    denemeler.forEach(d => {
      satirlar.push(`• ${d.ad || 'Deneme'}  →  *${d.toplamNet} net*`);
    });
  }

  if (kocNotu.trim()) {
    satirlar.push(``);
    satirlar.push(sep);
    satirlar.push(`📝 *KOÇ NOTU*`);
    satirlar.push(kocNotu.trim());
  }

  satirlar.push(``);
  satirlar.push(`_ElsWay Koçluk Sistemi_`);
  return satirlar.join('\n');
}
