// AYT ders listeleri ve konu başlıkları
// Her ders kendi dosyasında; paylaşımlı dersler tek kaynaktan referans alır.
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

// Alan bazlı AYT ders setleri — ÖSYM YKS kılavuzuna göre (her alan max 80 net)
export const AYT_SAY = [
  { id: 'aytmat', label: 'Matematik', toplam: 40, renk: '#5B4FE8' },
  { id: 'fiz', label: 'Fizik', toplam: 14, renk: '#3B82F6' },
  { id: 'kim', label: 'Kimya', toplam: 13, renk: '#10B981' },
  { id: 'biy', label: 'Biyoloji', toplam: 13, renk: '#EC4899' },
]; // toplam: 80

export const AYT_EA = [
  { id: 'aytmat', label: 'Matematik', toplam: 40, renk: '#5B4FE8' },
  { id: 'ede', label: 'Edebiyat', toplam: 24, renk: '#F59E0B' },
  { id: 'tar', label: 'Tarih-1', toplam: 10, renk: '#F43F5E' },
  { id: 'cog', label: 'Coğrafya-1', toplam: 6, renk: '#8B5CF6' },
]; // toplam: 80

export const AYT_SOZ = [
  { id: 'ede', label: 'Edebiyat', toplam: 24, renk: '#F59E0B' },
  { id: 'tar', label: 'Tarih-1', toplam: 10, renk: '#F43F5E' },
  { id: 'cog', label: 'Coğrafya-1', toplam: 6, renk: '#8B5CF6' },
  { id: 'tar2', label: 'Tarih-2', toplam: 11, renk: '#EF4444' },
  { id: 'cog2', label: 'Coğrafya-2', toplam: 11, renk: '#7C3AED' },
  { id: 'fel', label: 'Felsefe Grubu', toplam: 12, renk: '#0891B2' },
  { id: 'din', label: 'Din Kültürü', toplam: 6, renk: '#059669' },
]; // toplam: 80

export const AYT_DIL = [{ id: 'yabdil', label: 'Yabancı Dil', toplam: 80, renk: '#0EA5E9' }];

// Geriye dönük uyumluluk + DenemeKart id arama için tüm AYT dersleri
export const AYT_DERSLER = [
  { id: 'aytmat', label: 'Matematik', toplam: 40, renk: '#5B4FE8' },
  { id: 'fiz', label: 'Fizik', toplam: 14, renk: '#3B82F6' },
  { id: 'kim', label: 'Kimya', toplam: 13, renk: '#10B981' },
  { id: 'biy', label: 'Biyoloji', toplam: 13, renk: '#EC4899' },
  { id: 'ede', label: 'Edebiyat', toplam: 24, renk: '#F59E0B' },
  { id: 'tar', label: 'Tarih-1', toplam: 10, renk: '#F43F5E' },
  { id: 'cog', label: 'Coğrafya-1', toplam: 6, renk: '#8B5CF6' },
  { id: 'tar2', label: 'Tarih-2', toplam: 11, renk: '#EF4444' },
  { id: 'cog2', label: 'Coğrafya-2', toplam: 11, renk: '#7C3AED' },
  { id: 'fel', label: 'Felsefe Grubu', toplam: 12, renk: '#0891B2' },
  { id: 'din', label: 'Din Kültürü', toplam: 6, renk: '#059669' },
  { id: 'yabdil', label: 'Yabancı Dil', toplam: 80, renk: '#0EA5E9' },
];

export const aytKonular = {
  aytmat: aytMatKonular,
  ede: aytEdeKonular,
  tar: aytTarKonular,
  cog: aytCogKonular,
  cog2: aytCogKonular, // Coğrafya-2 içeriği Coğrafya-1 ile aynı — kopya yok, aynı referans
  fiz: aytFizKonular,
  kim: aytKimKonular,
  biy: aytBiyKonular,
  tar2: aytTar2Konular,
  fel: aytFelKonular,
  din: aytDinKonular,
  yabdil: [
    'Vocabulary',
    'Grammar',
    'Reading Comprehension',
    'Dialogue Completion',
    'Paragraph Completion',
    'Translation',
  ],
};
