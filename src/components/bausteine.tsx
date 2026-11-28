import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Abstand, Basis, Radius, Schrift } from '@/constants/theme';
import { useFarben } from '@/hooks/use-farben';

type KnopfProps = {
  titel: string;
  onPress: () => void;
  art?: 'haupt' | 'neben' | 'warnung';
  deaktiviert?: boolean;
  style?: StyleProp<ViewStyle>;
  hinweis?: string;
};

export function Knopf({ titel, onPress, art = 'haupt', deaktiviert, style, hinweis }: KnopfProps) {
  const farben = useFarben();
  const flaeche =
    art === 'haupt'
      ? { backgroundColor: farben.primaer, borderColor: farben.primaer }
      : { backgroundColor: 'transparent', borderColor: art === 'warnung' ? Basis.warnung : farben.primaer };
  const textFarbe = art === 'haupt' ? farben.aufPrimaer : art === 'warnung' ? Basis.warnung : farben.primaer;
  return (
    <Pressable
      onPress={onPress}
      disabled={deaktiviert}
      accessibilityRole="button"
      accessibilityHint={hinweis}
      accessibilityState={{ disabled: Boolean(deaktiviert) }}
      style={({ pressed }) => [
        styles.knopf,
        flaeche,
        (pressed || deaktiviert) && styles.gedrueckt,
        style,
      ]}>
      <Text style={[styles.knopfText, { color: textFarbe }]}>{titel}</Text>
    </Pressable>
  );
}

type ChipProps = {
  titel: string;
  aktiv?: boolean;
  onPress?: () => void;
};

export function Chip({ titel, aktiv, onPress }: ChipProps) {
  const farben = useFarben();
  const inhalt = (
    <Text style={[styles.chipText, { color: aktiv ? farben.aufPrimaer : Basis.text }]}>{titel}</Text>
  );
  const flaeche = aktiv
    ? { backgroundColor: farben.primaer, borderColor: farben.primaer }
    : { backgroundColor: Basis.flaeche, borderColor: Basis.linie };
  if (!onPress) {
    return <View style={[styles.chip, flaeche]}>{inhalt}</View>;
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: Boolean(aktiv) }}
      style={[styles.chip, flaeche]}>
      {inhalt}
    </Pressable>
  );
}

export function Karte({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.karte, style]}>{children}</View>;
}

export function Abschnitt({ titel, children }: { titel: string; children: ReactNode }) {
  return (
    <View style={styles.abschnitt}>
      <Text style={styles.abschnittTitel} accessibilityRole="header">
        {titel}
      </Text>
      {children}
    </View>
  );
}

type ZaehlerProps = {
  wert: number;
  min: number;
  max: number;
  onAendern: (wert: number) => void;
  beschriftung: string;
};

/** Plus-Minus-Zähler, zum Beispiel für Personen. */
export function Zaehler({ wert, min, max, onAendern, beschriftung }: ZaehlerProps) {
  const farben = useFarben();
  const knopf = (zeichen: string, ziel: number, name: string) => {
    const aus = ziel < min || ziel > max;
    return (
      <Pressable
        onPress={() => onAendern(ziel)}
        disabled={aus}
        accessibilityRole="button"
        accessibilityLabel={name}
        hitSlop={8}
        style={[styles.zaehlerKnopf, { borderColor: farben.primaer }, aus && styles.gedrueckt]}>
        <Text style={[styles.zaehlerZeichen, { color: farben.primaer }]}>{zeichen}</Text>
      </Pressable>
    );
  };
  return (
    <View style={styles.zaehler} accessibilityLabel={`${beschriftung}: ${wert}`}>
      {knopf('−', wert - 1, `${beschriftung} verringern`)}
      <Text style={styles.zaehlerWert}>{wert}</Text>
      {knopf('+', wert + 1, `${beschriftung} erhöhen`)}
    </View>
  );
}

const styles = StyleSheet.create({
  knopf: {
    minHeight: 48,
    borderRadius: Radius.knopf,
    borderWidth: 1.5,
    paddingHorizontal: Abstand.l,
    paddingVertical: Abstand.s + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  knopfText: {
    fontFamily: Schrift.textFett,
    fontSize: 16,
    textAlign: 'center',
  },
  gedrueckt: {
    opacity: 0.55,
  },
  chip: {
    minHeight: 36,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: Abstand.m - 2,
    paddingVertical: Abstand.xs + 2,
    justifyContent: 'center',
  },
  chipText: {
    fontFamily: Schrift.textMittel,
    fontSize: 14,
  },
  karte: {
    backgroundColor: Basis.flaeche,
    borderRadius: Radius.karte,
    borderWidth: 1,
    borderColor: Basis.linie,
    padding: Abstand.m,
  },
  abschnitt: {
    gap: Abstand.s,
  },
  abschnittTitel: {
    fontFamily: Schrift.textFett,
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Basis.textGedaempft,
  },
  zaehler: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Abstand.m,
  },
  zaehlerKnopf: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zaehlerZeichen: {
    fontFamily: Schrift.textFett,
    fontSize: 22,
    lineHeight: 26,
  },
  zaehlerWert: {
    fontFamily: Schrift.textFett,
    fontSize: 20,
    minWidth: 28,
    textAlign: 'center',
    color: Basis.text,
  },
});
