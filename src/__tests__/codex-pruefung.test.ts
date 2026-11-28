import { berechneEinkaufsliste } from '@/lib/einkauf';
import { inBasiseinheit, type Zutat } from '@/lib/katalog';
import { formatiereMenge, mengeImRezept, portionsfaktor } from '@/lib/mengen';
import { alsKarte, ERNAEHRUNGSFORMEN, MITGELIEFERTE_REZEPTE, MITGELIEFERTE_ZUTATEN } from '@/lib/rezepte';
import { aufgebrauchtVorschlag } from '@/lib/vorrat';
import type { Planeintrag } from '@/lib/zustand';

/**
 * Fälle aus der unabhängigen Prüfung durch Codex vom 28.11.2026
 * (docs/pruefungen/2026-11-28-codex-pr1-pr2.md). Sollwerte stehen hier als feste Zahlen,
 * nicht aus dem Katalog abgeleitet, damit ein falscher Faktor im Katalog auffällt.
 */

const katalog = alsKarte(MITGELIEFERTE_ZUTATEN);
const rezeptNach = alsKarte(MITGELIEFERTE_REZEPTE);
const z = (id: string) => katalog.get(id) as Zutat;
const HEUTE = '2026-11-30';

function geplant(rezeptId: string, portionen = 2): Planeintrag {
  return { id: rezeptId, datum: HEUTE, mahlzeit: 'Abendessen', rezeptId, portionen, gekocht: false };
}

describe('Keine Zusage zu Unverträglichkeiten (Befund 1)', () => {
  it('führt an keinem Rezept eine andere Ernährungsform als die wählbaren', () => {
    for (const rezept of MITGELIEFERTE_REZEPTE) {
      for (const form of rezept.ernaehrung) {
        expect(ERNAEHRUNGSFORMEN as readonly string[]).toContain(form);
      }
    }
  });

  it('kennzeichnet das Rezept mit Sojasauce nicht als glutenfrei', () => {
    const mitSoja = MITGELIEFERTE_REZEPTE.filter((r) => r.zutaten.some((zeile) => zeile.zutat_id === 'sojasauce'));
    expect(mitSoja.length).toBeGreaterThan(0);
    for (const rezept of mitSoja) {
      expect(rezept.ernaehrung).not.toContain('glutenfrei');
    }
  });
});

describe('Gewürze aus den Schritten stehen in den Zutaten (Befund 5)', () => {
  it.each(MITGELIEFERTE_REZEPTE.map((r) => [r.id, r] as const))('%s', (_id, rezept) => {
    const text = rezept.schritte.map((s) => s.text).join(' ').toLowerCase();
    const ids = new Set(rezept.zutaten.map((zeile) => zeile.zutat_id));
    if (text.includes('pfeffer')) {
      expect(ids.has('pfeffer')).toBe(true);
    }
    if (/\bsalz(en)?\b|salzwasser|gesalzen/.test(text)) {
      expect(ids.has('salz')).toBe(true);
    }
  });

  it('zeigt „nach Geschmack“ ohne Zahl und rechnet es nie um', () => {
    expect(formatiereMenge(z('pfeffer'), 0, 'nach Geschmack')).toBe('nach Geschmack');
    expect(inBasiseinheit(z('pfeffer'), 0, 'nach Geschmack')).toBeNull();
    expect(mengeImRezept(z('pfeffer'), { zutat_id: 'pfeffer', menge: 0, einheit: 'nach Geschmack' }, 6)).toBe(0);
  });

  it('setzt beim Omelett mit leerem Vorrat Salz und Pfeffer ohne Menge auf die Liste', () => {
    const vorrat = Object.fromEntries(MITGELIEFERTE_ZUTATEN.map((zutat) => [zutat.id, { vorhanden: false }]));
    const posten = berechneEinkaufsliste({
      plan: [geplant('omelett-spinat-feta')],
      rezeptNach,
      katalog,
      vorrat,
      von: HEUTE,
      bis: HEUTE,
    });
    expect(posten.find((p) => p.zutat.id === 'salz')).toMatchObject({ menge: null });
    expect(posten.find((p) => p.zutat.id === 'pfeffer')).toMatchObject({ menge: null });
  });
});

