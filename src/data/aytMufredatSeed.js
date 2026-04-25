// aytMufredatSeed.js — AYT müfredat ağaçları (EA / Sayısal / Sözel)
// Prefix listelerini {ad, cocuklar} ağaç formatına dönüştürür; agaciDuzlestir ile seed edilir.
import { aytEaKonular } from './konularAytEa';
import { aytSayisalKonular } from './konularAytSayisal';
import { aytSozelKonular } from './konularAytSozel';

// '## ' → kök düğüm, '# ' → 2. seviye, '### ' → 3. seviye, düz satır → yaprak
function prefixToAgac(liste) {
  const roots = [];
  let cur0 = null;
  let cur1 = null;
  let cur2 = null;
  for (const item of liste) {
    if (item.startsWith('## ')) {
      cur0 = { ad: item.slice(3), cocuklar: [] };
      roots.push(cur0);
      cur1 = null;
      cur2 = null;
    } else if (item.startsWith('# ')) {
      cur1 = { ad: item.slice(2), cocuklar: [] };
      cur2 = null;
      if (cur0) cur0.cocuklar.push(cur1);
    } else if (item.startsWith('### ')) {
      cur2 = { ad: item.slice(4), cocuklar: [] };
      const parent = cur1 || cur0;
      if (parent) parent.cocuklar.push(cur2);
    } else {
      const parent = cur2 || cur1 || cur0;
      if (parent) parent.cocuklar.push({ ad: item, cocuklar: [] });
    }
  }
  return roots;
}

export const AYT_EA_AGAC = [
  ...prefixToAgac(aytEaKonular.aytmat),
  ...prefixToAgac(aytEaKonular.ede),
  ...prefixToAgac(aytEaKonular.tar),
  ...prefixToAgac(aytEaKonular.cog),
];

export const AYT_SAYISAL_AGAC = [
  ...prefixToAgac(aytEaKonular.aytmat),
  ...prefixToAgac(aytSayisalKonular.fiz),
  ...prefixToAgac(aytSayisalKonular.kim),
  ...prefixToAgac(aytSayisalKonular.biy),
];

export const AYT_SOZEL_AGAC = [
  ...prefixToAgac(aytEaKonular.ede),
  ...prefixToAgac(aytEaKonular.tar),
  ...prefixToAgac(aytEaKonular.cog),
  ...prefixToAgac(aytSozelKonular.tar2),
  ...prefixToAgac(aytSozelKonular.cog2),
  ...prefixToAgac(aytSozelKonular.fel),
  ...prefixToAgac(aytSozelKonular.din),
];
