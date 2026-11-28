import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces/600SemiBold';
import { Fredoka_500Medium } from '@expo-google-fonts/fredoka/500Medium';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { Basis, Schrift } from '@/constants/theme';
import { de } from '@/i18n/de';
import { ZustandsAnbieter } from '@/store/store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [geladen, fehler] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    Fraunces_600SemiBold,
    Fredoka_500Medium,
  });

  useEffect(() => {
    if (geladen || fehler) {
      SplashScreen.hideAsync();
    }
  }, [geladen, fehler]);

  if (!geladen && !fehler) {
    return null;
  }

  return (
    <ZustandsAnbieter>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: Basis.hintergrund },
          headerStyle: { backgroundColor: Basis.hintergrund },
          headerShadowVisible: false,
          headerTintColor: Basis.text,
          headerTitleStyle: { fontFamily: Schrift.textFett },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: '' }} />
        <Stack.Screen name="rezept/[id]" options={{ title: '', headerBackButtonDisplayMode: 'minimal' }} />
        <Stack.Screen
          name="einstellungen"
          options={{ title: de.einstellungen.titel, presentation: 'modal' }}
        />
      </Stack>
    </ZustandsAnbieter>
  );
}
