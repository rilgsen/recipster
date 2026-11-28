import { darfFunktion, FUNKTIONEN } from '@/lib/funktionen';

describe('Funktionsschranke', () => {
  it('gibt in der ersten Version jede Funktion frei', () => {
    expect(FUNKTIONEN.every((funktion) => darfFunktion(funktion))).toBe(true);
  });
});
