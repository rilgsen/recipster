import { berechneEinkaufsliste, haeufigGekauft, nachAbteilung } from '@/lib/einkauf';
import type { Zutat } from '@/lib/katalog';
import { alsKarte, MITGELIEFERTE_REZEPTE, MITGELIEFERTE_ZUTATEN, type Rezept } from '@/lib/rezepte';
import { aufgebrauchtVorschlag, baldAufbrauchen, istVorhanden } from '@/lib/vorrat';
import { reduziere, STARTZUSTAND, type Planeintrag, type Zustand } from '@/lib/zustand';

const katalog = alsKarte(MITGELIEFERTE_ZUTATEN);
const HEUTE = '2026-11-30';

function rezept(id: string, zutaten: Rezept['zutaten'], portionen = 2): Rezept {
  return {
    id,
    titel: `Rezept ${id}`,
    schwerpunkt: [],
    ernaehrung: [],
    tags: [],
    mahlzeit: 'Abendessen',
    minuten: 20,
    portionen,
    zutaten,
    schritte: [{ text: 'Kochen.' }],
  };
}

const a = rezept('a', [
  { zutat_id: 'butter', menge: 1, einheit: 'EL' },
  { zutat_id: 'lachsfilet', menge: 300, einheit: 'g' },
  { zutat_id: 'ei', menge: 3, einheit: 'Stück' },
  { zutat_id: 'salz', menge: 1, einheit: 'Prise' },
]);
const b = rezept('b', [
  { zutat_id: 'butter', menge: 30, einheit: 'g' },
  { zutat_id: 'ei', menge: 1, einheit: 'Stück' },
  { zutat_id: 'brokkoli', menge: 400, einheit: 'g' },
]);
const rezeptNach = alsKarte([a, b]);

function geplant(id: string, rezeptId: string, teile: Partial<Planeintrag> = {}): Planeintrag {
  return { id, datum: HEUTE, mahlzeit: 'Abendessen', rezeptId, portionen: 2, gekocht: false, ...teile };
}

function liste(plan: Planeintrag[], vorrat: Zustand['vorrat'] = {}, mitVorhandenen = false) {
  return berechneEinkaufsliste({
    plan,
    rezeptNach,
    katalog,
    vorrat,
    von: HEUTE,
    bis: '2026-12-06',
    mitVorhandenen,
  });
}

const menge = (posten: ReturnType<typeof liste>, id: string) => posten.find((p) => p.zutat.id === id)?.menge;

describe('Einkaufsliste berechnen (S4-1)', () => {
  it('zählt gleiche Zutaten in der Basiseinheit zusammen', () => {
    const posten = liste([geplant('1', 'a'), geplant('2', 'b')], { butter: { vorhanden: false } });
    expect(menge(posten, 'butter')).toBe(katalog.get('butter')!.umrechnung.EL! + 30);
    expect(menge(posten, 'ei')).toBe(4);
    expect(posten.find((p) => p.zutat.id === 'butter')?.rezepte).toEqual(['Rezept a', 'Rezept b']);
  });

  it('rechnet auf die Personenzahl des Planeintrags um und rundet Stück auf', () => {
    const posten = liste([geplant('1', 'a', { portionen: 3 })]);
    expect(menge(posten, 'lachsfilet')).toBe(450);
    expect(menge(posten, 'ei')).toBe(5);
  });

  it('sortiert nach Abteilung und dann nach Name', () => {
    const posten = liste([geplant('1', 'a'), geplant('2', 'b')]);
    expect(posten.map((p) => p.zutat.abteilung)).toEqual(['Gemüse', 'Kühlregal', 'Fisch']);
    expect(nachAbteilung(posten).map((g) => g.abteilung)).toEqual(['Gemüse', 'Kühlregal', 'Fisch']);
  });

  it('beachtet nur den Zeitraum und keine gekochten Gerichte oder Notizen', () => {
    const posten = liste([
      geplant('1', 'a', { datum: '2026-11-29' }),
      geplant('2', 'a', { datum: '2026-12-07' }),
      geplant('3', 'a', { gekocht: true }),
      { id: '4', datum: HEUTE, mahlzeit: 'Abendessen', notiz: 'Reste', portionen: 2, gekocht: false },
    ]);
    expect(posten).toEqual([]);
  });

  it('übersteht Planeinträge, deren Rezept es nicht mehr gibt (S8-2)', () => {
    expect(liste([geplant('1', 'gibt-es-nicht')])).toEqual([]);
  });
});

