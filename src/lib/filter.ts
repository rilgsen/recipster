import type { Zutat } from './katalog';
import type { Mahlzeit, Rezept } from './rezepte';

export type Rezeptfilter = {
  suchtext?: string;
  /** Alle genannten Ernährungsformen müssen erfüllt sein. */
  ernaehrung?: readonly string[];
  schwerpunkt?: string;
  mahlzeit?: Mahlzeit;
  maxMinuten?: number;
  /** Alle genannten Zutaten müssen im Rezept vorkommen. */
  zutatIds?: readonly string[];
};

function normalisiere(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .trim();
}

export function passtZurErnaehrung(rezept: Rezept, formen: readonly string[]): boolean {
  return formen.every((form) => {
    if (rezept.ernaehrung.includes(form)) {
      return true;
    }
    // Vegane Rezepte sind auch vegetarisch, vegetarische und vegane auch pescetarisch.
    if (form === 'vegetarisch') {
      return rezept.ernaehrung.includes('vegan');
    }
    if (form === 'pescetarisch') {
      return rezept.ernaehrung.includes('vegetarisch') || rezept.ernaehrung.includes('vegan');
    }
    return false;
  });
}

export function filtereRezepte(
  rezepte: readonly Rezept[],
  filter: Rezeptfilter,
  katalog: ReadonlyMap<string, Zutat>
): Rezept[] {
  const suche = filter.suchtext ? normalisiere(filter.suchtext) : '';
  return rezepte.filter((rezept) => {
    if (filter.ernaehrung?.length && !passtZurErnaehrung(rezept, filter.ernaehrung)) {
      return false;
    }
    if (filter.schwerpunkt && !rezept.schwerpunkt.includes(filter.schwerpunkt)) {
      return false;
    }
    if (filter.mahlzeit && rezept.mahlzeit !== filter.mahlzeit) {
      return false;
    }
    if (filter.maxMinuten !== undefined && rezept.minuten > filter.maxMinuten) {
      return false;
    }
    if (filter.zutatIds?.length) {
      const ids = new Set(rezept.zutaten.map((z) => z.zutat_id));
      if (!filter.zutatIds.every((id) => ids.has(id))) {
        return false;
      }
    }
    if (suche) {
      const imTitel = normalisiere(rezept.titel).includes(suche);
      const inZutaten = rezept.zutaten.some((z) =>
        normalisiere(katalog.get(z.zutat_id)?.name ?? '').includes(suche)
      );
      const inTags = rezept.tags.some((tag) => normalisiere(tag).includes(suche));
      if (!imTitel && !inZutaten && !inTags) {
        return false;
      }
    }
    return true;
  });
}

export function hatAktivenFilter(filter: Rezeptfilter): boolean {
  return Boolean(
    filter.suchtext?.trim() ||
      filter.ernaehrung?.length ||
      filter.schwerpunkt ||
      filter.mahlzeit ||
      filter.maxMinuten !== undefined ||
      filter.zutatIds?.length
  );
}
