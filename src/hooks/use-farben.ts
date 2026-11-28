import { kochwelt, type Kochwelt } from '@/constants/theme';
import { useStore } from '@/store/store';

/** Farben der gewählten Kochwelt (S6-2). Ohne Auswahl gilt der Kürbis. */
export function useFarben(): Kochwelt {
  const { zustand } = useStore();
  return kochwelt(zustand.einstellungen.kochwelt);
}
