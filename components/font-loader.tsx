import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  BebasNeue_400Regular,
} from '@expo-google-fonts/bebas-neue';
import {
  BarlowCondensed_600SemiBold,
  BarlowCondensed_700Bold,
} from '@expo-google-fonts/barlow-condensed';

interface FontLoaderProps {
  children: React.ReactNode;
}

export default function FontLoader({ children }: FontLoaderProps) {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    BebasNeue_400Regular,
    BarlowCondensed_600SemiBold,
    BarlowCondensed_700Bold,
  });

  useEffect(() => {
    console.log('Font Loader - fontsLoaded:', fontsLoaded);
    console.log('Font Loader - fontError:', fontError);

    if (fontError) {
      console.error('Font loading error:', fontError);
    }

    if (fontsLoaded) {
      console.log('✅ Custom fonts loaded successfully');
      console.log('Available fonts:', {
        'Inter_400Regular': true,
        'Inter_500Medium': true,
        'Inter_700Bold': true,
        'BebasNeue_400Regular': true,
        'BarlowCondensed_600SemiBold': true,
        'BarlowCondensed_700Bold': true,
      });
    }
  }, [fontsLoaded, fontError]);

  // Always render children immediately - fonts will load in background
  return (
    <View style={styles.container}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});