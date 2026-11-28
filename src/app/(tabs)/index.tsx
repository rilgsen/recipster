import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Karte, Knopf } from '@/components/bausteine';
import { Eintragsblatt } from '@/components/eintragsblatt';
import { Kochfigur } from '@/components/kochfigur';
import { Gekochtblatt } from '@/components/gekochtblatt';
import { Planblatt } from '@/components/planblatt';
import { Planzeile } from '@/components/planzeile';
import { Abstand, Basis, Radius, Schrift } from '@/constants/theme';
import { useFarben } from '@/hooks/use-farben';
import { useHeute } from '@/hooks/use-heute';
import { de } from '@/i18n/de';
import { kurzesDatum, wochentag } from '@/lib/datum';
import { baldAufbrauchen } from '@/lib/vorrat';
import { planFuerTag } from '@/lib/zustand';
import { useDaten, useStore } from '@/store/store';

export default function Heute() {
  const router = useRouter();
  const farben = useFarben();
  const heute = useHeute();
  const { zustand } = useStore();
  const { katalog } = useDaten();
  const bald = baldAufbrauchen(zustand.vorrat, katalog, heute);
  const [planen, setPlanen] = useState(false);
  const [eintragId, setEintragId] = useState<string | null>(null);
  const [gekochtId, setGekochtId] = useState<string | null>(null);
  const eintraege = planFuerTag(zustand, heute);
  const eintrag = zustand.plan.find((e) => e.id === eintragId) ?? null;

  return (
    <ScrollView style={styles.seite} contentContainerStyle={styles.inhalt}>
      <Text style={styles.datum}>
        {wochentag(heute)}, {kurzesDatum(heute)}
      </Text>
      <Text style={styles.titel} accessibilityRole="header">
        {de.heute.titel}
      </Text>

      <Karte style={styles.plan}>
        {eintraege.length === 0 ? <Text style={styles.leer}>{de.heute.leer}</Text> : null}
        {eintraege.map((e) => (
          <Planzeile key={e.id} eintrag={e} onPress={() => setEintragId(e.id)} />
        ))}
        <Knopf titel={de.heute.planen} onPress={() => setPlanen(true)} />
        <Knopf titel={de.heute.zurWoche} art="neben" onPress={() => router.push('/woche')} />
      </Karte>

      {bald.length > 0 ? (
        <Karte style={styles.plan}>
          <Text style={[styles.tippTitel, { color: farben.primaer }]} accessibilityRole="header">
            {de.vorrat.bald}
          </Text>
          {bald.map(({ zutat, resttage }) => (
            <Text key={zutat.id} style={styles.tippInhalt}>
              {zutat.name}:{' '}
              {resttage > 1
                ? de.vorrat.baldTage(resttage)
                : resttage === 1
                  ? de.vorrat.baldMorgen
                  : resttage === 0
                    ? de.vorrat.baldHeute
                    : de.vorrat.baldUeber(-resttage)}
            </Text>
          ))}
          <Text style={styles.klein}>{de.vorrat.baldHinweis}</Text>
        </Karte>
      ) : null}

      {eintraege.length === 0 ? (
        <View style={[styles.tipp, { backgroundColor: farben.ton }]}>
          <Kochfigur style={styles.figur} />
          <View style={styles.tippText}>
            <Text style={[styles.tippTitel, { color: farben.primaer }]}>{de.heute.tippTitel}</Text>
            <Text style={styles.tippInhalt}>{de.heute.tipp}</Text>
          </View>
        </View>
      ) : null}

      <Planblatt datum={planen ? heute : null} tagName={de.allgemein.heute} onSchliessen={() => setPlanen(false)} />
      <Eintragsblatt
        eintrag={eintrag}
        heute={heute}
        onSchliessen={() => setEintragId(null)}
        onGekocht={(e) => setGekochtId(e.id)}
      />
      <Gekochtblatt
        eintrag={zustand.plan.find((e) => e.id === gekochtId) ?? null}
        onSchliessen={() => setGekochtId(null)}
      />
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
    gap: Abstand.m,
  },
  datum: {
    fontFamily: Schrift.textMittel,
    fontSize: 15,
    color: Basis.textGedaempft,
  },
  titel: {
    fontFamily: Schrift.titel,
    fontSize: 32,
    lineHeight: 38,
    color: Basis.text,
  },
  plan: {
    gap: Abstand.s + 4,
  },
  leer: {
    fontFamily: Schrift.text,
    fontSize: 17,
    lineHeight: 24,
    color: Basis.textGedaempft,
  },
  tipp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Abstand.m,
    borderRadius: Radius.karte,
    padding: Abstand.m,
  },
  figur: {
    width: 72,
    height: 72,
  },
  tippText: {
    flex: 1,
    gap: Abstand.xs,
  },
  tippTitel: {
    fontFamily: Schrift.textFett,
    fontSize: 15,
  },
  klein: {
    fontFamily: Schrift.text,
    fontSize: 13,
    lineHeight: 18,
    color: Basis.textGedaempft,
  },
  tippInhalt: {
    fontFamily: Schrift.text,
    fontSize: 16,
    lineHeight: 22,
    color: Basis.text,
  },
});
