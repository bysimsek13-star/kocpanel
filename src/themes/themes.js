/**
 * ElsWay – 6 Tema Sistemi
 *
 * Yeni tema eklemek için:
 *   1. Bu dosyaya yeni bir obje ekle (token yapısına uy).
 *   2. TEMA_LISTESI dizisine id / label / accent ekle.
 *   3. Başka dosyaya dokunmana gerek yok.
 */

/** Hex rengi "r,g,b" formatına çevirir (glow shadow için) */
function hexRgb(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r},${g},${b}`;
}

/**
 * Ham token objesi → bileşenlerin kullandığı tam `s` objesine dönüştür.
 * Eski property adları (text2, text3, ok, uyari, tehlika, bilgi …) korunur.
 */
function buildS(t) {
  const softOpacity = (hex, alpha) => {
    const rgb = hexRgb(hex);
    return `rgba(${rgb},${alpha})`;
  };

  return {
    /* ── Yeni semantic tokenlar ── */
    bg: t.bg,
    bgSecondary: t.bgSecondary,
    surface: t.surface,
    surfaceSoft: t.surfaceSoft,
    card: t.card,
    cardHover: t.cardHover,
    border: t.border,
    borderSoft: t.borderSoft,
    text: t.text,
    textSecondary: t.textSecondary,
    textMuted: t.textMuted,
    primary: t.primary,
    primaryHover: t.primaryHover,
    primarySoft: t.primarySoft,
    accent: t.accent,
    success: t.success,
    warning: t.warning,
    danger: t.danger,
    info: t.info,
    sidebarBg: t.sidebarBg,
    sidebarItem: t.sidebarItem,
    sidebarItemActive: t.sidebarItemActive,
    sidebarText: t.sidebarText,
    inputBg: t.inputBg,
    inputBorder: t.inputBorder,
    inputFocus: t.inputFocus,
    buttonText: t.buttonText,
    shadow: `0 2px 12px ${t.shadow}`,
    chart1: t.chart1,
    chart2: t.chart2,
    chart3: t.chart3,
    chart4: t.chart4,
    chart5: t.chart5,

    /* ── Eski property adları (backward compat) ── */
    text2: t.textSecondary,
    text3: t.textMuted,
    surface2: t.bgSecondary,
    surface3: t.borderSoft,
    yardimci: t.borderSoft,

    /* Status (eski Türkçe adlar) */
    ok: t.success,
    okSoft: softOpacity(t.success, 0.14),
    uyari: t.warning,
    uyariSoft: softOpacity(t.warning, 0.14),
    tehlika: t.danger,
    tehlikaSoft: softOpacity(t.danger, 0.12),
    bilgi: t.info,
    bilgiSoft: softOpacity(t.info, 0.12),

    /* Chart aliases */
    chartPos: t.chart3,
    chartNeg: t.danger,
    chartNeu: t.chart5,
    chartBar: t.chart1,

    /* Sidebar / TopBar aliases */
    topBarBg: t.sidebarBg,
    topBarFg: t.sidebarText,
    topBarMuted: softOpacity(t.sidebarText, 0.65),
    topBarBorder: softOpacity(t.sidebarText, 0.14),
    topBarTemaBg: softOpacity(t.sidebarText, 0.1),
    topBarTemaActiveBg: softOpacity(t.sidebarText, 0.2),
    topBarTemaFg: t.sidebarText,
    topBarTemaFgMuted: softOpacity(t.sidebarText, 0.55),

    /* Brand / Logo */
    brandEls: t.primary,
    brandWay: t.accent,
    brandWayOnLight: t.accent,
    logoEls: t.accent,
    logoWay: t.primarySoft,
    logoFrameGradient: `linear-gradient(135deg, ${t.primary} 0%, ${t.accent} 50%, ${t.info} 100%)`,

    /* Gradients */
    accentGrad: `linear-gradient(135deg, ${t.primary}, ${t.accent})`,
    accentSoft: t.primarySoft,
    glowRgb: hexRgb(t.primary),

    /* Hero section */
    heroGrad: `linear-gradient(135deg, ${t.primary}, ${t.accent})`,
    heroSurface: `linear-gradient(168deg, ${t.bgSecondary} 0%, ${t.bg} 50%, ${t.surfaceSoft} 100%)`,
    heroTitle: t.text,
    heroMuted: t.textSecondary,
    heroStatBg: t.primarySoft,

    /* Shadow variants */
    shadowCard: `0 1px 3px ${t.shadow}, 0 8px 24px ${t.shadow}`,
    shadowHover: `0 6px 20px ${t.shadow}`,
  };
}

/* ────────────────────────────────────────────────
   6 Tema Tanımları
──────────────────────────────────────────────── */

const rawThemes = {
  academicBlue: {
    bg: '#F3F7FD',
    bgSecondary: '#EAF1FB',
    surface: '#FFFFFF',
    surfaceSoft: '#F8FBFF',
    card: '#FFFFFF',
    cardHover: '#F4F8FF',
    border: '#D6E4F5',
    borderSoft: '#E7EEF8',
    text: '#1E2A3A',
    textSecondary: '#5B6B7F',
    textMuted: '#8A97A8',
    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    primarySoft: '#DBEAFE',
    accent: '#60A5FA',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#38BDF8',
    sidebarBg: '#163B73',
    sidebarItem: '#214A8A',
    sidebarItemActive: '#2B63B8',
    sidebarText: '#F8FBFF',
    inputBg: '#FFFFFF',
    inputBorder: '#D4E1F2',
    inputFocus: '#60A5FA',
    buttonText: '#FFFFFF',
    shadow: 'rgba(37,99,235,0.10)',
    chart1: '#2563EB',
    chart2: '#60A5FA',
    chart3: '#22C55E',
    chart4: '#F59E0B',
    chart5: '#A78BFA',
  },

  softIndigo: {
    bg: '#F6F5FF',
    bgSecondary: '#EEEAFE',
    surface: '#FFFFFF',
    surfaceSoft: '#FAF8FF',
    card: '#FFFFFF',
    cardHover: '#F3F0FF',
    border: '#DDD6FE',
    borderSoft: '#ECE9FE',
    text: '#2A2340',
    textSecondary: '#665F80',
    textMuted: '#948DAF',
    primary: '#7C3AED',
    primaryHover: '#6D28D9',
    primarySoft: '#EDE9FE',
    accent: '#A78BFA',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#60A5FA',
    sidebarBg: '#312E81',
    sidebarItem: '#4338CA',
    sidebarItemActive: '#5B4FE1',
    sidebarText: '#F8F7FF',
    inputBg: '#FFFFFF',
    inputBorder: '#DDD6FE',
    inputFocus: '#A78BFA',
    buttonText: '#FFFFFF',
    shadow: 'rgba(124,58,237,0.10)',
    chart1: '#7C3AED',
    chart2: '#A78BFA',
    chart3: '#60A5FA',
    chart4: '#22C55E',
    chart5: '#F59E0B',
  },

  calmTeal: {
    bg: '#F1FBFA',
    bgSecondary: '#E3F7F5',
    surface: '#FFFFFF',
    surfaceSoft: '#F7FCFB',
    card: '#FFFFFF',
    cardHover: '#EFFAF8',
    border: '#CBEAE5',
    borderSoft: '#DDF3EF',
    text: '#1E3130',
    textSecondary: '#59716D',
    textMuted: '#7E9692',
    primary: '#0F766E',
    primaryHover: '#0D5E58',
    primarySoft: '#CCFBF1',
    accent: '#2DD4BF',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#38BDF8',
    sidebarBg: '#115E59',
    sidebarItem: '#0F766E',
    sidebarItemActive: '#149287',
    sidebarText: '#F3FFFD',
    inputBg: '#FFFFFF',
    inputBorder: '#CBEAE5',
    inputFocus: '#2DD4BF',
    buttonText: '#FFFFFF',
    shadow: 'rgba(15,118,110,0.10)',
    chart1: '#0F766E',
    chart2: '#2DD4BF',
    chart3: '#60A5FA',
    chart4: '#F59E0B',
    chart5: '#F472B6',
  },

  warmAmber: {
    bg: '#FFF8F1',
    bgSecondary: '#FDF1E3',
    surface: '#FFFFFF',
    surfaceSoft: '#FFFDF9',
    card: '#FFFFFF',
    cardHover: '#FFF6EA',
    border: '#F3DEC2',
    borderSoft: '#F8E8D4',
    text: '#3A2A1E',
    textSecondary: '#7A624B',
    textMuted: '#A0876F',
    primary: '#F97316',
    primaryHover: '#EA580C',
    primarySoft: '#FFEDD5',
    accent: '#FDBA74',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#60A5FA',
    sidebarBg: '#7C3A0A',
    sidebarItem: '#9A4E15',
    sidebarItemActive: '#C66A1A',
    sidebarText: '#FFF9F4',
    inputBg: '#FFFFFF',
    inputBorder: '#F1D8B5',
    inputFocus: '#FDBA74',
    buttonText: '#FFFFFF',
    shadow: 'rgba(249,115,22,0.10)',
    chart1: '#F97316',
    chart2: '#FDBA74',
    chart3: '#60A5FA',
    chart4: '#22C55E',
    chart5: '#F472B6',
  },

  freshMint: {
    bg: '#F2FBF7',
    bgSecondary: '#E5F7EE',
    surface: '#FFFFFF',
    surfaceSoft: '#F8FCFA',
    card: '#FFFFFF',
    cardHover: '#EFFAF4',
    border: '#CFE8DA',
    borderSoft: '#E1F2E8',
    text: '#1F3128',
    textSecondary: '#5D7467',
    textMuted: '#8AA091',
    primary: '#16A34A',
    primaryHover: '#15803D',
    primarySoft: '#DCFCE7',
    accent: '#86EFAC',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#38BDF8',
    sidebarBg: '#14532D',
    sidebarItem: '#166534',
    sidebarItemActive: '#1F8A47',
    sidebarText: '#F5FFF8',
    inputBg: '#FFFFFF',
    inputBorder: '#CFE8DA',
    inputFocus: '#86EFAC',
    buttonText: '#FFFFFF',
    shadow: 'rgba(22,163,74,0.10)',
    chart1: '#16A34A',
    chart2: '#86EFAC',
    chart3: '#60A5FA',
    chart4: '#F59E0B',
    chart5: '#A78BFA',
  },

  cleanLight: {
    bg: '#F8FAFC',
    bgSecondary: '#F1F5F9',
    surface: '#FFFFFF',
    surfaceSoft: '#F8FBFF',
    card: '#FFFFFF',
    cardHover: '#F3F8FF',
    border: '#D9E2EC',
    borderSoft: '#E8EEF5',
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#7B8794',
    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    primarySoft: '#E2EFFF',
    accent: '#06B6D4',
    success: '#16A34A',
    warning: '#D97706',
    danger: '#DC2626',
    info: '#38BDF8',
    sidebarBg: '#E2ECF8',
    sidebarItem: '#CFDDF0',
    sidebarItemActive: '#B8CEEA',
    sidebarText: '#1E293B',
    inputBg: '#FFFFFF',
    inputBorder: '#D5DFEA',
    inputFocus: '#93C5FD',
    buttonText: '#FFFFFF',
    shadow: 'rgba(37,99,235,0.08)',
    chart1: '#2563EB',
    chart2: '#06B6D4',
    chart3: '#16A34A',
    chart4: '#F59E0B',
    chart5: '#A855F7',
  },
};

/** Tüm temaları hazır `s` objelerine dönüştür */
export const TEMALAR = Object.fromEntries(
  Object.entries(rawThemes).map(([id, raw]) => [id, buildS(raw)])
);

/** UI'da gösterilecek tema listesi */
export const TEMA_LISTESI = [
  { id: 'academicBlue', label: 'Yaban Mersini', accent: '#2563EB' },
  { id: 'softIndigo', label: 'Mürdüm Erik', accent: '#7C3AED' },
  { id: 'calmTeal', label: 'Avokado', accent: '#0F766E' },
  { id: 'warmAmber', label: 'Bal Kabağı', accent: '#F97316' },
  { id: 'freshMint', label: 'Yeşil Elma', accent: '#16A34A' },
  { id: 'cleanLight', label: 'Hindistan Cevizi', accent: '#06B6D4' },
];

export const VARSAYILAN_TEMA = 'academicBlue';
