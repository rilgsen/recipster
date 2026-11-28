import { findeRezeptdaten, leseRezept, pruefeAdresse, type Importfehler, type Rohrezept } from './import';

const ZEIT_MS = 15_000;
const MAX_ZEICHEN = 3_000_000;

export type Importergebnis = { rezept: Rohrezept; link: string } | { fehler: Importfehler };

/**
 * Ruft genau die eine Seite ab, die der Nutzer angegeben hat, und liest ihre Rezeptdaten (I1, I4).
 * Es wird nichts gespeichert und nichts an einen eigenen Server geschickt.
 */
export async function importiere(eingabe: string): Promise<Importergebnis> {
  const link = pruefeAdresse(eingabe);
  if (!link) {
    return { fehler: 'adresse' };
  }
  const abbruch = new AbortController();
  const uhr = setTimeout(() => abbruch.abort(), ZEIT_MS);
  let html: string;
  try {
    const antwort = await fetch(link, { signal: abbruch.signal, headers: { Accept: 'text/html' } });
    if (!antwort.ok) {
      return { fehler: 'netz' };
    }
    html = (await antwort.text()).slice(0, MAX_ZEICHEN);
  } catch {
    return { fehler: 'netz' };
  } finally {
    clearTimeout(uhr);
  }
  const daten = findeRezeptdaten(html);
  const rezept = daten ? leseRezept(daten) : null;
  return rezept ? { rezept, link } : { fehler: 'keineDaten' };
}
