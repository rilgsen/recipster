import { inBasiseinheit, type Rezepteinheit, type Zutat } from './katalog';
import { begrenzePersonen } from './mengen';

/**
 * Link-Import (Spec Abschnitt 3, Regeln I1 bis I4). Alles hier ist reine Logik ohne Netz:
 * strukturierte Rezeptdaten aus einer Seite lesen, Zutatenzeilen zerlegen und dem Katalog zuordnen.
 */

export type Rohrezept = {
  titel: string;
  portionen: number;
  minuten: number;
  zutaten: string[];
  schritte: string[];
};

export type Importfehler = 'adresse' | 'netz' | 'keineDaten';

/** Prüft die Adresse. Erlaubt sind nur http und https. */
export function pruefeAdresse(eingabe: string): string | null {
  const text = eingabe.trim();
  if (!/^https?:\/\/[^\s/]+\.[^\s/]+/i.test(text)) {
    return null;
  }
  return text;
}

/** Sucht in einer Seite nach schema.org/Recipe in JSON-LD. */
export function findeRezeptdaten(html: string): Record<string, unknown> | null {
  const muster = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let treffer: RegExpExecArray | null;
  while ((treffer = muster.exec(html)) !== null) {
    let daten: unknown;
    try {
      daten = JSON.parse(treffer[1].trim());
    } catch {
      continue;
    }
    const rezept = sucheRezept(daten, 0);
    if (rezept) {
      return rezept;
    }
  }
  return null;
}

function sucheRezept(knoten: unknown, tiefe: number): Record<string, unknown> | null {
  if (!knoten || typeof knoten !== 'object' || tiefe > 6) {
    return null;
  }
  if (Array.isArray(knoten)) {
    for (const teil of knoten) {
      const fund = sucheRezept(teil, tiefe + 1);
      if (fund) {
        return fund;
      }
    }
    return null;
  }
  const objekt = knoten as Record<string, unknown>;
  const typ = objekt['@type'];
  const typen = Array.isArray(typ) ? typ : [typ];
  if (typen.includes('Recipe')) {
    return objekt;
  }
  return sucheRezept(objekt['@graph'], tiefe + 1);
}

const ZEICHEN: Record<string, string> = {
  '&amp;': '&',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
  '&lt;': '<',
  '&gt;': '>',
  '&auml;': 'ä',
  '&ouml;': 'ö',
  '&uuml;': 'ü',
  '&Auml;': 'Ä',
  '&Ouml;': 'Ö',
  '&Uuml;': 'Ü',
  '&szlig;': 'ß',
};

/** Entfernt Tags und Zeichenkürzel. Das Ergebnis wird nur als Text angezeigt, nie als HTML. */
export function reinerText(wert: unknown): string {
  if (typeof wert !== 'string') {
    return '';
  }
  return wert
    .replace(/<\/?(p|br|li|div|ul|ol|tr|td|h[1-6])\b[^>]*>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&[a-zA-Z#0-9]+;/g, (kuerzel) => {
      if (kuerzel in ZEICHEN) {
        return ZEICHEN[kuerzel];
      }
      const zahl = /^&#(\d+);$/.exec(kuerzel);
      return zahl ? String.fromCodePoint(Number(zahl[1])) : ' ';
    })
    .replace(/\s+/g, ' ')
    .trim();
}

/** Liest Minuten aus einer Dauer wie PT1H20M. */
export function minutenAusDauer(wert: unknown): number {
  if (typeof wert !== 'string') {
    return 0;
  }
  const treffer = /^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/i.exec(wert.trim());
  if (!treffer) {
    return 0;
  }
  return Number(treffer[1] ?? 0) * 1440 + Number(treffer[2] ?? 0) * 60 + Number(treffer[3] ?? 0);
}

function schritteAus(wert: unknown, tiefe = 0): string[] {
  if (tiefe > 4 || !wert) {
    return [];
  }
  if (typeof wert === 'string') {
    // Ein einzelner Text wird an Zeilenumbrüchen und Absätzen geteilt.
    return wert
      .split(/\n+|<\/p>|<br\s*\/?>|<\/li>/i)
      .map(reinerText)
      .filter(Boolean);
  }
  if (Array.isArray(wert)) {
    return wert.flatMap((teil) => schritteAus(teil, tiefe + 1));
  }
  if (typeof wert === 'object') {
    const objekt = wert as Record<string, unknown>;
    if (objekt.itemListElement) {
      return schritteAus(objekt.itemListElement, tiefe + 1);
    }
    const text = reinerText(objekt.text ?? objekt.name);
    return text ? [text] : [];
  }
  return [];
}

const MAX_ZEILEN = 60;
const MAX_TEXT = 600;

