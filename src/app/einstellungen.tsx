import { Stack, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Abstand, Basis, Radius, Schrift, STANDARD_KOCHWELT } from '@/constants/theme';
import { de } from '@/i18n/de';

const PUNKTE = Object.values(de.einstellungen.punkte);

/** Platzhalter: Die Punkte werden mit ihren Bauschritten aktiv. */
export default function Einstellungen() {
  const router = useRouter();
  return (
    <ScrollView style={styles.seite} contentContainerStyle={styles.inhalt}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={() => router.back()} accessibilityRole="button" hitSlop={12}>
              <Text style={styles.fertig}>{de.einstellungen.fertig}</Text>
            </Pressable>
          ),
        }}
      />
      <View style={styles.liste}>
        {PUNKTE.map((punkt, index) => (
          <View key={punkt} style={[styles.zeile, index > 0 && styles.trenner]}>
            <Text style={styles.punkt}>{punkt}</Text>
            <Text style={styles.bald}>{de.einstellungen.bald}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.fuss}>{de.einstellungen.allergene}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  seite: {
    flex: 1,
    backgroundColor: Basis.hintergrund,
  },
  inhalt: {
    padding: Abstand.l,
    gap: Abstand.m,
  },
  liste: {
    backgroundColor: Basis.flaeche,
    borderRadius: Radius.karte,
    borderWidth: 1,
    borderColor: Basis.linie,
  },
  zeile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Abstand.m,
    paddingHorizontal: Abstand.m,
    paddingVertical: Abstand.m,
    minHeight: 56,
  },
  trenner: {
    borderTopWidth: 1,
    borderTopColor: Basis.linie,
  },
  punkt: {
    flex: 1,
    fontFamily: Schrift.textMittel,
    fontSize: 17,
    color: Basis.text,
  },
  bald: {
    fontFamily: Schrift.text,
    fontSize: 14,
    color: Basis.textGedaempft,
  },
  fertig: {
    fontFamily: Schrift.textFett,
    fontSize: 17,
    color: STANDARD_KOCHWELT.primaer,
  },
  fuss: {
    fontFamily: Schrift.text,
    fontSize: 14,
    lineHeight: 20,
    color: Basis.textGedaempft,
  },
});
