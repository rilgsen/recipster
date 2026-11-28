import { plusTage, tageZwischen, type Tag } from './datum';
import { passtZurErnaehrung } from './filter';
import type { Mahlzeit, Rezept } from './rezepte';
import type { Planeintrag, Rezeptstatus, Vorratseintrag } from './zustand';

export const SPERRE_TAGE = 14;

export type Vorschlagsanfrage = {
  rezepte: readonly Rezept[];
  datum: Tag;
  mahlzeit: Mahlzeit;
  ernaehrung: readonly string[];
  rezeptstatus: Readonly<Record<string, Rezeptstatus>>;
  plan: readonly Planeintrag[];
  vorrat: Readonly<Record<string, Vorratseintrag>>;
};

export type Vorschlagsergebnis = {
  rezepte: Rezept[];
  /** true, wenn nur durch Lockern der Wiederholungssperre etwas gefunden wurde. */
  gelockert: boolean;
  /** Gesetzt, wenn es gar keinen Vorschlag gibt. */
  grund?: 'keinePassenden';
};

export function zutatenImVorrat(rezept: Rezept, vorrat: Readonly<Record<string, Vorratseintrag>>): number {
  return rezept.zutaten.filter((z) => vorrat[z.zutat_id]?.vorhanden).length;
}

/**
 * Vorschläge nach Spec Abschnitt 3:
 * 1. harte Filter, 2. Wiederholungssperre, 3. Reihenfolge, 4. Sperre lockern oder Grund nennen.
 */
export function vorschlaege(anfrage: Vorschlagsanfrage): Vorschlagsergebnis {
  const { rezepte, datum, mahlzeit, ernaehrung, rezeptstatus, plan, vorrat } = anfrage;

  const passend = rezepte.filter(
    (rezept) =>
      rezept.mahlzeit === mahlzeit &&
      passtZurErnaehrung(rezept, ernaehrung) &&
      !rezeptstatus[rezept.id]?.magIchNicht
  );

  // Gesperrt ist, was in den 14 Tagen davor geplant war, und was in den 6 Tagen danach
  // schon geplant ist. So kommt in einer Woche kein Rezept doppelt vor.
  const von = plusTage(datum, -SPERRE_TAGE);
  const bis = plusTage(datum, 6);
  const gesperrt = new Set(
    plan
      .filter((e) => e.rezeptId && tageZwischen(von, e.datum) >= 0 && tageZwischen(e.datum, bis) >= 0)
      .map((e) => e.rezeptId as string)
  );

  const sortiere = (liste: Rezept[]) =>
    [...liste].sort(
      (a, b) =>
        zutatenImVorrat(b, vorrat) - zutatenImVorrat(a, vorrat) ||
        a.minuten - b.minuten ||
        a.titel.localeCompare(b.titel, 'de')
    );

  const frei = passend.filter((rezept) => !gesperrt.has(rezept.id));
  if (frei.length > 0) {
    return { rezepte: sortiere(frei), gelockert: false };
  }
  if (passend.length > 0) {
    return { rezepte: sortiere(passend), gelockert: true };
  }
  return { rezepte: [], gelockert: false, grund: 'keinePassenden' };
}
