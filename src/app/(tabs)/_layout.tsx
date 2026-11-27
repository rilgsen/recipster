import { Tabs, useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { Sinnbild } from '@/components/sinnbild';
import { Wortmarke } from '@/components/wortmarke';
import { Abstand, Basis, Schrift, STANDARD_KOCHWELT } from '@/constants/theme';
import { de } from '@/i18n/de';

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
  return (
    <Tabs
      screenOptions={{
        headerTitle: () => <Wortmarke />,
        headerTitleAlign: 'left',
        headerRight: () => <MenueKnopf />,
        headerStyle: { backgroundColor: Basis.hintergrund },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: Basis.hintergrund },
        tabBarActiveTintColor: STANDARD_KOCHWELT.primaer,
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
