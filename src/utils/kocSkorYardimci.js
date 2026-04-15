import { DAY_MS, DEFAULT_NEUTRAL_SCORE } from './kocSkorSabitleri';

export function clamp(value, min = 0, max = 100) {
  const num = Number(value);
  if (!Number.isFinite(num)) return min;
  return Math.min(max, Math.max(min, num));
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== '';
}

export function toNumber(value) {
  if (!hasValue(value)) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export function average(values = []) {
  const cleaned = values.filter(v => Number.isFinite(v));
  if (!cleaned.length) return null;
  return cleaned.reduce((sum, item) => sum + item, 0) / cleaned.length;
}

export function parseDate(value) {
  if (!value) return null;
  if (typeof value?.toDate === 'function') {
    const d = value.toDate();
    return Number.isNaN(d?.getTime?.()) ? null : d;
  }
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'number') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'string') {
    const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
    const d = new Date(normalized);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export function daysSince(value) {
  const date = parseDate(value);
  if (!date) return null;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / DAY_MS));
}

export function weightedAverage(items, fallback = DEFAULT_NEUTRAL_SCORE) {
  const valid = items.filter(
    item => Number.isFinite(item?.score) && Number.isFinite(item?.weight) && item.weight > 0
  );
  if (!valid.length) return fallback;
  const totalWeight = valid.reduce((sum, item) => sum + item.weight, 0);
  if (!totalWeight) return fallback;
  return valid.reduce((sum, item) => sum + item.score * item.weight, 0) / totalWeight;
}

export function resolveNumber(source, keys = []) {
  if (!source) return null;
  for (const key of keys) {
    const value = key
      .split('.')
      .reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), source);
    const num = toNumber(value);
    if (num !== null) return num;
  }
  return null;
}

export function resolveGoalNet(student = {}) {
  const direct = resolveNumber(student, [
    'hedefNet',
    'hedefPuanNet',
    'goalNet',
    'hedefBandi.ust',
    'hedefBandi.max',
    'hedefAralik.ust',
    'hedefAralik.max',
  ]);
  if (direct !== null) return direct;
  const rawBand = student.hedefBandi || student.hedefAralik || student.hedefAraligi || null;
  if (typeof rawBand === 'string') {
    const nums =
      rawBand
        .match(/\d+(?:[.,]\d+)?/g)
        ?.map(item => Number(String(item).replace(',', '.')))
        .filter(Number.isFinite) || [];
    if (nums.length) return Math.max(...nums);
  }
  return null;
}

export function resolveStartNet(student = {}) {
  return resolveNumber(student, ['baslangicNet', 'ilkNet', 'kayitNeti', 'bazNet', 'referansNet']);
}

export function resolveCurrentNet(student = {}) {
  return resolveNumber(student, ['sonDenemeNet', 'mevcutNet', 'guncelNet']);
}

export function resolvePotentialHours(student = {}) {
  return resolveNumber(student, [
    'tahminiPotansiyelSaat',
    'potansiyelSaat',
    'maksimumSaat',
    'beklenenSaat',
  ]);
}

export function resolveCompletion(student = {}) {
  return resolveNumber(student, [
    'haftalikTamamlamaOrani',
    'gorevTamamlama',
    'tamamlamaOrani',
    'duzenSkoru',
  ]);
}

export function resolveCurrentHours(student = {}) {
  const explicit = resolveNumber(student, [
    'ortalamaCalismaSaat',
    'ortalamaCalismaSaati',
    'ortCalismaSaat',
    'son7GunOrtalamaSaat',
    'haftalikOrtalamaSaat',
    'mevcutCalismaSaat',
    'guncelCalismaSaat',
  ]);
  if (explicit !== null) return explicit;
  const expected = resolvePotentialHours(student);
  const completion = resolveCompletion(student);
  if (expected !== null && completion !== null)
    return Number(((expected * completion) / 100).toFixed(1));
  return null;
}

export function isCalibrationStudent(student = {}) {
  const createdAt = parseDate(student.olusturma || student.kayitTarihi || student.createdAt);
  if (!createdAt) return false;
  return Math.floor((Date.now() - createdAt.getTime()) / DAY_MS) < 14;
}
