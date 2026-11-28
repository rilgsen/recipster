import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Abschnitt, Chip, Karte, Knopf, Zaehler } from '@/components/bausteine';
import { Blatt } from '@/components/blatt';
import { Abstand, Basis, Schrift } from '@/constants/theme';
import { useFarben } from '@/hooks/use-farben';
import { useHeute } from '@/hooks/use-heute';
import { de } from '@/i18n/de';
import { kurzesDatum, tageAb } from '@/lib/datum';
import {
  formatiereMenge,
  MAX_PERSONEN,
  MIN_PERSONEN,
  portionsfaktor,
  skaliereMenge,
  zutatName,
} from '@/lib/mengen';
import { tagName } from '@/lib/tagname';
import { istVorhanden } from '@/lib/vorrat';
import { neueId } from '@/lib/zustand';
import { useDaten, useStore } from '@/store/store';

export default function RezeptSeite() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { rezeptNach, katalog } = useDaten();
  const { zustand, aktion } = useStore();
  const farben = useFarben();
  const heute = useHeute();
  const [personen, setPersonen] = useState(zustand.einstellungen.personen);
  const [einplanen, setEinplanen] = useState(false);
  const [meldung, setMeldung] = useState('');

  const rezept = rezeptNach.get(id);
  if (!rezept) {
    return (
      <View style={styles.seite}>
        <Stack.Screen options={{ title: '' }} />
        <View style={styles.inhalt}>
          <Text style={styles.text}>{de.rezept.nichtGefunden}</Text>
        </View>
      </View>
    );
  }

  const faktor = portionsfaktor(personen, rezept.portionen);
  const magIchNicht = Boolean(zustand.rezeptstatus[rezept.id]?.magIchNicht);
  const werte = rezept.naehrwerte;

  return (
    <ScrollView style={styles.seite} contentContainerStyle={styles.inhalt}>
      <Stack.Screen options={{ title: '' }} />
      <Text style={styles.titel} accessibilityRole="header">
        {rezept.titel}
      </Text>
      <Text style={styles.angaben}>
        {[de.rezept.minuten(rezept.minuten), rezept.mahlzeit, ...rezept.schwerpunkt].join(' · ')}
      </Text>
      <View style={styles.chips}>
        {[...rezept.ernaehrung, ...rezept.tags].map((tag) => (
          <Chip key={tag} titel={tag} />
        ))}
      </View>

      <Knopf titel={de.woche.einplanen} onPress={() => setEinplanen(true)} />
      <Knopf
        titel={de.einkauf.aufListe}
        art="neben"
        onPress={() => {
          let zahl = 0;
          for (const zeile of rezept.zutaten) {
            const zutat = katalog.get(zeile.zutat_id);
            if (!zutat || istVorhanden(zutat, zustand.vorrat) || zeile.einheit === 'Prise') {
              continue;
            }
            const menge = skaliereMenge(zeile.menge, zeile.einheit, faktor);
            aktion({
              typ: 'einkaufHandHinzu',
              id: neueId(),
              text: `${formatiereMenge(zutat, menge, zeile.einheit)} ${zutatName(zutat, menge, zeile.einheit)}`,
            });
            zahl += 1;
          }
          setMeldung(de.einkauf.aufListeFertig(zahl));
        }}
      />
      {meldung ? (
        <Text style={[styles.hinweis, { color: farben.primaer }]} accessibilityLiveRegion="polite">
          {meldung}
        </Text>
      ) : null}

      {magIchNicht ? (
        <Karte style={{ backgroundColor: farben.ton, borderColor: farben.ton }}>
          <Text style={styles.text}>{de.rezept.magIchNichtAktiv}</Text>
        </Karte>
      ) : null}

      <Abschnitt titel={de.rezept.zutaten}>
        <Karte style={styles.liste}>
          <View style={styles.personen}>
            <Text style={styles.textFett}>{de.rezept.personen}</Text>
            <Zaehler
              wert={personen}
              min={MIN_PERSONEN}
              max={MAX_PERSONEN}
              onAendern={setPersonen}
              beschriftung={de.rezept.personen}
            />
          </View>
          {rezept.zutaten.map((zeile, index) => {
            const zutat = katalog.get(zeile.zutat_id);
            if (!zutat) {
              return null;
            }
            const menge = skaliereMenge(zeile.menge, zeile.einheit, faktor);
            return (
              <View key={`${zeile.zutat_id}-${index}`} style={styles.zutat}>
                <Text style={styles.menge}>{formatiereMenge(zutat, menge, zeile.einheit)}</Text>
                <Text style={styles.zutatName}>
                  {zutatName(zutat, menge, zeile.einheit)}
                  {zeile.zusatz ? ` (${zeile.zusatz})` : ''}
                </Text>
              </View>
            );
          })}
        </Karte>
      </Abschnitt>

      <Abschnitt titel={de.rezept.zubereitung}>
        {rezept.schritte.map((schritt, index) => (
          <View key={index} style={styles.schritt}>
            <View style={[styles.nummer, { backgroundColor: farben.primaer }]}>
              <Text style={[styles.nummerText, { color: farben.aufPrimaer }]}>{index + 1}</Text>
            </View>
            <View style={styles.schrittText}>
              <Text style={styles.text}>{schritt.text}</Text>
              {schritt.timer_sekunden ? (
                <Text style={[styles.hinweis, { color: farben.primaer }]}>
                  {de.rezept.timer(Math.round(schritt.timer_sekunden / 60))}
                </Text>
              ) : null}
            </View>
          </View>
        ))}
      </Abschnitt>

      {werte ? (
        <Abschnitt titel={`${de.rezept.naehrwerte} (${de.rezept.geschaetzt})`}>
          <Karte style={styles.naehrwerte}>
            <Wert name="kcal" wert={String(werte.kcal)} />
            <Wert name={de.rezept.eiweiss} wert={de.rezept.gramm(werte.eiweiss_g)} />
            <Wert name={de.rezept.kohlenhydrate} wert={de.rezept.gramm(werte.kohlenhydrate_g)} />
            <Wert name={de.rezept.fett} wert={de.rezept.gramm(werte.fett_g)} />
          </Karte>
        </Abschnitt>
      ) : null}

      <Knopf
        titel={magIchNicht ? de.rezept.magIchNichtZurueck : de.rezept.magIchNicht}
        art="neben"
        onPress={() => aktion({ typ: 'magIchNicht', rezeptId: rezept.id, aktiv: !magIchNicht })}
      />

      <Blatt sichtbar={einplanen} titel={de.woche.einplanenTitel} onSchliessen={() => setEinplanen(false)}>
        <View style={styles.chips}>
          {tageAb(heute, 14).map((tag) => (
            <Chip
              key={tag}
              titel={`${tagName(tag, heute).slice(0, 2)} ${kurzesDatum(tag)}`}
              onPress={() => {
                aktion({
                  typ: 'planHinzu',
                  eintrag: {
                    id: neueId(),
                    datum: tag,
                    mahlzeit: rezept.mahlzeit,
                    rezeptId: rezept.id,
                    portionen: personen,
                    gekocht: false,
                  },
                });
                setMeldung(de.woche.eingeplant(`${tagName(tag, heute)}, ${kurzesDatum(tag)}`));
                setEinplanen(false);
              }}
            />
          ))}
        </View>
      </Blatt>
    </ScrollView>
  );
}

