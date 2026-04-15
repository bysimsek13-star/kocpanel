// TYT + AYT + LGS tüm ders ve konu başlıkları — MEB YKS müfredatına göre güncellenmiştir
// Bu dosya alt modülleri birleştirir ve geriye dönük uyumlu tek bir KONULAR objesi sağlar.

export { TYT_DERSLER, tytKonular } from './konularTyt';
export { AYT_SAY, AYT_EA, AYT_SOZ, AYT_DIL, AYT_DERSLER, aytKonular } from './konularAyt';
export { lgsKonular } from './konularLgs';
export { renkler, netHesapla, verimlilikHesapla, verimlilikDurum } from './konularUtils';

import { tytKonular } from './konularTyt';
import { aytKonular } from './konularAyt';
import { lgsKonular } from './konularLgs';

export const KONULAR = {
  ...tytKonular,
  ...aytKonular,
  ...lgsKonular,
};
