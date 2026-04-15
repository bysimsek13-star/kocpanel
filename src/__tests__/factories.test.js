/**
 * factories.test.js — Test factory altyapısı sözleşme testleri (Faz 5.1)
 */
import { describe, it, expect } from 'vitest';
import {
  kullaniciBuild,
  kocBuild,
  ogrenciBuild,
  veliBuild,
  adminBuild,
  ogrenciListesiBuild,
} from './factories/userFactory';

import {
  slotBuild,
  boshHaftaBuild,
  programBuild,
  doluHaftaBuild,
  tamamlandiIsaretle,
  GUNLER,
} from './factories/programFactory';

// ─────────────────────────────────────────────────────────────────────────────
// userFactory
// ─────────────────────────────────────────────────────────────────────────────
describe('userFactory — kullaniciBuild', () => {
  it('varsayılan alanlar üretir', () => {
    const u = kullaniciBuild();
    expect(u).toHaveProperty('id');
    expect(u).toHaveProperty('uid');
    expect(u.aktif).toBe(true);
    expect(typeof u.isim).toBe('string');
    expect(typeof u.email).toBe('string');
  });

  it("override'lar uygulanır", () => {
    const u = kullaniciBuild({ isim: 'Özel', aktif: false });
    expect(u.isim).toBe('Özel');
    expect(u.aktif).toBe(false);
  });

  it('her çağrıda benzersiz id üretir', () => {
    const ids = new Set([kullaniciBuild().id, kullaniciBuild().id, kullaniciBuild().id]);
    expect(ids.size).toBe(3);
  });
});

describe('userFactory — rol bazlı', () => {
  it('kocBuild rol = koc', () => {
    expect(kocBuild().rol).toBe('koc');
  });

  it('ogrenciBuild rol = ogrenci ve tur alanı var', () => {
    const o = ogrenciBuild();
    expect(o.rol).toBe('ogrenci');
    expect(o).toHaveProperty('tur');
    expect(o).toHaveProperty('kocId');
    expect(o).toHaveProperty('tamamlama');
  });

  it('veliBuild rol = veli ve ogrenciUid alanı var', () => {
    const v = veliBuild();
    expect(v.rol).toBe('veli');
    expect(v).toHaveProperty('ogrenciUid');
  });

  it('adminBuild rol = admin', () => {
    expect(adminBuild().rol).toBe('admin');
  });

  it('ogrenciListesiBuild istenen sayıda öğrenci üretir', () => {
    const liste = ogrenciListesiBuild(5);
    expect(liste).toHaveLength(5);
    liste.forEach(o => expect(o.rol).toBe('ogrenci'));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// programFactory
// ─────────────────────────────────────────────────────────────────────────────
describe('programFactory — slotBuild', () => {
  it('varsayılan tip = ders', () => {
    expect(slotBuild().tip).toBe('ders');
  });

  it('override tip uygulanır', () => {
    expect(slotBuild({ tip: 'tekrar' }).tip).toBe('tekrar');
  });
});

describe('programFactory — boshHaftaBuild', () => {
  it('7 günü içerir', () => {
    const hafta = boshHaftaBuild();
    expect(Object.keys(hafta)).toHaveLength(7);
  });

  it('her gün boş dizi', () => {
    const hafta = boshHaftaBuild();
    GUNLER.forEach(g => expect(hafta[g]).toEqual([]));
  });
});

describe('programFactory — programBuild', () => {
  it('hafta ve tamamlandi alanları mevcut', () => {
    const p = programBuild();
    expect(p).toHaveProperty('hafta');
    expect(p).toHaveProperty('tamamlandi');
    expect(p.tamamlandi).toEqual({});
  });

  it('override hafta uygulanır', () => {
    const p = programBuild({ hafta: { pazartesi: [slotBuild()] } });
    expect(p.hafta.pazartesi).toHaveLength(1);
  });
});

describe('programFactory — doluHaftaBuild', () => {
  it('belirtilen günlere slotlar ekler', () => {
    const p = doluHaftaBuild(['pazartesi', 'sali'], 3);
    expect(p.hafta.pazartesi).toHaveLength(3);
    expect(p.hafta.sali).toHaveLength(3);
    expect(p.hafta.carsamba).toHaveLength(0);
  });
});

describe('programFactory — tamamlandiIsaretle', () => {
  it("belirtilen key'leri tamamlandı olarak işaretler", () => {
    const p = doluHaftaBuild(['pazartesi'], 2);
    const sonuc = tamamlandiIsaretle(p, ['pazartesi_0']);
    expect(sonuc.tamamlandi['pazartesi_0']).toBe(true);
    expect(sonuc.tamamlandi['pazartesi_1']).toBeUndefined();
  });

  it('orijinal programı mutate etmez', () => {
    const p = programBuild();
    tamamlandiIsaretle(p, ['pazartesi_0']);
    expect(p.tamamlandi['pazartesi_0']).toBeUndefined();
  });
});
