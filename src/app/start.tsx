import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Karte, Knopf } from '@/components/bausteine';
import { Kochwahl } from '@/components/kochwahl';
import { Wortmarke } from '@/components/wortmarke';
import { Abstand, Basis, Schrift } from '@/constants/theme';
import { de } from '@/i18n/de';
import { useStore } from '@/store/store';

/** Erster Start: Kochfigur und Farbwelt wählen (S6-1). Ohne Auswahl bleibt der Kürbis. */
export default function Start() {
  const router = useRouter();
  const { aktion } = useStore();

  return (
    <SafeAreaView style={styles.seite}>
      <ScrollView contentContainerStyle={styles.inhalt}>
        <Wortmarke />
        <View style={styles.kopf}>
          <Text style={styles.titel} accessibilityRole="header">
            {de.koch.startTitel}
          </Text>
          <Text style={styles.text}>{de.koch.startText}</Text>
        </View>
        <Kochwahl />
        <Karte>
          <Text style={styles.hinweis}>{de.koch.allergene}</Text>
        </Karte>
        <Knopf
          titel={de.koch.los}
          onPress={() => {
            aktion({ typ: 'startGesehen' });
            router.replace('/');
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  seite: {
    flex: 1,
    backgroundColor: Basis.hintergrund,
  },
  inhalt: {
    padding: Abstand.l,
    gap: Abstand.l,
  },
  kopf: {
    gap: Abstand.s,
  },
  titel: {
    fontFamily: Schrift.titel,
    fontSize: 30,
    lineHeight: 36,
    color: Basis.text,
  },
  text: {
    fontFamily: Schrift.text,
    fontSize: 17,
    lineHeight: 24,
    color: Basis.text,
  },
  hinweis: {
    fontFamily: Schrift.text,
    fontSize: 14,
    lineHeight: 20,
    color: Basis.textGedaempft,
  },
});
