import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Bereich } from '@/components/bereich';
import { Abstand, Basis, Radius, Schrift, STANDARD_KOCHWELT } from '@/constants/theme';
import { de } from '@/i18n/de';

export default function Heute() {
  return (
    <Bereich titel={de.heute.titel} hinweis={de.heute.leer}>
      <View style={styles.tipp}>
        <Image
          source={require('@/assets/images/koch-kuerbis.png')}
          style={styles.figur}
          contentFit="contain"
          accessible={false}
        />
        <View style={styles.tippText}>
          <Text style={styles.tippTitel}>{de.heute.tippTitel}</Text>
          <Text style={styles.tippInhalt}>{de.heute.tipp}</Text>
        </View>
      </View>
    </Bereich>
  );
}

const styles = StyleSheet.create({
  tipp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Abstand.m,
    backgroundColor: STANDARD_KOCHWELT.ton,
    borderRadius: Radius.karte,
    padding: Abstand.m,
  },
  figur: {
    width: 72,
    height: 72,
  },
  tippText: {
    flex: 1,
    gap: Abstand.xs,
  },
  tippTitel: {
    fontFamily: Schrift.textFett,
    fontSize: 15,
    color: STANDARD_KOCHWELT.primaer,
  },
  tippInhalt: {
    fontFamily: Schrift.text,
    fontSize: 16,
    lineHeight: 22,
    color: Basis.text,
  },
});
