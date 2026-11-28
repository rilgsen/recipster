import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Abschnitt, Chip, Karte, Knopf } from '@/components/bausteine';
import { Hakenzeile } from '@/components/hakenzeile';
import { Abstand, Basis, Radius, Schrift } from '@/constants/theme';
import { useHeute } from '@/hooks/use-heute';
import { de } from '@/i18n/de';
import { plusTage } from '@/lib/datum';
import { berechneEinkaufsliste, freiePosten, haeufigGekauft, mitHaken, nachAbteilung } from '@/lib/einkauf';
import { formatiereMenge, zutatName } from '@/lib/mengen';
import { neueId } from '@/lib/zustand';
import { useDaten, useStore } from '@/store/store';

const ZEITRAEUME = [7, 14];

export default function Einkauf() {
  const router = useRouter();
  const heute = useHeute();
  const { rezeptNach, katalog } = useDaten();
  const { zustand, aktion } = useStore();
  const [tage, setTage] = useState(7);
  const [eingabe, setEingabe] = useState('');

  const berechnet = useMemo(
    () =>
      berechneEinkaufsliste({
        plan: zustand.plan,
        rezeptNach,
        katalog,
        vorrat: zustand.vorrat,
        von: heute,
        bis: plusTage(heute, tage - 1),
      }),
    [zustand.plan, zustand.vorrat, rezeptNach, katalog, heute, tage]
  );
  const frei = freiePosten({ plan: zustand.plan, rezeptNach, von: heute, bis: plusTage(heute, tage - 1) });
  const freiAbgehakt = frei.filter((f) => f.schluessel in zustand.einkaufAbgehakt);
  const posten = mitHaken(berechnet, zustand.einkaufAbgehakt);
  const gruppen = nachAbteilung(posten);
  // Auch ein Posten, der nach einer Planänderung wieder offen ist, wurde schon einmal gekauft.
  const abgehaktePosten = posten.filter((p) => p.abgehakt || p.schonAbgehakt !== undefined);
  const abgehakt =
    abgehaktePosten.length + freiAbgehakt.length + zustand.einkaufHand.filter((e) => e.abgehakt).length;
  const hatGeplantes = zustand.plan.some((e) => e.rezeptId && !e.gekocht && e.datum >= heute);

  const aufListe = new Set([
    ...posten.map((p) => p.zutat.name.toLowerCase()),
    ...zustand.einkaufHand.map((e) => e.text.toLowerCase()),
  ]);
  const haeufig = haeufigGekauft(zustand.kaufzaehler, aufListe);

  const hinzu = (text: string) => {
    aktion({ typ: 'einkaufHandHinzu', id: neueId(), text });
    setEingabe('');
  };

  return (
    <ScrollView style={styles.seite} contentContainerStyle={styles.inhalt} keyboardShouldPersistTaps="handled">
      <Text style={styles.titel} accessibilityRole="header">
        {de.einkauf.titel}
      </Text>
      <View style={styles.chips}>
        {ZEITRAEUME.map((z) => (
          <Chip key={z} titel={de.einkauf.zeitraum(z)} aktiv={z === tage} onPress={() => setTage(z)} />
        ))}
      </View>

      <Knopf
        titel={de.einkauf.vorratPruefen}
        art="neben"
        hinweis={de.einkauf.vorratHinweis}
        onPress={() => router.push({ pathname: '/vorrat', params: { tage: String(tage) } })}
      />

      {posten.length === 0 && frei.length === 0 ? (
        <Karte style={styles.block}>
          <Text style={styles.textFett}>{hatGeplantes ? de.einkauf.allesDa : de.einkauf.leer}</Text>
          {hatGeplantes ? null : <Text style={styles.hinweis}>{de.einkauf.leerTipp}</Text>}
        </Karte>
      ) : null}

      {gruppen.map((gruppe) => (
        <Abschnitt key={gruppe.abteilung} titel={gruppe.abteilung}>
          <Karte style={styles.liste}>
            {gruppe.posten.map((p) => {
              const menge = p.menge;
              return (
                <Hakenzeile
                  key={p.zutat.id}
                  titel={menge === null ? p.zutat.name : zutatName(p.zutat, menge, p.einheit)}
                  zusatz={
                    p.schonAbgehakt === undefined
                      ? de.einkauf.fuer(p.rezepte.join(', '))
                      : de.einkauf.nochDazu(formatiereMenge(p.zutat, p.schonAbgehakt, p.einheit))
                  }
                  rechts={menge === null ? de.einkauf.nachGeschmack : formatiereMenge(p.zutat, menge, p.einheit)}
                  aktiv={p.abgehakt}
                  onPress={() =>
                    aktion({
                      typ: 'einkaufHaken',
                      zutatId: p.zutat.id,
                      aktiv: !p.abgehakt,
                      // Gemerkt wird der ganze Bedarf, auch wenn nur noch die Differenz offen war.
                      menge: menge === null ? null : menge + (p.schonAbgehakt ?? 0),
                    })
                  }
                />
              );
            })}
          </Karte>
        </Abschnitt>
      ))}

      {frei.length > 0 ? (
        <Abschnitt titel={de.eigenes.sonstiges}>
          <Karte style={styles.liste}>
            {frei.map((f) => (
              <Hakenzeile
                key={f.schluessel}
                titel={f.text}
                zusatz={de.einkauf.fuer(f.rezept)}
                aktiv={f.schluessel in zustand.einkaufAbgehakt}
                onPress={() =>
                  aktion({
                    typ: 'einkaufHaken',
                    zutatId: f.schluessel,
                    aktiv: !(f.schluessel in zustand.einkaufAbgehakt),
                    menge: null,
                  })
                }
              />
            ))}
          </Karte>
        </Abschnitt>
      ) : null}

      <Abschnitt titel={de.einkauf.eigene}>
        <Karte style={styles.liste}>
          {zustand.einkaufHand.map((e) => (
            <View key={e.id} style={styles.handzeile}>
              <View style={styles.flex}>
                <Hakenzeile
                  titel={e.text}
                  aktiv={e.abgehakt}
                  onPress={() => aktion({ typ: 'einkaufHandHaken', id: e.id, aktiv: !e.abgehakt })}
                />
              </View>
              <Pressable
                onPress={() => aktion({ typ: 'einkaufHandEntfernen', id: e.id })}
                accessibilityRole="button"
                accessibilityLabel={de.einkauf.entfernen(e.text)}
                hitSlop={10}
                style={styles.weg}>
                <Text style={styles.wegText}>✕</Text>
              </Pressable>
            </View>
          ))}
          <View style={styles.eingabezeile}>
            <TextInput
              value={eingabe}
              onChangeText={setEingabe}
              onSubmitEditing={() => hinzu(eingabe)}
              placeholder={de.einkauf.eigenePlatzhalter}
              placeholderTextColor={Basis.textGedaempft}
              accessibilityLabel={de.einkauf.eigenePlatzhalter}
              returnKeyType="done"
              maxLength={60}
              style={styles.eingabe}
            />
            <Knopf titel={de.einkauf.hinzufuegen} deaktiviert={!eingabe.trim()} onPress={() => hinzu(eingabe)} />
          </View>
        </Karte>
      </Abschnitt>

      {haeufig.length > 0 ? (
        <Abschnitt titel={de.einkauf.haeufig}>
          <View style={styles.chips}>
            {haeufig.map((name) => (
              <Chip key={name} titel={`+ ${name}`} onPress={() => hinzu(name)} />
            ))}
          </View>
        </Abschnitt>
      ) : null}

      {abgehakt > 0 ? (
        <View style={styles.block}>
          <Knopf
            titel={de.einkauf.abschliessen}
            onPress={() =>
              aktion({
                typ: 'einkaufAbschliessen',
                heute,
                gekauft: abgehaktePosten.map((p) => ({ zutatId: p.zutat.id, name: p.zutat.name })),
                freiGekauft: freiAbgehakt.map((f) => ({ planId: f.planId, text: f.text })),
              })
            }
          />
          <Text style={styles.hinweis}>{de.einkauf.abschliessenHinweis(abgehakt)}</Text>
        </View>
      ) : null}
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
  titel: {
    fontFamily: Schrift.titel,
    fontSize: 32,
    lineHeight: 38,
    color: Basis.text,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Abstand.s,
  },
  block: {
    gap: Abstand.s,
  },
  liste: {
    gap: Abstand.xs,
    paddingVertical: Abstand.s,
  },
  flex: {
    flex: 1,
  },
  handzeile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Abstand.s,
  },
  weg: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wegText: {
    fontSize: 16,
    color: Basis.textGedaempft,
  },
  eingabezeile: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Abstand.s,
    alignItems: 'center',
    paddingVertical: Abstand.xs,
  },
  eingabe: {
    flexGrow: 1,
    flexBasis: 160,
    minHeight: 48,
    borderRadius: Radius.knopf,
    borderWidth: 1,
    borderColor: Basis.linie,
    backgroundColor: Basis.hintergrund,
    paddingHorizontal: Abstand.m,
    fontFamily: Schrift.text,
    fontSize: 17,
    color: Basis.text,
  },
  textFett: {
    fontFamily: Schrift.textFett,
    fontSize: 17,
    lineHeight: 23,
    color: Basis.text,
  },
  hinweis: {
    fontFamily: Schrift.text,
    fontSize: 14,
    lineHeight: 20,
    color: Basis.textGedaempft,
  },
});
