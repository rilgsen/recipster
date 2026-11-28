import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Karte, Knopf } from '@/components/bausteine';
import { Eintragsblatt } from '@/components/eintragsblatt';
import { Gekochtblatt } from '@/components/gekochtblatt';
import { Planblatt } from '@/components/planblatt';
import { Planzeile } from '@/components/planzeile';
import { Abstand, Basis, Schrift } from '@/constants/theme';
import { useFarben } from '@/hooks/use-farben';
import { useHeute } from '@/hooks/use-heute';
import { de } from '@/i18n/de';
import { kurzesDatum, plusTage, tageAb, type Tag } from '@/lib/datum';
import { tagName } from '@/lib/tagname';
import { planFuerTag } from '@/lib/zustand';
import { useStore } from '@/store/store';

export default function Woche() {
  const farben = useFarben();
  const heute = useHeute();
  const { zustand } = useStore();
  const [versatz, setVersatz] = useState(0);
  const [planTag, setPlanTag] = useState<Tag | null>(null);
  const [eintragId, setEintragId] = useState<string | null>(null);
  const [gekochtId, setGekochtId] = useState<string | null>(null);

  const start = plusTage(heute, versatz * 7);
  const tage = tageAb(start, 7);
  const eintrag = zustand.plan.find((e) => e.id === eintragId) ?? null;

  return (
    <ScrollView style={styles.seite} contentContainerStyle={styles.inhalt}>
      <Text style={styles.titel} accessibilityRole="header">
        {de.woche.titel}
      </Text>
      <View style={styles.wechsel}>
        <Knopf
          titel="‹"
          art="neben"
          hinweis={de.woche.frueher}
          deaktiviert={versatz <= -4}
          onPress={() => setVersatz((v) => v - 1)}
        />
        <Text style={styles.zeitraum}>
          {kurzesDatum(tage[0])} bis {kurzesDatum(tage[6])}
        </Text>
        <Knopf
          titel="›"
          art="neben"
          hinweis={de.woche.spaeter}
          deaktiviert={versatz >= 8}
          onPress={() => setVersatz((v) => v + 1)}
        />
      </View>

      {tage.map((tag) => {
        const eintraege = planFuerTag(zustand, tag);
        const name = tagName(tag, heute);
        return (
          <Karte key={tag} style={styles.tag}>
            <View style={styles.tagKopf}>
              <Text style={styles.tagName} accessibilityRole="header">
                {name}
              </Text>
              <Text style={styles.datum}>{kurzesDatum(tag)}</Text>
            </View>
            {eintraege.length === 0 ? <Text style={styles.leer}>{de.woche.nichts}</Text> : null}
            {eintraege.map((e) => (
              <Planzeile key={e.id} eintrag={e} onPress={() => setEintragId(e.id)} />
            ))}
            <Pressable
              onPress={() => setPlanTag(tag)}
              accessibilityRole="button"
              accessibilityLabel={de.woche.hinzufuegenFuer(name)}
              style={styles.hinzu}>
              <Text style={[styles.hinzuText, { color: farben.primaer }]}>+ {de.woche.hinzufuegen}</Text>
            </Pressable>
          </Karte>
        );
      })}

      <Planblatt
        datum={planTag}
        tagName={planTag ? tagName(planTag, heute) : ''}
        onSchliessen={() => setPlanTag(null)}
      />
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
  titel: {
    fontFamily: Schrift.titel,
    fontSize: 32,
    lineHeight: 38,
    color: Basis.text,
  },
  wechsel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Abstand.s,
  },
  zeitraum: {
    flex: 1,
    textAlign: 'center',
    fontFamily: Schrift.textMittel,
    fontSize: 16,
    color: Basis.textGedaempft,
  },
  tag: {
    gap: Abstand.s + 4,
  },
  tagKopf: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: Abstand.s,
  },
  tagName: {
    fontFamily: Schrift.titel,
    fontSize: 20,
    color: Basis.text,
  },
  datum: {
    fontFamily: Schrift.text,
    fontSize: 14,
    color: Basis.textGedaempft,
  },
  leer: {
    fontFamily: Schrift.text,
    fontSize: 15,
    color: Basis.textGedaempft,
  },
  hinzu: {
    minHeight: 44,
    justifyContent: 'center',
  },
  hinzuText: {
    fontFamily: Schrift.textFett,
    fontSize: 16,
  },
});
