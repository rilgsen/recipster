/**
 * Farben, Schriften und Abstände aus dem Entwurf.
 * Eine Kochwelt ist eine Kochfigur mit ihrem Farbsystem. In Bauschritt 6
 * kommen die übrigen Figuren dazu, bis dahin gilt der Kürbis.
 */

export const Basis = {
  hintergrund: '#FAF6F0',
  flaeche: '#FFFFFF',
  text: '#2B1D14',
  textGedaempft: '#6B5A4E',
  linie: '#E7DFD3',
  warnung: '#C0271D',
} as const;

export type FigurId = 'kuerbis' | 'pilz' | 'olive' | 'pflaume' | 'kartoffel' | 'avocado';

/** Die sechs Kochfiguren in der Reihenfolge der Auswahl. */
export const Kochfiguren: readonly { id: FigurId; name: string }[] = [
  { id: 'kuerbis', name: 'Kürbis' },
  { id: 'pilz', name: 'Pilz' },
  { id: 'olive', name: 'Olive' },
  { id: 'pflaume', name: 'Pflaume' },
  { id: 'kartoffel', name: 'Kartoffel' },
  { id: 'avocado', name: 'Avocado' },
];

export type Kochwelt = {
  id: string;
  figur: FigurId;
  name: string;
  /** Namen der beiden Farben für die Auswahl, zum Beispiel „Petrolblau und Kürbisorange“. */
  farbnamen: string;
  /** Knöpfe und aktive Elemente */
  primaer: string;
  /** Text auf der Primärfarbe */
  aufPrimaer: string;
  /** Schriftzug und Akzente */
  akzent: string;
  /** Helle Fläche für Hinweise und Karten */
  ton: string;
};

/**
 * Sechs Figuren mit je drei Farbwelten, Werte von der Tafel „Sys-Uebersicht“ der Designfläche.
 * Der helle Ton ist die Knopffarbe zu 14 Prozent auf dem Hintergrund.
 * Drei Farbwerte sind gegenüber der Tafel abgedunkelt, damit Text den Kontrast 4,5 zu 1 hält
 * (Schriftzug 3 zu 1): das Orange der Knöpfe von Kürbis 3 und Pflaume 3, das Terrakotta von Avocado 3
 * und das Senfgelb von Pflaume 2. Bei Kürbis 3, Pflaume 3, Avocado 2 und Avocado 3 ist der helle Ton
 * dafür nur 8 Prozent stark.
 */
