// lise9Seed.js — 9. Sınıf Türkiye Yüzyılı Maarif Modeli müfredat ağacı
// Hiyerarşi: Ders (1) → Tema/Ünite (2) → Konu Grubu (3) → Detay (4, seçili dersler)

const n = (ad, c = []) => ({
  ad,
  cocuklar: c.length && typeof c[0] === 'string' ? c.map(a => ({ ad: a, cocuklar: [] })) : c,
});

export { agaciDuzlestir } from './tytMufredatSeed';

export const LISE9_AGAC = [
  n('Türk Dili ve Edebiyatı', [
    n('Tema 1: Sözün İnceliği', [
      n('Edebiyat ve Dil', [
        'Edebiyat estetik ve güzel sanatlar',
        'Edebî dil ve günlük dil',
        'Şiirde anlam ve söyleyiş',
      ]),
      n('Metin Türleri', [
        'Şiir türüne giriş',
        'Deneme türünün özellikleri',
        'Mülakat türünün özellikleri',
      ]),
      n('Uygulama', ['Okuma dinleme yazma atölyeleri', 'Duygu düşünce ve ifade çalışmaları']),
    ]),
    n('Tema 2: Anlam Arayışı', [
      n('Hikâye ve Anı', [
        'Hikâye türünün özellikleri',
        'Olay kişi zaman mekân',
        'Anı türünün özellikleri',
      ]),
      n('Anlam Katmanları', [
        'Şiirde duygu ve anlam',
        'Karakter ve bakış açısı',
        'Metinler arası anlam',
        'Yorumlama çıkarım tema',
      ]),
      n('Uygulama', ['Şiir yazma', 'Karakter sunumu']),
    ]),
    n('Tema 3: Anlamın Yapı Taşları', [
      n('Yapı ve Kurgu', [
        'Hikâyede yapı unsurları',
        'Metinde kurgu ve bütünlük',
        'Ana ve yardımcı düşünce',
      ]),
      n('Metin Türleri', [
        'Gezi yazısının özellikleri',
        'Belgesel ve öğretici anlatım',
        'Metin türleri arası farklar',
      ]),
      n('Görsel ve Uygulama', ['Bilgiyi görselleştirme ve infografik', 'Gözlemden yazıya geçiş']),
    ]),
    n('Tema 4: Dilin Zenginliği', [
      n('Edebî Türler', [
        'Roman türünün özellikleri',
        'Tiyatro türünün özellikleri',
        'Eleştiri türünün özellikleri',
        'Otobiyografi türünün özellikleri',
      ]),
      n('Dil ve Kimlik', [
        'Edebî metinlerde dil ve üslup',
        'Sosyal medya dili ile edebî dil',
        'Bireysel anlatım ve kimlik inşası',
      ]),
      n('Uygulama', ['Otobiyografi yazma']),
    ]),
  ]),
  n('Matematik', [
    n('Tema 1: Sayılar', [
      n('Sayı Kümeleri', [
        'Gerçek sayıların özellikleri',
        'Sayı kümeleri ve temsiller',
        'Aralık kavramı',
      ]),
      n('Gösterimler', ['Üslü gösterimler', 'Köklü gösterimler']),
      n('Niceliksel Özellikler', ['Küme kavramıyla sayı ilişkileri', 'Nicelikleri karşılaştırma']),
    ]),
    n('Tema 2: Nicelikler ve Değişimler', [
      n('Doğrusal Fonksiyonlar', [
        'Doğrusal fonksiyon tanımı',
        'Tablo grafik cebirsel gösterim',
        'Nitel özellikler',
        'Mutlak değer ile yorumlama',
      ]),
      n('Denklem ve Eşitsizlik', [
        'Birinci dereceden denklemler',
        'Birinci dereceden eşitsizlikler',
      ]),
      n('Modelleme', ['Gerçek yaşam durumlarını modelleme', 'Değişim ve ilişki yorumlama']),
    ]),
    n('Tema 3: Algoritma ve Bilişim', [
      n('Algoritmik Düşünme', ['Algoritmik problem çözümü', 'Adım sıralama ve akış mantığı']),
      n('Mantık', [
        'Mantıksal bağlaçlar',
        'Niceleyiciler',
        'Önermeler ve doğruluk değerlendirmesi',
      ]),
      n('Uygulama', ['Günlük yaşam problemleri']),
    ]),
    n('Tema 4: Geometrik Şekiller', [
      n('Üçgende Açılar', ['Açı özellikleri', 'Açı-kenar ilişkileri', 'Üçgen eşitsizliği']),
      n('Üçgende Kenarlar ve Akıl Yürütme', [
        'Kenar özellikleri',
        'Geometrik akıl yürütme',
        'İspat ve gerekçelendirme',
      ]),
    ]),
    n('Tema 5: Eşlik ve Benzerlik', [
      n('Dönüşümler ve Kavramlar', ['Geometrik dönüşümler', 'Eşlik kavramı', 'Benzerlik kavramı']),
      n('Teoremler', ['Tales teoremi', 'Öklid bağıntıları', 'Pisagor teoremi']),
      n('Uygulama', ['Üçgenlerde eşlik benzerlik', 'Ölçek oran ve biçim ilişkileri']),
    ]),
    n('Tema 6: İstatistiksel Araştırma Süreci', [
      n('Araştırma Tasarımı', [
        'Problem belirleme',
        'Araştırma sorusu oluşturma',
        'Veri toplama planı',
      ]),
      n('Veri İşleme', ['Veri düzenleme ve görselleştirme', 'Verileri analiz etme']),
      n('Sonuç', ['Yorumlama ve raporlama', 'Gerçek yaşam ilişkilendirme']),
    ]),
    n('Tema 7: Veriden Olasılığa', [
      'Deneysel olasılık',
      'Teorik olasılık',
      'Basit olasılık durumları',
      'Veri temelli yorum',
      'Belirsizlik ve tahmin',
    ]),
  ]),
  n('Fizik', [
    n('Ünite 1: Fizik Bilimi ve Kariyer', [
      'Fizik biliminin konusu ve alt dalları',
      'Fizik ve günlük yaşam',
      'Fizik temelli meslekler',
      'Bilimsel gözlem veri ve model',
    ]),
    n('Ünite 2: Kuvvet ve Hareket', [
      n('Vektörler ve Kuvvet', [
        'Skaler ve vektörel büyüklükler',
        'Vektörlerin gösterimi ve toplanması',
        'Kuvvet kavramı ve temel kuvvetler',
      ]),
      n('Hareket', ['Konum yer değiştirme alınan yol', 'Sürat ve hız', 'Hareket türleri']),
      n('Kuvvet-Hareket İlişkisi', ['Kuvvet-hareket yorumlama']),
    ]),
    n('Ünite 3: Akışkanlar', [
      n('Basınç', ['Basınç kavramı', 'Katı sıvı gaz basıncı', 'Açık hava basıncı']),
      n('Akışkan Davranışı', ['Kaldırma kuvveti', 'Bernoulli ilkesi', 'Günlük yaşam uygulamaları']),
    ]),
    n('Ünite 4: Enerji', [
      n('Isı ve Sıcaklık', ['İç enerji', 'Isı ve sıcaklık', 'Isıl denge', 'Isı alışverişi']),
      n('Madde ve Enerji', [
        'Öz ısı ve sıcaklık değişimi',
        'Hâl değişimi ve enerji',
        'Isı iletim yolları',
        'Isı yalıtımı ve verimlilik',
      ]),
      n('Enerji Dönüşümleri', ['Enerji dönüşümleri üzerine yorumlar']),
    ]),
  ]),
  n('Kimya', [
    n('Tema 1: Etkileşim', [
      n('Kimya ve Yaşam', ['Kimya hayat ilişkisi', 'Kimyanın çevre ve teknoloji ile ilişkisi']),
      n('Atomun Yapısı', ['Atom modelleri', 'Atomun yapısı']),
      n('Periyodik Tablo', [
        'Periyodik tablonun oluşumu',
        'Tabloda temel eğilimler',
        'Atom yapısı ve periyodik özellikler',
      ]),
    ]),
    n('Tema 2: Çeşitlilik', [
      n('Kimyasal Bağlar', [
        'Kimyasal bağ kavramı',
        'İyonik bağ',
        'Kovalent bağ',
        'Metalik bağ',
        'Lewis nokta yapısı',
        'Molekül polarlığı',
      ]),
      n('Bileşikler', ['Bileşiklerin adlandırılması', 'Moleküller arası etkileşimler']),
      n('Madde Halleri', [
        'Katılar — kristal ve amorf yapı',
        'Kaynama sıcaklığı ve buhar basıncı',
        'Viskozite adezyon kohezyon yüzey gerilimi',
      ]),
    ]),
    n('Tema 3: Sürdürülebilirlik', [
      'Nanoparçacık kavramı',
      'Kimya ve sürdürülebilirlik',
      'Ekolojik sürdürülebilirlik',
      'Yeşil kimya ilkeleri',
      'Evsel atıklardan yeni ürün',
      'Metal nanoparçacıklar',
      'Kimyasal süreçlerin ekosisteme etkileri',
      'Çevre dostu üretim ve tüketim',
    ]),
  ]),
  n('Biyoloji', [
    n('Tema 1: Yaşam', [
      n('Biyoloji Bilimi', [
        'Biyolojinin önemi ve çalışma alanları',
        'Bilimin doğası ve araştırma süreci',
        'Bilim etiği',
      ]),
      n('Canlılar Alemi', [
        'Biyolojide önemli dönüm noktaları',
        'Canlıların ortak özellikleri',
        'Sınıflandırma — modern ve üst âlem sistemi',
        'Biyoçeşitlilik',
      ]),
    ]),
    n('Tema 2: Organizasyon', [
      n('İnorganik Moleküller', ['Su', 'Mineraller']),
      n('Organik Moleküller', [
        'Karbonhidratlar',
        'Yağlar',
        'Proteinler',
        'Enzimler',
        'Nükleik asitler',
        'Vitaminler',
      ]),
      n('Hücrenin Organizasyonu', [
        'Prokaryot hücre',
        'Ökaryot hücre',
        'Hücre zarı',
        'Sitoplazma',
        'Organeller',
        'Çekirdek',
      ]),
      n('Hücre Zarından Madde Geçişleri', [
        'Pasif taşıma ve difüzyon',
        'Ozmoz',
        'Aktif taşıma',
        'Endositoz ve ekzositoz',
      ]),
      n('Organizasyon Kademeleri', ['Hücreden dokuya organa ve sisteme']),
    ]),
  ]),
  n('Tarih', [
    n('Ünite 1: Geçmişin İnşa Sürecinde Tarih', [
      n('Tarihin Doğası', [
        'Tarih öğrenmenin önemi',
        'Geçmiş zaman ve tarih ilişkisi',
        'Tarihsel bilginin oluşumu',
      ]),
      n('Yöntem ve Araştırma', [
        'Tarih araştırma yöntemleri',
        'Kaynak türleri',
        'Tarih yazımı',
        'Dijitalleşme ve tarihsel düşünme',
      ]),
    ]),
    n('Ünite 2: Eski Çağ Medeniyetleri', [
      n('Tarım ve Yerleşim', ['Tarım Devrimi', 'Yerleşik yaşama geçiş', 'İlk yerleşim alanları']),
      n('Medeniyet Yapıları', [
        'Ekonomik hayat',
        'Yönetim anlayışları',
        'Ordu ve hukuk',
        'İnanç yapıları',
        'Bilim ve sanat',
      ]),
      n('Erken Türk Tarihi', ['İlk Türk topluluklarında konargöçer yaşam', 'Medeniyet etkileşimi']),
    ]),
    n('Ünite 3: Orta Çağ Medeniyetleri', [
      n('Göçler ve Değişim', ['Kitlesel göçler', "Avrupa ve Asya'da değişim"]),
      n('Devlet ve Medeniyet', [
        'Başlıca devletler',
        'Yönetim ve ordu',
        'Ticaret yolları',
        'Bilim kültür ve sanat',
        'Medeniyet havzaları etkileşimi',
      ]),
    ]),
  ]),
  n('Coğrafya', [
    n('Ünite 1: Coğrafyanın Doğası', [
      'Coğrafyanın anlamı ve konusu',
      'Coğrafyanın bölümleri',
      'Coğrafi düşünme',
      'Günlük yaşamla ilişki',
      'Coğrafyanın gelişimi ve önemli bilim insanları',
    ]),
    n('Ünite 2: Mekânsal Bilgi Teknolojileri', [
      'Haritanın temel unsurları',
      'Koordinat sistemi',
      'Mutlak ve göreceli konum',
      "Türkiye'nin coğrafi konumu",
      'Harita yorumlama',
      "CBS'ye giriş ve dijital haritalar",
    ]),
    n('Ünite 3: Doğal Sistemler ve Süreçler', [
      'Hava durumu ve iklim',
      'İklim sisteminin bileşenleri',
      'İklim elemanları',
      'İklim tipleri',
      'İklim grafikleri yorumlama',
      'Doğal süreçlerin yaşam etkileri',
    ]),
    n('Ünite 4: Beşerî Sistemler ve Süreçler', [
      'Nüfusun değişimi',
      'Demografik geçiş süreci',
      'Nüfus piramitleri',
      'Nüfusun dağılışı',
      'Nüfus politikaları',
      'Nüfus sorunları ve sonuçları',
    ]),
    n('Ünite 5: Ekonomik Faaliyetler ve Etkileri', [
      'Ekonomik faaliyet türleri',
      'Doğal çevre ve ekonomik faaliyet',
      'Beşerî unsurlar ve ekonomik faaliyet',
      'Üretim dağıtım ve tüketim',
      'Mekânsal etkiler',
    ]),
    n('Ünite 6: Afetler ve Sürdürülebilir Çevre', [
      'Tehlike risk ve afet kavramları',
      'Afetlerin sınıflandırılması',
      'Afet yönetimi',
      'Risk azaltma',
      'Sürdürülebilir çevre anlayışı',
    ]),
    n('Ünite 7: Bölgeler Ülkeler ve Küresel Bağlantılar', [
      'Bölge kavramı ve türleri',
      'Bölge oluşturma ölçütleri',
      'Bölge sınırları ve geçiş bölgeleri',
      'Küresel bağlantılar ve mekânsal ilişkiler',
    ]),
  ]),
  n('Din Kültürü ve Ahlak Bilgisi', [
    n('Ünite 1: Allah-İnsan İlişkisi', [
      'İnsanın yaratılışı ve temel özellikleri',
      'İnsanın hakikati arayışı',
      'Allah-insan ilişkisi',
      'Dua ve ibadet',
      'İnsanın sorumluluk bilinci',
    ]),
    n("Ünite 2: İslam'da İnanç Esasları", [
      'İman kavramı ve mahiyeti',
      'İnanç esasları',
      'Bireye katkıları',
      'Topluma katkıları',
      'İnançla davranış ilişkisi',
    ]),
    n("Ünite 3: İslam'da İbadetler", [
      'İbadet kavramı',
      'İbadetin temel ilkeleri',
      'Temel ibadetler',
      'Bireysel ve toplumsal işlevleri',
    ]),
    n("Ünite 4: İslam'da Ahlak İlkeleri", [
      'Ahlak kavramı',
      'İslam ahlakının ilkeleri',
      'Ahlaki tutum ve davranışlar',
      'Bireysel ve toplumsal hayatta ahlak',
    ]),
    n("Ünite 5: Kur'an'a Göre Hz. Muhammed", [
      "Hz. Muhammed'in beşerî yönü",
      'Peygamberlik yönü',
      'Örnekliği',
      'Kültürümüzde Hz. Muhammed sevgisi',
      'Ehlibeyt sevgisi',
    ]),
  ]),
  n('İngilizce', [
    n('Theme 1: School Life', [
      'Countries and nationalities',
      'Languages and capitals',
      'Tourist attractions',
      'School activities',
      'National days',
    ]),
    n('Theme 2: Classroom Life', [
      'Classroom communication',
      'Classmates and friendships',
      'Daily and study routines',
      'Habits and responsibilities',
    ]),
    n('Theme 3: Personal Life', [
      'Physical appearance',
      'Personality traits',
      'Comparing people',
      'Introducing self and others',
    ]),
    n('Theme 4: Family Life', [
      'Family members and relationships',
      'Roles and responsibilities',
      'Daily family interactions',
    ]),
    n('Theme 5: Home & Neighbourhood', [
      'Types of houses',
      'Rooms furniture household items',
      'Activities at home',
      'Neighbourhood places',
    ]),
    n('Theme 6: City & Country', [
      'City and country life comparison',
      'Local and international food culture',
      'Food habits and festivals',
    ]),
    n('Theme 7: Nature & World', [
      'Nature animals and habitats',
      'Endangered animals',
      'Environmental awareness',
      'Protecting nature',
    ]),
    n('Theme 8: Universe & Future', [
      'Life in the universe',
      'Space-related themes',
      'Future life and expectations',
    ]),
  ]),
];
