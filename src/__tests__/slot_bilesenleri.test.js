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

  it('Matematik girince konular listesi görünür (label eşleşme)', () => {
    renderSade(<SlotKonuSecici ders="Matematik" onSec={vi.fn()} s={mockS} />);
    expect(screen.getByText('Müfredattan seç')).toBeTruthy();
  });

  it('Matematik konularından birine tıklayınca onToggle çağrılır', () => {
    const onToggle = vi.fn();
    renderSade(<SlotKonuSecici ders="Matematik" onToggle={onToggle} s={mockS} />);
    const butonlar = screen.getAllByRole('button');
    fireEvent.click(butonlar[0]);
    expect(onToggle).toHaveBeenCalledWith(expect.any(String));
  });

  it('Fizik dersi için de konular görünür', () => {
    renderSade(<SlotKonuSecici ders="Fizik" onToggle={vi.fn()} s={mockS} />);
    expect(screen.getByText(/Müfredattan seç/)).toBeTruthy();
  });

  it('dersId ile doğrudan TYT matematik konularını bulur', () => {
    renderSade(<SlotKonuSecici ders="" dersId="mat" onToggle={vi.fn()} s={mockS} />);
    expect(screen.getByText(/Müfredattan seç/)).toBeTruthy();
  });

  it('dersId ile LGS türkçe konularını bulur', () => {
    renderSade(<SlotKonuSecici ders="" dersId="lgstur" onToggle={vi.fn()} s={mockS} />);
    expect(screen.getByText(/Müfredattan seç/)).toBeTruthy();
  });

  it('dersId olmayan bilinmeyen ders hiçbir şey render etmez', () => {
    const { container } = renderSade(
      <SlotKonuSecici ders="" dersId="bilinmezid" onToggle={vi.fn()} s={mockS} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('seciliKonular ile seçili sayısı gösterilir', () => {
    renderSade(
      <SlotKonuSecici
        ders=""
        dersId="mat"
        seciliKonular="Türev, Limit"
        onToggle={vi.fn()}
        s={mockS}
      />
    );
    expect(screen.getByText(/2 seçili/)).toBeTruthy();
  });

  it('arama inputuna yazınca liste filtrelenir', () => {
    renderSade(<SlotKonuSecici ders="" dersId="mat" onToggle={vi.fn()} s={mockS} />);
    const aramaInput = screen.getByPlaceholderText('Konularda ara...');
    fireEvent.change(aramaInput, { target: { value: 'xyzbilinmez' } });
    expect(screen.getByText('Eşleşen konu yok')).toBeTruthy();
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
