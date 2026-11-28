import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { alsTag, type Tag } from '@/lib/datum';

/** Der heutige Tag. Wird neu bestimmt, wenn die App wieder in den Vordergrund kommt. */
export function useHeute(): Tag {
  const [heute, setHeute] = useState(() => alsTag(new Date()));
  useEffect(() => {
    const abo = AppState.addEventListener('change', (status) => {
      if (status === 'active') {
        setHeute(alsTag(new Date()));
      }
    });
    return () => abo.remove();
  }, []);
  return heute;
}
