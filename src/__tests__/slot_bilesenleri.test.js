/**
 * SlotKonuSecici ve SlotTipSecici render + davranış testleri
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderSade, mockS } from './testUtils';

import SlotKonuSecici from '../koc/SlotKonuSecici';
import SlotTipSecici from '../koc/SlotTipSecici';

// ─── SlotKonuSecici ───────────────────────────────────────────────────────────

describe('SlotKonuSecici', () => {
  it('ders boşken hiçbir şey render etmez', () => {
    const { container } = renderSade(<SlotKonuSecici ders="" onSec={vi.fn()} s={mockS} />);
    expect(container.firstChild).toBeNull();
  });

  it('eşleşmeyen ders için hiçbir şey render etmez', () => {
    const { container } = renderSade(
      <SlotKonuSecici ders="xyzbilinmezders" onSec={vi.fn()} s={mockS} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('Matematik girince konular listesi görünür', () => {
    renderSade(<SlotKonuSecici ders="Matematik" onSec={vi.fn()} s={mockS} />);
    expect(screen.getByText('Müfredattan seç')).toBeTruthy();
  });

  it('Matematik konularından birine tıklayınca onSec çağrılır', () => {
    const onSec = vi.fn();
    renderSade(<SlotKonuSecici ders="Matematik" onSec={onSec} s={mockS} />);
    const butonlar = screen.getAllByRole('button');
    fireEvent.click(butonlar[0]);
    expect(onSec).toHaveBeenCalledWith(expect.any(String));
  });

  it('Fizik dersi için de konular görünür', () => {
    renderSade(<SlotKonuSecici ders="Fizik" onSec={vi.fn()} s={mockS} />);
    expect(screen.getByText('Müfredattan seç')).toBeTruthy();
  });
});

// ─── SlotTipSecici ────────────────────────────────────────────────────────────

describe('SlotTipSecici', () => {
  it('aktivite türü seçenekleri render edilir', () => {
    renderSade(<SlotTipSecici secilenTip={null} onChange={vi.fn()} s={mockS} />);
    expect(screen.getByText('Aktivite Türü')).toBeTruthy();
  });

  it('bir tipe tıklayınca onChange çağrılır', () => {
    const onChange = vi.fn();
    renderSade(<SlotTipSecici secilenTip={null} onChange={onChange} s={mockS} />);
    const butonlar = screen.getAllByRole('generic').filter(el => el.style?.cursor === 'pointer');
    fireEvent.click(butonlar[0]);
    expect(onChange).toHaveBeenCalledWith(expect.any(String));
  });

  it('seçili tip vurgulanmış olarak render edilir', () => {
    renderSade(<SlotTipSecici secilenTip="etut" onChange={vi.fn()} s={mockS} />);
    expect(screen.getByText('Aktivite Türü')).toBeTruthy();
  });
});
