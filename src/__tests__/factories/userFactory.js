/**
 * userFactory.js — Test veri üretici (kullanıcı nesneleri)
 *
 * Kullanım:
 *   import { kullaniciBuild, kocBuild, ogrenciBuild, veliBuild, adminBuild } from './factories/userFactory';
 *
 *   const koc = kocBuild({ isim: 'Ayşe Hoca' });
 *   const ogrenci = ogrenciBuild({ tur: 'lgs_8', kocId: koc.id });
 */

let _counter = 0;
function uid(prefix = 'usr') {
  return `${prefix}_${++_counter}`;
}

// ─── Temel kullanıcı şablonu ──────────────────────────────────────────────────
function kullaniciBuild(overrides = {}) {
  const id = overrides.id || uid('kullanici');
  return {
    id,
    uid: id,
    isim: 'Test Kullanıcı',
    email: `${id}@test.com`,
    rol: 'ogrenci',
    aktif: true,
    ...overrides,
  };
}

// ─── Rol bazlı factory'ler ────────────────────────────────────────────────────
function kocBuild(overrides = {}) {
  return kullaniciBuild({
    id: uid('koc'),
    isim: 'Test Koç',
    rol: 'koc',
    ...overrides,
  });
}

function ogrenciBuild(overrides = {}) {
  return kullaniciBuild({
    id: uid('ogr'),
    isim: 'Test Öğrenci',
    rol: 'ogrenci',
    tur: 'tyt_12',
    kocId: '',
    tamamlama: 0,
    beklenenSaat: 6,
    aktif: true,
    haftalikTamamlamaOrani: 0,
    sonCalismaTarihi: null,
    toplamCalismaGunu: 0,
    riskDurumu: 'yok',
    ...overrides,
  });
}

function veliBuild(overrides = {}) {
  return kullaniciBuild({
    id: uid('veli'),
    isim: 'Test Veli',
    rol: 'veli',
    ogrenciUid: '',
    ...overrides,
  });
}

function adminBuild(overrides = {}) {
  return kullaniciBuild({
    id: uid('admin'),
    isim: 'Test Admin',
    rol: 'admin',
    ...overrides,
  });
}

// ─── Toplu üretim ─────────────────────────────────────────────────────────────
function ogrenciListesiBuild(count = 3, overrides = {}) {
  return Array.from({ length: count }, (_, i) =>
    ogrenciBuild({ isim: `Öğrenci ${i + 1}`, ...overrides })
  );
}

export { kullaniciBuild, kocBuild, ogrenciBuild, veliBuild, adminBuild, ogrenciListesiBuild };

// ─── make* alias'ları (kısa isimler) ─────────────────────────────────────────
export const makeKoc = (override = {}) => ({
  uid: 'koc-uid-1',
  isim: 'Test Koç',
  email: 'koc@test.com',
  rol: 'koc',
  aktif: true,
  sonGiris: null,
  ...override,
});

export const makeOgrenci = (override = {}) => ({
  uid: 'ogrenci-uid-1',
  isim: 'Test Öğrenci',
  email: 'ogrenci@test.com',
  rol: 'ogrenci',
  kocId: 'koc-uid-1',
  aktif: true,
  tur: 'sayisal',
  riskDurumu: 'yok',
  riskPuan: 0,
  sonDenemeNet: null,
  sonDenemeTarih: null,
  haftalikTamamlamaOrani: 0,
  sonCalismaTarihi: null,
  toplamCalismaGunu: 0,
  ...override,
});

export const makeVeli = (override = {}) => ({
  uid: 'veli-uid-1',
  isim: 'Test Veli',
  email: 'veli@test.com',
  rol: 'veli',
  aktif: true,
  ogrenciUid: 'ogrenci-uid-1',
  ...override,
});

export const makeAdmin = (override = {}) => ({
  uid: 'admin-uid-1',
  isim: 'Test Admin',
  email: 'admin@test.com',
  rol: 'admin',
  aktif: true,
  ...override,
});
