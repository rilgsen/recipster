import type { Tag } from './datum';
import { begrenzePersonen } from './mengen';
import { MAHLZEITEN, type Mahlzeit } from './rezepte';

/**
 * Alles, was der Nutzer erzeugt. Mitgelieferte Rezepte und der Katalog gehören nicht dazu,
 * deshalb kann ein App-Update sie ersetzen, ohne diese Daten zu berühren (S8-2).
 */
export type Zustand = {
  version: 1;
  einstellungen: Einstellungen;
  rezeptstatus: Record<string, Rezeptstatus>;
  plan: Planeintrag[];
  vorrat: Record<string, Vorratseintrag>;
  /**
   * Haken an berechneten Posten, nach Zutatenkennung. Gemerkt wird die Menge in der Basiseinheit,
   * die beim Abhaken auf der Liste stand, null bei einem Posten ohne Menge.
   */
  einkaufAbgehakt: Record<string, number | null>;
  /** Einträge von Hand. Sie überstehen jede Neuberechnung. */
  einkaufHand: Handeintrag[];
  /** Wie oft etwas gekauft wurde, für „Häufig gekauft“. Schlüssel ist der Name in Kleinbuchstaben. */
  kaufzaehler: Record<string, { name: string; zahl: number }>;
};

export type Handeintrag = {
  id: string;
  text: string;
  abgehakt: boolean;
};

/** Ein Gericht oder eine Notiz an einem Tag. Genau eines von rezeptId und notiz ist gesetzt. */
export type Planeintrag = {
  id: string;
  datum: Tag;
  mahlzeit: Mahlzeit;
  rezeptId?: string;
  notiz?: string;
  /** Personen, für die gekocht wird. */
  portionen: number;
  gekocht: boolean;
};

export type Vorratseintrag = {
  vorhanden: boolean;
  gekauftAm?: Tag;
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
  plan: [],
  vorrat: {},
  einkaufAbgehakt: {},
  einkaufHand: [],
  kaufzaehler: {},
};

export type Aktion =
  | { typ: 'geladen'; zustand: Zustand }
  | { typ: 'personen'; personen: number }
  | { typ: 'ernaehrung'; form: string; aktiv: boolean }
  | { typ: 'magIchNicht'; rezeptId: string; aktiv: boolean }
  | { typ: 'planHinzu'; eintrag: Planeintrag }
  | { typ: 'planEntfernen'; id: string }
  | { typ: 'planVerschieben'; id: string; datum: Tag; mahlzeit?: Mahlzeit }
  | { typ: 'planPortionen'; id: string; portionen: number }
  | { typ: 'einkaufHaken'; zutatId: string; aktiv: boolean; menge: number | null }
  | { typ: 'einkaufHandHinzu'; id: string; text: string }
  | { typ: 'einkaufHandHaken'; id: string; aktiv: boolean }
  | { typ: 'einkaufHandEntfernen'; id: string }
  | { typ: 'einkaufAbschliessen'; heute: Tag; gekauft: { zutatId: string; name: string }[] }
  | { typ: 'vorratSetzen'; zutatId: string; vorhanden: boolean; heute?: Tag }
  | { typ: 'gekocht'; planId: string; heute: Tag; aufgebraucht: string[] };

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
    case 'planHinzu': {
      const eintrag = pruefePlaneintrag(aktion.eintrag);
      if (!eintrag || zustand.plan.some((e) => e.id === eintrag.id)) {
        return zustand;
      }
      return { ...zustand, plan: [...zustand.plan, eintrag] };
    }
    case 'planEntfernen':
      return { ...zustand, plan: zustand.plan.filter((e) => e.id !== aktion.id) };
    case 'planVerschieben':
      return {
        ...zustand,
        plan: zustand.plan.map((e) =>
          e.id === aktion.id ? { ...e, datum: aktion.datum, mahlzeit: aktion.mahlzeit ?? e.mahlzeit } : e
        ),
      };
    case 'planPortionen':
      return {
        ...zustand,
        plan: zustand.plan.map((e) =>
          e.id === aktion.id ? { ...e, portionen: begrenzePersonen(aktion.portionen) } : e
        ),
      };
    case 'einkaufHaken': {
      const abgehakt = { ...zustand.einkaufAbgehakt };
      if (aktion.aktiv) {
        abgehakt[aktion.zutatId] = aktion.menge;
      } else {
        delete abgehakt[aktion.zutatId];
      }
      return { ...zustand, einkaufAbgehakt: abgehakt };
    }
    case 'einkaufHandHinzu': {
      const text = aktion.text.trim();
      if (!text || zustand.einkaufHand.some((e) => e.id === aktion.id)) {
        return zustand;
      }
      if (zustand.einkaufHand.some((e) => !e.abgehakt && e.text.toLowerCase() === text.toLowerCase())) {
        return zustand;
      }
      return { ...zustand, einkaufHand: [...zustand.einkaufHand, { id: aktion.id, text, abgehakt: false }] };
    }
    case 'einkaufHandHaken':
      return {
        ...zustand,
        einkaufHand: zustand.einkaufHand.map((e) => (e.id === aktion.id ? { ...e, abgehakt: aktion.aktiv } : e)),
      };
    case 'einkaufHandEntfernen':
      return { ...zustand, einkaufHand: zustand.einkaufHand.filter((e) => e.id !== aktion.id) };
    case 'einkaufAbschliessen': {
      const vorrat = { ...zustand.vorrat };
      const kaufzaehler = { ...zustand.kaufzaehler };
      const zaehle = (name: string) => {
        const schluessel = name.toLowerCase();
        kaufzaehler[schluessel] = { name, zahl: (kaufzaehler[schluessel]?.zahl ?? 0) + 1 };
      };
      for (const kauf of aktion.gekauft) {
        vorrat[kauf.zutatId] = { vorhanden: true, gekauftAm: aktion.heute };
        zaehle(kauf.name);
      }
      for (const eintrag of zustand.einkaufHand) {
        if (eintrag.abgehakt) {
          zaehle(eintrag.text);
        }
      }
      return {
        ...zustand,
        vorrat,
        kaufzaehler,
        einkaufAbgehakt: {},
        einkaufHand: zustand.einkaufHand.filter((e) => !e.abgehakt),
      };
    }
    case 'vorratSetzen':
      return {
        ...zustand,
        vorrat: {
          ...zustand.vorrat,
          [aktion.zutatId]: aktion.vorhanden
            ? { vorhanden: true, ...(aktion.heute ? { gekauftAm: aktion.heute } : {}) }
            : { vorhanden: false },
        },
      };
    case 'gekocht': {
      const eintrag = zustand.plan.find((e) => e.id === aktion.planId);
      if (!eintrag) {
        return zustand;
      }
      const vorrat = { ...zustand.vorrat };
      for (const zutatId of aktion.aufgebraucht) {
        vorrat[zutatId] = { vorhanden: false };
      }
      const rezeptstatus = eintrag.rezeptId
        ? {
            ...zustand.rezeptstatus,
            [eintrag.rezeptId]: { ...zustand.rezeptstatus[eintrag.rezeptId], zuletztGekocht: aktion.heute },
          }
        : zustand.rezeptstatus;
      return {
        ...zustand,
        vorrat,
        rezeptstatus,
        plan: zustand.plan.map((e) => (e.id === aktion.planId ? { ...e, gekocht: true } : e)),
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
    plan: Array.isArray(daten.plan)
      ? daten.plan.map(pruefePlaneintrag).filter((e): e is Planeintrag => e !== null)
      : [],
    vorrat: daten.vorrat && typeof daten.vorrat === 'object' ? { ...daten.vorrat } : {},
    einkaufAbgehakt:
      daten.einkaufAbgehakt && typeof daten.einkaufAbgehakt === 'object'
        ? Object.fromEntries(
            Object.entries(daten.einkaufAbgehakt as Record<string, unknown>).filter(
              (paar): paar is [string, number | null] =>
                paar[1] === null || (typeof paar[1] === 'number' && Number.isFinite(paar[1]) && paar[1] >= 0)
            )
          )
        : {},
    einkaufHand: Array.isArray(daten.einkaufHand)
      ? daten.einkaufHand
          .filter((e) => e && typeof e.id === 'string' && typeof e.text === 'string' && e.text.trim())
          .map((e) => ({ id: e.id, text: e.text, abgehakt: Boolean(e.abgehakt) }))
      : [],
    kaufzaehler: daten.kaufzaehler && typeof daten.kaufzaehler === 'object' ? { ...daten.kaufzaehler } : {},
  };
}

