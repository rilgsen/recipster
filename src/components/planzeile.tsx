import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Abstand, Basis, Schrift } from '@/constants/theme';
import { useFarben } from '@/hooks/use-farben';
import { de } from '@/i18n/de';
import type { Planeintrag } from '@/lib/zustand';
import { useDaten } from '@/store/store';

/** Eine Zeile im Tagesplan: Mahlzeit, Titel oder Notiz, Personen. */
export function Planzeile({ eintrag, onPress }: { eintrag: Planeintrag; onPress: () => void }) {
  const farben = useFarben();
  const { rezeptNach } = useDaten();
  const rezept = eintrag.rezeptId ? rezeptNach.get(eintrag.rezeptId) : undefined;
  const titel = rezept?.titel ?? eintrag.notiz ?? de.woche.rezeptFehlt;
  const angaben = [
    eintrag.mahlzeit,
    eintrag.notiz ? de.woche.notizMarke : null,
    rezept ? de.rezept.minuten(rezept.minuten) : null,
    eintrag.rezeptId ? de.woche.portionen(eintrag.portionen) : null,
    eintrag.gekocht ? de.woche.gekocht : null,
  ].filter(Boolean);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${titel}, ${angaben.join(', ')}`}
      style={({ pressed }) => [styles.zeile, pressed && styles.gedrueckt]}>
      <View style={[styles.balken, { backgroundColor: eintrag.notiz ? Basis.linie : farben.akzent }]} />
      <View style={styles.text}>
        <Text style={[styles.titel, eintrag.gekocht && styles.erledigt]}>{titel}</Text>
        <Text style={styles.angaben}>{angaben.join(' · ')}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  zeile: {
    flexDirection: 'row',
    gap: Abstand.s + 4,
    minHeight: 48,
    alignItems: 'stretch',
  },
  gedrueckt: {
    opacity: 0.6,
  },
  balken: {
    width: 4,
    borderRadius: 2,
  },
  text: {
    flex: 1,
    gap: 2,
    justifyContent: 'center',
  },
  titel: {
    fontFamily: Schrift.textFett,
    fontSize: 17,
    lineHeight: 23,
    color: Basis.text,
  },
  erledigt: {
    textDecorationLine: 'line-through',
    color: Basis.textGedaempft,
  },
  angaben: {
    fontFamily: Schrift.text,
    fontSize: 14,
    lineHeight: 20,
    color: Basis.textGedaempft,
  },
});
