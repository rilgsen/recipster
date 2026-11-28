import { useKeepAwake } from 'expo-keep-awake';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Karte, Knopf } from '@/components/bausteine';
import { Gekochtblatt } from '@/components/gekochtblatt';
import { Kochfigur } from '@/components/kochfigur';
import { Abstand, Basis, Schrift } from '@/constants/theme';
import { useFarben } from '@/hooks/use-farben';
import { useHeute } from '@/hooks/use-heute';
import { useJetzt } from '@/hooks/use-jetzt';
import { de } from '@/i18n/de';
import { begrenzePersonen, formatiereMenge, mengeImRezept, portionsfaktor, zutatName } from '@/lib/mengen';
import { holeErlaubnis, planeMitteilung, storniereMitteilung, type Erlaubnis } from '@/lib/mitteilungen';
import { endzeit, formatiereRest, restSekunden } from '@/lib/timer';
import { neueId, type Planeintrag } from '@/lib/zustand';
import { useDaten, useStore } from '@/store/store';

/** Wird nur aus Aktionen gerufen, nie beim Zeichnen. */
function endeAbJetzt(sekunden: number): number {
  return endzeit(Date.now(), sekunden);
}

/** Kochmodus: ein Schritt je Bildschirm, Timer, Tipp vom Koch (Spec Abschnitt 3, K1 bis K4). */
export default function Kochen() {
  useKeepAwake();
  const router = useRouter();
  const { id, plan, personen: personenText } = useLocalSearchParams<{ id: string; plan?: string; personen?: string }>();
  const { rezeptNach, katalog } = useDaten();
  const { zustand, aktion } = useStore();
  const farben = useFarben();
  const heute = useHeute();
  const [index, setIndex] = useState(0);
  const [zutatenOffen, setZutatenOffen] = useState(false);
  const [erlaubnis, setErlaubnis] = useState<Erlaubnis | null>(null);
  const [abschluss, setAbschluss] = useState<Planeintrag | null>(null);

  const rezept = rezeptNach.get(id);
  const planeintrag = plan ? zustand.plan.find((e) => e.id === plan) : undefined;
  const personen = begrenzePersonen(
    planeintrag?.portionen ?? (personenText ? Number(personenText) : zustand.einstellungen.personen)
  );
  const meineTimer = zustand.timer.filter((t) => t.rezeptId === id);
  // Der Takt läuft immer, damit ein frisch gestarteter Timer nicht mit einer alten Zeit rechnet.
  const jetzt = useJetzt(true);

  useEffect(() => {
    let aktiv = true;
    holeErlaubnis().then((antwort) => {
      if (aktiv) {
        setErlaubnis(antwort);
      }
    });
    return () => {
      aktiv = false;
    };
  }, []);

  if (!rezept || rezept.schritte.length === 0) {
    return (
      <View style={styles.seite}>
        <Stack.Screen options={{ title: '' }} />
        <View style={styles.inhalt}>
          <Text style={styles.text}>{rezept ? de.kochen.ohneSchritte : de.rezept.nichtGefunden}</Text>
        </View>
      </View>
    );
  }

  const anzahl = rezept.schritte.length;
  const schritt = rezept.schritte[Math.min(index, anzahl - 1)];
  const letzter = index >= anzahl - 1;
  const faktor = portionsfaktor(personen, rezept.portionen);
  const timerHier = meineTimer.find((t) => t.schritt === index);
  const andereTimer = meineTimer.filter((t) => t.schritt !== index).sort((a, b) => a.endeMs - b.endeMs);

  const starteTimer = async (sekunden: number) => {
    const endeMs = endeAbJetzt(sekunden);
    const mitteilungId =
      erlaubnis === 'ja'
        ? await planeMitteilung(de.kochen.mitteilungTitel(rezept.titel), de.kochen.mitteilungText(index + 1), endeMs)
        : undefined;
    aktion({
      typ: 'timerStart',
      timer: { rezeptId: rezept.id, schritt: index, endeMs, ...(mitteilungId ? { mitteilungId } : {}) },
    });
    aktion({ typ: 'stummHinweisGesehen' });
  };

  const stoppeTimer = (schrittIndex: number) => {
    const timer = meineTimer.find((t) => t.schritt === schrittIndex);
    storniereMitteilung(timer?.mitteilungId);
    aktion({ typ: 'timerStopp', rezeptId: rezept.id, schritt: schrittIndex });
  };

  const fertig = () => {
    for (const timer of meineTimer) {
      stoppeTimer(timer.schritt);
    }
    setAbschluss(
      planeintrag ?? {
        id: neueId(),
        datum: heute,
        mahlzeit: rezept.mahlzeit,
        rezeptId: rezept.id,
        portionen: personen,
        gekocht: false,
      }
    );
  };

  return (
    <View style={styles.seite}>
      <Stack.Screen options={{ title: rezept.titel }} />
      <ScrollView contentContainerStyle={styles.inhalt}>
        <Text style={[styles.zaehler, { color: farben.primaer }]} accessibilityRole="header">
          {de.kochen.schritt(index + 1, anzahl)}
        </Text>
        <View style={styles.balken} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {rezept.schritte.map((_, i) => (
            <View
              key={i}
              style={[styles.balkenTeil, { backgroundColor: i <= index ? farben.primaer : Basis.linie }]}
            />
          ))}
        </View>

        <Text style={styles.schritt}>{schritt.text}</Text>

        {schritt.timer_sekunden ? (
          <Karte style={styles.block}>
            {timerHier ? (
              <>
                <Text style={[styles.uhr, { color: farben.primaer }]} accessibilityLiveRegion="polite">
                  {restSekunden(timerHier.endeMs, jetzt) > 0
                    ? formatiereRest(Math.min(schritt.timer_sekunden, restSekunden(timerHier.endeMs, jetzt)))
                    : de.kochen.timerFertig}
                </Text>
                <Knopf titel={de.kochen.timerStopp} art="neben" onPress={() => stoppeTimer(index)} />
              </>
            ) : (
              <>
                {erlaubnis === 'nein' ? <Text style={styles.hinweis}>{de.kochen.ohneMitteilung}</Text> : null}
                {erlaubnis === 'nichtVerfuegbar' ? (
                  <Text style={styles.hinweis}>{de.kochen.ohneMitteilungHier}</Text>
                ) : null}
                {erlaubnis === 'ja' && !zustand.gesehen.stummHinweis ? (
                  <Text style={styles.hinweis}>{de.kochen.stummHinweis}</Text>
                ) : null}
                <Knopf
                  titel={de.kochen.timerStart(formatiereRest(schritt.timer_sekunden))}
                  deaktiviert={erlaubnis === null}
                  onPress={() => starteTimer(schritt.timer_sekunden as number)}
                />
              </>
            )}
          </Karte>
        ) : null}

        {andereTimer.length > 0 ? (
          <Karte style={styles.block}>
            <Text style={[styles.klein, { color: farben.primaer }]}>{de.kochen.laufend}</Text>
            {andereTimer.map((timer) => {
              const rest = restSekunden(timer.endeMs, jetzt);
              return (
                <View key={timer.schritt} style={styles.timerzeile}>
                  <Text style={styles.text}>
                    {rest > 0
                      ? de.kochen.timerSchritt(timer.schritt + 1, formatiereRest(rest))
                      : de.kochen.timerSchrittFertig(timer.schritt + 1)}
                  </Text>
                  <Knopf titel={de.kochen.timerStopp} art="neben" onPress={() => stoppeTimer(timer.schritt)} />
                </View>
              );
            })}
          </Karte>
        ) : null}

        {schritt.tipp ? (
          <View style={[styles.tipp, { backgroundColor: farben.ton }]}>
            <Kochfigur style={styles.koch} />
            <View style={styles.tippText}>
              <Text style={[styles.klein, { color: farben.primaer }]}>{de.kochen.tipp}</Text>
              <Text style={styles.text}>{schritt.tipp}</Text>
            </View>
          </View>
        ) : null}

        <Knopf
          titel={zutatenOffen ? de.kochen.zutatenAus : de.kochen.zutaten}
          art="neben"
          onPress={() => setZutatenOffen((offen) => !offen)}
        />
        {zutatenOffen ? (
          <Karte style={styles.block}>
            <Text style={styles.hinweis}>{de.kochen.portionenHinweis(personen)}</Text>
            {rezept.zutaten.map((zeile, i) => {
              const zutat = katalog.get(zeile.zutat_id);
              if (!zutat) {
                return null;
              }
              const menge = mengeImRezept(zutat, zeile, faktor);
              return (
                <Text key={`${zeile.zutat_id}-${i}`} style={styles.text}>
                  {formatiereMenge(zutat, menge, zeile.einheit)} {zutatName(zutat, menge, zeile.einheit)}
                  {zeile.zusatz ? ` (${zeile.zusatz})` : ''}
                </Text>
              );
            })}
          </Karte>
        ) : null}
      </ScrollView>

      <View style={styles.leiste}>
        <Knopf
          titel={de.kochen.zurueck}
          art="neben"
          deaktiviert={index === 0}
          style={styles.halb}
          onPress={() => setIndex((i) => Math.max(0, i - 1))}
        />
        {letzter ? (
          <Knopf titel={de.gekocht.knopf} style={styles.halb} onPress={fertig} />
        ) : (
          <Knopf
            titel={de.kochen.weiter}
            style={styles.halb}
            onPress={() => setIndex((i) => Math.min(anzahl - 1, i + 1))}
          />
        )}
      </View>

      <Gekochtblatt
        eintrag={abschluss}
        neu={!planeintrag}
        onSchliessen={() => setAbschluss(null)}
        onFertig={() => router.back()}
      />
    </View>
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
    gap: Abstand.m,
  },
  zaehler: {
    fontFamily: Schrift.textFett,
    fontSize: 15,
  },
  balken: {
    flexDirection: 'row',
    gap: Abstand.xs,
  },
  balkenTeil: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  schritt: {
    fontFamily: Schrift.titel,
    fontSize: 26,
    lineHeight: 34,
    color: Basis.text,
  },
  block: {
    gap: Abstand.s,
  },
  uhr: {
    fontFamily: Schrift.titel,
    fontSize: 44,
    lineHeight: 52,
    textAlign: 'center',
  },
  timerzeile: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Abstand.s,
  },
  tipp: {
    flexDirection: 'row',
    gap: Abstand.m,
    padding: Abstand.m,
    borderRadius: 20,
    alignItems: 'center',
  },
  koch: {
    width: 64,
    height: 64,
  },
  tippText: {
    flex: 1,
    gap: Abstand.xs,
  },
  klein: {
    fontFamily: Schrift.textFett,
    fontSize: 14,
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
  leiste: {
    flexDirection: 'row',
    gap: Abstand.m,
    padding: Abstand.l,
    borderTopWidth: 1,
    borderTopColor: Basis.linie,
    backgroundColor: Basis.hintergrund,
  },
  halb: {
    flex: 1,
  },
});
