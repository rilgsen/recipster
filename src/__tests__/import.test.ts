import { freiePosten } from '@/lib/einkauf';
import {
  erlaubteEinheiten,
  findeRezeptdaten,
  leseRezept,
  minutenAusDauer,
  ordneZu,
  pruefeAdresse,
  reinerText,
  schlageVor,
  sucheZutaten,
  zerlegeZutat,
} from '@/lib/import';
import { alsKarte, MITGELIEFERTE_ZUTATEN, type Rezept } from '@/lib/rezepte';
import { ausGespeichertem, pruefeEigenesRezept, reduziere, STARTZUSTAND } from '@/lib/zustand';

const katalog = MITGELIEFERTE_ZUTATEN;

const SEITE = `<html><head>
<script type="application/ld+json">{"@type":"WebSite","name":"Blog"}</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@graph":[{"@type":"BreadcrumbList"},
 {"@type":["Recipe","Thing"],"name":"Ofenlachs &amp; Brokkoli","recipeYield":["4 Portionen"],
  "totalTime":"PT1H5M","recipeIngredient":["400 g Lachsfilet","2 Eier","1 Prise Salz","etwas Liebe"],
  "recipeInstructions":[{"@type":"HowToSection","itemListElement":[
    {"@type":"HowToStep","text":"<p>Ofen vorheizen.</p>"},{"@type":"HowToStep","text":"Lachs 20 Minuten backen."}]}]}]}
</script></head><body></body></html>`;

describe('Rezeptdaten lesen (I2, S7-1)', () => {
  it('findet schema.org/Recipe auch in einem Graphen und mit mehreren Typen', () => {
    const daten = findeRezeptdaten(SEITE);
    expect(daten).not.toBeNull();
    expect(leseRezept(daten!)).toEqual({
      titel: 'Ofenlachs & Brokkoli',
      portionen: 4,
      minuten: 65,
      zutaten: ['400 g Lachsfilet', '2 Eier', '1 Prise Salz', 'etwas Liebe'],
      schritte: ['Ofen vorheizen.', 'Lachs 20 Minuten backen.'],
    });
  });

  it('liefert nichts ohne Rezeptdaten oder bei kaputtem JSON (I4)', () => {
    expect(findeRezeptdaten('<html><body>Hallo</body></html>')).toBeNull();
    expect(findeRezeptdaten('<script type="application/ld+json">{kaputt</script>')).toBeNull();
    expect(findeRezeptdaten('<script type="application/ld+json">{"@type":"Article"}</script>')).toBeNull();
    expect(leseRezept({ '@type': 'Recipe', name: 'Leer' })).toBeNull();
  });

  it('teilt Schritte, die als ein Text kommen, und entfernt Tags', () => {
    const rezept = leseRezept({ name: 'A', recipeInstructions: 'Erst <b>dies</b>.\nDann das.' });
    expect(rezept?.schritte).toEqual(['Erst dies.', 'Dann das.']);
    expect(reinerText('<script>x</script>Hallo&nbsp;Welt &#228;')).toBe('xHallo Welt ä');
  });

  it('liest Dauern und prüft Adressen', () => {
    expect(minutenAusDauer('PT45M')).toBe(45);
    expect(minutenAusDauer('PT2H')).toBe(120);
    expect(minutenAusDauer('bald')).toBe(0);
    expect(pruefeAdresse(' https://beispiel.de/rezept ')).toBe('https://beispiel.de/rezept');
    expect(pruefeAdresse('beispiel.de')).toBeNull();
    expect(pruefeAdresse('javascript:alert(1)')).toBeNull();
    expect(pruefeAdresse('file:///etc/passwd')).toBeNull();
  });
});

