import { RequireAuth } from '@/components/RequireAuth';
import { Stack } from 'expo-router';

import 'react-native-reanimated';


export default function AppLayout() {
  return (
    <RequireAuth>
         <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
    </RequireAuth>
   
  );
}