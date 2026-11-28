import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Blatt } from '@/components/blatt';
import { Abschnitt, Chip, Knopf, Zaehler } from '@/components/bausteine';
import { Abstand, Basis, Schrift } from '@/constants/theme';
import { de } from '@/i18n/de';
import { kurzesDatum, tageAb, type Tag } from '@/lib/datum';
import { MAX_PERSONEN, MIN_PERSONEN } from '@/lib/mengen';
import { tagName } from '@/lib/tagname';
import type { Planeintrag } from '@/lib/zustand';
import { useDaten, useStore } from '@/store/store';

type Props = {
  eintrag: Planeintrag | null;
  heute: Tag;
  onSchliessen: () => void;
  /** Wird gerufen, wenn „Fertig gekocht“ gewählt wurde. */
  onGekocht?: (eintrag: Planeintrag) => void;
};

/** Aktionen für ein geplantes Gericht: ansehen, verschieben, Personen, entfernen. */
export function Eintragsblatt({ eintrag, heute, onSchliessen, onGekocht }: Props) {
  const router = useRouter();
  const { rezeptNach } = useDaten();
  const { aktion } = useStore();
  const rezept = eintrag?.rezeptId ? rezeptNach.get(eintrag.rezeptId) : undefined;
  const titel = eintrag ? (rezept?.titel ?? eintrag.notiz ?? de.woche.rezeptFehlt) : '';
  const start = eintrag && eintrag.datum < heute ? eintrag.datum : heute;

  return (
    <Blatt sichtbar={eintrag !== null} titel={titel} onSchliessen={onSchliessen}>
      {eintrag ? (
        <>
          {rezept ? (
            <Knopf
              titel={de.woche.oeffnen}
              onPress={() => {
                onSchliessen();
                router.push({ pathname: '/rezept/[id]', params: { id: rezept.id } });
              }}
            />
          ) : null}

          {rezept && !eintrag.gekocht && onGekocht ? (
            <Knopf
              titel={de.gekocht.knopf}
              art="neben"
              onPress={() => {
                onSchliessen();
                onGekocht(eintrag);
              }}
            />
          ) : null}

          {eintrag.rezeptId ? (
            <View style={styles.zeile}>
              <Text style={styles.text}>{de.woche.personen}</Text>
              <Zaehler
                wert={eintrag.portionen}
                min={MIN_PERSONEN}
                max={MAX_PERSONEN}
                onAendern={(portionen) => aktion({ typ: 'planPortionen', id: eintrag.id, portionen })}
                beschriftung={de.woche.personen}
              />
            </View>
          ) : null}

          <Abschnitt titel={de.woche.verschieben}>
            <View style={styles.chips}>
              {tageAb(start, 14).map((tag) => (
                <Chip
                  key={tag}
                  titel={`${tagName(tag, heute).slice(0, 2)} ${kurzesDatum(tag)}`}
                  aktiv={tag === eintrag.datum}
                  onPress={() => {
                    aktion({ typ: 'planVerschieben', id: eintrag.id, datum: tag });
                    onSchliessen();
                  }}
                />
              ))}
            </View>
          </Abschnitt>

          <Knopf
            titel={de.woche.entfernen}
            art="warnung"
            onPress={() => {
              aktion({ typ: 'planEntfernen', id: eintrag.id });
              onSchliessen();
            }}
          />
        </>
      ) : null}
    </Blatt>
  );
}

const styles = StyleSheet.create({
  zeile: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Abstand.s,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Abstand.s,
  },
  text: {
    fontFamily: Schrift.textMittel,
    fontSize: 17,
    color: Basis.text,
  },
});
