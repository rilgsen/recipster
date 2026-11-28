import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Abstand, Basis, Schrift } from '@/constants/theme';
import { useFarben } from '@/hooks/use-farben';

type Props = {
  titel: string;
  zusatz?: string;
  rechts?: string;
  aktiv: boolean;
  onPress: () => void;
  /** Durchgestrichen, wenn abgehakt. Beim Vorrat aus, dort heißt der Haken „habe ich“. */
  streichen?: boolean;
};

/** Zeile mit Haken, für Einkaufsliste und Vorrat. */
export function Hakenzeile({ titel, zusatz, rechts, aktiv, onPress, streichen = true }: Props) {
  const farben = useFarben();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: aktiv }}
      accessibilityLabel={[rechts, titel, zusatz].filter(Boolean).join(', ')}
      style={styles.zeile}>
      <View
        style={[
          styles.kasten,
          { borderColor: aktiv ? farben.primaer : Basis.textGedaempft },
          aktiv && { backgroundColor: farben.primaer },
        ]}>
        {aktiv ? <Text style={[styles.haken, { color: farben.aufPrimaer }]}>✓</Text> : null}
      </View>
      <View style={styles.text}>
        <Text style={[styles.titel, aktiv && streichen && styles.erledigt]}>{titel}</Text>
        {zusatz ? <Text style={styles.zusatz}>{zusatz}</Text> : null}
      </View>
      {rechts ? <Text style={[styles.rechts, aktiv && streichen && styles.erledigt]}>{rechts}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  zeile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Abstand.s + 4,
    minHeight: 48,
    paddingVertical: Abstand.xs,
  },
  kasten: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  haken: {
    fontFamily: Schrift.textFett,
    fontSize: 15,
    lineHeight: 18,
  },
  text: {
    flex: 1,
    gap: 1,
  },
  titel: {
    fontFamily: Schrift.textMittel,
    fontSize: 17,
    lineHeight: 23,
    color: Basis.text,
  },
  zusatz: {
    fontFamily: Schrift.text,
    fontSize: 13,
    lineHeight: 18,
    color: Basis.textGedaempft,
  },
  rechts: {
    fontFamily: Schrift.textFett,
    fontSize: 15,
    color: Basis.text,
    textAlign: 'right',
    maxWidth: '38%',
  },
  erledigt: {
    textDecorationLine: 'line-through',
    color: Basis.textGedaempft,
  },
});