export const Kochwelten = {
  'kuerbis-1': {
    id: 'kuerbis-1',
    figur: 'kuerbis',
    name: 'Kürbis 1',
    farbnamen: 'Petrolblau und Kürbisorange',
    primaer: '#1F5C70',
    aufPrimaer: '#FFFFFF',
    akzent: '#D2691E',
    ton: '#D9E3E3',
  },
  'kuerbis-2': {
    id: 'kuerbis-2',
    figur: 'kuerbis',
    name: 'Kürbis 2',
    farbnamen: 'Tannengrün und Kürbisorange',
    primaer: '#3C5743',
    aufPrimaer: '#FFFFFF',
    akzent: '#D2691E',
    ton: '#DFE0D8',
  },
  'kuerbis-3': {
    id: 'kuerbis-3',
    figur: 'kuerbis',
    name: 'Kürbis 3',
    farbnamen: 'Kürbisorange und Petrolblau',
    primaer: '#A7521A',
    aufPrimaer: '#FFFFFF',
    akzent: '#1F5C70',
    ton: '#F3E9DF',
  },
  'pilz-1': {
    id: 'pilz-1',
    figur: 'pilz',
    name: 'Pilz 1',
    farbnamen: 'Tannengrün und Terrakotta',
    primaer: '#3C5743',
    aufPrimaer: '#FFFFFF',
    akzent: '#B8552F',
    ton: '#DFE0D8',
  },
  'pilz-2': {
    id: 'pilz-2',
    figur: 'pilz',
    name: 'Pilz 2',
    farbnamen: 'Petrolblau und Orange',
    primaer: '#1F5C70',
    aufPrimaer: '#FFFFFF',
    akzent: '#C9743A',
    ton: '#DBE0DE',
  },
  'pilz-3': {
    id: 'pilz-3',
    figur: 'pilz',
    name: 'Pilz 3',
    farbnamen: 'Kakao und Petrolblau',
    primaer: '#6F4A36',
    aufPrimaer: '#FFFFFF',
    akzent: '#2A6B80',
    ton: '#E7DED6',
  },
  'olive-1': {
    id: 'olive-1',
    figur: 'olive',
    name: 'Olive 1',
    farbnamen: 'Olivgrün und Terrakotta',
    primaer: '#4E6B35',
    aufPrimaer: '#FFFFFF',
    akzent: '#B8552F',
    ton: '#E2E3D6',
  },
  'olive-2': {
    id: 'olive-2',
    figur: 'olive',
    name: 'Olive 2',
    farbnamen: 'Tomatenrot und Olivgrün',
    primaer: '#A8432F',
    aufPrimaer: '#FFFFFF',
    akzent: '#4E6B35',
    ton: '#EFDDD5',
  },
  'olive-3': {
    id: 'olive-3',
    figur: 'olive',
    name: 'Olive 3',
    farbnamen: 'Tannengrün und Koralle',
    primaer: '#3C5743',
    aufPrimaer: '#FFFFFF',
    akzent: '#D4674C',
    ton: '#DFE0D8',
  },
  'pflaume-1': {
    id: 'pflaume-1',
    figur: 'pflaume',
    name: 'Pflaume 1',
    farbnamen: 'Pflaumenblau und Orange',
    primaer: '#3E447F',
    aufPrimaer: '#FFFFFF',
    akzent: '#C9743A',
    ton: '#E0DDE0',
  },
  'pflaume-2': {
    id: 'pflaume-2',
    figur: 'pflaume',
    name: 'Pflaume 2',
    farbnamen: 'Pflaumenblau und Senfgelb',
    primaer: '#3E447F',
    aufPrimaer: '#FFFFFF',
    akzent: '#B4861E',
    ton: '#E0DDE0',
  },
  'pflaume-3': {
    id: 'pflaume-3',
    figur: 'pflaume',
    name: 'Pflaume 3',
    farbnamen: 'Orange und Pflaumenblau',
    primaer: '#A7521A',
    aufPrimaer: '#FFFFFF',
    akzent: '#3E447F',
    ton: '#F3E9DF',
  },
  'kartoffel-1': {
    id: 'kartoffel-1',
    figur: 'kartoffel',
    name: 'Kartoffel 1',
    farbnamen: 'Petrolblau und Ocker',
    primaer: '#1F5C70',
    aufPrimaer: '#FFFFFF',
    akzent: '#B07F2A',
    ton: '#DBE0DE',
  },
  'kartoffel-2': {
    id: 'kartoffel-2',
    figur: 'kartoffel',
    name: 'Kartoffel 2',
    farbnamen: 'Tannengrün und Orange',
    primaer: '#3C5743',
    aufPrimaer: '#FFFFFF',
    akzent: '#C9743A',
    ton: '#DFE0D8',
  },
  'kartoffel-3': {
    id: 'kartoffel-3',
    figur: 'kartoffel',
    name: 'Kartoffel 3',
    farbnamen: 'Tintenblau und Ocker',
    primaer: '#2B4A78',
    aufPrimaer: '#FFFFFF',
    akzent: '#B07F2A',
    ton: '#DDDEDF',
  },
  'avocado-1': {
    id: 'avocado-1',
    figur: 'avocado',
    name: 'Avocado 1',
    farbnamen: 'Tannengrün und Orange',
    primaer: '#3C5743',
    aufPrimaer: '#FFFFFF',
    akzent: '#C9743A',
    ton: '#DFE0D8',
  },
  'avocado-2': {
    id: 'avocado-2',
    figur: 'avocado',
    name: 'Avocado 2',
    farbnamen: 'Avocadogrün und Koralle',
    primaer: '#4A7038',
    aufPrimaer: '#FFFFFF',
    akzent: '#D4674C',
    ton: '#ECEBE1',
  },
  'avocado-3': {
    id: 'avocado-3',
    figur: 'avocado',
    name: 'Avocado 3',
    farbnamen: 'Terrakotta und Avocadogrün',
    primaer: '#AB4F2C',
    aufPrimaer: '#FFFFFF',
    akzent: '#4A7038',
    ton: '#F4E9E0',
  },
} as const satisfies Record<string, Kochwelt>;

export type KochweltId = keyof typeof Kochwelten;

export const STANDARD_KOCHWELT: Kochwelt = Kochwelten['kuerbis-1'];

/** Die Kochwelt zu einer gespeicherten Kennung. Unbekanntes fällt auf den Kürbis zurück (S6-1). */
export function kochwelt(id: string | undefined): Kochwelt {
  return (id && (Kochwelten as Record<string, Kochwelt>)[id]) || STANDARD_KOCHWELT;
}

export function kochweltenFuer(figur: FigurId): Kochwelt[] {
  return Object.values(Kochwelten).filter((welt) => welt.figur === figur);
}

/** Namen, unter denen die Schriften in src/app/_layout.tsx geladen werden. */
export const Schrift = {
  titel: 'Fraunces_600SemiBold',
  text: 'DMSans_400Regular',
  textMittel: 'DMSans_500Medium',
  textFett: 'DMSans_700Bold',
  logo: 'Fredoka_500Medium',
} as const;

export const Abstand = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
} as const;

export const Radius = {
  karte: 20,
  knopf: 14,
} as const;
