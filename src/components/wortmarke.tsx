import { StyleSheet, Text, View } from 'react-native';

import { WORDMARK } from '@/constants/brand';
import { Kochfigur } from '@/components/kochfigur';
import { Abstand, Schrift } from '@/constants/theme';
import { useFarben } from '@/hooks/use-farben';

/** Logo: Kochfigur neben dem klein geschriebenen Schriftzug. */
export function Wortmarke() {
  const farben = useFarben();
  return (
    <View style={styles.reihe} accessible accessibilityRole="header" accessibilityLabel={WORDMARK}>
      <Kochfigur style={styles.figur} />
      <Text style={[styles.schriftzug, { color: farben.akzent }]} maxFontSizeMultiplier={1.3}>
        {WORDMARK}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  reihe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Abstand.s,
  },
  figur: {
    width: 48,
    height: 48,
  },
  schriftzug: {
    fontFamily: Schrift.logo,
    fontSize: 30,
    lineHeight: 38,
  },
});
