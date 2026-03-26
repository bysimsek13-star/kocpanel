import { useState, useEffect } from 'react';

export const renkler = ['#5B4FE8','#10B981','#F43F5E','#F59E0B','#3B82F6','#EC4899'];

export const TYT_DERSLER = [
  {id:'tur',label:'Türkçe',toplam:40,renk:'#F59E0B'},
  {id:'mat',label:'Temel Matematik',toplam:40,renk:'#5B4FE8'},
  {id:'fen',label:'Fen Bilimleri',toplam:20,renk:'#10B981'},
  {id:'sos',label:'Sosyal Bilimler',toplam:20,renk:'#F43F5E'}
];

export const AYT_DERSLER = [
  {id:'mat',label:'Matematik',toplam:30,renk:'#5B4FE8'},
  {id:'fiz',label:'Fizik',toplam:14,renk:'#3B82F6'},
  {id:'kim',label:'Kimya',toplam:13,renk:'#10B981'},
  {id:'biy',label:'Biyoloji',toplam:13,renk:'#EC4899'},
  {id:'ede',label:'Edebiyat',toplam:24,renk:'#F59E0B'},
  {id:'tar',label:'Tarih',toplam:10,renk:'#F43F5E'},
  {id:'cog',label:'Coğrafya',toplam:6,renk:'#8B5CF6'}
];

export function netHesapla(d, y) {
  return Math.max(0, d - (y / 4)).toFixed(2);
}

export function verimlilikHesapla(c, b, g) {
  if (b === 0) return 0;
  const o = Math.min(c / b, 1.5);
  return Math.min(Math.round(((o + g / 100) / 2) * 100), 100);
}

export function verimlilikDurum(v) {
  if (v <= 20) return { emoji: '🔴', label: 'Çalışmadı', renk: '#F43F5E' };
  if (v <= 40) return { emoji: '🟠', label: 'Yetersiz', renk: '#F97316' };
  if (v <= 60) return { emoji: '🟡', label: 'Orta', renk: '#F59E0B' };
  if (v <= 80) return { emoji: '🟢', label: 'İyi', renk: '#10B981' };
  return { emoji: '💎', label: 'Mükemmel', renk: '#5B4FE8' };
}

function getTemaOtomatik() {
  const saat = new Date().getHours();
  return (saat >= 21 || saat < 9) ? 'dark' : 'light';
}

export function useTheme() {
  const [tercih, setTercih] = useState(() => {
    try { return localStorage.getItem('elswayTema') || 'otomatik'; } catch (e) { return 'otomatik'; }
  });
  const [otomatikTema, setOtomatikTema] = useState(getTemaOtomatik());

  useEffect(() => {
    const interval = setInterval(() => setOtomatikTema(getTemaOtomatik()), 60000);
    return () => clearInterval(interval);
  }, []);

  const tema = tercih === 'otomatik' ? otomatikTema : tercih;
  const setTema = (yeni) => {
    setTercih(yeni);
    try { localStorage.setItem('elswayTema', yeni); } catch (e) {}
  };
  return { tema, tercih, setTema };
}

export function getS(tema) {
  if (tema === 'dark') return {
    bg: '#0F0F1A', surface: '#1A1A2E', surface2: '#242438', surface3: '#2E2E48',
    border: '#333355', accent: '#5B4FE8', accentSoft: 'rgba(91,79,232,0.15)',
    accentGrad: 'linear-gradient(135deg, #5B4FE8, #8B7FF5)',
    text: '#F0F0FF', text2: '#9999BB', text3: '#555577',
    shadow: '0 4px 20px rgba(0,0,0,0.4)',
  };
  return {
    bg: '#F4F3FF', surface: '#FFFFFF', surface2: '#F8F7FF', surface3: '#EEECff',
    border: '#E5E3FF', accent: '#5B4FE8', accentSoft: 'rgba(91,79,232,0.1)',
    accentGrad: 'linear-gradient(135deg, #5B4FE8, #8B7FF5)',
    text: '#1A1730', text2: '#6B6785', text3: '#B0ADCC',
    shadow: '0 4px 20px rgba(91,79,232,0.08)',
  };
}
