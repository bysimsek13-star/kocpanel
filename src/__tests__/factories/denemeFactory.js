export const makeDeneme = (override = {}) => ({
  id: 'deneme-1',
  tarih: '2026-04-14',
  tip: 'TYT',
  toplamNet: 45.5,
  netler: {},
  olusturma: new Date('2026-04-14'),
  ...override,
});
