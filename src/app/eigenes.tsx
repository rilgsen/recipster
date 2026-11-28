import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Abschnitt, Chip, Karte, Knopf, Zaehler } from '@/components/bausteine';
import { Abstand, Basis, Radius, Schrift } from '@/constants/theme';
import { useFarben } from '@/hooks/use-farben';
import { de } from '@/i18n/de';
import { importiere } from '@/lib/abruf';
import { erlaubteEinheiten, schlageVor, sucheZutaten, zerlegeZutat, type Importfehler } from '@/lib/import';
import type { Rezepteinheit, Zutat } from '@/lib/katalog';
import { formatiereZahl, MAX_PERSONEN, MIN_PERSONEN } from '@/lib/mengen';
import { ERNAEHRUNGSFORMEN, MAHLZEITEN, type Mahlzeit, type Rezept } from '@/lib/rezepte';
import { EIGEN_PRAEFIX, neueId, pruefeEigenesRezept } from '@/lib/zustand';
import { useDaten, useStore } from '@/store/store';

/** Eine Zutatenzeile im Formular: entweder dem Katalog zugeordnet oder freier Text (I3). */
type Zeile = {
  schluessel: string;
  text: string;
  zutatId?: string;
  menge: string;
  einheit: Rezepteinheit;
};

type Schrittzeile = { schluessel: string; text: string; timer_sekunden?: number };

function leereZeile(): Zeile {
  return { schluessel: neueId(), text: '', menge: '', einheit: 'g' };
}

function zeileAusText(text: string, zutaten: readonly Zutat[]): Zeile {
  const vorschlag = schlageVor(text, zutaten);
  if (vorschlag.art === 'katalog') {
    return {
      schluessel: neueId(),
      text: vorschlag.text,
      zutatId: vorschlag.zutat.id,
      menge: formatiereZahl(Math.round(vorschlag.menge * 100) / 100),
      einheit: vorschlag.einheit,
    };
  }
  return { ...leereZeile(), text: vorschlag.text };
}

function zeilenAus(rezept: Rezept): Zeile[] {
  return [
    ...rezept.zutaten.map((z) => ({
      schluessel: neueId(),
      text: '',
      zutatId: z.zutat_id,
      menge: formatiereZahl(z.menge),
      einheit: z.einheit,
    })),
    ...(rezept.freie_zutaten ?? []).map((text) => ({ ...leereZeile(), text })),
  ];
}

function alsZahl(text: string): number {
  return Number(text.replace(',', '.').replace('½', '.5').replace(/\s+/g, ''));
}

