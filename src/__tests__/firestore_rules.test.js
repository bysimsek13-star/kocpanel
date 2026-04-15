/**
 * ElsWay — Firestore Rules Testleri
 *
 * Gerçek Firestore emulator üzerinde çalışır.
 * Her rol için izin verilen ve yasaklanan işlemleri test eder.
 *
 * Çalıştır: npm run test:rules
 * (Emulator ayrı terminalde çalışıyor olmalı: firebase emulators:start --only firestore)
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { doc, getDoc, setDoc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { resolve } from 'path';

// ─── Test ortamı ──────────────────────────────────────────────────────────────

let testEnv;

const KOCID = 'koc_uid_1';
const KOCID2 = 'koc_uid_2';
const OGRUID = 'ogr_uid_1';
const VELIUID = 'veli_uid_1';
const ADMINUID = 'admin_uid_1';

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'kocpaneli-test',
    firestore: {
      rules: readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

// ─── Yardımcı fonksiyonlar ────────────────────────────────────────────────────

function kocDb(uid = KOCID) {
  return testEnv.authenticatedContext(uid).firestore();
}

function ogrDb(uid = OGRUID) {
  return testEnv.authenticatedContext(uid).firestore();
}

function veliDb(uid = VELIUID) {
  return testEnv.authenticatedContext(uid).firestore();
}

function adminDb() {
  return testEnv.authenticatedContext(ADMINUID).firestore();
}

function anonim() {
  return testEnv.unauthenticatedContext().firestore();
}

async function seedTemelVeri() {
  await testEnv.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'kullanicilar', KOCID), { rol: 'koc', aktif: true, isim: 'Test Koç' });
    await setDoc(doc(db, 'kullanicilar', KOCID2), { rol: 'koc', aktif: true, isim: 'Test Koç 2' });
    await setDoc(doc(db, 'kullanicilar', OGRUID), {
      rol: 'ogrenci',
      aktif: true,
      isim: 'Test Öğrenci',
    });
    await setDoc(doc(db, 'kullanicilar', VELIUID), {
      rol: 'veli',
      aktif: true,
      isim: 'Test Veli',
      ogrenciUid: OGRUID,
    });
    await setDoc(doc(db, 'kullanicilar', ADMINUID), {
      rol: 'admin',
      aktif: true,
      isim: 'Test Admin',
    });
    await setDoc(doc(db, 'ogrenciler', OGRUID), {
      kocId: KOCID,
      isim: 'Test Öğrenci',
      tur: 'sayisal',
      veliUid: VELIUID,
      aktif: true,
      sonDenemeNet: 45,
    });
  });
}

// ─── 1. kullanicilar ─────────────────────────────────────────────────────────

describe('kullanicilar', () => {
  beforeEach(seedTemelVeri);

  it('koç kendi profilini okuyabilir', async () => {
    await assertSucceeds(getDoc(doc(kocDb(), 'kullanicilar', KOCID)));
  });

  it('koç başka koçun profilini okuyamaz', async () => {
    await assertFails(getDoc(doc(kocDb(), 'kullanicilar', KOCID2)));
  });

  it('öğrenci kendi profilini okuyabilir', async () => {
    await assertSucceeds(getDoc(doc(ogrDb(), 'kullanicilar', OGRUID)));
  });

  it('anonim hiçbir profili okuyamaz', async () => {
    await assertFails(getDoc(doc(anonim(), 'kullanicilar', KOCID)));
  });

  it('kullanıcı kendi aktivitesini yazabilir', async () => {
    await assertSucceeds(
      setDoc(
        doc(ogrDb(), 'kullanicilar', OGRUID, 'aktivite', '2026-04-11'),
        { tarih: '2026-04-11', girisSayisi: 1 },
        { merge: true }
      )
    );
  });

  it('kullanıcı başkasının aktivitesine yazamaz', async () => {
    await assertFails(
      setDoc(
        doc(ogrDb(), 'kullanicilar', KOCID, 'aktivite', '2026-04-11'),
        { tarih: '2026-04-11' },
        { merge: true }
      )
    );
  });
});

// ─── 2. ogrenciler ───────────────────────────────────────────────────────────

describe('ogrenciler', () => {
  beforeEach(seedTemelVeri);

  it('koç kendi öğrencisini okuyabilir', async () => {
    await assertSucceeds(getDoc(doc(kocDb(), 'ogrenciler', OGRUID)));
  });

  it('koç başka koçun öğrencisini okuyamaz', async () => {
    await assertFails(getDoc(doc(kocDb(KOCID2), 'ogrenciler', OGRUID)));
  });

  it('öğrenci kendi dokümanını okuyabilir', async () => {
    await assertSucceeds(getDoc(doc(ogrDb(), 'ogrenciler', OGRUID)));
  });

  it('veli kendi öğrencisini okuyabilir', async () => {
    await assertSucceeds(getDoc(doc(veliDb(), 'ogrenciler', OGRUID)));
  });

  it('öğrenci sonDenemeNet güncelleyemez — server-owned alan', async () => {
    await assertFails(updateDoc(doc(ogrDb(), 'ogrenciler', OGRUID), { sonDenemeNet: 50 }));
  });

  it('öğrenci sonAktif güncelleyebilir — KRİTİK RULES TESTİ', async () => {
    await assertSucceeds(updateDoc(doc(ogrDb(), 'ogrenciler', OGRUID), { sonAktif: new Date() }));
  });

  it('öğrenci gunlukDakika güncelleyemez — server-owned alan', async () => {
    await assertFails(updateDoc(doc(ogrDb(), 'ogrenciler', OGRUID), { gunlukDakika: 10 }));
  });

  it('öğrenci girisSayisi güncelleyemez — server-owned alan', async () => {
    await assertFails(updateDoc(doc(ogrDb(), 'ogrenciler', OGRUID), { girisSayisi: 1 }));
  });

  it('öğrenci kocId alanını değiştiremez — GÜVENLİK TESTİ', async () => {
    await assertFails(updateDoc(doc(ogrDb(), 'ogrenciler', OGRUID), { kocId: 'baska_koc' }));
  });

  it('öğrenci isim alanını değiştiremez — GÜVENLİK TESTİ', async () => {
    await assertFails(updateDoc(doc(ogrDb(), 'ogrenciler', OGRUID), { isim: 'Hacker' }));
  });

  it('anonim öğrenci okuyamaz', async () => {
    await assertFails(getDoc(doc(anonim(), 'ogrenciler', OGRUID)));
  });

  it('admin her şeyi okuyabilir', async () => {
    await assertSucceeds(getDoc(doc(adminDb(), 'ogrenciler', OGRUID)));
  });
});

// ─── 3. ogrenciler/denemeler ─────────────────────────────────────────────────

describe('ogrenciler/denemeler', () => {
  beforeEach(seedTemelVeri);

  it('öğrenci kendi deneme sonucunu ekleyebilir', async () => {
    await assertSucceeds(
      addDoc(collection(ogrDb(), 'ogrenciler', OGRUID, 'denemeler'), {
        toplamNet: 55,
        tarih: '2026-04-11',
      })
    );
  });

  it('öğrenci kendi deneme sonucunu silebilir', async () => {
    let denemeId;
    await testEnv.withSecurityRulesDisabled(async ctx => {
      const ref = await addDoc(collection(ctx.firestore(), 'ogrenciler', OGRUID, 'denemeler'), {
        toplamNet: 55,
      });
      denemeId = ref.id;
    });
    const { deleteDoc, doc: fsDoc } = await import('firebase/firestore');
    await assertSucceeds(deleteDoc(fsDoc(ogrDb(), 'ogrenciler', OGRUID, 'denemeler', denemeId)));
  });

  it('başka koç deneme ekleyemez', async () => {
    await assertFails(
      addDoc(collection(kocDb(KOCID2), 'ogrenciler', OGRUID, 'denemeler'), { toplamNet: 99 })
    );
  });

  it('koç kendi öğrencisine deneme ekleyebilir', async () => {
    await assertSucceeds(
      addDoc(collection(kocDb(), 'ogrenciler', OGRUID, 'denemeler'), { toplamNet: 70 })
    );
  });
});

// ─── 4. ogrenciler/mesajlar ──────────────────────────────────────────────────

describe('ogrenciler/mesajlar', () => {
  beforeEach(seedTemelVeri);

  it('koç kendi öğrencisine mesaj yazabilir', async () => {
    await assertSucceeds(
      addDoc(collection(kocDb(), 'ogrenciler', OGRUID, 'mesajlar'), {
        metin: 'Merhaba',
        gonderen: 'koc',
      })
    );
  });

  it('öğrenci kendi mesajlarını okuyabilir', async () => {
    await assertSucceeds(getDoc(doc(ogrDb(), 'ogrenciler', OGRUID)));
  });

  it('başka koç mesaj yazamaz', async () => {
    await assertFails(
      addDoc(collection(kocDb(KOCID2), 'ogrenciler', OGRUID, 'mesajlar'), {
        metin: 'İzinsiz mesaj',
      })
    );
  });
});

// ─── 5. ogrenciler/program_v2 ────────────────────────────────────────────────

describe('ogrenciler/program_v2', () => {
  beforeEach(async () => {
    await seedTemelVeri();
    await testEnv.withSecurityRulesDisabled(async ctx => {
      await setDoc(doc(ctx.firestore(), 'ogrenciler', OGRUID, 'program_v2', '2026-04-07'), {
        hafta: { pazartesi: [] },
        tamamlandi: {},
      });
    });
  });

  it('öğrenci sadece tamamlandi alanını güncelleyebilir', async () => {
    await assertSucceeds(
      updateDoc(doc(ogrDb(), 'ogrenciler', OGRUID, 'program_v2', '2026-04-07'), {
        tamamlandi: { pazartesi_0: true },
      })
    );
  });

  it('öğrenci hafta alanını değiştiremez — GÜVENLİK TESTİ', async () => {
    await assertFails(
      updateDoc(doc(ogrDb(), 'ogrenciler', OGRUID, 'program_v2', '2026-04-07'), {
        hafta: { pazartesi: [{ tip: 'ders' }] },
      })
    );
  });

  it('koç program oluşturabilir', async () => {
    await assertSucceeds(
      setDoc(doc(kocDb(), 'ogrenciler', OGRUID, 'program_v2', '2026-04-14'), {
        hafta: {},
        tamamlandi: {},
      })
    );
  });
});

// ─── 6. bildirimler ──────────────────────────────────────────────────────────

describe('bildirimler', () => {
  beforeEach(seedTemelVeri);

  it('kullanıcı kendine bildirim oluşturabilir', async () => {
    await assertSucceeds(
      addDoc(collection(ogrDb(), 'bildirimler'), {
        aliciId: OGRUID,
        mesaj: 'Test bildirimi',
      })
    );
  });

  it('öğrenci başkasına bildirim oluşturamaz — push spam koruması', async () => {
    await assertFails(
      addDoc(collection(ogrDb(), 'bildirimler'), {
        aliciId: KOCID,
        mesaj: 'Spam',
      })
    );
  });

  it('anonim bildirim oluşturamaz', async () => {
    await assertFails(addDoc(collection(anonim(), 'bildirimler'), { aliciId: OGRUID }));
  });
});

// ─── 7. istemciHataKayitlari ─────────────────────────────────────────────────

describe('istemciHataKayitlari', () => {
  beforeEach(seedTemelVeri);

  it('giriş yapmış kullanıcı hata logu yazabilir', async () => {
    await assertSucceeds(
      addDoc(collection(ogrDb(), 'istemciHataKayitlari'), { mesaj: 'Test hatası' })
    );
  });

  it('anonim hata logu yazamaz', async () => {
    await assertFails(addDoc(collection(anonim(), 'istemciHataKayitlari'), { mesaj: 'Test' }));
  });
});

// ─── 8. playlists + videos (GÖREV 1.3) ──────────────────────────────────────

describe('playlists koleksiyonu', () => {
  const PLAYLIST_ID = 'playlist_doc_1';

  beforeEach(async () => {
    await seedTemelVeri();
    await testEnv.withSecurityRulesDisabled(async ctx => {
      await setDoc(doc(ctx.firestore(), 'playlists', PLAYLIST_ID), {
        coachId: KOCID,
        title: 'Test Playlist',
        playlistId: 'PL123',
        videoCount: 5,
      });
    });
  });

  it("koç kendi playlist'ini okuyabilir", async () => {
    await assertSucceeds(getDoc(doc(kocDb(), 'playlists', PLAYLIST_ID)));
  });

  it("koç başka koçun playlist'ini okuyamaz", async () => {
    await assertFails(getDoc(doc(kocDb(KOCID2), 'playlists', PLAYLIST_ID)));
  });

  it("koç kendi coachId'siyle playlist oluşturabilir", async () => {
    await assertSucceeds(
      setDoc(doc(kocDb(), 'playlists', 'yeni_playlist'), {
        coachId: KOCID,
        title: 'Yeni',
        playlistId: 'PL999',
        videoCount: 0,
      })
    );
  });

  it("koç başka koça ait coachId'siyle playlist oluşturamaz — IDOR koruması", async () => {
    await assertFails(
      setDoc(doc(kocDb(), 'playlists', 'sahte_playlist'), {
        coachId: KOCID2,
        title: 'Sahte',
        playlistId: 'PL000',
        videoCount: 0,
      })
    );
  });

  it('öğrenci playlist okuyabilir', async () => {
    await assertSucceeds(getDoc(doc(ogrDb(), 'playlists', PLAYLIST_ID)));
  });

  it('öğrenci playlist oluşturamaz', async () => {
    await assertFails(
      setDoc(doc(ogrDb(), 'playlists', 'ogrenci_playlist'), {
        coachId: OGRUID,
        title: 'Olmaz',
        playlistId: 'PL777',
        videoCount: 0,
      })
    );
  });

  it('öğrenci playlist güncelleyemez', async () => {
    await assertFails(updateDoc(doc(ogrDb(), 'playlists', PLAYLIST_ID), { title: 'Değiştir' }));
  });

  it('anonim kullanıcı hiçbir şey yapamaz', async () => {
    await assertFails(getDoc(doc(anonim(), 'playlists', PLAYLIST_ID)));
  });

  it('admin her şeyi yapabilir — okuma', async () => {
    await assertSucceeds(getDoc(doc(adminDb(), 'playlists', PLAYLIST_ID)));
  });

  it('admin her şeyi yapabilir — oluşturma', async () => {
    await assertSucceeds(
      setDoc(doc(adminDb(), 'playlists', 'admin_playlist'), {
        coachId: KOCID,
        title: 'Admin Ekle',
        playlistId: 'PL111',
        videoCount: 0,
      })
    );
  });
});

describe('playlists/videos alt koleksiyonu', () => {
  const PLAYLIST_ID = 'playlist_doc_videos';
  const VIDEO_ID = 'video_001';

  beforeEach(async () => {
    await seedTemelVeri();
    await testEnv.withSecurityRulesDisabled(async ctx => {
      const db = ctx.firestore();
      await setDoc(doc(db, 'playlists', PLAYLIST_ID), {
        coachId: KOCID,
        title: 'Video Test',
        playlistId: 'PLV1',
        videoCount: 1,
      });
      await setDoc(doc(db, 'playlists', PLAYLIST_ID, 'videos', VIDEO_ID), {
        videoId: VIDEO_ID,
        title: 'Test Video',
        duration: '10:30',
        position: 0,
      });
    });
  });

  it('giriş yapmış öğrenci videoları okuyabilir', async () => {
    await assertSucceeds(getDoc(doc(ogrDb(), 'playlists', PLAYLIST_ID, 'videos', VIDEO_ID)));
  });

  it('koç videoları okuyabilir', async () => {
    await assertSucceeds(getDoc(doc(kocDb(), 'playlists', PLAYLIST_ID, 'videos', VIDEO_ID)));
  });

  it('koç video yazabilir', async () => {
    await assertSucceeds(
      setDoc(doc(kocDb(), 'playlists', PLAYLIST_ID, 'videos', 'yeni_video'), {
        videoId: 'yeni_video',
        title: 'Yeni Video',
        duration: '05:00',
        position: 1,
      })
    );
  });

  it('öğrenci video yazamaz', async () => {
    await assertFails(
      setDoc(doc(ogrDb(), 'playlists', PLAYLIST_ID, 'videos', 'ogrenci_video'), {
        videoId: 'ogrenci_video',
        title: 'Olmaz',
        duration: '01:00',
        position: 99,
      })
    );
  });

  it('anonim kullanıcı video okuyamaz', async () => {
    await assertFails(getDoc(doc(anonim(), 'playlists', PLAYLIST_ID, 'videos', VIDEO_ID)));
  });
});

// ─── 9. goruntulu durum kısıtı regresyon testi (GÖREV 1.4) ──────────────────

describe('goruntulu — durum geçiş kısıtı', () => {
  const SESSION_ID = 'goruntulu_session_1';

  beforeEach(async () => {
    await seedTemelVeri();
    await testEnv.withSecurityRulesDisabled(async ctx => {
      await setDoc(doc(ctx.firestore(), 'goruntulu', SESSION_ID), {
        kocId: KOCID,
        ogrenciId: OGRUID,
        durum: 'bekliyor',
        kanal: 'test-ch',
        bitisTarih: null,
      });
    });
  });

  it('öğrenci durum: reddedildi yazabilir — izin verilmeli', async () => {
    await assertSucceeds(
      updateDoc(doc(ogrDb(), 'goruntulu', SESSION_ID), {
        durum: 'reddedildi',
        bitisTarih: new Date().toISOString(),
      })
    );
  });

  it('öğrenci durum: tamamlandi yazabilir', async () => {
    await assertSucceeds(
      updateDoc(doc(ogrDb(), 'goruntulu', SESSION_ID), {
        durum: 'tamamlandi',
        bitisTarih: new Date().toISOString(),
      })
    );
  });

  it('öğrenci durum: aktif yazarak bypass yapamaz — GÜVENLİK TESTİ', async () => {
    await assertFails(
      updateDoc(doc(ogrDb(), 'goruntulu', SESSION_ID), {
        durum: 'aktif',
        bitisTarih: new Date().toISOString(),
      })
    );
  });

  it('öğrenci durum: bekliyor yazamaz', async () => {
    await assertFails(
      updateDoc(doc(ogrDb(), 'goruntulu', SESSION_ID), {
        durum: 'bekliyor',
        bitisTarih: new Date().toISOString(),
      })
    );
  });

  it('koç durum: tamamlandi yazabilir', async () => {
    await assertSucceeds(
      updateDoc(doc(kocDb(), 'goruntulu', SESSION_ID), {
        durum: 'tamamlandi',
        bitisTarih: new Date().toISOString(),
      })
    );
  });

  it('yabancı kullanıcı güncelleme yapamaz', async () => {
    await assertFails(
      updateDoc(doc(kocDb(KOCID2), 'goruntulu', SESSION_ID), {
        durum: 'iptal',
        bitisTarih: new Date().toISOString(),
      })
    );
  });

  it('anonim kullanıcı okuyamaz', async () => {
    await assertFails(getDoc(doc(anonim(), 'goruntulu', SESSION_ID)));
  });
});
