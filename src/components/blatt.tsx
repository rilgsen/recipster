import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Abstand, Basis, Schrift } from '@/constants/theme';
import { de } from '@/i18n/de';

type Props = {
  sichtbar: boolean;
  titel: string;
  onSchliessen: () => void;
  children: ReactNode;
};

/** Blatt, das von unten über den Bildschirm fährt. */
export function Blatt({ sichtbar, titel, onSchliessen, children }: Props) {
  return (
    <Modal visible={sichtbar} transparent animationType="slide" onRequestClose={onSchliessen}>
      <View style={styles.huelle}>
        <Pressable
          style={styles.hintergrund}
          onPress={onSchliessen}
          accessibilityRole="button"
          accessibilityLabel={de.allgemein.schliessen}
        />
        <View style={styles.blatt} accessibilityViewIsModal>
          <View style={styles.kopf}>
            <Text style={styles.titel} accessibilityRole="header">
              {titel}
            </Text>
            <Pressable onPress={onSchliessen} accessibilityRole="button" hitSlop={12}>
              <Text style={styles.schliessen}>{de.allgemein.schliessen}</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.inhalt} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  huelle: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  hintergrund: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(43, 29, 20, 0.45)',
  },
  blatt: {
    maxHeight: '88%',
    backgroundColor: Basis.hintergrund,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  kopf: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Abstand.m,
    paddingHorizontal: Abstand.l,
    paddingTop: Abstand.l,
    paddingBottom: Abstand.s,
  },
  titel: {
    flex: 1,
    fontFamily: Schrift.titel,
    fontSize: 22,
    lineHeight: 28,
    color: Basis.text,
  },
  schliessen: {
    fontFamily: Schrift.textFett,
    fontSize: 16,
    color: Basis.textGedaempft,
  },
  inhalt: {
    padding: Abstand.l,
    paddingBottom: Abstand.xl * 1.5,
    gap: Abstand.m,
  },
});
