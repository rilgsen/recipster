import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { Abschnitt, Karte } from '@/components/bausteine';
import { Hakenzeile } from '@/components/hakenzeile';
import { Abstand, Basis, Schrift } from '@/constants/theme';
import { useFarben } from '@/hooks/use-farben';
import { useHeute } from '@/hooks/use-heute';
import { de } from '@/i18n/de';
import { plusTage } from '@/lib/datum';
import { berechneEinkaufsliste } from '@/lib/einkauf';
import { baldAufbrauchen, istVorhanden } from '@/lib/vorrat';
import { useDaten, useStore } from '@/store/store';

/** Vorratscheck: Was für den Plan gebraucht wird und was sonst im Haus ist. */
export default function Vorrat() {
  const router = useRouter();
  const farben = useFarben();
  const heute = useHeute();
  const params = useLocalSearchParams<{ tage?: string }>();
  const tage = params.tage === '14' ? 14 : 7;
  const { rezeptNach, katalog } = useDaten();
  const { zustand, aktion } = useStore();

  const gebraucht = useMemo(
    () =>
      berechneEinkaufsliste({
        plan: zustand.plan,
        rezeptNach,
        katalog,
        vorrat: zustand.vorrat,
        von: heute,
        bis: plusTage(heute, tage - 1),
        mitVorhandenen: true,
      }),
    [zustand.plan, zustand.vorrat, rezeptNach, katalog, heute, tage]
  );
  const gebrauchtIds = new Set(gebraucht.map((p) => p.zutat.id));
  const sonst = Object.entries(zustand.vorrat)
    .filter(([id, eintrag]) => eintrag.vorhanden && !gebrauchtIds.has(id) && katalog.has(id))
    .map(([id]) => katalog.get(id)!)
    .sort((a, b) => a.name.localeCompare(b.name, 'de'));
  const bald = new Map(baldAufbrauchen(zustand.vorrat, katalog, heute).map((e) => [e.zutat.id, e.resttage]));

  const baldText = (id: string) => {
    const rest = bald.get(id);
    if (rest === undefined) {
      return undefined;
    }
    return rest === 1 ? de.vorrat.baldMorgen : rest === 0 ? de.vorrat.baldHeute : de.vorrat.baldUeber(-rest);
  };

  return (
    <ScrollView style={styles.seite} contentContainerStyle={styles.inhalt}>
      <Stack.Screen
        options={{
          title: de.vorrat.titel,
          headerRight: () => (
            <Pressable onPress={() => router.back()} accessibilityRole="button" hitSlop={12}>
              <Text style={[styles.fertig, { color: farben.primaer }]}>{de.einstellungen.fertig}</Text>
            </Pressable>
          ),
        }}
      />
      <Text style={styles.hinweis}>{de.vorrat.hinweis}</Text>

      <Abschnitt titel={de.vorrat.fuerPlan}>
        <Karte style={styles.liste}>
          {gebraucht.length === 0 ? <Text style={styles.hinweis}>{de.vorrat.fuerPlanLeer}</Text> : null}
          {gebraucht.map((p) => {
            const da = istVorhanden(p.zutat, zustand.vorrat);
            return (
              <Hakenzeile
                key={p.zutat.id}
                titel={p.zutat.name}
                zusatz={baldText(p.zutat.id) ?? p.zutat.abteilung}
                rechts={da ? de.vorrat.vorhanden : de.vorrat.fehlt}
                aktiv={da}
                streichen={false}
                onPress={() => aktion({ typ: 'vorratSetzen', zutatId: p.zutat.id, vorhanden: !da })}
              />
            );
          })}
        </Karte>
      </Abschnitt>

      <Abschnitt titel={de.vorrat.imHaus}>
        <Karte style={styles.liste}>
          {sonst.length === 0 ? <Text style={styles.hinweis}>{de.vorrat.imHausLeer}</Text> : null}
          {sonst.map((zutat) => (
            <Hakenzeile
              key={zutat.id}
              titel={zutat.name}
              zusatz={baldText(zutat.id) ?? zutat.abteilung}
              aktiv
              streichen={false}
              onPress={() => aktion({ typ: 'vorratSetzen', zutatId: zutat.id, vorhanden: false })}
            />
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
    gap: Abstand.m,
  },
  liste: {
    gap: Abstand.xs,
    paddingVertical: Abstand.s,
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