/** Macht aus schema.org/Recipe die Felder, die das Formular braucht. */
export function leseRezept(daten: Record<string, unknown>): Rohrezept | null {
  const titel = reinerText(daten.name).slice(0, 120);
  const zutaten = (Array.isArray(daten.recipeIngredient) ? daten.recipeIngredient : [])
    .map(reinerText)
    .filter(Boolean)
    .slice(0, MAX_ZEILEN)
    .map((zeile) => zeile.slice(0, 160));
  const schritte = schritteAus(daten.recipeInstructions)
    .slice(0, MAX_ZEILEN)
    .map((text) => text.slice(0, MAX_TEXT));
  if (!titel || (zutaten.length === 0 && schritte.length === 0)) {
    return null;
  }
  const menge = Array.isArray(daten.recipeYield) ? daten.recipeYield[0] : daten.recipeYield;
  const zahl = /\d+/.exec(String(menge ?? ''));
  const minuten =
    minutenAusDauer(daten.totalTime) || minutenAusDauer(daten.cookTime) + minutenAusDauer(daten.prepTime);
  return {
    titel,
    portionen: begrenzePersonen(zahl ? Number(zahl[0]) : 2),
    minuten: Math.min(minuten, 24 * 60),
    zutaten,
    schritte,
  };
}

export type ZerlegteZeile = {
  /** Die Zeile, wie sie auf der Seite stand. */
  text: string;
  menge?: number;
  einheit?: Rezepteinheit;
  name: string;
};

const BRUECHE: Record<string, number> = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3 };

const EINHEITEN: { muster: RegExp; einheit: Rezepteinheit; faktor: number }[] = [
  { muster: /^(kg|kilo|kilogramm)\.?$/i, einheit: 'g', faktor: 1000 },
  { muster: /^(g|gr|gramm)\.?$/i, einheit: 'g', faktor: 1 },
  { muster: /^(l|liter)\.?$/i, einheit: 'ml', faktor: 1000 },
  { muster: /^(ml|milliliter)\.?$/i, einheit: 'ml', faktor: 1 },
  { muster: /^(el|essl\.?|esslöffel)\.?$/i, einheit: 'EL', faktor: 1 },
  { muster: /^(tl|teel\.?|teelöffel)\.?$/i, einheit: 'TL', faktor: 1 },
  { muster: /^(prise|prisen|pr)\.?$/i, einheit: 'Prise', faktor: 1 },
  { muster: /^(stück|stücke|stk|st)\.?$/i, einheit: 'Stück', faktor: 1 },
  { muster: /^(zehe|zehen|dose|dosen|bund|bunde)$/i, einheit: 'Stück', faktor: 1 },
];

function leseZahl(text: string): { zahl: number; rest: string } | null {
  let rest = text.trim();
  // „1 1/2“, „1/2“, „1,5“, „1.5“, „1½“, „½“, „2-3“ (dann die größere Zahl).
  const gemischt = /^(\d+)\s+(\d+)\s*\/\s*(\d+)\s*/.exec(rest);
  if (gemischt && Number(gemischt[3]) > 0) {
    return {
      zahl: Number(gemischt[1]) + Number(gemischt[2]) / Number(gemischt[3]),
      rest: rest.slice(gemischt[0].length),
    };
  }
  const bruch = /^(\d+)\s*\/\s*(\d+)\s*/.exec(rest);
  if (bruch && Number(bruch[2]) > 0) {
    return { zahl: Number(bruch[1]) / Number(bruch[2]), rest: rest.slice(bruch[0].length) };
  }
  const dezimal = /^(\d+(?:[.,]\d+)?)\s*(?:-|–|bis)\s*(\d+(?:[.,]\d+)?)\s*/.exec(rest);
  if (dezimal) {
    return { zahl: Number(dezimal[2].replace(',', '.')), rest: rest.slice(dezimal[0].length) };
  }
  const einfach = /^(\d+(?:[.,]\d+)?)\s*([½¼¾⅓⅔])?\s*/.exec(rest);
  if (einfach) {
    return {
      zahl: Number(einfach[1].replace(',', '.')) + (einfach[2] ? BRUECHE[einfach[2]] : 0),
      rest: rest.slice(einfach[0].length),
    };
  }
  const zeichen = /^([½¼¾⅓⅔])\s*/.exec(rest);
  if (zeichen) {
    rest = rest.slice(zeichen[0].length);
    return { zahl: BRUECHE[zeichen[1]], rest };
  }
  return null;
}

