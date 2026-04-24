export function konuDuzListe(konular) {
  return konular.filter(k => !k.startsWith('## ') && !k.startsWith('# ') && !k.startsWith('### '));
}

export function konuBasliklari(konular) {
  const result = [];
  let anaBolum = null,
    altBolum = null,
    grup = null;
  for (const k of konular) {
    if (k.startsWith('## ')) {
      anaBolum = k.slice(3);
      altBolum = null;
      grup = null;
      result.push({ tip: 'ana', baslik: anaBolum });
    } else if (k.startsWith('# ')) {
      altBolum = k.slice(2);
      grup = null;
      result.push({ tip: 'alt', baslik: altBolum, ana: anaBolum });
    } else if (k.startsWith('### ')) {
      grup = k.slice(4);
      result.push({ tip: 'grup', baslik: grup, alt: altBolum, ana: anaBolum });
    } else {
      result.push({ tip: 'konu', baslik: k, grup, alt: altBolum, ana: anaBolum });
    }
  }
  return result;
}

export function ustBaslikKonulari(konular, baslik) {
  const duzenli = konuBasliklari(konular);
  let topluyor = false;
  let seviye = null;
  const sonuc = [];
  for (const item of duzenli) {
    if (!topluyor) {
      if (item.baslik === baslik) {
        topluyor = true;
        seviye = item.tip;
        continue;
      }
    } else {
      if (seviye === 'ana' && item.tip === 'ana') break;
      if (seviye === 'alt' && (item.tip === 'ana' || item.tip === 'alt')) break;
      if (seviye === 'grup' && (item.tip === 'ana' || item.tip === 'alt' || item.tip === 'grup'))
        break;
      if (item.tip === 'konu') sonuc.push(item.baslik);
    }
  }
  return sonuc;
}
