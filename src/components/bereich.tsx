import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Abstand, Basis, Radius, Schrift } from '@/constants/theme';

type Props = {
  titel: string;
  hinweis?: string;
  children?: ReactNode;
};

/** Gemeinsamer Rahmen der vier Bereiche: Titel, Inhalt, Hinweis bei leerem Zustand. */
export function Bereich({ titel, hinweis, children }: Props) {
  return (
    <ScrollView style={styles.seite} contentContainerStyle={styles.inhalt}>
      <Text style={styles.titel} accessibilityRole="header">
        {titel}
      </Text>
      {children}
      {hinweis ? (
        <View style={styles.karte}>
          <Text style={styles.hinweis}>{hinweis}</Text>
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
    gap: Abstand.m,
  },
  titel: {
    fontFamily: Schrift.titel,
    fontSize: 32,
    lineHeight: 38,
    color: Basis.text,
  },
  karte: {
    backgroundColor: Basis.flaeche,
    borderRadius: Radius.karte,
    borderWidth: 1,
    borderColor: Basis.linie,
    padding: Abstand.l,
  },
  hinweis: {
    fontFamily: Schrift.text,
    fontSize: 17,
    lineHeight: 24,
    color: Basis.textGedaempft,
  },
});
