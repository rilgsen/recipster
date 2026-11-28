import AsyncStorage from '@react-native-async-storage/async-storage';

import { ausGespeichertem, type Zustand } from '@/lib/zustand';

/** Einzige Stelle, die weiß, wie der Zustand gespeichert wird (docs/entscheidungen/0002). */
const SCHLUESSEL = 'recipster.zustand.v1';

export async function ladeZustand(): Promise<Zustand> {
  try {
    const text = await AsyncStorage.getItem(SCHLUESSEL);
    return ausGespeichertem(text ? JSON.parse(text) : null);
  } catch {
    return ausGespeichertem(null);
  }
}

export async function speichereZustand(zustand: Zustand): Promise<void> {
  try {
    await AsyncStorage.setItem(SCHLUESSEL, JSON.stringify(zustand));
  } catch {
    // Speichern kann bei vollem Gerät scheitern. Die App läuft dann mit dem Stand im Arbeitsspeicher weiter.
  }
}
