import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Chip, Knopf } from '@/components/bausteine';
import { Rezeptkarte } from '@/components/rezeptkarte';
import { Abstand, Basis, Radius, Schrift } from '@/constants/theme';
import { de } from '@/i18n/de';
import { filtereRezepte, hatAktivenFilter, type Rezeptfilter } from '@/lib/filter';
import { ERNAEHRUNGSFORMEN, MAHLZEITEN, SCHWERPUNKTE } from '@/lib/rezepte';
import { useDaten, useStore } from '@/store/store';

const ZEITEN = [20, 30, 45];

export default function Rezepte() {
  const router = useRouter();
  const { rezepte, katalog } = useDaten();
  const { zustand } = useStore();
  const [filter, setFilter] = useState<Rezeptfilter>({ ernaehrung: zustand.einstellungen.ernaehrung });

  const treffer = useMemo(() => filtereRezepte(rezepte, filter, katalog), [rezepte, filter, katalog]);
  const ernaehrung = filter.ernaehrung ?? [];

  const kopf = (
    <View style={styles.kopf}>
      <Text style={styles.titel} accessibilityRole="header">
        {de.rezepte.titel}
      </Text>
      <TextInput
        value={filter.suchtext ?? ''}
        onChangeText={(suchtext) => setFilter((alt) => ({ ...alt, suchtext }))}
        placeholder={de.rezepte.suche}
        placeholderTextColor={Basis.textGedaempft}
        accessibilityLabel={de.rezepte.suche}
        autoCorrect={false}
        clearButtonMode="while-editing"
        returnKeyType="search"
        style={styles.suche}
      />
      <Filterzeile name={de.rezepte.abschnittMahlzeit}>
        {MAHLZEITEN.map((mahlzeit) => (
          <Chip
            key={mahlzeit}
            titel={mahlzeit}
            aktiv={filter.mahlzeit === mahlzeit}
            onPress={() =>
              setFilter((alt) => ({ ...alt, mahlzeit: alt.mahlzeit === mahlzeit ? undefined : mahlzeit }))
            }
          />
        ))}
      </Filterzeile>
      <Filterzeile name={de.rezepte.abschnittZeit}>
        {ZEITEN.map((minuten) => (
          <Chip
            key={minuten}
            titel={de.rezepte.zeit(minuten)}
            aktiv={filter.maxMinuten === minuten}
            onPress={() =>
              setFilter((alt) => ({ ...alt, maxMinuten: alt.maxMinuten === minuten ? undefined : minuten }))
            }
          />
        ))}
      </Filterzeile>
      <Filterzeile name={de.rezepte.abschnittErnaehrung}>
        {ERNAEHRUNGSFORMEN.map((form) => (
          <Chip
            key={form}
            titel={form}
            aktiv={ernaehrung.includes(form)}
            onPress={() =>
              setFilter((alt) => {
                const bisher = alt.ernaehrung ?? [];
                return {
                  ...alt,
                  ernaehrung: bisher.includes(form) ? bisher.filter((f) => f !== form) : [...bisher, form],
                };
              })
            }
          />
        ))}
      </Filterzeile>
      <Filterzeile name={de.rezepte.abschnittSchwerpunkt}>
        {SCHWERPUNKTE.map((schwerpunkt) => (
          <Chip
            key={schwerpunkt}
            titel={schwerpunkt}
            aktiv={filter.schwerpunkt === schwerpunkt}
            onPress={() =>
              setFilter((alt) => ({
                ...alt,
                schwerpunkt: alt.schwerpunkt === schwerpunkt ? undefined : schwerpunkt,
              }))
            }
          />
        ))}
      </Filterzeile>
      <Knopf titel={de.eigenes.neu} art="neben" onPress={() => router.push('/eigenes')} />
      <Text style={styles.anzahl} accessibilityLiveRegion="polite">
        {de.rezepte.anzahl(treffer.length)}
      </Text>
    </View>
  );

  return (
    <FlatList
      style={styles.seite}
      contentContainerStyle={styles.inhalt}
      data={treffer}
      keyExtractor={(rezept) => rezept.id}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={kopf}
      ItemSeparatorComponent={Trenner}
      renderItem={({ item }) => (
        <Rezeptkarte
          rezept={item}
          onPress={() => router.push({ pathname: '/rezept/[id]', params: { id: item.id } })}
        />
      )}
      ListEmptyComponent={
        <View style={styles.leer}>
          <Text style={styles.leerTitel}>{de.rezepte.keineTreffer}</Text>
          <Text style={styles.leerText}>{de.rezepte.keineTrefferTipp}</Text>
          {hatAktivenFilter(filter) ? (
            <Knopf titel={de.rezepte.zuruecksetzen} art="neben" onPress={() => setFilter({})} />
          ) : null}
        </View>
      }
    />
  );
}

function Trenner() {
  return <View style={styles.trenner} />;
}

function Filterzeile({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel={name}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.filterzeile}>
      {children}
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
    paddingBottom: Abstand.xl,
  },
  kopf: {
    gap: Abstand.s + 2,
    marginBottom: Abstand.m,
  },
  titel: {
    fontFamily: Schrift.titel,
    fontSize: 32,
    lineHeight: 38,
    color: Basis.text,
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
  filterzeile: {
    gap: Abstand.s,
    paddingRight: Abstand.l,
  },
  anzahl: {
    fontFamily: Schrift.textMittel,
    fontSize: 14,
    color: Basis.textGedaempft,
    marginTop: Abstand.xs,
  },
  trenner: {
    height: Abstand.s + 4,
  },
  leer: {
    gap: Abstand.s + 4,
    backgroundColor: Basis.flaeche,
    borderRadius: Radius.karte,
    borderWidth: 1,
    borderColor: Basis.linie,
    padding: Abstand.l,
  },
  leerTitel: {
    fontFamily: Schrift.textFett,
    fontSize: 17,
    color: Basis.text,
  },
  leerText: {
    fontFamily: Schrift.text,
    fontSize: 16,
    lineHeight: 22,
    color: Basis.textGedaempft,
  },
});
