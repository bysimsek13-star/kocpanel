export const ETIKETLER = [
  { key: 'motivasyon', label: '💪 Motivasyon', renk: '#F59E0B' },
  { key: 'disiplin', label: '📐 Disiplin', renk: '#5B4FE8' },
  { key: 'aile', label: '👨‍👩‍👦 Aile', renk: '#10B981' },
  { key: 'gorusme', label: '🗣 Görüşme', renk: '#06B6D4' },
  { key: 'hedef', label: '🎯 Hedef', renk: '#F43F5E' },
  { key: 'genel', label: '📝 Genel', renk: '#8B5CF6' },
];

export const etiketBilgi = key =>
  ETIKETLER.find(e => e.key === key) || { label: key, renk: '#888' };
