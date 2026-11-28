import { Redirect, Tabs, useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Sinnbild } from '@/components/sinnbild';
import { Wortmarke } from '@/components/wortmarke';
import { Abstand, Basis, Schrift } from '@/constants/theme';
import { useFarben } from '@/hooks/use-farben';
import { useStore } from '@/store/store';
import { de } from '@/i18n/de';

/** Höhe des Kopfbereichs unter der Statusleiste. Die Figur ist 48 hoch und braucht Luft nach oben und unten. */
const KOPF_HOEHE = 68;

function MenueKnopf() {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push('/einstellungen')}
      accessibilityRole="button"
      accessibilityLabel={de.menue.oeffnen}
      hitSlop={12}
      style={styles.menue}>
      <Sinnbild name="line.3.horizontal" ersatz="☰" farbe={Basis.text} groesse={26} />
    </Pressable>
  );
}

export default function TabLayout() {
  const farben = useFarben();
  const { zustand, geladen } = useStore();
  const rand = useSafeAreaInsets();
  if (!geladen) {
    return null;
  }
  if (!zustand.gesehen.start) {
    return <Redirect href="/start" />;
  }
  return (
    <Tabs
      screenOptions={{
        headerTitle: () => <Wortmarke />,
        headerTitleAlign: 'left',
        headerRight: () => <MenueKnopf />,
        // Die feine Linie trennt den Kopf vom Inhalt, der darunter durchläuft.
        headerStyle: {
          backgroundColor: Basis.hintergrund,
          height: rand.top + KOPF_HOEHE,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: Basis.linie,
          shadowOpacity: 0,
          elevation: 0,
        },
        headerTitleContainerStyle: { marginStart: Abstand.l },
        headerRightContainerStyle: { paddingEnd: Abstand.l - Abstand.m },
        sceneStyle: { backgroundColor: Basis.hintergrund },
        tabBarActiveTintColor: farben.primaer,
        tabBarInactiveTintColor: Basis.textGedaempft,
        tabBarStyle: { backgroundColor: Basis.flaeche, borderTopColor: Basis.linie },
        tabBarLabelStyle: { fontFamily: Schrift.textMittel, fontSize: 12 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: de.tabs.heute,
          tabBarIcon: ({ color }) => <Sinnbild name="sun.max.fill" ersatz="☀" farbe={color} />,
        }}
      />
      <Tabs.Screen
        name="woche"
        options={{
          title: de.tabs.woche,
          tabBarIcon: ({ color }) => <Sinnbild name="calendar" ersatz="▦" farbe={color} />,
        }}
      />
      <Tabs.Screen
        name="rezepte"
        options={{
          title: de.tabs.rezepte,
          tabBarIcon: ({ color }) => <Sinnbild name="book.fill" ersatz="▤" farbe={color} />,
        }}
      />
      <Tabs.Screen
        name="einkauf"
        options={{
          title: de.tabs.einkauf,
          tabBarIcon: ({ color }) => <Sinnbild name="cart.fill" ersatz="▣" farbe={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  menue: {
    marginRight: Abstand.m,
    padding: Abstand.xs,
  },
});
