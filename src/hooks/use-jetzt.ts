import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/**
 * Die aktuelle Zeit in Millisekunden, zweimal je Sekunde neu, solange `aktiv` gilt.
 * Kommt die App in den Vordergrund, wird sofort neu gelesen (S5-2).
 */
export function useJetzt(aktiv: boolean): number {
  const [jetzt, setJetzt] = useState(() => Date.now());
  useEffect(() => {
    if (!aktiv) {
      return;
    }
    const takt = setInterval(() => setJetzt(Date.now()), 500);
    const abo = AppState.addEventListener('change', (status) => {
      if (status === 'active') {
        setJetzt(Date.now());
      }
    });
    return () => {
      clearInterval(takt);
      abo.remove();
    };
  }, [aktiv]);
  return jetzt;
}
