import { ausGespeichertem, magIchNichtIds, reduziere, STARTZUSTAND } from '@/lib/zustand';

describe('Einstellungen', () => {
  it('begrenzt die Personenzahl', () => {
    expect(reduziere(STARTZUSTAND, { typ: 'personen', personen: 20 }).einstellungen.personen).toBe(12);
    expect(reduziere(STARTZUSTAND, { typ: 'personen', personen: 0 }).einstellungen.personen).toBe(1);
  });

  it('schaltet Ernährungsformen ein und aus, ohne Doppelte', () => {
    let z = reduziere(STARTZUSTAND, { typ: 'ernaehrung', form: 'vegetarisch', aktiv: true });
    z = reduziere(z, { typ: 'ernaehrung', form: 'vegetarisch', aktiv: true });
    expect(z.einstellungen.ernaehrung).toEqual(['vegetarisch']);
    z = reduziere(z, { typ: 'ernaehrung', form: 'vegetarisch', aktiv: false });
    expect(z.einstellungen.ernaehrung).toEqual([]);
  });
});

describe('Mag ich nicht (S2-4)', () => {
  it('merkt sich das Rezept und lässt sich zurücknehmen', () => {
    let z = reduziere(STARTZUSTAND, { typ: 'magIchNicht', rezeptId: 'a', aktiv: true });
    expect(magIchNichtIds(z)).toEqual(['a']);
    z = reduziere(z, { typ: 'magIchNicht', rezeptId: 'a', aktiv: false });
    expect(magIchNichtIds(z)).toEqual([]);
  });

  it('verändert den alten Zustand nicht', () => {
    reduziere(STARTZUSTAND, { typ: 'magIchNicht', rezeptId: 'a', aktiv: true });
    expect(STARTZUSTAND.rezeptstatus).toEqual({});
  });
});

describe('Gespeicherte Daten laden', () => {
  it('liefert den Startzustand bei leeren oder kaputten Daten', () => {
    expect(ausGespeichertem(null)).toEqual(STARTZUSTAND);
    expect(ausGespeichertem('kaputt')).toEqual(STARTZUSTAND);
    expect(ausGespeichertem({ einstellungen: 5 })).toEqual(STARTZUSTAND);
  });

  it('behält bekannte Teile und repariert ungültige Werte', () => {
    const z = ausGespeichertem({
      einstellungen: { personen: 99, ernaehrung: ['vegan', 7] },
      rezeptstatus: { a: { magIchNicht: true } },
    });
    expect(z.einstellungen.personen).toBe(12);
    expect(z.einstellungen.ernaehrung).toEqual(['vegan']);
    expect(magIchNichtIds(z)).toEqual(['a']);
  });
});
