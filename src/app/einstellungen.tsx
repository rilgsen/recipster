import { Stack, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Abschnitt, Chip, Karte, Knopf, Zaehler } from '@/components/bausteine';
import { Abstand, Basis, Schrift } from '@/constants/theme';
import { useFarben } from '@/hooks/use-farben';
import { de } from '@/i18n/de';
import { MAX_PERSONEN, MIN_PERSONEN } from '@/lib/mengen';
import { ERNAEHRUNGSFORMEN } from '@/lib/rezepte';
import { magIchNichtIds } from '@/lib/zustand';
import { useDaten, useStore } from '@/store/store';

const SPAETER = [
  de.einstellungen.punkte.profil,
  de.einstellungen.punkte.apps,
  de.einstellungen.punkte.datenschutz,
  de.einstellungen.punkte.hilfe,
];

export default function Einstellungen() {
  const router = useRouter();
  const farben = useFarben();
  const { zustand, aktion } = useStore();
  const { rezeptNach } = useDaten();
  const ausgeschlossen = magIchNichtIds(zustand);

  return (
    <ScrollView style={styles.seite} contentContainerStyle={styles.inhalt}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={() => router.back()} accessibilityRole="button" hitSlop={12}>
              <Text style={[styles.fertig, { color: farben.primaer }]}>{de.einstellungen.fertig}</Text>
            </Pressable>
          ),
        }}
      />

      <Abschnitt titel={de.einstellungen.haushalt}>
        <Karte style={styles.block}>
          <View style={styles.zeileUmbruch}>
            <Text style={styles.punkt}>{de.einstellungen.personen}</Text>
            <Zaehler
              wert={zustand.einstellungen.personen}
              min={MIN_PERSONEN}
              max={MAX_PERSONEN}
              onAendern={(personen) => aktion({ typ: 'personen', personen })}
              beschriftung={de.einstellungen.personen}
            />
          </View>
          <Text style={styles.hinweis}>{de.einstellungen.personenHinweis}</Text>
        </Karte>
      </Abschnitt>

      <Abschnitt titel={de.einstellungen.ernaehrung}>
        <Karte style={styles.block}>
          <View style={styles.chips}>
            {ERNAEHRUNGSFORMEN.map((form) => {
              const aktiv = zustand.einstellungen.ernaehrung.includes(form);
              return (
                <Chip
                  key={form}
                  titel={form}
                  aktiv={aktiv}
                  onPress={() => aktion({ typ: 'ernaehrung', form, aktiv: !aktiv })}
                />
              );
            })}
          </View>
          <Text style={styles.hinweis}>{de.einstellungen.ernaehrungHinweis}</Text>
          <Text style={styles.hinweis}>{de.einstellungen.allergene}</Text>
        </Karte>
      </Abschnitt>

      <Abschnitt titel={de.einstellungen.magIchNicht}>
        <Karte style={styles.block}>
          {ausgeschlossen.length === 0 ? (
            <Text style={styles.hinweis}>{de.einstellungen.magIchNichtLeer}</Text>
          ) : (
            ausgeschlossen.map((id) => (
              <View key={id} style={styles.zeileUmbruch}>
                <Text style={styles.punkt}>{rezeptNach.get(id)?.titel ?? id}</Text>
                <Knopf
                  titel={de.einstellungen.zuruecknehmen}
                  art="neben"
                  onPress={() => aktion({ typ: 'magIchNicht', rezeptId: id, aktiv: false })}
                />
              </View>
            ))
          )}
        </Karte>
      </Abschnitt>

      <Abschnitt titel={de.einstellungen.spaeter}>
        <Karte style={styles.liste}>
          {SPAETER.map((punkt, index) => (
            <View key={punkt} style={[styles.zeile, index > 0 && styles.trenner]}>
              <Text style={styles.punkt}>{punkt}</Text>
              <Text style={styles.bald}>{de.einstellungen.bald}</Text>
            </View>
          ))}
        </Karte>
      </Abschnitt>
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
    paddingBottom: Abstand.xl * 2,
    gap: Abstand.l,
  },
  block: {
    gap: Abstand.s + 4,
  },
  liste: {
    padding: 0,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Abstand.s,
  },
  zeileUmbruch: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Abstand.s + 4,
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
    flexShrink: 1,
    fontFamily: Schrift.textMittel,
    fontSize: 17,
    lineHeight: 23,
    color: Basis.text,
  },
  bald: {
    fontFamily: Schrift.text,
    fontSize: 14,
    color: Basis.textGedaempft,
  },
  hinweis: {
    fontFamily: Schrift.text,
    fontSize: 14,
    lineHeight: 20,
    color: Basis.textGedaempft,
  },
  fertig: {
    fontFamily: Schrift.textFett,
    fontSize: 17,
  },
});
