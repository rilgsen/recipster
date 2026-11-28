import { Kochfiguren, kochwelt, kochweltenFuer } from '@/constants/theme';
import { ausGespeichertem, magIchNichtIds, planFuerTag, reduziere, STARTZUSTAND } from '@/lib/zustand';

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

describe('Wochenplan (S3-1, S3-3)', () => {
  const eintrag = (id: string, teile: object = {}) => ({
    id,
    datum: '2026-11-30',
    mahlzeit: 'Abendessen' as const,
    rezeptId: 'r1',
    portionen: 2,
    gekocht: false,
    ...teile,
  });

  it('erlaubt mehrere Gerichte an einem Tag und sortiert nach Mahlzeit', () => {
    let z = reduziere(STARTZUSTAND, { typ: 'planHinzu', eintrag: eintrag('a') });
    z = reduziere(z, { typ: 'planHinzu', eintrag: eintrag('b', { mahlzeit: 'Frühstück', rezeptId: 'r2' }) });
    z = reduziere(z, { typ: 'planHinzu', eintrag: eintrag('c', { rezeptId: 'r3' }) });
    expect(planFuerTag(z, '2026-11-30').map((e) => e.id)).toEqual(['b', 'a', 'c']);
  });

  it('nimmt eine Notiz statt eines Rezepts an', () => {
    const z = reduziere(STARTZUSTAND, {
      typ: 'planHinzu',
      eintrag: eintrag('n', { rezeptId: undefined, notiz: '  Reste  ' }),
    });
    expect(z.plan[0].notiz).toBe('Reste');
    expect(z.plan[0].rezeptId).toBeUndefined();
  });

  it('lehnt Einträge ohne Rezept und ohne Notiz sowie doppelte Kennungen ab', () => {
    let z = reduziere(STARTZUSTAND, { typ: 'planHinzu', eintrag: eintrag('x', { rezeptId: undefined }) });
    expect(z.plan).toEqual([]);
    z = reduziere(z, { typ: 'planHinzu', eintrag: eintrag('a') });
    z = reduziere(z, { typ: 'planHinzu', eintrag: eintrag('a') });
    expect(z.plan).toHaveLength(1);
  });

  it('verschiebt ein Gericht auf einen anderen Tag', () => {
    let z = reduziere(STARTZUSTAND, { typ: 'planHinzu', eintrag: eintrag('a') });
    z = reduziere(z, { typ: 'planVerschieben', id: 'a', datum: '2026-12-02' });
    expect(planFuerTag(z, '2026-11-30')).toEqual([]);
    expect(planFuerTag(z, '2026-12-02').map((e) => e.id)).toEqual(['a']);
  });

  it('ändert die Personenzahl in den Grenzen und entfernt Einträge', () => {
    let z = reduziere(STARTZUSTAND, { typ: 'planHinzu', eintrag: eintrag('a') });
    z = reduziere(z, { typ: 'planPortionen', id: 'a', portionen: 40 });
    expect(z.plan[0].portionen).toBe(12);
    z = reduziere(z, { typ: 'planEntfernen', id: 'a' });
    expect(z.plan).toEqual([]);
  });

  it('lädt gespeicherte Pläne und wirft kaputte Einträge weg', () => {
    const z = ausGespeichertem({ plan: [eintrag('a'), { id: 'b' }, null, eintrag('c', { datum: 'gestern' })] });
    expect(z.plan.map((e) => e.id)).toEqual(['a']);
  });
});

describe('Koch-Auswahl (S6-1, S6-2)', () => {
  it('startet mit dem Kürbis und merkt sich die Wahl über einen Neustart', () => {
    expect(kochwelt(STARTZUSTAND.einstellungen.kochwelt).id).toBe('kuerbis-1');
    const z = reduziere(STARTZUSTAND, { typ: 'kochwelt', id: 'olive-2' });
    const geladen = ausGespeichertem(JSON.parse(JSON.stringify(z)));
    expect(kochwelt(geladen.einstellungen.kochwelt)).toMatchObject({ figur: 'olive', id: 'olive-2' });
  });

  it('fällt bei einer unbekannten Kennung auf den Kürbis zurück', () => {
    expect(kochwelt('gibt-es-nicht').id).toBe('kuerbis-1');
    expect(kochwelt(undefined).id).toBe('kuerbis-1');
    expect(ausGespeichertem({ einstellungen: { kochwelt: 5 } }).einstellungen.kochwelt).toBe('kuerbis-1');
  });

  it('bietet sechs Figuren mit je drei Farbwelten', () => {
    expect(Kochfiguren).toHaveLength(6);
    for (const figur of Kochfiguren) {
      expect(kochweltenFuer(figur.id)).toHaveLength(3);
    }
  });

  it('zeigt die Auswahl nur beim ersten Start', () => {
    expect(STARTZUSTAND.gesehen.start).toBeUndefined();
    const z = reduziere(STARTZUSTAND, { typ: 'startGesehen' });
    expect(ausGespeichertem(JSON.parse(JSON.stringify(z))).gesehen.start).toBe(true);
  });
});
