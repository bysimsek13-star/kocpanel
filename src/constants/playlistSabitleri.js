export const GRUPLAR = [
  { id: 'ortaokul7', label: '7. Sınıf' },
  { id: 'lgs8', label: '8. Sınıf / LGS' },
  { id: 'lise9', label: '9. Sınıf' },
  { id: 'lise10', label: '10. Sınıf' },
  { id: 'lise11', label: '11. Sınıf' },
  { id: 'tyt', label: 'TYT' },
  { id: 'sayisal', label: 'AYT Sayısal' },
  { id: 'ea', label: 'AYT EA' },
  { id: 'sozel', label: 'AYT Sözel' },
  { id: 'dil', label: 'AYT Dil' },
];

export const KANONIK_DERSLER = [
  { id: 'mat', label: 'Matematik' },
  { id: 'geo', label: 'Geometri' },
  { id: 'fiz', label: 'Fizik' },
  { id: 'kim', label: 'Kimya' },
  { id: 'biy', label: 'Biyoloji' },
  { id: 'tur', label: 'Türkçe / Edebiyat' },
  { id: 'tar', label: 'Tarih' },
  { id: 'cog', label: 'Coğrafya' },
  { id: 'fel', label: 'Felsefe' },
  { id: 'ing', label: 'İngilizce' },
  { id: 'fen', label: 'Fen Bilimleri' },
  { id: 'din', label: 'Din Kültürü' },
  { id: 'diger', label: 'Diğer' },
];

// Gruba göre gösterilecek kanonik ders ID'leri
export const GRUP_DERSLER = {
  ortaokul7: ['tur', 'mat', 'fen', 'tar', 'din', 'ing', 'diger'],
  lgs8: ['tur', 'mat', 'fen', 'tar', 'din', 'ing', 'diger'],
  lise9: ['tur', 'mat', 'fiz', 'kim', 'biy', 'tar', 'cog', 'fel', 'din', 'ing', 'diger'],
  lise10: ['tur', 'mat', 'fiz', 'kim', 'biy', 'tar', 'cog', 'fel', 'din', 'ing', 'diger'],
  lise11: ['tur', 'mat', 'fiz', 'kim', 'biy', 'tar', 'cog', 'fel', 'din', 'ing', 'diger'],
  tyt: ['tur', 'mat', 'fiz', 'kim', 'biy', 'tar', 'cog', 'fel', 'din', 'diger'],
  sayisal: ['mat', 'geo', 'fiz', 'kim', 'biy', 'diger'],
  ea: ['mat', 'geo', 'tur', 'tar', 'cog', 'diger'],
  sozel: ['tur', 'tar', 'cog', 'fel', 'din', 'diger'],
  dil: ['ing', 'diger'],
};

// ─── Müfredat to kanonik eşlemesi ────────────────────────────────────────────
export const MUFREDAT_TO_KANONIK = {
  // TYT
  tur: 'tur',
  mat: 'mat',
  tytfiz: 'fiz',
  tytkim: 'kim',
  tytbiy: 'biy',
  tyttar: 'tar',
  tytcog: 'cog',
  tytfel: 'fel',
  tytdin: 'din',
  // AYT
  aytmat: 'mat',
  fiz: 'fiz',
  kim: 'kim',
  biy: 'biy',
  ede: 'tur',
  tar: 'tar',
  cog: 'cog',
  tar2: 'tar',
  cog2: 'cog',
  fel: 'fel',
  aytdil: 'ing',
  yabdil: 'ing',
  // LGS
  lgstur: 'tur',
  lgsmat: 'mat',
  lgsfen: 'fen',
  lgsinkilap: 'tar',
  lgsdin: 'din',
  lgsing: 'ing',
  // Ortaokul 7
  tur7: 'tur',
  mat7: 'mat',
  fen7: 'fen',
  sosyal7: 'tar',
  din7: 'din',
  ing7: 'ing',
  // Lise 9-10
  tde910: 'tur',
  mat910: 'mat',
  fiz910: 'fiz',
  kim910: 'kim',
  biy910: 'biy',
  tar910: 'tar',
  cog910: 'cog',
  fel910: 'fel',
  din910: 'din',
  ing910: 'ing',
};

export function ogrenciTurToGrup(tur, sinif) {
  const t = (tur || '').toLowerCase();
  const s = Number(sinif) || 0;
  const turM = t.match(/_(\d+)$/);
  const efektif = turM ? Number(turM[1]) : s;

  if (t.includes('lgs') || efektif === 8) return 'lgs8';
  if (efektif === 7 || (efektif === 0 && t.includes('ortaokul'))) return 'ortaokul7';
  if (efektif === 9) return 'lise9';
  if (efektif === 10) return 'lise10';
  if (efektif === 11) return 'lise11';
  if (t.startsWith('sayisal')) return 'sayisal';
  if (t.startsWith('ea')) return 'ea';
  if (t.startsWith('sozel')) return 'sozel';
  if (t.startsWith('dil')) return 'dil';
  return 'tyt';
}

export function kanonikDersLabel(dersId) {
  return KANONIK_DERSLER.find(d => d.id === dersId)?.label ?? dersId;
}

export function grupLabel(grupId) {
  return GRUPLAR.find(g => g.id === grupId)?.label ?? grupId;
}
