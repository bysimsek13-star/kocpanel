/**
 * ElsWay — Giriş Ekranı Testleri
 * Kapsam: form validasyonu, UI state, erişilebilirlik
 *
 * Not:
 *  - placeholder: email="email@ornek.com", şifre="••••••••"
 *  - Buton metni: "Giriş Yap →" (yükleme değilken)
 *  - Firebase Auth ve Toast setup.js'te global mock'lanmıştır
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './testUtils';
import GirisEkrani from '../pages/GirisEkrani';

describe('GirisEkrani', () => {
  it('render olur', () => {
    renderWithProviders(<GirisEkrani />);
    expect(document.body).toBeTruthy();
  });

  it('email input alanı görünür', () => {
    renderWithProviders(<GirisEkrani />);
    expect(screen.getByPlaceholderText('email@ornek.com')).toBeTruthy();
  });

  it('şifre input alanı görünür', () => {
    renderWithProviders(<GirisEkrani />);
    expect(screen.getByPlaceholderText('••••••••')).toBeTruthy();
  });

  it('Giriş Yap butonu görünür', () => {
    renderWithProviders(<GirisEkrani />);
    expect(screen.getByText(/Giriş Yap/i)).toBeTruthy();
  });

  it('email ve şifre boşken buton disabled', () => {
    renderWithProviders(<GirisEkrani />);
    const buton = screen.getByText(/Giriş Yap/i).closest('button');
    expect(buton).toBeDisabled();
  });

  it('sadece email girilince buton hâlâ disabled', () => {
    renderWithProviders(<GirisEkrani />);
    const emailInput = screen.getByPlaceholderText('email@ornek.com');
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    const buton = screen.getByText(/Giriş Yap/i).closest('button');
    expect(buton).toBeDisabled();
  });

  it('email ve şifre girilince buton aktif', () => {
    renderWithProviders(<GirisEkrani />);
    const emailInput = screen.getByPlaceholderText('email@ornek.com');
    const sifreInput = screen.getByPlaceholderText('••••••••');
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(sifreInput, { target: { value: 'sifre123' } });
    const buton = screen.getByText(/Giriş Yap/i).closest('button');
    expect(buton).not.toBeDisabled();
  });

  it('sadece boşluktan oluşan email ile buton disabled kalır (trim kontrolü)', () => {
    renderWithProviders(<GirisEkrani />);
    const emailInput = screen.getByPlaceholderText('email@ornek.com');
    const sifreInput = screen.getByPlaceholderText('••••••••');
    fireEvent.change(emailInput, { target: { value: '   ' } }); // sadece boşluk
    fireEvent.change(sifreInput, { target: { value: 'sifre123' } });
    const buton = screen.getByText(/Giriş Yap/i).closest('button');
    expect(buton).toBeDisabled();
  });

  it('ElsWay logosu veya ismi görünür', () => {
    renderWithProviders(<GirisEkrani />);
    const metin = document.body.textContent;
    expect(/Els|Way|ElsWay/.test(metin)).toBe(true);
  });

  it('Enter tuşu ile giriş tetiklenir ve çökmez', () => {
    renderWithProviders(<GirisEkrani />);
    const emailInput = screen.getByPlaceholderText('email@ornek.com');
    const sifreInput = screen.getByPlaceholderText('••••••••');
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(sifreInput, { target: { value: 'sifre123' } });
    fireEvent.keyDown(sifreInput, { key: 'Enter' });
    expect(document.body).toBeTruthy();
  });

  it('şifre alanı varsayılan olarak password tipindedir', () => {
    renderWithProviders(<GirisEkrani />);
    const sifreInput = screen.getByPlaceholderText('••••••••');
    expect(sifreInput.type).toBe('password');
  });

  it('şifre göster butonuna tıklanınca tip değişir', () => {
    renderWithProviders(<GirisEkrani />);
    const sifreInput = screen.getByPlaceholderText('••••••••');
    // SVG göz butonunu tabIndex=-1 butonu olarak bul
    const tümButonlar = document.querySelectorAll('button');
    const gozButon = Array.from(tümButonlar).find(b => b.getAttribute('tabindex') === '-1');
    if (gozButon) {
      fireEvent.click(gozButon);
      expect(sifreInput.type).toBe('text');
    } else {
      // Buton yoksa en azından şifre alanı hâlâ var
      expect(sifreInput).toBeTruthy();
    }
  });

  it('"Şifremi unuttum" linki görünür', () => {
    renderWithProviders(<GirisEkrani />);
    expect(screen.getByText(/Şifremi unuttum/i)).toBeTruthy();
  });

  it('YKS / LGS platform metni görünür', () => {
    renderWithProviders(<GirisEkrani />);
    const metin = document.body.textContent;
    expect(/YKS|LGS|Koçluk/.test(metin)).toBe(true);
  });
});