describe('Stückmengen (Befund 6)', () => {
  it('macht aus fünf Eiern für zwei Personen drei Eier für eine', () => {
    const zeile = { zutat_id: 'ei', menge: 5, einheit: 'Stück' as const };
    expect(mengeImRezept(z('ei'), zeile, portionsfaktor(1, 2))).toBe(3);
  });

  it('lässt ein halbes Bund Dill bei unveränderter Portionszahl ein halbes Bund', () => {
    const zeile = { zutat_id: 'dill', menge: 0.5, einheit: 'Stück' as const };
    expect(mengeImRezept(z('dill'), zeile, 1)).toBe(0.5);
    expect(formatiereMenge(z('dill'), 0.5, 'Stück')).toBe('½ Bund');
  });

  it('verändert bei unveränderter Portionszahl keine einzige Menge der mitgelieferten Rezepte', () => {
    for (const rezept of MITGELIEFERTE_REZEPTE) {
      for (const zeile of rezept.zutaten) {
        expect(mengeImRezept(z(zeile.zutat_id), zeile, 1)).toBe(zeile.menge);
      }
    }
  });

  it('nennt für jede Dose, was mit einer Dose gemeint ist', () => {
    const dosen = MITGELIEFERTE_ZUTATEN.filter((zutat) => zutat.stueck_name === 'Dose');
    expect(dosen.length).toBeGreaterThan(0);
    for (const dose of dosen) {
      expect(dose.stueck_inhalt).toMatch(/^\d+ g Füllmenge$/);
    }
  });
});

describe('Löffelmaße mit unabhängigen Sollwerten (Befund 7)', () => {
  it.each([
    ['butter', 2, 'EL', 28],
    ['butter', 1, 'TL', 5],
    ['honig', 1, 'EL', 21],
    ['honig', 3, 'TL', 21],
    ['mehl', 1, 'EL', 8],
    ['mehl', 3, 'TL', 9],
    ['olivenoel', 2, 'EL', 30],
    ['sojasauce', 1, 'TL', 5],
    ['salz', 1, 'TL', 6],
  ] as const)('%s: %d %s sind %d in der Basiseinheit', (id, menge, einheit, soll) => {
    expect(inBasiseinheit(z(id), menge, einheit)?.menge).toBe(soll);
  });

  it('hält Esslöffel und drei Teelöffel im ganzen Katalog höchstens ein Gramm auseinander', () => {
    for (const zutat of MITGELIEFERTE_ZUTATEN) {
      const { EL, TL } = zutat.umrechnung;
      if (EL !== undefined && TL !== undefined) {
        expect(Math.abs(EL - 3 * TL)).toBeLessThanOrEqual(1);
      }
    }
  });

  it('rechnet Flüssigkeiten mit 15 ml je Esslöffel und 5 ml je Teelöffel', () => {
    for (const zutat of MITGELIEFERTE_ZUTATEN.filter((kandidat) => kandidat.basis_einheit === 'ml')) {
      if (zutat.umrechnung.EL !== undefined) {
        expect(zutat.umrechnung.EL).toBe(15);
      }
      if (zutat.umrechnung.TL !== undefined) {
        expect(zutat.umrechnung.TL).toBe(5);
      }
    }
  });
});

describe('„Immer im Haus“ und Zusätze (Befunde 8 und 9)', () => {
  const mitButter = MITGELIEFERTE_REZEPTE.find((r) => r.zutaten.some((zeile) => zeile.zutat_id === 'butter'))!;

  it('setzt als fehlend markierte Butter auf die Liste, wählt sie nach dem Kochen aber nicht vor', () => {
    const anfrage = { plan: [geplant(mitButter.id)], rezeptNach, katalog, von: HEUTE, bis: HEUTE };
    expect(berechneEinkaufsliste({ ...anfrage, vorrat: {} }).some((p) => p.zutat.id === 'butter')).toBe(false);
    expect(
      berechneEinkaufsliste({ ...anfrage, vorrat: { butter: { vorhanden: false } } }).some(
        (p) => p.zutat.id === 'butter'
      )
    ).toBe(true);
    expect(aufgebrauchtVorschlag(mitButter, katalog).find((v) => v.zutat.id === 'butter')?.vorgewaehlt).toBe(false);
  });

  it('nennt bei zusammengezählter Paprika beide Rezepte', () => {
    const mitPaprika = MITGELIEFERTE_REZEPTE.filter((r) => r.zutaten.some((zeile) => zeile.zutat_id === 'paprika'));
    expect(mitPaprika.length).toBeGreaterThanOrEqual(2);
    const posten = berechneEinkaufsliste({
      plan: mitPaprika.slice(0, 2).map((r) => geplant(r.id)),
      rezeptNach,
      katalog,
      vorrat: {},
      von: HEUTE,
      bis: HEUTE,
    });
    expect(posten.find((p) => p.zutat.id === 'paprika')?.rezepte).toEqual(mitPaprika.slice(0, 2).map((r) => r.titel));
  });
});
