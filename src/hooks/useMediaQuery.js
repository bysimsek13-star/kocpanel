import { useState, useEffect } from 'react';

export function useMobil() {
  const [mobil, setMobil] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setMobil(window.innerWidth < 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobil;
}

export function useTablet() {
  const [tablet, setTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1100);
  useEffect(() => {
    const fn = () => setTablet(window.innerWidth >= 768 && window.innerWidth < 1100);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return tablet;
}

// Cihaz tipini tek seferde döner: 'mobil' | 'tablet' | 'desktop'
export function useEkran() {
  const [ekran, setEkran] = useState(() => {
    const w = window.innerWidth;
    return w < 768 ? 'mobil' : w < 1100 ? 'tablet' : 'desktop';
  });
  useEffect(() => {
    const fn = () => {
      const w = window.innerWidth;
      setEkran(w < 768 ? 'mobil' : w < 1100 ? 'tablet' : 'desktop');
    };
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return ekran;
}
