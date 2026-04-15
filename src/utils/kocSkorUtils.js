// Koç performans skoru — public API
// Kullanım: import { computeCoachPerformance, coachScoreMeta } from './kocSkorUtils'
//
// Veri güvenilirlik notu: Eksik alanlarda DEFAULT_NEUTRAL_SCORE (62) devreye girer.
// Skor 62'ye yaklaşırsa "veri yok" anlamına gelir, "kötü koç" değil.
// veriYeterli=false ise panelde "—" göster.

import { DEFAULT_NEUTRAL_SCORE } from './kocSkorSabitleri';
import {
  average,
  clamp,
  daysSince,
  resolveNumber,
  resolveCurrentNet,
  resolveCompletion,
  resolveCurrentHours,
  resolveStartNet,
  weightedAverage,
} from './kocSkorYardimci';
import {
  buildGrowthMetrics,
  buildRoutineMetrics,
  buildInterventionMetrics,
  scoreByThresholds,
  scoreRecency,
} from './kocSkorHesap';

function buildCoachOperationMetrics(coach = {}, students = []) {
  const lastLoginDays = daysSince(coach.sonGiris || coach.lastLoginAt || coach.sonGirisTarihi);
  const lastActiveDays = daysSince(coach.sonAktiflik || coach.lastActiveAt || coach.sonIslemTarihi);
  const activeDays = resolveNumber(coach, ['haftalikAktifGun', 'son7GunAktifGun', 'activeDays7d']);
  const pendingMessagesFromStudents = students.reduce(
    (sum, student) =>
      sum + (resolveNumber(student, ['cevaplanmayanMesajSayisi', 'bekleyenMesajSayisi']) || 0),
    0
  );
  const operationScore = weightedAverage(
    [
      { score: scoreRecency(lastLoginDays, 2, 5, 9), weight: 0.35 },
      { score: scoreRecency(lastActiveDays, 1, 4, 8), weight: 0.35 },
      { score: clamp((activeDays ?? 4) * (100 / 7), 0, 100), weight: 0.2 },
      {
        score: scoreByThresholds(
          -pendingMessagesFromStudents,
          [
            { min: 0, score: 90 },
            { min: -2, score: 72 },
            { min: -5, score: 46 },
            { min: -Infinity, score: 24 },
          ],
          DEFAULT_NEUTRAL_SCORE
        ),
        weight: 0.1,
      },
    ],
    DEFAULT_NEUTRAL_SCORE
  );
  return {
    score: Math.round(operationScore),
    lastLoginDays,
    lastActiveDays,
    activeDays,
    pendingMessagesFromStudents,
  };
}

export function coachScoreMeta(score = 0) {
  if (score >= 85)
    return { label: 'Çok iyi', color: '#10B981', bg: 'rgba(16,185,129,0.12)', order: 0 };
  if (score >= 70)
    return { label: 'Dengeli', color: '#06B6D4', bg: 'rgba(6,182,212,0.12)', order: 1 };
  if (score >= 55)
    return { label: 'Takip edilmeli', color: '#F59E0B', bg: 'rgba(245,158,11,0.14)', order: 2 };
  return { label: 'Geliştirilmeli', color: '#F43F5E', bg: 'rgba(244,63,94,0.14)', order: 3 };
}

function buildCoachNarrative(summary) {
  if (summary.kalibrasyonSayisi === summary.ogrenciSayisi && summary.ogrenciSayisi > 0)
    return 'Koçun öğrencilerinin büyük kısmı hâlâ kalibrasyon döneminde. Bu yüzden erken sert puanlama uygulanmıyor.';
  if (summary.gelisimSkoru >= 80 && summary.duzenSkoru >= 75)
    return 'Öğrenciler başlangıç seviyelerine göre ilerliyor ve kurulan düzen korunuyor.';
  if (summary.duzenSkoru < 60)
    return 'Asıl geliştirme alanı düzen tarafı. Çalışma temposu ve görev istikrarı zayıflıyor olabilir.';
  if (summary.mudahaleSkoru < 60)
    return 'Takip ve müdahale tarafı güçlendirilmeli. Son temas sıklığı ve cevap disiplini izlenmeli.';
  if (summary.operasyonSkoru < 55)
    return 'Operasyon sinyalleri düşüyor. Koç giriş ve işlem düzeni ayrıca takip edilmeli.';
  return 'Genel görünüm dengeli. Sonuç ve operasyon tarafı birlikte izlenmeye devam etmeli.';
}