/** Zerlegt „1 große Dose stückige Tomaten (ca. 400 g), abgetropft“ in Menge, Einheit und Name (I2). */
export function zerlegeZutat(zeile: string): ZerlegteZeile {
  const text = zeile.trim();
  // Klammern und alles nach dem ersten Komma sind Zusätze, nicht der Name.
  const kern = text.replace(/\([^)]*\)/g, ' ').split(/,(?!\d)/)[0].replace(/\s+/g, ' ').trim();
  const zahl = leseZahl(kern);
  if (!zahl) {
    const prise = /^(?:eine\s+)?prise\s+(.+)$/i.exec(kern);
    return prise ? { text, menge: 1, einheit: 'Prise', name: prise[1] } : { text, name: kern };
  }
  // „400g“ ohne Leerzeichen trennen.
  const rest = zahl.rest.trim();
  const [erstes, ...weitere] = rest.split(/\s+/);
  const fund = EINHEITEN.find((e) => e.muster.test(erstes ?? ''));
  if (fund && weitere.length > 0) {
    return { text, menge: zahl.zahl * fund.faktor, einheit: fund.einheit, name: weitere.join(' ') };
  }
  return { text, menge: zahl.zahl, einheit: 'Stück', name: rest };
}

function normalisiere(text: string): string {
  return text
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Ordnet einen Namen dem Katalog zu (I2). Es zählt nur ein eindeutiger Treffer:
 * der ganze Name oder genau eine Katalogzutat, deren Name als ganzes Wort vorkommt.
 * Bei mehreren möglichen Zutaten gibt es keinen Vorschlag.
 */
export function ordneZu(name: string, katalog: readonly Zutat[]): Zutat | null {
  const gesucht = normalisiere(name);
  if (!gesucht) {
    return null;
  }
  const namen = (zutat: Zutat) =>
    [zutat.name, zutat.name_mehrzahl].filter((n): n is string => Boolean(n)).map(normalisiere);
  const genau = katalog.filter((zutat) => namen(zutat).includes(gesucht));
  if (genau.length === 1) {
    return genau[0];
  }
  if (genau.length > 1) {
    return null;
  }
  const worte = ` ${gesucht} `;
  const enthalten = katalog.filter((zutat) => namen(zutat).some((n) => worte.includes(` ${n} `)));
  return enthalten.length === 1 ? enthalten[0] : null;
}

/** Einheiten, die für eine Zutat umgerechnet werden können. */
export function erlaubteEinheiten(zutat: Zutat): Rezepteinheit[] {
  const liste: Rezepteinheit[] = [zutat.basis_einheit];
  for (const einheit of ['Stück', 'EL', 'TL'] as const) {
    if (einheit !== zutat.basis_einheit && typeof zutat.umrechnung[einheit] === 'number') {
      liste.push(einheit);
    }
  }
  liste.push('Prise');
  return liste;
}

export type Vorschlag =
  | { art: 'katalog'; text: string; zutat: Zutat; menge: number; einheit: Rezepteinheit }
  | { art: 'frei'; text: string };

/**
 * Vorschlag für eine Zeile: eine Katalogzutat nur, wenn Name, Menge und Einheit zusammenpassen.
 * Alles andere bleibt eine freie Zeile, die der Nutzer selbst zuordnen kann (I3).
 */
export function schlageVor(zeile: string, katalog: readonly Zutat[]): Vorschlag {
  const zerlegt = zerlegeZutat(zeile);
  const zutat = ordneZu(zerlegt.name, katalog);
  if (!zutat || zerlegt.menge === undefined || !zerlegt.einheit || !(zerlegt.menge > 0)) {
    return { art: 'frei', text: zerlegt.text };
  }
  if (!erlaubteEinheiten(zutat).includes(zerlegt.einheit)) {
    return { art: 'frei', text: zerlegt.text };
  }
  try {
    inBasiseinheit(zutat, zerlegt.menge, zerlegt.einheit);
  } catch {
    return { art: 'frei', text: zerlegt.text };
  }
  return { art: 'katalog', text: zerlegt.text, zutat, menge: zerlegt.menge, einheit: zerlegt.einheit };
}

/** Katalogzutaten, die zu einer Eingabe passen, für die Auswahl von Hand. */
export function sucheZutaten(eingabe: string, katalog: readonly Zutat[], anzahl = 5): Zutat[] {
  const worte = normalisiere(zerlegeZutat(eingabe).name)
    .split(' ')
    .filter((wort) => wort.length >= 3);
  if (worte.length === 0) {
    return [];
  }
  return katalog
    .filter((zutat) => {
      const name = normalisiere(`${zutat.name} ${zutat.name_mehrzahl ?? ''}`);
      return worte.some((wort) => name.includes(wort) || name.split(' ').some((teil) => wort.includes(teil) && teil.length >= 4));
    })
    .slice(0, anzahl);
}
