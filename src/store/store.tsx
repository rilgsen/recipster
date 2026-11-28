import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
} from 'react';

import { alsKarte, MITGELIEFERTE_REZEPTE, MITGELIEFERTE_ZUTATEN, type Rezept } from '@/lib/rezepte';
import type { Zutat } from '@/lib/katalog';
import { reduziere, STARTZUSTAND, type Aktion, type Zustand } from '@/lib/zustand';

import { ladeZustand, speichereZustand } from './speicher';

type Inhalt = {
  zustand: Zustand;
  aktion: Dispatch<Aktion>;
  geladen: boolean;
};

const Kontext = createContext<Inhalt | null>(null);

export function ZustandsAnbieter({ children }: { children: ReactNode }) {
  const [zustand, aktion] = useReducer(reduziere, STARTZUSTAND);
  const [geladen, setGeladen] = useState(false);

  useEffect(() => {
    let aktiv = true;
    ladeZustand().then((gespeichert) => {
      if (aktiv) {
        aktion({ typ: 'geladen', zustand: gespeichert });
        setGeladen(true);
      }
    });
    return () => {
      aktiv = false;
    };
  }, []);

  useEffect(() => {
    if (geladen) {
      speichereZustand(zustand);
    }
  }, [zustand, geladen]);

  const inhalt = useMemo(() => ({ zustand, aktion, geladen }), [zustand, geladen]);
  return <Kontext.Provider value={inhalt}>{children}</Kontext.Provider>;
}

export function useStore(): Inhalt {
  const inhalt = useContext(Kontext);
  if (!inhalt) {
    throw new Error('useStore braucht den ZustandsAnbieter');
  }
  return inhalt;
}

/** Mitgelieferte Daten als Nachschlagetabellen. */
export function useDaten(): {
  rezepte: readonly Rezept[];
  rezeptNach: ReadonlyMap<string, Rezept>;
  katalog: ReadonlyMap<string, Zutat>;
} {
  return DATEN;
}

const DATEN = {
  rezepte: MITGELIEFERTE_REZEPTE,
  rezeptNach: alsKarte(MITGELIEFERTE_REZEPTE),
  katalog: alsKarte(MITGELIEFERTE_ZUTATEN),
};
