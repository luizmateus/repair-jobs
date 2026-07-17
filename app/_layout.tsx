import { Stack } from 'expo-router';

import { LoadingScreen } from '@/src/shared/components/LoadingScreen';
import { Toast } from '@/src/shared/components/Toast';
import { useAppStartup } from '@/src/shared/hooks/useAppStartup';

function AppContent() {
  const { hydrated } = useAppStartup();

  if (!hydrated) {
    return <LoadingScreen label="Getting ready…" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="(client)" />
      <Stack.Screen name="(pro)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <>
      <AppContent />
      <Toast />
    </>
  );
}
