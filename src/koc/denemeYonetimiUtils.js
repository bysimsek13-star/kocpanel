export function satirHesapla(ogrenciler, veriler, s) {
  return ogrenciler.map((o, i) => {
    const den = veriler[o.id] || [];
    const son = den[0];
    const onc = den[1];
    const fark = son && onc ? parseFloat(son.toplamNet) - parseFloat(onc.toplamNet) : null;
    const sonUc = den.slice(0, 3).map(d => parseFloat(d.toplamNet) || 0);
    const sonUcOrt = sonUc.length ? sonUc.reduce((a, b) => a + b, 0) / sonUc.length : null;
    const netBand =
      sonUc.length < 2
        ? 'veri_az'
        : (fark ?? 0) < -2
          ? 'dusus'
          : (fark ?? 0) > 0
            ? 'yukselis'
            : 'degisim_az';
    const netUI =
      netBand === 'veri_az'
        ? { etiket: 'Karşılaştırma için 2+ deneme', renk: s.text3, bg: s.surface2 }
        : netBand === 'dusus'
          ? { etiket: 'Son iki denemede düşüş', renk: s.tehlika, bg: s.tehlikaSoft }
          : netBand === 'yukselis'
            ? { etiket: 'Son iki denemede artış', renk: s.ok, bg: s.okSoft }
            : { etiket: 'Net değişimi sınırlı', renk: s.bilgi, bg: s.bilgiSoft };
    return { ogrenci: o, index: i, den, son, fark, sonUcOrt, netUI, netBand };
  });
}

export function ozetHesapla(satirlar, n) {
  const toplamDeneme = satirlar.reduce((t, r) => t + r.den.length, 0);
  const sonNetler = satirlar.filter(r => r.son).map(r => parseFloat(r.son.toplamNet) || 0);
  const ortSonNet = sonNetler.length
    ? (sonNetler.reduce((a, b) => a + b, 0) / sonNetler.length).toFixed(1)
    : '—';
  return {
    toplamDeneme,
    verisiOlan: satirlar.filter(r => r.den.length > 0).length,
    ortSonNet,
    dususSay: satirlar.filter(r => r.netBand === 'dusus').length,
    n,
  };
}

export function listele(satirlar, arama, filtre, sira) {
  let l = satirlar.filter(r => {
    const q = arama.trim().toLowerCase();
    if (!q) return true;
    return r.ogrenci.isim?.toLowerCase().includes(q) || r.ogrenci.email?.toLowerCase().includes(q);
  });
  if (filtre === 'veri_yok') l = l.filter(r => r.den.length === 0);
  if (filtre === 'dusus') l = l.filter(r => r.netBand === 'dusus');
  const net = r => (r.son ? parseFloat(r.son.toplamNet) || 0 : -1);
  if (sira === 'isim')
    l = [...l].sort((a, b) => (a.ogrenci.isim || '').localeCompare(b.ogrenci.isim || '', 'tr'));
  if (sira === 'net_cok') l = [...l].sort((a, b) => net(b) - net(a));
  if (sira === 'net_az') l = [...l].sort((a, b) => net(a) - net(b));
  return l;
}
