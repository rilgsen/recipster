import { tageZwischen, type Tag } from './datum';
import type { Zutat } from './katalog';
import type { Rezept } from './rezepte';
import type { Vorratseintrag } from './zustand';

type Vorrat = Readonly<Record<string, Vorratseintrag>>;

/**
 * Ob eine Zutat als vorhanden gilt. Eine ausdrückliche Angabe des Nutzers gewinnt,
 * sonst gilt „immer im Haus“ aus dem Katalog.
 */
export function istVorhanden(zutat: Zutat, vorrat: Vorrat): boolean {
  const eintrag = vorrat[zutat.id];
  return eintrag ? eintrag.vorhanden : zutat.immer_im_haus;
}

export type BaldAufbrauchen = { zutat: Zutat; resttage: number };

/**
 * Zutaten, deren Haltbarkeit abläuft: Kaufdatum plus Haltbarkeit liegt höchstens einen Tag entfernt
 * oder ist überschritten. Ohne Kaufdatum oder mit unbegrenzter Haltbarkeit gibt es keinen Hinweis.
 */
export function baldAufbrauchen(
  vorrat: Vorrat,
  katalog: ReadonlyMap<string, Zutat>,
  heute: Tag
): BaldAufbrauchen[] {
  const liste: BaldAufbrauchen[] = [];
  for (const [id, eintrag] of Object.entries(vorrat)) {
    const zutat = katalog.get(id);
    if (!zutat || !eintrag.vorhanden || !eintrag.gekauftAm || zutat.haltbarkeit_tage === null) {
      continue;
    }
    const resttage = zutat.haltbarkeit_tage - tageZwischen(eintrag.gekauftAm, heute);
    if (resttage <= 1) {
      liste.push({ zutat, resttage });
    }
  }
  return liste.sort((a, b) => a.resttage - b.resttage || a.zutat.name.localeCompare(b.zutat.name, 'de'));
}

/**
 * Zutaten eines Rezepts für die Frage „Was ist aufgebraucht?“.
 * Vorgewählt sind frische Zutaten, nicht die mit „immer im Haus“.
 */
export function aufgebrauchtVorschlag(
  rezept: Rezept,
  katalog: ReadonlyMap<string, Zutat>
): { zutat: Zutat; vorgewaehlt: boolean }[] {
  const gesehen = new Set<string>();
  const liste: { zutat: Zutat; vorgewaehlt: boolean }[] = [];
  for (const zeile of rezept.zutaten) {
    const zutat = katalog.get(zeile.zutat_id);
    if (!zutat || gesehen.has(zutat.id)) {
      continue;
    }
    gesehen.add(zutat.id);
    liste.push({ zutat, vorgewaehlt: !zutat.immer_im_haus });
  }
  return liste;
}