/** Eigenes Rezept anlegen, aus einem Link holen oder ändern (Regeln I1 bis I5). */
export default function Eigenes() {
  const router = useRouter();
  const farben = useFarben();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { katalog, zutaten } = useDaten();
  const { zustand, aktion } = useStore();
  const vorhanden = id ? zustand.eigeneRezepte.find((r) => r.id === id) : undefined;

  const [link, setLink] = useState(vorhanden?.quellenlink ?? '');
  const [laedt, setLaedt] = useState(false);
  const [fehler, setFehler] = useState<Importfehler | null>(null);
  const [meldung, setMeldung] = useState('');
  const [titel, setTitel] = useState(vorhanden?.titel ?? '');
  const [mahlzeit, setMahlzeit] = useState<Mahlzeit>(vorhanden?.mahlzeit ?? 'Abendessen');
  const [minuten, setMinuten] = useState(vorhanden?.minuten ? String(vorhanden.minuten) : '');
  const [portionen, setPortionen] = useState(vorhanden?.portionen ?? zustand.einstellungen.personen);
  const [ernaehrung, setErnaehrung] = useState<string[]>(vorhanden?.ernaehrung ?? []);
  const [zeilen, setZeilen] = useState<Zeile[]>(() => (vorhanden ? zeilenAus(vorhanden) : [leereZeile()]));
  const [schritte, setSchritte] = useState<Schrittzeile[]>(() =>
    vorhanden
      ? vorhanden.schritte.map((s) => ({ schluessel: neueId(), text: s.text, timer_sekunden: s.timer_sekunden }))
      : [{ schluessel: neueId(), text: '' }]
  );
  const [unvollstaendig, setUnvollstaendig] = useState(false);
  const [loeschen, setLoeschen] = useState(false);

  const aendereZeile = (schluessel: string, teile: Partial<Zeile>) =>
    setZeilen((alt) => alt.map((z) => (z.schluessel === schluessel ? { ...z, ...teile } : z)));

  const holen = async () => {
    setLaedt(true);
    setFehler(null);
    setMeldung('');
    const ergebnis = await importiere(link);
    setLaedt(false);
    if ('fehler' in ergebnis) {
      setFehler(ergebnis.fehler);
      return;
    }
    const neueZeilen = ergebnis.rezept.zutaten.map((text) => zeileAusText(text, zutaten));
    setLink(ergebnis.link);
    setTitel(ergebnis.rezept.titel);
    setPortionen(ergebnis.rezept.portionen);
    setMinuten(ergebnis.rezept.minuten ? String(ergebnis.rezept.minuten) : '');
    setZeilen(neueZeilen.length > 0 ? neueZeilen : [leereZeile()]);
    setSchritte(
      ergebnis.rezept.schritte.length > 0
        ? ergebnis.rezept.schritte.map((text) => ({ schluessel: neueId(), text }))
        : [{ schluessel: neueId(), text: '' }]
    );
    const zugeordnet = neueZeilen.filter((z) => z.zutatId).length;
    setMeldung(de.eigenes.gefunden(zugeordnet, neueZeilen.length - zugeordnet));
  };

  const speichern = () => {
    const rezept = pruefeEigenesRezept({
      id: vorhanden?.id ?? `${EIGEN_PRAEFIX}${neueId()}`,
      titel,
      mahlzeit,
      minuten: alsZahl(minuten) || 0,
      portionen,
      ernaehrung,
      zutaten: zeilen
        .filter((z) => z.zutatId)
        .map((z) => ({
          zutat_id: z.zutatId as string,
          menge: z.einheit === 'Prise' ? alsZahl(z.menge) || 1 : alsZahl(z.menge),
          einheit: z.einheit,
        })),
      freie_zutaten: zeilen.filter((z) => !z.zutatId).map((z) => z.text),
      schritte: schritte.map((s) => ({ text: s.text, timer_sekunden: s.timer_sekunden })),
      // Der Link gilt nur, wenn er zu diesem Rezept gehört: nach einem Import oder beim Ändern.
      quellenlink: meldung || vorhanden?.quellenlink ? link : undefined,
    });
    const mengeFehlt = zeilen.some((z) => z.zutatId && z.einheit !== 'Prise' && !(alsZahl(z.menge) > 0));
    if (!rezept || mengeFehlt) {
      setUnvollstaendig(true);
      return;
    }
    aktion({ typ: 'eigenesRezeptSpeichern', rezept });
    router.back();
  };

  return (
    <ScrollView style={styles.seite} contentContainerStyle={styles.inhalt} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: vorhanden ? de.eigenes.titelAendern : de.eigenes.titelNeu }} />

      {vorhanden ? null : (
        <Karte style={styles.block}>
          <Text style={styles.label}>{de.eigenes.link}</Text>
          <TextInput
            value={link}
            onChangeText={setLink}
            placeholder={de.eigenes.linkPlatzhalter}
            placeholderTextColor={Basis.textGedaempft}
            accessibilityLabel={de.eigenes.link}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            style={styles.eingabe}
          />
          <Knopf
            titel={laedt ? de.eigenes.laedt : de.eigenes.importieren}
            art="neben"
            deaktiviert={laedt || !link.trim()}
            onPress={holen}
          />
          {fehler ? (
            <Text style={[styles.hinweis, { color: Basis.warnung }]} accessibilityLiveRegion="polite">
              {de.eigenes.fehler[fehler]}
            </Text>
          ) : null}
          {meldung ? (
            <Text style={[styles.hinweis, { color: farben.primaer }]} accessibilityLiveRegion="polite">
              {meldung}
            </Text>
          ) : null}
          <Text style={styles.hinweis}>{de.eigenes.importHinweis}</Text>
        </Karte>
      )}

      <Karte style={styles.block}>
        <Text style={styles.label}>{de.eigenes.name}</Text>
        <TextInput
          value={titel}
          onChangeText={setTitel}
          accessibilityLabel={de.eigenes.name}
          maxLength={120}
          style={styles.eingabe}
        />
        <Text style={styles.label}>{de.eigenes.mahlzeit}</Text>
        <View style={styles.chips}>
          {MAHLZEITEN.map((m) => (
            <Chip key={m} titel={m} aktiv={m === mahlzeit} onPress={() => setMahlzeit(m)} />
          ))}
        </View>
        <View style={styles.zeile}>
          <Text style={styles.label}>{de.eigenes.portionen}</Text>
          <Zaehler
            wert={portionen}
            min={MIN_PERSONEN}
            max={MAX_PERSONEN}
            onAendern={setPortionen}
            beschriftung={de.eigenes.portionen}
          />
        </View>
        <View style={styles.zeile}>
          <Text style={styles.label}>{de.eigenes.minuten}</Text>
          <TextInput
            value={minuten}
            onChangeText={(text) => setMinuten(text.replace(/[^0-9]/g, '').slice(0, 4))}
            accessibilityLabel={de.eigenes.minuten}
            keyboardType="number-pad"
            style={[styles.eingabe, styles.kurz]}
          />
        </View>
        <Text style={styles.label}>{de.eigenes.ernaehrung}</Text>
        <View style={styles.chips}>
          {ERNAEHRUNGSFORMEN.map((form) => (
            <Chip
              key={form}
              titel={form}
              aktiv={ernaehrung.includes(form)}
              onPress={() =>
                setErnaehrung((alt) => (alt.includes(form) ? alt.filter((f) => f !== form) : [...alt, form]))
              }
            />
          ))}
        </View>
      </Karte>

      <Abschnitt titel={de.eigenes.zutaten}>
        {zeilen.map((zeile) => {
          const zutat = zeile.zutatId ? katalog.get(zeile.zutatId) : undefined;
          const treffer = zutat ? [] : sucheZutaten(zeile.text, zutaten);
          return (
            <Karte key={zeile.schluessel} style={styles.block}>
              {zutat ? (
                <>
                  <View style={styles.zeile}>
                    <Text style={styles.zutat}>{zutat.name}</Text>
                    <Entfernen
                      name={zutat.name}
                      onPress={() => setZeilen((alt) => alt.filter((z) => z.schluessel !== zeile.schluessel))}
                    />
                  </View>
                  {zeile.text ? <Text style={styles.hinweis}>{zeile.text}</Text> : null}
                  <View style={styles.zeile}>
                    <TextInput
                      value={zeile.menge}
                      onChangeText={(menge) => aendereZeile(zeile.schluessel, { menge })}
                      placeholder={de.eigenes.menge}
                      placeholderTextColor={Basis.textGedaempft}
                      accessibilityLabel={`${de.eigenes.menge} ${zutat.name}`}
                      keyboardType="decimal-pad"
                      maxLength={7}
                      style={[styles.eingabe, styles.kurz]}
                    />
                    <View style={[styles.chips, styles.flex]}>
                      {erlaubteEinheiten(zutat).map((einheit) => (
                        <Chip
                          key={einheit}
                          titel={einheit === 'Stück' && zutat.stueck_name ? zutat.stueck_name : einheit}
                          aktiv={einheit === zeile.einheit}
                          onPress={() => aendereZeile(zeile.schluessel, { einheit })}
                        />
                      ))}
                    </View>
                  </View>
                  <Knopf
                    titel={de.eigenes.loesen}
                    art="neben"
                    onPress={() =>
                      aendereZeile(zeile.schluessel, {
                        zutatId: undefined,
                        text: zeile.text || `${zeile.menge} ${zeile.einheit} ${zutat.name}`.trim(),
                      })
                    }
                  />
                </>
              ) : (
                <>
                  <View style={styles.zeile}>
                    <TextInput
                      value={zeile.text}
                      onChangeText={(text) => aendereZeile(zeile.schluessel, { text })}
                      placeholder={de.eigenes.zutatPlatzhalter}
                      placeholderTextColor={Basis.textGedaempft}
                      accessibilityLabel={de.eigenes.zutaten}
                      maxLength={160}
                      style={[styles.eingabe, styles.flex]}
                    />
                    <Entfernen
                      name={zeile.text}
                      onPress={() => setZeilen((alt) => alt.filter((z) => z.schluessel !== zeile.schluessel))}
                    />
                  </View>
                  {treffer.length > 0 ? (
                    <View style={styles.chips}>
                      <Text style={styles.hinweis}>{de.eigenes.zuordnen}</Text>
                      {treffer.map((kandidat) => (
                        <Chip
                          key={kandidat.id}
                          titel={kandidat.name}
                          onPress={() => {
                            const zerlegt = zerlegeZutat(zeile.text);
                            const erlaubt = erlaubteEinheiten(kandidat);
                            aendereZeile(zeile.schluessel, {
                              zutatId: kandidat.id,
                              menge: zerlegt.menge ? formatiereZahl(Math.round(zerlegt.menge * 100) / 100) : '',
                              einheit:
                                zerlegt.einheit && erlaubt.includes(zerlegt.einheit)
                                  ? zerlegt.einheit
                                  : kandidat.basis_einheit,
                            });
                          }}
                        />
                      ))}
                    </View>
                  ) : null}
                  {zeile.text.trim() ? <Text style={styles.hinweis}>{de.eigenes.freiHinweis}</Text> : null}
                </>
              )}
            </Karte>
          );
        })}
        <Knopf
          titel={de.eigenes.zutatHinzu}
          art="neben"
          onPress={() => setZeilen((alt) => [...alt, leereZeile()])}
        />
      </Abschnitt>

      <Abschnitt titel={de.eigenes.schritte}>
        {schritte.map((schritt, index) => (
          <View key={schritt.schluessel} style={styles.zeile}>
            <Text style={[styles.nummer, { color: farben.primaer }]}>{index + 1}</Text>
            <TextInput
              value={schritt.text}
              onChangeText={(text) =>
                setSchritte((alt) => alt.map((s) => (s.schluessel === schritt.schluessel ? { ...s, text } : s)))
              }
              placeholder={de.eigenes.schrittPlatzhalter}
              placeholderTextColor={Basis.textGedaempft}
              accessibilityLabel={de.kochen.schritt(index + 1, schritte.length)}
              multiline
              maxLength={600}
              style={[styles.eingabe, styles.flex, styles.mehrzeilig]}
            />
            <Entfernen
              name={de.kochen.schritt(index + 1, schritte.length)}
              onPress={() => setSchritte((alt) => alt.filter((s) => s.schluessel !== schritt.schluessel))}
            />
          </View>
        ))}
        <Knopf
          titel={de.eigenes.schrittHinzu}
          art="neben"
          onPress={() => setSchritte((alt) => [...alt, { schluessel: neueId(), text: '' }])}
        />
      </Abschnitt>

      {unvollstaendig ? (
        <Text style={[styles.hinweis, { color: Basis.warnung }]} accessibilityLiveRegion="polite">
          {de.eigenes.unvollstaendig}
        </Text>
      ) : null}
      <Knopf titel={de.eigenes.speichern} onPress={speichern} />

      {vorhanden ? (
        loeschen ? (
          <Karte style={styles.block}>
            <Text style={styles.label}>{de.eigenes.loeschenFrage}</Text>
            <Knopf
              titel={de.eigenes.loeschenJa}
              art="warnung"
              onPress={() => {
                aktion({ typ: 'eigenesRezeptLoeschen', id: vorhanden.id });
                router.dismissTo('/rezepte');
              }}
            />
          </Karte>
        ) : (
          <Knopf titel={de.eigenes.loeschen} art="warnung" onPress={() => setLoeschen(true)} />
        )
      ) : null}
    </ScrollView>
  );
}

