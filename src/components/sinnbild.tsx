import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Text, type ColorValue } from 'react-native';

type Props = {
  name: Extract<SymbolViewProps['name'], string>;
  /** Ersatzzeichen für Plattformen ohne SF Symbols (Web-Vorschau). */
  ersatz: string;
  farbe: ColorValue;
  groesse?: number;
};

export function Sinnbild({ name, ersatz, farbe, groesse = 24 }: Props) {
  return (
    <SymbolView
      name={name}
      size={groesse}
      tintColor={farbe}
      fallback={
        <Text style={{ fontSize: groesse - 4, color: farbe, lineHeight: groesse }}>{ersatz}</Text>
      }
    />
  );
}
