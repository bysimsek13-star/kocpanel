import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

/**
 * Tüm provider'ları saran render yardımcısı.
 * ThemeContext ve AuthContext setup.js'te vi.mock ile global olarak taklit edilir.
 */
export function renderWithProviders(ui, { route = '/' } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
}

/**
 * Router gerektirmeyen bileşenler için sade render.
 */
export function renderSade(ui) {
  return render(ui);
}

/**
 * Tema bağlamı gerektiren bileşenler için render yardımcısı.
 * ThemeContext setup.js'te global olarak mock'landığından renderWithProviders ile aynıdır.
 */
export function renderWithTheme(ui, options = {}) {
  return renderWithProviders(ui, options);
}

/**
 * Mock s (tema stili) objesi — prop olarak geçen bileşenler için.
 */
export const mockS = new Proxy(
  {},
  {
    get: (_, prop) => {
      if (typeof prop !== 'string') return '#cccccc';
      if (prop === 'shadow' || prop === 'shadowCard') return '0 2px 8px rgba(0,0,0,0.1)';
      return '#cccccc';
    },
  }
);
