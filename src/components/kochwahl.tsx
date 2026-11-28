import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Kochfigur } from '@/components/kochfigur';
import { Abstand, Basis, Kochfiguren, kochweltenFuer, Radius, Schrift } from '@/constants/theme';
import { useFarben } from '@/hooks/use-farben';
import { de } from '@/i18n/de';
import { useStore } from '@/store/store';

/** Auswahl von Kochfigur und Farbwelt (S6-1, S6-2). Jede Wahl gilt sofort. */
export function Kochwahl() {
  const farben = useFarben();
  const { aktion } = useStore();

  return (
    <View style={styles.block}>
      <View style={styles.figuren} accessibilityRole="radiogroup" accessibilityLabel={de.koch.figur}>
        {Kochfiguren.map((figur) => {
          const aktiv = figur.id === farben.figur;
          return (
            <Pressable
              key={figur.id}
              onPress={() => {
                if (!aktiv) {
                  aktion({ typ: 'kochwelt', id: kochweltenFuer(figur.id)[0].id });
                }
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected: aktiv }}
              accessibilityLabel={figur.name}
              style={[
                styles.figur,
                aktiv ? { borderColor: farben.primaer, backgroundColor: farben.ton } : null,
              ]}>
              <Kochfigur figur={figur.id} style={styles.bild} />
              <Text style={[styles.name, aktiv ? { color: farben.primaer } : null]}>{figur.name}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.titel}>{de.koch.farben}</Text>
      <View style={styles.welten} accessibilityRole="radiogroup" accessibilityLabel={de.koch.farben}>
        {kochweltenFuer(farben.figur).map((welt) => {
          const aktiv = welt.id === farben.id;
          return (
            <Pressable
              key={welt.id}
              onPress={() => aktion({ typ: 'kochwelt', id: welt.id })}
              accessibilityRole="radio"
              accessibilityState={{ selected: aktiv }}
              accessibilityLabel={welt.farbnamen}
              style={[styles.welt, aktiv ? { borderColor: welt.primaer } : null]}>
              <View style={styles.punkte}>
                <View style={[styles.punkt, { backgroundColor: welt.primaer }]} />
                <View style={[styles.punkt, { backgroundColor: welt.akzent }]} />
              </View>
              <Text style={styles.weltName}>{welt.farbnamen}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: Abstand.m,
  },
  figuren: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Abstand.s,
  },
  figur: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 96,
    alignItems: 'center',
    gap: Abstand.xs,
    paddingVertical: Abstand.m,
    paddingHorizontal: Abstand.s,
    borderRadius: Radius.karte,
    borderWidth: 2,
    borderColor: Basis.linie,
    backgroundColor: Basis.flaeche,
  },
  bild: {
    width: 72,
    height: 72,
  },
  name: {
    fontFamily: Schrift.textFett,
    fontSize: 15,
    color: Basis.text,
  },
  titel: {
    fontFamily: Schrift.textFett,
    fontSize: 15,
    color: Basis.textGedaempft,
  },
  welten: {
    gap: Abstand.s,
  },
  welt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Abstand.m,
    minHeight: 52,
    paddingVertical: Abstand.s,
    paddingHorizontal: Abstand.m,
    borderRadius: Radius.knopf,
    borderWidth: 2,
    borderColor: Basis.linie,
    backgroundColor: Basis.flaeche,
  },
  punkte: {
    flexDirection: 'row',
    gap: Abstand.xs,
  },
  punkt: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  weltName: {
    flex: 1,
    fontFamily: Schrift.textMittel,
    fontSize: 16,
    color: Basis.text,
  },
});
