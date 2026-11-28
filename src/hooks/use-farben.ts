import { STANDARD_KOCHWELT, type Kochwelt } from '@/constants/theme';

/** Farben der gewählten Kochwelt. Bis Bauschritt 6 ist das immer der Kürbis. */
export function useFarben(): Kochwelt {
  return STANDARD_KOCHWELT;
}
