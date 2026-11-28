import { plusTage, tageAb, tageZwischen } from '@/lib/datum';
import { MITGELIEFERTE_REZEPTE, type Rezept } from '@/lib/rezepte';
import { vorschlaege, type Vorschlagsanfrage } from '@/lib/vorschlaege';
import type { Planeintrag } from '@/lib/zustand';

const HEUTE = '2026-11-30';

function rezept(id: string, teile: Partial<Rezept> = {}): Rezept {
  return {
    id,
    titel: id,
    schwerpunkt: ['Familie'],
    ernaehrung: [],
    tags: [],
    mahlzeit: 'Abendessen',
    minuten: 30,
    portionen: 2,
    zutaten: [{ zutat_id: 'ei', menge: 1, einheit: 'Stück' }],
    schritte: [{ text: 'Kochen.' }],
    ...teile,
  };
}

function anfrage(teile: Partial<Vorschlagsanfrage>): Vorschlagsanfrage {
  return {
    rezepte: [],
    datum: HEUTE,
    mahlzeit: 'Abendessen',
    ernaehrung: [],
    rezeptstatus: {},
    plan: [],
    vorrat: {},
    ...teile,
  };
}

function geplant(rezeptId: string, datum: string): Planeintrag {
  return { id: `${rezeptId}-${datum}`, datum, mahlzeit: 'Abendessen', rezeptId, portionen: 2, gekocht: false };
}

describe('Datum', () => {
  it('rechnet über Monats- und Jahresgrenzen', () => {
    expect(plusTage('2026-12-31', 1)).toBe('2027-01-01');
    expect(plusTage('2026-03-01', -1)).toBe('2026-02-28');
    expect(tageZwischen('2026-11-30', '2026-12-14')).toBe(14);
    expect(tageAb('2026-11-30', 3)).toEqual(['2026-11-30', '2026-12-01', '2026-12-02']);
  });

  it('übersteht die Zeitumstellung', () => {
    expect(plusTage('2026-03-28', 1)).toBe('2026-03-29');
    expect(plusTage('2026-03-29', 1)).toBe('2026-03-30');
    expect(tageZwischen('2026-03-28', '2026-03-30')).toBe(2);
  });
});

describe('Vorschläge im Wochenplan (S3-2)', () => {
  it('beachtet Mahlzeit, Ernährung und „Mag ich nicht“', () => {
    const ergebnis = vorschlaege(
      anfrage({
        rezepte: [
          rezept('fruehstueck', { mahlzeit: 'Frühstück' }),
          rezept('fleisch'),
          rezept('veggi', { ernaehrung: ['vegetarisch'] }),
          rezept('unbeliebt', { ernaehrung: ['vegetarisch'] }),
        ],
        ernaehrung: ['vegetarisch'],
        rezeptstatus: { unbeliebt: { magIchNicht: true } },
      })
    );
    expect(ergebnis.rezepte.map((r) => r.id)).toEqual(['veggi']);
    expect(ergebnis.gelockert).toBe(false);
  });

  it('sperrt Rezepte, die in den letzten 14 Tagen geplant waren', () => {
    const ergebnis = vorschlaege(
      anfrage({
        rezepte: [rezept('a'), rezept('b'), rezept('c')],
        plan: [geplant('a', plusTage(HEUTE, -14)), geplant('b', plusTage(HEUTE, -15))],
      })
    );
    expect(ergebnis.rezepte.map((r) => r.id)).toEqual(['b', 'c']);
  });

  it('schlägt nichts vor, was in derselben Woche schon geplant ist', () => {
    const ergebnis = vorschlaege(
      anfrage({ rezepte: [rezept('a'), rezept('b')], plan: [geplant('a', plusTage(HEUTE, 3))] })
    );
    expect(ergebnis.rezepte.map((r) => r.id)).toEqual(['b']);
  });

  it('ordnet nach Vorrat, dann nach Kochzeit', () => {
    const ergebnis = vorschlaege(
      anfrage({
        rezepte: [
          rezept('lang', { minuten: 50 }),
          rezept('kurz', { minuten: 10 }),
          rezept('vorrat', {
            minuten: 60,
            zutaten: [{ zutat_id: 'lachsfilet', menge: 300, einheit: 'g' }],
          }),
        ],
        vorrat: { lachsfilet: { vorhanden: true } },
      })
    );
    expect(ergebnis.rezepte.map((r) => r.id)).toEqual(['vorrat', 'kurz', 'lang']);
  });

  it('lockert die Sperre, wenn sonst nichts übrig bleibt', () => {
    const ergebnis = vorschlaege(
      anfrage({ rezepte: [rezept('a')], plan: [geplant('a', plusTage(HEUTE, -2))] })
    );
    expect(ergebnis.rezepte.map((r) => r.id)).toEqual(['a']);
    expect(ergebnis.gelockert).toBe(true);
  });

  it('nennt einen Grund, wenn gar nichts passt', () => {
    const ergebnis = vorschlaege(anfrage({ rezepte: [rezept('a')], mahlzeit: 'Snack' }));
    expect(ergebnis.rezepte).toEqual([]);
    expect(ergebnis.grund).toBe('keinePassenden');
  });

  it('füllt mit den mitgelieferten Rezepten eine Woche Abendessen ohne Doppelte', () => {
    const plan: Planeintrag[] = [];
    for (const datum of tageAb(HEUTE, 7)) {
      const ergebnis = vorschlaege(anfrage({ rezepte: MITGELIEFERTE_REZEPTE, datum, plan }));
      expect(ergebnis.gelockert).toBe(false);
      plan.push(geplant(ergebnis.rezepte[0].id, datum));
    }
    expect(new Set(plan.map((e) => e.rezeptId)).size).toBe(7);
  });
});
