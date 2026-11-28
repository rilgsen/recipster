/**
 * Eine Stelle, an der entschieden wird, ob eine Funktion benutzt werden darf.
 * In der ersten Version ist alles frei. Kommt später ein Kauf dazu, ändert sich nur diese Datei
 * (Spec Abschnitt 2, „Vorbereitet für später“).
 */
export const FUNKTIONEN = ['wochenplan', 'vorschlaege', 'einkauf', 'vorrat', 'kochmodus', 'linkImport'] as const;

export type Funktion = (typeof FUNKTIONEN)[number];

export function darfFunktion(funktion: Funktion): boolean {
  return FUNKTIONEN.includes(funktion);
}