const TAG_MUSTER = /^\d{4}-\d{2}-\d{2}$/;

/** Liefert einen gültigen Planeintrag oder null. */
export function pruefePlaneintrag(roh: unknown): Planeintrag | null {
  if (!roh || typeof roh !== 'object') {
    return null;
  }
  const e = roh as Partial<Planeintrag>;
  if (typeof e.id !== 'string' || typeof e.datum !== 'string' || !TAG_MUSTER.test(e.datum)) {
    return null;
  }
  if (!e.mahlzeit || !MAHLZEITEN.includes(e.mahlzeit)) {
    return null;
  }
  const rezeptId = typeof e.rezeptId === 'string' && e.rezeptId ? e.rezeptId : undefined;
  const notiz = typeof e.notiz === 'string' && e.notiz.trim() ? e.notiz.trim() : undefined;
  if (!rezeptId && !notiz) {
    return null;
  }
  return {
    id: e.id,
    datum: e.datum,
    mahlzeit: e.mahlzeit,
    ...(rezeptId ? { rezeptId } : { notiz }),
    portionen: begrenzePersonen(typeof e.portionen === 'number' ? e.portionen : 2),
    gekocht: Boolean(e.gekocht),
  };
}

const REIHENFOLGE: Record<Mahlzeit, number> = { Frühstück: 0, Mittagessen: 1, Abendessen: 2, Snack: 3 };

export function planFuerTag(zustand: Zustand, datum: Tag): Planeintrag[] {
  return zustand.plan
    .filter((e) => e.datum === datum)
    .sort((a, b) => REIHENFOLGE[a.mahlzeit] - REIHENFOLGE[b.mahlzeit]);
}

let zaehler = 0;
/** Kennung für neue Einträge. Wird außerhalb der reinen Funktionen erzeugt. */
export function neueId(): string {
  zaehler += 1;
  return `${Date.now().toString(36)}-${zaehler.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function magIchNichtIds(zustand: Zustand): string[] {
  return Object.entries(zustand.rezeptstatus)
    .filter(([, status]) => status.magIchNicht)
    .map(([id]) => id);
}