describe('Zutatenzeilen zerlegen (I2)', () => {
  it.each([
    ['400 g Lachsfilet', 400, 'g', 'Lachsfilet'],
    ['400g Lachsfilet', 400, 'g', 'Lachsfilet'],
    ['1,5 kg Kartoffeln', 1500, 'g', 'Kartoffeln'],
    ['1/2 l Milch', 500, 'ml', 'Milch'],
    ['1 1/2 EL Olivenöl', 1.5, 'EL', 'Olivenöl'],
    ['½ TL Salz', 0.5, 'TL', 'Salz'],
    ['2 Eier', 2, 'Stück', 'Eier'],
    ['2 Zehen Knoblauch, fein gehackt', 2, 'Stück', 'Knoblauch'],
    ['2-3 Karotten', 3, 'Stück', 'Karotten'],
    ['1 Prise Salz', 1, 'Prise', 'Salz'],
    ['Prise Salz', 1, 'Prise', 'Salz'],
    ['1 große Dose stückige Tomaten (ca. 400 g), abgetropft', 1, 'Stück', 'große Dose stückige Tomaten'],
  ])('%s', (zeile, menge, einheit, name) => {
    expect(zerlegeZutat(zeile)).toMatchObject({ menge, einheit, name });
  });

  it('lässt eine Zeile ohne Zahl ohne Menge', () => {
    expect(zerlegeZutat('Salz und Pfeffer')).toEqual({ text: 'Salz und Pfeffer', name: 'Salz und Pfeffer' });
  });
});

describe('Dem Katalog zuordnen (I2, I3)', () => {
  it('schlägt nur eindeutige Treffer vor', () => {
    expect(ordneZu('Lachsfilet', katalog)?.id).toBe('lachsfilet');
    expect(ordneZu('Eier', katalog)?.id).toBe('ei');
    expect(ordneZu('frischer Brokkoli', katalog)?.id).toBe('brokkoli');
    // Zwei Sorten Kartoffeln im Katalog: kein Vorschlag, der Nutzer wählt.
    expect(ordneZu('Kartoffeln', katalog)).toBeNull();
    expect(ordneZu('Einhornstaub', katalog)).toBeNull();
    expect(ordneZu('', katalog)).toBeNull();
  });

  it('macht aus passenden Zeilen Katalogzeilen und aus dem Rest freie Zeilen', () => {
    expect(schlageVor('400 g Lachsfilet', katalog)).toMatchObject({
      art: 'katalog',
      menge: 400,
      einheit: 'g',
      zutat: { id: 'lachsfilet' },
    });
    expect(schlageVor('2 Eier', katalog)).toMatchObject({ art: 'katalog', menge: 2, einheit: 'Stück' });
    expect(schlageVor('etwas Liebe', katalog)).toEqual({ art: 'frei', text: 'etwas Liebe' });
    // Lachs wird in Gramm gekauft, „2 Stück“ lässt sich nicht umrechnen.
    expect(schlageVor('2 Lachsfilet', katalog)).toEqual({ art: 'frei', text: '2 Lachsfilet' });
    expect(schlageVor('Lachsfilet', katalog).art).toBe('frei');
  });

  it('bietet für die Auswahl von Hand passende Zutaten und nur umrechenbare Einheiten an', () => {
    expect(sucheZutaten('500 g Kartoffeln', katalog).map((z) => z.id)).toEqual(
      expect.arrayContaining(['kartoffeln-festkochend', 'kartoffeln-mehlig'])
    );
    expect(sucheZutaten('ab', katalog)).toEqual([]);
    const butter = katalog.find((z) => z.id === 'butter')!;
    expect(erlaubteEinheiten(butter)).toEqual(expect.arrayContaining(['g', 'EL', 'Prise']));
    expect(erlaubteEinheiten(butter)).not.toContain('ml');
  });
});

