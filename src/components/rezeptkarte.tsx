import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Abstand, Basis, Radius, Schrift } from '@/constants/theme';
import { useFarben } from '@/hooks/use-farben';
import { de } from '@/i18n/de';
import type { Rezept } from '@/lib/rezepte';

type Props = {
  rezept: Rezept;
  onPress: () => void;
  zusatz?: string;
};

export function Rezeptkarte({ rezept, onPress, zusatz }: Props) {
  const farben = useFarben();
  const angaben = [
    de.rezept.minuten(rezept.minuten),
    rezept.naehrwerte ? de.rezept.kcal(rezept.naehrwerte.kcal) : null,
    rezept.mahlzeit,
  ].filter(Boolean);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${rezept.titel}, ${angaben.join(', ')}`}
      style={({ pressed }) => [styles.karte, pressed && styles.gedrueckt]}>
      <View style={[styles.marke, { backgroundColor: farben.ton }]}>
        <Text style={[styles.markeText, { color: farben.primaer }]}>{rezept.schwerpunkt[0] ?? ''}</Text>
      </View>
      <View style={styles.text}>
        <Text style={styles.titel}>{rezept.titel}</Text>
        <Text style={styles.angaben}>{angaben.join(' · ')}</Text>
        {zusatz ? <Text style={[styles.zusatz, { color: farben.primaer }]}>{zusatz}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  karte: {
    flexDirection: 'row',
    gap: Abstand.m,
    alignItems: 'center',
    backgroundColor: Basis.flaeche,
    borderRadius: Radius.karte,
    borderWidth: 1,
    borderColor: Basis.linie,
    padding: Abstand.m,
  },
  gedrueckt: {
    opacity: 0.7,
  },
  marke: {
    width: 64,
    minHeight: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Abstand.xs,
  },
  markeText: {
    fontFamily: Schrift.textFett,
    fontSize: 12,
    textAlign: 'center',
  },
  text: {
    flex: 1,
    gap: 2,
  },
  titel: {
    fontFamily: Schrift.titel,
    fontSize: 18,
    lineHeight: 23,
    color: Basis.text,
  },
  angaben: {
    fontFamily: Schrift.text,
    fontSize: 14,
    lineHeight: 20,
    color: Basis.textGedaempft,
  },
  zusatz: {
    fontFamily: Schrift.textMittel,
    fontSize: 13,
  },
});