describe('Vorrat und Einkaufsliste (S4-3)', () => {
  it('lässt weg, was „immer im Haus“ ist, solange der Nutzer nichts anderes sagt', () => {
    const posten = liste([geplant('1', 'a')]);
    expect(posten.map((p) => p.zutat.id)).not.toContain('butter');
    expect(posten.map((p) => p.zutat.id)).not.toContain('salz');
    expect(liste([geplant('1', 'a')], { butter: { vorhanden: false } }).map((p) => p.zutat.id)).toContain('butter');
  });

  it('lässt im Vorrat markierte Zutaten weg', () => {
    const posten = liste([geplant('1', 'a')], { lachsfilet: { vorhanden: true } });
    expect(posten.map((p) => p.zutat.id)).toEqual(['ei']);
  });

  it('zeigt für den Vorratscheck auch Vorhandenes und führt eine reine Prise ohne Menge', () => {
    const posten = liste([geplant('1', 'a')], { lachsfilet: { vorhanden: true } }, true);
    expect(posten.map((p) => p.zutat.id)).toEqual(expect.arrayContaining(['lachsfilet', 'salz', 'butter']));
    expect(menge(posten, 'salz')).toBeNull();
  });

  it('kennt die meistgekauften Einträge und lässt aus, was schon auf der Liste steht', () => {
    const zaehler = {
      milch: { name: 'Milch', zahl: 5 },
      eier: { name: 'Eier', zahl: 9 },
      brot: { name: 'Brot', zahl: 2 },
    };
    expect(haeufigGekauft(zaehler, new Set(['milch']))).toEqual(['Eier', 'Brot']);
  });
});

describe('Haken und Einträge von Hand (S4-2)', () => {
  it('behält Haken und eigene Einträge, wenn sich der Plan ändert', () => {
    let z = reduziere(STARTZUSTAND, { typ: 'planHinzu', eintrag: geplant('1', 'a') });
    z = reduziere(z, { typ: 'einkaufHaken', zutatId: 'ei', aktiv: true });
    z = reduziere(z, { typ: 'einkaufHandHinzu', id: 'h1', text: 'Spülmittel' });
    z = reduziere(z, { typ: 'einkaufHandHaken', id: 'h1', aktiv: true });
    z = reduziere(z, { typ: 'planHinzu', eintrag: geplant('2', 'b') });
    z = reduziere(z, { typ: 'planEntfernen', id: '1' });
    expect(z.einkaufAbgehakt).toEqual({ ei: true });
    expect(z.einkaufHand).toEqual([{ id: 'h1', text: 'Spülmittel', abgehakt: true }]);
  });

  it('nimmt keinen leeren und keinen doppelten offenen Eintrag an', () => {
    let z = reduziere(STARTZUSTAND, { typ: 'einkaufHandHinzu', id: 'h1', text: '  ' });
    z = reduziere(z, { typ: 'einkaufHandHinzu', id: 'h2', text: 'Milch' });
    z = reduziere(z, { typ: 'einkaufHandHinzu', id: 'h3', text: 'milch' });
    expect(z.einkaufHand.map((e) => e.id)).toEqual(['h2']);
  });

  it('bucht beim Abschließen Gekauftes in den Vorrat und zählt für „Häufig gekauft“', () => {
    let z = reduziere(STARTZUSTAND, { typ: 'einkaufHaken', zutatId: 'ei', aktiv: true });
    z = reduziere(z, { typ: 'einkaufHandHinzu', id: 'h1', text: 'Spülmittel' });
    z = reduziere(z, { typ: 'einkaufHandHinzu', id: 'h2', text: 'Brot' });
    z = reduziere(z, { typ: 'einkaufHandHaken', id: 'h1', aktiv: true });
    z = reduziere(z, { typ: 'einkaufAbschliessen', heute: HEUTE, gekauft: [{ zutatId: 'ei', name: 'Ei' }] });
    expect(z.vorrat.ei).toEqual({ vorhanden: true, gekauftAm: HEUTE });
    expect(z.einkaufAbgehakt).toEqual({});
    expect(z.einkaufHand.map((e) => e.text)).toEqual(['Brot']);
    expect(z.kaufzaehler).toEqual({ ei: { name: 'Ei', zahl: 1 }, spülmittel: { name: 'Spülmittel', zahl: 1 } });
  });
});