describe('Eigene Rezepte im Zustand (I5, S7-3, S7-4, S8-2)', () => {
  const rezept: Rezept = {
    id: 'eigen-1',
    titel: '  Omas Auflauf ',
    schwerpunkt: ['Keto'],
    ernaehrung: ['vegetarisch'],
    tags: [],
    mahlzeit: 'Abendessen',
    minuten: 40,
    portionen: 4,
    zutaten: [
      { zutat_id: 'ei', menge: 2, einheit: 'Stück' },
      { zutat_id: 'ei', menge: -1, einheit: 'Stück' },
    ],
    freie_zutaten: ['1 Becher Schmand', ' '],
    schritte: [{ text: 'Backen.', timer_sekunden: 600 }, { text: ' ' }],
    quellenlink: 'https://beispiel.de/auflauf',
  };

  it('speichert, ändert und löscht ein eigenes Rezept', () => {
    let z = reduziere(STARTZUSTAND, { typ: 'eigenesRezeptSpeichern', rezept });
    expect(z.eigeneRezepte).toHaveLength(1);
    expect(z.eigeneRezepte[0]).toMatchObject({
      titel: 'Omas Auflauf',
      schwerpunkt: [],
      quelle: 'import',
      freie_zutaten: ['1 Becher Schmand'],
      zutaten: [{ zutat_id: 'ei', menge: 2, einheit: 'Stück' }],
      schritte: [{ text: 'Backen.', timer_sekunden: 600 }],
    });
    z = reduziere(z, { typ: 'eigenesRezeptSpeichern', rezept: { ...rezept, titel: 'Neu' } });
    expect(z.eigeneRezepte.map((r) => r.titel)).toEqual(['Neu']);
    const geladen = ausGespeichertem(JSON.parse(JSON.stringify(z)));
    expect(geladen.eigeneRezepte).toEqual(z.eigeneRezepte);
    expect(reduziere(geladen, { typ: 'eigenesRezeptLoeschen', id: 'eigen-1' }).eigeneRezepte).toEqual([]);
  });

  it('nimmt nur gültige eigene Rezepte an', () => {
    expect(pruefeEigenesRezept({ ...rezept, id: 'lachs-brokkoli-zitronenbutter' })).toBeNull();
    expect(pruefeEigenesRezept({ ...rezept, titel: ' ' })).toBeNull();
    expect(pruefeEigenesRezept({ ...rezept, zutaten: [], freie_zutaten: [], schritte: [] })).toBeNull();
    expect(pruefeEigenesRezept({ ...rezept, quellenlink: 'javascript:alert(1)' })).toMatchObject({ quelle: 'eigen' });
    expect(pruefeEigenesRezept({ ...rezept, quellenlink: 'javascript:alert(1)' })?.quellenlink).toBeUndefined();
  });

  it('führt freie Zeilen als Text auf der Einkaufsliste, bis sie eingekauft sind (E7)', () => {
    let z = reduziere(STARTZUSTAND, { typ: 'eigenesRezeptSpeichern', rezept });
    z = reduziere(z, {
      typ: 'planHinzu',
      eintrag: { id: 'p1', datum: '2026-11-30', mahlzeit: 'Abendessen', rezeptId: 'eigen-1', portionen: 2, gekocht: false },
    });
    const anfrage = () => ({
      plan: z.plan,
      rezeptNach: alsKarte(z.eigeneRezepte),
      von: '2026-11-30',
      bis: '2026-12-06',
    });
    expect(freiePosten(anfrage())).toEqual([
      { schluessel: 'frei:p1:1 Becher Schmand', planId: 'p1', text: '1 Becher Schmand', rezept: 'Omas Auflauf' },
    ]);
    z = reduziere(z, {
      typ: 'einkaufAbschliessen',
      heute: '2026-11-30',
      gekauft: [],
      freiGekauft: [{ planId: 'p1', text: '1 Becher Schmand' }],
    });
    expect(freiePosten(anfrage())).toEqual([]);
    expect(ausGespeichertem(JSON.parse(JSON.stringify(z))).plan[0].freiErledigt).toEqual(['1 Becher Schmand']);
  });

  it('lässt Plan, Vorrat und eigene Rezepte unberührt, wenn sich der mitgelieferte Bestand ändert (S8-2)', () => {
    let z = reduziere(STARTZUSTAND, { typ: 'eigenesRezeptSpeichern', rezept });
    z = reduziere(z, {
      typ: 'planHinzu',
      eintrag: { id: 'p1', datum: '2026-11-30', mahlzeit: 'Abendessen', rezeptId: 'gibt-es-nicht-mehr', portionen: 2, gekocht: false },
    });
    z = reduziere(z, { typ: 'vorratSetzen', zutatId: 'zutat-von-frueher', vorhanden: true, heute: '2026-11-30' });
    const geladen = ausGespeichertem(JSON.parse(JSON.stringify(z)));
    expect(geladen.plan).toEqual(z.plan);
    expect(geladen.vorrat).toEqual(z.vorrat);
    expect(geladen.eigeneRezepte).toEqual(z.eigeneRezepte);
  });
});
