import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Lokale Mitteilungen für Kochtimer (Regel K3). Alles ist so gebaut, dass ein Fehler
 * oder eine Ablehnung den Timer in der App nicht verhindert.
 */

export type Erlaubnis = 'ja' | 'nein' | 'nichtVerfuegbar';

const VERFUEGBAR = Platform.OS === 'ios' || Platform.OS === 'android';

export function richteMitteilungenEin(): void {
  if (!VERFUEGBAR) {
    return;
  }
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/** Fragt beim ersten Mal nach der Erlaubnis. */
export async function holeErlaubnis(): Promise<Erlaubnis> {
  if (!VERFUEGBAR) {
    return 'nichtVerfuegbar';
  }
  try {
    const stand = await Notifications.getPermissionsAsync();
    if (stand.granted) {
      return 'ja';
    }
    if (!stand.canAskAgain) {
      return 'nein';
    }
    const antwort = await Notifications.requestPermissionsAsync();
    return antwort.granted ? 'ja' : 'nein';
  } catch {
    return 'nichtVerfuegbar';
  }
}

/** Plant eine Mitteilung mit Ton zur Endzeit. Liefert ihre Kennung oder undefined. */
export async function planeMitteilung(titel: string, text: string, endeMs: number): Promise<string | undefined> {
  if (!VERFUEGBAR) {
    return undefined;
  }
  try {
    return await Notifications.scheduleNotificationAsync({
      content: { title: titel, body: text, sound: true },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(endeMs) },
    });
  } catch {
    return undefined;
  }
}

export async function storniereMitteilung(id: string | undefined): Promise<void> {
  if (!VERFUEGBAR || !id) {
    return;
  }
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // Eine schon gezeigte Mitteilung lässt sich nicht mehr stornieren.
  }
}