describe('Nach dem Kochen und Haltbarkeit (S4-4)', () => {
  const lachs = katalog.get('lachsfilet') as Zutat;

  it('wählt frische Zutaten vor, nicht die mit „immer im Haus“', () => {
    const vorschlag = aufgebrauchtVorschlag(a, katalog);
    expect(vorschlag.filter((v) => v.vorgewaehlt).map((v) => v.zutat.id)).toEqual(['lachsfilet', 'ei']);
    expect(vorschlag.map((v) => v.zutat.id)).toEqual(['butter', 'lachsfilet', 'ei', 'salz']);
  });

  it('bucht bestätigte Zutaten aus und merkt sich das Kochdatum', () => {
    let z = reduziere(STARTZUSTAND, { typ: 'planHinzu', eintrag: geplant('1', 'a') });
    z = reduziere(z, { typ: 'vorratSetzen', zutatId: 'lachsfilet', vorhanden: true, heute: HEUTE });
    z = reduziere(z, { typ: 'gekocht', planId: '1', heute: HEUTE, aufgebraucht: ['lachsfilet'] });
    expect(z.plan[0].gekocht).toBe(true);
    expect(z.vorrat.lachsfilet).toEqual({ vorhanden: false });
    expect(z.rezeptstatus.a.zuletztGekocht).toBe(HEUTE);
    expect(istVorhanden(lachs, z.vorrat)).toBe(false);
  });

  it('meldet „bald aufbrauchen“ ab dem Tag vor Ablauf der Haltbarkeit', () => {
    const tage = lachs.haltbarkeit_tage as number;
    const vorrat = { lachsfilet: { vorhanden: true, gekauftAm: '2026-11-20' } };
    const frueh = baldAufbrauchen(vorrat, katalog, '2026-11-20');
    expect(frueh.length).toBe(tage <= 1 ? 1 : 0);
    const spaet = baldAufbrauchen(vorrat, katalog, '2026-11-28');
    expect(spaet.map((e) => e.zutat.id)).toEqual(['lachsfilet']);
    expect(spaet[0].resttage).toBe(tage - 8);
  });

  it('meldet nichts ohne Kaufdatum, bei unbegrenzter Haltbarkeit oder wenn aufgebraucht', () => {
    expect(
      baldAufbrauchen(
        {
          lachsfilet: { vorhanden: true },
          salz: { vorhanden: true, gekauftAm: '2020-01-01' },
          ei: { vorhanden: false, gekauftAm: '2020-01-01' },
        },
        katalog,
        HEUTE
      )
    ).toEqual([]);
  });

  it('rechnet mit allen mitgelieferten Rezepten, ohne zu scheitern', () => {
    const plan = MITGELIEFERTE_REZEPTE.map((r, i) => geplant(String(i), r.id, { portionen: 3 }));
    const posten = berechneEinkaufsliste({
      plan,
      rezeptNach: alsKarte(MITGELIEFERTE_REZEPTE),
      katalog,
      vorrat: {},
      von: HEUTE,
      bis: HEUTE,
    });
    expect(posten.length).toBeGreaterThan(40);
    expect(posten.every((p) => p.menge === null || p.menge > 0)).toBe(true);
  });
});
