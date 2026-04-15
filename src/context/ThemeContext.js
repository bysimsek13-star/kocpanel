import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { TEMALAR, TEMA_LISTESI, VARSAYILAN_TEMA } from '../themes/themes';

const LS_KEY = 'elswayTema';

/** Geçerli bir tema id'si mi? */
function gecerliTema(id) {
  return TEMA_LISTESI.some(t => t.id === id);
}

/** localStorage'dan tema oku */
function temaOku() {
  try {
    const kayit = localStorage.getItem(LS_KEY);
    if (gecerliTema(kayit)) return kayit;
  } catch {
    /* empty */
  }
  return VARSAYILAN_TEMA;
}

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [temaId, setTemaId] = useState(temaOku);

  const setTema = useCallback(yeni => {
    if (!gecerliTema(yeni)) return;
    setTemaId(yeni);
    try {
      localStorage.setItem(LS_KEY, yeni);
    } catch {
      /* empty */
    }
  }, []);

  const s = useMemo(() => TEMALAR[temaId] ?? TEMALAR[VARSAYILAN_TEMA], [temaId]);

  useEffect(() => {
    document.body.style.background = s.bg;
    document.body.style.color = s.text;
    document.body.style.transition = 'background 0.35s ease, color 0.35s ease';
  }, [s.bg, s.text]);

  const value = useMemo(
    () => ({
      /* Yeni API */
      temaId,
      setTema,
      s,
      temaListesi: TEMA_LISTESI,

      /* Eski API – geriye dönük uyumluluk */
      tema: 'light',
      tercih: temaId,
      paletId: temaId,
      setPaletId: setTema,
      gunlukPalet: temaId,
      setGunlukPalet: setTema,
    }),
    [temaId, setTema, s]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

/** Eski import uyumluluğu: getS, geceMi */
export function getS(temaIdOrMode) {
  if (gecerliTema(temaIdOrMode)) return TEMALAR[temaIdOrMode];
  return TEMALAR[VARSAYILAN_TEMA];
}
export function geceMi() {
  return false;
}
