import muster from '../../data/rezepte/rezepte-muster.json';
import paket1 from '../../data/rezepte/rezepte-paket-1.json';
import katalogDatei from '../../data/zutatenkatalog.json';
import type { Rezeptzutat, Zutat } from './katalog';

export type Mahlzeit = 'Frühstück' | 'Mittagessen' | 'Abendessen' | 'Snack';
export const MAHLZEITEN: readonly Mahlzeit[] = ['Frühstück', 'Mittagessen', 'Abendessen', 'Snack'];

export type Schritt = { text: string; timer_sekunden?: number; tipp?: string };

export type Naehrwerte = { kcal: number; eiweiss_g: number; kohlenhydrate_g: number; fett_g: number };

export type Rezept = {
  id: string;
  titel: string;
  schwerpunkt: string[];
  ernaehrung: string[];
  tags: string[];
  mahlzeit: Mahlzeit;
  minuten: number;
  portionen: number;
  naehrwerte?: Naehrwerte;
  zutaten: Rezeptzutat[];
  schritte: Schritt[];
  /** Nur bei eigenen Rezepten: importiert oder von Hand angelegt. */
  quelle?: 'import' | 'eigen';
  quellenlink?: string;
  /**
   * Nur bei eigenen Rezepten: Zutatenzeilen ohne Zuordnung zum Katalog (Regel I3).
   * Sie werden nicht umgerechnet und nicht mit dem Vorrat abgeglichen.
   */
  freie_zutaten?: string[];
};

/** Mitgelieferte Daten. Sie werden zur Laufzeit nie verändert. */
export const MITGELIEFERTE_REZEPTE: readonly Rezept[] = [
  ...(muster.rezepte as Rezept[]),
  ...(paket1.rezepte as Rezept[]),
];

export const MITGELIEFERTE_ZUTATEN: readonly Zutat[] = katalogDatei.zutaten as Zutat[];

export const SCHWERPUNKTE = ['Fitness', 'Keto', 'Fisch', 'Familie'] as const;
/**
 * Wählbare Ernährungsformen. „glutenfrei“ und „laktosefrei“ stehen nicht mehr an den Rezepten
 * und sind kein Filter: Die App prüft keine Unverträglichkeiten (Spec Abschnitt 1 und 5).
 */
export const ERNAEHRUNGSFORMEN = ['vegetarisch', 'vegan', 'pescetarisch'] as const;

export function alsKarte<T extends { id: string }>(liste: readonly T[]): Map<string, T> {
  return new Map(liste.map((eintrag) => [eintrag.id, eintrag]));
}

/** Nur wählbare Ernährungsformen werden gezeigt. Angaben wie „glutenfrei“ wären eine Zusage, die die App nicht prüft. */
export function istErnaehrungsform(form: string): boolean {
  return (ERNAEHRUNGSFORMEN as readonly string[]).includes(form);
}
