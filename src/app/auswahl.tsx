import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

import { Rezeptkarte } from '@/components/rezeptkarte';
import { Abstand, Basis, Radius, Schrift } from '@/constants/theme';
import { de } from '@/i18n/de';
import { filtereRezepte } from '@/lib/filter';
import { MAHLZEITEN, type Mahlzeit } from '@/lib/rezepte';
import { neueId } from '@/lib/zustand';
import { useDaten, useStore } from '@/store/store';

/** Rezept für einen Tag aus der ganzen Liste wählen. */
export default function Auswahl() {
  const router = useRouter();
  const { datum, mahlzeit } = useLocalSearchParams<{ datum: string; mahlzeit: string }>();
  const { rezepte, katalog } = useDaten();
  const { zustand, aktion } = useStore();
  const [suchtext, setSuchtext] = useState('');
  const gewaehlteMahlzeit = MAHLZEITEN.includes(mahlzeit as Mahlzeit) ? (mahlzeit as Mahlzeit) : 'Abendessen';

  const treffer = useMemo(
    () =>
      filtereRezepte(rezepte, { suchtext, ernaehrung: zustand.einstellungen.ernaehrung }, katalog).filter(
        (rezept) => !zustand.rezeptstatus[rezept.id]?.magIchNicht
      ),
    [rezepte, suchtext, zustand, katalog]
  );

  return (
    <FlatList
      style={styles.seite}
      contentContainerStyle={styles.inhalt}
      data={treffer}
      keyExtractor={(rezept) => rezept.id}
      keyboardShouldPersistTaps="handled"
      ItemSeparatorComponent={Trenner}
      ListHeaderComponent={
        <View style={styles.kopf}>
          <Stack.Screen options={{ title: de.woche.wahlTitel }} />
          <TextInput
            value={suchtext}
            onChangeText={setSuchtext}
            placeholder={de.rezepte.suche}
            placeholderTextColor={Basis.textGedaempft}
            accessibilityLabel={de.rezepte.suche}
            autoCorrect={false}
            style={styles.suche}
          />
        </View>
      }
      ListEmptyComponent={<Text style={styles.leer}>{de.rezepte.keineTreffer}</Text>}
      renderItem={({ item }) => (
        <Rezeptkarte
          rezept={item}
          onPress={() => {
            if (datum) {
              aktion({
                typ: 'planHinzu',
                eintrag: {
                  id: neueId(),
                  datum,
                  mahlzeit: gewaehlteMahlzeit,
                  rezeptId: item.id,
                  portionen: zustand.einstellungen.personen,
                  gekocht: false,
                },
              });
            }
            router.back();
          }}
        />
      )}
    />
  );
}

function Trenner() {
  return <View style={styles.trenner} />;
}

const styles = StyleSheet.create({
  seite: {
    flex: 1,
    backgroundColor: Basis.hintergrund,
  },
  inhalt: {
    padding: Abstand.l,
    paddingBottom: Abstand.xl,
  },
  kopf: {
    marginBottom: Abstand.m,
  },
  suche: {
    minHeight: 48,
    borderRadius: Radius.knopf,
    borderWidth: 1,
    borderColor: Basis.linie,
    backgroundColor: Basis.flaeche,
    paddingHorizontal: Abstand.m,
    fontFamily: Schrift.text,
    fontSize: 17,
    color: Basis.text,
  },
  trenner: {
    height: Abstand.s + 4,
  },
  leer: {
    fontFamily: Schrift.text,
    fontSize: 16,
    color: Basis.textGedaempft,
  },
});
