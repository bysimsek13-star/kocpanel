import { GUN_ETIKET } from '../utils/programAlgoritma';

// Kaydedilmiş rapordan yazdırılabilir metin üret (PDF / yeni pencere)
export function raporMetniOlustur(rapor, ogrenciIsim) {
  const satirlar = ['📋 ElsWay Haftalık Koç Raporu'];
  if (ogrenciIsim) satirlar.push(`Öğrenci: ${ogrenciIsim}`);
  if (rapor.haftaBaslangic)
    satirlar.push(`Dönem: ${rapor.haftaBaslangic} → ${rapor.haftaBitis || '—'}`);
  satirlar.push('');
  if (rapor.calismaGunSayisi != null) satirlar.push(`📅 Çalışma: ${rapor.calismaGunSayisi} gün`);
  if (rapor.toplamSaat != null) satirlar.push(`⏱ Süre: ${rapor.toplamSaat} saat`);
  if (rapor.gorevTamamlama != null) satirlar.push(`✅ Görev: %${rapor.gorevTamamlama}`);
  if (rapor.sonDenemeNet != null) satirlar.push(`📊 Son net: ${rapor.sonDenemeNet}`);
  if (rapor.ozetMetni) {
    satirlar.push('');
    satirlar.push(`📝 ${rapor.ozetMetni}`);
  }
  if (rapor.kocNotu) {
    satirlar.push('');
    satirlar.push(`Koç notu: ${rapor.kocNotu}`);
  }
  return satirlar.join('\n');
}

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
  const satirlar = [
    `Sayın Veli,`,
    ``,
    `${ogrenci.isim} için ${fmt(secilenHafta)} – ${fmt(haftaBitis)} haftasına ait raporu paylaşıyorum.`,
    ``,
  ];

  const calismaKisim = [];
  if (ozet.calismaGun > 0) calismaKisim.push(`${ozet.calismaGun} gün çalıştı`);
  if (Number(ozet.toplamSaat) > 0) calismaKisim.push(`toplam ${ozet.toplamSaat} saat`);
  if (ozet.gorevOran > 0) calismaKisim.push(`haftalık görevlerin %${ozet.gorevOran}'ini tamamladı`);
  if (calismaKisim.length) satirlar.push(`Bu hafta ${calismaKisim.join(', ')}.`);

  if (ozet.sonDenemeNet != null) {
    satirlar.push(`Son denemede ${ozet.sonDenemeNet} net yaptı.`);
  }

  const programliGunler = gunVerileri.filter(
    g => g.slotlar.filter(sl => sl.tip).length > 0 || g.soruToplam > 0
  );
  if (programliGunler.length > 0) {
    satirlar.push(``);
    satirlar.push(`Günlük program:`);
    programliGunler.forEach(g => {
      const doluSlotlar = g.slotlar.filter(sl => sl.tip);
      const ekler = [];
      if (g.soruToplam > 0) ekler.push(`${g.soruToplam} soru`);
      satirlar.push(
        `• ${GUN_ETIKET[g.gunAdi]}, ${fmt(g.tarih)}${ekler.length ? ' (' + ekler.join(', ') + ')' : ''}`
      );
      doluSlotlar.forEach(sl => {
        const origIdx = g.slotlar.indexOf(sl);
        const tamam = !!g.tamamlandi[origIdx];
        const isim = [sl.ders, sl.icerik].filter(Boolean).join(' – ');
        satirlar.push(`  ${tamam ? '✓' : '○'} ${isim}`);
      });
    });
  }

  if (denemeler.length > 0) {
    satirlar.push(``);
    satirlar.push(`Deneme sonuçları:`);
    denemeler.forEach(d => {
      satirlar.push(`• ${d.ad || 'Deneme'}: ${d.toplamNet} net`);
    });
  }

  if (kocNotu.trim()) {
    satirlar.push(``);
    satirlar.push(`Koç notu: ${kocNotu.trim()}`);
  }

  satirlar.push(``);
  satirlar.push(`Saygılarımızla,`);
  satirlar.push(`ElsWay Koçluk`);
  return satirlar.join('\n');
}
