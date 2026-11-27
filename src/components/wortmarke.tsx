import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { WORDMARK } from '@/constants/brand';
import { Abstand, Schrift, STANDARD_KOCHWELT } from '@/constants/theme';

/** Logo: Kochfigur neben dem klein geschriebenen Schriftzug. */
export function Wortmarke() {
  return (
    <View style={styles.reihe} accessible accessibilityRole="header" accessibilityLabel={WORDMARK}>
      <Image
        source={require('@/assets/images/koch-kuerbis.png')}
        style={styles.figur}
        contentFit="contain"
      />
      <Text style={styles.schriftzug} maxFontSizeMultiplier={1.3}>
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
    width: 36,
    height: 36,
  },
  schriftzug: {
    fontFamily: Schrift.logo,
    fontSize: 26,
    color: STANDARD_KOCHWELT.akzent,
  },
});
