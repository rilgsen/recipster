import { tageZwischen, type Tag } from './datum';
import type { Basiseinheit, Zutat } from './katalog';
import { basismengeFuer, portionsfaktor } from './mengen';
import type { Rezept } from './rezepte';
import { istVorhanden } from './vorrat';
import type { Planeintrag, Vorratseintrag } from './zustand';

export const ABTEILUNGEN = [
  'Gemüse',
  'Obst',
  'Brot',
  'Kühlregal',
  'Fleisch',
  'Fisch',
  'Tiefkühl',
  'Konserven',
  'Vorrat',
] as const;

export type Posten = {
  zutat: Zutat;
  /** Summe in der Basiseinheit. null, wenn die Zutat nur als Prise gebraucht wird. */
  menge: number | null;
  einheit: Basiseinheit;
  /** Titel der Rezepte, die diese Zutat brauchen. */
  rezepte: string[];
};

export type Einkaufsanfrage = {
  plan: readonly Planeintrag[];
  rezeptNach: ReadonlyMap<string, Rezept>;
  katalog: ReadonlyMap<string, Zutat>;
  vorrat: Readonly<Record<string, Vorratseintrag>>;
  von: Tag;
  bis: Tag;
  /** true lässt vorhandene Zutaten in der Liste, für den Vorratscheck. */
  mitVorhandenen?: boolean;
};

/**
 * Berechnet die Einkaufsliste aus dem Plan (Spec Abschnitt 3):
 * gleiche Zutaten werden in der Basiseinheit zusammengezählt, Vorhandenes fehlt,
 * sortiert wird nach Abteilung und Name. Gekochte Gerichte zählen nicht mehr.
 */
export function berechneEinkaufsliste(anfrage: Einkaufsanfrage): Posten[] {
  const { plan, rezeptNach, katalog, vorrat, von, bis } = anfrage;
  const summe = new Map<string, Posten>();

  for (const eintrag of plan) {
    if (eintrag.gekocht || !eintrag.rezeptId) {
      continue;
    }
    if (tageZwischen(von, eintrag.datum) < 0 || tageZwischen(eintrag.datum, bis) < 0) {
      continue;
    }
    const rezept = rezeptNach.get(eintrag.rezeptId);
    if (!rezept) {
      continue;
    }
    const faktor = portionsfaktor(eintrag.portionen, rezept.portionen);
    for (const zeile of rezept.zutaten) {
      const zutat = katalog.get(zeile.zutat_id);
      if (!zutat) {
        continue;
      }
      const basis = basismengeFuer(zutat, zeile, faktor);
      const posten = summe.get(zutat.id) ?? { zutat, menge: null, einheit: zutat.basis_einheit, rezepte: [] };
      if (basis) {
        posten.menge = (posten.menge ?? 0) + basis.menge;
      }
      if (!posten.rezepte.includes(rezept.titel)) {
        posten.rezepte.push(rezept.titel);
      }
      summe.set(zutat.id, posten);
    }
  }

  const rang = (abteilung: string) => {
    const index = (ABTEILUNGEN as readonly string[]).indexOf(abteilung);
    return index === -1 ? ABTEILUNGEN.length : index;
  };

  return [...summe.values()]
    .filter((posten) => anfrage.mitVorhandenen || !istVorhanden(posten.zutat, vorrat))
    .map((posten) => ({
      ...posten,
      menge:
        posten.menge === null
          ? null
          : posten.einheit === 'Stück'
            ? Math.ceil(posten.menge - 1e-9)
            : posten.menge,
    }))
    .sort(
      (a, b) =>
        rang(a.zutat.abteilung) - rang(b.zutat.abteilung) || a.zutat.name.localeCompare(b.zutat.name, 'de')
    );
}

export function nachAbteilung(posten: readonly Posten[]): { abteilung: string; posten: Posten[] }[] {
  const gruppen: { abteilung: string; posten: Posten[] }[] = [];
  for (const p of posten) {
    const letzte = gruppen[gruppen.length - 1];
    if (letzte && letzte.abteilung === p.zutat.abteilung) {
      letzte.posten.push(p);
    } else {
      gruppen.push({ abteilung: p.zutat.abteilung, posten: [p] });
    }
  }
  return gruppen;
}

export type Kaufzaehler = Record<string, { name: string; zahl: number }>;

/** Die meistgekauften Einträge, ohne die, die schon auf der Liste stehen. */
export function haeufigGekauft(zaehler: Kaufzaehler, schonAufListe: ReadonlySet<string>, anzahl = 8): string[] {
  return Object.values(zaehler)
    .filter((eintrag) => !schonAufListe.has(eintrag.name.toLowerCase()))
    .sort((a, b) => b.zahl - a.zahl || a.name.localeCompare(b.name, 'de'))
    .slice(0, anzahl)
    .map((eintrag) => eintrag.name);
}
