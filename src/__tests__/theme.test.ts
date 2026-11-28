import { Basis, Kochwelten, STANDARD_KOCHWELT } from '@/constants/theme';
import { kontrast, leuchtdichte } from '@/lib/kontrast';

describe('Kontrastberechnung', () => {
  it('liefert 21 für Schwarz auf Weiß', () => {
    expect(kontrast('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
  });

  it('ist unabhängig von der Reihenfolge', () => {
    expect(kontrast('#1F5C70', '#FAF6F0')).toBeCloseTo(kontrast('#FAF6F0', '#1F5C70'), 10);
  });

  it('lehnt ungültige Farben ab', () => {
    expect(() => leuchtdichte('blau')).toThrow();
  });
});

describe('Farben des Entwurfs (S1-2, S8-1)', () => {
  it('nutzt den Kürbis als Standard', () => {
    expect(STANDARD_KOCHWELT.id).toBe('kuerbis-1');
    expect(STANDARD_KOCHWELT.primaer).toBe('#1F5C70');
    expect(STANDARD_KOCHWELT.akzent).toBe('#D2691E');
  });

  it('hat für Fließtext mindestens Kontrast 4,5', () => {
    expect(kontrast(Basis.text, Basis.hintergrund)).toBeGreaterThanOrEqual(4.5);
    expect(kontrast(Basis.text, Basis.flaeche)).toBeGreaterThanOrEqual(4.5);
    expect(kontrast(Basis.textGedaempft, Basis.hintergrund)).toBeGreaterThanOrEqual(4.5);
    expect(kontrast(Basis.textGedaempft, Basis.flaeche)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(Object.values(Kochwelten))('hält in der Kochwelt $name die Kontraste ein', (welt) => {
    expect(kontrast(welt.aufPrimaer, welt.primaer)).toBeGreaterThanOrEqual(4.5);
    expect(kontrast(welt.primaer, Basis.hintergrund)).toBeGreaterThanOrEqual(4.5);
    expect(kontrast(Basis.text, welt.ton)).toBeGreaterThanOrEqual(4.5);
    expect(kontrast(welt.primaer, welt.ton)).toBeGreaterThanOrEqual(4.5);
    // Der Schriftzug ist großer Text, dafür reicht 3.
    expect(kontrast(welt.akzent, Basis.hintergrund)).toBeGreaterThanOrEqual(3);
  });
});
