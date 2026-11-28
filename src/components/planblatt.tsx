import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Blatt } from '@/components/blatt';
import { Chip, Karte, Knopf } from '@/components/bausteine';
import { Abstand, Basis, Radius, Schrift } from '@/constants/theme';
import { useFarben } from '@/hooks/use-farben';
import { de } from '@/i18n/de';
import { type Tag } from '@/lib/datum';
import { MAHLZEITEN, type Mahlzeit } from '@/lib/rezepte';
import { vorschlaege, zutatenImVorrat } from '@/lib/vorschlaege';
import { neueId } from '@/lib/zustand';
import { useDaten, useStore } from '@/store/store';

type Props = {
  datum: Tag | null;
  tagName: string;
  onSchliessen: () => void;
};

type Ansicht = 'start' | 'vorschlag' | 'notiz';

/** Blatt zum Planen eines Tages: Vorschlag durchblättern, aus Rezepten wählen oder Notiz. */
export function Planblatt({ datum, tagName, onSchliessen }: Props) {
  const router = useRouter();
  const farben = useFarben();
  const { rezepte } = useDaten();
  const { zustand, aktion } = useStore();
  const [mahlzeit, setMahlzeit] = useState<Mahlzeit>('Abendessen');
  const [ansicht, setAnsicht] = useState<Ansicht>('start');
  const [stelle, setStelle] = useState(0);
  const [notiz, setNotiz] = useState('');

  const ergebnis = useMemo(
    () =>
      datum
        ? vorschlaege({
            rezepte,
            datum,
            mahlzeit,
            ernaehrung: zustand.einstellungen.ernaehrung,
            rezeptstatus: zustand.rezeptstatus,
            plan: zustand.plan,
            vorrat: zustand.vorrat,
          })
        : null,
    [rezepte, datum, mahlzeit, zustand]
  );

  const schliessen = () => {
    setAnsicht('start');
    setStelle(0);
    setNotiz('');
    onSchliessen();
  };

  const hinzu = (teil: { rezeptId: string } | { notiz: string }) => {
    if (!datum) {
      return;
    }
    aktion({
      typ: 'planHinzu',
      eintrag: {
        id: neueId(),
        datum,
        mahlzeit,
        portionen: zustand.einstellungen.personen,
        gekocht: false,
        ...teil,
      },
    });
    schliessen();
  };

  const liste = ergebnis?.rezepte ?? [];
  const aktuell = liste.length ? liste[stelle % liste.length] : null;

  return (
    <Blatt sichtbar={datum !== null} titel={de.woche.blattTitel(tagName)} onSchliessen={schliessen}>
      <View style={styles.chips} accessibilityLabel={de.woche.mahlzeit}>
        {MAHLZEITEN.map((m) => (
          <Chip
            key={m}
            titel={m}
            aktiv={m === mahlzeit}
            onPress={() => {
              setMahlzeit(m);
              setStelle(0);
            }}
          />
        ))}
      </View>

      {ansicht === 'start' ? (
        <View style={styles.spalte}>
          <Knopf titel={de.woche.vorschlag} onPress={() => setAnsicht('vorschlag')} />
          <Knopf
            titel={de.woche.ausRezepten}
            art="neben"
            onPress={() => {
              const ziel = datum;
              schliessen();
              if (ziel) {
                router.push({ pathname: '/auswahl', params: { datum: ziel, mahlzeit } });
              }
            }}
          />
          <Knopf titel={de.woche.notiz} art="neben" onPress={() => setAnsicht('notiz')} />
        </View>
      ) : null}

      {ansicht === 'vorschlag' ? (
        <View style={styles.spalte}>
          {ergebnis?.gelockert ? (
            <Karte style={{ backgroundColor: farben.ton, borderColor: farben.ton }}>
              <Text style={styles.text}>{de.woche.gelockert}</Text>
            </Karte>
          ) : null}
          {aktuell ? (
            <>
              <Karte style={styles.vorschlag}>
                <Text style={styles.klein} accessibilityLiveRegion="polite">
                  {de.woche.vorschlagNr((stelle % liste.length) + 1, liste.length)}
                </Text>
                <Text style={styles.titel}>{aktuell.titel}</Text>
                <Text style={styles.klein}>
                  {[
                    de.rezept.minuten(aktuell.minuten),
                    aktuell.naehrwerte ? de.rezept.kcal(aktuell.naehrwerte.kcal) : null,
                    ...aktuell.schwerpunkt,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
                <Text style={[styles.klein, { color: farben.primaer }]}>
                  {de.woche.imVorrat(zutatenImVorrat(aktuell, zustand.vorrat), aktuell.zutaten.length)}
                </Text>
              </Karte>
              <Knopf titel={de.woche.auswaehlen} onPress={() => hinzu({ rezeptId: aktuell.id })} />
              <View style={styles.reihe}>
                <Knopf
                  titel={de.woche.vorheriger}
                  art="neben"
                  style={styles.halb}
                  deaktiviert={liste.length < 2}
                  onPress={() => setStelle((s) => (s - 1 + liste.length) % liste.length)}
                />
                <Knopf
                  titel={de.woche.naechster}
                  art="neben"
                  style={styles.halb}
                  deaktiviert={liste.length < 2}
                  onPress={() => setStelle((s) => (s + 1) % liste.length)}
                />
              </View>
            </>
          ) : (
            <Karte>
              <Text style={styles.text}>{de.woche.keinVorschlag}</Text>
            </Karte>
          )}
        </View>
      ) : null}

      {ansicht === 'notiz' ? (
        <View style={styles.spalte}>
          <TextInput
            value={notiz}
            onChangeText={setNotiz}
            placeholder={de.woche.notizPlatzhalter}
            placeholderTextColor={Basis.textGedaempft}
            accessibilityLabel={de.woche.notiz}
            autoFocus
            maxLength={80}
            style={styles.eingabe}
          />
          <Knopf
            titel={de.woche.notizSpeichern}
            deaktiviert={!notiz.trim()}
            onPress={() => hinzu({ notiz: notiz.trim() })}
          />
        </View>
      ) : null}
    </Blatt>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Abstand.s,
  },
  spalte: {
    gap: Abstand.s + 4,
  },
  reihe: {
    flexDirection: 'row',
    gap: Abstand.s + 4,
  },
  halb: {
    flex: 1,
  },
  vorschlag: {
    gap: Abstand.xs,
  },
  titel: {
    fontFamily: Schrift.titel,
    fontSize: 22,
    lineHeight: 28,
    color: Basis.text,
  },
  text: {
    fontFamily: Schrift.text,
    fontSize: 16,
    lineHeight: 22,
    color: Basis.text,
  },
  klein: {
    fontFamily: Schrift.textMittel,
    fontSize: 14,
    lineHeight: 20,
    color: Basis.textGedaempft,
  },
  eingabe: {
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
});
