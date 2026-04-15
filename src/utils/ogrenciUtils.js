export const SINAV_TAKVIMI = [
  { key: 'lgs', label: 'LGS 2026', date: '2026-06-14', turler: ['LGS'] },
  { key: 'tyt', label: 'TYT 2026', date: '2026-06-20', turler: ['TYT', 'TYT-AYT', 'AYT', 'YKS'] },
  { key: 'ayt', label: 'AYT 2026', date: '2026-06-21', turler: ['AYT', 'TYT-AYT', 'YKS'] },
  { key: 'ydt', label: 'YDT 2026', date: '2026-06-21', turler: ['YDT', 'DIL'] },
];

export function upcomingExams(tur) {
  const today = new Date();
  const normalized = String(tur || '').toUpperCase();
  return SINAV_TAKVIMI.filter(
    item => !tur || item.turler.some(t => normalized.includes(String(t).toUpperCase()))
  )
    .map(item => {
      const examDate = new Date(item.date + 'T09:30:00');
      const diff = examDate - today;
      return { ...item, daysLeft: Math.ceil(diff / 86400000), isPast: diff < 0 };
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

export function formatCountdown(daysLeft) {
  if (daysLeft == null) return 'Tarih yok';
  if (daysLeft < 0) return 'Geçti';
  if (daysLeft === 0) return 'Bugün';
  if (daysLeft === 1) return '1 gün kaldı';
  if (daysLeft < 30) return `${daysLeft} gün kaldı`;
  const months = Math.floor(daysLeft / 30);
  const days = daysLeft % 30;
  return `${months} ay ${days} gün`;
}

export function normalizeDateId(value) {
  if (!value) return null;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function calculateStreak(records = []) {
  const dates = Array.from(
    new Set(records.map(r => normalizeDateId(r.tarih || r.id || r.olusturma)).filter(Boolean))
  ).sort();
  if (!dates.length) return { current: 0, best: 0, lastStudyDate: null, consistency: 0 };
  const dateSet = new Set(dates);
  const today = new Date();
  let cursor = new Date(today);
  let current = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
    if (dateSet.has(key)) {
      current += 1;
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    if (current === 0) {
      cursor.setDate(cursor.getDate() - 1);
      if (
        dateSet.has(
          `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`
        )
      ) {
        current += 1;
        cursor.setDate(cursor.getDate() - 1);
        continue;
      }
    }
    break;
  }
  let best = 1,
    run = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = Math.round((new Date(dates[i]) - new Date(dates[i - 1])) / 86400000);
    run = diff === 1 ? run + 1 : 1;
    if (run > best) best = run;
  }
  const start = new Date();
  start.setDate(start.getDate() - 29);
  const last30 = dates.filter(d => new Date(d) >= start).length;
  return {
    current,
    best,
    lastStudyDate: dates[dates.length - 1],
    consistency: Math.round((last30 / 30) * 100),
  };
}

export function buildTaskTemplates(tur) {
  const ortak = [
    {
      id: 'haftalik-dengeli',
      title: 'Dengeli hafta planı',
      tag: 'Standart akış',
      tasks: ['2 konu anlatımı', '1 tekrar bloğu', '2 branş denemesi', '1 genel deneme analizi'],
      note: 'Ders dağılımını eşit götürmek isteyen öğrenciler için.',
    },
    {
      id: 'moral-toparlama',
      title: 'Moral toparlama planı',
      tag: 'Düşük motivasyon',
      tasks: [
        'Kısa çalışma blokları',
        'Kolay kazanım hedefleri',
        '1 mini deneme',
        'Koç geri bildirim görüşmesi',
      ],
      note: 'Riski yükselen veya son haftası zayıf geçen öğrenciler için.',
    },
  ];
  const t = String(tur || '').toUpperCase();
  if (t.includes('LGS')) {
    return ortak.concat([
      {
        id: 'lgs-fen-mat',
        title: 'LGS Fen + Matematik odak',
        tag: 'LGS',
        tasks: [
          'Fen tekrar',
          'Matematik yeni nesil soru',
          'Paragraf seti',
          'Haftalık LGS denemesi',
        ],
        note: 'Neti hızlı artıran çekirdek paket.',
      },
      {
        id: 'lgs-kamp',
        title: 'LGS kamp haftası',
        tag: 'Kamp',
        tasks: [
          'Her gün 3 ders',
          'Gün sonu yanlış analizi',
          '2 genel deneme',
          'Eksik konu listesi',
        ],
        note: 'Sınav yaklaşırken tempoyu yükseltir.',
      },
    ]);
  }
  return ortak.concat([
    {
      id: 'tyt-hiz',
      title: 'TYT hızlandırma',
      tag: 'TYT',
      tasks: ['Paragraf + problem rutini', 'Hız denemesi', 'Yanlış defteri', '1 TYT genel deneme'],
      note: 'Süre yönetimi için ideal.',
    },
    {
      id: 'ayt-derin',
      title: 'AYT derin çalışma',
      tag: 'AYT',
      tasks: [
        '2 derin konu bloğu',
        'Kazanım testi',
        'Çıkmış soru taraması',
        'Haftalık AYT denemesi',
      ],
      note: 'Bilgi yoğun derslerde verim sağlar.',
    },
    {
      id: 'kamp-final',
      title: 'Sınav kampı',
      tag: 'Kamp',
      tasks: [
        'Her gün sabit saat',
        'Tam deneme + analiz',
        'Eksik tamamlama listesi',
        'Koç takip görüşmesi',
      ],
      note: 'Son düzlüğe giren öğrenciler için.',
    },
  ]);
}

export function generateSuggestions({
  ogrenci = {},
  dashboard = {},
  hedefler = [],
  denemeler = [],
  streak = { current: 0 },
}) {
  const suggestions = [];
  const completion = dashboard.gorevTamamlama || 0;
  const den1 = denemeler?.[0];
  const den2 = denemeler?.[1];
  const delta = den1 && den2 ? (Number(den1.toplamNet) || 0) - (Number(den2.toplamNet) || 0) : null;
  if (completion < 60)
    suggestions.push({
      type: 'program',
      title: 'Görev yükünü sadeleştir',
      text: `Tamamlama oranı %${completion}. 3 ana göreve düşürüp tekrar kur.`,
    });
  if (delta != null && delta < 0)
    suggestions.push({
      type: 'deneme',
      title: 'Net düşüşüne müdahale et',
      text: `Son denemede ${Math.abs(delta).toFixed(1)} net düşüş var. Branş kırılımını yeniden incele.`,
    });
  if ((streak.current || 0) >= 5)
    suggestions.push({
      type: 'motivasyon',
      title: 'Streak ödüllendir',
      text: `${streak.current} günlük seri var. Öğrenciyi mikro ödülle destekle.`,
    });
  const aktifHedef = hedefler.find(h => h.durum !== 'tamamlandi');
  if (aktifHedef)
    suggestions.push({
      type: 'hedef',
      title: 'En yakın hedefi görünür yap',
      text: `"${aktifHedef.baslik}" hedefini bu haftanın ana odağı yap.`,
    });
  if (!suggestions.length)
    suggestions.push({
      type: 'stabil',
      title: 'Dengeli gidişat',
      text: `${ogrenci.isim || 'Öğrenci'} için bu hafta mevcut ritmi korumak mantıklı görünüyor.`,
    });
  return suggestions.slice(0, 4);
}
