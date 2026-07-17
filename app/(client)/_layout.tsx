import { Redirect, Stack } from 'expo-router';

import { useAuthStore } from '@/src/features/auth/store/useAuthStore';

export default function ClientLayout() {
  const session = useAuthStore((state) => state.session);

  if (!session) {
    return <Redirect href="/login" />;
  }
  if (session.role !== 'client') {
    return <Redirect href="/(pro)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
