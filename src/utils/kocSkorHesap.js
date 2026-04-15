import { DEFAULT_NEUTRAL_SCORE } from './kocSkorSabitleri';
import {
  clamp,
  weightedAverage,
  resolveNumber,
  resolveGoalNet,
  resolveStartNet,
  resolveCurrentNet,
  resolvePotentialHours,
  resolveCompletion,
  resolveCurrentHours,
  isCalibrationStudent,
  daysSince,
} from './kocSkorYardimci';

export function scoreByThresholds(value, thresholds, fallback = DEFAULT_NEUTRAL_SCORE) {
  if (!Number.isFinite(value)) return fallback;
  for (const item of thresholds) {
    if (value >= item.min) return item.score;
  }
  return thresholds[thresholds.length - 1]?.score ?? fallback;
}

export function scoreRecency(
  days,
  goodDays,
  warnDays,
  dangerDays,
  fallback = DEFAULT_NEUTRAL_SCORE
) {
  if (!Number.isFinite(days)) return fallback;
  if (days <= goodDays) return 92;
  if (days <= warnDays) return 74;
  if (days <= dangerDays) return 48;
  return 18;
}

function scoreProgressRatio(ratio, fallback = DEFAULT_NEUTRAL_SCORE) {
  if (!Number.isFinite(ratio)) return fallback;
  return scoreByThresholds(
    ratio,
    [
      { min: 100, score: 100 },
      { min: 80, score: 92 },
      { min: 60, score: 82 },
      { min: 40, score: 70 },
      { min: 20, score: 58 },
      { min: 0, score: 46 },
      { min: -Infinity, score: 18 },
    ],
    fallback
  );
}

function scoreTrend(delta, fallback = DEFAULT_NEUTRAL_SCORE) {
  if (!Number.isFinite(delta)) return fallback;
  return scoreByThresholds(
    delta,
    [
      { min: 10, score: 95 },
      { min: 5, score: 84 },
      { min: 1, score: 74 },
      { min: -1, score: 62 },
      { min: -5, score: 42 },
      { min: -Infinity, score: 20 },
    ],
    fallback
  );
}

function resolveTrendDelta(student = {}) {
  const explicit = resolveNumber(student, [
    'netDegisim',
    'sonUcDenemeTrend',
    'trendDegisimi',
    'denemeTrendDegisim',
  ]);
  if (explicit !== null) return explicit;
  const current = resolveCurrentNet(student);
  const start = resolveStartNet(student);
  if (current !== null && start !== null) return current - start;
  return null;
}

export function buildGrowthMetrics(student = {}) {
  const calibrating = isCalibrationStudent(student);
  const startNet = resolveStartNet(student);
  const goalNet = resolveGoalNet(student);
  const currentNet = resolveCurrentNet(student);
  const trendDelta = resolveTrendDelta(student);
  const weakSubjectRecovery = resolveNumber(student, [
    'zayifDersToparlanma',
    'dersToparlanmaSkoru',
    'zayifAlanToparlanma',
  ]);
  const progressRatio =
    startNet !== null && goalNet !== null && currentNet !== null && goalNet > startNet
      ? clamp(((currentNet - startNet) / (goalNet - startNet)) * 100, -100, 140)
      : null;
  const growthScore = weightedAverage(
    [
      { score: scoreProgressRatio(progressRatio), weight: 0.55 },
      { score: scoreTrend(trendDelta), weight: 0.25 },
      { score: clamp(weakSubjectRecovery, 0, 100), weight: 0.2 },
    ],
    calibrating ? 68 : DEFAULT_NEUTRAL_SCORE
  );
  return {
    score: Math.round(growthScore),
    progressRatio: progressRatio !== null ? Math.round(progressRatio) : null,
    startNet,
    currentNet,
    goalNet,
    trendDelta,
    calibrating,
  };
}

export function buildRoutineMetrics(student = {}) {
  const calibrating = isCalibrationStudent(student);
  const completion = resolveCompletion(student);
  const currentHours = resolveCurrentHours(student);
  const potentialHours = resolvePotentialHours(student);
  const routineKeepScore = resolveNumber(student, [
    'duzenSkoru',
    'istikrarSkoru',
    'duzenKorumaSkoru',
  ]);
  const studyRatio =
    currentHours !== null && potentialHours !== null && potentialHours > 0
      ? clamp((currentHours / potentialHours) * 100, 0, 130)
      : null;
  const routineScore = weightedAverage(
    [
      { score: clamp(completion, 0, 100), weight: 0.4 },
      { score: scoreProgressRatio(studyRatio), weight: 0.35 },
      { score: clamp(routineKeepScore, 0, 100), weight: 0.25 },
    ],
    calibrating ? 68 : DEFAULT_NEUTRAL_SCORE
  );
  return {
    score: Math.round(routineScore),
    completion: completion !== null ? Math.round(completion) : null,
    studyRatio: studyRatio !== null ? Math.round(studyRatio) : null,
    currentHours,
    potentialHours,
    calibrating,
  };
}

export function buildInterventionMetrics(student = {}) {
  const calibrating = isCalibrationStudent(student);
  const lastContactDays = daysSince(
    student.sonTemasTarihi ||
      student.sonMesajTarihi ||
      student.sonKocMesaji ||
      student.sonGorusmeTarihi ||
      student.sonProgramGuncelleme ||
      student.sonNotGuncelleme
  );
  const responseHours = resolveNumber(student, [
    'ortalamaMesajDonusSuresiSaat',
    'ortalamaYanıtSuresiSaat',
    'ortalamaCevapSuresiSaat',
  ]);
  const unanswered = resolveNumber(student, [
    'cevaplanmayanMesajSayisi',
    'bekleyenMesajSayisi',
    'gecikenMesajSayisi',
  ]);
  const updateDiscipline = resolveNumber(student, [
    'guncellemeDisiplini',
    'takipDisiplini',
    'programTakipSkoru',
  ]);
  const responseScore =
    responseHours === null
      ? DEFAULT_NEUTRAL_SCORE
      : scoreByThresholds(
          -responseHours,
          [
            { min: -6, score: 96 },
            { min: -12, score: 84 },
            { min: -24, score: 68 },
            { min: -48, score: 44 },
            { min: -Infinity, score: 20 },
          ],
          DEFAULT_NEUTRAL_SCORE
        );
  const unansweredScore =
    unanswered === null
      ? DEFAULT_NEUTRAL_SCORE
      : scoreByThresholds(
          -unanswered,
          [
            { min: 0, score: 92 },
            { min: -1, score: 74 },
            { min: -3, score: 48 },
            { min: -Infinity, score: 22 },
          ],
          DEFAULT_NEUTRAL_SCORE
        );
  const interventionScore = weightedAverage(
    [
      { score: scoreRecency(lastContactDays, 2, 5, 10), weight: 0.4 },
      { score: responseScore, weight: 0.3 },
      { score: unansweredScore, weight: 0.15 },
      { score: clamp(updateDiscipline, 0, 100), weight: 0.15 },
    ],
    calibrating ? 70 : DEFAULT_NEUTRAL_SCORE
  );
  return {
    score: Math.round(interventionScore),
    lastContactDays,
    responseHours,
    unanswered,
    calibrating,
  };
}
