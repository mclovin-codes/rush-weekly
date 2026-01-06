import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useFonts } from 'expo-font';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import {
  BebasNeue_400Regular,
} from '@expo-google-fonts/bebas-neue';
import {
  BarlowCondensed_400Regular,
  BarlowCondensed_600SemiBold,
} from '@expo-google-fonts/barlow-condensed';
import { QueryProvider } from '@/providers/QueryProvider';
import { BetSlipProvider } from '@/providers/BetSlipProvider';


export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {

  let fontsLoaded = false;
  let fontError = null;

  try {
    const [loaded, error] = useFonts({
  Inter_400: Inter_400Regular,
  Inter_500: Inter_500Medium,
  Inter_700: Inter_700Bold,
  BebasNeue: BebasNeue_400Regular,
  BarlowCondensed_400: BarlowCondensed_400Regular,
  BarlowCondensed_600: BarlowCondensed_600SemiBold,
});
    fontsLoaded = loaded;
    fontError = error;
  } catch (err) {
    console.warn('Font loading failed, using system fonts:', err);
    fontError = err;
  }

  if (fontError) {
    console.error('❌ Font loading error:', fontError);
  }

  if (fontsLoaded) {
    console.log('🎉 All fonts loaded successfully!');
    console.log('Available fonts:', ['BebasNeue', 'Inter', 'Inter-Medium', 'Inter-Bold', 'BarlowCondensed']);
  }

  // Force dark theme as specified in README
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <QueryProvider>
          <BetSlipProvider>
            <ThemeProvider value={DarkTheme}>
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal'}}  />
                <Stack.Screen name="(app)" options={{ headerShown: false }} />
              </Stack>
              <StatusBar style="light" />
            </ThemeProvider>
          </BetSlipProvider>
        </QueryProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
