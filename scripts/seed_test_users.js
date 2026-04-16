#!/usr/bin/env node
/**
 * Test kullanıcılarını Firestore'a seed eder.
 * Kullanım: node scripts/seed_test_users.js
 * Gereksinim: kök dizinde serviceAccount.json
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const serviceAccount = require('../serviceAccount.json');

initializeApp({ credential: cert(serviceAccount) });

const auth = getAuth();
const db = getFirestore();

async function uidBul(email) {
  const user = await auth.getUserByEmail(email);
  return user.uid;
}

async function seed() {
  console.warn('--- Test kullanıcıları seed ediliyor ---');

  const kocUid = await uidBul('test.koc@elsway.com');
  const ogrenciUid = await uidBul('test.ogrenci@elsway.com');

  console.warn(`Koç UID   : ${kocUid}`);
  console.warn(`Öğrenci UID: ${ogrenciUid}`);

  // 1. kullanicilar/{kocUid}
  await db.collection('kullanicilar').doc(kocUid).set({
    uid: kocUid,
    rol: 'koc',
    isim: 'Test Koç',
    email: 'test.koc@elsway.com',
    aktif: true,
    onboardingTamamlandi: true,
  });
  console.warn('✓ kullanicilar/kocUid yazıldı');

  // 2. kullanicilar/{ogrenciUid}
  await db.collection('kullanicilar').doc(ogrenciUid).set({
    uid: ogrenciUid,
    rol: 'ogrenci',
    isim: 'Test Öğrenci',
    email: 'test.ogrenci@elsway.com',
    aktif: true,
    kocId: kocUid,
  });
  console.warn('✓ kullanicilar/ogrenciUid yazıldı');

  // 3. ogrenciler/{ogrenciUid}
  await db.collection('ogrenciler').doc(ogrenciUid).set({
    isim: 'Test Öğrenci',
    email: 'test.ogrenci@elsway.com',
    kocId: kocUid,
    aktif: true,
    tur: 'sayisal',
    riskDurumu: 'yok',
    riskPuan: 0,
  });
  console.warn('✓ ogrenciler/ogrenciUid yazıldı');

  console.warn('--- Seed tamamlandı ---');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed hatası:', err.message);
  process.exit(1);
});