function Entfernen({ name, onPress }: { name: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${de.eigenes.entfernen}: ${name}`}
      hitSlop={10}
      style={styles.weg}>
      <Text style={styles.wegText}>✕</Text>
    </Pressable>
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
  block: {
    gap: Abstand.s,
  },
  zeile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Abstand.s,
  },
  flex: {
    flex: 1,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Abstand.s,
  },
  label: {
    fontFamily: Schrift.textFett,
    fontSize: 15,
    color: Basis.text,
  },
  zutat: {
    flex: 1,
    fontFamily: Schrift.textFett,
    fontSize: 17,
    color: Basis.text,
  },
  eingabe: {
    minHeight: 48,
    borderRadius: Radius.knopf,
    borderWidth: 1,
    borderColor: Basis.linie,
    backgroundColor: Basis.hintergrund,
    paddingHorizontal: Abstand.m,
    paddingVertical: Abstand.s,
    fontFamily: Schrift.text,
    fontSize: 17,
    color: Basis.text,
  },
  kurz: {
    width: 96,
  },
  mehrzeilig: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  nummer: {
    width: 20,
    fontFamily: Schrift.textFett,
    fontSize: 17,
  },
  hinweis: {
    fontFamily: Schrift.text,
    fontSize: 14,
    lineHeight: 20,
    color: Basis.textGedaempft,
  },
  weg: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wegText: {
    fontSize: 18,
    color: Basis.textGedaempft,
  },
});
