export const MIN_AY = '2026-06';

export const ODEME_YONTEMLERI = ['IBAN', 'Nakit', 'Diğer'];

export const GIDER_KATEGORILERI = ['Reklam', 'Sistem', 'Personel', 'Ofis', 'Vergi', 'Diğer'];

export const KATEGORI_RENK = {
  Reklam: '#6366f1',
  Sistem: '#8b5cf6',
  Personel: '#f59e0b',
  Ofis: '#10b981',
  Vergi: '#ef4444',
  Diğer: '#6b7280',
};

export function ayYilStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function ayLabel(ayYil) {
  const [y, m] = ayYil.split('-');
  const isimler = [
    'Oca',
    'Şub',
    'Mar',
    'Nis',
    'May',
    'Haz',
    'Tem',
    'Ağu',
    'Eyl',
    'Eki',
    'Kas',
    'Ara',
  ];
  return `${isimler[Number(m) - 1]} ${y}`;
}

export function aylarListesi(baslangic = MIN_AY) {
  const result = [];
  let [y, m] = baslangic.split('-').map(Number);
  const simdi = new Date();
  const [sy, sm] = [simdi.getFullYear(), simdi.getMonth() + 1];
  while (y < sy || (y === sy && m <= sm)) {
    result.push(`${y}-${String(m).padStart(2, '0')}`);
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return result.reverse();
}

export function tlFormat(sayi) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(sayi || 0);
}