export function computeCoachPerformance(koc, ogrenciler = []) {
  const aktifler = ogrenciler.filter(o => o?.aktif !== false);
  const studentScores = aktifler.map(student => ({
    growth: buildGrowthMetrics(student),
    routine: buildRoutineMetrics(student),
    intervention: buildInterventionMetrics(student),
    student,
  }));
  const operation = buildCoachOperationMetrics(koc, aktifler);
  const growthScore = Math.round(
    average(studentScores.map(i => i.growth.score)) ?? DEFAULT_NEUTRAL_SCORE
  );
  const routineScore = Math.round(
    average(studentScores.map(i => i.routine.score)) ?? DEFAULT_NEUTRAL_SCORE
  );
  const interventionScore = Math.round(
    average(studentScores.map(i => i.intervention.score)) ?? DEFAULT_NEUTRAL_SCORE
  );
  const overallScore = Math.round(
    weightedAverage(
      [
        { score: growthScore, weight: 0.35 },
        { score: routineScore, weight: 0.3 },
        { score: interventionScore, weight: 0.25 },
        { score: operation.score, weight: 0.1 },
      ],
      DEFAULT_NEUTRAL_SCORE
    )
  );

  const eksikBoyutlar = [];
  if (aktifler.every(o => resolveStartNet(o) === null)) eksikBoyutlar.push('baslangicNet');
  if (aktifler.every(o => resolveCompletion(o) === null)) eksikBoyutlar.push('haftalikTamamlama');
  if (aktifler.every(o => resolveCurrentHours(o) === null)) eksikBoyutlar.push('calismaSaat');
  const veriYeterli = eksikBoyutlar.length < 2;

  const meta = coachScoreMeta(overallScore);
  const summary = {
    ...koc,
    ogrenciSayisi: aktifler.length,
    ortTamamlama: Math.round(average(studentScores.map(i => i.routine.completion)) ?? 0),
    raporBekleyen: aktifler.filter(o => o?.veliRaporGerekli).length,
    ortNet: Number((average(aktifler.map(o => resolveCurrentNet(o))) ?? 0).toFixed(1)),
    kalibrasyonSayisi: studentScores.filter(i => i.growth.calibrating).length,
    hedefeYakin: studentScores.filter(
      i => Number.isFinite(i.growth.progressRatio) && i.growth.progressRatio >= 70
    ).length,
    dususYasayan: studentScores.filter(
      i => Number.isFinite(i.growth.trendDelta) && i.growth.trendDelta < 0
    ).length,
    ortPotansiyelKullanimi: Math.round(average(studentScores.map(i => i.routine.studyRatio)) ?? 0),
    gelisimSkoru: growthScore,
    duzenSkoru: routineScore,
    mudahaleSkoru: interventionScore,
    operasyonSkoru: operation.score,
    performansSkoru: overallScore,
    genelSkor: overallScore,
    performansEtiketi: meta.label,
    performansRenk: meta.color,
    performansArkaPlan: meta.bg,
    sonGirisGun: operation.lastLoginDays,
    sonAktiflikGun: operation.lastActiveDays,
    haftalikAktifGun: operation.activeDays,
    bekleyenMesaj: operation.pendingMessagesFromStudents,
  };
  return { ...summary, veriYeterli, eksikBoyutlar, aciklama: buildCoachNarrative(summary) };
}
