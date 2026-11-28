import { filtereRezepte, hatAktivenFilter, passtZurErnaehrung } from '@/lib/filter';
import { alsKarte, MITGELIEFERTE_REZEPTE, MITGELIEFERTE_ZUTATEN } from '@/lib/rezepte';

const katalog = alsKarte(MITGELIEFERTE_ZUTATEN);
const rezepte = MITGELIEFERTE_REZEPTE;

describe('Rezeptfilter (S2-2)', () => {
  it('zeigt ohne Filter alle Rezepte (S2-1)', () => {
    expect(filtereRezepte(rezepte, {}, katalog)).toHaveLength(rezepte.length);
    expect(rezepte.length).toBeGreaterThanOrEqual(33);
  });

  it('filtert nach Ernährungsform', () => {
    const treffer = filtereRezepte(rezepte, { ernaehrung: ['vegetarisch'] }, katalog);
    expect(treffer.length).toBeGreaterThan(0);
    for (const rezept of treffer) {
      expect(rezept.ernaehrung.some((f) => f === 'vegetarisch' || f === 'vegan')).toBe(true);
    }
  });

  it('verlangt alle gewählten Ernährungsformen zugleich', () => {
    const treffer = filtereRezepte(rezepte, { ernaehrung: ['vegetarisch', 'pescetarisch'] }, katalog);
    for (const rezept of treffer) {
      expect(rezept.ernaehrung.some((f) => f === 'vegetarisch' || f === 'vegan')).toBe(true);
    }
  });

  it('zählt vegan als vegetarisch und beides als pescetarisch', () => {
    const vegan = { ...rezepte[0], ernaehrung: ['vegan'] };
    expect(passtZurErnaehrung(vegan, ['vegetarisch'])).toBe(true);
    expect(passtZurErnaehrung(vegan, ['pescetarisch'])).toBe(true);
    expect(passtZurErnaehrung({ ...vegan, ernaehrung: ['pescetarisch'] }, ['vegetarisch'])).toBe(false);
  });

  it('filtert nach Kochzeit', () => {
    const treffer = filtereRezepte(rezepte, { maxMinuten: 20 }, katalog);
    expect(treffer.length).toBeGreaterThan(0);
    expect(treffer.every((r) => r.minuten <= 20)).toBe(true);
  });

  it('filtert nach Mahlzeit', () => {
    const treffer = filtereRezepte(rezepte, { mahlzeit: 'Frühstück' }, katalog);
    expect(treffer.length).toBeGreaterThan(0);
    expect(treffer.every((r) => r.mahlzeit === 'Frühstück')).toBe(true);
  });

  it('filtert nach Zutat über Kennung und über Suchtext', () => {
    const mitLachs = filtereRezepte(rezepte, { zutatIds: ['lachsfilet'] }, katalog);
    expect(mitLachs.length).toBeGreaterThan(0);
    expect(mitLachs.every((r) => r.zutaten.some((z) => z.zutat_id === 'lachsfilet'))).toBe(true);

    const gesucht = filtereRezepte(rezepte, { suchtext: 'Kürbis' }, katalog);
    expect(gesucht.length).toBeGreaterThan(0);
  });

  it('findet Umlaute auch in anderer Schreibweise', () => {
    const a = filtereRezepte(rezepte, { suchtext: 'hähnchen' }, katalog);
    const b = filtereRezepte(rezepte, { suchtext: 'HAEHNCHEN' }, katalog);
    expect(a.length).toBeGreaterThan(0);
    expect(b.map((r) => r.id)).toEqual(a.map((r) => r.id));
  });

  it('liefert eine leere Liste, wenn nichts passt', () => {
    expect(filtereRezepte(rezepte, { suchtext: 'gibtesnicht' }, katalog)).toEqual([]);
  });

  it('erkennt, ob ein Filter gesetzt ist', () => {
    expect(hatAktivenFilter({})).toBe(false);
    expect(hatAktivenFilter({ suchtext: '  ' })).toBe(false);
    expect(hatAktivenFilter({ maxMinuten: 20 })).toBe(true);
  });
});
