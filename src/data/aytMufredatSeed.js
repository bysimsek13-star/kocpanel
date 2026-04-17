// aytMufredatSeed.js — AYT müfredat ağaçları (EA / Sayısal / Sözel)
// Hiyerarşi: Ders (1) → Alt Başlık veya Konu (2) → Alt Konu (3)

const n = (ad, c = []) => ({
  ad,
  cocuklar: c.length && typeof c[0] === 'string' ? c.map(a => ({ ad: a, cocuklar: [] })) : c,
});

// ─── Paylaşılan dersler ────────────────────────────────────────────────────────

const aytMatematik = n('AYT Matematik', [
  'Polinomlar',
  'İkinci Dereceden Denklemler',
  'Karmaşık Sayılar',
  'Parabol',
  'Trigonometri',
  'Logaritma',
  'Diziler',
  'Binom',
  'Olasılık – Permütasyon – Kombinasyon',
  'Limit ve Süreklilik',
  'Türev',
  'İntegral',
]);

const aytEdebiyat = n('AYT Türk Dili ve Edebiyatı', [
  'Türk Edebiyatının Dönemleri',
  'İslamiyet Öncesi Türk Edebiyatı',
  'Destanlar',
  'Geçiş Dönemi Türk Edebiyatı',
  'Anonim Halk Edebiyatı',
  'Âşık Tarzı Halk Edebiyatı',
  'Tekke – Tasavvuf Edebiyatı',
  'Divan Edebiyatına Giriş',
  'Divan Edebiyatında Nazım Biçimleri',
  'Divan Edebiyatında Nazım Türleri',
  'Divan Edebiyatı Sanatçıları, Eserleri ve Nesir',
  'Tanzimat Edebiyatı',
  'Servetifünun Edebiyatı',
  'Fecriati',
  'Millî Edebiyat',
  'Cumhuriyet Dönemi Şiiri',
  'Cumhuriyet Dönemi Roman ve Hikâye',
]);

// ─── AYT Eşit Ağırlık ─────────────────────────────────────────────────────────

const aytTarih1 = n('AYT Tarih-1', [
  'Tarih ve Zaman',
  'İnsanlığın İlk Dönemleri',
  'İlk ve Orta Çağlarda Türk Dünyası',
  'İslamiyetin Doğuşu ve İlk İslam Devletleri',
  'Türklerin İslamiyeti Kabulü ve İlk Türk İslam Devletleri',
  'Yerleşme ve Devletleşme Sürecinde Selçuklu Türkiyesi',
  'Beylikten Devlete Osmanlı Siyaseti',
  'Dünya Gücü Osmanlı',
  'XX. Yüzyıl Başlarında Osmanlı Devleti ve Dünya',
  'Millî Mücadele Hazırlık Dönemi',
  'I. TBMM Dönemi',
  'Kurtuluş Savaşı Muharebeler Dönemi',
  'Atatürkçülük ve Türk İnkılabı',
  'İki Savaş Arası Dönemde Türkiye ve Dünya',
]);

const aytCografya1 = n('AYT Coğrafya-1', [
  n('Doğal Sistemler', [
    'Biyoçeşitlilik',
    'Ekosistem ve Unsurları',
    'Su Ekosistemleri',
    'Doğadaki Ekstrem Olaylar',
    'Küresel İklim Değişimi',
  ]),
  n('Beşerî Sistemler', ['Nüfus Politikaları', 'Yerleşmenin Ortaya Çıkışı', 'Şehir Yerleşmeleri']),
  n('Ekonomik Faaliyetler ve Türkiye', [
    'Ekonomik Faaliyet Türleri',
    'Doğal Kaynaklar ve Ekonomi',
    "Türkiye'de Tarım",
    "Türkiye'de Madenler ve Enerji Kaynakları",
    "Türkiye'de Sanayi",
    "Türkiye'de Ticaret ve Turizm",
    'Bölgesel Kalkınma Projeleri',
  ]),
]);

export const AYT_EA_AGAC = [aytMatematik, aytEdebiyat, aytTarih1, aytCografya1];

// ─── AYT Sayısal ──────────────────────────────────────────────────────────────

const aytFizik = n('AYT Fizik', [
  'Vektörler',
  'Tork ve Denge',
  'Kütle ve Ağırlık Merkezi',
  'Basit Makineler',
  'Hareket',
  'Açısal Momentum',
  'Kütle Çekim ve Kepler Yasaları',
  'Elektriksel Kuvvet ve Elektriksel Alan',
  'Düzgün Elektriksel Alan',
  'Sığaçlar',
  'Manyetizma',
  'Elektromanyetik İndüksiyon',
  'Alternatif Akım',
  'Basit Harmonik Hareket',
  'Dalgalar',
  'Su Dalgalarında Kırınım ve Girişim',
  'Işık Teorileri',
  'Modern Fizik',
  'Atom Modelleri',
  'Atom Altı Parçacıklar ve Büyük Patlama',
  'Radyoaktivite',
  'Fotoelektrik Olay ve Compton',
]);

const aytKimya = n('AYT Kimya', [
  'Atomun Kuantum Modeli',
  'Elektron Dizilimleri',
  'Periyodik Özellikler',
  'Gazlar',
  'Sıvı Çözeltiler',
  'Kimyasal Tepkimelerde Denge',
  'Dengeye Etki Eden Faktörler',
  'Asit – Baz',
  'Tampon Çözeltiler ve Titrasyon',
  'Çözünürlük Dengesi',
  'Kimya ve Elektrik',
  'Redoks Tepkimeleri',
  'Elektroliz',
  'Organik Kimyaya Giriş',
  'Organik Bileşikler',
  'Organik Bileşiklerde İzomerlik',
  'Alkanlar',
  'Alkoller',
  'Aldehit ve Ketonlar',
]);