function Wert({ name, wert }: { name: string; wert: string }) {
  return (
    <View style={styles.wert}>
      <Text style={styles.textFett}>{wert}</Text>
      <Text style={styles.klein}>{name}</Text>
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
    paddingBottom: Abstand.xl * 2,
    gap: Abstand.m,
  },
  titel: {
    fontFamily: Schrift.titel,
    fontSize: 30,
    lineHeight: 36,
    color: Basis.text,
  },
  angaben: {
    fontFamily: Schrift.textMittel,
    fontSize: 15,
    lineHeight: 21,
    color: Basis.textGedaempft,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Abstand.s,
  },
  liste: {
    gap: Abstand.s + 2,
  },
  personen: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Abstand.s,
    paddingBottom: Abstand.s,
    borderBottomWidth: 1,
    borderBottomColor: Basis.linie,
  },
  zutat: {
    flexDirection: 'row',
    gap: Abstand.m,
  },
  menge: {
    width: '32%',
    fontFamily: Schrift.textFett,
    fontSize: 16,
    lineHeight: 22,
    color: Basis.text,
  },
  zutatName: {
    flex: 1,
    fontFamily: Schrift.text,
    fontSize: 16,
    lineHeight: 22,
    color: Basis.text,
  },
  schritt: {
    flexDirection: 'row',
    gap: Abstand.m,
  },
  nummer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nummerText: {
    fontFamily: Schrift.textFett,
    fontSize: 15,
  },
  schrittText: {
    flex: 1,
    gap: 2,
  },
  text: {
    fontFamily: Schrift.text,
    fontSize: 17,
    lineHeight: 24,
    color: Basis.text,
  },
  textFett: {
    fontFamily: Schrift.textFett,
    fontSize: 16,
    color: Basis.text,
  },
  hinweis: {
    fontFamily: Schrift.textMittel,
    fontSize: 14,
  },
  klein: {
    fontFamily: Schrift.text,
    fontSize: 13,
    color: Basis.textGedaempft,
  },
  naehrwerte: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Abstand.m,
    justifyContent: 'space-between',
  },
  wert: {
    minWidth: 64,
    gap: 2,
  },
});
