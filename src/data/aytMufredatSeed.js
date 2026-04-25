// aytMufredatSeed.js — AYT müfredat ağaçları (EA / Sayısal / Sözel)
// Prefix listelerini {ad, cocuklar} ağaç formatına dönüştürür; agaciDuzlestir ile seed edilir.
import { aytMatKonular } from './konularAytMat';
import { aytEdeKonular } from './konularAytEde';
import { aytTarKonular } from './konularAytTar';
import { aytCogKonular } from './konularAytCog';
import { aytFizKonular } from './konularAytFiz';
import { aytKimKonular } from './konularAytKim';
import { aytBiyKonular } from './konularAytBiy';
import { aytTar2Konular } from './konularAytTar2';
import { aytFelKonular } from './konularAytFel';
import { aytDinKonular } from './konularAytDin';

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
  ...prefixToAgac(aytMatKonular),
  ...prefixToAgac(aytEdeKonular),
  ...prefixToAgac(aytTarKonular),
  ...prefixToAgac(aytCogKonular),
];

export const AYT_SAYISAL_AGAC = [
  ...prefixToAgac(aytMatKonular),
  ...prefixToAgac(aytFizKonular),
  ...prefixToAgac(aytKimKonular),
  ...prefixToAgac(aytBiyKonular),
];

export const AYT_SOZEL_AGAC = [
  ...prefixToAgac(aytEdeKonular),
  ...prefixToAgac(aytTarKonular),
  ...prefixToAgac(aytCogKonular),
  ...prefixToAgac(aytTar2Konular),
  ...prefixToAgac(aytCogKonular), // cog2 = cog içeriği
  ...prefixToAgac(aytFelKonular),
  ...prefixToAgac(aytDinKonular),
];
