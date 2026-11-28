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
  /** Nur bei importierten Rezepten. */
  quelle?: 'import';
  quellenlink?: string;
};

/** Mitgelieferte Daten. Sie werden zur Laufzeit nie verändert. */
export const MITGELIEFERTE_REZEPTE: readonly Rezept[] = [
  ...(muster.rezepte as Rezept[]),
  ...(paket1.rezepte as Rezept[]),
];

export const MITGELIEFERTE_ZUTATEN: readonly Zutat[] = katalogDatei.zutaten as Zutat[];

export const SCHWERPUNKTE = ['Fitness', 'Keto', 'Fisch', 'Familie'] as const;
export const ERNAEHRUNGSFORMEN = [
  'vegetarisch',
  'vegan',
  'pescetarisch',
  'glutenfrei',
  'laktosefrei',
] as const;

export function alsKarte<T extends { id: string }>(liste: readonly T[]): Map<string, T> {
  return new Map(liste.map((eintrag) => [eintrag.id, eintrag]));
}
