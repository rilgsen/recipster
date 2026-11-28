import { begrenzePersonen } from './mengen';

/**
 * Alles, was der Nutzer erzeugt. Mitgelieferte Rezepte und der Katalog gehören nicht dazu,
 * deshalb kann ein App-Update sie ersetzen, ohne diese Daten zu berühren (S8-2).
 */
export type Zustand = {
  version: 1;
  einstellungen: Einstellungen;
  rezeptstatus: Record<string, Rezeptstatus>;
};

export type Einstellungen = {
  personen: number;
  ernaehrung: string[];
};

export type Rezeptstatus = {
  magIchNicht?: boolean;
  zuletztGekocht?: string;
};

export const STARTZUSTAND: Zustand = {
  version: 1,
  einstellungen: { personen: 2, ernaehrung: [] },
  rezeptstatus: {},
};

export type Aktion =
  | { typ: 'geladen'; zustand: Zustand }
  | { typ: 'personen'; personen: number }
  | { typ: 'ernaehrung'; form: string; aktiv: boolean }
  | { typ: 'magIchNicht'; rezeptId: string; aktiv: boolean };

export function reduziere(zustand: Zustand, aktion: Aktion): Zustand {
  switch (aktion.typ) {
    case 'geladen':
      return aktion.zustand;
    case 'personen':
      return {
        ...zustand,
        einstellungen: { ...zustand.einstellungen, personen: begrenzePersonen(aktion.personen) },
      };
    case 'ernaehrung': {
      const ohne = zustand.einstellungen.ernaehrung.filter((form) => form !== aktion.form);
      return {
        ...zustand,
        einstellungen: {
          ...zustand.einstellungen,
          ernaehrung: aktion.aktiv ? [...ohne, aktion.form] : ohne,
        },
      };
    }
    case 'magIchNicht': {
      const bisher = zustand.rezeptstatus[aktion.rezeptId] ?? {};
      return {
        ...zustand,
        rezeptstatus: {
          ...zustand.rezeptstatus,
          [aktion.rezeptId]: { ...bisher, magIchNicht: aktion.aktiv },
        },
      };
    }
    default:
      return zustand;
  }
}

/**
 * Macht aus gespeicherten Daten einen gültigen Zustand. Unbekanntes oder Kaputtes
 * wird durch Startwerte ersetzt, bekannte Teile bleiben erhalten.
 */
export function ausGespeichertem(roh: unknown): Zustand {
  if (!roh || typeof roh !== 'object') {
    return STARTZUSTAND;
  }
  const daten = roh as Partial<Zustand>;
  const einstellungen: Partial<Einstellungen> =
    daten.einstellungen && typeof daten.einstellungen === 'object' ? daten.einstellungen : {};
  return {
    version: 1,
    einstellungen: {
      personen: begrenzePersonen(
        typeof einstellungen.personen === 'number' ? einstellungen.personen : STARTZUSTAND.einstellungen.personen
      ),
      ernaehrung: Array.isArray(einstellungen.ernaehrung)
        ? einstellungen.ernaehrung.filter((form): form is string => typeof form === 'string')
        : [],
    },
    rezeptstatus:
      daten.rezeptstatus && typeof daten.rezeptstatus === 'object' ? { ...daten.rezeptstatus } : {},
  };
}

export function magIchNichtIds(zustand: Zustand): string[] {
  return Object.entries(zustand.rezeptstatus)
    .filter(([, status]) => status.magIchNicht)
    .map(([id]) => id);
}
