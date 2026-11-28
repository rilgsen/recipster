import {
  inBasiseinheit,
  type Rezepteinheit,
  type Rezeptzutat,
  type Stueckrundung,
  type Zutat,
} from './katalog';

export const MIN_PERSONEN = 1;
export const MAX_PERSONEN = 12;

export function begrenzePersonen(personen: number): number {
  if (!Number.isFinite(personen)) {
    return MIN_PERSONEN;
  }
  return Math.min(MAX_PERSONEN, Math.max(MIN_PERSONEN, Math.round(personen)));
}

/** Faktor ist Personenzahl geteilt durch die Portionen des Rezepts (Spec Abschnitt 3). */
export function portionsfaktor(personen: number, rezeptPortionen: number): number {
  const basis = rezeptPortionen > 0 ? rezeptPortionen : 1;
  return begrenzePersonen(personen) / basis;
}

/**
 * Rechnet eine Zutatenzeile auf den Faktor um (Spec Abschnitt 3, Regel M3).
 * Stück wird je Kochvorgang aufgerundet: auf ganze Stück (Ei) oder auf halbe (Zwiebel),
 * je nach Angabe im Katalog. Eine Prise bleibt, wie sie ist.
 */
export function skaliereMenge(
  menge: number,
  einheit: Rezepteinheit,
  faktor: number,
  rundung: Stueckrundung = 'ganz'
): number {
  if (einheit === 'Prise') {
    return menge;
  }
  const wert = menge * faktor;
  if (einheit === 'Stück') {
    const schritt = rundung === 'halb' ? 0.5 : 1;
    // Kleiner Abzug gegen Rundungsfehler wie 3.0000000000000004.
    return Math.max(schritt, Math.ceil(wert / schritt - 1e-9) * schritt);
  }
  return wert;
}

/** Die Menge einer Rezeptzeile für den Faktor, mit der Rundung der Zutat. */
export function mengeImRezept(zutat: Zutat, zeile: Rezeptzutat, faktor: number): number {
  return skaliereMenge(zeile.menge, zeile.einheit, faktor, zutat.rundung);
}

/** Rundet für die Anzeige: g und ml ohne Nachkommastellen ab 10, sonst höchstens eine. */
export function rundeFuerAnzeige(menge: number, einheit: Rezepteinheit): number {
  if (einheit === 'Stück') {
    return Math.ceil(menge * 2 - 1e-9) / 2;
  }
  if ((einheit === 'g' || einheit === 'ml') && menge >= 10) {
    return Math.round(menge);
  }
  if (einheit === 'EL' || einheit === 'TL') {
    return Math.round(menge * 2) / 2;
  }
  return Math.round(menge * 10) / 10;
}

export function formatiereZahl(zahl: number): string {
  if (Number.isInteger(zahl)) {
    return String(zahl);
  }
  if (Math.abs(zahl - 0.5) < 1e-9) {
    return '½';
  }
  if (Math.abs((zahl % 1) - 0.5) < 1e-9) {
    return `${Math.floor(zahl)} ½`;
  }
  return String(zahl).replace('.', ',');
}

/** Text wie „2 Zehen“, „300 g“ oder „1 Prise“. */
export function formatiereMenge(zutat: Zutat, menge: number, einheit: Rezepteinheit): string {
  const wert = rundeFuerAnzeige(menge, einheit);
  const zahl = formatiereZahl(wert);
  if (einheit === 'Stück') {
    if (zutat.basis_einheit === 'Stück' && zutat.stueck_name) {
      return `${zahl} ${mehrzahlStueckname(zutat.stueck_name, wert)}`;
    }
    return zutat.basis_einheit === 'Stück' ? zahl : `${zahl} Stück`;
  }
  if (einheit === 'Prise') {
    return wert === 1 ? '1 Prise' : `${zahl} Prisen`;
  }
  return `${zahl} ${einheit}`;
}

function mehrzahlStueckname(name: string, anzahl: number): string {
  if (anzahl <= 1) {
    return name;
  }
  const mehrzahl: Record<string, string> = { Zehe: 'Zehen', Dose: 'Dosen', Bund: 'Bund' };
  return mehrzahl[name] ?? name;
}

export function zutatName(zutat: Zutat, menge: number, einheit: Rezepteinheit): string {
  const viele = einheit === 'Stück' && zutat.basis_einheit === 'Stück' && !zutat.stueck_name && menge > 1;
  return viele && zutat.name_mehrzahl ? zutat.name_mehrzahl : zutat.name;
}

/**
 * Menge in der Basiseinheit nach Umrechnung auf die Personenzahl, null bei einer Prise.
 * Gerechnet wird mit der Menge, die das Rezept anzeigt, also nach der Stück-Rundung.
 */
export function basismengeFuer(zutat: Zutat, zeile: Rezeptzutat, faktor: number) {
  return inBasiseinheit(zutat, mengeImRezept(zutat, zeile, faktor), zeile.einheit);
}
