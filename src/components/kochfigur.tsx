import { Image, type ImageStyle } from 'expo-image';
import type { StyleProp } from 'react-native';

import type { FigurId } from '@/constants/theme';
import { useFarben } from '@/hooks/use-farben';

const BILDER: Record<FigurId, number> = {
  kuerbis: require('@/assets/images/koch-kuerbis.png'),
  pilz: require('@/assets/images/koch-pilz.png'),
  olive: require('@/assets/images/koch-olive.png'),
  pflaume: require('@/assets/images/koch-pflaume.png'),
  kartoffel: require('@/assets/images/koch-kartoffel.png'),
  avocado: require('@/assets/images/koch-avocado.png'),
};

type Props = {
  /** Ohne Angabe die gewählte Figur. */
  figur?: FigurId;
  style?: StyleProp<ImageStyle>;
};

/** Bild einer Kochfigur. Es ist Schmuck und wird von VoiceOver übersprungen. */
export function Kochfigur({ figur, style }: Props) {
  const farben = useFarben();
  return (
    <Image
      source={BILDER[figur ?? farben.figur]}
      style={style}
      contentFit="contain"
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}