const aytBiyoloji = n('AYT Biyoloji', [
  'Sinir Sisteminin Yapısı, Görevi ve İşlevi',
  'Merkezi Sinir Sistemi',
  'Omurilik ve Çevresel Sinir Sistemi',
  'Endokrin Sistem',
  'Duyu Organları',
  'Destek ve Hareket Sistemi',
  'Sindirim Sistemi',
  'Dolaşım Sistemi',
  'Solunum Sistemi',
  'Üriner Sistem',
  'Üreme Sistemi ve Embriyonik Gelişim',
  'Komünite ve Popülasyon Ekolojisi',
  'Nükleik Asitlerin Keşfi ve Önemi',
  'DNA Replikasyonu',
  'Genetik Şifre ve Protein Sentezi',
  'Genetik Mühendisliği ve Biyoteknoloji',
  'Fotosentez ve Kemosentez',
  'Bitki Biyolojisi',
  'Bitkisel Dokular',
  'Bitkilerde Madde Taşınması',
  'Bitkilerde Eşeyli Üreme',
  'Bitkisel Hormonlar ve Bitkilerde Hareket',
]);

export const AYT_SAYISAL_AGAC = [aytMatematik, aytFizik, aytKimya, aytBiyoloji];

// ─── AYT Sözel ────────────────────────────────────────────────────────────────

const aytTarihSozel = n('AYT Tarih', [
  'Tarih ve Zaman',
  'İnsanlığın İlk Dönemleri',
  'İlk ve Orta Çağlarda Türk Dünyası',
  'İslamiyetin Doğuşu ve İlk İslam Devletleri',
  'Türklerin İslamiyeti Kabulü ve İlk Türk İslam Devletleri',
  'İlk Müslüman Türk Devletleri Kültür ve Medeniyeti',
  'Yerleşme ve Devletleşme Sürecinde Selçuklu Türkiyesi',
  "Orta Çağ'da Avrupa Tarihi",
  'Osmanlı Devleti Kültür ve Medeniyeti',
  'Beylikten Devlete Osmanlı Siyaseti',
  'Dünya Gücü Osmanlı',
  'Değişim Çağında Avrupa ve Osmanlı',
  'Uluslararası İlişkilerde Denge Stratejisi',
  'Devrimler Çağında Değişen Devlet-Toplum İlişkileri',
  'XX. Yüzyıl Başlarında Osmanlı Devleti ve Dünya',
  'Millî Mücadele Hazırlık Dönemi',
  'I. TBMM Dönemi',
  'Kurtuluş Savaşı Muharebeler Dönemi',
  'Atatürkçülük ve Türk İnkılabı',
  'İki Savaş Arası Dönemde Türkiye ve Dünya',
]);

const aytCografyaSozel = n('AYT Coğrafya', [
  n('Doğal Sistemler', [
    'Biyoçeşitlilik',
    'Ekosistem ve Unsurları',
    'Su Ekosistemleri',
    'Doğadaki Ekstrem Olaylar',
    'Küresel İklim Değişimi',
  ]),
  n('Beşerî Sistemler', ['Nüfus Politikaları', 'Yerleşmenin Ortaya Çıkışı', 'Şehir Yerleşmeleri']),
  n('Ekonomik Faaliyetler ve Türkiye', [
    'Ekonomik Faaliyet Türleri',
    'Doğal Kaynaklar ve Ekonomi',
    "Türkiye'de Tarım",
    "Türkiye'de Madenler ve Enerji Kaynakları",
    "Türkiye'de Sanayi",
    "Türkiye'de Ticaret ve Turizm",
    'Bölgesel Kalkınma Projeleri',
  ]),
  n('Küresel Ortam: Bölgeler ve Ülkeler', [
    'İlk Kültür Merkezleri',
    'Ülkeler Arası Etkileşim',
    'Enerji Güzergâhları ve Etkileri',
    'Jeopolitik Konum ve Sıcak Çatışma Bölgeleri',
    'Küresel Çevre Sorunları',
    'Çevre Politikaları ve Çevresel Örgütler',
  ]),
]);

const aytFelsefeGrubu = n('AYT Felsefe Grubu', [
  'Psikolojiye Giriş',
  'Psikolojinin Temel Süreçleri',
  'Öğrenme, Bellek ve Düşünme',
  'Sosyolojiye Giriş',
  'Birey ve Toplum',
  'Toplumsal Yapı',
  'Toplumsal Değişme ve Gelişme',
  'Toplumsal Kurumlar',
  'Mantığa Giriş',
  'Klasik Mantık',
  'Sembolik Mantık',
]);

const aytDinSozel = n('AYT Din Kültürü ve Ahlak Bilgisi', [
  'İnanç',
  'İnanç 2',
  'İnanç 3',
  'İnanç 4',
  'Temizlik ve İbadet',
  'Temizlik ve İbadet 2',
  'Yaşayan Dünya Dinleri',
  'Yaşayan Dünya Dinleri 2',
  "Kur'an-ı Kerim'in Ana Konuları",
  "Kur'an'a Göre Hz. Muhammed",
]);

export const AYT_SOZEL_AGAC = [
  aytEdebiyat,
  aytTarihSozel,
  aytCografyaSozel,
  aytFelsefeGrubu,
  aytDinSozel,
];
