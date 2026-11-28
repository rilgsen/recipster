import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Blatt } from '@/components/blatt';
import { Chip, Knopf } from '@/components/bausteine';
import { Abstand, Basis, Schrift } from '@/constants/theme';
import { useHeute } from '@/hooks/use-heute';
import { de } from '@/i18n/de';
import { aufgebrauchtVorschlag } from '@/lib/vorrat';
import type { Planeintrag } from '@/lib/zustand';
import { useDaten, useStore } from '@/store/store';

type Props = {
  eintrag: Planeintrag | null;
  onSchliessen: () => void;
  onFertig?: () => void;
};

/** Fragt nach dem Kochen, welche Zutaten aufgebraucht sind (Spec Abschnitt 3, Vorrat). */
export function Gekochtblatt({ eintrag, onSchliessen, onFertig }: Props) {
  const heute = useHeute();
  const { rezeptNach, katalog } = useDaten();
  const { aktion } = useStore();
  const rezept = eintrag?.rezeptId ? rezeptNach.get(eintrag.rezeptId) : undefined;
  const vorschlag = rezept ? aufgebrauchtVorschlag(rezept, katalog) : [];
  const [geaendert, setGeaendert] = useState<Record<string, boolean>>({});

  const gewaehlt = (id: string, vorgewaehlt: boolean) => geaendert[id] ?? vorgewaehlt;

  return (
    <Blatt
      sichtbar={eintrag !== null}
      titel={de.gekocht.titel}
      onSchliessen={() => {
        setGeaendert({});
        onSchliessen();
      }}>
      <Text style={styles.hinweis}>{de.gekocht.hinweis}</Text>
      <View style={styles.chips}>
        {vorschlag.map(({ zutat, vorgewaehlt }) => (
          <Chip
            key={zutat.id}
            titel={zutat.name}
            aktiv={gewaehlt(zutat.id, vorgewaehlt)}
            onPress={() => setGeaendert((alt) => ({ ...alt, [zutat.id]: !gewaehlt(zutat.id, vorgewaehlt) }))}
          />
        ))}
      </View>
      <Knopf
        titel={de.gekocht.bestaetigen}
        onPress={() => {
          if (eintrag) {
            aktion({
              typ: 'gekocht',
              planId: eintrag.id,
              heute,
              aufgebraucht: vorschlag.filter((v) => gewaehlt(v.zutat.id, v.vorgewaehlt)).map((v) => v.zutat.id),
            });
          }
          setGeaendert({});
          onSchliessen();
          onFertig?.();
        }}
      />
    </Blatt>
  );
}

const styles = StyleSheet.create({
  hinweis: {
    fontFamily: Schrift.text,
    fontSize: 15,
    lineHeight: 21,
    color: Basis.textGedaempft,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Abstand.s,
  },
});
