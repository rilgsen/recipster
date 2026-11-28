/** Typen und Umrechnung für den Zutatenkatalog (Spec Abschnitt 2 und 3). */

export type Basiseinheit = 'g' | 'ml' | 'Stück';
/**
 * „nach Geschmack“ steht für Zutaten ohne Mengenangabe wie Salz und Pfeffer zum Abschmecken.
 * Die Menge ist dann 0 und wird nie angezeigt oder gerechnet.
 */
export type Rezepteinheit = Basiseinheit | 'EL' | 'TL' | 'Prise' | 'nach Geschmack';

/** Einheiten ohne umrechenbare Menge. */
export function ohneMenge(einheit: Rezepteinheit): boolean {
  return einheit === 'Prise' || einheit === 'nach Geschmack';
}

export type Stueckrundung = 'ganz' | 'halb';

export const REZEPTEINHEITEN: readonly Rezepteinheit[] = ['g', 'ml', 'Stück', 'EL', 'TL', 'Prise', 'nach Geschmack'];

export type Zutat = {
  id: string;
  name: string;
  name_mehrzahl?: string;
  abteilung: string;
  basis_einheit: Basiseinheit;
  /** Bezeichnung eines Stücks in der Anzeige, zum Beispiel Zehe, Dose oder Bund. */
  stueck_name?: string;
  /** Größe, die mit einem Stück gemeint ist, zum Beispiel „400 g Füllmenge“ bei einer Dose. */
  stueck_inhalt?: string;
  /** Basiseinheiten je anderer Einheit, zum Beispiel { EL: 15 } bei ml. */
  umrechnung: Partial<Record<'EL' | 'TL' | 'Stück', number>>;
  /**
   * Schritt, auf den Stück im Rezept aufgerundet werden: ganze Stück (Ei) oder halbe (Zwiebel).
   * Fehlt die Angabe, gelten ganze Stück.
   */
  rundung?: Stueckrundung;
  immer_im_haus: boolean;
  /** null heißt unbegrenzt haltbar. */
  haltbarkeit_tage: number | null;
};

export type Rezeptzutat = {
  zutat_id: string;
  menge: number;
  einheit: Rezepteinheit;
  zusatz?: string;
};

export type Basismenge = { menge: number; einheit: Basiseinheit };

/**
 * Rechnet eine Rezeptmenge in die Basiseinheit der Zutat um.
 * Liefert null für eine Prise: Sie wird nach der Spec nie umgerechnet
 * und landet nicht als Menge auf der Einkaufsliste.
 * Wirft einen Fehler, wenn dem Katalog die Umrechnung fehlt.
 */
export function inBasiseinheit(zutat: Zutat, menge: number, einheit: Rezepteinheit): Basismenge | null {
  if (ohneMenge(einheit)) {
    return null;
  }
  if (einheit === zutat.basis_einheit) {
    return { menge, einheit: zutat.basis_einheit };
  }
  if (einheit === 'EL' || einheit === 'TL' || einheit === 'Stück') {
    const faktor = zutat.umrechnung[einheit];
    if (typeof faktor === 'number' && faktor > 0) {
      return { menge: menge * faktor, einheit: zutat.basis_einheit };
    }
  }
  throw new Error(`Keine Umrechnung von ${einheit} für ${zutat.id} (Basis ${zutat.basis_einheit})`);
}
