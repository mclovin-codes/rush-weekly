import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  BebasNeue_400Regular,
} from '@expo-google-fonts/bebas-neue';
// import {
//   BarlowCondensed_400Regular,
//   BarlowCondensed_600SemiBold,
// } from '@expo-google-fonts/barlow-condensed';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {

  let fontsLoaded = false;
  let fontError = null;

  try {
    const [loaded, error] = useFonts({
      'Inter': Inter_400Regular,
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
    <ThemeProvider value={DarkTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
