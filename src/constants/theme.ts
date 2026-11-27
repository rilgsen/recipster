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

export type Kochwelt = {
  id: string;
  name: string;
  /** Knöpfe und aktive Elemente */
  primaer: string;
  /** Text auf der Primärfarbe */
  aufPrimaer: string;
  /** Schriftzug und Akzente */
  akzent: string;
  /** Helle Fläche für Hinweise und Karten */
  ton: string;
};

export const Kochwelten = {
  kuerbis: {
    id: 'kuerbis',
    name: 'Kürbis',
    primaer: '#1F5C70',
    aufPrimaer: '#FFFFFF',
    akzent: '#D2691E',
    ton: '#D9E3E3',
  },
} as const satisfies Record<string, Kochwelt>;

export const STANDARD_KOCHWELT: Kochwelt = Kochwelten.kuerbis;

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
