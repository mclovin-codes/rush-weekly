import { RequireAuth } from '@/components/RequireAuth';
import { Stack } from 'expo-router';

import 'react-native-reanimated';


export default function AppLayout() {
  return (
    <RequireAuth>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="game/[id]"
          options={{
            headerShown: true,
            title: 'Game Details',
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="terms-of-service"
          options={{
            headerShown: true,
            title: 'Terms of Service',
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="privacy-policy"
          options={{
            headerShown: true,
            title: 'Privacy Policy',
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="help-support"
          options={{
            headerShown: true,
            title: 'Help & Support',
            headerBackTitle: 'Back'
          }}
        />
      </Stack>
    </RequireAuth>
  );
}